import express from 'express';
import cors from 'cors';
import { methods as userAuth } from "./Methods/userAuth.js";
import { methods as postActions, upload } from "./Methods/postActions.js"

const app = express();

app.set("port", port);
app.listen(app.get("port"), () => {
  console.log(`Server listening on port`, app.get("port"));
});

app.use(cors());
app.use(express.json()); // Handles JSON payloads

// Route to manage user registration
app.post('/api/register', userAuth.register);

// Route to manage user login
app.post('/api/login', userAuth.login);

// Route for retrieving user data
app.post('/api/userData', ) // To complete


// Route for the management of post creation
app.post('/api/post', upload.single('img'), postActions.createPost);

// Route for retrieving post data
app.get('/api/posts', postActions.retrievePost);

// Route for retrieving post data
// app.get('/api/deletePost', postActions.deletePost);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
