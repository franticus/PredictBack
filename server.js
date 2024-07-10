const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(requestIp.mw());

const corsOptions = {
  origin: '*',
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

const DATA_FILE = path.join(__dirname, 'data.json');

const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return [];
  }
};

const writeData = data => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
};

app.options('*', cors(corsOptions));

app.get('/data', cors(corsOptions), (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/data', cors(corsOptions), async (req, res) => {
  try {
    const data = readData();
    const ip = req.clientIp;

    let country = 'Unknown';

    // Получение публичного IP-адреса
    const response = await axios.get('https://api.ipify.org?format=json');
    const publicIp = response.data.ip;
    console.log('publicIp:', publicIp);

    if (publicIp) {
      const geo = geoip.lookup(publicIp);
      if (geo) {
        country = geo.country;
        console.log('country:', country);
      }
    }

    const newEntry = {
      name: req.body.name,
      phone: req.body.phone,
      timestamp: new Date().toISOString(),
      choice: req.body.choice,
      score1: req.body.score1,
      score2: req.body.score2,
      team1Code: req.body.team1Code,
      team2Code: req.body.team2Code,
      country: country,
    };

    data.push(newEntry);
    writeData(data);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = 4242;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
