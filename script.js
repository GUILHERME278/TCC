  // Dados iniciais da rifa
  const raffleData = {
    title: "Rifa Beneficente",
    description: "Ajude nossa causa e concorra a prêmios incríveis!",
    prize: "Smartphone Novo",
    totalNumbers: 100,
    pricePerNumber: 5,
    maxPerPerson: 10,
    soldNumbers: [],
    sales: []
};

// Dados do comprador atual
let currentBuyer = {
    selectedNumbers: [],
    name: "",
    phone: "",
    email: ""
};

// Dados do admin (simulados)
const adminCredentials = {
    username: "admin",
    password: "123456"
};

// Estado da aplicação
let appState = {
    currentTab: "config",
    currentSaleId: null,
    selectedPaymentMethod: null
};

// DOM Elements
const buyerPanel = document.getElementById('buyer-panel');
const adminPanel = document.getElementById('admin-panel');
const adminLoginBtn = document.getElementById('admin-login-btn');
const loginModal = document.getElementById('login-modal');
const cancelLoginBtn = document.getElementById('cancel-login');
const confirmLoginBtn = document.getElementById('confirm-login');
const adminContent = document.getElementById('admin-content');
const logoutBtn = document.getElementById('logout-btn');
const adminTabs = document.querySelectorAll('.admin-tab');
const adminTabPanels = document.querySelectorAll('.admin-tab-panel');
const numbersGrid = document.getElementById('numbers-grid');
const selectedCount = document.getElementById('selected-count');
const maxSelection = document.getElementById('max-selection');
const totalPrice = document.getElementById('total-price');
const clearSelectionBtn = document.getElementById('clear-selection');
const addToCartBtn = document.getElementById('add-to-cart');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const buyerNameInput = document.getElementById('buyer-name');
const buyerPhoneInput = document.getElementById('buyer-phone');
const buyerEmailInput = document.getElementById('buyer-email');
const agreeTermsCheckbox = document.getElementById('agree-terms');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutNumbers = document.getElementById('checkout-numbers');
const checkoutTotal = document.getElementById('checkout-total');
const paymentMethods = document.querySelectorAll('.payment-method');
const pixInstructions = document.getElementById('pix-instructions');
const cardInstructions = document.getElementById('card-instructions');
const confirmPaymentBtn = document.getElementById('confirm-payment');
const cancelCheckoutBtn = document.getElementById('cancel-checkout');
const raffleTitleInput = document.getElementById('raffle-title-input');
const raffleDescriptionInput = document.getElementById('raffle-description-input');
const rafflePrizeInput = document.getElementById('raffle-prize-input');
const totalNumbersInput = document.getElementById('total-numbers-input');
const pricePerNumberInput = document.getElementById('price-per-number-input');
const maxPerPersonInput = document.getElementById('max-per-person-input');
const saveSettingsBtn = document.getElementById('save-settings');
const salesList = document.getElementById('sales-list');
const salesSearch = document.getElementById('sales-search');
const salesFilter = document.getElementById('sales-filter');
const salesCount = document.getElementById('sales-count');
const exportSalesBtn = document.getElementById('export-sales');
const drawButton = document.getElementById('draw-button');
const winnerSection = document.getElementById('winner-section');
const winnerNumber = document.getElementById('winner-number');
const winnerName = document.getElementById('winner-name');
const winnerPhone = document.getElementById('winner-phone');
const printWinnerBtn = document.getElementById('print-winner');
const shareWinnerBtn = document.getElementById('share-winner');
const editSaleModal = document.getElementById('edit-sale-modal');
const editSaleName = document.getElementById('edit-sale-name');
const editSalePhone = document.getElementById('edit-sale-phone');
const editSaleNumbers = document.getElementById('edit-sale-numbers');
const editSaleStatus = document.getElementById('edit-sale-status');
const saveEditSaleBtn = document.getElementById('save-edit-sale');
const cancelEditSaleBtn = document.getElementById('cancel-edit-sale');

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Carrega dados salvos no localStorage
    loadSavedData();
    
    // Atualiza a interface com os dados da rifa
    updateRaffleInfo();
    
    // Gera a grade de números
    generateNumberGrid();
    
    // Configura os event listeners
    setupEventListeners();
});

// Carrega dados salvos no localStorage
function loadSavedData() {
    const savedRaffle = localStorage.getItem('raffleData');
    const savedSales = localStorage.getItem('raffleSales');
    
    if (savedRaffle) {
        Object.assign(raffleData, JSON.parse(savedRaffle));
    }
    
    if (savedSales) {
        raffleData.sales = JSON.parse(savedSales);
        // Atualiza os números vendidos
        raffleData.soldNumbers = raffleData.sales.flatMap(sale => sale.numbers);
    }
}

// Salva dados no localStorage
function saveData() {
    localStorage.setItem('raffleData', JSON.stringify(raffleData));
    localStorage.setItem('raffleSales', JSON.stringify(raffleData.sales));
}

// Atualiza as informações da rifa na interface
function updateRaffleInfo() {
    document.getElementById('raffle-title').textContent = raffleData.title;
    document.getElementById('raffle-description').textContent = raffleData.description;
    document.getElementById('raffle-prize').textContent = `Prêmio: ${raffleData.prize}`;
    document.getElementById('total-numbers').textContent = `Total de números: ${raffleData.totalNumbers}`;
    document.getElementById('price-per-number').textContent = `Valor por número: R$ ${raffleData.pricePerNumber.toFixed(2).replace('.', ',')}`;
    document.getElementById('max-per-person').textContent = `Máximo por pessoa: ${raffleData.maxPerPerson} números`;
    
    // Atualiza também no painel admin se existir
    if (raffleTitleInput) {
        raffleTitleInput.value = raffleData.title;
        raffleDescriptionInput.value = raffleData.description;
        rafflePrizeInput.value = raffleData.prize;
        totalNumbersInput.value = raffleData.totalNumbers;
        pricePerNumberInput.value = raffleData.pricePerNumber;
        maxPerPersonInput.value = raffleData.maxPerPerson;
    }
    
    // Atualiza o máximo de seleção
    maxSelection.textContent = raffleData.maxPerPerson;
}

// Gera a grade de números
function generateNumberGrid() {
    numbersGrid.innerHTML = '';
    
    for (let i = 1; i <= raffleData.totalNumbers; i++) {
        const numberItem = document.createElement('div');
        numberItem.className = 'number-item border border-gray-300';
        numberItem.textContent = i.toString().padStart(2, '0');
        numberItem.dataset.number = i;
        
        // Verifica se o número já foi vendido
        if (raffleData.soldNumbers.includes(i)) {
            numberItem.classList.add('sold');
            numberItem.title = 'Número já vendido';
        } else {
            numberItem.addEventListener('click', () => toggleNumberSelection(i));
        }
        
        numbersGrid.appendChild(numberItem);
    }
}

// Alterna a seleção de um número
function toggleNumberSelection(number) {
    const index = currentBuyer.selectedNumbers.indexOf(number);
    const numberElement = document.querySelector(`.number-item[data-number="${number}"]`);
    
    if (index === -1) {
        // Verifica se já atingiu o máximo por pessoa
        if (currentBuyer.selectedNumbers.length >= raffleData.maxPerPerson) {
            alert(`Você só pode selecionar no máximo ${raffleData.maxPerPerson} números.`);
            return;
        }
        
        currentBuyer.selectedNumbers.push(number);
        numberElement.classList.add('selected');
    } else {
        currentBuyer.selectedNumbers.splice(index, 1);
        numberElement.classList.remove('selected');
    }
    
    updateSelectionInfo();
}

// Atualiza as informações de seleção
function updateSelectionInfo() {
    selectedCount.textContent = currentBuyer.selectedNumbers.length;
    totalPrice.textContent = (currentBuyer.selectedNumbers.length * raffleData.pricePerNumber).toFixed(2).replace('.', ',');
    
    // Habilita/desabilita o botão de adicionar ao carrinho
    addToCartBtn.disabled = currentBuyer.selectedNumbers.length === 0;
}

// Configura os event listeners
function setupEventListeners() {
    // Navegação entre comprador e admin
    adminLoginBtn.addEventListener('click', () => {
        buyerPanel.style.display = 'none';
        adminPanel.style.display = 'block';
        showModal(loginModal);
    });
    
    // Login do admin
    cancelLoginBtn.addEventListener('click', () => {
        hideModal(loginModal);
        buyerPanel.style.display = 'block';
        adminPanel.style.display = 'none';
    });
    
    confirmLoginBtn.addEventListener('click', () => {
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        
        if (username === adminCredentials.username && password === adminCredentials.password) {
            hideModal(loginModal);
            adminContent.classList.remove('hidden');
            updateSalesList();
        } else {
            alert('Usuário ou senha incorretos!');
        }
    });
    
    logoutBtn.addEventListener('click', () => {
        adminContent.classList.add('hidden');
        buyerPanel.style.display = 'block';
        adminPanel.style.display = 'none';
        document.getElementById('admin-username').value = '';
        document.getElementById('admin-password').value = '';
    });
    
    // Abas do admin
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove a classe active de todas as abas
            adminTabs.forEach(t => t.classList.remove('active', 'text-blue-600', 'border-blue-600'));
            adminTabs.forEach(t => t.classList.add('text-gray-600'));
            
            // Adiciona a classe active à aba clicada
            tab.classList.add('active', 'text-blue-600', 'border-blue-600');
            tab.classList.remove('text-gray-600');
            
            // Esconde todos os painéis
            adminTabPanels.forEach(panel => panel.classList.add('hidden'));
            
            // Mostra o painel correspondente
            const tabId = tab.dataset.tab;
            appState.currentTab = tabId;
            document.getElementById(`${tabId}-tab`).classList.remove('hidden');
            
            // Atualiza dados específicos da aba se necessário
            if (tabId === 'sales') {
                updateSalesList();
            }
        });
    });
    
    // Limpar seleção de números
    clearSelectionBtn.addEventListener('click', () => {
        currentBuyer.selectedNumbers.forEach(num => {
            const el = document.querySelector(`.number-item[data-number="${num}"]`);
            if (el) el.classList.remove('selected');
        });
        
        currentBuyer.selectedNumbers = [];
        updateSelectionInfo();
    });
    
    // Adicionar ao carrinho
    addToCartBtn.addEventListener('click', () => {
        addToCart();
    });
    
    // Finalizar compra
    checkoutBtn.addEventListener('click', () => {
        if (!buyerNameInput.value || !buyerPhoneInput.value) {
            alert('Por favor, preencha pelo menos nome e telefone.');
            return;
        }
        
        if (!agreeTermsCheckbox.checked) {
            alert('Você precisa concordar com os termos e condições.');
            return;
        }
        
        showCheckoutModal();
    });
    
    // Métodos de pagamento
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            // Remove a seleção de todos os métodos
            paymentMethods.forEach(m => {
                m.classList.remove('border-2', 'border-blue-500');
            });
            
            // Adiciona a seleção ao método clicado
            method.classList.add('border-2', 'border-blue-500');
            appState.selectedPaymentMethod = method.dataset.method;
            
            // Mostra as instruções correspondentes
            pixInstructions.classList.add('hidden');
            cardInstructions.classList.add('hidden');
            
            if (appState.selectedPaymentMethod === 'pix') {
                pixInstructions.classList.remove('hidden');
            } else if (appState.selectedPaymentMethod === 'card') {
                cardInstructions.classList.remove('hidden');
            }
            
            // Habilita o botão de confirmar pagamento
            confirmPaymentBtn.disabled = false;
        });
    });
    
    // Confirmar pagamento
    confirmPaymentBtn.addEventListener('click', () => {
        processPayment();
    });
    
    // Cancelar checkout
    cancelCheckoutBtn.addEventListener('click', () => {
        hideModal(checkoutModal);
    });
    
    // Salvar configurações
    saveSettingsBtn.addEventListener('click', () => {
        saveRaffleSettings();
    });
    
    // Busca e filtro de vendas
    salesSearch.addEventListener('input', () => {
        updateSalesList();
    });
    
    salesFilter.addEventListener('change', () => {
        updateSalesList();
    });
    
    // Exportar vendas
    exportSalesBtn.addEventListener('click', () => {
        exportSales();
    });
    
    // Realizar sorteio
    drawButton.addEventListener('click', () => {
        drawWinner();
    });
    
    // Imprimir resultado
    printWinnerBtn.addEventListener('click', () => {
        window.print();
    });
    
    // Compartilhar resultado
    shareWinnerBtn.addEventListener('click', () => {
        shareResult();
    });
    
    // Observa mudanças nos campos do comprador
    buyerNameInput.addEventListener('input', validateBuyerInfo);
    buyerPhoneInput.addEventListener('input', validateBuyerInfo);
    buyerEmailInput.addEventListener('input', validateBuyerInfo);
    agreeTermsCheckbox.addEventListener('change', validateBuyerInfo);
    
    // Observa mudanças nos campos de edição de venda
    editSaleNumbers.addEventListener('click', (e) => {
        if (e.target.classList.contains('number-badge')) {
            e.target.remove();
        }
    });
    
    // Salvar edição de venda
    saveEditSaleBtn.addEventListener('click', () => {
        saveEditedSale();
    });
    
    // Cancelar edição de venda
    cancelEditSaleBtn.addEventListener('click', () => {
        hideModal(editSaleModal);
    });
}

// Adiciona números selecionados ao carrinho
function addToCart() {
    const cartItem = document.createElement('tr');
    cartItem.className = 'border-b';
    cartItem.innerHTML = `
        <td class="py-2 px-4">${currentBuyer.selectedNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}</td>
        <td class="py-2 px-4 text-right">R$ ${(currentBuyer.selectedNumbers.length * raffleData.pricePerNumber).toFixed(2).replace('.', ',')}</td>
        <td class="py-2 px-4 text-right">
            <button class="edit-cart-item text-blue-500 hover:text-blue-700 mr-2">
                <i class="fas fa-edit"></i>
            </button>
            <button class="remove-cart-item text-red-500 hover:text-red-700">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    
    cartItems.appendChild(cartItem);
    
    // Adiciona event listeners aos botões do item
    cartItem.querySelector('.edit-cart-item').addEventListener('click', () => {
        editCartItem(cartItem);
    });
    
    cartItem.querySelector('.remove-cart-item').addEventListener('click', () => {
        removeCartItem(cartItem);
    });
    
    // Atualiza o total do carrinho
    updateCartTotal();
    
    // Limpa a seleção
    clearSelectionBtn.click();
}

// Edita um item do carrinho
function editCartItem(item) {
    // Implementação simplificada - em produção seria mais complexa
    if (confirm('Deseja remover este item para selecionar novos números?')) {
        removeCartItem(item);
    }
}

// Remove um item do carrinho
function removeCartItem(item) {
    item.remove();
    updateCartTotal();
}

// Atualiza o total do carrinho
function updateCartTotal() {
    let total = 0;
    const items = cartItems.querySelectorAll('tr');
    
    items.forEach(item => {
        const priceText = item.querySelector('td:nth-child(2)').textContent;
        const price = parseFloat(priceText.replace('R$ ', '').replace(',', '.'));
        total += price;
    });
    
    cartTotal.textContent = total.toFixed(2).replace('.', ',');
    
    // Habilita/desabilita o botão de finalizar compra
    checkoutBtn.disabled = items.length === 0;
}

// Valida informações do comprador
function validateBuyerInfo() {
    // Verifica se há itens no carrinho
    const hasItems = cartItems.querySelectorAll('tr').length > 0;
    
    // Verifica se os campos obrigatórios estão preenchidos
    const nameValid = buyerNameInput.value.trim() !== '';
    const phoneValid = buyerPhoneInput.value.trim() !== '';
    const termsValid = agreeTermsCheckbox.checked;
    
    // Habilita/desabilita o botão de finalizar compra
    checkoutBtn.disabled = !(hasItems && nameValid && phoneValid && termsValid);
}

// Mostra o modal de checkout
function showCheckoutModal() {
    // Atualiza os números no modal
    const numbers = [];
    cartItems.querySelectorAll('tr').forEach(row => {
        numbers.push(row.querySelector('td:first-child').textContent);
    });
    
    checkoutNumbers.textContent = numbers.join(' | ');
    checkoutTotal.textContent = cartTotal.textContent;
    
    // Reseta o método de pagamento selecionado
    appState.selectedPaymentMethod = null;
    paymentMethods.forEach(m => m.classList.remove('border-2', 'border-blue-500'));
    pixInstructions.classList.add('hidden');
    cardInstructions.classList.add('hidden');
    confirmPaymentBtn.disabled = true;
    
    showModal(checkoutModal);
}

// Processa o pagamento
function processPayment() {
    // Aqui seria feita a integração com a API de pagamento
    // Esta é apenas uma simulação
    
    // Coleta os números comprados
    const numbers = [];
    cartItems.querySelectorAll('tr').forEach(row => {
        const numsText = row.querySelector('td:first-child').textContent;
        numsText.split(',').forEach(num => {
            numbers.push(parseInt(num.trim()));
        });
    });
    
    // Cria a venda
    const sale = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        name: buyerNameInput.value.trim(),
        phone: buyerPhoneInput.value.trim(),
        email: buyerEmailInput.value.trim(),
        numbers: numbers,
        amount: parseFloat(cartTotal.textContent.replace('R$ ', '').replace(',', '.')),
        status: appState.selectedPaymentMethod === 'pix' ? 'pending' : 'paid'
    };
    
    // Adiciona à lista de vendas
    raffleData.sales.push(sale);
    
    // Marca os números como vendidos
    raffleData.soldNumbers.push(...numbers);
    
    // Atualiza o localStorage
    saveData();
    
    // Limpa o carrinho
    cartItems.innerHTML = '';
    updateCartTotal();
    
    // Limpa os campos do comprador
    buyerNameInput.value = '';
    buyerPhoneInput.value = '';
    buyerEmailInput.value = '';
    agreeTermsCheckbox.checked = false;
    
    // Fecha o modal
    hideModal(checkoutModal);
    
    // Mostra mensagem de sucesso
    alert('Compra realizada com sucesso! Obrigado por participar.');
    
    // Atualiza a grade de números
    generateNumberGrid();
}

// Salva as configurações da rifa
function saveRaffleSettings() {
    // Atualiza os dados da rifa
    raffleData.title = raffleTitleInput.value;
    raffleData.description = raffleDescriptionInput.value;
    raffleData.prize = rafflePrizeInput.value;
    raffleData.totalNumbers = parseInt(totalNumbersInput.value);
    raffleData.pricePerNumber = parseFloat(pricePerNumberInput.value);
    raffleData.maxPerPerson = parseInt(maxPerPersonInput.value);
    
    // Salva no localStorage
    saveData();
    
    // Atualiza a interface do comprador
    updateRaffleInfo();
    generateNumberGrid();
    
    // Mostra mensagem de sucesso
    alert('Configurações salvas com sucesso!');
}

// Atualiza a lista de vendas
function updateSalesList() {
    const searchTerm = salesSearch.value.toLowerCase();
    const filter = salesFilter.value;
    
    // Filtra as vendas
    let filteredSales = raffleData.sales;
    
    if (searchTerm) {
        filteredSales = filteredSales.filter(sale => 
            sale.name.toLowerCase().includes(searchTerm) || 
            sale.phone.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filter !== 'all') {
        filteredSales = filteredSales.filter(sale => sale.status === filter);
    }
    
    // Atualiza a contagem
    salesCount.textContent = filteredSales.length;
    
    // Renderiza as vendas
    salesList.innerHTML = '';
    
    if (filteredSales.length === 0) {
        salesList.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-gray-500">Nenhuma venda encontrada</td></tr>';
        return;
    }
    
    filteredSales.forEach(sale => {
        const saleRow = document.createElement('tr');
        saleRow.className = 'border-b hover:bg-gray-50';
        saleRow.innerHTML = `
            <td class="py-2 px-4">${sale.date}</td>
            <td class="py-2 px-4">${sale.name}</td>
            <td class="py-2 px-4">${sale.phone}</td>
            <td class="py-2 px-4">${sale.numbers.map(n => n.toString().padStart(2, '0')).join(', ')}</td>
            <td class="py-2 px-4 text-right">R$ ${sale.amount.toFixed(2).replace('.', ',')}</td>
            <td class="py-2 px-4 text-center">
                <span class="px-2 py-1 rounded-full text-xs ${sale.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${sale.status === 'paid' ? 'Pago' : 'Pendente'}
                </span>
            </td>
            <td class="py-2 px-4 text-center">
                <button class="edit-sale text-blue-500 hover:text-blue-700 mr-2" data-id="${sale.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-sale text-red-500 hover:text-red-700" data-id="${sale.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        salesList.appendChild(saleRow);
        
        // Adiciona event listeners aos botões
        saleRow.querySelector('.edit-sale').addEventListener('click', () => {
            editSale(sale.id);
        });
        
        saleRow.querySelector('.delete-sale').addEventListener('click', () => {
            deleteSale(sale.id);
        });
    });
}

// Edita uma venda
function editSale(saleId) {
    const sale = raffleData.sales.find(s => s.id === saleId);
    if (!sale) return;
    
    appState.currentSaleId = saleId;
    editSaleName.value = sale.name;
    editSalePhone.value = sale.phone;
    editSaleStatus.value = sale.status;
    
    // Preenche os números
    editSaleNumbers.innerHTML = '';
    sale.numbers.forEach(num => {
        const badge = document.createElement('span');
        badge.className = 'number-badge bg-blue-100 text-blue-800 px-2 py-1 rounded-md mr-1 mb-1 inline-block';
        badge.textContent = num.toString().padStart(2, '0');
        editSaleNumbers.appendChild(badge);
    });
    
    showModal(editSaleModal);
}

// Salva a edição de uma venda
function saveEditedSale() {
    const saleIndex = raffleData.sales.findIndex(s => s.id === appState.currentSaleId);
    if (saleIndex === -1) return;
    
    // Atualiza os dados da venda
    raffleData.sales[saleIndex].name = editSaleName.value;
    raffleData.sales[saleIndex].phone = editSalePhone.value;
    raffleData.sales[saleIndex].status = editSaleStatus.value;
    
    // Atualiza os números (simplificado - em produção seria mais complexo)
    const newNumbers = [];
    editSaleNumbers.querySelectorAll('.number-badge').forEach(badge => {
        newNumbers.push(parseInt(badge.textContent));
    });
    
    // Remove os números antigos da lista de vendidos
    raffleData.soldNumbers = raffleData.soldNumbers.filter(num => 
        !raffleData.sales[saleIndex].numbers.includes(num)
    );
    
    // Atualiza os números da venda
    raffleData.sales[saleIndex].numbers = newNumbers;
    
    // Adiciona os novos números à lista de vendidos
    raffleData.soldNumbers.push(...newNumbers);
    
    // Atualiza o valor total
    raffleData.sales[saleIndex].amount = newNumbers.length * raffleData.pricePerNumber;
    
    // Salva no localStorage
    saveData();
    
    // Atualiza a lista de vendas
    updateSalesList();
    
    // Atualiza a grade de números
    generateNumberGrid();
    
    // Fecha o modal
    hideModal(editSaleModal);
    
    // Mostra mensagem de sucesso
    alert('Venda atualizada com sucesso!');
}

// Exclui uma venda
function deleteSale(saleId) {
    if (!confirm('Tem certeza que deseja excluir esta venda?')) return;
    
    const saleIndex = raffleData.sales.findIndex(s => s.id === saleId);
    if (saleIndex === -1) return;
    
    // Remove os números da lista de vendidos
    raffleData.soldNumbers = raffleData.soldNumbers.filter(num => 
        !raffleData.sales[saleIndex].numbers.includes(num)
    );
    
    // Remove a venda
    raffleData.sales.splice(saleIndex, 1);
    
    // Salva no localStorage
    saveData();
    
    // Atualiza a lista de vendas
    updateSalesList();
    
    // Atualiza a grade de números
    generateNumberGrid();
    
    // Mostra mensagem de sucesso
    alert('Venda excluída com sucesso!');
}

// Exporta as vendas
function exportSales() {
    // Simula a exportação para CSV
    let csv = 'Data,Nome,Telefone,Números,Valor,Status\n';
    
    raffleData.sales.forEach(sale => {
        csv += `"${sale.date}","${sale.name}","${sale.phone}","${sale.numbers.join(',')}",${sale.amount},"${sale.status === 'paid' ? 'Pago' : 'Pendente'}"\n`;
    });
    
    // Cria um link de download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendas_rifa_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Exportação realizada com sucesso!');
}

// Realiza o sorteio
function drawWinner() {
    // Verifica se há números vendidos
    if (raffleData.soldNumbers.length === 0) {
        alert('Nenhum número foi vendido ainda!');
        return;
    }
    
    // Sorteia um número aleatório entre os vendidos
    const randomIndex = Math.floor(Math.random() * raffleData.soldNumbers.length);
    const winnerNumber = raffleData.soldNumbers[randomIndex];
    
    // Encontra a venda correspondente
    const winningSale = raffleData.sales.find(sale => 
        sale.numbers.includes(winnerNumber)
    );
    
    if (!winningSale) {
        alert('Erro ao encontrar o ganhador!');
        return;
    }
    
    // Exibe o resultado
    document.getElementById('winner-number').textContent = winnerNumber.toString().padStart(2, '0');
    document.getElementById('winner-name').textContent = winningSale.name;
    document.getElementById('winner-phone').textContent = winningSale.phone;
    
    // Mostra a seção do ganhador
    winnerSection.classList.remove('hidden');
    
    // Rola a página para o resultado
    winnerSection.scrollIntoView({ behavior: 'smooth' });
}

// Compartilha o resultado
function shareResult() {
    // Simula o compartilhamento
    const text = `O número ${document.getElementById('winner-number').textContent} foi o ganhador da rifa ${raffleData.title}! Parabéns ${document.getElementById('winner-name').textContent}!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Resultado da Rifa',
            text: text,
            url: window.location.href
        }).catch(err => {
            console.log('Erro ao compartilhar:', err);
            fallbackShare(text);
        });
    } else {
        fallbackShare(text);
    }
}

// Fallback para compartilhamento
function fallbackShare(text) {
    prompt('Copie o texto para compartilhar:', text);
}

// Mostra um modal
function showModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Esconde um modal
function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

