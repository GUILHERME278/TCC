// ==================== RIFA CORE OTIMIZADA ====================
// Arquivo: rifa-core-optimized.js
// Responsável apenas pela navegação, renderização e lógica principal da rifa
// Funcionalidades de busca e validação são carregadas separadamente

// ==================== CONFIGURAÇÕES PRINCIPAIS ====================

const defaultRaffleConfig = {
    title: "Rifa Beneficente",
    description: "Ajude nossa causa e concorra a prêmios incríveis!",
    prize: "Smartphone Novo",
    totalNumbers: 1000,
    pricePerNumber: 5,
    maxPerPerson: 10,
    image: "./img/carro-completo.jpeg"
};

// ==================== VIRTUAL DOM OTIMIZADO ====================

class VirtualNumberGrid {
    constructor(container) {
        this.container = container;
        this.elements = new Map();
        this.currentPage = 0;
        this.numbersPerPage = 100;
        
        // Event delegation - um único listener para todo o container
        this.setupEventDelegation();
        
        console.log('VirtualNumberGrid inicializado');
    }
    
    setupEventDelegation() {
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('number-item')) {
                this.handleNumberClick(e.target);
            }
        });
    }
    
    // Renderização otimizada usando DocumentFragment
    renderPage(page, totalNumbers, soldNumbers = new Set(), cartNumbers = new Set()) {
        const start = page * this.numbersPerPage + 1;
        const end = Math.min(start + this.numbersPerPage - 1, totalNumbers);
        
        // Usa DocumentFragment para evitar múltiplos reflows
        const fragment = document.createDocumentFragment();
        
        // Animação de saída
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(10px)';
        
        // Usa requestAnimationFrame para otimizar a renderização
        requestAnimationFrame(() => {
            this.container.innerHTML = '';
            
            for (let i = start; i <= end; i++) {
                const element = this.createNumberElement(i, soldNumbers, cartNumbers);
                fragment.appendChild(element);
            }
            
            this.container.appendChild(fragment);
            
            // Animação de entrada
            requestAnimationFrame(() => {
                this.container.style.opacity = '1';
                this.container.style.transform = 'translateY(0)';
            });
        });
        
        this.currentPage = page;
    }
    
    createNumberElement(number, soldNumbers, cartNumbers) {
        const element = document.createElement('div');
        element.className = 'number-item';
        element.textContent = number;
        element.dataset.number = number;
        
        // Aplica classes baseado no estado
        if (soldNumbers.has(number)) {
            element.classList.add('sold');
            element.title = 'Número já vendido';
        } else if (cartNumbers.has(number)) {
            element.classList.add('in-cart');
            element.title = 'Número no carrinho';
        }
        
        return element;
    }
    
    handleNumberClick(element) {
        const number = parseInt(element.dataset.number);
        
        // Verifica se o número está disponível
        if (element.classList.contains('sold') || element.classList.contains('in-cart')) {
            this.shakeElement(element);
            return;
        }
        
        // Delega a lógica de seleção para o gerenciador principal
        if (window.numberManager) {
            window.numberManager.toggleSelection(number, element);
        }
    }
    
    shakeElement(element) {
        element.classList.add('shake-animation');
        setTimeout(() => element.classList.remove('shake-animation'), 400);
    }
    
    updateNumberState(number, state) {
        const element = this.container.querySelector(`[data-number="${number}"]`);
        if (element) {
            element.className = 'number-item';
            if (state === 'sold') {
                element.classList.add('sold');
                element.title = 'Número já vendido';
            } else if (state === 'in-cart') {
                element.classList.add('in-cart');
                element.title = 'Número no carrinho';
            } else if (state === 'selected') {
                element.classList.add('selected');
            }
        }
    }
}

// ==================== GERENCIADOR DE NÚMEROS ====================

class NumberManager {
    constructor() {
        this.selectedNumbers = new Set();
        this.cartNumbers = new Set();
        this.soldNumbers = new Set();
        this.maxPerPerson = 10;
        this.pricePerNumber = 5;
        
        this.updateCallbacks = [];
        
        console.log('NumberManager inicializado');
    }
    
    toggleSelection(number, element) {
        if (this.selectedNumbers.has(number)) {
            this.selectedNumbers.delete(number);
            element.classList.remove('selected');
        } else {
            if (this.selectedNumbers.size >= this.maxPerPerson) {
                alert(`Você pode selecionar no máximo ${this.maxPerPerson} números.`);
                return;
            }
            this.selectedNumbers.add(number);
            element.classList.add('selected');
        }
        
        this.notifyUpdate();
    }
    
    addToCart() {
        if (this.selectedNumbers.size === 0) {
            alert('Selecione pelo menos um número para adicionar ao carrinho.');
            return false;
        }
        
        // Adiciona números selecionados ao carrinho
        this.selectedNumbers.forEach(num => {
            this.cartNumbers.add(num);
        });
        
        // Limpa seleção atual
        this.clearSelection();
        this.notifyUpdate();
        
        console.log(`${this.selectedNumbers.size} números adicionados ao carrinho`);
        return true;
    }
    
    removeFromCart(numbers) {
        if (Array.isArray(numbers)) {
            numbers.forEach(num => {
                this.cartNumbers.delete(parseInt(num));
            });
        } else {
            this.cartNumbers.delete(parseInt(numbers));
        }
        this.notifyUpdate();
    }
    
    clearSelection() {
        this.selectedNumbers.clear();
        document.querySelectorAll('.number-item.selected').forEach(el => {
            el.classList.remove('selected');
        });
        this.notifyUpdate();
    }
    
    clearCart() {
        this.cartNumbers.clear();
        this.notifyUpdate();
    }
    
    setSoldNumbers(soldNumbers) {
        this.soldNumbers = new Set(soldNumbers.map(num => parseInt(num)));
        this.notifyUpdate();
    }
    
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }
    
    notifyUpdate() {
        this.updateCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Erro no callback de atualização:', error);
            }
        });
    }
    
    getSelectedTotal() {
        return this.selectedNumbers.size * this.pricePerNumber;
    }
    
    getCartTotal() {
        return this.cartNumbers.size * this.pricePerNumber;
    }
    
    getSelectedNumbers() {
        return Array.from(this.selectedNumbers).sort((a, b) => a - b);
    }
    
    getCartNumbers() {
        return Array.from(this.cartNumbers).sort((a, b) => a - b);
    }
}

// ==================== NAVEGAÇÃO OTIMIZADA ====================

class PageNavigator {
    constructor(totalNumbers, numbersPerPage = 100) {
        this.totalNumbers = totalNumbers;
        this.numbersPerPage = numbersPerPage;
        this.totalPages = Math.ceil(totalNumbers / numbersPerPage);
        this.currentPage = 0;
        
        this.setupNavigation();
        
        console.log(`PageNavigator inicializado: ${this.totalPages} páginas`);
    }
    
    setupNavigation() {
        // Event delegation para dots
        const menuDots = document.querySelector(".menu") || document.querySelector(".menu-small");
        if (menuDots) {
            menuDots.addEventListener('click', (e) => {
                if (e.target.classList.contains('dot')) {
                    const page = parseInt(e.target.dataset.page);
                    this.navigateToPage(page);
                }
            });
        }
        
        // Setas de navegação
        const prevBtn = document.getElementById("prev-numbers");
        const nextBtn = document.getElementById("next-numbers");
        
        prevBtn?.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.navigateToPage(this.currentPage - 1);
            }
        });
        
        nextBtn?.addEventListener('click', () => {
            if (this.currentPage < this.totalPages - 1) {
                this.navigateToPage(this.currentPage + 1);
            }
        });
        
        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (document.activeElement.tagName !== 'INPUT') {
                if (e.key === 'ArrowLeft' && this.currentPage > 0) {
                    e.preventDefault();
                    this.navigateToPage(this.currentPage - 1);
                } else if (e.key === 'ArrowRight' && this.currentPage < this.totalPages - 1) {
                    e.preventDefault();
                    this.navigateToPage(this.currentPage + 1);
                }
            }
        });
    }
    
    navigateToPage(page) {
        if (page === this.currentPage || page < 0 || page >= this.totalPages) {
            return;
        }
        
        // Salva seleção atual antes de trocar de página
        this.saveCurrentSelection();
        
        this.currentPage = page;
        this.renderCurrentPage();
        this.updateNavigationState();
        
        console.log(`Navegando para página ${page + 1}/${this.totalPages}`);
    }
    
    saveCurrentSelection() {
        // Salva números selecionados na página atual
        const selectedInPage = document.querySelectorAll('.number-item.selected');
        selectedInPage.forEach(element => {
            const number = parseInt(element.textContent);
            window.numberManager?.selectedNumbers.add(number);
        });
    }
    
    async renderCurrentPage() {
        if (!window.virtualGrid) return;
        
        let soldNumbers = new Set();
        
        // Busca números vendidos se o módulo de busca estiver disponível
        if (window.databaseSearchManager) {
            try {
                const sold = await window.databaseSearchManager.fetchSoldNumbers();
                soldNumbers = new Set(sold);
            } catch (error) {
                console.warn('Erro ao buscar números vendidos:', error);
            }
        }
        
        const cartNumbers = window.numberManager?.cartNumbers || new Set();
        
        window.virtualGrid.renderPage(
            this.currentPage,
            this.totalNumbers,
            soldNumbers,
            cartNumbers
        );
        
        // Restaura seleção na nova página
        this.restoreSelectionInPage();
    }
    
    restoreSelectionInPage() {
        if (!window.numberManager) return;
        
        const numbersInPage = document.querySelectorAll('.number-item');
        numbersInPage.forEach(element => {
            const number = parseInt(element.textContent);
            if (window.numberManager.selectedNumbers.has(number)) {
                element.classList.add('selected');
            }
        });
    }
    
    updateNavigationState() {
        // Atualizar dots ativos
        document.querySelectorAll('.dot').forEach((dot, index) => {
            const isActive = index === this.currentPage;
            dot.classList.toggle('active', isActive);
            
            if (isActive) {
                dot.classList.add('dot-bounce');
                setTimeout(() => dot.classList.remove('dot-bounce'), 300);
            }
        });
        
        // Atualizar setas
        const prevBtn = document.getElementById("prev-numbers");
        const nextBtn = document.getElementById("next-numbers");
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 0;
            prevBtn.style.opacity = this.currentPage === 0 ? "0.5" : "1";
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages - 1;
            nextBtn.style.opacity = this.currentPage >= this.totalPages - 1 ? "0.5" : "1";
        }
    }
    
    generateDots() {
        const menuDots = document.querySelector(".menu") || document.querySelector(".menu-small");
        if (!menuDots) return;
        
        // Usa DocumentFragment para performance
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < this.totalPages; i++) {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            dot.dataset.page = i;
            dot.title = `Página ${i + 1}`;
            
            if (i === this.currentPage) {
                dot.classList.add("active");
            }
            
            fragment.appendChild(dot);
        }
        
        menuDots.innerHTML = '';
        menuDots.appendChild(fragment);
        
        console.log(`${this.totalPages} dots de navegação gerados`);
    }
}

// ==================== GERENCIADOR DE INTERFACE ====================

class UIManager {
    constructor() {
        this.elements = {};
        this.cacheElements();
        this.setupEventListeners();
        
        console.log('UIManager inicializado');
    }
    
    cacheElements() {
        this.elements = {
            numbersGrid: document.getElementById("numbers-grid"),
            totalPrice: document.getElementById("total-price"),
            cartItems: document.getElementById("cart-items"),
            cartTotal: document.getElementById("cart-total"),
            addToCartBtn: document.getElementById("add-to-cart"),
            clearSelectionBtn: document.getElementById("clear-selection"),
            checkoutBtn: document.getElementById("checkout-btn"),
            modal: document.getElementById("modal"),
            openModalBtn: document.getElementById("openModalButton"),
            closeModalBtn: document.getElementById("closeModalButton"),
            emptyCartRow: document.getElementById("empty-cart-row")
        };
    }
    
    setupEventListeners() {
        // Botão adicionar ao carrinho
        this.elements.addToCartBtn?.addEventListener('click', () => {
            if (window.numberManager?.addToCart()) {
                this.updateCartDisplay();
                this.showNotification('Números adicionados ao carrinho!', 'success');
            }
        });
        
        // Botão limpar seleção
        this.elements.clearSelectionBtn?.addEventListener('click', () => {
            window.numberManager?.clearSelection();
        });
        
        // Modal
        this.elements.openModalBtn?.addEventListener('click', () => {
            this.openModal();
        });
        
        this.elements.closeModalBtn?.addEventListener('click', () => {
            this.closeModal();
        });
        
        this.elements.modal?.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.closeModal();
            }
        });
        
        // Escape para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // Callbacks de atualização do NumberManager
        if (window.numberManager) {
            window.numberManager.onUpdate(() => {
                this.updatePriceDisplay();
                this.updateButtonStates();
                this.updateCartDisplay();
            });
        }
    }
    
    updatePriceDisplay() {
        if (this.elements.totalPrice && window.numberManager) {
            const total = window.numberManager.getSelectedTotal();
            this.elements.totalPrice.textContent = total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });
        }
    }
    
    updateButtonStates() {
        if (!window.numberManager) return;
        
        const hasSelection = window.numberManager.selectedNumbers.size > 0;
        const hasCartItems = window.numberManager.cartNumbers.size > 0;
        
        if (this.elements.addToCartBtn) {
            this.elements.addToCartBtn.disabled = !hasSelection;
        }
        
        if (this.elements.clearSelectionBtn) {
            this.elements.clearSelectionBtn.disabled = !hasSelection;
        }
        
        if (this.elements.checkoutBtn) {
            // Validação será feita pelo módulo de validação quando carregado
            this.elements.checkoutBtn.disabled = !hasCartItems;
        }
    }
    
    updateCartDisplay() {
        if (!this.elements.cartItems || !window.numberManager) return;
        
        const cartNumbers = window.numberManager.getCartNumbers();
        const cartTotal = window.numberManager.getCartTotal();
        
        // Limpa itens atuais (exceto a linha vazia)
        const existingItems = this.elements.cartItems.querySelectorAll('tr:not(#empty-cart-row)');
        existingItems.forEach(item => item.remove());
        
        if (cartNumbers.length === 0) {
            // Mostra mensagem de carrinho vazio
            this.elements.emptyCartRow?.classList.remove('hidden');
        } else {
            // Esconde mensagem de carrinho vazio
            this.elements.emptyCartRow?.classList.add('hidden');
            
            // Adiciona números ao carrinho (agrupados)
            this.addCartItem(cartNumbers);
        }
        
        // Atualiza total do carrinho
        if (this.elements.cartTotal) {
            this.elements.cartTotal.textContent = cartTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
    }
    
    addCartItem(numbers) {
        if (!numbers || numbers.length === 0) return;
        
        const row = document.createElement('tr');
        row.className = 'border-b';
        
        // Coluna dos números
        const numbersCell = document.createElement('td');
        numbersCell.className = 'py-3 px-4 border';
        numbersCell.textContent = numbers.join(', ');
        
        // Coluna do preço
        const priceCell = document.createElement('td');
        priceCell.className = 'py-3 px-4 text-right border';
        const total = numbers.length * (window.numberManager?.pricePerNumber || 5);
        priceCell.textContent = total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
        
        // Coluna de ações (remover)
        const actionsCell = document.createElement('td');
        actionsCell.className = 'text-center py-3 px-5 border';
        const removeIcon = document.createElement('i');
        removeIcon.className = 'fas fa-trash red-trash-icon';
        removeIcon.style.cursor = 'pointer';
        removeIcon.title = 'Remover do carrinho';
        
        removeIcon.addEventListener('click', () => {
            window.numberManager?.removeFromCart(numbers);
            this.showNotification('Números removidos do carrinho!', 'info');
        });
        
        actionsCell.appendChild(removeIcon);
        
        row.appendChild(numbersCell);
        row.appendChild(priceCell);
        row.appendChild(actionsCell);
        
        this.elements.cartItems.appendChild(row);
    }
    
    openModal() {
        if (this.elements.modal) {
            this.elements.modal.classList.remove('hidden');
            this.updateCartDisplay();
        }
    }
    
    closeModal() {
        if (this.elements.modal) {
            this.elements.modal.classList.add('hidden');
        }
    }
    
    showNotification(message, type = 'info') {
        // Implementação simples de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            z-index: 10000;
            transition: all 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#212529';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// ==================== CONFIGURAÇÃO DA RIFA ====================

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

function applyRaffleConfig(config) {
    // Atualiza elementos da interface
    const titleElement = document.querySelector("h2");
    if (titleElement) {
        titleElement.textContent = config.title;
    }
    
    const descriptionElement = document.querySelector("p");
    if (descriptionElement) {
        descriptionElement.textContent = config.description;
    }
    
    // Atualiza informações específicas
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
    
    // Atualiza configurações do NumberManager
    if (window.numberManager) {
        window.numberManager.maxPerPerson = config.maxPerPerson;
        window.numberManager.pricePerNumber = config.pricePerNumber;
    }
    
    console.log('Configurações da rifa aplicadas:', config);
}

// ==================== INICIALIZAÇÃO PRINCIPAL ====================

async function initializeRiffaCore() {
    console.log('Inicializando Rifa Core...');
    
    // Carrega configurações
    const config = loadRaffleConfig();
    
    // Inicializa gerenciadores principais
    window.numberManager = new NumberManager();
    window.virtualGrid = new VirtualNumberGrid(document.getElementById("numbers-grid"));
    window.pageNavigator = new PageNavigator(config.totalNumbers);
    window.uiManager = new UIManager();
    
    // Aplica configurações
    applyRaffleConfig(config);
    
    // Gera navegação
    window.pageNavigator.generateDots();
    
    // Renderiza primeira página
    await window.pageNavigator.renderCurrentPage();
    
    // Atualização periódica (apenas se módulo de busca estiver disponível)
    if (window.databaseSearchManager) {
        setInterval(async () => {
            try {
                const soldNumbers = await window.databaseSearchManager.fetchSoldNumbers();
                window.numberManager.setSoldNumbers(soldNumbers);
                
                // Atualiza apenas se a página atual foi afetada
                const currentPageStart = window.pageNavigator.currentPage * 100 + 1;
                const currentPageEnd = Math.min(currentPageStart + 99, config.totalNumbers);
                
                const pageAffected = soldNumbers.some(num => 
                    num >= currentPageStart && num <= currentPageEnd
                );
                
                if (pageAffected) {
                    await window.pageNavigator.renderCurrentPage();
                }
            } catch (error) {
                console.warn('Erro na atualização periódica:', error);
            }
        }, 30000); // 30 segundos
    }
    
    console.log('Rifa Core inicializada com sucesso!');
}

// ==================== INICIALIZAÇÃO ====================

// Inicialização quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRiffaCore);
} else {
    initializeRiffaCore();
}

// Exporta para compatibilidade
window.initializeRiffaCore = initializeRiffaCore;

