// crafting-craft.js

// КОНФИГУРАЦИЯ КАТЕГОРИЙ
// Здесь можно легко добавлять, удалять или менять порядок категорий
const CRAFTING_CATEGORIES = [
    // === БАЗОВЫЕ МАТЕРИАЛЫ ===
    { id: 'materials', name: '📦 Материалы', type: 'materials', tier: null },

    // === КОМПОНЕНТЫ ===
    { id: 'comp_novice', name: '🔨 Компоненты новичка', type: 'recipes', tier: 'novice', filterType: 'component' },
    { id: 'comp_journeyman', name: '⚒️ Компоненты подмастерья', type: 'recipes', tier: 'journeyman', filterType: 'component' },
    { id: 'comp_master', name: '🛠️ Компоненты мастера', type: 'recipes', tier: 'master', filterType: 'component' },

    // === ОРУЖИЕ ===
    { id: 'wpn_novice', name: '⚔️ Оружие новичка', type: 'recipes', tier: 'novice', filterType: 'weapon' },
    { id: 'wpn_journeyman', name: '🗡️ Оружие подмастерья', type: 'recipes', tier: 'journeyman', filterType: 'weapon' },
    { id: 'wpn_master', name: '🏹 Оружие мастера', type: 'recipes', tier: 'master', filterType: 'weapon' },

    // === ОРУЖИЕ СТАРШЕГО НАРОДА ===
    { id: 'elder_wpn_master', name: '🧝 Оружие Старшего Народа (Мастер)', type: 'recipes', tier: 'master', filterType: 'elder_race' },
    { id: 'elder_wpn_gm', name: '🌟 Оружие Старшего Народа (Великий)', type: 'recipes', tier: 'grandmaster', filterType: 'elder_race' },

    // === БРОНЯ ===
    { id: 'arm_novice', name: '🛡️ Броня новичка', type: 'recipes', tier: 'novice', filterType: 'armor' },
    { id: 'arm_journeyman', name: '🛡️ Броня подмастерья', type: 'recipes', tier: 'journeyman', filterType: 'armor' },
    { id: 'arm_master', name: '🛡️ Броня мастера', type: 'recipes', tier: 'master', filterType: 'armor' },
    { id: 'arm_gm', name: '👑 Броня Великого Мастера', type: 'recipes', tier: 'grandmaster', filterType: 'armor' },

    // === УСИЛЕНИЯ БРОНИ ===
    { id: 'upg_novice', name: '🧱 Усиления новичка', type: 'recipes', tier: 'novice', filterType: 'armor_upgrade' },
    { id: 'upg_journeyman', name: '🧱 Усиления подмастерья', type: 'recipes', tier: 'journeyman', filterType: 'armor_upgrade' },
    { id: 'upg_master', name: '🧱 Усиления мастера', type: 'recipes', tier: 'master', filterType: 'armor_upgrade' },

    // === БОЕПРИПАСЫ ===
    { id: 'ammo_master', name: '💣 Боеприпасы мастера', type: 'recipes', tier: 'master', filterType: 'ammo' }
];

(function() {
    if (typeof window.CraftingCraft !== 'undefined') return;

    class CraftingCraft {
        constructor(container) {
            this.container = container;
            this.selectedRecipe = null;
            this.inventory = new Map();
            this.expandedRecipes = new Set();
            this.data = window.craftingData || {};
            this.initializationFailed = false;
            this.currentCategory = null;
            this.init();
        }

        init() {
            console.log('CraftingCraft: Initializing...');
            this.initializeElements();
            if (this.initializationFailed) return;

            this.attachEventListeners();
            this.renderCategories();
            console.log('CraftingCraft: Initialized successfully');
        }

        initializeElements() {
            this.categoriesContainer = this.container.querySelector('.crafting-categories-container');
            this.itemsList = this.container.querySelector('.crafting-items-list');
            this.recipeDetail = this.container.querySelector('.crafting-recipe-detail');
            this.inventoryPanel = this.container.querySelector('.crafting-inventory-panel');
            this.searchInput = this.container.querySelector('.crafting-search-input');
            this.searchBtn = this.container.querySelector('.crafting-search-btn');

            if (!this.categoriesContainer || !this.itemsList || !this.recipeDetail) {
                console.error('CraftingCraft Error: Essential HTML elements missing.');
                this.initializationFailed = true;
                return;
            }
        }

        attachEventListeners() {
            // Поиск по кнопке
            if (this.searchBtn) {
                this.searchBtn.addEventListener('click', () => {
                    this.handleSearch(this.searchInput.value);
                });
            }

            // Поиск по Enter
            if (this.searchInput) {
                this.searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleSearch(this.searchInput.value);
                    }
                });
            }

            this.categoriesContainer.addEventListener('click', (e) => {
                const categoryBtn = e.target.closest('.crafting-category-btn');
                if (categoryBtn) {
                    this.selectCategory(categoryBtn.dataset.category);
                }
            });

            this.itemsList.addEventListener('click', (e) => {
                const itemCard = e.target.closest('.crafting-item-card');
                if (itemCard) {
                    this.selectItem(itemCard.dataset.item);
                }
            });

            this.container.addEventListener('click', (e) => {
                if (e.target.classList.contains('crafting-add-btn')) {
                    this.addToInventory(e.target.dataset.item, parseInt(e.target.dataset.quantity) || 1);
                }
                if (e.target.classList.contains('crafting-remove-btn')) {
                    this.removeFromInventory(e.target.dataset.item);
                }
                if (e.target.classList.contains('crafting-toggle-recipe')) {
                    this.toggleRecipeExpand(e.target.dataset.recipe);
                }
                if (e.target.classList.contains('crafting-clear-btn')) {
                    this.clearInventory();
                }
            });
        }

        renderCategories() {
            // Используем глобальную константу
            this.categoriesContainer.innerHTML = CRAFTING_CATEGORIES.map(cat =>
                `<button class="crafting-category-btn" data-category="${cat.id}">${cat.name}</button>`
            ).join('');

            // Выбираем первую категорию по умолчанию
            if (CRAFTING_CATEGORIES.length > 0) {
                this.selectCategory(CRAFTING_CATEGORIES[0].id);
            }
        }

        selectCategory(categoryId) {
            this.container.querySelectorAll('.crafting-category-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = this.container.querySelector(`[data-category="${categoryId}"]`);
            if (activeBtn) activeBtn.classList.add('active');

            const category = CRAFTING_CATEGORIES.find(c => c.id === categoryId);
            if (category) {
                this.currentCategory = category;
                this.renderItemsList(category);
            }
        }

        renderItemsList(category) {
            let items = [];

            if (category.type === 'materials') {
                items = Object.entries(this.data.materials || {}).map(([key, item]) => ({ key, ...item, type: 'material' }));
            } else if (category.type === 'recipes') {
                items = Object.entries(this.data.recipes || {}).map(([key, recipe]) => ({ key, ...recipe }))
                    .filter(item => {
                        // Фильтрация по уровню (tier)
                        const tierMatch = item.tier === category.tier;
                        // Фильтрация по типу (weapon, armor, component и т.д.)
                        const typeMatch = !category.filterType || item.type === category.filterType;
                        return tierMatch && typeMatch;
                    });
            }

            // Сортировка по СЛ
            items.sort((a, b) => (parseInt(a.dc) || 0) - (parseInt(b.dc) || 0));

            this.itemsList.innerHTML = items.map(item => `
                <div class="crafting-item-card" data-item="${item.key}">
                    <div class="crafting-item-header">
                        <h3>${item.name}</h3>
                        <div class="crafting-item-meta">
                            ${item.dc && item.dc !== '—' ? `<span class="crafting-dc">СЛ ${item.dc}</span>` : ''}
                            ${item.time ? `<span class="crafting-time">⏱ ${item.time}</span>` : ''}
                            <span class="crafting-price">${item.price || 0} монет</span>
                        </div>
                    </div>
                    <div class="crafting-item-preview">
                        ${item.ingredients ?
                            `<span class="crafting-ingredients-count">📋 ${item.ingredients.length} комп.</span><span class="crafting-surcharge">+${item.surcharge || 0}</span>` :
                            `<span class="crafting-material-source">📍 ${item.source || 'Покупается'}</span>`}
                    </div>
                </div>
            `).join('');
        }

        selectItem(itemKey) {
            const item = this.data.materials[itemKey] || this.data.recipes[itemKey];
            if (!item) return;
            this.selectedRecipe = { key: itemKey, ...item };
            this.renderRecipeDetail(itemKey, item);
        }

        renderRecipeDetail(key, item) {
            const isMaterial = !!this.data.materials[key];
            const treeData = isMaterial ? null : this.calculateRecipeTree(key, item);
            this.recipeDetail.innerHTML = `
                <div class="crafting-recipe-header">
                    <h2>${item.name}</h2>
                    <div class="crafting-recipe-meta">
                        ${item.tier ? `<span class="crafting-tier crafting-tier-${item.tier}">${this.getTierName(item.tier)}</span>` : ''}
                        ${item.type ? `<span class="crafting-type crafting-type-${item.type}">${this.getTypeName(item.type)}</span>` : ''}
                        ${item.dc && item.dc !== '—' ? `<span class="crafting-dc">СЛ: ${item.dc}</span>` : ''}
                        ${item.time ? `<span class="crafting-time">⏱ ${item.time}</span>` : ''}
                    </div>
                </div>
                ${isMaterial ? this.renderMaterialDetail(item) : this.renderRecipeTreeDetail(key, item, treeData)}
                <div class="crafting-recipe-actions">
                    <button class="crafting-btn crafting-btn-primary" onclick="window.craftingModule.addToInventory('${key}', 1)">➕ В инвентарь</button>
                    ${!isMaterial ? `<button class="crafting-btn crafting-btn-secondary" onclick="window.craftingModule.printRecipe('${key}')">🖨️ Печать</button>` : ''}
                </div>
            `;
        }

        renderMaterialDetail(item) {
            const inInv = this.inventory.get(this.selectedRecipe.key) || 0;
            return `
                <div class="crafting-material-detail">
                    <div class="crafting-material-info">
                        <p><strong>Источник:</strong> ${item.source || 'Покупается'}</p>
                        ${item.availability ? `<p><strong>Доступность:</strong> ${this.getAvailabilityName(item.availability)}</p>` : ''}
                        <p><strong>Вес:</strong> ${item.weight || 0} | <strong>Цена:</strong> ${item.price || 0}</p>
                    </div>
                    ${inInv > 0 ? `<div class="crafting-inventory-status crafting-available">✅ В инвентаре: ${inInv}</div>` : ''}
                </div>`;
        }

        renderRecipeTreeDetail(key, recipe, treeData) {
            const inInv = this.inventory.get(key) || 0;
            return `
                <div class="crafting-recipe-tree"><h3>📋 Дерево крафта</h3>${this.renderRecipeTreeNode(key, recipe, 0)}</div>
                ${treeData ? `
                    <div class="crafting-recipe-summary">
                        <div class="crafting-summary-block"><h4>💰 Стоимость:</h4><div class="crafting-total-price">${treeData.totalPrice} монет</div></div>
                        <div class="crafting-summary-block"><h4>⏱️ Время:</h4><div class="crafting-total-time">${treeData.totalTime}</div></div>
                        <div class="crafting-summary-block"><h4>📦 Материалы:</h4><div class="crafting-materials-list">${this.renderMaterialsList(treeData.baseMaterials)}</div></div>
                    </div>` : ''}
                ${inInv > 0 ? `<div class="crafting-inventory-status crafting-available">✅ В инвентаре: ${inInv}</div>` : ''}
            `;
        }

        renderRecipeTreeNode(key, recipe, depth = 0, parentPath = '') {
            const currentPath = parentPath ? `${parentPath}.${key}` : key;
            const isExpanded = this.expandedRecipes.has(currentPath);
            const hasRecipe = !!this.data.recipes[key];
            const inInv = this.inventory.get(key) || 0;

            let html = `
                <div class="crafting-recipe-node ${hasRecipe ? 'crafting-has-recipe' : 'crafting-material'}" style="margin-left: ${depth * 20}px">
                    <div class="crafting-node-header">
                        ${hasRecipe ? `<button class="crafting-toggle-recipe ${recipe.ingredients ? '' : 'crafting-hidden'}" data-recipe="${currentPath}">${isExpanded ? '▼' : '▶'}</button>` : '<span class="crafting-node-spacer"></span>'}
                        <span class="crafting-node-name">${recipe.name}</span>
                        ${hasRecipe ? '<span class="crafting-node-type">Рецепт</span>' : '<span class="crafting-node-type crafting-material">Материал</span>'}
                        <span class="crafting-node-quantity">×${recipe.quantity || 1}</span>
                        ${inInv > 0 ? `<span class="crafting-in-inventory">✓ ${inInv}</span>` : ''}
                    </div>
                    ${!isExpanded && recipe.ingredients ? `<div class="crafting-node-preview">${recipe.ingredients.slice(0, 3).map(ing => `<span>${this.getIngredientData(ing.item).name}×${ing.quantity}</span>`).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}</div>` : ''}
                </div>`;

            if (isExpanded && recipe.ingredients) {
                html += '<div class="crafting-node-children">';
                recipe.ingredients.forEach(ing => {
                    const ingData = this.getIngredientData(ing.item);
                    html += this.renderRecipeTreeNode(ing.item, { ...ingData, quantity: ing.quantity, dc: ingData.dc || 0, time: ingData.time || '0', ingredients: ingData.ingredients || [], surcharge: ingData.surcharge || 0, price: ingData.price || 0, tier: ingData.tier || 'novice', type: ingData.type || 'component' }, depth + 1, currentPath);
                });
                html += '</div>';
            }
            return html + '</div>';
        }

        calculateRecipeTree(key, recipe, visited = new Set()) {
            if (visited.has(key)) return { totalPrice: 0, totalTime: '0 мин', baseMaterials: new Map() };
            visited.add(key);
            let totalPrice = recipe.surcharge || 0;
            let totalTime = this.parseTime(recipe.time);
            const baseMaterials = new Map();
            if (recipe.ingredients) {
                recipe.ingredients.forEach(ing => {
                    const ingData = this.getIngredientData(ing.item);
                    if (ingData.ingredients && ingData.ingredients.length > 0) {
                        const sub = this.calculateRecipeTree(ing.item, { ...ingData, quantity: ing.quantity }, new Set(visited));
                        totalPrice += sub.totalPrice * ing.quantity;
                        totalTime += this.parseTime(sub.totalTime) * ing.quantity;
                        sub.baseMaterials.forEach((q, k) => baseMaterials.set(k, (baseMaterials.get(k) || 0) + (q * ing.quantity)));
                    } else {
                        totalPrice += (ingData.price || 0) * ing.quantity;
                        baseMaterials.set(ing.item, (baseMaterials.get(ing.item) || 0) + ing.quantity);
                    }
                });
            }
            return { totalPrice: Math.round(totalPrice), totalTime: this.formatTime(totalTime), baseMaterials };
        }

        getIngredientData(key) { return this.data.recipes[key] || this.data.materials[key] || { name: key, price: 0, ingredients: [] }; }

        getTierName(t) {
            return {
                'novice': 'Новичок',
                'journeyman': 'Подмастерье',
                'master': 'Мастер',
                'grandmaster': 'Великий Мастер' // Добавлен новый тир
            }[t] || t;
        }

        getTypeName(t) {
            return {
                'component': 'Компонент',
                'weapon': 'Оружие',
                'armor': 'Броня',
                'elder_race': 'Старший Народ',
                'armor_upgrade': 'Усиление',
                'ammo': 'Боеприпас'
            }[t] || t;
        }

        getAvailabilityName(a) { return { 'П': 'Повсеместно', 'О': 'Обычно', 'Р': 'Редко', 'У': 'Уникально' }[a] || a; }

        parseTime(t) {
            if (!t) return 0;
            const m = t.match(/(\d+(?:\.\d+)?)\s*(час|мин|сек|часа|часов)/i);
            if (!m) return 0;
            const v = parseFloat(m[1]), u = m[2].toLowerCase();
            return u.includes('час') ? v * 60 : u.includes('мин') ? v : u.includes('сек') ? v / 60 : v;
        }
        formatTime(m) { return m < 60 ? `${Math.round(m)} мин` : m < 1440 ? `${(m / 60).toFixed(1)} ч` : `${(m / 1440).toFixed(1)} дн`; }

        renderMaterialsList(map) {
            if (!map || map.size === 0) return '<div class="crafting-no-materials">Нет базовых материалов</div>';
            return Array.from(map.entries()).map(([k, q]) => {
                const mat = this.data.materials[k] || { name: k, price: 0 };
                const inv = this.inventory.get(k) || 0;
                const miss = Math.max(0, q - inv);
                return `<div class="crafting-material-item ${miss > 0 ? 'crafting-missing' : 'crafting-available'}">
                    <span class="crafting-material-name">${mat.name}</span>
                    <span class="crafting-material-quantity">×${q}</span>
                    <span class="crafting-material-price">${mat.price * q} монет</span>
                    ${inv > 0 ? `<span class="crafting-material-have">Есть: ${inv}</span>` : ''}
                    ${miss > 0 ? `<span class="crafting-material-missing">Не хватает: ${miss}</span>` : ''}
                    <button class="crafting-add-btn" data-item="${k}" data-quantity="${q}">+ Добавить</button>
                </div>`;
            }).join('');
        }

        addToInventory(key, qty = 1) {
            this.inventory.set(key, (this.inventory.get(key) || 0) + qty);
            this.updateInventoryDisplay();
            if (this.selectedRecipe) this.selectItem(this.selectedRecipe.key);
        }
        removeFromInventory(key) {
            this.inventory.delete(key);
            this.updateInventoryDisplay();
            if (this.selectedRecipe) this.selectItem(this.selectedRecipe.key);
        }
        updateInventoryDisplay() {
            if (!this.inventoryPanel) return;
            const items = Array.from(this.inventory.entries());
            if (!items.length) { this.inventoryPanel.innerHTML = '<div class="crafting-empty-inventory">Инвентарь пуст</div>'; return; }
            this.inventoryPanel.innerHTML = `<h3>📦 Инвентарь</h3><div class="crafting-inventory-list">${items.map(([k, q]) => `<div class="crafting-inventory-item"><span class="crafting-item-name">${this.getIngredientData(k).name}</span><span class="crafting-item-quantity">×${q}</span><button class="crafting-remove-btn" data-item="${k}">×</button></div>`).join('')}</div><button class="crafting-clear-btn" onclick="window.craftingModule.clearInventory()">🗑️ Очистить</button>`;
        }
        clearInventory() {
            this.inventory.clear();
            this.updateInventoryDisplay();
            if (this.selectedRecipe) this.selectItem(this.selectedRecipe.key);
        }
        toggleRecipeExpand(path) {
            this.expandedRecipes.has(path) ? this.expandedRecipes.delete(path) : this.expandedRecipes.add(path);
            if (this.selectedRecipe) this.selectItem(this.selectedRecipe.key);
        }

        handleSearch(query) {
            if (!query) {
                if (this.currentCategory) this.renderItemsList(this.currentCategory);
                return;
            }
            const q = query.toLowerCase().trim();
            const all = [...Object.entries(this.data.materials || {}).map(([k, v]) => ({ key: k, ...v, type: 'material' })), ...Object.entries(this.data.recipes || {}).map(([k, v]) => ({ key: k, ...v }))];
            const filtered = all.filter(i => i.name.toLowerCase().includes(q));
            this.itemsList.innerHTML = filtered.map(i => `<div class="crafting-item-card" data-item="${i.key}"><div class="crafting-item-header"><h3>${i.name}</h3><div class="crafting-item-meta">${i.dc && i.dc !== '—' ? `<span class="crafting-dc">СЛ ${i.dc}</span>` : ''}<span class="crafting-price">${i.price || 0} монет</span></div></div></div>`).join('');
        }

        printRecipe(key) {
            const r = this.data.recipes[key];
            if (!r) return;
            const tree = this.calculateRecipeTree(key, r);
            const w = window.open('', '_blank');
            w.document.write(`<html><head><title>${r.name}</title></head><body><h1>${r.name}</h1><p>СЛ: ${r.dc} | Время: ${r.time} | Цена: ${tree.totalPrice}</p><pre>${JSON.stringify(Object.fromEntries(tree.baseMaterials), null, 2)}</pre></body></html>`);
            w.document.close();
        }
        destroy() { this.inventory.clear(); this.expandedRecipes.clear(); }
    }

    window.CraftingCraft = CraftingCraft;

    function initCraftingModules() {
        const containers = document.querySelectorAll('.crafting-module');
        containers.forEach((container, index) => {
            const instance = new CraftingCraft(container);
            if (index === 0) {
                window.craftingModule = instance;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCraftingModules);
    } else {
        initCraftingModules();
    }
})();