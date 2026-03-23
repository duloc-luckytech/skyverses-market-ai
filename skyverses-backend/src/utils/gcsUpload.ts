// gcsUpload.ts
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage();
const bucketName = 'your-bucket-name';

export const uploadToGCS = async (filePath: string): Promise<string> => {
  const destination = `uploads/${uuidv4()}-${path.basename(filePath)}`;
  await storage.bucket(bucketName).upload(filePath, { destination });
  return `gs://${bucketName}/${destination}`;
};