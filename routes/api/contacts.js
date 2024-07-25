import express from 'express';
import { validateContact, validateContactUpdate } from '../../validate/JoiValidation.js';
import Contact from '../../validate/DbValidation.js';
import { updateStatusContact } from './services/contactService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    console.log('Contacts fetched:', contacts);
    res.status(200).json(contacts);
  } catch(err) {
    next(err);
  }
});

router.get('/:contactId', async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.contactId);
    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch(err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { error } = validateContact(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }
    const newContact = new Contact(req.body);
    const savedContact = await newContact.save();
    if (savedContact) {
      console.log('Contact saved:', savedContact);
      res.status(201).json({ message: 'Contact created!', savedContact });
    }
  } catch(err) {
    next(err);
  }
});

router.delete('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const removedContact = await Contact.findByIdAndDelete(contactId);
    if (removedContact) {
      res.status(200).json({ message: 'Contact deleted', removedContact });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch(err) {
    res.status(500).json({ err: 'Internal Server Error' });
    next(err);
  }
});

router.put('/:contactId', async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const { error } = validateContactUpdate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }
    const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, { new: true });
    if (updatedContact) {
      res.status(200).json({ message: 'Contact updated!', updatedContact });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch(err) {
    next(err);
  }
});

router.patch('/:contactId/favorite', async (req, res, next) => {
  const { contactId } = req.params;
  const { favorite } = req.body;
  if (favorite === undefined) {
    return res.status(400).json({ message: 'Missing field favorite' });
  }
  try {
    const favoriteContact = await updateStatusContact(contactId, { favorite });
    res.status(200).send(favoriteContact);
  } catch(err) {
    if (err.message === 'Contact not found') {
      return res.status(404).json({ message: 'Not found' });
    } else {
      next(err);
    }
  }
});

export default router;
