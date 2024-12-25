const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (socket) => {
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

console.log('Сервер запущен на порту 8080');