<?php
header("Content-Type: application/json");
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Inclua seu arquivo de conexão com o banco de dados
include 'conexão.php';

// --- Configurações de Cache ---
$cache_dir = __DIR__ . "/cache/"; // Diretório para armazenar os arquivos de cache
$cache_time = 300; // Tempo de vida do cache em segundos (ex: 300s = 5 minutos)

// Cria o diretório de cache se não existir
if (!is_dir($cache_dir)) {
    mkdir($cache_dir, 0755, true);
}
// ------------------------------

// Lê e decodifica o JSON do corpo da requisição
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(["success" => false, "message" => "JSON inválido."]);
    exit();
}

// Obtém e normaliza o CPF
$cpf = isset($data["cpf"]) ? preg_replace("/\D/", "", $data["cpf"]) : "";
if (strlen($cpf) !== 11) {
    echo json_encode(["success" => false, "message" => "CPF inválido."]);
    exit();
}

// --- Lógica de Cache ---
$cache_file = $cache_dir . md5($cpf) . ".json";

// Verifica se o cache existe e ainda é válido
if (file_exists($cache_file) && (time() - filemtime($cache_file) < $cache_time)) {
    $cached_data = file_get_contents($cache_file);
    echo $cached_data;
    exit(); // Retorna os dados do cache e encerra a execução
}
// -----------------------

try {
    /**
     * Query atualizada:
     * - Faz JOIN entre as tabelas clientes e numeros
     * - Retorna nome do cliente, CPF e números
     * - DISTINCT remove duplicatas
     * - ORDER BY (numero+0) tenta ordenar numericamente quando o valor for número.
     *   Caso o campo contenha valores não numéricos, usamos fallback para ordenar por texto.
     */
    $sql = "
      SELECT DISTINCT c.nome, c.cpf, n.numero
      FROM clientes c
      INNER JOIN numeros n ON c.cpf = n.cpf_cliente
      WHERE c.cpf = ?
      ORDER BY (n.numero+0) ASC, n.numero ASC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $cpf);
    $stmt->execute();
    $result = $stmt->get_result();

    $numeros = [];
    $nome_cliente = "";
    $cpf_formatado = "";
    
    while ($row = $result->fetch_assoc()) {
        // Captura o nome do cliente (será o mesmo para todos os registros)
        if (empty($nome_cliente)) {
            $nome_cliente = trim($row["nome"]);
            // Formata o CPF para exibição
            $cpf_formatado = preg_replace("/(\d{3})(\d{3})(\d{3})(\d{2})/", "$1.$2.$3-$4", $row["cpf"]);
        }
        
        // Adiciona o número à lista
        $numero_limpo = trim($row["numero"]);
        if ($numero_limpo !== null && $numero_limpo !== "") {
            $numeros[] = $numero_limpo;
        }
    }

    $response_data = [];
    // Verifica se encontrou algum resultado
    if (empty($numeros)) {
        $response_data = [
            "success" => false, 
            "message" => "Nenhum número encontrado para o CPF informado."
        ];
    } else {
        $response_data = [
            "success" => true,
            "nome" => $nome_cliente,
            "cpf" => $cpf_formatado,
            "cpf_original" => $cpf,
            "numeros" => $numeros,
            "total_numeros" => count($numeros)
        ];
    }

    // --- Salva o resultado no cache antes de enviar a resposta ---
    file_put_contents($cache_file, json_encode($response_data));
    // --------------------------------------------------------------

    echo json_encode($response_data);

    $stmt->close();
    $conn->close();
} catch (mysqli_sql_exception $e) {
    // Em produção, não exiba $e->getMessage() cru — aqui retorno genérico
    echo json_encode(["success" => false, "message" => "Erro ao buscar números."]);
    // opcional: registrar/logar $e->getMessage() em arquivo de log
    error_log("Erro na busca de números: " . $e->getMessage());
}
?>
