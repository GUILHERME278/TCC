CREATE DATABASE usuarios;
USE usuarios;

-- Tabela clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(11) UNIQUE NOT NULL,
    telefone VARCHAR(15),
    email VARCHAR(100) UNIQUE
);

-- Tabela numeros_comprados (cada registro é um número comprado por um cliente)
CREATE TABLE numeros_comprados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    numero INT NOT NULL,
    data_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
