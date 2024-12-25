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

// Хранение всех подключенных сокетов
const clients = new Set();

wss.on('connection', (socket) => {
    console.log('Клиент подключен');
    clients.add(socket);

    // Уведомление всем клиентам о новом подключении
    broadcast(JSON.stringify({ type: 'connect', message: 'Новый клиент подключился' }));

    // Обработка сообщений от клиента
    socket.on('message', (message) => {
        console.log(`Получено сообщение: ${message}`);

        try {
            const data = JSON.parse(message);
            handleClientMessage(data, socket);
        } catch (error) {
            console.error('Ошибка при обработке сообщения:', error);
        }
    });

    // Обработка отключения клиента
    socket.on('close', () => {
        console.log('Клиент отключен');
        clients.delete(socket);
        broadcast(JSON.stringify({ type: 'disconnect', message: 'Клиент отключился' }));
    });
});

// Функция обработки сообщений от клиента
function handleClientMessage(data, socket) {
    switch (data.type) {
        case 'get_chunk':
            handleGetChunk(data.position);
            break;
        case 'move':
            handleMove(data.position);
            break;
        // Добавьте дополнительные типы сообщений по мере необходимости
        default:
            console.log('Неизвестный тип сообщения:', data.type);
    }
}

// Функция обработки get_chunk
function handleGetChunk(position) {
    console.log(`Получен запрос get_chunk с позицией:`, position);
    // Здесь вы можете добавить логику для обработки запроса get_chunk
}

// Функция обработки перемещения
function handleMove(position) {
    console.log(`Получено сообщение о перемещении с позицией:`, position);
    // Здесь вы можете добавить логику для обработки перемещения
}

// Функция для отправки сообщений всем клиентам
function broadcast(data) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Запускаем сервер
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});