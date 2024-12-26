const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');

const { loadPlayerData, savePlayerData, playerData} = require('./utils/storage');
const { handleClientMessage, broadcast} = require('./routes/player');
const { PORT } = require('./config');
const {clients} = require("./utils/chunk");

// Создаем приложение Express
const app = express();
const server = http.createServer(app);

// Настройка CORS
app.use(cors());

// Создаем сервер WebSocket
const wss = new WebSocket.Server({ server });

// Обработка подключения клиентов
wss.on('connection', (socket) => {
    console.log('Клиент подключен');

    socket.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleClientMessage(data, socket);
        } catch (error) {
            console.error('Ошибка при обработке сообщения:', error);
        }
    });

    socket.on('close', () => {
        const clientId = clients.get(socket);
        console.log(`Клиент с ID ${clientId} отключен`);

        if (clientId) {
            const playerInfo = playerData.get(clientId);
            if (playerInfo) {
                console.log(`Данные игрока ${clientId}:`, playerInfo);
                playerData.delete(clientId);
                savePlayerData(); // Сохраняем данные отключенных игроков
            }
        }
        broadcast(JSON.stringify({ type: 'player_disconnected', player_id: clientId }));
        clients.delete(socket);
    });
});

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
