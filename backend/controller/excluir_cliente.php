<?php
require_once "conexão.php"; // mesma pasta

// Captura JSON enviado pelo fetch
$input = json_decode(file_get_contents("php://input"), true);

if (isset($input['cpf'])) {
    $cpfCriptografado = $input['cpf'];

    // Usa a função centralizada de descriptografia
    if (function_exists("decrypt_data")) {
        $cpf = open_ssl_decrypt($cpfCriptografado);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Função de criptografia não encontrada no conexão.php"
        ]);
        exit;
    }

    if ($cpf) {
        try {
            // Exclui primeiro os números vinculados
            $sqlNumeros = $pdo->prepare("DELETE FROM numeros WHERE cpf_cliente = :cpf");
            $sqlNumeros->bindParam(":cpf", $cpf);
            $sqlNumeros->execute();

            // Depois exclui o cliente
            $sqlCliente = $pdo->prepare("DELETE FROM clientes WHERE cpf = :cpf");
            $sqlCliente->bindParam(":cpf", $cpf);
            $sqlCliente->execute();

            if ($sqlCliente->rowCount() > 0) {
                echo json_encode([
                    "success" => true,
                    "message" => "Cliente excluído com sucesso!"
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Nenhum cliente encontrado para exclusão."
                ]);
            }
        } catch (PDOException $e) {
            echo json_encode([
                "success" => false,
                "message" => "Erro no banco: " . $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Erro ao descriptografar o CPF."
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "CPF não informado."
    ]);
}
