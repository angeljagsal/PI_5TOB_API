import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;

app.set("port", port);
app.listen(app.get("port"), () => {
  console.log(`Server listening on port`, app.get("port"));
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Methods for the API
import { methods as userAuth } from "./Methods/userAuth.js";
import { methods as postActions, uploadMiddleware } from "./Methods/postActions.js"

// Route to manage user registration
app.post('/api/register', userAuth.register);

// Route to manage user login
app.post('/api/login', userAuth.login);

// Route for the management of post creation
app.post('/api/newPost', uploadMiddleware, postActions.createPost);
