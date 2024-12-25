const WebSocket = require('ws');

const socket = new WebSocket('https://ms-mult.onrender.com');

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