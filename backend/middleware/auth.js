const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Acceso denegado, token requerido" });
    }

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified;
        next(); // Continúa con la siguiente función en la ruta
    } catch (error) {
        return res.status(403).json({ message: "Token inválido" });
    }
};

module.exports = authenticateToken;
