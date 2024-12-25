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

// Класс для хранения данных игрока
class PlayerData {
    constructor(login, password) {
        this.login = login; // Логин игрока
        this.password = password; // Пароль игрока
        this.position = { x: 0, y: 0, z: 0 }; // Начальная позиция
        this.rotation = { x: 0, y: 0, z: 0 }; // Начальный поворот
    }
}

// Хранение всех подключенных клиентов и их данных
const clients = new Map(); // Хранит сокеты и данные о клиентах
const playerData = new Map(); // Хранит данные о игроках по логину

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
        let clientId;
        clientId = clients.get(socket);
        console.log(`Клиент с ID ${clientId} отключен`);

        if (clientId) {
            // Сохраняем данные клиента перед отключением
            const playerInfo = playerData.get(clientId);
            if (playerInfo) {
                // Здесь можно сохранить данные игрока, например, в БД
                console.log(`Данные игрока ${clientId}:`, playerInfo);
            }
        }
        broadcast(JSON.stringify({ type: 'player_disconnected', player_id: clientId}));
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
            handlePlayers(data, socket);
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
        console.log(`Клиент с логином ${login} повторно подключен.`);
    } else {
        console.log(`Новый клиент с логином ${login} подключен.`);
        // Создаем новую структуру PlayerData
        playerData.set(login, new PlayerData(login, password));
    }

    // Сохраняем сокет и данные о клиенте
    clients.set(socket, login);

    // Получаем данные игрока
    const playerInfo = playerData.get(login);

    // Уведомление всем клиентам о новом подключении
    broadcast(JSON.stringify({ type: 'player_connected', player_id: login, position: playerInfo.position }));

    // Ответ клиенту о успешном подключении с его текущей позицией
    socket.send(JSON.stringify({
        type: 'connected',
        message: 'Соединение успешно установлено',
    }));
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
}

// Функция для отправки сообщений всем клиентам
function broadcast(data) {
    clients.forEach((login, client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

function handlePlayers(position, socket) {
    console.log('Подключенные игроки:');
    playerData.forEach((data, login) => {
        console.log(`Player ID: ${login}, Position: ${JSON.stringify(data.position)}`);
    });
    const playersArray = Array.from(playerData.values()).map(data => ({
        player_id: data.login,
        password: data.password,
        rotation: data.rotation,
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