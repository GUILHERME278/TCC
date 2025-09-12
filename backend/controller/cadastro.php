<?php
//usando openssl_encrypt() para criptografia dos dados
// Definições de criptografia
define('ENCRYPTION_KEY', 'sua-chave-secreta-aqui'); // Troque por uma chave segura
define('ENCRYPTION_METHOD', 'aes-256-cbc');
//eses arquivo serve parar cadastrar os números comprados e os dados do comprador no banco 

header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

include 'conexão.php';

// Recebe os dados enviados pelo front em JSON via POST
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['success' => false, 'message' => 'JSON inválido.']);
    exit();
}

// Validação de campos obrigatórios
if (!isset($data['nome'], $data['cpf'], $data['telefone'], $data['numeros'])) {
    echo json_encode(['success' => false, 'message' => 'Campos obrigatórios faltando.']);
    exit();
}

$nome     = trim($data['nome']);
$cpf      = preg_replace('/\D/', '', $data['cpf']); // apenas números
$telefone = trim($data['telefone']);
$email    = isset($data['email']) ? trim($data['email']) : null;
$numeros_str = trim($data['numeros']); // string "1, 2, 3"
$total    = isset($data['total']) ? $data['total'] : null;

// Converte string de números em array, aceitando vírgulas com ou sem espaço
$numeros_comprados = preg_split('/\s*,\s*/', $numeros_str, -1, PREG_SPLIT_NO_EMPTY);

$conn->begin_transaction();

try {
    // Insere cliente (ou atualiza caso já exista)
    $stmt_cliente = $conn->prepare(
        "INSERT INTO clientes (cpf, nome, telefone, email) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nome = VALUES(nome), telefone = VALUES(telefone), email = VALUES(email)"
    );
    $cpf_encrypted = encrypt_data($cpf);
    $telefone_encrypted = encrypt_data($telefone);
    $email_encrypted = $email ? encrypt_data($email) : null;

    $stmt_cliente->bind_param("ssss", $cpf_encrypted, $nome, $telefone_encrypted, $email_encrypted);
    $stmt_cliente->execute();
    $stmt_cliente->close();

    // Insere os números vinculando ao CPF
    $stmt_numero = $conn->prepare("INSERT INTO numeros (numero, cpf_cliente) VALUES (?, ?)");
    foreach ($numeros_comprados as $numero) {
        $numero = trim($numero);
        if ($numero === '') continue;
        $stmt_numero->bind_param("ss", $numero, $cpf_encrypted);
        $stmt_numero->execute();
    }
    $stmt_numero->close();

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Cadastro realizado com sucesso.']);
} catch (mysqli_sql_exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Erro no cadastro: ' . $e->getMessage()]);
} finally {
    $conn->close();
}


// Função para criptografar dados
function encrypt_data($data) {
    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length(ENCRYPTION_METHOD));
    $encrypted = openssl_encrypt($data, ENCRYPTION_METHOD, ENCRYPTION_KEY, 0, $iv);
    return base64_encode($encrypted . '::' . $iv);
}


