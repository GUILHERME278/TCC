<?php
include 'conexão.php';

// Array para armazenar a resposta que será enviada ao front-end
$response = [];

// Query SQL para selecionar todos os números da tabela 'numeros'
$sql = "SELECT numero FROM numeros";
$result = $conn->query($sql);

// Verifica se a consulta foi bem-sucedida
if ($result) {
    $numerosComprados = [];
    // Itera sobre os resultados da consulta e adiciona cada número ao array
    while ($row = $result->fetch_assoc()) {
        // A coluna 'numero' pode conter múltiplos números separados por vírgula
        $numerosSeparados = explode(',', $row['numero']);
        foreach ($numerosSeparados as $num) {
            // Adiciona cada número individualmente ao array final
            $numerosComprados[] = trim($num);
        }
    }
    
    // Prepara a resposta de sucesso com a lista de números
    $response['success'] = true;
    $response['numeros'] = $numerosComprados;
} else {
    // Se a consulta falhar, prepara uma resposta de erro
    $response['success'] = false;
    $response['message'] = 'Erro ao buscar os números no banco de dados.';
}

// Fecha a conexão com o banco de dados
$conn->close();

// Envia a resposta final em formato JSON
echo json_encode($response);

?>