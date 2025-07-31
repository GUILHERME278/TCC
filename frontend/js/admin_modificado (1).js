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
});

// Logout do administrador
document.getElementById('logout-btn').addEventListener('click', function() {
    login.classList.remove('hidden');
    acesso.classList.add('hidden');
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

// Simulação de dados de vendas (em um sistema real, viria do backend)
let salesData = [
    {
        id: 1,
        date: "01/06/2025",
        name: "João Silva",
        phone: "(11) 98765-4321",
        numbers: [1, 15, 27],
        value: 15,
        status: "paid"
    },
    {
        id: 2,
        date: "31/05/2025",
        name: "Maria Oliveira",
        phone: "(11) 91234-5678",
        numbers: [42, 56, 78, 90],
        value: 20,
        status: "pending"
    }
];

// Função para renderizar vendas
function renderSales(sales = salesData) {
    const salesList = document.getElementById('sales-list');
    salesList.innerHTML = '';
    
    sales.forEach(sale => {
        const row = document.createElement('tr');
        row.classList.add('hover:bg-gray-50');
        
        const statusClass = sale.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        const statusText = sale.status === 'paid' ? 'Pago' : 'Pendente';
        
        row.innerHTML = `
            <td class="py-3 px-4 text-sm text-gray-700">${sale.date}</td>
            <td class="py-3 px-4 text-sm text-gray-700">${sale.name}</td>
            <td class="py-3 px-4 text-sm text-gray-700">${sale.phone}</td>
            <td class="py-3 px-4 text-sm text-gray-700">${sale.numbers.join(', ')}</td>
            <td class="py-3 px-4 text-sm text-gray-700 text-right">R$ ${sale.value.toFixed(2)}</td>
            <td class="py-3 px-4 text-center">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">${statusText}</span>
            </td>
            <td class="py-3 px-4 text-center">
                <button class="text-blue-600 hover:text-blue-800 mx-1" title="Editar" onclick="editSale(${sale.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-800 mx-1" title="Excluir" onclick="deleteSale(${sale.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        salesList.appendChild(row);
    });
    
    document.getElementById('sales-count').textContent = sales.length;
}

// Função para filtrar vendas
function filterSales() {
    const searchTerm = document.getElementById('sales-search').value.toLowerCase();
    const statusFilter = document.getElementById('sales-filter').value;
    
    let filteredSales = salesData;
    
    if (searchTerm) {
        filteredSales = filteredSales.filter(sale => 
            sale.name.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter !== 'all') {
        filteredSales = filteredSales.filter(sale => sale.status === statusFilter);
    }
    
    renderSales(filteredSales);
}

// Event listeners para filtros
document.getElementById('sales-search').addEventListener('input', filterSales);
document.getElementById('sales-filter').addEventListener('change', filterSales);

// Função para editar venda
function editSale(id) {
    const sale = salesData.find(s => s.id === id);
    if (sale) {
        document.getElementById('edit-sale-name').value = sale.name;
        document.getElementById('edit-sale-phone').value = sale.phone;
        document.getElementById('edit-sale-status').value = sale.status;
        
        // Renderizar números
        const numbersContainer = document.getElementById('edit-sale-numbers');
        numbersContainer.innerHTML = '';
        sale.numbers.forEach(num => {
            const span = document.createElement('span');
            span.className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm cursor-pointer';
            span.textContent = num.toString().padStart(2, '0');
            span.onclick = () => span.remove();
            numbersContainer.appendChild(span);
        });
        
        document.getElementById('edit-sale-modal').classList.remove('hidden');
    }
}

// Função para deletar venda
function deleteSale(id) {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
        salesData = salesData.filter(s => s.id !== id);
        renderSales();
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
document.getElementById('export-sales').addEventListener('click', function() {
    const csv = 'Data,Nome,Telefone,Números,Valor,Status\n' + 
        salesData.map(sale => 
            `${sale.date},"${sale.name}","${sale.phone}","${sale.numbers.join(', ')}",${sale.value},${sale.status}`
        ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendas_rifa.csv';
    a.click();
    window.URL.revokeObjectURL(url);
});

// NOVA FUNCIONALIDADE: Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Renderiza vendas iniciais
    renderSales();
    
    // Se já houver configurações salvas, carrega valores padrão nos campos
    const config = loadRaffleConfig();
    if (config !== defaultRaffleConfig) {
        console.log('Configurações encontradas no Local Storage:', config);
    }
});

