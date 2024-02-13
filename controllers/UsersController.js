#!/usr/bin/node

const dbClient = require('../utils/db');
const sha1 = require('sha1');

class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      const existingUser = await dbClient.db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exists' });
      }

      const hashedPassword = sha1(password);

      const newUser = {
        email,
        password: hashedPassword,
      };

      const result = await dbClient.db.collection('users').insertOne(newUser);

      res.status(201).json({ id: result.insertedId, email: newUser.email });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UsersController;
