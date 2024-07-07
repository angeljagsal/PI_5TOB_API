import express from 'express';
import cors from 'cors';
import { methods as userAuth } from "./Methods/userAuth.js";
import { methods as postActions, upload } from "./Methods/postActions.js"

const app = express();

const port = process.env.PORT || 6969;
app.set("port", port);

app.use(cors());
app.use(express.json()); // Handles JSON payloads


// User actions routes
app.post('/api/register', userAuth.register); // Route to manage user registration

app.post('/api/login', userAuth.login); // Route to manage user login

// Post actions routes
app.post('/api/post', upload.single('img'), postActions.createPost); // Route for the management of post creation

app.get('/api/posts', postActions.retrievePost); // Route for retrieving post data

app.post('/api/userPosts', postActions.retrieveUserPost); // Route for retrieving post data from a user

app.post('/api/deletePost', postActions.deletePost); // Route for deleting post from a user

// Port
app.listen(app.get("port"), () => {
  console.log(`Server listening on port ${app.get("port")}`);
});
