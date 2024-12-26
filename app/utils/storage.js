const fs = require('fs');
const { JSON_FILE_PATH } = require('../config');
const { PlayerData } = require('../models/player');

const playerData = new Map();

function loadPlayerData() {
    if (fs.existsSync(JSON_FILE_PATH)) {
        const data = fs.readFileSync(JSON_FILE_PATH);
        const players = JSON.parse(data);
        players.forEach(player => {
            playerData.set(player.login, new PlayerData(
                player.login,
                player.password,
                player.position,
                player.rotation
            ));
        });
        console.log('Данные игроков успешно загружены.');
    } else {
        console.log('Файл данных игроков не найден. Будет создан новый.');
    }
}

function savePlayerData() {
    const playersArray = Array.from(playerData.values()).map(data => ({
        login: data.login,
        password: data.password,
        position: data.position,
        rotation: data.rotation
    }));
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(playersArray, null, 2));
    console.log('Данные игроков успешно сохранены.');
}

module.exports = {
    playerData,
    loadPlayerData,
    savePlayerData,
};
