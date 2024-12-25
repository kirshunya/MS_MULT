// db.js
const { Pool } = require('pg');

// Настройка подключения к базе данных
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Убедитесь, что эта переменная окружения настроена на вашем Render
    ssl: {
        rejectUnauthorized: false // Для работы с SSL в Render
    }
});

module.exports = pool;