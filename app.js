import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import passport from 'passport';
import passportConfig from "./config/passport.js";

passportConfig(passport);

import contactsRouter from './routes/api/contacts.js';
import usersRouter from './routes/api/users.js';

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/contacts', contactsRouter);
app.use('/api/users', usersRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

export default app;
