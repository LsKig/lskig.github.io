class PoltiSpread {
    constructor(container) {
        this.container = container;

        // Данные из глобальной переменной (аналогично алхимии)
        this.data = window.poltiData || {};
        this.situations = this.parseSituations();

        // Текущий расклад: массив объектов-карт
        this.cards = [];

        this.init();
    }

    init() {
        this.initializeElements();
        this.attachEventListeners();
        this.validateData();
    }

    /* ============================================================
       Подготовка данных
       ============================================================ */

    // Преобразуем объект ситуаций в удобный массив.
    // Отсекаем служебное поле title и любые некорректные записи.
    parseSituations() {
        const raw = this.data.dramatic_situations || {};
        const situations = [];

        Object.entries(raw).forEach(([key, value]) => {
            if (value && typeof value === 'object' && value.name && value.rolls) {
                situations.push({
                    key,
                    name: String(value.name).trim(),
                    rolls: this.parseRolls(value.rolls)
                });
            }
        });

        return situations;
    }

    parseRolls(rollsRaw) {
        const rolls = [];

        Object.entries(rollsRaw).forEach(([key, text]) => {
            if (typeof text === 'string') {
                rolls.push({ key, text: text.trim() });
            }
        });

        return rolls;
    }

    validateData() {
        if (this.situations.length === 0) {
            console.error('Polti data not found in window.poltiData');
            this.drawBtn.disabled = true;
            this.cardsContainer.innerHTML = `
                <div class="polti-no-data">
                    Данные для генератора не найдены
                </div>
            `;
        }
    }

    /* ============================================================
       DOM и события
       ============================================================ */

    initializeElements() {
        this.countInput = this.container.querySelector('.polti-count-input');
        this.drawBtn = this.container.querySelector('.polti-draw-btn');
        this.cardsContainer = this.container.querySelector('.polti-cards');
    }

    attachEventListeners() {
        this.drawBtn.addEventListener('click', () => this.drawSpread());

        // Enter в поле количества тоже делает расклад
        this.countInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.drawSpread();
            }
        });

        // Делегирование кликов по картам (переворот)
        this.cardsContainer.addEventListener('click', (e) => {
            const cardEl = e.target.closest('.polti-card');
            if (cardEl) {
                this.flipCard(parseInt(cardEl.dataset.index));
            }
        });
    }

    /* ============================================================
       Расклад
       ============================================================ */

    getCount() {
        let count = parseInt(this.countInput.value);

        if (isNaN(count) || count < 1) count = 1;
        if (count > 100) count = 100;

        return count;
    }

    // Полный сброс и выкладка новой группы карт
    drawSpread() {
        if (this.situations.length === 0) return;

        const count = this.getCount();
        this.countInput.value = count; // нормализуем отображение

        this.cards = [];
        for (let i = 0; i < count; i++) {
            this.cards.push(this.createCardData(i));
        }

        this.renderCards();
    }

    createCardData(index) {
        const situation = this.getRandomSituation();

        return {
            index,
            situationKey: situation.key,
            situationName: situation.name,
            rolls: situation.rolls,
            flipped: false,
            currentRoll: null
        };
    }

    renderCards() {
        this.cardsContainer.innerHTML = '';

        const fragment = document.createDocumentFragment();
        this.cards.forEach((card) => {
            fragment.appendChild(this.createCardElement(card));
        });

        this.cardsContainer.appendChild(fragment);
    }

    createCardElement(card) {
        const cardEl = document.createElement('div');
        cardEl.className = 'polti-card';
        cardEl.dataset.index = card.index;

        cardEl.innerHTML = `
            <div class="polti-card-inner">
                <div class="polti-card-front">
                    <div class="polti-card-number">${card.index + 1}</div>
                    <div class="polti-card-situation">${card.situationName}</div>
                </div>

                <div class="polti-card-back">
                    <div class="polti-card-number">${card.index + 1}</div>

                    <div class="polti-card-back-content">
                        <div class="polti-card-back-title">${card.situationName}</div>
                        <div class="polti-card-roll"></div>
                    </div>
                </div>
            </div>
        `;

        return cardEl;
    }

    /* ============================================================
       Переворот карты
       ============================================================ */

    flipCard(index) {
        const card = this.cards[index];
        if (!card) return;

        const cardEl = this.cardsContainer.querySelector(
            `.polti-card[data-index="${index}"]`
        );
        if (!cardEl) return;

        // Переворачиваем ЛИЦОМ ВНИЗ (на сторону с подситуацией):
        // каждый раз выбираем НОВУЮ случайную подситуацию,
        // не совпадающую с предыдущей показанной.
        if (!card.flipped) {
            const excludeKey = card.currentRoll ? card.currentRoll.key : null;
            card.currentRoll = this.getRandomRoll(card.rolls, excludeKey);

            const rollEl = cardEl.querySelector('.polti-card-roll');
            rollEl.textContent = card.currentRoll ? card.currentRoll.text : '';
        }

        card.flipped = !card.flipped;
        cardEl.classList.toggle('flipped', card.flipped);
    }

    /* ============================================================
       Случайный выбор
       ============================================================ */

    // Выбор с повторениями
    getRandomSituation() {
        const index = Math.floor(Math.random() * this.situations.length);
        return this.situations[index];
    }

    // Случайная подситуация; при возможности исключаем предыдущую,
    // чтобы при каждом новом повороте результат отличался.
    getRandomRoll(rolls, excludeKey = null) {
        if (!rolls || rolls.length === 0) return null;
        if (rolls.length === 1) return rolls[0];

        let candidates = rolls;
        if (excludeKey !== null) {
            const filtered = rolls.filter((roll) => roll.key !== excludeKey);
            if (filtered.length > 0) {
                candidates = filtered;
            }
        }

        const index = Math.floor(Math.random() * candidates.length);
        return candidates[index];
    }

    /* ============================================================
       Публичные методы / очистка
       ============================================================ */

    clearSpread() {
        this.cards = [];
        this.cardsContainer.innerHTML = '';
    }

    destroy() {
        this.clearSpread();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const poltiContainers = document.querySelectorAll('.polti-module');
    poltiContainers.forEach((container) => {
        new PoltiSpread(container);
    });
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PoltiSpread;
}