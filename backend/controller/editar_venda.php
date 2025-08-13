<?php
// Define o cabeçalho da resposta como JSON para comunicação com o frontend
header('Content-Type: application/json');

// ADICIONAR após header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ADICIONAR tratamento OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexão.php';

// Verifica se o método da requisição é POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Pega o corpo da requisição (que será enviado como JSON pelo frontend)
    $data = json_decode(file_get_contents('php://input'), true);
    
    /// SUBSTITUIR a validação atual por:
if (!isset($data['id']) || !isset($data['name']) || !isset($data['cpf']) || 
!isset($data['phone']) || !isset($data['email']) || !isset($data['numbers'])) {
echo json_encode([
    'success' => false, 
    'message' => 'Dados incompletos para atualização. Campos obrigatórios: id, name, cpf, phone, email, numbers.'
]);
exit();
}

    // Sanitiza e atribui os dados recebidos
    $id = $conn->real_escape_string($data['id']); // O ID da venda (do cliente) que será atualizado
    $name = $conn->real_escape_string($data['name']);
    $cpf = $conn->real_escape_string($data['cpf']);
    $phone = $conn->real_escape_string($data['phone']);
    $email = $conn->real_escape_string($data['email']);
    $numbers = $data['numbers']; // Este é um array de números

    // Inicia uma transação para garantir a integridade dos dados
    $conn->begin_transaction();

    try {
        // 1. Atualiza os dados do cliente na tabela 'clientes'
        // Assumimos que 'id' é a chave primária ou um identificador único para o cliente
        $stmt_cliente = $conn->prepare("UPDATE clientes SET nome = ?, cpf = ?, telefone = ?, email = ? WHERE id = ?");
        $stmt_cliente->bind_param("ssssi", $name, $cpf, $phone, $email, $id);
        $stmt_cliente->execute();
        $stmt_cliente->close();

        // 2. Atualiza os números associados a este cliente na tabela 'numeros'
        // Esta parte é mais complexa e depende da estrutura da sua tabela 'numeros'.
        // A abordagem mais segura é: 
        // a) Deletar todos os números antigos associados a este cliente.
        // b) Inserir os novos números.

        // a) Deleta os números antigos
        $stmt_delete_numeros = $conn->prepare("DELETE FROM numeros WHERE cpf_cliente = ?");
        $stmt_delete_numeros->bind_param("s", $cpf); // Usa o CPF para deletar, assumindo que cpf_cliente é o CPF do cliente
        $stmt_delete_numeros->execute();
        $stmt_delete_numeros->close();

        // b) Insere os novos números
        $stmt_insert_numeros = $conn->prepare("INSERT INTO numeros (cpf_cliente, numero) VALUES (?, ?)");
        foreach ($numbers as $numero) {
            $stmt_insert_numeros->bind_param("si", $cpf, $numero);
            $stmt_insert_numeros->execute();
        }
        $stmt_insert_numeros->close();

        // Se tudo deu certo, confirma a transação
        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Venda atualizada com sucesso.']);

    } catch (mysqli_sql_exception $exception) {
        // Em caso de erro em qualquer uma das operações, reverte a transação
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar a venda: ' . $exception->getMessage()]);
    }

} else {
    // Se o método não for POST, retorna um erro
    echo json_encode(['success' => false, 'message' => 'Método de requisição inválido. Use POST.']);
}

// Fecha a conexão com o banco de dados
$conn->close();
?>
