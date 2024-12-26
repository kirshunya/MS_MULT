const path = require('path');

module.exports = {
    PORT: process.env.PORT || 8080,
    JSON_FILE_PATH: path.join(__dirname, 'players.json'),
};
