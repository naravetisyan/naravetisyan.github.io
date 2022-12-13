import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const { createWorker } = require('tesseract.js');
const fileupload = require("express-fileupload");
const app = express();

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());

app.post('/recognize-image', async (req, res) => {
  const worker = await createWorker();
  const { file } = req.files;
  const base64 = Buffer.from(file.data).toString('base64')
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const data = await worker.recognize(`data:image/jpeg;base64, ${base64}`);
  await worker.terminate();
  res.json(data);
});

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`),
);
