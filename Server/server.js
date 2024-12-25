const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const PlayerData = require('./PlayerData/playerData'); // Импортируем класс PlayerData

// Создаем приложение Express
const app = express();
const server = http.createServer(app);

// Настройка CORS для всех источников
app.use(cors());

// Класс для хранения данных игрока
class PlayerData {
    constructor(login, password, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }) {
        this.login = login; // Логин игрока
        this.password = password; // Пароль игрока
        this.position = position; // Позиция игрока
        this.rotation = rotation; // Поворот игрока
    }
}

// Получаем адрес и порт из переменных окружения
const PORT = process.env.PORT || 8080;

// Создаем сервер WebSocket
const wss = new WebSocket.Server({ server });

// Хранение всех подключенных клиентов и их данных
const clients = new Map(); // Хранит сокеты и данные о клиентах
const playerData = new Map(); // Хранит данные о игроках по логину
const jsonFilePath = path.join(__dirname, 'players.json');

// Загрузка данных игроков из JSON файла
function loadPlayerData() {
    if (fs.existsSync(jsonFilePath)) {
        const data = fs.readFileSync(jsonFilePath);
        const players = JSON.parse(data);
        players.forEach(player => {
            playerData.set(player.login, new PlayerData(player.login, player.password, player.position, player.rotation));
        });
    }
}

// Сохранение данных отключенных игроков в JSON файл
function savePlayerData() {
    const playersArray = Array.from(playerData.values()).map(data => ({
        login: data.login,
        password: data.password,
        position: data.position,
        rotation: data.rotation
    }));
    fs.writeFileSync(jsonFilePath, JSON.stringify(playersArray, null, 2));
}

// Загружаем данные игроков при запуске сервера
loadPlayerData();

wss.on('connection', (socket) => {
    console.log('Клиент подключен');

    // Обработка сообщений от клиента
    socket.on('message', (message) => {
        console.log(`Получено сообщение от клиента: ${message}`);

        try {
            const data = JSON.parse(message);
            handleClientMessage(data, socket);
        } catch (error) {
            console.error('Ошибка при обработке сообщения:', error);
        }
    });

    // Обработка отключения клиента
    socket.on('close', () => {
        const clientId = clients.get(socket);
        console.log(`Клиент с ID ${clientId} отключен`);

        if (clientId) {
            // Сохраняем данные клиента перед отключением
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

// Функция обработки сообщений от клиента
function handleClientMessage(data, socket) {
    switch (data.type) {
        case 'connect':
            handleConnect(data, socket);
            break;
        case 'get_chunk':
            handleGetChunk(data.position, socket);
            break;
        case 'move':
            handleMove(data.position, socket);
            break;
        case 'get_players':
            handlePlayers(socket);
            break;
        default:
            console.log('Неизвестный тип сообщения:', data.type);
    }
}

// Функция обработки подключения клиента
function handleConnect(data, socket) {
    const { login, password } = data;

    // Проверка, есть ли уже данные у этого клиента
    if (playerData.has(login)) {
        const playerInfo = playerData.get(login);
        console.log(`Клиент с логином ${login} повторно подключен.`);
        // Присваиваем данные из JSON
        socket.send(JSON.stringify({
            type: 'connected',
            message: 'Вы подключены с данными из JSON',
            position: playerInfo.position
        }));
    } else {
        console.log(`Новый клиент с логином ${login} подключен.`);
        // Создаем новую структуру PlayerData
        playerData.set(login, new PlayerData(login, password));
        socket.send(JSON.stringify({
            type: 'connected',
            message: 'Соединение успешно установлено',
        }));
    }

    // Сохраняем сокет и данные о клиенте
    clients.set(socket, login);

    // Уведомление всем клиентам о новом подключении
    broadcast(JSON.stringify({ type: 'player_connected', player_id: login, position: playerData.get(login).position }));
}

// Функция обработки get_chunk
function handleGetChunk(position, socket) {
    console.log(`Клиент запрашивает get_chunk с позицией:`, position);
    // Здесь вы можете добавить логику для обработки запроса get_chunk
}

// Функция обработки перемещения
function handleMove(position, socket) {
    const clientId = clients.get(socket);
    console.log(`Клиент ${clientId} перемещается на позицию:`, position);

    // Обновляем позицию игрока
    if (clientId && playerData.has(clientId)) {
        const playerInfo = playerData.get(clientId);
        playerInfo.position = position; // Обновляем позицию
    }
    broadcast(JSON.stringify({ type: 'player_moved', player_id: clientId, position: position }));
}

// Функция для отправки сообщений всем клиентам
function broadcast(data) {
    clients.forEach((login, client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// Функция для вывода информации о подключенных игроках
function handlePlayers(socket) {
    console.log('Подключенные игроки:');
    const playersArray = Array.from(playerData.values()).map(data => ({
        player_id: data.login,
        position: data.position
    }));

    console.log(JSON.stringify(playersArray, null, 2));

    socket.send(JSON.stringify({
        type: 'players_list',
        players: playersArray
    }));
}

// Запускаем сервер
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});