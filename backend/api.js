import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { path } from 'express/lib/application';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;

// Configuração da conexão MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'rifa', 
};

// Criar conexão com o banco de dados
const pool = mysql.createPool(dbConfig);
app.listen(PORT, () => console.log(`Servidor Rodando na Porta ${PORT}`));

app.get('/', await async(req, res) => {
    
})

app.get('/admin/', await async(req, res) => {

});

app.get('/admin/dashboard', await async(req, res) => {

});

app.use()