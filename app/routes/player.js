const { playerData } = require('../utils/storage');
const { clients, chunkMap, createChunk, getChunkIndex, getRandomSurfacePosition} = require('../utils/chunk');
const {PlayerData} = require("../models/player");

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
        case 'place_block':
            handlePlaceBlock(data.position, data.block_type, socket);
            break;
        case 'destroy_block':
            handleDestroyBlock(data.position, socket);
            break;
        default:
            console.log('Неизвестный тип сообщения:', data.type);
    }
}

function handleConnect(data, socket) {
    const { login, password } = data;

    if (playerData.has(login)) {
        const playerInfo = playerData.get(login);
        console.log(`Клиент с логином ${login} повторно подключен.`);
        socket.send(JSON.stringify({
            type: 'connected',
            message: 'Вы подключены с данными из JSON',
            position: playerInfo.position
        }));
    } else {
        console.log(`Новый клиент с логином ${login} подключен.`);
        const startPosition = getRandomSurfacePosition();
        playerData.set(login, new PlayerData(login, password, startPosition));

        socket.send(JSON.stringify({
            type: 'connected',
            message: 'Соединение успешно установлено',
            position: startPosition,
            rotation: { x: 0, y: 0, z: 0 } // Можно установить начальный поворот по умолчанию
        }));
    }

    clients.set(socket, login);
    broadcast(JSON.stringify({ type: 'player_connected', player_id: login, position: playerData.get(login).position }));
}

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


function handleGetChunk(position, socket) {
    const chunkKey = `${position.x},${position.y},${position.z}`;
    if (chunkMap.has(chunkKey)) {
        socket.send(JSON.stringify({
            type: 'chunk_data',
            position: position,
            blocks: chunkMap.get(chunkKey),
        }));
    } else {
        const newChunk = createChunk();
        chunkMap.set(chunkKey, newChunk);
        socket.send(JSON.stringify({
            type: 'chunk_data',
            position: position,
            blocks: newChunk,
        }));
    }
}

function handleMove(position, socket) {
    const clientId = clients.get(socket);
    if (clientId && playerData.has(clientId)) {
        playerData.get(clientId).position = position;
    }
    broadcast(JSON.stringify({ type: 'player_moved', player_id: clientId, position: position }));
}

function handlePlaceBlock(position, blockType, socket) {
    const chunkKey = `${position.x},${position.y},${position.z}`;
    if (chunkMap.has(chunkKey)) {
        const chunk = chunkMap.get(chunkKey);
        const index = getChunkIndex(position);
        chunk[index] = blockType;
        chunkMap.set(chunkKey, chunk);
        broadcast(JSON.stringify({ type: 'block_placed', position: position, block_type: blockType }));
    }
}

function handleDestroyBlock(position, socket) {
    const chunkKey = `${position.x},${position.y},${position.z}`;
    if (chunkMap.has(chunkKey)) {
        const chunk = chunkMap.get(chunkKey);
        const index = getChunkIndex(position);
        chunk[index] = 0;
        chunkMap.set(chunkKey, chunk);
        broadcast(JSON.stringify({ type: 'block_destroyed', position: position }));
    }
}

function broadcast(data) {
    clients.forEach((_, client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

module.exports = { handleClientMessage,
    broadcast,};
