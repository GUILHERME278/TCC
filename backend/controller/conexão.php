<?php
// Configurações do banco de dados
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "usuarios";

// Tenta conectar ao banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);

// Verifica a conexão
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Erro de conexão com o banco de dados: ' . $conn->connect_error]);
    exit();
}

$conn->set_charset("utf8mb4");

// Definições de criptografia
define("ENCRYPTION_KEY", "sua-chave-secreta-aqui"); // Troque por uma chave segura e única!
define("ENCRYPTION_METHOD", "aes-256-cbc");

// Função para criptografar dados
function encrypt_data($data) {
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length(ENCRYPTION_METHOD));
    $encrypted = openssl_encrypt($data, ENCRYPTION_METHOD, ENCRYPTION_KEY, 0, $iv);
    return base64_encode($encrypted . '::' . $iv);
}

// Função para descriptografar dados
function decrypt_data($encrypted_data) {
    $parts = explode('::', base64_decode($encrypted_data), 2);
    if (count($parts) < 2) {
        return $encrypted_data; // Retorna o original se não estiver no formato esperado
    }
    list($encrypted_data_part, $iv) = $parts;
    return openssl_decrypt($encrypted_data_part, ENCRYPTION_METHOD, ENCRYPTION_KEY, 0, $iv);
}
?>





