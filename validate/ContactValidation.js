import mongoose from 'mongoose';

export const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
  }
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema, 'contacts');
export default Contact;
