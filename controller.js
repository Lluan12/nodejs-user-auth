import pool from "./connection.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import { SECRETO } from './config.js'

export const login = async (req, res) => {
	const { username, password } = req.body;
	try {
		const [rows] = await pool.query(
			"SELECT * FROM users WHERE username = ?",
			[username]
		);
		if (!rows[0])
			return res.status(400).json({ message: "User does not exist" });
		const isValid = await bcrypt.compare(password, rows[0].password);
		if (!isValid)
			return res.status(401).json({ message: "Password invalid" });
		const { password: _, ...publicUser } = rows[0];
		const token = jwt.sign(
			{ id: publicUser.id, username: publicUser.username }, 
			SECRETO,
			{ expiresIn: '1h' }
		);
		res.cookie('access_token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60
		}).json(publicUser);
	} catch (error) {
		res.status(500).json({ message: "Login not allowed", error });
	}
}

export const createUser = async (req, res) => {
	const { username, password } = req.body;
	try {
		const [rows] = await pool.query(
			"SELECT username FROM users WHERE username = ?",
			[username]
		);
		if (rows[0])
			return res.status(400).json({ message: "User already existss" });
		const hashPassword = await bcrypt.hash(password, 10);
		const [results] = await pool.query(
			"INSERT INTO users (username, password) VALUES (?, ?)",
			[username, hashPassword]
		);
		res.json({ id: results.insertId });
	} catch (error) {
		res.status(500).json({ message: "User not created", error });
	}
}