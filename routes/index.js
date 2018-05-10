const express = require('express');
const fs = require('fs');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.redirect('manual');
});

router.get('/challange', (req, res) => {
  const tempFile = './employment_challenge.pdf';
  fs.readFile(tempFile, (err, data) => {
    if (err) return res.sendStatus(404);
    res.contentType('application/pdf');
    return res.send(data);
  });
});

module.exports = router;
