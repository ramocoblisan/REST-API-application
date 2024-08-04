import express from 'express';
import { validateContact, validateContactUpdate } from '../../validate/contactJoi.js';
import Contact from '../../validate/ContactValidation.js';
import { updateStatusContact } from './services/contactService.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res, next) => {
  const { _id: owner } = req.user;
  console.log('Fetching contacts for owner:', owner);

  try {
    const contacts = await Contact.find({ owner }).exec(); 
    console.log('Contacts fetched:', contacts);
    res.status(200).json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    next(err);
  }
});

router.get('/:contactId', authMiddleware, async (req, res, next) => {
  const { _id: owner } = req.user;
  try {
    const contact = await Contact.findOne({ _id: req.params.contactId, owner }).exec();
    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  const { _id: owner } = req.user;
  try {
    const { error } = validateContact(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newContact = new Contact({ ...req.body, owner });
    await newContact.save();
    res.status(201).json({ message: 'Contact created!', savedContact: newContact });
  } catch (err) {
    next(err);
  }
});

router.delete('/:contactId', authMiddleware, async (req, res, next) => {
  const { _id: owner } = req.user;
  try {
    const removedContact = await Contact.findOneAndDelete({ _id: req.params.contactId, owner }).exec();
    if (removedContact) {
      res.status(200).json({ message: 'Contact deleted', removedContact });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (err) {
    res.status(500).json({ err: 'Internal Server Error' });
    next(err);
  }
});

router.put('/:contactId', authMiddleware, async (req, res, next) => {
  const { _id: owner } = req.user;
  try {
    const { error } = validateContactUpdate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedContact = await Contact.findOneAndUpdate({ _id: req.params.contactId, owner }, req.body, { new: true }).exec();
    if (updatedContact) {
      res.status(200).json({ message: 'Contact updated!', updatedContact });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (err) {
    next(err);
  }
});

router.patch('/:contactId/favorite', authMiddleware, async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;
  const { _id: owner } = req.user;
  if (favorite === undefined) {
    return res.status(400).json({ message: 'Missing field favorite' });
  }
  try {
    const favoriteContact = await updateStatusContact(contactId, { favorite, owner });
    res.status(200).send(favoriteContact);
  } catch (err) {
    if (err.message === 'Contact not found') {
      return res.status(404).json({ message: 'Not found' });
    } else {
      next(err);
    }
  }
});

export default router;

