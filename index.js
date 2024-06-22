import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { methods as userAuth } from "./Controllers/userAuth.js";

const app = express();
const port = 3000;

app.set("port", port);
app.listen(app.get("port"), () => {
  console.log(`Server listening on port`, app.get("port"));
});

app.use(cors());

app.use(express.json());
app.use(bodyParser.json());

// Ruta para manejar el registro de usuarios
app.post('/api/register', userAuth.register);

// Ruta para manejar el inicio de sesión de usuarios
app.post('/api/login', userAuth.login);
