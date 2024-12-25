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

// Хранение всех подключенных клиентов и их идентификаторов
const clients = new Map();
let nextClientId = 1; // Уникальный идентификатор клиента

wss.on('connection', (socket) => {
    const clientId = nextClientId++;
    clients.set(socket, clientId);
    console.log(`Клиент с ID ${clientId} подключен`);

    // Уведомление всем клиентам о новом подключении
    broadcast(JSON.stringify({ type: 'connect', clientId: clientId }));

    // Обработка сообщений от клиента
    socket.on('message', (message) => {
        console.log(`Получено сообщение от клиента ${clientId}: ${message}`);

        try {
            const data = JSON.parse(message);
            handleClientMessage(data, clientId);
        } catch (error) {
            console.error('Ошибка при обработке сообщения:', error);
        }
    });

    // Обработка отключения клиента
    socket.on('close', () => {
        console.log(`Клиент с ID ${clientId} отключен`);
        clients.delete(socket);
        broadcast(JSON.stringify({ type: 'disconnect', clientId: clientId }));
    });
});

// Функция обработки сообщений от клиента
function handleClientMessage(data, clientId) {
    switch (data.type) {
        case 'get_chunk':
            handleGetChunk(data.position, clientId);
            break;
        case 'move':
            handleMove(data.position, clientId);
            break;
        // Добавьте дополнительные типы сообщений по мере необходимости
        default:
            console.log('Неизвестный тип сообщения:', data.type);
    }
}

// Функция обработки get_chunk
function handleGetChunk(position, clientId) {
    console.log(`Клиент ${clientId} запрашивает get_chunk с позицией:`, position);
    // Здесь вы можете добавить логику для обработки запроса get_chunk
}

// Функция обработки перемещения
function handleMove(position, clientId) {
    console.log(`Клиент ${clientId} перемещается на позицию:`, position);
    // Здесь вы можете добавить логику для обработки перемещения
}

// Функция для отправки сообщений всем клиентам
function broadcast(data) {
    clients.forEach((clientId, client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Запускаем сервер
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});