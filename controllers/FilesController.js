const fs = require('fs');
const path = require('path');
const uuid = require('uuid').v4;
const dbClient = require('../utils/db');

class FilesController {
  static async postUpload(req, res) {
    try {
      const {
        name, type, parentId = '0', isPublic = false, data,
      } = req.body;

      // Check if name is missing
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      // Check if type is missing or not valid
      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing or invalid type' });
      }

      // Check if data is missing for non-folder types
      if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
      }

      // Retrieve the user based on the token
      const userId = req.user.id; // Assuming user ID is available in req.user

      // If parentId is set, validate it
      if (parentId !== '0') {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: parentId });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      let localPath = '';
      // Create a local folder to store files
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Store file data locally if type is file or image
      if (type === 'file' || type === 'image') {
        const fileExtension = type === 'file' ? '.file' : '.image';
        localPath = path.join(folderPath, `${uuid()}${fileExtension}`);
        const fileData = Buffer.from(data, 'base64');
        fs.writeFileSync(localPath, fileData);
      }

      // Create a new file document
      const newFile = {
        userId,
        name,
        type,
        parentId,
        isPublic,
        localPath: localPath || null,
      };

      // Save the file to the database
      const result = await dbClient.db.collection('files').insertOne(newFile);

      // Return the new file with a status code 201
      return res.status(201).json({ id: result.insertedId, name: newFile.name });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
