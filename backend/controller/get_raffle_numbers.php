
<?php
include 'conexão.php';
$numbers_status = [];

// Busca todos os números da rifa (assumindo que você tem uma forma de saber o total de números, talvez da config)
// Por simplicidade, vamos assumir que você tem uma tabela 'todos_numeros_rifa' ou que pode gerar de 1 ao totalNumbers
// Para este exemplo, vamos simular que temos 2000 números no total (vindo da sua config)
$config_total_numbers = 2000; // Isso deveria vir de uma configuração do banco de dados ou do seu JS

// Busca os números que já foram vendidos
$sql_sold = "SELECT numero FROM numeros";
$result_sold = $conn->query($sql_sold);

$sold_numbers = [];
if ($result_sold->num_rows > 0) {
    while($row = $result_sold->fetch_assoc()) {
        $sold_numbers[] = (int)$row['numero'];
    }
}

// Preenche o status de todos os números
for ($i = 1; $i <= $config_total_numbers; $i++) {
    $numbers_status[] = [
        'number' => $i,
        'is_sold' => in_array($i, $sold_numbers)
    ];
}

echo json_encode(['success' => true, 'numbers' => $numbers_status]);

$conn->close();
?>