const request = require('supertest');
const express = require('express');
const postsRouter = require('../routes/posts');
const usersRouter = require('../routes/users');

const app = express();
app.use(express.json());
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);

// Middleware de autenticación simulado
const mockAuthenticateToken = (req, res, next) => {
    req.user = {nombre: 'Nuevo Usuario', email: 'usuariodeprueba@gmail.com', password: 'usuarionuevo123' };
    next();
};

app.use('/api/posts', mockAuthenticateToken);

let token = 'Bearer fake1_token';

beforeEach(() => {
    token = 'Bearer fake1_token'; // Se puede modificar si se necesita otro token
});

// Función auxiliar para enviar peticiones de POST
const postRequest = (endpoint, data) => {
    return request(app)
        .post(endpoint)
        .send(data)
        .set('Authorization', token)
        .set('Accept', 'application/json');
};

describe('POST /api/users', () => {
    const validUser = { nombre: 'NuevoUsuario', email: 'new1@usuario.com', password: 'password123' };
    const invalidEmailUser = { nombre: 'Nuevo Usuario', email: 'invalid-email', password: 'password123' };
    const validLogin = { email: 'new1@usuario.com', password: 'password123' };
    const invalidLogin = { email: 'wrong@usuario.com', password: 'wrongpassword' };

    it('Registrar un usuario con éxito', async () => {
        const response = await postRequest('/api/users/register', validUser);
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({ message: 'Usuario registrado con éxito' });
    });

    it('Regresar un error si el correo es inválido', async () => {
        const response = await postRequest('/api/users/register', invalidEmailUser);
        expect(response.status).toBe(400);
        expect(response.body.errors[0]).toHaveProperty('msg', 'Debe ser un email válido');
    });

    it('Iniciar sesión exitosamente', async () => {
        const response = await postRequest('/api/users/login', validLogin);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('Regresar un error si las credenciales son incorrectas', async () => {
        const response = await postRequest('/api/users/login', invalidLogin);
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Credenciales incorrectas');
    });

    describe('POST /api/posts', () => {
        const validPost = { title: 'Post de Prueba', content: 'Es una publicación de prueba'};
        const invalidPost = { content: 'Post sin título' };
    
        it('Crear una publicación con éxito', async () => {
            const response = await postRequest('/api/posts', validPost);
            expect(response.status).toBe(201);
            expect(response.headers['content-type']).toMatch(/json/);
            expect(response.body).toMatchObject({ message: 'Post created' });
        });
    
        it('Devuelve un error si faltan datos', async () => {
            const response = await postRequest('/api/posts', invalidPost);
            expect(response.status).toBe(400);
            expect(response.headers['content-type']).toMatch(/json/);
            expect(response.body).toHaveProperty('error', expect.stringContaining('El título es obligatorio'));
        });
    });
    
});
