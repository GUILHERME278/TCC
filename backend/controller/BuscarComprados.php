<?php
include 'conexão.php';

header('Content-Type: application/json'); // Garante que a resposta será JSON

$response = ['success' => false, 'message' => ''];

// Verifica se a requisição é POST e se o CPF foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['cpf'])) {
    $cpf = $_POST['cpf'];
    $cpfLimpo = preg_replace('/[^0-9]/', '', $cpf); // Remove caracteres não numéricos

    if (strlen($cpfLimpo) !== 11) {
        $response['message'] = 'CPF inválido. Deve conter 11 dígitos.';
        echo json_encode($response);
        exit();
    }

    // Prepara a consulta SQL para buscar nome, CPF e números do comprador
    // ATENÇÃO: Substitua 'sua_tabela_de_compras' e os nomes das colunas
    // pelas informações reais da sua tabela no banco de dados.
    // Exemplo: SELECT nome_comprador, cpf_comprador, numeros_comprados FROM compras WHERE cpf_comprador = ?
    $sql = "SELECT nome, cpf, numeros FROM compras WHERE cpf = ?";
    
    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        $response['message'] = 'Erro na preparação da consulta: ' . $conn->error;
        echo json_encode($response);
        exit();
    }

    $stmt->bind_param("s", $cpfLimpo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $data = $result->fetch_assoc();
        
        // Formata o CPF para exibição (XXX.XXX.XXX-XX)
        $cpfFormatado = substr($data['cpf'], 0, 3) . '.' .
                        substr($data['cpf'], 3, 3) . '.' .
                        substr($data['cpf'], 6, 3) . '-' .
                        substr($data['cpf'], 9, 2);

        $response['success'] = true;
        $response['nome'] = $data['nome'];
        $response['cpf'] = $cpfFormatado;
        $response['numeros'] = explode(',', $data['numeros']); // Assume que números são separados por vírgula
    } else {
        $response['message'] = 'Nenhum número encontrado para o CPF informado.';
    }

    $stmt->close();
} else {
    $response['message'] = 'Requisição inválida ou CPF não fornecido.';
}

$conn->close();
echo json_encode($response);
?>