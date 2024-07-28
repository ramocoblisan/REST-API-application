import app from './app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const dbConnection = process.env.DATABASE_CONNECT;

if (!dbConnection) {
  console.error('DATABASE_CONNECT is not defined in the environment variables');
  process.exit(1);
}

mongoose.connect(dbConnection)
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
