<?php
header('Content-Type: application/json');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

include 'conexão.php';

// Lê e decodifica o JSON do corpo da requisição
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['success' => false, 'message' => 'JSON inválido.']);
    exit();
}

// Obtém e normaliza o CPF
$cpf = isset($data['cpf']) ? preg_replace('/\D/', '', $data['cpf']) : '';
if (strlen($cpf) !== 11) {
    echo json_encode(['success' => false, 'message' => 'CPF inválido.']);
    exit();
}

try {
    /**
     * Query:
     * - DISTINCT remove duplicatas
     * - ORDER BY (numero+0) tenta ordenar numericamente quando o valor for número.
     *   Caso o campo contenha valores não numéricos, usamos fallback para ordenar por texto.
     *
     * Nota: dependendo do seu conteúdo em `numero`, você pode preferir
     * ORDER BY CAST(numero AS UNSIGNED) ou ORDER BY LENGTH(numero), numero.
     */
    $sql = "
      SELECT DISTINCT numero
      FROM numeros
      WHERE cpf_cliente = ?
      ORDER BY (numero+0) ASC, numero ASC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $cpf);
    $stmt->execute();
    $result = $stmt->get_result();

    $numeros = [];
    while ($row = $result->fetch_assoc()) {
        // trim por segurança
        $numeros[] = trim($row['numero']);
    }

    // Opcional: remover strings vazias caso existam (defensivo)
    $numeros = array_values(array_filter($numeros, function($v) {
        return ($v !== null && $v !== '');
    }));

    echo json_encode([
        'success' => true,
        'cpf' => $cpf,
        'numeros' => $numeros
    ]);

    $stmt->close();
    $conn->close();
} catch (mysqli_sql_exception $e) {
    // Em produção, não exiba $e->getMessage() cru — aqui retorno genérico
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar números.']);
    // opcional: registrar/logar $e->getMessage() em arquivo de log
}
