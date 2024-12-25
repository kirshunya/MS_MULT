const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:8080');

socket.on('open', () => {
    console.log('Подключено к серверу');
    socket.send('Привет, сервер!');
});

socket.on('message', (message) => {
    console.log(`Сообщение от сервера: ${message}`);
});

socket.on('close', () => {
    console.log('Соединение закрыто');
});