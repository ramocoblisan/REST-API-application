import express from 'express';
import User from '../../validate/userValidation.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {validateUser} from '../../validate/userJoi.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

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
    const newUser = new User({ email, password, subscription });
    await newUser.setPassword(password);
    await newUser.save();

    res.status(201).json({
      status: "success",
      code: 201,
      user: {
          email: newUser.email,
          subscription: newUser.subscription
      },
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

export default router;