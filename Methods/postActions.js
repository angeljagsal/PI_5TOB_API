import { getSession, storage as firebaseStorage } from "../connection.js";
import multer from 'multer';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create post function using Firebase & Neo4j
async function createPost(req, res) {
  const session = getSession();
  const { title, desc, price } = req.body;
  const img = req.file;

  if (!img) {
    return res.status(400).json({ status: "Error", message: "No image file provided." });
  }

  try {
    const imgRef = ref(firebaseStorage, `images/${uuidv4()}_${img.originalname}`);

    await uploadBytes(imgRef, img.buffer);

    const imgUrl = await getDownloadURL(imgRef);

    const result = await session.run(
      'CREATE (p:Post { title: $title, desc: $desc, price: $price, imageUrl: $imageUrl }) RETURN p',
      { title, desc, price, imageUrl: imgUrl }
    );

    res.status(200).json({ status: "Success", message: "Post was successfully created with image", post: result.records[0].get('p').properties });
  } catch (err) {
    console.error("Error during post creation", err);
    res.status(500).json({ status: "Error", message: "Internal server error" });
  } finally {
    session.close();
  }
}

// Retrieve post data function
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

export const methods = {
  createPost,
  retrievePost
};
export { upload };