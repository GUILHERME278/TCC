<?php
header('Content-Type: application/json');

include 'conexão.php';

// Recebe o corpo da requisição JSON
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// Verifica se os dados JSON foram recebidos e decodificados corretamente
if (json_last_error() !== JSON_ERROR_NONE || !isset($data['nome'], $data['cpf'], $data['telefone'], $data['numeros'], $data['total'])) {
    echo json_encode(['success' => false, 'message' => 'Dados inválidos recebidos.']);
    exit();
}

$nome = $data['nome'];
$cpf = $data['cpf'];
$telefone = $data['telefone'];
$email = isset($data['email']) ? $data['email'] : 'Não informado';
$numeros_comprados_str = $data['numeros'];
$total = $data['total'];

// Inicia uma transação para garantir a integridade dos dados
$conn->begin_transaction();

try {
    // 1. Insere o cliente na tabela 'clientes'
    $stmt_cliente = $conn->prepare("INSERT INTO clientes (nome, cpf, telefone, email) VALUES (?, ?, ?, ?)");
    $stmt_cliente->bind_param("ssss", $nome, $cpf, $telefone, $email);
    $stmt_cliente->execute();
    $cliente_id = $conn->insert_id;
    $stmt_cliente->close();

    // 2. Insere os números comprados na tabela 'numeros_comprados'
    $numeros_array = array_map('intval', explode(', ', $numeros_comprados_str));
    
    $stmt_numero = $conn->prepare("INSERT INTO numeros_comprados (cliente_id, numero) VALUES (?, ?)");
    foreach ($numeros_array as $numero) {
        $stmt_numero->bind_param("ii", $cliente_id, $numero);
        $stmt_numero->execute();
    }
    $stmt_numero->close();

    // Confirma a transação
    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Compra registrada com sucesso!']);

} catch (mysqli_sql_exception $e) {
    // Em caso de erro, reverte a transação
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Erro ao registrar a compra: ' . $e->getMessage()]);
} finally {
    $conn->close();
}

?>

