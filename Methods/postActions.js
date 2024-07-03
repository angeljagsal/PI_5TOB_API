import { getSession } from "../connection.js";
import multer from 'multer';
import fs from 'fs';
import { promisify } from 'util';
const readFileAsync = promisify(fs.readFile);

// Post creation 
// Configuración de Multer para almacenar archivos temporalmente
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function createPost(req, res) {
  const session = getSession();
  const { title, desc, price } = req.body;
  const imgFile = req.file;

  if (!imgFile) {
    return res.status(400).send('No image file provided.');
  }

  try {
    // Convertir la imagen a base64
    const imgBase64 = imgFile.buffer.toString('base64');

    const result = await session.run(
      'CREATE (p:Post {img: $img, title: $title, desc: $desc, price: $price}) RETURN p',
      { img: imgBase64, title, desc, price }
    );
    res.status(200).json({ status: "Success", message: "Post was successfully created with image" });
  } catch (err) {
    console.error("Error during post creation", err);
    res.status(500).json({ status: "Error", message: "Internal server error" });
  } finally {
    session.close();
  }
}

// Get post
async function getPost(req, res) {
  
}

//Export methods
export const uploadMiddleware = upload.single('image');

export const methods = {
  createPost,
};
