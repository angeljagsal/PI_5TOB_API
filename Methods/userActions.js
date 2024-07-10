import { getSession, storage as firebaseStorage } from "../connection.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { session } from "neo4j-driver";
import { v4 as uuidv4 } from 'uuid';

async function getUserData(userId) {
  const session = getSession();

  try {
    const result = await session.run(
      `MATCH (u:User { userId: $userId })
      RETURN u.profileImg AS profileImg`,
      { userId }
    );

    if (result.records.length > 0) {
      const profileImg = result.records[0].get('profileImg');
      return profileImg;
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error retrieving user data:", error);
    throw new Error("Error retrieving user data");
  } finally {
    await session.close();
  }
}

async function saveProfileImg(req, res) {
  const session = getSession();
  const { userId } = req.body;
  const img = req.file;
  const randomId = uuidv4();

  if (!img) {
    return res.status(400).json({ status: "Error", message: "No image file provided." });
  }

  try {
    const oldUserUrl = await getUserData(userId);

    if (oldUserUrl) {
      const imgName = getTextBetweenCharacters(oldUserUrl, '%', '?');
      const imgRef = ref(firebaseStorage, `user_images/${imgName}`);
      await deleteObject(imgRef);
    }

    const imgRef = ref(firebaseStorage, `user_images/${randomId}_${img.originalname}`);

    if (!req.file || req.file.size === 0) {
      return res.status(400).json({ status: "Error", message: "No image file provided or file is empty." });
    }

    await uploadBytes(imgRef, req.file.buffer);

    const imgUrl = await getDownloadURL(imgRef);

    const result = await session.run(
      `MATCH (u:User {userId: $userId})
       SET u.profileImg = $imgUrl
       RETURN u`,
      { userId, imgUrl }
    );

    res.status(200).json({ status: "Success", message: "Image was successfully updated", userImgUrl: imgUrl });
  } catch (err) {
    console.error("Error during image update", err);
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
  saveProfileImg,
  getUserData
};
