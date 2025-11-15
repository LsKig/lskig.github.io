class DiceGenerator {
  constructor() {
    this.tables = {};
    this.init();
  }

  init() {
    this.loadTables();
    this.bindEvents();
  }

  loadTables() {
    // Данные загружаются через Liquid при сборке
    this.tables = window.diceTables || {};
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('roll-button')) {
        this.handleRoll(e.target);
      }
    });
  }

  handleRoll(button) {
    const generator = button.closest('.dice-generator');
    const tableName = generator.dataset.table;

    const result = this.rollTable(tableName);
    if (result) {
      this.displayResult(generator, result);
      this.animateButton(button);
    }
  }

  rollTable(tableName) {
    const table = this.tables[tableName];
    if (!table) {
      console.error(`Таблица ${tableName} не найдена`);
      return null;
    }

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const roll = `${die1}${die2}`;

    const result = table.table[roll];
    if (!result) {
      console.error(`Результат для броска ${roll} не найден`);
      return null;
    }

    return { roll, die1, die2, text: result };
  }

  displayResult(generator, result) {
    const diceResult = generator.querySelector('.dice-result');

    diceResult.textContent = result.text;
  }

  animateButton(button) {
    button.classList.add('rolling');
    setTimeout(() => button.classList.remove('rolling'), 500);
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new DiceGenerator();
});