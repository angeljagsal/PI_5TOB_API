import bcryptjs from 'bcryptjs';
import { getSession } from "../connection.js";

// LOGIN AUTHENTICATION
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

        res.status(200).json({ message: "Login successful." });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Server error. Please try again later." });
    } finally {
        await session.close();
    }
}

// REGISTER AUTHENTICATION
async function register(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ status: "Error", message: "Los campos están vacíos o incompletos" });
    }

    if (password.length < 8) {
        return res.status(400).json({ status: "Error", message: "La contraseña debe tener al menos 8 caracteres" });
    }

    const salt = await bcryptjs.genSalt(5);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const session = getSession();

    try {
        const result = await session.run(
            'CREATE (u:User {username: $username, email: $email, password: $password}) RETURN u',
            { username, email, password: hashedPassword }
        );

        if (result.records.length > 0) {
            return res.status(201).json({ message: "Registro exitoso" });
        } else {
            return res.status(400).json({ message: "No se pudo registrar al usuario" });
        }
    } catch (err) {
        console.error("Error during registration", err);
        return res.status(500).json({ status: "Error", message: "Error interno del servidor" });
    } finally {
        session.close();
    }
}

// EXPORT METHODS
export const methods = {
    register,
    login
};
