import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import colors from 'colors';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathContacts = path.join(__dirname, 'contacts.json');
console.log(pathContacts);

const readContactsFile = async () => {
  try {
    const data = await fs.readFile(pathContacts, 'utf-8');
    console.log('Contacts successfully read!');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading contacts:', err.message);
    return [];
  }
};

const writeContactsFile = async (contacts) => {
  try {
    await fs.writeFile(pathContacts, JSON.stringify(contacts, null, 2));
    console.log('Contacts successfully written to file!'.green);
  } catch (err) {
    console.error('Error writing contacts to file!', err.red);
  }
};

export const listContacts = async () => {
  const contacts = await readContactsFile();
  console.log('Contacts successfully returned!'.blue);
  console.table(contacts);
  return contacts;
};

export const getContactById = async (contactId) => {
  const contacts = await readContactsFile();
  const contactById = contacts.find(contact => contact.id === contactId);
  console.log(`Contact with ID ${contactId} is displayed!`.blue);
  return contactById;
};

export const removeContact = async (contactId) => {
  const contacts = await readContactsFile();
  const index = contacts.findIndex(contact => contact.id === contactId);
  if (index > -1) {
    const removedContact = contacts.splice(index, 1);

    if (removeContact.length === contacts.length) {
      console.log('Error delete contact!').red;
      return contacts;
    }
    await writeContactsFile(contacts);
    console.log(`Contact with ID ${contactId} is removed!`.blue);
    console.table(contacts);
    return removedContact[0];
  }
  console.log('Contact not found for remove!'.red);
  return null;
};

export const addContact = async (body) => {
  console.log('Body received:', body);
  const contacts = await readContactsFile();

  const newContact = {
    id: nanoid(),
    ...body
  };
  contacts.push(newContact);
  console.log('Contacts before writing:', contacts);
  await writeContactsFile(contacts);
  console.log(`Contact with ID ${newContact.id} added successfully!`.blue);
  console.table(contacts);
  return newContact;
};

export const updateContact = async (contactId, body) => {
  const contacts = await readContactsFile();
  const index = contacts.findIndex(contact => contact.id === contactId);
  if (index > -1) {
    const updatedContact = {
      ...contacts[index],
      ...body
    };
    contacts[index] = updatedContact;
    await writeContactsFile(contacts);
    console.log(`Contact with ID ${contactId} updated!`.blue);
    return updatedContact;
  }
  console.log('Contact not found for update!'.red);
  return null;
};

