// ==================== MÓDULO DE VALIDAÇÃO DE FORMULÁRIOS ====================
// Arquivo: form-validation.js
// Responsável por todas as validações de formulário e máscaras de entrada

class FormValidationManager {
    constructor() {
        this.validators = new Map();
        this.masks = new Map();
        this.errorMessages = new Map();
        this.validationRules = new Map();
        
        // Configurações padrão
        this.config = {
            showErrorsRealTime: true,
            highlightInvalidFields: true,
            scrollToFirstError: true,
            debounceDelay: 300
        };
        
        this.setupDefaultValidators();
        this.setupDefaultMasks();
        this.setupDefaultMessages();
        
        console.log('FormValidationManager inicializado');
    }
    
    // ==================== CONFIGURAÇÃO DE VALIDADORES PADRÃO ====================
    
    setupDefaultValidators() {
        // Validador de CPF
        this.validators.set('cpf', (value) => {
            const cpf = value.replace(/\D/g, '');
            
            if (cpf.length !== 11) return false;
            if (/^(\d)\1{10}$/.test(cpf)) return false; // CPFs com todos os dígitos iguais
            
            // Validação dos dígitos verificadores
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                sum += parseInt(cpf.charAt(i)) * (10 - i);
            }
            let remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cpf.charAt(9))) return false;
            
            sum = 0;
            for (let i = 0; i < 10; i++) {
                sum += parseInt(cpf.charAt(i)) * (11 - i);
            }
            remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cpf.charAt(10))) return false;
            
            return true;
        });
        
        // Validador de telefone
        this.validators.set('phone', (value) => {
            const phone = value.replace(/\D/g, '');
            return phone.length >= 10 && phone.length <= 11;
        });
        
        // Validador de email
        this.validators.set('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        });
        
        // Validador de nome
        this.validators.set('name', (value) => {
            return value.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(value);
        });
        
        // Validador de números obrigatórios
        this.validators.set('required', (value) => {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        });
    }
    
    // ==================== CONFIGURAÇÃO DE MÁSCARAS PADRÃO ====================
    
    setupDefaultMasks() {
        // Máscara de CPF
        this.masks.set('cpf', (value) => {
            let cpf = value.replace(/\D/g, '');
            if (cpf.length > 11) cpf = cpf.slice(0, 11);
            
            cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
            cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
            cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            
            return cpf;
        });
        
        // Máscara de telefone
        this.masks.set('phone', (value) => {
            let phone = value.replace(/\D/g, '');
            if (phone.length > 11) phone = phone.slice(0, 11);
            
            if (phone.length <= 10) {
                phone = phone.replace(/(\d{2})(\d)/, '($1) $2');
                phone = phone.replace(/(\d{4})(\d)/, '$1-$2');
            } else {
                phone = phone.replace(/(\d{2})(\d)/, '($1) $2');
                phone = phone.replace(/(\d{5})(\d)/, '$1-$2');
            }
            
            return phone;
        });
        
        // Máscara de CEP
        this.masks.set('cep', (value) => {
            let cep = value.replace(/\D/g, '');
            if (cep.length > 8) cep = cep.slice(0, 8);
            cep = cep.replace(/(\d{5})(\d)/, '$1-$2');
            return cep;
        });
        
        // Máscara de moeda
        this.masks.set('currency', (value) => {
            let number = value.replace(/\D/g, '');
            number = (parseInt(number) / 100).toFixed(2);
            return number.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        });
    }
    
    // ==================== MENSAGENS DE ERRO PADRÃO ====================
    
    setupDefaultMessages() {
        this.errorMessages.set('cpf', 'CPF inválido');
        this.errorMessages.set('phone', 'Telefone deve ter 10 ou 11 dígitos');
        this.errorMessages.set('email', 'Email inválido');
        this.errorMessages.set('name', 'Nome deve ter pelo menos 2 caracteres e conter apenas letras');
        this.errorMessages.set('required', 'Este campo é obrigatório');
        this.errorMessages.set('minLength', 'Valor muito curto');
        this.errorMessages.set('maxLength', 'Valor muito longo');
        this.errorMessages.set('min', 'Valor muito baixo');
        this.errorMessages.set('max', 'Valor muito alto');
    }
    
    // ==================== APLICAÇÃO DE MÁSCARAS ====================
    
    applyMask(input, maskType) {
        if (!input || !maskType) return;
        
        const mask = this.masks.get(maskType);
        if (!mask) {
            console.warn(`Máscara '${maskType}' não encontrada`);
            return;
        }
        
        // Debounce para evitar aplicação excessiva
        if (input.maskTimeout) {
            clearTimeout(input.maskTimeout);
        }
        
        input.maskTimeout = setTimeout(() => {
            const cursorPosition = input.selectionStart;
            const oldValue = input.value;
            const newValue = mask(oldValue);
            
            if (newValue !== oldValue) {
                input.value = newValue;
                
                // Restaura posição do cursor
                const newCursorPosition = cursorPosition + (newValue.length - oldValue.length);
                input.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        }, 50);
    }
    
    // ==================== VALIDAÇÃO DE CAMPOS ====================
    
    validateField(input, rules = []) {
        if (!input) return { valid: true, errors: [] };
        
        const value = input.value;
        const errors = [];
        
        // Aplica regras de validação
        for (const rule of rules) {
            if (typeof rule === 'string') {
                // Regra simples (nome do validador)
                const validator = this.validators.get(rule);
                if (validator && !validator(value)) {
                    errors.push(this.errorMessages.get(rule) || `Erro de validação: ${rule}`);
                }
            } else if (typeof rule === 'object') {
                // Regra complexa com parâmetros
                const { type, message, ...params } = rule;
                const validator = this.validators.get(type);
                
                if (validator && !validator(value, params)) {
                    errors.push(message || this.errorMessages.get(type) || `Erro de validação: ${type}`);
                }
            }
        }
        
        // Atualiza visual do campo
        this.updateFieldVisual(input, errors.length === 0);
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    // ==================== VALIDAÇÃO DE FORMULÁRIO COMPLETO ====================
    
    validateForm(form) {
        if (!form) return { valid: false, errors: [] };
        
        const allErrors = [];
        const fields = form.querySelectorAll('input, select, textarea');
        let firstInvalidField = null;
        
        fields.forEach(field => {
            const rules = this.getFieldRules(field);
            const result = this.validateField(field, rules);
            
            if (!result.valid) {
                allErrors.push({
                    field: field.name || field.id,
                    errors: result.errors
                });
                
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });
        
        // Scroll para o primeiro campo inválido
        if (firstInvalidField && this.config.scrollToFirstError) {
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidField.focus();
        }
        
        return {
            valid: allErrors.length === 0,
            errors: allErrors,
            firstInvalidField: firstInvalidField
        };
    }
    
    // ==================== CONFIGURAÇÃO DE REGRAS POR CAMPO ====================
    
    getFieldRules(field) {
        // Verifica atributos HTML5
        const rules = [];
        
        if (field.required) {
            rules.push('required');
        }
        
        if (field.type === 'email') {
            rules.push('email');
        }
        
        if (field.dataset.validation) {
            const customRules = field.dataset.validation.split(',');
            rules.push(...customRules);
        }
        
        // Regras específicas por ID ou classe
        if (field.id === 'buyer-cpf' || field.classList.contains('cpf')) {
            rules.push('cpf');
        }
        
        if (field.id === 'buyer-phone' || field.classList.contains('phone')) {
            rules.push('phone');
        }
        
        if (field.id === 'buyer-name' || field.classList.contains('name')) {
            rules.push('name');
        }
        
        return rules;
    }
    
    // ==================== ATUALIZAÇÃO VISUAL DOS CAMPOS ====================
    
    updateFieldVisual(input, isValid) {
        if (!this.config.highlightInvalidFields) return;
        
        // Remove classes anteriores
        input.classList.remove('valid', 'invalid', 'error');
        
        // Adiciona classe apropriada
        if (isValid) {
            input.classList.add('valid');
            input.style.borderColor = '#28a745';
        } else {
            input.classList.add('invalid', 'error');
            input.style.borderColor = '#dc3545';
        }
    }
    
    // ==================== SETUP AUTOMÁTICO DE FORMULÁRIOS ====================
    
    setupForm(form) {
        if (!form) return;
        
        const fields = form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            // Aplica máscaras baseadas em atributos
            if (field.dataset.mask) {
                field.addEventListener('input', () => {
                    this.applyMask(field, field.dataset.mask);
                });
            }
            
            // Aplica máscaras baseadas em ID/classe
            if (field.id === 'buyer-cpf' || field.classList.contains('cpf')) {
                field.addEventListener('input', () => {
                    this.applyMask(field, 'cpf');
                });
            }
            
            if (field.id === 'buyer-phone' || field.classList.contains('phone')) {
                field.addEventListener('input', () => {
                    this.applyMask(field, 'phone');
                });
            }
            
            // Validação em tempo real (com debounce)
            if (this.config.showErrorsRealTime) {
                let validationTimeout;
                
                field.addEventListener('input', () => {
                    clearTimeout(validationTimeout);
                    validationTimeout = setTimeout(() => {
                        const rules = this.getFieldRules(field);
                        this.validateField(field, rules);
                    }, this.config.debounceDelay);
                });
                
                field.addEventListener('blur', () => {
                    const rules = this.getFieldRules(field);
                    this.validateField(field, rules);
                });
            }
        });
        
        // Validação no submit
        form.addEventListener('submit', (e) => {
            const result = this.validateForm(form);
            if (!result.valid) {
                e.preventDefault();
                console.log('Formulário inválido:', result.errors);
            }
        });
        
        console.log(`Formulário configurado com ${fields.length} campos`);
    }
    
    // ==================== UTILITÁRIOS PÚBLICOS ====================
    
    // Limpa validação visual de um campo
    clearFieldValidation(input) {
        if (!input) return;
        
        input.classList.remove('valid', 'invalid', 'error');
        input.style.borderColor = '';
    }
    
    // Limpa validação visual de todo o formulário
    clearFormValidation(form) {
        if (!form) return;
        
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => this.clearFieldValidation(field));
    }
    
    // Adiciona validador customizado
    addValidator(name, validator, message) {
        this.validators.set(name, validator);
        if (message) {
            this.errorMessages.set(name, message);
        }
    }
    
    // Adiciona máscara customizada
    addMask(name, mask) {
        this.masks.set(name, mask);
    }
    
    // Configura opções
    configure(options) {
        this.config = { ...this.config, ...options };
    }
    
    // ==================== VALIDAÇÕES ESPECÍFICAS PARA RIFA ====================
    
    validateCartNotEmpty(cartItems) {
        return cartItems && cartItems.length > 0;
    }
    
    validateNumberSelection(selectedNumbers, maxPerPerson) {
        return selectedNumbers.size > 0 && selectedNumbers.size <= maxPerPerson;
    }
    
    validatePurchaseData(data) {
        const errors = [];
        
        if (!data.nome || data.nome.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }
        
        if (!this.validators.get('cpf')(data.cpf)) {
            errors.push('CPF inválido');
        }
        
        if (!this.validators.get('phone')(data.telefone)) {
            errors.push('Telefone inválido');
        }
        
        if (data.email && !this.validators.get('email')(data.email)) {
            errors.push('Email inválido');
        }
        
        if (!data.numeros || data.numeros.length === 0) {
            errors.push('Nenhum número selecionado');
        }
        
        if (!data.total || data.total <= 0) {
            errors.push('Total inválido');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

// ==================== INICIALIZAÇÃO E EXPORTAÇÃO ====================

// Instância global do gerenciador de validação
let formValidationManager = null;

// Função de inicialização
function initializeFormValidation() {
    if (!formValidationManager) {
        formValidationManager = new FormValidationManager();
        
        // Setup automático de formulários existentes
        document.querySelectorAll('form').forEach(form => {
            formValidationManager.setupForm(form);
        });
        
        console.log('Módulo de validação de formulários inicializado');
    }
    
    return formValidationManager;
}

// Exporta para uso global
window.FormValidationManager = FormValidationManager;
window.initializeFormValidation = initializeFormValidation;
window.formValidationManager = formValidationManager;

// Auto-inicialização se o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFormValidation);
} else {
    initializeFormValidation();
}

