import express from "express";
import morgan from "morgan";
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import { SECRETO } from './config.js'

const app = express();
const port = 3000;

import { login, createUser } from './controller.js'

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser())
app.set('view engine', 'ejs')

app.get("/", (req, res) => {
	res.render('example', { username: 'Lluan' });
});

app.use((req, res, next) => {
	const token = req.cookies.access_token
	req.session = {user: null}

	try {
		const data = jwt.verify(token, SECRETO);
		req.session.user = data
	} catch (error) {
		
	}
	next()
})

app.post("/login", login);

app.post("/register", createUser);

app.post("/logout", (req, res) => {
	res.clearCookie('access_token')
	res.sendStatus(200)
});

app.get("/protected", (req, res) => {
	const data = req.session.user
	if(!data)
		return res.status(403).send({ message: "Access not authorized" })
	res.render('protected', data)
});

app.listen(port, () => {
	console.log(`Escuchando en el puerto ${port}`);
});
