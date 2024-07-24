import express from 'express';
import { listContacts, getContactById, removeContact, addContact, updateContact } from '../../models/contacts.js';
const router = express.Router()
import {validateContact, validateContactUpdate} from '../validateSchema.js';

router.get('/', async (req, res, next) => {
  try{
    const contacts = await listContacts();
    res.status(200).json(contacts);
  }catch(err){
    next(err);
  }
})

router.get('/:contactId', async (req, res, next) => {
  try{
    const contact = await getContactById(req.params.contactId);
    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({message: 'Not found'})
    }
  }catch(err){
    next(err);
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { error } = validateContact(req.body);
    if ( error ) {
      res.status(400).json({ message: error.details[0].message });
    }
    const newContact = await addContact(req.body);
    if (newContact) {
      res.status(201).json({ message: 'Contact created!', newContact });
    }
  } catch(err){
    next(err);
  }
})

router.delete('/:contactId', async (req, res, next) => {
  const {contactId} = req.params;
  try{
    const removedContact = await removeContact(contactId);
    if (removeContact) {
      res.status(200).json({message: "contact deleted", removedContact});
    } else {
      res.status(404).json({message: 'Not found'})
    }
  }catch(err){
    res.status(500).json({err: "Internal Server Error"})
    next(err);
  }
})

router.put('/:contactId', async (req, res, next) => {
  const {contactId} = req.params;
  try {
    const { error } = validateContactUpdate(req.body);
    if ( error ) {
      res.status(404).json({ message: error.details[0].message });
    }
    const contact = await updateContact(contactId, req.body);
    if (contact) {
      res.status(201).json({ message: 'Contact created!', contact });
    }
  } catch(err){
    next(err);
  }
})

export default router;
