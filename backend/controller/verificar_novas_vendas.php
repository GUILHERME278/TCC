<?php
// verificar_novas_vendas.php (Versão Única e Final)

include 'conexão.php';
header('Content-Type: application/json');

// Verifica se o frontend enviou a contagem atual.
// Se não enviou, significa que é a primeira busca.
$is_initial_fetch = !isset($_GET['contagem_atual']);
$contagem_frontend = isset($_GET['contagem_atual']) ? (int)$_GET['contagem_atual'] : 0;

$deve_buscar_dados = false;

if ($is_initial_fetch) {
    // Se é a busca inicial, sempre retorna os dados.
    $deve_buscar_dados = true;
} else {
    // Se não for a busca inicial, verifica se há novos dados.
    $sql_contagem = "SELECT COUNT(DISTINCT cpf) as total FROM clientes;";
    $resultado_contagem = mysqli_query($conexao, $sql_contagem);
    $linha_contagem = mysqli_fetch_assoc($resultado_contagem);
    $contagem_banco = (int)$linha_contagem['total'];

    if ($contagem_banco > $contagem_frontend) {
        $deve_buscar_dados = true;
    }
}

// Se for necessário buscar os dados (seja na inicialização ou por haver novidades)...
if ($deve_buscar_dados) {
    $sql_busca = "
        SELECT 
            c.cpf, c.nome, c.telefone,
            GROUP_CONCAT(n.numero ORDER BY CAST(n.numero AS UNSIGNED) ASC SEPARATOR ',') AS numeros_comprados
        FROM 
            clientes c
        LEFT JOIN 
            numeros n ON c.cpf = n.cpf_cliente
        WHERE
            n.numero IS NOT NULL
        GROUP BY 
            c.cpf, c.nome, c.telefone
        ORDER BY
            c.nome ASC;
    ";
    
    $resultado_busca = mysqli_query($conexao, $sql_busca);
    $vendas = [];
    while ($row = mysqli_fetch_assoc($resultado_busca)) {
        $vendas[] = [
            'id'      => $row['cpf'],
            'name'    => $row['nome'],
            'phone'   => $row['telefone'],
            'numbers' => $row['numeros_comprados'] ? explode(',', $row['numeros_comprados']) : [],
            'status'  => 'pending'
        ];
    }
    // Envia a lista completa de vendas
    echo json_encode(['novos_dados' => true, 'vendas' => $vendas]);
} else {
    // Se não houver novas vendas, informa que não há novidades.
    echo json_encode(['novos_dados' => false]);
}

mysqli_close($conexao);
?>
