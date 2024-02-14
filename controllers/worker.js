const { fileQueue } = require('../utils/queues');
const dbClient = require('../utils/db');
const thumbnail = require('image-thumbnail');
const fs = require('fs').promises;

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files').findOne({ _id: fileId, userId });

  if (!file) {
    throw new Error('File not found');
  }

  const originalFilePath = file.localPath;
  const thumbnail500 = await thumbnail(originalFilePath, { width: 500 });
  const thumbnail250 = await thumbnail(originalFilePath, { width: 250 });
  const thumbnail100 = await thumbnail(originalFilePath, { width: 100 });

  await fs.writeFile(`${originalFilePath}_500`, thumbnail500);
  await fs.writeFile(`${originalFilePath}_250`, thumbnail250);
  await fs.writeFile(`${originalFilePath}_100`, thumbnail100);
});
