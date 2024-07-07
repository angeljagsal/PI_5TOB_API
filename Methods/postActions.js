import { getSession, storage as firebaseStorage } from "../connection.js";
import multer from 'multer';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Create post function using Firebase & Neo4j
async function createPost(req, res) {
  const session = getSession();
  const { userId, title, desc, price } = req.body;
  const img = req.file;
  const randomId = uuidv4();

  if (!img) {
    return res.status(400).json({ status: "Error", message: "No image file provided." });
  }

  try {
    const imgRef = ref(firebaseStorage, `images/${uuidv4()}_${img.originalname}`);

    if (!req.file || req.file.size === 0) {
      return res.status(400).json({ status: "Error", message: "No image file provided or file is empty." });
    }

    await uploadBytes(imgRef, req.file.buffer);

    const imgUrl = await getDownloadURL(imgRef);

    const result = await session.run(
      `MATCH (u:User {userId: $userId})
      CREATE (p:Post { postId: $randomId, title: $title, desc: $desc, price: $price, imageUrl: $imageUrl })
      CREATE (u)-[:CREATED]->(p)
      RETURN p`,
      { userId, randomId, title, desc, price, imageUrl: imgUrl }
    );

    res.status(200).json({ status: "Success", message: "Post was successfully created with image", post: result.records[0].get('p').properties });
  } catch (err) {
    console.error("Error during post creation", err);
    res.status(500).json({ status: "Error", message: "Internal server error" });
  } finally {
    session.close();
  }
}

// Retrieve posts data function
async function retrievePost(req, res) {
  const session = getSession();

  try {
    const result = await session.run('MATCH (p:Post) RETURN p');

    const posts = result.records.map(record => record.get('p').properties);

    if (posts.length === 0) {
      return res.status(404).json({ status: "Error", message: "No posts found" });
    }

    res.status(200).json({ status: "Success", posts: posts });
  } catch (err) {
    console.error("Error retrieving posts", err);
    res.status(500).json({ status: "Error", message: "Internal server error" });
  } finally {
    session.close();
  }
}

// Retrieve posts from user data function
async function retrieveUserPost(req, res) {
  const session = getSession();
  const { userId } = req.body;

  try {
    const result = await session.run(`MATCH (u:User {userId: $userId})-[:CREATED]->(p:Post)
       RETURN p`,
      { userId }
    );

    const posts = result.records.map(record => record.get('p').properties);

    if (posts.length === 0) {
      return res.status(404).json({ status: "Error", message: "No posts found" });
    }

    res.status(200).json({ status: "Success", posts: posts });
  } catch (err) {
    console.error("Error retrieving posts", err);
    res.status(500).json({ status: "Error", message: "Internal server error" });
  } finally {
    await session.close();
  }
}

// Delete all data from a post
async function deletePost(req, res) {
  const session = getSession();
  const { postId } = req.body;

  try {
    const resultPostId = await session.run(
      'MATCH (p:Post {postId: $postId}) RETURN p.imageUrl',
      { postId }
    );

    const imgId = resultPostId.records.map(record => record.get('p.imageUrl'));
    const imgIdString = imgId[0];
    const imgName = getTextBetweenCharacters(imgIdString, '%', '?');

    await session.run(
      'MATCH (p:Post {postId: $postId}) DETACH DELETE p',
      { postId }
    );

    const imgRef = ref(firebaseStorage, `images/${imgName}`);

    try {
      await deleteObject(imgRef);
      res.status(200).json({ status: "Success" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(404).json({ status: "Error", message: "No image found" });
    }
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ status: "Error", message: "Internal server error" });
  } finally {
    session.close();
  }
}

function getTextBetweenCharacters(str, char1, char2) {
  const startIndex = str.indexOf(char1);
  const endIndex = str.indexOf(char2);

  if (startIndex !== -3 && endIndex !== -1 && endIndex > startIndex) {
    return str.substring(startIndex + 3, endIndex);
  } else {
    return '';
  }
}

export const methods = {
  createPost,
  retrievePost,
  retrieveUserPost,
  deletePost
};
export { upload };
