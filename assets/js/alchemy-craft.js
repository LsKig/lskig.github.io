class AlchemyCraft {
    constructor(container) {
        this.container = container;
        this.selectedSymbols = Array(8).fill(null);
        this.currentDraggedSymbol = null;

        // Получаем данные из глобальной переменной
        this.data = window.alchemyData || {};

        this.init();
    }

    init() {
        this.initializeElements();
        this.initializeSlots();
        this.initializeSymbolPalette();
        this.attachEventListeners();
        this.updateUI();
    }

    initializeElements() {
        this.slotsContainer = this.container.querySelector('.slots-container');
        this.symbolsPalette = this.container.querySelector('.symbols-palette');
        this.currentSelection = this.container.querySelector('.current-selection');
        this.checkBtn = this.container.querySelector('.check-btn');
        this.clearBtn = this.container.querySelector('.clear-btn');
        this.resultsContainer = this.container.querySelector('.alchemy-results');
    }

    initializeSlots() {
        this.slotsContainer.innerHTML = '';

        for (let i = 0; i < 8; i++) {
            const slot = this.createSlot(i);
            this.slotsContainer.appendChild(slot);
        }
    }

    createSlot(index) {
        const slot = document.createElement('div');
        slot.className = 'slot slot-empty';
        slot.innerHTML = `
            <div class="slot-number">${index + 1}</div>
            <img src="${this.getImageUrl('empty.png')}" alt="Empty Slot" class="slot-image">
        `;
        slot.dataset.index = index;

        return slot;
    }

    initializeSymbolPalette() {
        this.symbolsPalette.innerHTML = '';

        if (!this.data.symbols) {
            console.error('Alchemy data not found in window.alchemyData');
            return;
        }

        Object.entries(this.data.symbols).forEach(([code, symbolData]) => {
            const symbolOption = this.createSymbolOption(code, symbolData);
            this.symbolsPalette.appendChild(symbolOption);
        });
    }

    createSymbolOption(code, symbolData) {
        const symbolOption = document.createElement('div');
        symbolOption.className = 'symbol-option';
        symbolOption.innerHTML = `
            <img src="${this.getImageUrl(symbolData.image)}" alt="${symbolData.name}" draggable="true">
            <div class="symbol-name">${symbolData.name}</div>
        `;
        symbolOption.dataset.symbol = code;

        return symbolOption;
    }

    getImageUrl(imageName) {
        // Используем base URL из data-атрибута или относительный путь по умолчанию
        const baseUrl = this.container.dataset.imagesBaseUrl || '/assets/images/';
        return `${baseUrl}${imageName}`;
    }

    attachEventListeners() {
        // Обработчики для слотов
        this.slotsContainer.addEventListener('click', (e) => {
            const slot = e.target.closest('.slot');
            if (slot) {
                const index = parseInt(slot.dataset.index);
                this.clearSlot(index);
            }
        });

        this.slotsContainer.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.slotsContainer.addEventListener('drop', (e) => this.handleDrop(e));

        // Обработчики для палитры символов
        this.symbolsPalette.addEventListener('dragstart', (e) => this.handleDragStart(e));
        this.symbolsPalette.addEventListener('click', (e) => {
            const symbolOption = e.target.closest('.symbol-option');
            if (symbolOption) {
                const symbolCode = symbolOption.dataset.symbol;
                this.addSymbolToFirstEmptySlot(symbolCode);
            }
        });

        // Обработчики для кнопок
        this.checkBtn.addEventListener('click', () => this.checkRecipes());
        this.clearBtn.addEventListener('click', () => this.clearAllSlots());

        // Обработчики клавиатуры
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleDragStart(e) {
        const symbolOption = e.target.closest('.symbol-option');
        if (symbolOption) {
            this.currentDraggedSymbol = symbolOption.dataset.symbol;
            e.dataTransfer.effectAllowed = 'move';
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e) {
        e.preventDefault();
        const slot = e.target.closest('.slot');
        if (slot && this.currentDraggedSymbol) {
            const slotIndex = parseInt(slot.dataset.index);
            this.addSymbolToSlot(slotIndex, this.currentDraggedSymbol);
            this.currentDraggedSymbol = null;
        }
    }

    handleKeyPress(e) {
        // Очистка по Escape
        if (e.key === 'Escape') {
            this.clearAllSlots();
        }

        // Проверка рецептов по Enter
        if (e.key === 'Enter' && !this.checkBtn.disabled) {
            this.checkRecipes();
        }

        // Быстрые клавиши для символов (1-9)
        if (e.key >= '1' && e.key <= '9') {
            const symbolCodes = Object.keys(this.data.symbols || {});
            const index = parseInt(e.key) - 1;
            if (index < symbolCodes.length) {
                this.addSymbolToFirstEmptySlot(symbolCodes[index]);
            }
        }
    }

    addSymbolToSlot(slotIndex, symbolCode) {
        this.selectedSymbols[slotIndex] = symbolCode;
        this.updateUI();
    }

    addSymbolToFirstEmptySlot(symbolCode) {
        const emptySlotIndex = this.selectedSymbols.findIndex(symbol => symbol === null);
        if (emptySlotIndex !== -1) {
            this.addSymbolToSlot(emptySlotIndex, symbolCode);
        }
    }

    clearSlot(slotIndex) {
        this.selectedSymbols[slotIndex] = null;
        this.updateUI();
    }

    clearAllSlots() {
        this.selectedSymbols = Array(8).fill(null);
        this.updateUI();
        this.resultsContainer.innerHTML = '';
    }

    updateUI() {
        this.updateSlots();
        this.updateCurrentSelection();
        this.updateCheckButton();
    }

    updateSlots() {
        const slots = this.slotsContainer.querySelectorAll('.slot');

        slots.forEach((slot, index) => {
            const symbolCode = this.selectedSymbols[index];

            if (symbolCode && this.data.symbols && this.data.symbols[symbolCode]) {
                const symbol = this.data.symbols[symbolCode];
                slot.classList.remove('slot-empty');
                slot.innerHTML = `
                    <div class="slot-number">${index + 1}</div>
                    <img src="${this.getImageUrl(symbol.image)}" alt="${symbol.name}" class="slot-image">
                `;
            } else {
                slot.classList.add('slot-empty');
                slot.innerHTML = `
                    <div class="slot-number">${index + 1}</div>
                    <img src="${this.getImageUrl('empty.png')}" alt="Empty Slot" class="slot-image">
                `;
            }
        });
    }

    updateCurrentSelection() {
        const usedSymbols = this.selectedSymbols.filter(symbol => symbol !== null);

        if (usedSymbols.length === 0) {
            this.currentSelection.style.display = 'none';
            return;
        }

        this.currentSelection.style.display = 'block';
        this.currentSelection.innerHTML = `
            <strong>Текущий выбор:</strong>
            <div class="selection-symbols">
                ${usedSymbols.map(code => {
                    const symbol = this.data.symbols[code];
                    if (!symbol) return '';
                    return `
                        <div class="selection-symbol">
                            <img src="${this.getImageUrl(symbol.image)}" alt="${symbol.name}">
                            <span>${symbol.name}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    updateCheckButton() {
        const hasSymbols = this.selectedSymbols.some(symbol => symbol !== null);
        this.checkBtn.disabled = !hasSymbols;
    }

    checkRecipes() {
        const inputSymbols = this.selectedSymbols.filter(symbol => symbol !== null);

        this.resultsContainer.innerHTML = '';

        if (inputSymbols.length === 0) {
            this.showNoResults('Пожалуйста, выберите символы');
            return;
        }

        const availableRecipes = this.findAvailableRecipes(inputSymbols);

        if (availableRecipes.length === 0) {
            this.showNoResults('Нет доступных рецептов для данного набора символов');
            return;
        }

        availableRecipes.forEach(recipe => {
            this.displayPotionRecipe(recipe);
        });
    }

   findAvailableRecipes(inputSymbols) {
        const availableRecipes = [];

        if (!this.data.potions) return availableRecipes;

        Object.entries(this.data.potions).forEach(([potionKey, potionData]) => {
            const requiredSymbols = [...potionData.symbols];
            const availableSymbols = [...inputSymbols];
            const missingSymbols = [];

            // Проверяем каждый символ в рецепте
            for (const symbol of requiredSymbols) {
                const index = availableSymbols.indexOf(symbol);
                if (index > -1) {
                    availableSymbols.splice(index, 1);
                } else {
                    missingSymbols.push(symbol);
                }
            }

            // Показываем рецепт если есть хотя бы один совпадающий символ
            // ИЛИ если есть все символы (missingSymbols.length === 0)
            const matchedSymbols = requiredSymbols.length - missingSymbols.length;
            if (matchedSymbols > 0) {
                availableRecipes.push({
                    ...potionData,
                    missingSymbols,
                    matchedSymbols,
                    totalSymbols: requiredSymbols.length,
                    key: potionKey,
                    canCreate: missingSymbols.length === 0
                });
            }
        });

        // Сортируем рецепты: сначала те, которые можно создать, затем по количеству совпадающих символов
        return availableRecipes.sort((a, b) => {
            if (a.canCreate && !b.canCreate) return -1;
            if (!a.canCreate && b.canCreate) return 1;
            return b.matchedSymbols - a.matchedSymbols;
        });
    }

    showNoResults(message) {
        this.resultsContainer.innerHTML = `
            <div class="no-results">
                ${message}
            </div>
        `;
    }

    displayPotionRecipe(recipe) {
        const potionDiv = document.createElement('div');
        potionDiv.className = `potion-recipe ${recipe.canCreate ? 'potion-complete' : ''}`;

        let statusHtml = '';
        if (recipe.canCreate) {
            statusHtml = `
                <div class="potion-status complete">
                    <span class="status-icon">✅</span>
                    <strong>Все ингредиенты собраны! Можно создать зелье</strong>
                </div>
            `;
        } else {
            statusHtml = `
                <div class="potion-status missing">
                    <strong>Можно создать - нужно:</strong>
                    ${recipe.missingSymbols.map(code => {
                        const symbol = this.data.symbols[code];
                        return symbol ? symbol.name : code;
                    }).join(', ')}
                    <div class="progress">
                        <div class="progress-bar" style="width: ${(recipe.matchedSymbols / recipe.totalSymbols) * 100}%">
                            ${recipe.matchedSymbols}/${recipe.totalSymbols}
                        </div>
                    </div>
                </div>
            `;
        }

        let html = `
            <h3>${recipe.name}</h3>
            <p class="potion-description">${recipe.description}</p>
            ${statusHtml}
        `;

        // Показываем ингредиенты для недостающих символов, если они есть
        if (recipe.missingSymbols.length > 0) {
            html += `<div class="ingredients-list">`;

            recipe.missingSymbols.forEach(symbolCode => {
                const symbol = this.data.symbols[symbolCode];
                if (symbol) {
                    html += `
                        <div class="symbol-ingredients">
                            <div class="symbol-header">
                                <img src="${this.getImageUrl(symbol.image)}" alt="${symbol.name}">
                                <strong>${symbol.name}:</strong>
                            </div>
                            <ul>
                                ${symbol.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                }
            });

            html += `</div>`;
        }

        potionDiv.innerHTML = html;
        this.resultsContainer.appendChild(potionDiv);
    }


    // Публичные методы для внешнего использования
    setSymbols(symbols) {
        if (symbols.length <= 8) {
            this.selectedSymbols = [...symbols, ...Array(8 - symbols.length).fill(null)];
            this.updateUI();
        }
    }

    getSelectedSymbols() {
        return this.selectedSymbols.filter(symbol => symbol !== null);
    }

    destroy() {
        // Очистка event listeners при необходимости
        this.clearAllSlots();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const alchemyContainers = document.querySelectorAll('.alchemy-module');

    alchemyContainers.forEach(container => {
        new AlchemyCraft(container);
    });
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlchemyCraft;
}