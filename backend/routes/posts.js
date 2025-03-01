const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db'); // Archivo de conexión a la base de datos
const authenticateToken = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuración de Multer para la subida de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
            return cb(new Error('Solo se permiten imágenes (.jpg, .jpeg, .png)'));
        }
        cb(null, true);
    },
});

// Obtener publicaciones
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    db.query(
        'SELECT p.*, u.nombre AS username FROM posts p LEFT JOIN usuarios u ON p.user_id = u.id LIMIT ? OFFSET ?',
        [limit, offset],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ page, limit, results });
        }
    );
});

// Crear una nueva publicación (protegida con JWT)
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError });
    }

    const { title, content, location } = req.body;
    const user_id = req.user.id; // Se obtiene del token

    const image = req.file ? req.file.filename : null;

    db.query(
        'INSERT INTO posts (title, content, location, user_id, image) VALUES (?, ?, ?, ?, ?)',
        [title, content, location, user_id, image],
        (err, results) => {
            if (err) {
                console.error("Error creando publicación:", err);
                return res.status(500).json({ error: err.message });
            }

            const imageUrl = image ? `/uploads/${image}` : null;
            res.status(201).json({ message: 'Post created', id: results.insertId, imageUrl });
        }
    );
});

// Eliminar una publicación (protegida con JWT)
router.delete('/:id', authenticateToken, (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id; // Se obtiene del token

    db.query('DELETE FROM posts WHERE id = ? AND user_id = ?', [postId, userId], (err, results) => {
        if (err) {
            console.error("Error al eliminar publicación:", err);
            return res.status(500).json({ error: err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Publicación no encontrada o no tienes permiso para eliminarla" });
        }

        res.status(200).json({ message: "Publicación eliminada exitosamente" });
    });
});

module.exports = router;
module.exports.upload = upload;
