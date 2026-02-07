import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'loop_restro',
  password: process.env.DB_PASSWORD || 'restro',
  database: process.env.DB_NAME || 'loop_restro',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
