file.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const libre = require('libreoffice-convert');
const { promisify } = require('util');
const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    if (ext !== '.pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
}).single('file');

app.post('/convert', (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const filePath = req.file.path;
    const options = {
      output: path.join(__dirname, 'downloads', `${req.file.originalname}.docx`),
      jsonFilePath: 'file1.json'
    };

    libre.convertAsync(filePath, options)
      .then(outputPath => {
        res.download(outputPath);
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      });
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
