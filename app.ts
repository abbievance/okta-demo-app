import express, { Request, Response, NextFunction } from "express";
import { Application } from "express";
require('dotenv').config();
import { Post, PrismaClient } from '@prisma/client'
const { auth } = require('express-openid-connect');
const { jwtAuth } = require('express-oauth2-jwt-bearer');
const { requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.TOKEN_KEY,
  baseURL: 'http://localhost:3000',
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.BASE_URL
};

const checkJwt = jwtAuth({
  audience: '{yourApiIdentifier}',
  issuerBaseURL: `https://{yourDomain}/`,
});


const app: Application = express();

app.use(auth(config));

const PORT = process.env.PORT;

const prisma = new PrismaClient()

interface CustomRequest extends Request {
  user?: { id: number, name: string}
}

interface User {
  id: number;
  username: string;
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.listen(PORT, async() => {
    const host = process.env.HOSTNAME || "http://localhost"
    console.log(`Listening on ${host}:${PORT}`)
})

app.get('/', async (req, res) => {
  res.send("Unprotected home page")
})

app.get('/protected', requiresAuth(), async (req, res) => {
  const users = await prisma.user.findMany();
    res.status(200).json({ message: 'protected', users });
})
