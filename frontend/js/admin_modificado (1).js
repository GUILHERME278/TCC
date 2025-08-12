const login = document.getElementById('admin-login');
const acesso = document.getElementById('admin-content');
const ButtonAdmin = document.getElementById('admin-login-btn');

// NOVA FUNCIONALIDADE: Configurações padrão da rifa
const defaultRaffleConfig = {
    title: "Rifa Beneficente",
    description: "Ajude nossa causa e concorra a prêmios incríveis!",
    prize: "Smartphone Novo",
    totalNumbers: 2000,
    pricePerNumber: 5,
    maxPerPerson: 10,
    image: "./img/carro-completo.jpeg"
};

// NOVA FUNCIONALIDADE: Função para carregar configurações do Local Storage
function loadRaffleConfig() {
    const savedConfig = localStorage.getItem('raffleConfig');
    if (savedConfig) {
        return JSON.parse(savedConfig);
    }
    return defaultRaffleConfig;
}

// NOVA FUNCIONALIDADE: Função para salvar configurações no Local Storage
function saveRaffleConfig(config) {
    localStorage.setItem('raffleConfig', JSON.stringify(config));
    console.log('Configurações salvas no Local Storage:', config);
}

// NOVA FUNCIONALIDADE: Função para carregar configurações nos campos do formulário
function loadConfigToForm() {
    const config = loadRaffleConfig();
    
    document.getElementById('raffle-title-input').value = config.title;
    document.getElementById('raffle-description-input').value = config.description;
    document.getElementById('raffle-prize-input').value = config.prize;
    document.getElementById('total-numbers-input').value = config.totalNumbers;
    document.getElementById('price-per-number-input').value = config.pricePerNumber;
    document.getElementById('max-per-person-input').value = config.maxPerPerson;
    
    // Se houver uma imagem salva, carrega ela
    if (config.image && config.image !== defaultRaffleConfig.image) {
        const preview = document.getElementById('preview-image');
        const cameraIcon = document.getElementById('camera-icon');
        preview.src = config.image;
        preview.classList.remove('hidden');
        cameraIcon.classList.add('hidden');
    }
}

// NOVA FUNCIONALIDADE: Event listener para salvar configurações
document.getElementById('save-settings').addEventListener('click', function() {
    const config = {
        title: document.getElementById('raffle-title-input').value || defaultRaffleConfig.title,
        description: document.getElementById('raffle-description-input').value || defaultRaffleConfig.description,
        prize: document.getElementById('raffle-prize-input').value || defaultRaffleConfig.prize,
        totalNumbers: parseInt(document.getElementById('total-numbers-input').value) || defaultRaffleConfig.totalNumbers,
        pricePerNumber: parseFloat(document.getElementById('price-per-number-input').value) || defaultRaffleConfig.pricePerNumber,
        maxPerPerson: parseInt(document.getElementById('max-per-person-input').value) || defaultRaffleConfig.maxPerPerson,
        image: document.getElementById('preview-image').src || defaultRaffleConfig.image
    };
    
    saveRaffleConfig(config);
    
    // Feedback visual para o usuário
    const saveButton = document.getElementById('save-settings');
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-check"></i> Configurações Salvas!';
    saveButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    saveButton.classList.add('bg-green-600', 'hover:bg-green-700');
    
    setTimeout(() => {
        saveButton.innerHTML = originalText;
        saveButton.classList.remove('bg-green-600', 'hover:bg-green-700');
        saveButton.classList.add('bg-blue-600', 'hover:bg-blue-700');
    }, 2000);
});

// Login do administrador
ButtonAdmin.addEventListener('click', function() {
    login.classList.add('hidden');
    acesso.classList.remove('hidden');
    
    // NOVA FUNCIONALIDADE: Carrega configurações quando o admin faz login
    loadConfigToForm();
    
    // NOVA FUNCIONALIDADE: Inicia atualização automática das vendas
    startAutoUpdate();
});

// Logout do administrador
document.getElementById('logout-btn').addEventListener('click', function() {
    login.classList.remove('hidden');
    acesso.classList.add('hidden');
    
    // NOVA FUNCIONALIDADE: Para atualização automática ao fazer logout
    stopAutoUpdate();
});

// Animação do menu
// Seleciona todos os botões de aba e os conteúdos das abas
const tabs = document.querySelectorAll('.admin-tab');
const contents = document.querySelectorAll('.admin-tab-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-tab');
    const targetPanel = document.getElementById(`${target}-tab`);

    // Remove a classe active de todos os botões
    tabs.forEach(t => {
      t.classList.remove('active');
      t.classList.remove('text-blue-600');
      t.classList.remove('border-blue-600');
      t.classList.add('text-gray-600');
    });

    // Remove a classe active de todos os painéis
    contents.forEach(c => c.classList.remove('active'));

    // Ativa o botão clicado
    tab.classList.add('active');
    tab.classList.remove('text-gray-600');
    tab.classList.add('text-blue-600');
    tab.classList.add('border-blue-600');

    // Mostra o painel correspondente
    targetPanel.classList.add('active');
  });
});

// Script para adicionar imagem
const imageInput = document.getElementById('prize-image-input');
const preview = document.getElementById('preview-image');
const cameraIcon = document.getElementById('camera-icon');

imageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
      cameraIcon.classList.add('hidden');
    }
    reader.readAsDataURL(file);
  }
});

// NOVA FUNCIONALIDADE: Funcionalidades adicionais para vendas e sorteio

// Variáveis para controle da atualização automática
let salesData = [];
let currentSalesCount = 0;
let updateInterval;

// Função para buscar vendas do banco de dados
async function fetchSalesFromDatabase() {
    try {
        const url = `verificar_novas_vendas.php?contagem_atual=${currentSalesCount}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.novos_dados) {
            salesData = data.vendas;
            currentSalesCount = salesData.length;
            renderSales();
            updateStatistics();
            console.log('Dados atualizados do banco de dados:', salesData);
        }
    } catch (error) {
        console.error('Erro ao buscar vendas do banco de dados:', error);
    }
}

// Função para iniciar atualização automática a cada 10 segundos
function startAutoUpdate() {
    // Busca inicial
    fetchSalesFromDatabase();
    
    // Configura atualização automática a cada 10 segundos
    updateInterval = setInterval(() => {
        fetchSalesFromDatabase();
    }, 10000); // 10 segundos
    
    console.log('Atualização automática iniciada - verificando a cada 10 segundos');
}

// Função para parar atualização automática
function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
        console.log('Atualização automática parada');
    }
}

// Função para atualizar estatísticas
function updateStatistics() {
    const totalSales = salesData.length;
    const paidSales = salesData.filter(sale => sale.status === 'pago').length;
    const pendingSales = salesData.filter(sale => sale.status === 'pendente').length;
    
    // Calcula total arrecadado (assumindo R$ 5,00 por número)
    const config = loadRaffleConfig();
    const totalRevenue = salesData.reduce((total, sale) => {
        return total + (sale.total_numbers * config.pricePerNumber);
    }, 0);
    
    // Atualiza os elementos na tela
    document.querySelector('.bg-blue-50 .text-2xl').textContent = totalSales;
    document.querySelector('.bg-green-50 .text-2xl').textContent = paidSales;
    document.querySelector('.bg-yellow-50 .text-2xl').textContent = pendingSales;
    document.querySelector('.bg-purple-50 .text-2xl').textContent = `R$ ${totalRevenue.toFixed(2)}`;
}

// Função para renderizar vendas na tabela
function renderSales(sales = salesData) {
    const salesTableBody = document.getElementById('sales-table-body');
    const noSalesMessage = document.getElementById('no-sales-message');
    
    if (!salesTableBody) {
        console.error('Elemento sales-table-body não encontrado');
        return;
    }
    
    // Limpa a tabela
    salesTableBody.innerHTML = '';
    
    if (sales.length === 0) {
        // Mostra mensagem de "nenhuma venda"
        if (noSalesMessage) {
            noSalesMessage.classList.remove('hidden');
        }
        return;
    }
    
    // Esconde mensagem de "nenhuma venda"
    if (noSalesMessage) {
        noSalesMessage.classList.add('hidden');
    }
    
    sales.forEach(sale => {
        const row = document.createElement('tr');
        row.classList.add('hover:bg-gray-50', 'transition-colors');
        
        // Define classes e texto do status
        let statusClass, statusIcon, statusText;
        switch (sale.status) {
            case 'pago':
                statusClass = 'bg-green-100 text-green-800';
                statusIcon = 'fas fa-check-circle';
                statusText = 'Pago';
                break;
            case 'cancelado':
                statusClass = 'bg-red-100 text-red-800';
                statusIcon = 'fas fa-times-circle';
                statusText = 'Cancelado';
                row.classList.add('opacity-75');
                break;
            default:
                statusClass = 'bg-yellow-100 text-yellow-800';
                statusIcon = 'fas fa-clock';
                statusText = 'Pendente';
        }
        
        // Formata os números
        const numbersHtml = sale.numbers.map(num => 
            `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">${num.toString().padStart(2, '0')}</span>`
        ).join(' ');
        
        row.innerHTML = `
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-800">
                ${sale.name}
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                ${sale.cpf}
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                ${sale.phone}
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                ${sale.email}
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm">
                <div class="flex flex-wrap gap-1">
                    ${numbersHtml}
                </div>
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm">
                <span class="${statusClass} px-2 py-1 rounded-full text-xs font-medium">
                    <i class="${statusIcon} mr-1"></i>${statusText}
                </span>
            </td>
            <td class="border border-gray-200 px-4 py-3 text-center">
                <div class="flex justify-center gap-2">
                    <button class="text-blue-600 hover:text-blue-800 transition" title="Editar" onclick="editSale('${sale.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-green-600 hover:text-green-800 transition" title="WhatsApp" onclick="sendWhatsApp('${sale.phone}', '${sale.name}')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800 transition" title="Excluir" onclick="deleteSale('${sale.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        salesTableBody.appendChild(row);
    });
    
    // Atualiza contador de paginação
    const paginationInfo = document.querySelector('.text-sm.text-gray-600');
    if (paginationInfo) {
        paginationInfo.textContent = `Mostrando 1-${sales.length} de ${sales.length} vendas`;
    }
}

// Função para filtrar vendas
function filterSales() {
    const statusFilter = document.getElementById('filter-status').value;
    const nameSearch = document.getElementById('search-name').value.toLowerCase();
    const numberSearch = document.getElementById('search-number').value;
    
    let filteredSales = salesData;
    
    // Filtro por status
    if (statusFilter) {
        filteredSales = filteredSales.filter(sale => sale.status === statusFilter);
    }
    
    // Filtro por nome
    if (nameSearch) {
        filteredSales = filteredSales.filter(sale => 
            sale.name.toLowerCase().includes(nameSearch)
        );
    }
    
    // Filtro por número
    if (numberSearch) {
        filteredSales = filteredSales.filter(sale => 
            sale.numbers.includes(numberSearch)
        );
    }
    
    renderSales(filteredSales);
}

// Event listeners para filtros
document.addEventListener('DOMContentLoaded', function() {
    const filterStatus = document.getElementById('filter-status');
    const searchName = document.getElementById('search-name');
    const searchNumber = document.getElementById('search-number');
    
    if (filterStatus) filterStatus.addEventListener('change', filterSales);
    if (searchName) searchName.addEventListener('input', filterSales);
    if (searchNumber) searchNumber.addEventListener('input', filterSales);
});

// Função para enviar WhatsApp
function sendWhatsApp(phone, name) {
    const cleanPhone = phone.replace(/\D/g, ''); // Remove caracteres não numéricos
    const message = `Olá ${name}! Entrando em contato sobre sua participação na rifa.`;
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Função para editar venda
function editSale(id) {
    const sale = salesData.find(s => s.id === id);
    if (sale) {
        document.getElementById('edit-sale-name').value = sale.name;
        document.getElementById('edit-sale-phone').value = sale.phone;
        document.getElementById('edit-sale-status').value = sale.status;
        
        // Renderizar números
        const numbersContainer = document.getElementById('edit-sale-numbers');
        if (numbersContainer) {
            numbersContainer.innerHTML = '';
            sale.numbers.forEach(num => {
                const span = document.createElement('span');
                span.className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm cursor-pointer';
                span.textContent = num.toString().padStart(2, '0');
                span.onclick = () => span.remove();
                numbersContainer.appendChild(span);
            });
        }
        
        document.getElementById('edit-sale-modal').classList.remove('hidden');
    }
}

// Função para deletar venda
function deleteSale(id) {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
        // Em um sistema real, faria uma requisição para o backend para deletar
        console.log('Deletar venda com ID:', id);
        alert('Funcionalidade de exclusão deve ser implementada no backend');
    }
}

// Event listeners para modal de edição
document.getElementById('close-edit-sale').addEventListener('click', () => {
    document.getElementById('edit-sale-modal').classList.add('hidden');
});

document.getElementById('cancel-edit-sale').addEventListener('click', () => {
    document.getElementById('edit-sale-modal').classList.add('hidden');
});

// Função para realizar sorteio
document.getElementById('draw-button').addEventListener('click', function() {
    const config = loadRaffleConfig();
    const soldNumbers = salesData.flatMap(sale => sale.numbers);
    
    if (soldNumbers.length === 0) {
        alert('Não há números vendidos para realizar o sorteio!');
        return;
    }
    
    // Sorteia um número aleatório entre os vendidos
    const winnerNumber = soldNumbers[Math.floor(Math.random() * soldNumbers.length)];
    const winner = salesData.find(sale => sale.numbers.includes(winnerNumber));
    
    // Exibe o resultado
    document.getElementById('winner-number').textContent = winnerNumber.toString().padStart(2, '0');
    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-phone').textContent = winner.phone;
    document.getElementById('winner-section').classList.remove('hidden');
    
    // Salva o resultado do sorteio
    const drawResult = {
        number: winnerNumber,
        winner: winner,
        date: new Date().toLocaleDateString('pt-BR')
    };
    localStorage.setItem('drawResult', JSON.stringify(drawResult));
});

// Função para imprimir resultado
document.getElementById('print-winner').addEventListener('click', function() {
    window.print();
});

// Função para compartilhar resultado
document.getElementById('share-winner').addEventListener('click', function() {
    const winnerNumber = document.getElementById('winner-number').textContent;
    const winnerName = document.getElementById('winner-name').textContent;
    const text = `🎉 RESULTADO DO SORTEIO! 🎉\n\nNúmero sorteado: ${winnerNumber}\nGanhador: ${winnerName}\n\nParabéns! 🏆`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Resultado do Sorteio',
            text: text
        });
    } else {
        // Fallback para copiar para clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Resultado copiado para a área de transferência!');
        });
    }
});

// Função para exportar vendas
document.getElementById('export-sales-btn').addEventListener('click', function() {
    if (salesData.length === 0) {
        alert('Não há vendas para exportar');
        return;
    }
    
    const csv = 'Nome,CPF,Telefone,Email,Números,Status\n' + 
        salesData.map(sale => 
            `"${sale.name}","${sale.cpf}","${sale.phone}","${sale.email}","${sale.numbers.join(', ')}","${sale.status}"`
        ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendas_rifa_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
});

// NOVA FUNCIONALIDADE: Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Se já houver configurações salvas, carrega valores padrão nos campos
    const config = loadRaffleConfig();
    if (config !== defaultRaffleConfig) {
        console.log('Configurações encontradas no Local Storage:', config);
    }
    
    console.log('Sistema de vendas inicializado - aguardando login do administrador');
});

