import express from 'express';
import User from '../../validate/userValidation.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {validateUser} from '../../validate/userJoi.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import gravatar from 'gravatar';
import jimp from 'jimp';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { upload } from '../../helpers/multerConfig.js';
import path from 'path';
import nodemailer from 'nodemailer';
import nodemailerConfig from '../../config/nodemailer.js';
import { nanoid } from 'nanoid'


dotenv.config();
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, subscription } = req.body;
  const { error } = validateUser({ email, password, subscription });
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const user = await User.findOne({ email });

  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Email already in use",
      data: "Conflict",
    });
  }
  try {
    const avatarURL = gravatar.url(email, { s: '250', r: 'pg', d: 'mm' }, true);
    console.log(avatarURL);
    const verificationToken = nanoid();
    console.log('Generated verificationToken:', verificationToken);

    const newUser = new User({ email, password, subscription, avatarURL, verificationToken });
    const verificationLink =`http://localhost:3000/api/users/verify/${verificationToken}`;

    const transporter = nodemailer.createTransport(nodemailerConfig);
    const emailOptions = {
      from: "ramonacoblisan@outlook.com",
      to: email,
      subject: "Verification needed",
      html: `<html><strong>Please verify your email address by clicking on the following link: <a href="${verificationLink}">Verify Email</a></strong></html>`,
    };

    const mailResponse = await transporter.sendMail(emailOptions);
    console.log(mailResponse);

    await newUser.setPassword(password);
    await newUser.save();

    res.status(201).json({
      status: "success",
      code: 201,
      user: {
          email: newUser.email,
          subscription: newUser.subscription,
          avatarURL: newUser.avatarURL,
          verificationToken: newUser.verificationToken
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
  console.log("Login with email:", email);

  const user = await User.findOne({ email });

  if (!user || !(await user.isValidPassword(password))) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Email or password is wrong",
      data: {
        message: "Email or password is wrong",
      },
    });
  }

  const payload = {
    id: user.id,
    username: user.username,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1w" });
  user.token = token;
        await user.save();
        res.json({
            token,
            user: {
                email: user.email,
                subscription: user.subscription
            }
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/logout', authMiddleware, async(req, res) => {
  try {
      const user = req.user;
      user.token = null;
      await user.save();
      res.status(204).json({message: 'No Content'}).end();
  } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/current', authMiddleware, async (req, res) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
});

const avatarDir = path.join(process.cwd(), 'public', 'avatars');

router.patch('/avatars', authMiddleware, upload.single('avatar'), async (req, res, next) => {
    const { _id } = req.user;
    const file = req.file;
    const { path: temporaryName, originalname } = file;
    try {
        if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
        };

        const img = await jimp.read(temporaryName);
        await img.resize(250, 250).quality(60).writeAsync(temporaryName);

        const uniqueName = uuidv4() + path.extname(originalname);
        const storeFile = path.join(avatarDir, uniqueName);
        await fs.rename(temporaryName, storeFile);

        const avatarURL = `/avatars/${uniqueName}`;
        await User.findByIdAndUpdate(_id, { avatarURL });
        res.status(200).json({
            message: 'File uploaded successfully',
            avatarURL,
        });
    } catch (err) {
        try {
            await fs.unlink(temporaryName);
        } catch (unlinkErr) {
            console.error('Error while deleting the temporary file:', unlinkErr);
        }
        return next(err);
    }
  });

  router.get("/verify/:verificationToken", async (req, res, next) => {
    const { verificationToken } = req.params;
    console.log('Received verification token:', verificationToken);

    try {
        const user = await User.findOne({ verificationToken });
        if (!user) {
            console.error('User not found with token:', verificationToken);
            return res.status(404).json({ message: 'User not found' });
        } else {
            user.verify = true;
            user.verificationToken = null;
            await user.save();
            console.log('User verified successfully:', user.email);
            const email = user.email;
            res.status(200).json({ message: 'Verification successful', email});
        }
    } catch (err) {
        console.error('Error during verification:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/verify', async (req, res) => {
  const { email } = req.body;

  if (!email) {
      return res.status(400).json({ message: 'missing required field email' });
  }

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      if (user.verify) {
          return res.status(400).json({ message: 'Verification has already been passed' });
      }

      const verificationLink = `http://localhost:3000/api/users/verify/${user.verificationToken}`;

      const transporter = nodemailer.createTransport(nodemailerConfig);
      const emailOptions = {
        from: "ramonacoblisan@outlook.com",
        to: email,
        subject: "Verification needed",
        html: `<html><strong>Please verify your email address by clicking on the following link: <a href="${verificationLink}">Verify Email</a></strong></html>`,
      };
  
      const mailResponse = await transporter.sendMail(emailOptions);
      console.log(mailResponse);

      res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
      console.error('Error during resending verification email:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});


export default router;