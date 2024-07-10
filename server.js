const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');

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

app.post('/data', cors(corsOptions), (req, res) => {
  try {
    const data = readData();
    let ip = req.clientIp;

    // Попробуйте получить реальный IP из заголовков, если сервер за прокси
    const forwardedIpsStr = req.headers['x-forwarded-for'];
    if (forwardedIpsStr) {
      const forwardedIps = forwardedIpsStr.split(',');
      ip = forwardedIps[0];
    }

    console.log('Client IP:', ip); // Добавьте лог для IP
    const geo = geoip.lookup(ip);
    console.log('Geo information:', geo); // Добавьте лог для гео-информации
    const country = geo && geo.country ? geo.country : 'Unknown';

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
