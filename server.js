const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 80;

app.use(bodyParser.json());

app.use(cors());

const DATA_FILE = path.join(__dirname, 'data.json');

const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
};

const writeData = data => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

app.get('/data', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/data', (req, res) => {
  const data = readData();
  const newEntry = {
    name: req.body.name,
    phone: req.body.phone,
    timestamp: new Date().toISOString(),
    choice: req.body.choice,
    score1: req.body.score1,
    score2: req.body.score2,
    team1Code: req.body.team1Code,
    team2Code: req.body.team2Code,
    country: req.body.country,
  };
  data.push(newEntry);
  writeData(data);
  res.status(201).json(newEntry);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
