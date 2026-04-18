const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');
require('dotenv').config();

// Optional MySQL pool (used if you plan to connect to a DB)
const pool = (process.env.DB_HOST && process.env.DB_USER)
  ? mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    })
  : null;

// In-memory mock database used by current controllers
const db = {
  clients: [],
  comptes: [],
  transactions: [],
};

const uuidv4 = () => randomUUID();

module.exports = { db, uuidv4, pool };