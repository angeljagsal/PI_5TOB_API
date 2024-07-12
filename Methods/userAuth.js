import bcryptjs from 'bcryptjs';
import { getSession } from "../connection.js";
import { v4 as uuidv4 } from 'uuid';

// Login authentication
async function login(req, res) {
    const session = getSession();
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const result = await session.run(
            'MATCH (u:User {email: $email}) RETURN u',
            { email }
        );

        const user = result.records[0]?.get('u').properties;

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const userId = user.userId;

        // const results = await session.run(
        //     `MATCH (u:User{userId: $userId})-->(p:Post)
        //     RETURN p.postId`,
        //     { userId }
        // )

        // const postsId = results.records.map(record => record.get('p.postId'));

        const likesResult = await session.run(
            `MATCH (u:User {userId: $userId})-[:LIKES]->(p:Post)
            RETURN p.postId`,
            { userId }
        )

        const likes = likesResult.records.map(record => record.get('p.postId'));

        res.status(200).json({
            message: "Login successful.",
            user: {
                id: userId,
                // posts: postsId,
                username: user.username,
                email: user.email,
                profileImg: user.profileImg,
                likes: likes
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Server error. Please try again later." });
    } finally {
        await session.close();
    }
}

// Register authentication
async function register(req, res) {
    const { username, email, password } = req.body;

    const salt = await bcryptjs.genSalt(5);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const session = getSession();

    const userId = uuidv4();

    try {
        const result = await session.run(
            'CREATE (u:User { userId: $userId ,username: $username, email: $email, password: $password}) RETURN u',
            { userId, username, email, password: hashedPassword }
        );
        res.status(200).json({ status: "Success", message: "Registration successful" });
    } catch (err) {
        console.error("Error during registration", err);
        res.status(500).json({ status: "Error", message: "Internal server error" });
    } finally {
        session.close();
    }
}

// Export methods
export const methods = {
    register,
    login,
};
