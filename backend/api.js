import express from 'express';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());

const PORT = 3000;
const SECRET_KEY = 'seu-segredo';

// Configuração da conexão MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root', // Substitua pelo seu usuário do MySQL
    password: '', // Substitua pela sua senha do MySQL
    database: 'rifa', // Substitua pelo nome do seu banco de dados
};

// Criar conexão com o banco de dados
const pool = mysql.createPool(dbConfig);

app.listen(PORT, () => console.log(`Servidor Rodando na Porta ${PORT}`));

// Rota para registrar um novo usuário
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Inserir usuário no banco de dados
        await pool.query('INSERT INTO admin (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).send('Usuário registrado');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).send('Usuário já existe');
        }
        res.status(500).send('Erro ao registrar usuário');
    }
});

// Rota para login e geração do token
app.post('/', async (req, res) => {
    const { username, password } = req.body;

try {
    // Buscar usuário no banco de dados
    const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);

    if (rows.length === 0) {
        return res.status(401).send('Usuário Inválido');
    }

    const user = rows[0];

    // Comparar a senha digitada com o hash salvo
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(401).send('Senha Inválida');
    }

    // Gerar token
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
} catch (error) {
    console.error(error);
    res.status(500).send('Erro ao fazer login');
}

});

// Middleware para autenticação
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.get('/admin', authenticateToken, async (req, res) => {
    try {
        res.send("Donizete Viado 2");
    } catch (error) {
        res.status(404).json("Erro Porra!");
    }
});

app.get('/admin/dashboard', authenticateToken, async (req, res) => {
    try {
        res.send("Donizete Viado 3");
    } catch (error) {
        res.status(404).json("Erro Porra!");
    } 
});
