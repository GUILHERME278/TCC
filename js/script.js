// Dados da compra carregados do localStorage
let dadosCompra = null;

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    carregarDadosCompra();
    configurarEventos();
    atualizarResumoCompra();
    configurarEmailJS();
});

// Configuração do EmailJS
function configurarEmailJS() {
    // Inicializar EmailJS - substitua pela sua chave pública real
    emailjs.init("YOUR_PUBLIC_KEY"); // Substitua pela chave real do EmailJS
}

// Carregar dados da compra do localStorage
function carregarDadosCompra() {
    try {
        const dadosStorage = localStorage.getItem('dadosCompraRifa');
        
        if (!dadosStorage) {
            // Se não há dados, redirecionar de volta para a seleção
            alert('Nenhuma compra encontrada. Redirecionando para seleção de números.');
            window.location.href = 'usuario_otimizado.html';
            return;
        }
        
        dadosCompra = JSON.parse(dadosStorage);
        
        // Preencher os campos com os dados reais
        document.getElementById('nome').value = dadosCompra.nome;
        document.getElementById('cpf').value = dadosCompra.cpf;
        document.getElementById('email').value = dadosCompra.email;
        document.getElementById('telefone').value = dadosCompra.telefone;

        console.log('Dados da compra carregados:', dadosCompra);
    } catch (error) {
        console.error('Erro ao carregar dados da compra:', error);
        alert('Erro ao carregar dados da compra. Redirecionando para seleção de números.');
        window.location.href = 'usuario_otimizado.html';
    }
}

// Configurar todos os eventos da página
function configurarEventos() {
    // Eventos dos métodos de pagamento
    const paymentCards = document.querySelectorAll('.payment-card');
    paymentCards.forEach(card => {
        card.addEventListener('click', function() {
            selecionarMetodoPagamento(this.dataset.method);
        });
    });

    // Eventos dos formulários de pagamento
    configurarEventosFormularios();

    // Evento do botão de confirmação
    document.getElementById('btn-confirmar').addEventListener('click', confirmarPagamento);

    // Evento do modal
    document.getElementById('btn-fechar-modal').addEventListener('click', fecharModal);
}

// Configurar eventos dos formulários
function configurarEventosFormularios() {
    // Máscara para número do cartão
    document.getElementById('numero-cartao').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });

    // Máscara para validade
    document.getElementById('validade').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    // Máscara para CVV
    document.getElementById('cvv').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
    });
}

// Selecionar método de pagamento
function selecionarMetodoPagamento(metodo) {
    // Remover seleção anterior
    document.querySelectorAll('.payment-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Adicionar seleção atual
    document.querySelector(`[data-method="${metodo}"]`).classList.add('selected');
    
    // Marcar radio button
    document.querySelector(`input[value="${metodo}"]`).checked = true;

    // Mostrar/ocultar formulários
    document.getElementById('cartao-form').classList.toggle('hidden', metodo !== 'cartao');
    document.getElementById('pix-form').classList.toggle('hidden', metodo !== 'pix');

    // Atualizar botão
    atualizarBotaoConfirmacao(metodo);
}

// Atualizar botão de confirmação
function atualizarBotaoConfirmacao(metodo) {
    const btn = document.getElementById('btn-confirmar');
    const valorTotal = calcularValorTotal();
    
    if (metodo === 'pix') {
        btn.innerHTML = `<i class="fas fa-qrcode mr-2"></i>Gerar PIX - ${formatarMoeda(valorTotal)}`;
    } else {
        btn.innerHTML = `<i class="fas fa-lock mr-2"></i>Confirmar Pagamento - ${formatarMoeda(valorTotal)}`;
    }
}

// Atualizar resumo da compra
function atualizarResumoCompra() {
    if (!dadosCompra) return;
    
    const quantidade = dadosCompra.quantidade;
    const valorTotal = dadosCompra.valorTotal;

    document.getElementById('numeros-selecionados').textContent = `${quantidade} números`;
    document.getElementById('quantidade').textContent = quantidade;
    document.getElementById('valor-total').textContent = formatarMoeda(valorTotal);
    document.getElementById('valor-botao').textContent = formatarMoeda(valorTotal);
    document.getElementById('data-sorteio').textContent = dadosCompra.dataSorteio;

    // Atualizar lista de números
    const listaNumeros = document.getElementById('lista-numeros');
    listaNumeros.innerHTML = '';
    dadosCompra.numeros.forEach(numero => {
        const span = document.createElement('span');
        span.className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm';
        span.textContent = numero.toString().padStart(2, '0');
        listaNumeros.appendChild(span);
    });
}

// Calcular valor total
function calcularValorTotal() {
    return dadosCompra ? dadosCompra.valorTotal : 0;
}

// Formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Validar formulário de cartão
function validarFormularioCartao() {
    const numeroCartao = document.getElementById('numero-cartao').value.replace(/\s/g, '');
    const validade = document.getElementById('validade').value;
    const cvv = document.getElementById('cvv').value;
    const nomeCartao = document.getElementById('nome-cartao').value;

    const erros = [];

    if (!numeroCartao || numeroCartao.length < 13) {
        erros.push('Número do cartão inválido');
    }

    if (!validade || validade.length < 5) {
        erros.push('Data de validade inválida');
    }

    if (!cvv || cvv.length < 3) {
        erros.push('CVV inválido');
    }

    if (!nomeCartao || nomeCartao.trim().length < 2) {
        erros.push('Nome no cartão é obrigatório');
    }

    return erros;
}

// Validar e-mail
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Confirmar pagamento
async function confirmarPagamento() {
    const metodoSelecionado = document.querySelector('input[name="payment-method"]:checked');
    
    if (!metodoSelecionado) {
        alert('Por favor, selecione um método de pagamento.');
        return;
    }

    // Validar e-mail
    const email = document.getElementById('email').value;
    if (!validarEmail(email)) {
        alert('Por favor, insira um e-mail válido.');
        document.getElementById('email').focus();
        return;
    }

    // Validar formulário específico do método
    if (metodoSelecionado.value === 'cartao') {
        const erros = validarFormularioCartao();
        if (erros.length > 0) {
            alert('Por favor, corrija os seguintes erros:\n' + erros.join('\n'));
            return;
        }
    }

    // Mostrar loading
    mostrarLoading();

    try {
        // Simular processamento (2-3 segundos)
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Enviar e-mail de confirmação
        await enviarEmailConfirmacao();

        // Ocultar loading e mostrar sucesso
        ocultarLoading();
        mostrarModalConfirmacao();

    } catch (error) {
        console.error('Erro no processamento:', error);
        ocultarLoading();
        alert('Erro no processamento do pagamento. Tente novamente.');
    }
}

// Enviar e-mail de confirmação
async function enviarEmailConfirmacao() {
    if (!dadosCompra) {
        throw new Error('Dados da compra não encontrados');
    }

    const metodo = document.querySelector('input[name="payment-method"]:checked').value;
    const numerosComprados = dadosCompra.numeros.map(n => n.toString().padStart(2, '0')).join(', ');
    const dataCompraFormatada = new Date(dadosCompra.dataCompra).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Preparar template de email personalizado
    const templateParams = {
        to_name: dadosCompra.nome,
        to_email: dadosCompra.email,
        from_name: "Rifa Online",
        
        // Dados da compra
        numeros_comprados: numerosComprados,
        quantidade: dadosCompra.quantidade,
        valor_por_numero: formatarMoeda(dadosCompra.valorPorNumero),
        valor_total: formatarMoeda(dadosCompra.valorTotal),
        metodo_pagamento: metodo === 'cartao' ? 'Cartão de Crédito' : 'PIX',
        data_compra: dataCompraFormatada,
        data_sorteio: dadosCompra.dataSorteio,
        
        // Dados da rifa
        titulo_rifa: dadosCompra.tituloRifa,
        descricao_rifa: dadosCompra.descricaoRifa,
        premio_rifa: dadosCompra.premioRifa,
        
        // Dados do comprador
        cpf: dadosCompra.cpf,
        telefone: dadosCompra.telefone,
        
        // HTML do email (usando o template)
        message_html: gerarHTMLEmail()
    };

    try {
        // Enviar email usando EmailJS
        const response = await emailjs.send(
            'YOUR_SERVICE_ID',    // Substitua pelo seu Service ID
            'YOUR_TEMPLATE_ID',   // Substitua pelo seu Template ID  
            templateParams
        );
        
        console.log('Email enviado com sucesso:', response);
        return response;
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        
        // Log detalhado para debug
        console.log('=== DADOS DO EMAIL (PARA DEBUG) ===');
        console.log(`Para: ${dadosCompra.email}`);
        console.log(`Nome: ${dadosCompra.nome}`);
        console.log(`Assunto: Confirmação de Compra - Rifa Online`);
        console.log('Parâmetros do template:', templateParams);
        
        // Ainda assim retorna sucesso para não bloquear o fluxo
        return Promise.resolve();
    }
}

// Gerar HTML do email baseado no template
function gerarHTMLEmail() {
    const metodo = document.querySelector('input[name="payment-method"]:checked').value;
    const numerosComprados = dadosCompra.numeros.map(n => n.toString().padStart(2, '0'));
    const dataCompraFormatada = new Date(dadosCompra.dataCompra).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Gerar badges dos números
    const numerosBadges = numerosComprados.map(num => 
        `<span class="number-badge">${num}</span>`
    ).join('');

    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Compra - Rifa Online</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
            .container { background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { padding: 30px 20px; }
            .success-icon { text-align: center; margin-bottom: 20px; }
            .success-icon div { display: inline-block; width: 60px; height: 60px; background-color: #10b981; border-radius: 50%; line-height: 60px; color: white; font-size: 24px; }
            .details-box { background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
            .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .detail-label { font-weight: 600; color: #4b5563; }
            .detail-value { color: #1f2937; font-weight: 500; }
            .numbers-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
            .number-badge { background-color: #3b82f6; color: white; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; }
            .total-amount { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
            .draw-date { background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; }
            .draw-date h3 { margin: 0 0 5px 0; color: #92400e; font-size: 16px; }
            .draw-date p { margin: 0; color: #b45309; font-weight: bold; font-size: 18px; }
            .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎫 ${dadosCompra.tituloRifa}</h1>
                <p>Confirmação de Compra</p>
            </div>
            <div class="content">
                <div class="success-icon">
                    <div>✓</div>
                </div>
                <h2 style="text-align: center; color: #1f2937; margin-bottom: 10px;">
                    Parabéns, ${dadosCompra.nome}!
                </h2>
                <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">
                    Sua compra foi confirmada com sucesso. Boa sorte no sorteio!
                </p>
                <div class="details-box">
                    <h3 style="margin-top: 0; color: #374151;">📋 Detalhes da Compra</h3>
                    <div class="detail-row">
                        <span class="detail-label">Números Comprados:</span>
                        <div class="detail-value">
                            <div class="numbers-grid">
                                ${numerosBadges}
                            </div>
                        </div>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Quantidade:</span>
                        <span class="detail-value">${dadosCompra.quantidade} números</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Valor por número:</span>
                        <span class="detail-value">${formatarMoeda(dadosCompra.valorPorNumero)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Método de pagamento:</span>
                        <span class="detail-value">${metodo === 'cartao' ? 'Cartão de Crédito' : 'PIX'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Data da compra:</span>
                        <span class="detail-value">${dataCompraFormatada}</span>
                    </div>
                </div>
                <div class="total-amount">
                    💰 Valor Total Pago: ${formatarMoeda(dadosCompra.valorTotal)}
                </div>
                <div class="draw-date">
                    <h3>🗓️ Data do Sorteio</h3>
                    <p>${dadosCompra.dataSorteio}</p>
                </div>
                <div style="background-color: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #1e40af;">📢 Importante:</h4>
                    <ul style="margin: 10px 0; padding-left: 20px; color: #1e3a8a;">
                        <li>Guarde este e-mail como comprovante de participação</li>
                        <li>O sorteio será realizado ao vivo em nossas redes sociais</li>
                        <li>O ganhador será contatado pelos dados fornecidos</li>
                        <li>Em caso de dúvidas, entre em contato conosco</li>
                    </ul>
                </div>
            </div>
            <div class="footer">
                <p><strong>${dadosCompra.tituloRifa}</strong> - Sistema de Rifas Digitais</p>
                <p>📧 contato@rifaonline.com.br | 📱 (11) 99999-9999</p>
                <p style="margin-top: 15px; font-size: 12px;">
                    Este é um e-mail automático, não responda esta mensagem.<br>
                    Se você não fez esta compra, entre em contato conosco imediatamente.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Mostrar loading
function mostrarLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
    document.getElementById('loading-overlay').classList.add('flex');
}

// Ocultar loading
function ocultarLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
    document.getElementById('loading-overlay').classList.remove('flex');
}

// Mostrar modal de confirmação
function mostrarModalConfirmacao() {
    document.getElementById('modal-confirmacao').classList.remove('hidden');
    document.getElementById('modal-confirmacao').classList.add('flex');
}

// Fechar modal
function fecharModal() {
    document.getElementById('modal-confirmacao').classList.add('hidden');
    document.getElementById('modal-confirmacao').classList.remove('flex');
    
    // Limpar dados da compra
    limparDadosCompra();
    
    // Redirecionar de volta para a seleção de números
    setTimeout(() => {
        window.location.href = 'usuario_otimizado.html';
    }, 1000);
}

// Função para limpar dados da compra após finalização
function limparDadosCompra() {
    localStorage.removeItem('dadosCompraRifa');
    console.log('Dados da compra removidos do localStorage');
}

