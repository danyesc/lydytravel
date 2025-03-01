const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router(); 
const db = require('../db'); 


router.post('/register', [
    check('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    check('email').isEmail().withMessage('Debe ser un email válido'),
    check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
        [nombre, email, hashedPassword],
        (error, results) => {
            if (error) {
                return res.status(500).json({ message: "Error al registrar usuario", error: error.message });
            }
            res.status(201).json({ message: "Usuario registrado con éxito", nombre });
        }
    );
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    try {
        db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.status(500).json({ message: "Error en el servidor", error: err.message });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: "Credenciales incorrectas" });
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: "Credenciales incorrectas" });
            }

            // Generar un token con JWT
            const token = jwt.sign(
                { id: user.id, nombre: user.nombre, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } // Expira en 1 hora
            );

            res.json({ message: "Inicio de sesión exitoso", token, nombre: user.nombre });
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
});

module.exports = router;