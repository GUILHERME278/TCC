<?php
require_once "conexão.php"; // mesma pasta

// Captura JSON enviado pelo fetch
$input = json_decode(file_get_contents("php://input"), true);

if (isset($input["cpf"])) {
    $cpf_recebido = $input["cpf"]; // CPF vem descriptografado do frontend
    
    // LOG: CPF recebido do frontend
    error_log("DEBUG: CPF recebido do frontend (descriptografado): " . $cpf_recebido);

    // Criptografa o CPF para buscar no banco de dados
    // IMPORTANTE: A função encrypt_data() gera um IV aleatório, o que significa que
    // o mesmo CPF descriptografado resultará em um CPF criptografado diferente a cada vez.
    // Para buscar no banco, precisamos comparar o CPF descriptografado com os CPFs descriptografados do banco.
    // Ou, se o CPF no banco foi armazenado com um IV fixo ou derivado, precisamos replicar isso.
    // Por enquanto, vamos tentar buscar pelo CPF descriptografado diretamente se possível, ou ajustar a lógica.
    
    // Para fins de depuração, vamos tentar criptografar e ver o resultado.
    $cpf_criptografado_para_busca = encrypt_data($cpf_recebido);
    error_log("DEBUG: CPF criptografado para busca (gerado agora): " . $cpf_criptografado_para_busca);

    // A abordagem correta é descriptografar todos os CPFs do banco e comparar com o CPF recebido.
    // Isso é ineficiente para grandes volumes, mas necessário se o IV é aleatório.
    // Alternativamente, se o IV for armazenado junto com o CPF, podemos usá-lo para descriptografar.
    // Pelo que vi no cadastro.php, o IV é gerado aleatoriamente e armazenado junto com o dado criptografado.
    // Portanto, a busca direta por um CPF criptografado gerado na hora NÃO VAI FUNCIONAR.
    // Precisamos buscar todos os CPFs criptografados, descriptografá-los e comparar.

    // Vamos modificar a lógica para buscar todos os CPFs criptografados e descriptografar para comparação.
    try {
        if (isset($conn) && $conn instanceof mysqli) {
            // Usando MySQLi
            $conn->begin_transaction();

            // 1. Buscar todos os CPFs criptografados dos clientes
            $stmt_select_cpfs = $conn->prepare("SELECT cpf FROM clientes");
            $stmt_select_cpfs->execute();
            $result_cpfs = $stmt_select_cpfs->get_result();
            $found_encrypted_cpf = null;

            while ($row = $result_cpfs->fetch_assoc()) {
                $db_encrypted_cpf = $row["cpf"];
                $db_decrypted_cpf = decrypt_data($db_encrypted_cpf);
                
                error_log("DEBUG: CPF do banco (criptografado): " . $db_encrypted_cpf . " -> Descriptografado: " . $db_decrypted_cpf);

                if ($db_decrypted_cpf === $cpf_recebido) {
                    $found_encrypted_cpf = $db_encrypted_cpf;
                    error_log("DEBUG: CPF correspondente encontrado no banco: " . $found_encrypted_cpf);
                    break;
                }
            }
            $stmt_select_cpfs->close();

            if ($found_encrypted_cpf) {
                // Exclui primeiro os números vinculados
                $stmt_numeros = $conn->prepare("DELETE FROM numeros WHERE cpf_cliente = ?");
                $stmt_numeros->bind_param("s", $found_encrypted_cpf);
                $stmt_numeros->execute();
                $stmt_numeros->close();

                // Depois exclui o cliente
                $stmt_cliente = $conn->prepare("DELETE FROM clientes WHERE cpf = ?");
                $stmt_cliente->bind_param("s", $found_encrypted_cpf);
                $stmt_cliente->execute();
                
                $rows_affected = $stmt_cliente->affected_rows;
                $stmt_cliente->close();
                
                if ($rows_affected > 0) {
                    $conn->commit();
                    echo json_encode([
                        "success" => true,
                        "message" => "Cliente excluído com sucesso!"
                    ]);
                } else {
                    $conn->rollback();
                    echo json_encode([
                        "success" => false,
                        "message" => "Nenhum cliente encontrado para exclusão (após descriptografia e busca)."
                    ]);
                }
            } else {
                $conn->rollback();
                echo json_encode([
                    "success" => false,
                    "message" => "Nenhum cliente encontrado para exclusão (CPF não corresponde após descriptografia)."
                ]);
            }
            
        } elseif (isset($pdo) && $pdo instanceof PDO) {
            // Usando PDO
            $pdo->beginTransaction();
            
            // 1. Buscar todos os CPFs criptografados dos clientes
            $stmt_select_cpfs = $pdo->prepare("SELECT cpf FROM clientes");
            $stmt_select_cpfs->execute();
            $result_cpfs = $stmt_select_cpfs->fetchAll(PDO::FETCH_ASSOC);
            $found_encrypted_cpf = null;

            foreach ($result_cpfs as $row) {
                $db_encrypted_cpf = $row["cpf"];
                $db_decrypted_cpf = decrypt_data($db_encrypted_cpf);
                
                error_log("DEBUG: CPF do banco (criptografado): " . $db_encrypted_cpf . " -> Descriptografado: " . $db_decrypted_cpf);

                if ($db_decrypted_cpf === $cpf_recebido) {
                    $found_encrypted_cpf = $db_encrypted_cpf;
                    error_log("DEBUG: CPF correspondente encontrado no banco: " . $found_encrypted_cpf);
                    break;
                }
            }

            if ($found_encrypted_cpf) {
                // Exclui primeiro os números vinculados
                $stmt_numeros = $pdo->prepare("DELETE FROM numeros WHERE cpf_cliente = :cpf");
                $stmt_numeros->bindParam(":cpf", $found_encrypted_cpf);
                $stmt_numeros->execute();

                // Depois exclui o cliente
                $stmt_cliente = $pdo->prepare("DELETE FROM clientes WHERE cpf = :cpf");
                $stmt_cliente->bindParam(":cpf", $found_encrypted_cpf);
                $stmt_cliente->execute();

                if ($stmt_cliente->rowCount() > 0) {
                    $pdo->commit();
                    echo json_encode([
                        "success" => true,
                        "message" => "Cliente excluído com sucesso!"
                    ]);
                } else {
                    $pdo->rollback();
                    echo json_encode([
                        "success" => false,
                        "message" => "Nenhum cliente encontrado para exclusão (após descriptografia e busca)."
                    ]);
                }
            } else {
                $pdo->rollback();
                echo json_encode([
                    "success" => false,
                    "message" => "Nenhum cliente encontrado para exclusão (CPF não corresponde após descriptografia)."
                ]);
            }
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Erro: Conexão com banco de dados não encontrada."
            ]);
        }
        
    } catch (Exception $e) {
        // Rollback da transação em caso de erro
        if (isset($conn) && $conn instanceof mysqli) {
            $conn->rollback();
        } elseif (isset($pdo) && $pdo instanceof PDO) {
            $pdo->rollback();
        }
        
        echo json_encode([
            "success" => false,
            "message" => "Erro no banco: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "CPF não informado."
    ]);
}
?>

