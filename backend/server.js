require('dotenv').config(); // Si usas variables de entorno
const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const upload = require('./routes/posts').upload; // Importa la configuración de Multer desde routes/posts.js

const app = express();
const postsRoutes = require('./routes/posts');

app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Las rutas *van primero*
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', postsRoutes);

app.use(express.static(path.join(__dirname, 'build')));
app.use('/uploads', express.static('uploads'));

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));