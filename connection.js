import mysql from 'mysql2/promise';

const pool = await mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '12345',
	database: 'authenticator',
	port: 3307,
});

export default pool