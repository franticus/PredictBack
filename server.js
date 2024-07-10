const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 80;

// Middleware для обработки JSON
app.use(bodyParser.json());

// Разрешение CORS
app.use(cors());

// Путь к файлу JSON
const DATA_FILE = path.join(__dirname, 'data.json');

// Функция для чтения данных из файла JSON
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
};

// Функция для записи данных в файл JSON
const writeData = data => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Маршрут для получения данных
app.get('/data', (req, res) => {
  const data = readData();
  res.json(data);
});

// Маршрут для добавления данных
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

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
