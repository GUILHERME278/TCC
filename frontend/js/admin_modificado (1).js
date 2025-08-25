// ========================================================================
// VARIÁVEIS GLOBAIS E CONSTANTES
// ========================================================================

const login = document.getElementById('admin-login');
const acesso = document.getElementById('admin-content');
const ButtonAdmin = document.getElementById('admin-login-btn');

const defaultRaffleConfig = {
    title: "Rifa Beneficente",
    description: "Ajude nossa causa e concorra a prêmios incríveis!",
    prize: "Smartphone Novo",
    totalNumbers: 2000,
    pricePerNumber: 5,
    maxPerPerson: 10,
    image: "./img/carro-completo.jpeg"
};

let salesData = [];
let currentSalesCount = 0;
let updateInterval;

// ========================================================================
// FUNÇÕES DE INICIALIZAÇÃO E EVENTOS PRINCIPAIS
// ========================================================================

/**
 * Ponto de entrada principal quando o DOM está pronto.
 * Agrupa todos os listeners de inicialização.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Listeners da página principal
    ButtonAdmin.addEventListener('click', handleAdminLogin);
    document.getElementById('logout-btn').addEventListener('click', handleAdminLogout);

    // Listeners da aba de Configurações
    document.getElementById('save-settings').addEventListener('click', handleSaveSettings);
    document.getElementById('prize-image-input').addEventListener('change', handlePrizeImageChange);

    // Listeners da aba de Vendas (Filtros)
    document.getElementById('filter-status').addEventListener('change', filterSales);
    document.getElementById('search-name').addEventListener('input', filterSales);
    document.getElementById('search-number').addEventListener('input', filterSales);
    

    // Listeners da aba de Sorteio
    document.getElementById('draw-button').addEventListener('click', performDraw);
    document.getElementById('share-winner').addEventListener('click', shareWinner);

    // Listeners do Modal de Edição
   const closeEditBtn = document.getElementById('close-edit-sale');
if (closeEditBtn) closeEditBtn.addEventListener('click', cancelSaleEdit);

const cancelEditBtn = document.getElementById('cancel-edit-sale');
if (cancelEditBtn) cancelEditBtn.addEventListener('click', cancelSaleEdit);

    // O formulário de edição agora chama a função diretamente no HTML (onsubmit), o que é bom.

    // Inicialização do sistema
    console.log('Sistema de vendas inicializado - aguardando login do administrador');
});

function handleAdminLogin() {
    login.classList.add('hidden');
    acesso.classList.remove('hidden');
    loadConfigToForm();
    startAutoUpdate();
}

function handleAdminLogout() {
    login.classList.remove('hidden');
    acesso.classList.add('hidden');
    stopAutoUpdate();
}

// ========================================================================
// LÓGICA DA ABA DE CONFIGURAÇÕES
// ========================================================================

function loadRaffleConfig() {
    const savedConfig = localStorage.getItem('raffleConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultRaffleConfig;
}

function saveRaffleConfig(config) {
    localStorage.setItem('raffleConfig', JSON.stringify(config));
    console.log('Configurações salvas no Local Storage:', config);
}

function loadConfigToForm() {
    const config = loadRaffleConfig();
    document.getElementById('raffle-title-input').value = config.title;
    document.getElementById('raffle-description-input').value = config.description;
    document.getElementById('raffle-prize-input').value = config.prize;
    document.getElementById('total-numbers-input').value = config.totalNumbers;
    document.getElementById('price-per-number-input').value = config.pricePerNumber;
    document.getElementById('max-per-person-input').value = config.maxPerPerson;

    if (config.image && config.image !== defaultRaffleConfig.image) {
        const preview = document.getElementById('preview-image');
        preview.src = config.image;
        preview.classList.remove('hidden');
        document.getElementById('camera-icon').classList.add('hidden');
    }

    // Verifica o estado de bloqueio ao carregar
    const isLocked = localStorage.getItem('settingsLocked') === 'true';
    updateSettingsUI(isLocked);
}

function handleSaveSettings() {
    console.log("1. Botão 'Salvar Configurações' clicado. Iniciando handleSaveSettings.");

    const saveButton = document.getElementById('save-settings');
    if (saveButton.disabled) {
        alert('As configurações só poderão ser alteradas após a realização do sorteio.');
        console.log("Execução parada: o botão já está desabilitado.");
        return;
    }

    try {
        console.log("2. Coletando valores dos campos do formulário...");

        const config = {
            title: document.getElementById('raffle-title-input').value || defaultRaffleConfig.title,
            description: document.getElementById('raffle-description-input').value || defaultRaffleConfig.description,
            prize: document.getElementById('raffle-prize-input').value || defaultRaffleConfig.prize,
            totalNumbers: parseInt(document.getElementById('total-numbers-input').value) || defaultRaffleConfig.totalNumbers,
            pricePerNumber: parseFloat(document.getElementById('price-per-number-input').value) || defaultRaffleConfig.pricePerNumber,
            maxPerPerson: parseInt(document.getElementById('max-per-person-input').value) || defaultRaffleConfig.maxPerPerson,
            image: document.getElementById('preview-image').src || defaultRaffleConfig.image
        };

        console.log("3. Valores coletados com sucesso. Config:", config);

        console.log("4. Salvando configurações da rifa (saveRaffleConfig)...");
        saveRaffleConfig(config);
        console.log("5. Configurações da rifa salvas.");

        console.log("6. Tentando salvar 'settingsLocked' no localStorage...");
        localStorage.setItem('settingsLocked', 'true');
        console.log("7. 'settingsLocked' salvo com sucesso no localStorage!");

        console.log("8. Chamando updateSettingsUI(true) para bloquear a tela...");
        updateSettingsUI(true);
        console.log("9. Função handleSaveSettings concluída com sucesso.");

    } catch (error) {
        console.error("!!! ERRO CRÍTICO DENTRO DE handleSaveSettings !!!", error);
        alert("Ocorreu um erro ao salvar as configurações. Verifique o console para mais detalhes (F12).");
    }
}


/**
 * [REMOÇÃO DE REPETIÇÃO]
 * Centraliza a lógica de atualização da UI de Configurações.
 * @param {boolean} isLocked - Define se a UI deve ser bloqueada ou não.
 */
function updateSettingsUI(isLocked) {
    const saveButton = document.getElementById('save-settings');
    const fields = [
        'raffle-title-input', 'raffle-description-input', 'raffle-prize-input',
        'total-numbers-input', 'price-per-number-input', 'max-per-person-input',
        'prize-image-input'
    ];

    // Habilita ou desabilita os campos do formulário
    fields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.disabled = isLocked;
    });

    // Atualiza a aparência do botão
    if (isLocked) {
        saveButton.innerHTML = '<i class="fas fa-lock"></i> Configurações Bloqueadas';
        saveButton.disabled = true;
        saveButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        saveButton.classList.add('bg-red-600', 'cursor-not-allowed', 'opacity-75');
    } else {
        saveButton.innerHTML = '<i class="fas fa-save"></i> Salvar Configurações';
        saveButton.disabled = false;
        saveButton.classList.remove('bg-red-600', 'cursor-not-allowed', 'opacity-75');
        saveButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }
}

function handlePrizeImageChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('preview-image').src = e.target.result;
            document.getElementById('preview-image').classList.remove('hidden');
            document.getElementById('camera-icon').classList.add('hidden');
        }
        reader.readAsDataURL(file);
    }
}

// ========================================================================
// LÓGICA DA ABA DE VENDAS E DADOS
// ========================================================================

async function fetchSalesFromDatabase() {
    try {
        const url = `/TCC/backend/controller/verificar_novas_vendas.php?contagem_atual=${currentSalesCount}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.novos_dados) {
            salesData = data.vendas.map(sale => ({ ...sale, status: "pago" }));
            currentSalesCount = salesData.length;
            renderSales();
            updateStatistics();
            console.log('Dados atualizados do banco de dados (todos pagos):', salesData);
        }
    } catch (error) {
        console.error('Erro ao buscar vendas do banco de dados:', error);
    }
}

function startAutoUpdate() {
    fetchSalesFromDatabase();
    updateInterval = setInterval(fetchSalesFromDatabase, 10000);
    console.log('Atualização automática iniciada - verificando a cada 10 segundos');
}

function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
        console.log('Atualização automática parada');
    }
}

function updateStatistics() {
    const totalSales = salesData.length;
    const paidSales = salesData.filter(sale => sale.status === 'pago').length;
    const pendingSales = salesData.filter(sale => sale.status === 'pendente').length;
    const config = loadRaffleConfig();
    const totalRevenue = salesData.reduce((total, sale) => total + (sale.total_numbers * config.pricePerNumber), 0);

    document.querySelector('.bg-blue-50 .text-2xl').textContent = totalSales;
    document.querySelector('.bg-green-50 .text-2xl').textContent = paidSales;
    document.querySelector('.bg-yellow-50 .text-2xl').textContent = pendingSales;
    document.querySelector('.bg-purple-50 .text-2xl').textContent = `R$ ${totalRevenue.toFixed(2)}`;
}

function renderSales(sales = salesData) {
    const salesTableBody = document.getElementById('sales-table-body');
    const noSalesMessage = document.getElementById('no-sales-message');
    if (!salesTableBody) return;

    salesTableBody.innerHTML = '';
    noSalesMessage.classList.toggle('hidden', sales.length > 0);

    if (sales.length === 0) return;

    sales.forEach(sale => {
        const row = document.createElement('tr');
        row.classList.add('hover:bg-gray-50', 'transition-colors');

        let statusClass = 'bg-yellow-100 text-yellow-800', statusIcon = 'fas fa-clock', statusText = 'Pendente';
        if (sale.status === 'pago') {
            statusClass = 'bg-green-100 text-green-800'; statusIcon = 'fas fa-check-circle'; statusText = 'Pago';
        } else if (sale.status === 'cancelado') {
            statusClass = 'bg-red-100 text-red-800'; statusIcon = 'fas fa-times-circle'; statusText = 'Cancelado';
            row.classList.add('opacity-75');
        }

        const numbersHtml = sale.numbers.map(num => `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">${num.toString().padStart(2, '0')}</span>`).join(' ');

        row.innerHTML = `
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-800">${sale.name}</td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">${sale.cpf}</td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">${sale.phone}</td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">${sale.email}</td>
            <td class="border border-gray-200 px-4 py-3 text-sm"><div class="flex flex-wrap gap-1">${numbersHtml}</div></td>
            <td class="border border-gray-200 px-4 py-3 text-sm"><span class="${statusClass} px-2 py-1 rounded-full text-xs font-medium"><i class="${statusIcon} mr-1"></i>${statusText}</span></td>
            <td class="border border-gray-200 px-4 py-3 text-center"><div class="flex justify-center gap-2"><button class="text-red-600 hover:text-red-800 transition" title="Excluir" onclick="deleteSale('${sale.cpf}')"><i class="fas fa-trash"></i></button></div></td>
        `;
        salesTableBody.appendChild(row);
    });

    const paginationInfo = document.querySelector('#sales-tab .text-sm.text-gray-600');
    if (paginationInfo) paginationInfo.textContent = `Mostrando 1-${sales.length} de ${sales.length} vendas`;
}

function filterSales() {
    const statusFilter = document.getElementById('filter-status').value;
    const nameSearch = document.getElementById('search-name').value.toLowerCase();
    const numberSearch = document.getElementById('search-number').value;

    let filteredSales = salesData.filter(sale =>
        (!statusFilter || sale.status === statusFilter) &&
        (!nameSearch || sale.name.toLowerCase().includes(nameSearch)) &&
        (!numberSearch || sale.numbers.includes(numberSearch))
    );
    renderSales(filteredSales);
}

async function deleteSale(cpf) {
    if (!confirm('Tem certeza que deseja excluir este cliente e todos os seus números? Esta ação não pode ser desfeita.')) return;

    try {
        const response = await fetch('/TCC/backend/controller/excluir_cliente.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf: cpf })
        });
        const result = await response.json();

        if (result.success) {
            alert('Cliente excluído com sucesso!');
            salesData = salesData.filter(sale => sale.cpf !== cpf);
            currentSalesCount = salesData.length;
            renderSales();
            updateStatistics();
            if (typeof loadRaffleNumbers === 'function') loadRaffleNumbers();
        } else {
            alert('Erro ao excluir o cliente: ' + result.message);
        }
    } catch (error) {
        console.error('Erro na requisição de exclusão:', error);
        alert('Ocorreu um erro de comunicação ao tentar excluir o cliente.');
    }
}



// ========================================================================
// LÓGICA DO MODAL DE EDIÇÃO
// ========================================================================

function editSale(id) {
    const sale = salesData.find(s => s.id === id);
    if (sale) {
        // Preenche os campos do modal
        document.getElementById('edit-sale-id').value = sale.id;
        document.getElementById('edit-sale-name').value = sale.name;
        document.getElementById('edit-sale-cpf').value = sale.cpf;
        document.getElementById('edit-sale-phone').value = sale.phone;
        document.getElementById('edit-sale-email').value = sale.email;

        // Renderizar números editáveis
        const numbersContainer = document.getElementById('edit-sale-numbers');
        if (numbersContainer) {
            numbersContainer.innerHTML = '';
            sale.numbers.forEach(num => {
                const span = document.createElement('span');
                span.className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm cursor-pointer hover:bg-red-100';
                span.textContent = num.toString().padStart(2, '0');
                span.title = 'Clique para remover';
                span.onclick = () => span.remove();
                numbersContainer.appendChild(span);
            });
        }

        // Mostra o modal
        document.getElementById('edit-sale-modal').classList.remove('hidden');
    }
}

async function saveSaleEdit() {
    const id = document.getElementById('edit-sale-id').value;
    const name = document.getElementById('edit-sale-name').value;
    const cpf = document.getElementById('edit-sale-cpf').value;
    const phone = document.getElementById('edit-sale-phone').value;
    const email = document.getElementById('edit-sale-email').value;
    
    // Coleta números do container
    const numbersContainer = document.getElementById('edit-sale-numbers');
    const numbers = Array.from(numbersContainer.children).map(span => 
        parseInt(span.textContent)
    );

    // Validações básicas
    if (!name || !cpf || !phone || !email || numbers.length === 0) {
        alert('Todos os campos são obrigatórios e pelo menos um número deve ser selecionado.');
        return;
    }

    try {
        const response = await fetch('/TCC/backend/controller/editar_venda.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
                name: name,
                cpf: cpf,
                phone: phone,
                email: email,
                numbers: numbers
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('Venda atualizada com sucesso!');
            document.getElementById('edit-sale-modal').classList.add('hidden');
            fetchSalesFromDatabase(); // Recarrega os dados
        } else {
            alert('Erro ao atualizar venda: ' + result.message);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor.');
    }
}                       

/**
 * [REMOÇÃO DE REPETIÇÃO]
 * Centraliza a lógica de fechar o modal de edição.
 */
function cancelSaleEdit() {
    document.getElementById('edit-sale-modal').classList.add('hidden');
}

function addNumberToEdit() {
    const input = document.getElementById('add-number-input');
    const number = parseInt(input.value);
    
    if (!number || number < 1) {
        alert('Digite um número válido.');
        return;
    }

    const numbersContainer = document.getElementById('edit-sale-numbers');
    
    // Verifica se o número já existe
    const existingNumbers = Array.from(numbersContainer.children).map(span => 
        parseInt(span.textContent)
    );
    
    if (existingNumbers.includes(number)) {
        alert('Este número já foi selecionado.');
        return;
    }
}

// ========================================================================
// LÓGICA DA ABA DE SORTEIO
// ========================================================================

function performDraw() {
    console.log("--- INICIANDO PROCESSO DE SORTEIO ---");
    if (!salesData || salesData.length === 0) {
        alert("Nenhuma venda encontrada para o sorteio.");
        return;
    }

    const eligibleNumbers = salesData.flatMap(sale => sale.numbers);
    if (eligibleNumbers.length === 0) {
        alert('Nenhum número encontrado para realizar o sorteio!');
        return;
    }

    const winnerNumber = eligibleNumbers[Math.floor(Math.random() * eligibleNumbers.length)];
    const winner = salesData.find(sale => sale.numbers.includes(winnerNumber));

    if (!winner) {
        alert('Erro ao identificar o ganhador. Tente novamente.');
        return;
    }

    console.log("Número sorteado:", winnerNumber, "Ganhador:", winner);

    // Exibe o resultado
    document.getElementById('winner-number').textContent = winnerNumber.toString().padStart(2, '0');
    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-phone').textContent = winner.phone;
    document.getElementById('winner-section').classList.remove('hidden');

    // Prepara o botão do WhatsApp
    const whatsappButton = document.getElementById('whatsapp-winner');
    const cleanPhoneNumber = winner.phone.replace(/\D/g, '');
    const winnerName = winner.name.split(' ')[0];
    const rafflePrize = loadRaffleConfig().prize;
    const message = `Olá, ${winnerName}! Parabéns! Você foi o(a) ganhador(a) do prêmio "${rafflePrize}" com o número ${winnerNumber}. Entramos em contato para combinar a entrega.`;
    whatsappButton.href = `https://wa.me/55${cleanPhoneNumber}?text=${encodeURIComponent(message )}`;
    whatsappButton.classList.remove('hidden');

    // Salva o resultado e desbloqueia as configurações
    localStorage.setItem('drawResult', JSON.stringify({ number: winnerNumber, winner, date: new Date().toLocaleDateString('pt-BR') }));
    localStorage.removeItem('settingsLocked');
    updateSettingsUI(false); // Desbloqueia a UI
    console.log("Configurações desbloqueadas após o sorteio.");
}

function shareWinner() {
    const winnerNumber = document.getElementById('winner-number').textContent;
    const winnerName = document.getElementById('winner-name').textContent;
    const text = `🎉 RESULTADO DO SORTEIO! 🎉\n\nNúmero sorteado: ${winnerNumber}\nGanhador: ${winnerName}\n\nParabéns! 🏆`;

    if (navigator.share) {
        navigator.share({ title: 'Resultado do Sorteio', text });
    } else {
        navigator.clipboard.writeText(text).then(() => alert('Resultado copiado para a área de transferência!'));
    }
}

// ========================================================================
// FUNÇÕES AUXILIARES E NÃO UTILIZADAS DIRETAMENTE NO FLUXO PRINCIPAL
// ========================================================================

// A função de navegação por abas está bem, sem repetições.
const tabs = document.querySelectorAll('.admin-tab');
const contents = document.querySelectorAll('.admin-tab-panel');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        tabs.forEach(t => t.classList.remove('active', 'text-blue-600', 'border-blue-600'));
        contents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active', 'text-blue-600', 'border-blue-600');
        document.getElementById(`${target}-tab`).classList.add('active');
    });
});

// Esta função parece não estar sendo chamada, mas pode ser para uso futuro.
async function loadRaffleNumbers() {
    try {
        const response = await fetch('/TCC/backend/controller/get_raffle_numbers.php');
        const data = await response.json();

        if (data.success) {
            const raffleNumbers = data.numbers;
            // Aqui você precisaria de uma função para renderizar esses números na sua interface de compra
            // Por exemplo, se você tem uma div com id="raffle-numbers-container"
            const numbersContainer = document.getElementById('raffle-numbers-container');
            if (numbersContainer) {
                numbersContainer.innerHTML = ''; // Limpa o container
                raffleNumbers.forEach(item => {
                    const numberDiv = document.createElement('div');
                    numberDiv.textContent = item.number.toString().padStart(4, '0'); // Formata com zeros à esquerda
                    numberDiv.classList.add('raffle-number', 'p-2', 'border', 'rounded', 'text-center');
                    if (item.is_sold) {
                        numberDiv.classList.add('bg-red-200', 'text-red-800', 'cursor-not-allowed');
                    } else {
                        numberDiv.classList.add('bg-green-200', 'text-green-800', 'cursor-pointer', 'hover:bg-green-300');
                        // Adicione um event listener para seleção, se for o caso
                    }
                    numbersContainer.appendChild(numberDiv);
                });
            }
            console.log('Números da rifa atualizados:', raffleNumbers);
        } else {
            console.error('Erro ao carregar números da rifa:', data.message);
        }
    } catch (error) {
        console.error('Erro na requisição para carregar números da rifa:', error);
    }
}
