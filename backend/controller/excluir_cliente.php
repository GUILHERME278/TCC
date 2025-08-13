
<?php

include 'conexão.php';
// Verifica se o método da requisição é POST (mais seguro para exclusões)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Pega o corpo da requisição (que será enviado como JSON pelo frontend)
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Verifica se o CPF foi enviado
    if (!isset($data['cpf']) || empty($data['cpf'])) {
        echo json_encode(['success' => false, 'message' => 'CPF não fornecido.']);
        exit();
    }

    $cpf_cliente = $data['cpf'];

    // Inicia uma transação para garantir que ambas as exclusões (números e cliente) ocorram com sucesso
    $conn->begin_transaction();

    try {
        // 1. Exclui os números associados ao CPF do cliente na tabela 'numeros'
        $stmt_numeros = $conn->prepare("DELETE FROM numeros WHERE cpf_cliente = ?");
        $stmt_numeros->bind_param("s", $cpf_cliente);
        $stmt_numeros->execute();
        $stmt_numeros->close();

        // 2. Exclui o cliente da tabela 'clientes'
        $stmt_cliente = $conn->prepare("DELETE FROM clientes WHERE cpf = ?");
        $stmt_cliente->bind_param("s", $cpf_cliente);
        $stmt_cliente->execute();

        // Verifica se o cliente foi realmente excluído (se alguma linha foi afetada)
        if ($stmt_cliente->affected_rows > 0) {
            // Se tudo deu certo, confirma a transação
            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Cliente e seus números foram excluídos com sucesso.']);
        } else {
            // Se nenhum cliente com esse CPF foi encontrado, reverte a transação
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Nenhum cliente encontrado com o CPF fornecido.']);
        }

        $stmt_cliente->close();

    } catch (mysqli_sql_exception $exception) {
        // Em caso de erro em qualquer uma das operações, reverte a transação
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Erro ao excluir o cliente: ' . $exception->getMessage()]);
    }

} else {
    // Se o método não for POST, retorna um erro
    echo json_encode(['success' => false, 'message' => 'Método de requisição inválido. Use POST.']);
}

// Fecha a conexão com o banco de dados
$conn->close();
?>