

// NOVA FUNCIONALIDADE: Configurações padrão da rifa (fallback)
const defaultRaffleConfig = {
    title: "Rifa Beneficente",
    description: "Ajude nossa causa e concorra a prêmios incríveis!",
    prize: "Smartphone Novo",
    totalNumbers: 1000,
    pricePerNumber: 5,
    maxPerPerson: 10,
    image: "./img/carro-completo.jpeg"
};

// NOVA FUNCIONALIDADE: Função para carregar configurações do Local Storage
function loadRaffleConfig() {
    const savedConfig = localStorage.getItem("raffleConfig");
    if (savedConfig) {
        try {
            return JSON.parse(savedConfig);
        } catch (e) {
            console.error("Erro ao carregar configurações:", e);
            return defaultRaffleConfig;
        }
    }
    return defaultRaffleConfig;
}

// Variáveis globais que serão atualizadas dinamicamente
let PRECO_POR_NUMERO;
let TOTAL_NUMEROS;
let MAX_POR_PESSOA;
let TOTAL_PAGINAS;
let paginaAtual = 0;
// ... (outras variáveis globais) ...

// Array para armazenar números selecionados globalmente
let numerosSelecionados = new Set();

// >>> ADICIONE ESTA NOVA VARIÁVEL <<<
// Set para rastrear todos os números que já estão no carrinho
let numerosNoCarrinho = new Set(); 


// NOVA FUNCIONALIDADE: Variável para armazenar a configuração atual (para comparação)
let configAtualCache = null;

// NOVA FUNCIONALIDADE: Função otimizada para aplicar apenas mudanças específicas
function applyRaffleConfigOptimized(forceUpdate = false) {
    const config = loadRaffleConfig();
    
    // Se é a primeira vez ou forçado, aplica tudo
    if (!configAtualCache || forceUpdate) {
        applyFullRaffleConfig(config);
        configAtualCache = { ...config };
        return;
    }
    
    let needsGridUpdate = false;
    let needsDotsUpdate = false;
    
    // Verifica mudanças específicas e aplica apenas o necessário
    
    // 1. Atualiza título se mudou
    if (config.title !== configAtualCache.title) {
        const titleElement = document.querySelector("h2");
        if (titleElement) {
            titleElement.textContent = config.title;
        }
    }
    
    // 2. Atualiza descrição se mudou
    if (config.description !== configAtualCache.description) {
        const descriptionElement = document.querySelector("p");
        if (descriptionElement) {
            descriptionElement.textContent = config.description;
        }
    }
    
    // 3. Atualiza informações de prêmio e valores se mudaram
    if (config.prize !== configAtualCache.prize ||
        config.totalNumbers !== configAtualCache.totalNumbers ||
        config.pricePerNumber !== configAtualCache.pricePerNumber ||
        config.maxPerPerson !== configAtualCache.maxPerPerson) {
        
        const prizeElements = document.querySelectorAll("p");
        prizeElements.forEach(el => {
            if (el.textContent.includes("Prêmio:")) {
                el.innerHTML = `🎁 Prêmio: ${config.prize}`;
            }
            if (el.textContent.includes("Total de números:")) {
                el.innerHTML = `📊 Total de números: ${config.totalNumbers}`;
            }
            if (el.textContent.includes("Valor por número:")) {
                el.innerHTML = `💰 Valor por número: R$ ${config.pricePerNumber.toFixed(2)}`;
            }
            if (el.textContent.includes("Máximo por pessoa:")) {
                el.innerHTML = `👤 Máximo por pessoa: ${config.maxPerPerson} números`;
            }
        });
    }
    
    // 4. Atualiza imagem se mudou
    if (config.image !== configAtualCache.image) {
        const imageElement = document.querySelector("img[alt=\"Imagem da rifa\"]");
        if (imageElement && config.image) {
            imageElement.src = config.image;
        }
    }
    
    // 5. Verifica se precisa atualizar variáveis globais e grid
    if (config.totalNumbers !== configAtualCache.totalNumbers) {
        TOTAL_NUMEROS = config.totalNumbers;
        TOTAL_PAGINAS = Math.ceil(TOTAL_NUMEROS / NUMEROS_POR_PAGINA);
        needsGridUpdate = true;
        needsDotsUpdate = true;
        
        // Se o total de números mudou, pode precisar ajustar a página atual
        if (paginaAtual >= TOTAL_PAGINAS) {
            paginaAtual = TOTAL_PAGINAS - 1;
        }
    }
    
    if (config.pricePerNumber !== configAtualCache.pricePerNumber) {
        PRECO_POR_NUMERO = config.pricePerNumber;
        // Atualiza o preço da seleção atual sem re-renderizar o grid
        VerificaNumero();
    }
    
    if (config.maxPerPerson !== configAtualCache.maxPerPerson) {
        MAX_POR_PESSOA = config.maxPerPerson;
    }
    
    // 6. Aplica atualizações necessárias apenas se realmente precisar
    if (needsGridUpdate) {
        renderizarPagina(paginaAtual);
    }
    
    if (needsDotsUpdate) {
        gerarDots();
        atualizarSetas();
    }
    
    // Atualiza o cache
    configAtualCache = { ...config };
    
    console.log("Configurações aplicadas (otimizado):", config);
}

// NOVA FUNCIONALIDADE: Função para aplicar configurações completas (primeira vez)
function applyFullRaffleConfig(config) {
    // Atualiza título da rifa
    const titleElement = document.querySelector("h2");
    if (titleElement) {
        titleElement.textContent = config.title;
    }
    
    // Atualiza descrição
    const descriptionElement = document.querySelector("p");
    if (descriptionElement) {
        descriptionElement.textContent = config.description;
    }
    
    // Atualiza prêmio e outras informações
    const prizeElements = document.querySelectorAll("p");
    prizeElements.forEach(el => {
        if (el.textContent.includes("Prêmio:")) {
            el.innerHTML = `🎁 Prêmio: ${config.prize}`;
        }
        if (el.textContent.includes("Total de números:")) {
            el.innerHTML = `📊 Total de números: ${config.totalNumbers}`;
        }
        if (el.textContent.includes("Valor por número:")) {
            el.innerHTML = `💰 Valor por número: R$ ${config.pricePerNumber.toFixed(2)}`;
        }
        if (el.textContent.includes("Máximo por pessoa:")) {
            el.innerHTML = `👤 Máximo por pessoa: ${config.maxPerPerson} números`;
        }
    });
    
    // Atualiza imagem se houver
    const imageElement = document.querySelector("img[alt=\"Imagem da rifa\"]");
    if (imageElement && config.image) {
        imageElement.src = config.image;
    }
    
    // Atualiza variáveis globais
    PRECO_POR_NUMERO = config.pricePerNumber;
    TOTAL_NUMEROS = config.totalNumbers;
    MAX_POR_PESSOA = config.maxPerPerson;
    TOTAL_PAGINAS = Math.ceil(TOTAL_NUMEROS / NUMEROS_POR_PAGINA);

    console.log("Configurações aplicadas (completo):", config);

    // Renderiza a página e elementos relacionados
    renderizarPagina(paginaAtual);
    gerarDots();
    atualizarSetas();
    VerificaNumero();
}

// Constantes principais
const PainelNumero = document.getElementById("numbers-grid");
const botao = document.getElementById("add-to-cart");
const preco = document.getElementById("total-price");
const ListaDeItens = document.getElementById("cart-items");
const LimparSelecao = document.getElementById("clear-selection");
const inputNome = document.getElementById("buyer-name");
const InputCpf = document.getElementById("buyer-cpf");
const InputPhone = document.getElementById("buyer-phone");
const InputEmail = document.getElementById("buyer-email");
const EndCompra = document.getElementById("checkout-btn");
const totalCarrinho = document.getElementById("cart-total");
const NUMEROS_POR_PAGINA = 100;
const menuDots = document.querySelector(".menu") || document.querySelector(".menu-small");

// Array para armazenar números selecionados globalmente
let numerosselecionados = new Set();

// Função para salvar seleção atual antes de trocar de página
function salvarSelecaoAtual() {
    const selecionadosNaPagina = document.querySelectorAll(".number-item.selected");
    selecionadosNaPagina.forEach(elemento => {
        const numero = parseInt(elemento.textContent);
        numerosSelecionados.add(numero);
    });
}

// Função para restaurar seleção na página atual
function restaurarSelecaoNaPagina() {
    const numerosNaPagina = document.querySelectorAll(".number-item");
    numerosNaPagina.forEach(elemento => {
        const numero = parseInt(elemento.textContent);
        if (numerosSelecionados.has(numero)) {
            elemento.classList.add("selected");
        }
    });
    
    atualizarEstadoBotoes();
    VerificaNumero();
}

// Função para atualizar estado dos botões baseado na seleção global
function atualizarEstadoBotoes() {
    const algumSelecionado = numerosSelecionados.size > 0;
    botao.disabled = !algumSelecionado;
    LimparSelecao.disabled = !algumSelecionado;
}

// Função para gerar os dots de navegação
function gerarDots() {
    menuDots.innerHTML = "";

    for (let i = 0; i < TOTAL_PAGINAS; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        dot.setAttribute("data-page", i);
        dot.title = `Página ${i + 1}`;
        
        if (i === paginaAtual) {
            dot.classList.add("active");
        }

        dot.addEventListener("click", () => {
            if (i !== paginaAtual) {
                navegarParaPagina(i);
            }
        });

        menuDots.appendChild(dot);
    }
}

// Função para navegar para uma página específica
function navegarParaPagina(novaPagina) {
    salvarSelecaoAtual();
    
    const paginaAnterior = paginaAtual;
    paginaAtual = novaPagina;
    
    renderizarPagina(paginaAtual);
    atualizarDotsAtivos(paginaAnterior, paginaAtual);
    atualizarSetas();
}

// Função para atualizar os dots ativos com animação
function atualizarDotsAtivos(paginaAnterior, paginaAtual) {
    const todosDots = document.querySelectorAll(".dot");
    
    todosDots.forEach((dot, index) => {
        if (index === paginaAnterior) {
            dot.classList.remove("active");
        }
        
        if (index === paginaAtual) {
            dot.classList.add("active");
            dot.classList.add("dot-bounce");
            
            setTimeout(() => {
                dot.classList.remove("dot-bounce");
            }, 300);
        }
    });
}

// Função para gerar os números da página atual
function renderizarPagina(pagina) {
    // Adiciona animação de fade out
    PainelNumero.style.opacity = "0";
    PainelNumero.style.transform = "translateY(10px)";
    
    setTimeout(() => {
        PainelNumero.innerHTML = "";

        const inicio = pagina * NUMEROS_POR_PAGINA + 1;
        const fim = Math.min(inicio + NUMEROS_POR_PAGINA - 1, TOTAL_NUMEROS);

        for (let i = inicio; i <= fim; i++) {
            const numero = document.createElement("div");
            numero.classList.add("number-item");
            numero.textContent = i;

            numero.addEventListener("click", () => {
                // Verificação de segurança: se o número está vendido, não faz nada.
                if (numero.classList.contains("sold") || numero.classList.contains("in-cart")) {
                    numero.classList.add('shake-animation');
                    setTimeout(() => numero.classList.remove('shake-animation'), 400);
                    return; 
                }
                
                const numeroValue = parseInt(numero.textContent);
                
                if (!numero.classList.contains("selected") && numerosSelecionados.size >= MAX_POR_PESSOA) {
                    alert(`Você pode selecionar no máximo ${MAX_POR_PESSOA} números.`);
                    return;
                }
                
                // Alterna a seleção
                numero.classList.toggle("selected");

                // Atualiza o Set de seleção global
                if (numero.classList.contains("selected")) {
                    numerosSelecionados.add(numeroValue);
                } else {
                    numerosSelecionados.delete(numeroValue);
                }
                
                atualizarEstadoBotoes();
                VerificaNumero();
            });

            PainelNumero.appendChild(numero);
        }

        // >>> ORDEM DE EXECUÇÃO CORRIGIDA <<<
        setTimeout(async () => {
            // 1. PRIMEIRO, busca e marca todos os números vendidos
            await atualizarNumerosComprados(); 

            atualizarStatusNoCarrinho();
            
            // 2. DEPOIS, restaura a seleção dos números que sobraram (disponíveis)
            restaurarSelecaoNaPagina();
            
            // 3. Finalmente, mostra o painel atualizado
            PainelNumero.style.opacity = "1";
            PainelNumero.style.transform = "translateY(0)";
        }, 50);
        
    }, 150);
}



// Atualiza o estado das setas
function atualizarSetas() {
    const prevButton = document.getElementById("prev-numbers");
    const nextButton = document.getElementById("next-numbers");
    
    prevButton.disabled = paginaAtual === 0;
    nextButton.disabled = paginaAtual >= TOTAL_PAGINAS - 1;
    
    if (prevButton.disabled) {
        prevButton.style.opacity = "0.5";
    } else {
        prevButton.style.opacity = "1";
    }
    
    if (nextButton.disabled) {
        nextButton.style.opacity = "0.5";
    } else {
        nextButton.style.opacity = "1";
    }
}

// Event listeners para as setas
const prevButton = document.getElementById("prev-numbers");
const nextButton = document.getElementById("next-numbers");

prevButton.addEventListener("click", () => {
    if (paginaAtual > 0) {
        navegarParaPagina(paginaAtual - 1);
    }
});

nextButton.addEventListener("click", () => {
    if (paginaAtual < TOTAL_PAGINAS - 1) {
        navegarParaPagina(paginaAtual + 1);
    }
});

// Navegação por teclado
document.addEventListener("keydown", (e) => {
    if (document.activeElement.tagName !== "INPUT") {
        if (e.key === "ArrowLeft" && paginaAtual > 0) {
            e.preventDefault();
            navegarParaPagina(paginaAtual - 1);
        } else if (e.key === "ArrowRight" && paginaAtual < TOTAL_PAGINAS - 1) {
            e.preventDefault();
            navegarParaPagina(paginaAtual + 1);
        }
    }
});

// Atualiza o preço total baseado na seleção global
function VerificaNumero() {
    const quantidade = numerosSelecionados.size;
    const PrecoFinal = quantidade * PRECO_POR_NUMERO;
    preco.textContent = PrecoFinal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Função para calcular o total do carrinho
function calcularTotalCarrinho() {
    const itensCarrinho = ListaDeItens.querySelectorAll("tr:not(#empty-cart-row)");
    let total = 0;
    
    itensCarrinho.forEach(item => {
        const numerosText = item.querySelector("td:first-child").textContent;
        const numeros = numerosText.split(",").map(n => n.trim()).filter(n => n !== "");
        total += numeros.length * PRECO_POR_NUMERO;
    });
    
    totalCarrinho.textContent = total.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    return total;
}

// Função para verificar se o carrinho tem itens
function carrinhoTemItens() {
    const itensCarrinho = ListaDeItens.querySelectorAll("tr:not(#empty-cart-row)");
    return itensCarrinho.length > 0;
}

// Validação completa do formulário e carrinho
function validarFormularioCompleto() {
    const formulario = document.querySelector("form"); // ou o seletor correto do seu formulário
    const carrinhoValido = carrinhoTemItens();
    const formularioValido = formulario.checkValidity();

    EndCompra.disabled = !(formularioValido && carrinhoValido);

    if (!carrinhoValido && formularioValido) {
        EndCompra.title = "Adicione números ao carrinho para finalizar a compra";
    } else if (!(formularioValido && carrinhoValido)) {
        EndCompra.title = "Preencha todos os campos obrigatórios e adicione números ao carrinho";
    } else {
        EndCompra.title = "Finalizar compra";
    }

    return formularioValido && carrinhoValido;
}


// Evento para adicionar os itens ao carrinho
botao.addEventListener("click", () => {
    const MsgCarrinhoVazio = document.getElementById("empty-cart-row");
    
    const NumbersArray = Array.from(numerosSelecionados).sort((a, b) => a - b);
    NumbersArray.forEach(num => numerosNoCarrinho.add(parseInt(num)))

    if (NumbersArray.length > 0) {
        MsgCarrinhoVazio.classList.add("hidden");
    }

    const LinhaLista = document.createElement("tr");
    LinhaLista.classList.add("border-b", "border-gray-300");

    const tdNumero = document.createElement("td");
    tdNumero.classList.add("text-center", "font-bold", "text-blue-500", "py-3", "px-5", "border");
    tdNumero.textContent = NumbersArray.join(", ");

    const tdPreco = document.createElement("td");
    tdPreco.classList.add("text-center", "font-semibold", "py-3", "px-5", "border");
    tdPreco.textContent = (NumbersArray.length * PRECO_POR_NUMERO).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    const ExcluirNumero = document.createElement("td");
    ExcluirNumero.classList.add("text-center", "py-3", "px-5", "border");
    const icon = document.createElement("i");
    icon.classList.add("fas", "fa-trash", "red-trash-icon");
    icon.style.cursor = "pointer";
    icon.title = "Remover do carrinho";
    ExcluirNumero.appendChild(icon);

    LinhaLista.appendChild(tdNumero);
    LinhaLista.appendChild(tdPreco);
    LinhaLista.appendChild(ExcluirNumero);
    ListaDeItens.appendChild(LinhaLista);

    icon.addEventListener("click", () => {

        const numerosParaRemover = LinhaLista.querySelector("td:first-child").textContent.split(",").map(n => parseInt(n.trim()));
        
        // Remove esses números do Set de controle do carrinho
        numerosParaRemover.forEach(num => numerosNoCarrinho.delete(num));

        LinhaLista.remove();
        LinhaLista.remove();
        
        const itensRestantes = ListaDeItens.querySelectorAll("tr:not(#empty-cart-row)");
        if (itensRestantes.length === 0) {
            MsgCarrinhoVazio.classList.remove("hidden");
        }
        
        calcularTotalCarrinho();
        validarFormularioCompleto();

        atualizarStatusNoCarrinho();
    });

    numerosSelecionados.clear();
    
    document.querySelectorAll(".number-item.selected").forEach(elemento => {
        elemento.classList.remove("selected");

        atualizarStatusNoCarrinho();
    });
    
    atualizarEstadoBotoes();
    VerificaNumero();
    
    calcularTotalCarrinho();
    validarFormularioCompleto();
});

// Limpa seleção manual
LimparSelecao.addEventListener("click", () => {
    numerosSelecionados.clear();
    
    document.querySelectorAll(".number-item.selected").forEach(num => {
        num.classList.remove("selected");
    });
    
    atualizarEstadoBotoes();
    VerificaNumero();
});

// Modal
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalButton");
const closeModalBtn = document.getElementById("closeModalButton");

openModalBtn?.addEventListener("click", () => {
    modal.classList.remove("hidden");
    calcularTotalCarrinho();
    validarFormularioCompleto();
});

closeModalBtn?.addEventListener("click", () => {
    modal.classList.add("hidden");
});

modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.classList.add("hidden");
});

// Máscaras
function mascaraCPF(campo) {
    let cpf = campo.value.replace(/\D/g, "");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    campo.value = cpf;
    
    validarFormularioCompleto();
}

function mascaraTelefone(campo) {
    let tel = campo.value.replace(/\D/g, "");
    if (tel.length > 11) tel = tel.slice(0, 11);
    let formatado = "";
    if (tel.length > 0) formatado += "(" + tel.substring(0, 2);
    if (tel.length >= 3 && tel.length <= 6) {
        formatado += ") " + tel.substring(2);
    } else if (tel.length >= 7 && tel.length <= 10) {
        formatado += ") " + tel.substring(2, 6) + "-" + tel.substring(6);
    } else if (tel.length === 11) {
        formatado += ") " + tel.substring(2, 7) + "-" + tel.substring(7);
    }
    campo.value = formatado;
    
    validarFormularioCompleto();
}

// Event listeners para validação em tempo real
inputNome.addEventListener("input", validarFormularioCompleto);
InputCpf.addEventListener("input", validarFormularioCompleto);
InputPhone.addEventListener("input", validarFormularioCompleto);
InputEmail.addEventListener("input", validarFormularioCompleto);

// NOVO: Event listener para o botão de finalizar compra com envio para o servidor
EndCompra.addEventListener("click", async () => { // Adicionamos 'async' para usar 'await'
    if (!validarFormularioCompleto()) {
        return; // Se o formulário não for válido, interrompe a execução
    }

    // Desabilita o botão para evitar múltiplos cliques
    EndCompra.disabled = true;
    EndCompra.textContent = "Processando...";

    const total = calcularTotalCarrinho();
    const itensCarrinho = ListaDeItens.querySelectorAll("tr:not(#empty-cart-row)");
    let todosOsNumeros = [];

    itensCarrinho.forEach(item => {
        const numerosText = item.querySelector("td:first-child").textContent;
        const numeros = numerosText.split(",").map(n => n.trim()).filter(n => n !== "");
        todosOsNumeros = todosOsNumeros.concat(numeros);
    });

    // Objeto com os dados a serem enviados
    const dadosCompra = {
        nome: inputNome.value,
        cpf: InputCpf.value,
        telefone: InputPhone.value,
        email: InputEmail.value || "Não informado",
        numeros: todosOsNumeros.join(", "),
        total: total
    };

    try {
        // Usando a API Fetch para enviar os dados para o teste.php
        const response = await fetch('/TCC/backend/controller/cadastro.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosCompra),
        });

        const result = await response.json(); // Supondo que o cadastro.php retorne JSON

        if (result.success) { // Verifica se o cadastro foi bem-sucedido
            alert("Compra realizada com sucesso!");
            limparCarrinho(); // Limpa o formulário e o carrinho

            // >>> ADICIONE A CHAMADA AQUI <<<
            // Atualiza a interface para desabilitar os números recém-comprados
            await atualizarNumerosComprados(); 

        } else {
            alert("Erro ao finalizar a compra: " + (result.message || "Tente novamente."));
        }

    } catch (error) {
        // Em caso de erro na comunicação com o servidor
        console.error('Erro ao enviar dados:', error);
        alert("Ocorreu um erro de comunicação. Tente novamente mais tarde.");
    } finally {
        // Reabilita o botão e restaura o texto original
        EndCompra.disabled = false;
        EndCompra.textContent = "Finalizar Compra";
        validarFormularioCompleto(); // Revalida o estado do botão
    }
});


// Função para limpar o carrinho
function limparCarrinho() {
    const MsgCarrinhoVazio = document.getElementById("empty-cart-row");
    const itensCarrinho = ListaDeItens.querySelectorAll("tr:not(#empty-cart-row)");
    
    itensCarrinho.forEach(item => item.remove());
    
    MsgCarrinhoVazio.classList.remove("hidden");
    
    inputNome.value = "";
    InputCpf.value = "";
    InputPhone.value = "";
    InputEmail.value = "";
    
    numerosNoCarrinho.clear();
    calcularTotalCarrinho();
    validarFormularioCompleto();
    
    modal.classList.add("hidden");
}

// NOVA FUNCIONALIDADE: Função otimizada para verificar atualizações de configuração
function verificarAtualizacoes() {
    const configAtual = loadRaffleConfig();
    
    // Se não há cache ainda, não faz nada (será aplicado na inicialização)
    if (!configAtualCache) {
        return;
    }
    
    // Verifica se houve mudanças comparando com o cache
    const houveMudanca = (
        configAtual.title !== configAtualCache.title ||
        configAtual.description !== configAtualCache.description ||
        configAtual.prize !== configAtualCache.prize ||
        configAtual.pricePerNumber !== configAtualCache.pricePerNumber ||
        configAtual.totalNumbers !== configAtualCache.totalNumbers ||
        configAtual.maxPerPerson !== configAtualCache.maxPerPerson ||
        configAtual.image !== configAtualCache.image
    );
    
    if (houveMudanca) {
        console.log("Configurações atualizadas detectadas, aplicando otimizado...");
        applyRaffleConfigOptimized(); // Aplica apenas as mudanças necessárias
    }
}

function iniciarAtualizacaoAutomaticaDeNumeros() {
    // Chama a função a cada 15 segundos (15000 milissegundos)
    setInterval(async () => {
        console.log("Verificando números comprados em segundo plano...");
        
        // Salva a seleção atual do usuário para não perdê-la durante a atualização
        salvarSelecaoAtual();
        
        // Busca os números mais recentes do servidor e atualiza a interface
        await atualizarNumerosComprados();
        
        // Marca os números que o usuário já tem no carrinho
        atualizarStatusNoCarrinho();

        // Restaura a seleção do usuário nos números que ainda estão disponíveis
        restaurarSelecaoNaPagina();

    }, 15000); // Intervalo de 15 segundos
}

// NOVA FUNCIONALIDADE: Verifica atualizações a cada 5 segundos
setInterval(verificarAtualizacoes, 5000);

// Inicialização da página
function inicializar() {
    // Aplica configurações do Local Storage (primeira vez - completo)
    applyRaffleConfigOptimized(true);
    
    // Gera os dots de navegação
    gerarDots();
    
    // Renderiza a primeira página
    renderizarPagina(paginaAtual);
    
    // Atualiza as setas
    atualizarSetas();
    
    // Adiciona transição suave ao grid de números
    PainelNumero.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    
    // Inicializa o total do carrinho
    calcularTotalCarrinho();
    
    // Valida o formulário inicialmente
    validarFormularioCompleto();

     atualizarNumerosComprados();

     iniciarAtualizacaoAutomaticaDeNumeros(); 
}

// Executa a inicialização quando o DOM estiver carregado
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
} else {
    inicializar();
}

const AbrirComprados = document.getElementById("openPurchasedNumbersModal");
const NumerosComprados = document.getElementById("purchasedNumbersModal")
const FecharComprados = document.getElementById("closePurchasedNumbersModal");

AbrirComprados.addEventListener("click", () => {
    NumerosComprados.classList.remove("hidden");
});

FecharComprados.addEventListener("click", () => {
    NumerosComprados.classList.add("hidden");
});




// Funcionalidade de busca de números comprados por CPF
const searchCPFInput = document.getElementById('searchCPF');
const searchButton = document.getElementById('searchButton');
const purchasedNumbersResults = document.getElementById('purchasedNumbersResults');

searchButton.addEventListener('click', async () => {
    const cpf = searchCPFInput.value.trim();

    if (!cpf) {
        purchasedNumbersResults.innerHTML = '<div class="text-center text-red-500 italic py-8">Por favor, digite um CPF.</div>';
        return;
    }

    // Limpa resultados anteriores e mostra mensagem de carregamento
    purchasedNumbersResults.innerHTML = '<div class="text-center text-gray-500 italic py-8"><i class="fas fa-spinner fa-spin mr-2"></i>Buscando números...</div>';

    try {
        const response = await fetch('/TCC/backend/controller/busca.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cpf: cpf })
        });

        const data = await response.json();

        if (data.success) {
            if (data.numeros && data.numeros.length > 0) {
                const numerosFormatados = data.numeros.map(num => `<span class="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full m-1">${num}</span>`).join('');
                purchasedNumbersResults.innerHTML = `
                    <h4 class="text-lg font-semibold mb-2">Números encontrados para ${data.cpf}:</h4>
                    <div class="flex flex-wrap justify-center p-4 border rounded-md bg-gray-50">
                        ${numerosFormatados}
                    </div>
                `;
            } else {
                purchasedNumbersResults.innerHTML = '<div class="text-center text-gray-500 italic py-8">Nenhum número encontrado para o CPF informado.</div>';
            }
        } else {
            purchasedNumbersResults.innerHTML = `<div class="text-center text-red-500 italic py-8">Erro: ${data.message || 'Não foi possível buscar os números.'}</div>`;
        }
    } catch (error) {
        console.error('Erro ao buscar números:', error);
        purchasedNumbersResults.innerHTML = '<div class="text-center text-red-500 italic py-8">Erro na comunicação com o servidor. Tente novamente mais tarde.</div>';
    }
});

// Abre e fecha o modal de números comprados
const purchasedNumbersModal = document.getElementById('purchasedNumbersModal');
const openPurchasedNumbersModalBtn = document.getElementById('openPurchasedNumbersModal');
const closePurchasedNumbersModalBtn = document.getElementById('closePurchasedNumbersModal');

openPurchasedNumbersModalBtn.addEventListener('click', () => {
    purchasedNumbersModal.classList.remove('hidden');
    purchasedNumbersModal.classList.add('flex');
});

closePurchasedNumbersModalBtn.addEventListener('click', () => {
    purchasedNumbersModal.classList.add('hidden');
    purchasedNumbersModal.classList.remove('flex');
});

// Fecha o modal ao clicar fora dele
window.addEventListener('click', (event) => {
    if (event.target === purchasedNumbersModal) {
        purchasedNumbersModal.classList.add('hidden');
        purchasedNumbersModal.classList.remove('flex');
    }
});

// Máscara de CPF para o input de busca
function mascaraCPF(input) {
    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    if (value.length > 11) {
        value = value.substring(0, 11);
    }
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = value;
}

// Aplica a máscara de CPF ao carregar a página, caso o input já tenha valor
document.addEventListener('DOMContentLoaded', () => {
    const searchCPFInput = document.getElementById('searchCPF');
    if (searchCPFInput) {
        mascaraCPF(searchCPFInput);
    }
});






// NOVA FUNCIONALIDADE: Elementos para a busca por CPF
const InputCpfBusca = document.getElementById("search-cpf-input");
const BotaoBusca = document.getElementById("search-cpf-button");
const ResultadoBusca = document.getElementById("search-results");

// Função para buscar números por CPF
async function buscarNumerosPorCpf() {
    const cpf = InputCpfBusca.value.trim();

    if (!cpf) {
        alert("Por favor, digite um CPF para buscar.");
        return;
    }

    // Normaliza o CPF (remove caracteres não numéricos)
    const cpfLimpo = cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
        alert("CPF inválido. O CPF deve conter 11 dígitos.");
        return;
    }

    ResultadoBusca.innerHTML = "Buscando...";

    try {
        const response = await fetch("busca.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ cpf: cpfLimpo }),
        });

        const data = await response.json();

        if (data.success) {
            if (data.numeros && data.numeros.length > 0) {
                ResultadoBusca.innerHTML = `Números encontrados para o CPF ${data.cpf}: <strong>${data.numeros.join(", ")}</strong>`;
            } else {
                ResultadoBusca.innerHTML = `Nenhum número encontrado para o CPF ${data.cpf}.`;
            }
        } else {
            ResultadoBusca.innerHTML = `Erro na busca: ${data.message || "Ocorreu um erro desconhecido."}`; 
        }
    } catch (error) {
        console.error("Erro ao buscar números:", error);
        ResultadoBusca.innerHTML = "Erro ao conectar com o servidor de busca.";
    }
}

// Event Listener para o botão de busca
if (BotaoBusca) {
    BotaoBusca.addEventListener("click", buscarNumerosPorCpf);
}

// Event Listener para permitir busca ao pressionar Enter no campo CPF
if (InputCpfBusca) {
    InputCpfBusca.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            buscarNumerosPorCpf();
        }
    });
}

// NOVA FUNÇÃO: Busca números já comprados e os desabilita na interface
async function atualizarNumerosComprados() {
    try {
        // Faz a requisição para o novo script PHP
        const response = await fetch('/TCC/backend/controller/BuscarComprados.php');
        const data = await response.json();

        if (data.success && data.numeros) {
            // Converte a lista de números para um Set para busca rápida
            const numerosVendidos = new Set(data.numeros.map(n => parseInt(n)));

            // Seleciona todos os itens de número visíveis na tela
            const todosOsNumerosVisiveis = document.querySelectorAll(".number-item");

            todosOsNumerosVisiveis.forEach(elemento => {
                const numero = parseInt(elemento.textContent);

                // Verifica se o número está na lista de vendidos
                if (numerosVendidos.has(numero)) {
                    elemento.classList.add("sold"); // Aplica a classe para desabilitar
                    elemento.classList.remove("selected"); // Garante que não fique selecionado
                    elemento.title = "Este número já foi comprado"; // Adiciona uma dica
                } else {
                    // Garante que números que não estão vendidos não tenham a classe
                    elemento.classList.remove("sold");
                    elemento.title = ""; // Limpa a dica
                }
            });
        }
    } catch (error) {
        console.error('Erro ao buscar ou atualizar números comprados:', error);
    }
}

// >>> ADICIONE ESTA NOVA FUNÇÃO <<<
// Função para marcar os números que já estão no carrinho como desabilitados
function atualizarStatusNoCarrinho() {
    const todosOsNumerosVisiveis = document.querySelectorAll(".number-item");

    todosOsNumerosVisiveis.forEach(elemento => {
        const numero = parseInt(elemento.textContent);

        if (numerosNoCarrinho.has(numero)) {
            elemento.classList.add("in-cart");
            elemento.title = "Este número já está no seu carrinho";
        } else {
            // Garante que a classe seja removida se o item for removido do carrinho
            elemento.classList.remove("in-cart");
        }
    });
}




