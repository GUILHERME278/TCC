CREATE DATABASE usuarios;
USE usuarios;

-- Tabela para armazenar os dados dos clientes
CREATE TABLE clientes (
    cpf VARCHAR(11) PRIMARY KEY,  -- CPF do cliente, chave primária
    nome VARCHAR(255) NOT NULL,   -- Nome do cliente
    email VARCHAR(255),           -- E-mail do cliente
    telefone VARCHAR(20)          -- Telefone do cliente
);

-- Tabela para armazenar os números relacionados ao CPF dos clientes
CREATE TABLE numeros (
    id_numero INT AUTO_INCREMENT PRIMARY KEY,   -- ID único para o número
    numero VARCHAR(20) NOT NULL,                 -- Número cadastrado
    cpf_cliente VARCHAR(11),                     -- CPF do cliente
    FOREIGN KEY (cpf_cliente) REFERENCES clientes(cpf)  -- Relaciona com a tabela clientes
);
