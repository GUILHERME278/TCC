// ==================== MÓDULO DE BUSCA NO BANCO DE DADOS ====================
// Arquivo: database-search.js
// Responsável por todas as operações de busca e comunicação com o backend

class DatabaseSearchManager {
    constructor() {
        this.cache = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 segundo
        
        // Configurações de endpoints
        this.endpoints = {
            soldNumbers: '/TCC/backend/controller/BuscarComprados.php',
            searchByCPF: '/TCC/backend/controller/busca.php',
            submitPurchase: '/TCC/backend/controller/cadastro.php'
        };
        
        // TTL para cache (30 segundos)
        this.cacheTTL = 30000;
        
        console.log('DatabaseSearchManager inicializado');
    }
    
    // ==================== CACHE INTELIGENTE ====================
    
    setCacheItem(key, value) {
        this.cache.set(key, {
            data: value,
            timestamp: Date.now()
        });
    }
    
    getCacheItem(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        const isExpired = (Date.now() - item.timestamp) > this.cacheTTL;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }
    
    invalidateCache(key) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }
    
    // ==================== BUSCA DE NÚMEROS VENDIDOS ====================
    
    async fetchSoldNumbers(forceRefresh = false) {
        const cacheKey = 'soldNumbers';
        
        // Verifica cache primeiro (se não for refresh forçado)
        if (!forceRefresh) {
            const cached = this.getCacheItem(cacheKey);
            if (cached) {
                console.log('Números vendidos carregados do cache');
                return cached;
            }
        }
        
        try {
            console.log('Buscando números vendidos do servidor...');
            const response = await this.makeRequest(this.endpoints.soldNumbers);
            const data = await response.json();
            
            if (data.success && data.numeros) {
                const soldNumbers = data.numeros.map(num => parseInt(num));
                this.setCacheItem(cacheKey, soldNumbers);
                console.log(`${soldNumbers.length} números vendidos carregados`);
                return soldNumbers;
            } else {
                console.warn('Resposta inválida do servidor:', data);
                return [];
            }
        } catch (error) {
            console.error('Erro ao buscar números vendidos:', error);
            
            // Retorna cache expirado se houver erro
            const expiredCache = this.cache.get(cacheKey);
            if (expiredCache) {
                console.log('Usando cache expirado devido ao erro');
                return expiredCache.data;
            }
            
            return [];
        }
    }
    
    // ==================== BUSCA POR CPF ====================
    
    async searchNumbersByCPF(cpf) {
        if (!cpf || cpf.trim() === '') {
            throw new Error('CPF é obrigatório');
        }
        
        // Normaliza o CPF (remove caracteres não numéricos)
        const cleanCPF = cpf.replace(/\D/g, '');
        
        if (cleanCPF.length !== 11) {
            throw new Error('CPF deve conter 11 dígitos');
        }
        
        const cacheKey = `cpf_${cleanCPF}`;
        
        // Verifica cache (TTL menor para buscas por CPF - 10 segundos)
        const cached = this.getCacheItem(cacheKey);
        if (cached) {
            console.log(`Números do CPF ${cleanCPF} carregados do cache`);
            return cached;
        }
        
        try {
            console.log(`Buscando números para CPF: ${cleanCPF}`);
            
            const response = await this.makeRequest(this.endpoints.searchByCPF, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cpf: cleanCPF })
            });
            
            const data = await response.json();
            
            if (data.success) {
                const result = {
                    cpf: data.cpf || cleanCPF,
                    numbers: data.numeros || [],
                    found: data.numeros && data.numeros.length > 0
                };
                
                // Cache com TTL menor (10 segundos)
                this.cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
                
                console.log(`Encontrados ${result.numbers.length} números para CPF ${cleanCPF}`);
                return result;
            } else {
                throw new Error(data.message || 'Erro na busca por CPF');
            }
        } catch (error) {
            console.error('Erro ao buscar por CPF:', error);
            throw error;
        }
    }
    
    // ==================== SUBMISSÃO DE COMPRA ====================
    
    async submitPurchase(purchaseData) {
        // Validação básica dos dados
        if (!this.validatePurchaseData(purchaseData)) {
            throw new Error('Dados de compra inválidos');
        }
        
        try {
            console.log('Enviando compra para o servidor...');
            
            const response = await this.makeRequest(this.endpoints.submitPurchase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(purchaseData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Compra realizada com sucesso');
                // Invalida cache de números vendidos para forçar atualização
                this.invalidateCache('soldNumbers');
                return result;
            } else {
                throw new Error(result.message || 'Erro ao processar compra');
            }
        } catch (error) {
            console.error('Erro ao enviar compra:', error);
            throw error;
        }
    }
    
    // ==================== VALIDAÇÃO DE DADOS ====================
    
    validatePurchaseData(data) {
        const required = ['nome', 'cpf', 'telefone', 'numeros', 'total'];
        
        for (const field of required) {
            if (!data[field]) {
                console.error(`Campo obrigatório ausente: ${field}`);
                return false;
            }
        }
        
        // Validação específica do CPF
        const cleanCPF = data.cpf.replace(/\D/g, '');
        if (cleanCPF.length !== 11) {
            console.error('CPF inválido');
            return false;
        }
        
        // Validação dos números
        if (!Array.isArray(data.numeros) && typeof data.numeros !== 'string') {
            console.error('Números inválidos');
            return false;
        }
        
        return true;
    }
    
    // ==================== REQUISIÇÕES HTTP COM RETRY ====================
    
    async makeRequest(url, options = {}, attempt = 1) {
        try {
            const response = await fetch(url, {
                timeout: 10000, // 10 segundos de timeout
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            console.warn(`Tentativa ${attempt} falhou:`, error.message);
            
            if (attempt < this.retryAttempts) {
                console.log(`Tentando novamente em ${this.retryDelay}ms...`);
                await this.delay(this.retryDelay);
                return this.makeRequest(url, options, attempt + 1);
            }
            
            throw error;
        }
    }
    
    // ==================== UTILITÁRIOS ====================
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Método para verificar conectividade
    async checkConnection() {
        try {
            const response = await fetch(this.endpoints.soldNumbers, {
                method: 'HEAD',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.warn('Problema de conectividade:', error);
            return false;
        }
    }
    
    // ==================== MONITORAMENTO E ESTATÍSTICAS ====================
    
    getStats() {
        return {
            cacheSize: this.cache.size,
            endpoints: this.endpoints,
            cacheTTL: this.cacheTTL,
            retryAttempts: this.retryAttempts
        };
    }
    
    // Limpa cache expirado manualmente
    cleanExpiredCache() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, item] of this.cache.entries()) {
            if ((now - item.timestamp) > this.cacheTTL) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`${cleaned} itens de cache expirados removidos`);
        }
        
        return cleaned;
    }
}

// ==================== INICIALIZAÇÃO E EXPORTAÇÃO ====================

// Instância global do gerenciador de busca
let databaseSearchManager = null;

// Função de inicialização
function initializeDatabaseSearch() {
    if (!databaseSearchManager) {
        databaseSearchManager = new DatabaseSearchManager();
        
        // Limpeza automática de cache a cada 5 minutos
        setInterval(() => {
            databaseSearchManager.cleanExpiredCache();
        }, 300000);
        
        console.log('Módulo de busca no banco de dados inicializado');
    }
    
    return databaseSearchManager;
}

// Exporta para uso global
window.DatabaseSearchManager = DatabaseSearchManager;
window.initializeDatabaseSearch = initializeDatabaseSearch;
window.databaseSearchManager = databaseSearchManager;

// Auto-inicialização se o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDatabaseSearch);
} else {
    initializeDatabaseSearch();
}

