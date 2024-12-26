require('dotenv').config({path: '../.env'});

const mysql = require('mysql2/promise');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);

// Настройка подключения к базе данных
const pool = mysql.createPool({
    host: process.env.DB_HOST,      // Хост базы данных
    user: process.env.DB_USER,      // Пользователь базы данных
    password: process.env.DB_PASSWORD, // Пароль базы данных
    database: process.env.DB_NAME,   // Имя базы данных
    port: 10000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Функция для создания таблицы, если она не существует
async function createTableIfNotExists() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS players (
            login VARCHAR(255) PRIMARY KEY,
            password VARCHAR(255),
            position JSON,
            rotation JSON
        );
    `;

    await pool.query(createTableQuery);
}

module.exports = { pool, createTableIfNotExists };