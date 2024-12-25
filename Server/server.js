const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');

// Создаем приложение Express
const app = express();
const server = http.createServer(app);

// Настройка CORS для всех источников
app.use(cors());

// Получаем адрес и порт из переменных окружения
const PORT = process.env.PORT || 8080;

// Создаем сервер WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (socket) => {
    console.log('Клиент подключен');

    // Обработка сообщений от клиента
    socket.on('message', (message) => {
        console.log(`Получено сообщение: ${message}`);

        // Отправка ответа обратно клиенту
        socket.send(`Вы сказали: ${message}`);
    });

    // Обработка отключения клиента
    socket.on('close', () => {
        console.log('Клиент отключен');
    });
});

// Запускаем сервер
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});