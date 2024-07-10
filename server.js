const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4242;

app.use(bodyParser.json());

// Настройка CORS
const corsOptions = {
  origin: '*', // Или укажите конкретные разрешенные домены, например: ['http://example.com', 'http://anotherdomain.com']
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Путь к файлу JSON
const DATA_FILE = path.join(__dirname, 'data.json');

// Функция для чтения данных из файла JSON
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

// Функция для записи данных в файл JSON
const writeData = data => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
};

// Middleware для обработки предварительных запросов (preflight requests)
app.options('*', cors(corsOptions));

// Маршрут для получения данных
app.get('/data', cors(corsOptions), (req, res) => {
  const data = readData();
  res.json(data);
});

// Маршрут для добавления данных
app.post('/data', cors(corsOptions), (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
