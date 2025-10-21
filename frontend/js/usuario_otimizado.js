// Configurações padrão da rifa (fallback) - Usadas se não houver configuração salva no Local Storage.
const defaultRaffleConfig = {
    title: "Rifa Beneficente",
    description: "Ajude nossa causa e concorra a prêmios incríveis!",
    prize: "Smartphone Novo",
    totalNumbers: 1000,
    pricePerNumber: 5,
    maxPerPerson: 10,
    image: "./img/carro-completo.jpeg"
};

// Função para carregar as configurações da rifa do Local Storage.
// Se não houver configurações salvas ou houver erro na leitura, retorna as configurações padrão.
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

// Variáveis globais que armazenam os valores da configuração da rifa e o estado da navegação.
let PRECO_POR_NUMERO;
let TOTAL_NUMEROS;
let MAX_POR_PESSOA;
let TOTAL_PAGINAS;
let paginaAtual = 0;

// Set para armazenar os números selecionados pelo usuário na interface.
let numerosSelecionados = new Set();

// Set para rastrear todos os números que já estão no carrinho de compras.
let numerosNoCarrinho = new Set(); 

// Cache da configuração atual da rifa para otimizar as atualizações.
let configAtualCache = null;

// NOVA VARIÁVEL: Controla se o botão "adicionar ao carrinho" já foi usado
let botaoAdicionarJaUsado = false;

// Função otimizada para aplicar as configurações da rifa, atualizando apenas os elementos que mudaram.
// Se 'forceUpdate' for verdadeiro ou for a primeira vez, aplica todas as configurações.
function applyRaffleConfigOptimized(forceUpdate = false) {
    const config = loadRaffleConfig();
    
    // Aplica todas as configurações se for a primeira vez ou se a atualização for forçada.
    if (!configAtualCache || forceUpdate) {
        applyFullRaffleConfig(config);
        configAtualCache = { ...config };
        return;
    }
    
    let needsGridUpdate = false;
    let needsDotsUpdate = false;
    
    // Verifica e aplica mudanças específicas para otimizar a renderização.
    
    // 1. Atualiza o título da rifa se houver mudança.
    if (config.title !== configAtualCache.title) {
        const titleElement = document.querySelector("h2");
        if (titleElement) {
            titleElement.textContent = config.title;
        }
    }
    
    // 2. Atualiza a descrição da rifa se houver mudança.
    if (config.description !== configAtualCache.description) {
        const descriptionElement = document.querySelector("p");
        if (descriptionElement) {
            descriptionElement.textContent = config.description;
        }
    }
    
    // 3. Atualiza informações do prêmio e valores se houver mudança.
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
    
    // 4. Atualiza a imagem da rifa se houver mudança.
    if (config.image !== configAtualCache.image) {
        const imageElement = document.querySelector("img[alt=\"Imagem da rifa\"]");
        if (imageElement && config.image) {
            imageElement.src = config.image;
        }
    }
    
    // 5. Verifica se precisa atualizar variáveis globais e o grid de números.
    if (config.totalNumbers !== configAtualCache.totalNumbers) {
        TOTAL_NUMEROS = config.totalNumbers;
        TOTAL_PAGINAS = Math.ceil(TOTAL_NUMEROS / NUMEROS_POR_PAGINA);
        needsGridUpdate = true;
        needsDotsUpdate = true;
        
        // Ajusta a página atual se o total de números mudar e a página atual for inválida.
        if (paginaAtual >= TOTAL_PAGINAS) {
            paginaAtual = TOTAL_PAGINAS - 1;
        }
    }
    
    // Atualiza o preço por número e recalcula o total da seleção.
    if (config.pricePerNumber !== configAtualCache.pricePerNumber) {
        PRECO_POR_NUMERO = config.pricePerNumber;
        VerificaNumero();
    }
    
    // Atualiza o máximo de números por pessoa.
    if (config.maxPerPerson !== configAtualCache.maxPerPerson) {
        MAX_POR_PESSOA = config.maxPerPerson;
    }
    
    // 6. Aplica as atualizações necessárias no grid e nos dots de navegação.
    if (needsGridUpdate) {
        renderizarPagina(paginaAtual);
    }
    
    if (needsDotsUpdate) {
        gerarDots();
        atualizarSetas();
    }
    
    // Atualiza o cache com a nova configuração.
    configAtualCache = { ...config };
    
    console.log("Configurações aplicadas (otimizado):", config);
}

// Função para aplicar todas as configurações da rifa (usada na inicialização ou em atualizações forçadas).
function applyFullRaffleConfig(config) {
    // Atualiza o título da rifa.
    const titleElement = document.querySelector("h2");
    if (titleElement) {
        titleElement.textContent = config.title;
    }
    
    // Atualiza a descrição da rifa.
    const descriptionElement = document.querySelector("p");
    if (descriptionElement) {
        descriptionElement.textContent = config.description;
    }
    
    // Atualiza informações do prêmio e outros detalhes.
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
    
    // Atualiza a imagem da rifa.
    const imageElement = document.querySelector("img[alt=\"Imagem da rifa\"]");
    if (imageElement && config.image) {
        imageElement.src = config.image;
    }
    
    // Atualiza as variáveis globais com os novos valores.
    PRECO_POR_NUMERO = config.pricePerNumber;
    TOTAL_NUMEROS = config.totalNumbers;
    MAX_POR_PESSOA = config.maxPerPerson;
    TOTAL_PAGINAS = Math.ceil(TOTAL_NUMEROS / NUMEROS_POR_PAGINA);

    console.log("Configurações aplicadas (completo):", config);

    // Renderiza a página, gera os dots de navegação e atualiza as setas.
    renderizarPagina(paginaAtual);
    gerarDots();
    atualizarSetas();
    VerificaNumero();
}

// Constantes que referenciam elementos do DOM.
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
const NUMEROS_POR_PAGINA = 100; // Define quantos números são exibidos por página.
const menuDots = document.querySelector(".menu") || document.querySelector(".menu-small"); // Elemento para os dots de navegação.

// Função para salvar os números selecionados pelo usuário antes de mudar de página.
function salvarSelecaoAtual() {
    const selecionadosNaPagina = document.querySelectorAll(".number-item.selected");
    selecionadosNaPagina.forEach(elemento => {
        const numero = parseInt(elemento.textContent);
        numerosSelecionados.add(numero);
    });
}

// Função para restaurar a seleção do usuário na página atual após a renderização.
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

// FUNÇÃO MODIFICADA: Atualiza o estado dos botões considerando se já foi usado
function atualizarEstadoBotoes() {
    const algumSelecionado = numerosSelecionados.size > 0;
    
    // O botão só fica habilitado se há números selecionados E ainda não foi usado
    botao.disabled = !algumSelecionado || botaoAdicionarJaUsado;
    LimparSelecao.disabled = !algumSelecionado;
    
    // Atualiza o texto do botão para indicar o estado
    if (botaoAdicionarJaUsado && algumSelecionado) {
        botao.innerHTML = '<i class="fas fa-lock"></i> Finalize a compra para adicionar mais';
        botao.title = "Você já adicionou números ao carrinho. Finalize a compra para poder adicionar mais números.";
    } else if (botaoAdicionarJaUsado) {
        botao.innerHTML = '<i class="fas fa-lock"></i> Adicionar ao Carrinho';
        botao.title = "Você já adicionou números ao carrinho. Finalize a compra para poder adicionar mais números.";
    } else {
        botao.innerHTML = '<i class="fas fa-cart-plus"></i> Adicionar ao Carrinho';
        botao.title = "";
    }
}

// Função para gerar os indicadores de página (dots) na navegação.
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

// Função para navegar para uma página específica da rifa.
function navegarParaPagina(novaPagina) {
    salvarSelecaoAtual(); // Salva a seleção atual antes de mudar de página.
    
    const paginaAnterior = paginaAtual;
    paginaAtual = novaPagina;
    
    renderizarPagina(paginaAtual); // Renderiza a nova página.
    atualizarDotsAtivos(paginaAnterior, paginaAtual); // Atualiza o dot ativo.
    atualizarSetas(); // Atualiza o estado das setas de navegação.
}

// Função para atualizar a classe 'active' dos dots de navegação com uma animação.
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

// Função para renderizar os números da página atual no grid (otimizada para performance).
function renderizarPagina(pagina) {
    // 1. Inicia a animação de fade-out para uma transição suave.
    PainelNumero.style.opacity = "0";
    PainelNumero.style.transform = "translateY(10px)";

    // 2. Usa setTimeout para permitir que a animação de fade-out comece
    // antes de o navegador processar o loop de renderização.
    setTimeout(() => {
<<<<<<< HEAD
       // Dentro da função renderizarPagina(pagina)
// ...
PainelNumero.innerHTML = "";
=======
        // 3. Cria um DocumentFragment para construir os elementos fora do DOM principal,
        // minimizando reflows e repaints.
        const fragmento = document.createDocumentFragment();
>>>>>>> 236f1b6139df012f8b8bf3677bb4fd1f56df1161

// 1. Crie um DocumentFragment
const fragment = document.createDocumentFragment(); 

<<<<<<< HEAD
const inicio = pagina * NUMEROS_POR_PAGINA + 1;
const fim = Math.min(inicio + NUMEROS_POR_PAGINA - 1, TOTAL_NUMEROS);

for (let i = inicio; i <= fim; i++) {
    const numero = document.createElement("div");
    numero.classList.add("number-item");
    numero.textContent = i;

    numero.addEventListener("click", () => {
        // ... (toda a sua lógica de clique permanece a mesma) ...
        if (numero.classList.contains("sold") || numero.classList.contains("in-cart")) {
            numero.classList.add('shake-animation');
            setTimeout(() => numero.classList.remove('shake-animation'), 400);
            return; 
=======
        // 4. Gera todos os números da página e os adiciona ao fragmento.
        for (let i = inicio; i <= fim; i++) {
            const numero = document.createElement("div");
            numero.classList.add("number-item");
            numero.textContent = i;

            // Adiciona o evento de clique para cada número.
            numero.addEventListener("click", () => {
                // Impede a seleção se o número já estiver vendido ou no carrinho.
                if (numero.classList.contains("sold") || numero.classList.contains("in-cart")) {
                    numero.classList.add("shake-animation");
                    setTimeout(() => numero.classList.remove("shake-animation"), 400);
                    return;
                }

                const numeroValue = parseInt(numero.textContent);

                // Limita a seleção de números por pessoa.
                if (!numero.classList.contains("selected") && numerosSelecionados.size >= MAX_POR_PESSOA) {
                    alert(`Você pode selecionar no máximo ${MAX_POR_PESSOA} números.`);
                    return;
                }

                // Alterna a seleção do número e atualiza o Set global.
                numero.classList.toggle("selected");
                if (numero.classList.contains("selected")) {
                    numerosSelecionados.add(numeroValue);
                } else {
                    numerosSelecionados.delete(numeroValue);
                }

                atualizarEstadoBotoes();
                VerificaNumero();
            });

            fragmento.appendChild(numero);
>>>>>>> 236f1b6139df012f8b8bf3677bb4fd1f56df1161
        }
        const numeroValue = parseInt(numero.textContent);
        if (!numero.classList.contains("selected") && numerosSelecionados.size >= MAX_POR_PESSOA) {
            alert(`Você pode selecionar no máximo ${MAX_POR_PESSOA} números.`);
            return;
        }
        numero.classList.toggle("selected");
        if (numero.classList.contains("selected")) {
            numerosSelecionados.add(numeroValue);
        } else {
            numerosSelecionados.delete(numeroValue);
        }
        atualizarEstadoBotoes();
        VerificaNumero();
    });

    // 2. Adicione o número ao fragment, não ao DOM real
    fragment.appendChild(numero); 
}

// 3. Após o loop, adicione o fragment ao DOM de uma só vez
PainelNumero.appendChild(fragment); 

// O resto da função continua igual...
// ...


        // 5. Limpa o painel antigo e insere o novo conteúdo de uma só vez, otimizando o DOM.
        PainelNumero.innerHTML = "";
        PainelNumero.appendChild(fragmento);

        // 6. Executa tarefas de atualização de status de forma assíncrona para não bloquear a UI.
        setTimeout(async () => {
            await atualizarNumerosComprados(); // Busca e marca números vendidos.
            atualizarStatusNoCarrinho(); // Marca números no carrinho.
            restaurarSelecaoNaPagina(); // Restaura a seleção do usuário.

            // 7. Revela o painel com uma animação de fade-in.
            PainelNumero.style.opacity = "1";
            PainelNumero.style.transform = "translateY(0)";
        }, 0); 

    }, 150); 
}

// Atualiza o estado (habilitado/desabilitado) das setas de navegação de página.
function atualizarSetas() {
    const prevButton = document.getElementById("prev-numbers");
    const nextButton = document.getElementById("next-numbers");
    
    prevButton.disabled = paginaAtual === 0;
    nextButton.disabled = paginaAtual >= TOTAL_PAGINAS - 1;
    
    // Altera a opacidade das setas para indicar o estado.
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

// Event listeners para os botões de navegação (setas).
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

// Navegação por teclado (setas esquerda/direita).
document.addEventListener("keydown", (e) => {
    if (document.activeElement.tagName !== "INPUT") { // Ignora se o foco estiver em um campo de input.
        if (e.key === "ArrowLeft" && paginaAtual > 0) {
            e.preventDefault();
            navegarParaPagina(paginaAtual - 1);
        } else if (e.key === "ArrowRight" && paginaAtual < TOTAL_PAGINAS - 1) {
            e.preventDefault();
            navegarParaPagina(paginaAtual + 1);
        }
    }
});

// Atualiza o preço total exibido com base nos números selecionados.
function VerificaNumero() {
    const quantidade = numerosSelecionados.size;
    const PrecoFinal = quantidade * PRECO_POR_NUMERO;
    preco.textContent = PrecoFinal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Função para calcular o total dos itens no carrinho.
function calcularTotalCarrinho() {
    const itensCarrinho = ListaDeItens.querySelectorAll("tr:not(#empty-cart-row)");
    let total = 0;
    
    itensCarrinho.forEach(item => {
        const numerosText = item.querySelector("td:first-child").textContent;
        const numeros = numerosText.split(",").map(n => n.trim()).filter(n => n !== "");
        total += numeros.length * PRECO_POR_NUMERO;
    });
    
    totalCarrinho.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    
    return total;
}

<<<<<<< HEAD
// Função para verificar se o carrinho tem itens
function carrinhoTemItens() {
    const itensCarrinho = ListaDeItens.querySelectorAll("tr:not(#empty-cart-row)");
    return itensCarrinho.length > 0;
}

function validarFormularioCompleto() {
    // 1. Verifica se os campos obrigatórios estão preenchidos
    const nomeValido = inputNome.value.trim().length >= 2;
    const telefoneValido = InputPhone.value.replace(/\D/g, '').length >= 10;
    
    // 2. Usa a nova função para validar o CPF
    const cpfValido = validarCPF(InputCpf.value);

    // 3. Verifica se o carrinho tem itens
    const carrinhoValido = carrinhoTemItens();

    // Lógica de habilitação centralizada
    const podeFinalizar = nomeValido && telefoneValido && cpfValido && carrinhoValido;
    
    EndCompra.disabled = !podeFinalizar;

    // Feedback visual para o campo de CPF (opcional, mas recomendado)
    if (InputCpf.value.length > 0) { // Só mostra o feedback se o usuário digitou algo
        if (cpfValido) {
            InputCpf.style.borderColor = '#22c55e'; // Verde
        } else {
            InputCpf.style.borderColor = '#ef4444'; // Vermelho
        }
    } else {
        InputCpf.style.borderColor = ''; // Cor padrão
    }

    // Atualiza o título para dar dicas ao usuário
    if (!podeFinalizar) {
        if (!carrinhoValido) {
            EndCompra.title = "Adicione números ao carrinho para continuar.";
        } else {
            EndCompra.title = "Por favor, preencha todos os campos obrigatórios corretamente.";
        }
=======
// Função para validar se o formulário está completo e o carrinho não está vazio.
function validarFormularioCompleto() {
    const nome = inputNome.value.trim();
    const cpf = InputCpf.value.trim();
    const telefone = InputPhone.value.trim();
    const email = InputEmail.value.trim();
    
    // Verifica se há itens no carrinho.
    const itensCarrinho = ListaDeItens.querySelectorAll("tr:not(#empty-cart-row)");
    const carrinhoValido = itensCarrinho.length > 0;
    
    // Validações específicas para cada campo.
    const nomeValido = nome.length >= 3;
    const cpfValido = validarCPF(cpf);
    const telefoneValido = telefone.replace(/\D/g, "").length >= 10;
    const emailValido = email === "" || validarEmail(email); // E-mail é opcional.
    
    // Atualiza as classes CSS dos campos para indicar validação.
    if (nome.length > 0) {
        inputNome.classList.toggle("border-green-500", nomeValido);
        inputNome.classList.toggle("focus:ring-green-500", nomeValido);
        inputNome.classList.toggle("border-red-500", !nomeValido);
        inputNome.classList.toggle("focus:ring-red-500", !nomeValido);
    } else {
        inputNome.classList.remove("border-green-500", "focus:ring-green-500", "border-red-500", "focus:ring-red-500");
    }
    
    if (cpf.length > 0) {
        InputCpf.classList.toggle("border-green-500", cpfValido);
        InputCpf.classList.toggle("focus:ring-green-500", cpfValido);
        InputCpf.classList.toggle("border-red-500", !cpfValido);
        InputCpf.classList.toggle("focus:ring-red-500", !cpfValido);
    } else {
        InputCpf.classList.remove("border-green-500", "focus:ring-green-500", "border-red-500", "focus:ring-red-500");
    }
    
    if (telefone.length > 0) {
        InputPhone.classList.toggle("border-green-500", telefoneValido);
        InputPhone.classList.toggle("focus:ring-green-500", telefoneValido);
        InputPhone.classList.toggle("border-red-500", !telefoneValido);
        InputPhone.classList.toggle("focus:ring-red-500", !telefoneValido);
    } else {
        InputPhone.classList.remove("border-green-500", "focus:ring-green-500", "border-red-500", "focus:ring-red-500");
    }
    
    if (email.length > 0) {
        InputEmail.classList.toggle("border-green-500", emailValido);
        InputEmail.classList.toggle("focus:ring-green-500", emailValido);
        InputEmail.classList.toggle("border-red-500", !emailValido);
        InputEmail.classList.toggle("focus:ring-red-500", !emailValido);
    } else {
        InputEmail.classList.remove("border-green-500", "focus:ring-green-500", "border-red-500", "focus:ring-red-500");
    }

    // Verifica se todas as condições de validação são verdadeiras.
    const formularioCompleto = nomeValido && cpfValido && telefoneValido && emailValido && carrinhoValido;

    // Habilita ou desabilita o botão de finalizar compra com base na validação.
    EndCompra.disabled = !formularioCompleto;

    // Atualiza a mensagem de dica (tooltip) do botão para guiar o usuário.
    if (!carrinhoValido) {
        EndCompra.title = "Seu carrinho está vazio. Adicione números para continuar.";
    } else if (!nomeValido) {
        EndCompra.title = "Por favor, preencha seu nome completo.";
    } else if (!cpfValido) {
        EndCompra.title = "O CPF informado é inválido.";
    } else if (!telefoneValido) {
        EndCompra.title = "Por favor, preencha um telefone válido.";
    } else if (!emailValido) {
        EndCompra.title = "Por favor, insira um e-mail válido.";
>>>>>>> 236f1b6139df012f8b8bf3677bb4fd1f56df1161
    } else {
        EndCompra.title = "Tudo pronto para finalizar a compra!";
    }

<<<<<<< HEAD
    return podeFinalizar;
}



// Evento para adicionar os itens ao carrinho
=======
    return formularioCompleto;
}

// EVENT LISTENER MODIFICADO: Adicionar os números selecionados ao carrinho e desabilitar o botão
>>>>>>> 236f1b6139df012f8b8bf3677bb4fd1f56df1161
botao.addEventListener("click", () => {
    const MsgCarrinhoVazio = document.getElementById("empty-cart-row");
    
    // Converte os números selecionados para um array e os adiciona ao Set de números no carrinho.
    const NumbersArray = Array.from(numerosSelecionados).sort((a, b) => a - b);
    NumbersArray.forEach(num => numerosNoCarrinho.add(parseInt(num)));

    // Esconde a mensagem de carrinho vazio se houver números.
    if (NumbersArray.length > 0) {
        MsgCarrinhoVazio.classList.add("hidden");
    }

    // Cria uma nova linha para o item no carrinho.
    const LinhaLista = document.createElement("tr");
    LinhaLista.classList.add("border-b", "border-gray-300");

    // Coluna para os números.
    const tdNumero = document.createElement("td");
    tdNumero.classList.add("text-center", "font-bold", "text-blue-500", "py-3", "px-5", "border");
    tdNumero.textContent = NumbersArray.join(", ");

    // Coluna para o preço total dos números.
    const tdPreco = document.createElement("td");
    tdPreco.classList.add("text-center", "font-semibold", "py-3", "px-5", "border");
    tdPreco.textContent = (NumbersArray.length * PRECO_POR_NUMERO).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    // Coluna para o botão de exclusão.
    const ExcluirNumero = document.createElement("td");
    ExcluirNumero.classList.add("text-center", "py-3", "px-5", "border");
    const icon = document.createElement("i");
    icon.classList.add("fas", "fa-trash", "red-trash-icon");
    icon.style.cursor = "pointer";
    icon.title = "Remover do carrinho";
    ExcluirNumero.appendChild(icon);

    // Adiciona as colunas à linha e a linha à lista de itens do carrinho.
    LinhaLista.appendChild(tdNumero);
    LinhaLista.appendChild(tdPreco);
    LinhaLista.appendChild(ExcluirNumero);
    ListaDeItens.appendChild(LinhaLista);

    // Event listener para remover o item do carrinho.
    icon.addEventListener("click", () => {
        const numerosParaRemover = LinhaLista.querySelector("td:first-child").textContent.split(",").map(n => parseInt(n.trim()));
        
        // Remove os números do Set de controle do carrinho.
        numerosParaRemover.forEach(num => numerosNoCarrinho.delete(num));

        LinhaLista.remove(); // Remove a linha da tabela.
        
        // Mostra a mensagem de carrinho vazio se não houver mais itens.
        const itensRestantes = ListaDeItens.querySelectorAll("tr:not(#empty-cart-row)");
        if (itensRestantes.length === 0) {
            MsgCarrinhoVazio.classList.remove("hidden");

          
        botaoAdicionarJaUsado = false;
        atualizarEstadoBotoes();
        }
        
        calcularTotalCarrinho(); // Recalcula o total do carrinho.
        validarFormularioCompleto(); // Revalida o formulário.
        atualizarStatusNoCarrinho(); // Atualiza o status dos números no grid.
    });

    numerosSelecionados.clear(); // Limpa a seleção atual de números.
    
    // Remove a classe 'selected' de todos os números no grid.
    document.querySelectorAll(".number-item.selected").forEach(elemento => {
        elemento.classList.remove("selected");
        atualizarStatusNoCarrinho();
    });
    
    // NOVA LÓGICA: Marca que o botão já foi usado
    botaoAdicionarJaUsado = true;
    
    atualizarEstadoBotoes(); // Atualiza o estado dos botões.
    VerificaNumero(); // Atualiza o preço total.
    calcularTotalCarrinho(); // Recalcula o total do carrinho.
    validarFormularioCompleto(); // Revalida o formulário.
});

// Event listener para limpar a seleção manual de números.
LimparSelecao.addEventListener("click", () => {
    numerosSelecionados.clear(); // Limpa o Set de números selecionados.
    
    // Remove a classe 'selected' de todos os números no grid.
    document.querySelectorAll(".number-item.selected").forEach(num => {
        num.classList.remove("selected");
    });
    
    atualizarEstadoBotoes(); // Atualiza o estado dos botões.
    VerificaNumero(); // Atualiza o preço total.
});

// Referências aos elementos do modal de compra.
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalButton");
const closeModalBtn = document.getElementById("closeModalButton");

// Event listener para abrir o modal de compra.
openModalBtn?.addEventListener("click", () => {
    modal.classList.remove("hidden");
    calcularTotalCarrinho(); // Recalcula o total do carrinho ao abrir o modal.
    validarFormularioCompleto(); // Valida o formulário ao abrir o modal.
});

// Event listener para fechar o modal de compra.
closeModalBtn?.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// Fecha o modal ao clicar fora dele.
modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
});

// Fecha o modal ao pressionar a tecla 'Escape'.
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.classList.add("hidden");
});

// Função para aplicar máscara de CPF.
function mascaraCPF(campo) {
    let cpf = campo.value.replace(/\D/g, "");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    campo.value = cpf;
    
    validarFormularioCompleto(); // Revalida o formulário após a máscara.
}

// Função para aplicar máscara de telefone.
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
    
    validarFormularioCompleto(); // Revalida o formulário após a máscara.
}

// Event listeners para validação em tempo real dos campos do formulário.
inputNome.addEventListener("input", validarFormularioCompleto);
InputCpf.addEventListener("input", validarFormularioCompleto);
InputPhone.addEventListener("input", validarFormularioCompleto);
InputEmail.addEventListener("input", validarFormularioCompleto);

// EVENT LISTENER MODIFICADO: Finalizar compra e reabilitar o botão "adicionar ao carrinho"
EndCompra.addEventListener("click", async () => {
    if (!validarFormularioCompleto()) {
        return; // Interrompe se o formulário não for válido.
    }

    // Desabilita o botão para evitar múltiplos cliques e mostra status.
    EndCompra.disabled = true;
    EndCompra.textContent = "Processando...";

    const total = calcularTotalCarrinho();
    const itensCarrinho = ListaDeItens.querySelectorAll("tr:not(#empty-cart-row)");
    let todosOsNumeros = [];

    // Coleta todos os números do carrinho.
    itensCarrinho.forEach(item => {
        const numerosText = item.querySelector("td:first-child").textContent;
        const numeros = numerosText.split(",").map(n => n.trim()).filter(n => n !== "");
        todosOsNumeros = todosOsNumeros.concat(numeros);
    });

    // Objeto com os dados da compra a serem enviados.
    const dadosCompra = {
        nome: inputNome.value,
        cpf: InputCpf.value,
        telefone: InputPhone.value,
        email: InputEmail.value || "Não informado",
        numeros: todosOsNumeros.join(", "),
        total: total
    };

    try {
        // Envia os dados para o backend via Fetch API.
        const response = await fetch("/TCC/backend/controller/cadastro.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dadosCompra),
        });

        const result = await response.json(); // Processa a resposta JSON.

        if (result.success) {
            alert("Compra realizada com sucesso!");
            limparCarrinho(); // Limpa o formulário e o carrinho após a compra.
            
            // NOVA LÓGICA: Reabilita o botão "adicionar ao carrinho" após finalizar a compra
            botaoAdicionarJaUsado = false;
            atualizarEstadoBotoes();
            
            await atualizarNumerosComprados(); // Atualiza a interface para desabilitar números comprados.
        } else {
            alert("Erro ao finalizar a compra: " + (result.message || "Tente novamente."));
        }

    } catch (error) {
        console.error("Erro ao enviar dados:", error);
        alert("Ocorreu um erro de comunicação. Tente novamente mais tarde.");
    } finally {
        // Reabilita o botão e restaura o texto original.
        EndCompra.disabled = false;
        EndCompra.textContent = "Finalizar Compra";
        validarFormularioCompleto(); // Revalida o estado do botão.
    }
});

// FUNÇÃO MODIFICADA: Limpar o carrinho e reabilitar o botão "adicionar ao carrinho"
function limparCarrinho() {
    const MsgCarrinhoVazio = document.getElementById("empty-cart-row");
    const itensCarrinho = ListaDeItens.querySelectorAll("tr:not(#empty-cart-row)");
    
    itensCarrinho.forEach(item => item.remove()); // Remove todos os itens do carrinho.
    
    MsgCarrinhoVazio.classList.remove("hidden"); // Mostra a mensagem de carrinho vazio.
    
    // Limpa os campos do formulário.
    inputNome.value = "";
    InputCpf.value = "";
    InputPhone.value = "";
    InputEmail.value = "";
    
    numerosNoCarrinho.clear(); // Limpa o Set de números no carrinho.
    calcularTotalCarrinho(); // Recalcula o total do carrinho.
    validarFormularioCompleto(); // Revalida o formulário.
    
    // NOVA LÓGICA: Reabilita o botão "adicionar ao carrinho" ao limpar o carrinho
    botaoAdicionarJaUsado = false;
    atualizarEstadoBotoes();
    
    modal.classList.add("hidden"); // Fecha o modal de compra.
}

// Função para verificar atualizações na configuração da rifa e aplicar otimizações.
function verificarAtualizacoes() {
    const configAtual = loadRaffleConfig();
    
    // Não faz nada se o cache ainda não foi inicializado.
    if (!configAtualCache) {
        return;
    }
    
    // Compara a configuração atual com o cache para detectar mudanças.
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
        applyRaffleConfigOptimized(); // Aplica apenas as mudanças necessárias.
    }
}

// Inicia a atualização automática dos números comprados em segundo plano.
function iniciarAtualizacaoAutomaticaDeNumeros() {
    // Chama a função a cada 15 segundos para verificar números comprados.
    setInterval(async () => {
        console.log("Verificando números comprados em segundo plano...");
        
        salvarSelecaoAtual(); // Salva a seleção do usuário para não perdê-la.
        await atualizarNumerosComprados(); // Busca e atualiza os números vendidos.
        atualizarStatusNoCarrinho(); // Marca os números no carrinho.
        restaurarSelecaoNaPagina(); // Restaura a seleção do usuário.

    }, 15000); // Intervalo de 15 segundos.
}

// Verifica atualizações da configuração a cada 5 segundos.
setInterval(verificarAtualizacoes, 5000);

// Função de inicialização da página.
function inicializar() {
    applyRaffleConfigOptimized(true); // Aplica configurações iniciais (completo).
    gerarDots(); // Gera os dots de navegação.
    renderizarPagina(paginaAtual); // Renderiza a primeira página.
    atualizarSetas(); // Atualiza as setas de navegação.
    PainelNumero.style.transition = "opacity 0.3s ease, transform 0.3s ease"; // Adiciona transição suave ao grid.
    calcularTotalCarrinho(); // Inicializa o total do carrinho.
    validarFormularioCompleto(); // Valida o formulário inicialmente.
    atualizarNumerosComprados(); // Busca e atualiza os números comprados.
    iniciarAtualizacaoAutomaticaDeNumeros(); // Inicia a atualização automática.
}

// Executa a inicialização quando o DOM estiver completamente carregado.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
} else {
    inicializar();
}

// Referências aos elementos do modal de números comprados.
const purchasedNumbersModal = document.getElementById("purchasedNumbersModal");
const openPurchasedNumbersModalBtn = document.getElementById("openPurchasedNumbersModal");
const closePurchasedNumbersModalBtn = document.getElementById("closePurchasedNumbersModal");
const searchCPFInput = document.getElementById("searchCPF");
const searchButton = document.getElementById("searchButton");
const purchasedNumbersResults = document.getElementById("purchasedNumbersResults");

// Event listeners para abrir e fechar o modal de números comprados.
openPurchasedNumbersModalBtn.addEventListener("click", () => {
    purchasedNumbersModal.classList.remove("hidden");
    purchasedNumbersModal.classList.add("flex"); // Adiciona 'flex' para centralizar o modal.
    resetPurchasedNumbersModal(); // Reseta o modal ao abrir.
});

closePurchasedNumbersModalBtn.addEventListener("click", () => {
    purchasedNumbersModal.classList.add("hidden");
    purchasedNumbersModal.classList.remove("flex"); // Remove 'flex' ao fechar.
});

// Fecha o modal ao clicar fora dele.
purchasedNumbersModal.addEventListener("click", (e) => {
    if (e.target === purchasedNumbersModal) {
        purchasedNumbersModal.classList.add("hidden");
        purchasedNumbersModal.classList.remove("flex");
    }
});

// Fecha o modal ao pressionar a tecla 'Escape'.
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        if (!purchasedNumbersModal.classList.contains("hidden")) {
            purchasedNumbersModal.classList.add("hidden");
            purchasedNumbersModal.classList.remove("flex");
        }
    }
});

<<<<<<< HEAD

// Localize este bloco (ou adicione se não existir) na seção de inicialização ou eventos do seu JS
const searchButton = document.getElementById('searchButton');
const searchCPFInput = document.getElementById('searchCPF');
const purchasedNumbersResults = document.getElementById('purchasedNumbersResults');

searchButton.addEventListener('click', async () => {
=======
// Event listener para o botão de busca de CPF dentro do modal.
searchButton.addEventListener("click", async () => {
>>>>>>> 236f1b6139df012f8b8bf3677bb4fd1f56df1161
    const cpf = searchCPFInput.value.trim();
    if (cpf === '') {
        purchasedNumbersResults.innerHTML = '<div class="text-center text-red-500 py-8">Por favor, digite um CPF.</div>';
        return;
    }

<<<<<<< HEAD
    await buscarEExibirNumerosComprados(cpf);
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
const InputCpfBusca = document.getElementById("searchCPF");
const BotaoBusca = document.getElementById("searchButton");
const ResultadoBusca = document.getElementById("purchasedNumbersResults");

// Adicione esta nova função ao seu arquivo usuario_otimizado.js
async function buscarEExibirNumerosComprados(cpf) {
    const purchasedNumbersResults = document.getElementById('purchasedNumbersResults');
    purchasedNumbersResults.innerHTML = '<div class="text-center text-gray-500 py-8"><i class="fas fa-spinner fa-spin mr-2"></i>Buscando...</div>';

    try {
        const formData = new FormData();
        formData.append('cpf', cpf); // Envia o CPF para o PHP

        const response = await fetch('/TCC/backend/controller/BuscarComprados.php', {
            method: 'POST',
            body: formData // Usa FormData para enviar o CPF como POST
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            let htmlContent = `
                <div class="bg-blue-50 border border-blue-200 p-4 rounded-md mb-4">
                    <p class="font-semibold text-blue-800">Nome: ${data.nome}</p>
                    <p class="text-blue-700">CPF: ${data.cpf}</p>
                </div>
                <h4 class="text-lg font-semibold mb-2 text-gray-700">Seus Números:</h4>
                <div class="flex flex-wrap gap-2">
            `;
            if (data.numeros && data.numeros.length > 0) {
                data.numeros.forEach(num => {
                    htmlContent += `<span class="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">${num}</span>`;
                });
            } else {
                htmlContent += `<p class="text-gray-600">Nenhum número encontrado para este CPF.</p>`;
            }
            htmlContent += `</div>`;
            purchasedNumbersResults.innerHTML = htmlContent;
        } else {
            purchasedNumbersResults.innerHTML = `<div class="text-center text-red-500 py-8">${data.message || 'Erro desconhecido ao buscar números.'}</div>`;
        }

    } catch (error) {
        console.error('Erro ao buscar números comprados:', error);
        purchasedNumbersResults.innerHTML = `<div class="text-center text-red-500 py-8">Erro ao conectar com o servidor: ${error.message}.</div>`;
=======
    // Limpa resultados anteriores e mostra mensagem de carregamento.
    purchasedNumbersResults.innerHTML = '<div class="text-center text-gray-500 italic py-8"><i class="fas fa-spinner fa-spin mr-2"></i>Buscando números...</div>';

    try {
        // Envia o CPF para o backend para buscar os números.
        const response = await fetch("/TCC/backend/controller/busca.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ cpf: cpf })
        });

        const data = await response.json();

        if (data.success) {
            if (data.numeros && data.numeros.length > 0) {
                // Formata e exibe os números encontrados e dados do cliente.
                const numerosFormatados = data.numeros.map(num => `<span class="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full m-1">${num}</span>`).join('');
                purchasedNumbersResults.innerHTML = `
                    <div class="bg-green-50 border border-green-200 p-4 rounded-md mb-4">
                        <h4 class="text-lg font-semibold mb-2 text-green-800">Dados do Cliente:</h4>
                        <p class="text-sm text-gray-700"><strong>Nome:</strong> ${data.nome}</p>
                        <p class="text-sm text-gray-700"><strong>CPF:</strong> ${data.cpf}</p>
                        <p class="text-sm text-gray-700"><strong>Total de números:</strong> ${data.total_numeros}</p>
                    </div>
                    <h4 class="text-lg font-semibold mb-2">Números comprados:</h4>
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

// Função para redefinir o estado do modal de busca de números comprados.
function resetPurchasedNumbersModal() {
    // 1. Limpa o campo de input do CPF.
    if (searchCPFInput) {
        searchCPFInput.value = '';
    }

    // 2. Restaura a mensagem inicial na área de resultados.
    if (purchasedNumbersResults) {
        purchasedNumbersResults.innerHTML = `
            <div class="text-center text-gray-500 italic py-8">
                Informe seu CPF para visualizar seus números comprados
            </div>
        `;
>>>>>>> 236f1b6139df012f8b8bf3677bb4fd1f56df1161
    }
}

// Função para buscar números já comprados e desabilitá-los na interface.
async function atualizarNumerosComprados() {
    try {
        // Faz a requisição para o script PHP que busca números comprados.
        const response = await fetch("/TCC/backend/controller/BuscarComprados.php");
        const data = await response.json();

        if (data.success && data.numeros) {
            // Converte a lista de números vendidos para um Set para busca rápida.
            const numerosVendidos = new Set(data.numeros.map(n => parseInt(n)));

            // Seleciona todos os itens de número visíveis na tela.
            const todosOsNumerosVisiveis = document.querySelectorAll(".number-item");

            todosOsNumerosVisiveis.forEach(elemento => {
                const numero = parseInt(elemento.textContent);

                // Adiciona a classe 'sold' se o número estiver vendido, e remove 'selected'.
                if (numerosVendidos.has(numero)) {
                    elemento.classList.add("sold");
                    elemento.classList.remove("selected");
                    elemento.title = "Este número já foi comprado";
                } else {
                    // Garante que números não vendidos não tenham a classe 'sold'.
                    elemento.classList.remove("sold");
                    elemento.title = "";
                }
            });
        }
    } catch (error) {
        console.error("Erro ao buscar ou atualizar números comprados:", error);
    }
}

// Função para marcar os números que já estão no carrinho como desabilitados na interface.
function atualizarStatusNoCarrinho() {
    const todosOsNumerosVisiveis = document.querySelectorAll(".number-item");

    todosOsNumerosVisiveis.forEach(elemento => {
        const numero = parseInt(elemento.textContent);

        // Adiciona a classe 'in-cart' se o número estiver no carrinho.
        if (numerosNoCarrinho.has(numero)) {
            elemento.classList.add("in-cart");
            elemento.title = "Este número já está no seu carrinho";
        } else {
            // Garante que a classe 'in-cart' seja removida se o item for removido do carrinho.
            elemento.classList.remove("in-cart");
        }
    });
}

<<<<<<< HEAD
// Adicione esta nova função ao seu código
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
    if (cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    let add = 0;
    for (let i = 0; i < 9; i++) {
        add += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) {
        rev = 0;
    }
    if (rev !== parseInt(cpf.charAt(9))) {
        return false;
    }
    add = 0;
    for (let i = 0; i < 10; i++) {
        add += parseInt(cpf.charAt(i)) * (11 - i);
    }
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) {
        rev = 0;
    }
    if (rev !== parseInt(cpf.charAt(10))) {
        return false;
    }
    return true;
}


=======
// Função para validar o formato de um CPF.
function validarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos.
>>>>>>> 236f1b6139df012f8b8bf3677bb4fd1f56df1161

    // Verifica se o CPF tem 11 dígitos e não é uma sequência de números iguais.
    if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) {
        return false;
    }

    const digitos = cpfLimpo.split('').map(Number);

    // Cálculo do 1º Dígito Verificador.
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += digitos[i] * (10 - i);
    }

    let resto = soma % 11;
    let digitoVerificador1 = (resto < 2) ? 0 : 11 - resto;

    if (digitos[9] !== digitoVerificador1) {
        return false;
    }

    // Cálculo do 2º Dígito Verificador.
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += digitos[i] * (11 - i);
    }

    resto = soma % 11;
    let digitoVerificador2 = (resto < 2) ? 0 : 11 - resto;

    if (digitos[10] !== digitoVerificador2) {
        return false;
    }

    return true; // CPF válido.
}

// Função para validar o formato de um endereço de e-mail.
function validarEmail(email) {
    // Expressão regular para validar o formato de e-mail.
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
}

