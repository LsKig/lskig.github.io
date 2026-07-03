class DicePlotGenerator {
  constructor(container) {
    if (!container) throw new Error('Container element is required');

    this.container = container;
    const dataFile = this.container.dataset.dataFile || 'detective_plot';
    this.data = window[`dicePlotData_${dataFile}`] || {};

    this.rolls = [];
    this.frequencies = {};
    this.isRolling = false;

    this.boundKeyDown = this.handleKeyDown.bind(this);

    this.init();
  }

  init() {
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    this.rollBtn = this.container.querySelector('.roll-btn');
    this.clearBtn = this.container.querySelector('.clear-btn');
    this.diceDisplay = this.container.querySelector('.dice-display');
    this.resultsContainer = this.container.querySelector('.results-container');
  }

  attachEventListeners() {
    this.rollBtn.addEventListener('click', () => this.handleRoll());

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.clear());
    }

    document.addEventListener('keydown', this.boundKeyDown);
  }

  handleKeyDown(e) {
    if (e.code === 'Space') {
      e.preventDefault();
      this.handleRoll();
    }

    if (e.key === 'Escape') {
      this.clear();
    }
  }

  handleRoll() {
    if (this.isRolling) return;
    this.isRolling = true;
    if (this.rollBtn) this.rollBtn.disabled = true;

    const diceCount = this.data.config?.default_dice_count || 11;
    const dieType = this.data.config?.default_die_type || 10;

    this.rollDice(diceCount, dieType);
    this.calculateFrequencies();

    this.renderDice();
    this.generateAndRenderPlot();

    this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => {
      if (this.rollBtn) this.rollBtn.disabled = false;
      this.isRolling = false;
    }, 300);
  }

  rollDice(count, type) {
    this.rolls = Array.from(
      { length: count },
      () => Math.floor(Math.random() * type) + 1
    );
    this.rolls.sort((a, b) => a - b);
  }

  calculateFrequencies() {
    this.frequencies = {};
    this.rolls.forEach(roll => {
      this.frequencies[roll] = (this.frequencies[roll] || 0) + 1;
    });
  }

  renderDice() {
    this.diceDisplay.innerHTML = '';

    const diceList = document.createElement('div');
    diceList.className = 'dice-list';

    this.rolls.forEach(roll => {
      const die = document.createElement('div');
      die.className = 'die';
      die.textContent = roll;
      diceList.appendChild(die);
    });
    this.diceDisplay.appendChild(diceList);

    const freqText = document.createElement('div');
    freqText.className = 'frequencies-text';

    const freqParts = Object.entries(this.frequencies)
      .sort((a, b) => b[1] - a[1])
      .map(([face, count]) => `${count}×${face}`);

    const strong = document.createElement('strong');
    strong.textContent = 'Выпавшие комбинации: ';
    freqText.appendChild(strong);
    freqText.appendChild(document.createTextNode(freqParts.join(', ')));

    this.diceDisplay.appendChild(freqText);
  }

  generateAndRenderPlot() {
    this.resultsContainer.innerHTML = '';
    if (!this.data.tables) return;

    const { central_conflicts, complications } = this.data.tables;

    // Множество для отслеживания граней, которые ушли в наборы (конфликты)
    const usedFaces = new Set();

    // 1. Основной конфликт
    if (central_conflicts && central_conflicts.faces) {
      const conflicts = [];

      Object.entries(central_conflicts.faces).forEach(([faceVal, faceData]) => {
        const faceInt = parseInt(faceVal);
        const count = this.frequencies[faceInt] || 0;

        // Если грань выпала 2 или более раз, она формирует набор
        if (count >= 2) {
          usedFaces.add(faceInt); // Фиксируем, что грань использована в конфликте

          if (faceData.counts) {
            let matchedText = null;
            let matchedThreshold = 0;

            Object.keys(faceData.counts).forEach(thresholdStr => {
              const threshold = parseInt(thresholdStr);
              if (count >= threshold && threshold > matchedThreshold) {
                matchedThreshold = threshold;
                matchedText = faceData.counts[thresholdStr];
              }
            });

            if (matchedText) {
              conflicts.push({
                face: faceInt,
                count: count,
                text: matchedText
              });
            }
          }
        }
      });

      // Сортировка: по убыванию количества, затем по возрастанию грани
      conflicts.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.face - b.face;
      });

      if (conflicts.length > 0) {
        const section = this.createResultSection('Основной конфликт:');
        const list = document.createElement('ul');
        list.className = 'plot-list';

        conflicts.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item.text;
          list.appendChild(li);
        });

        section.appendChild(list);
        this.resultsContainer.appendChild(section);
      }
    }

    // 2. Осложнения
    if (complications && complications.faces) {
      const comps = [];

      Object.entries(complications.faces).forEach(([faceVal, desc]) => {
        const faceInt = parseInt(faceVal);
        const count = this.frequencies[faceInt] || 0;

        // Выводим ТОЛЬКО те грани, которые выпали ровно 1 раз
        // (т.е. не участвуют в наборах и не были использованы в конфликте)
        if (count === 1 && !usedFaces.has(faceInt)) {
          comps.push({
            face: faceInt,
            text: desc
          });
        }
      });

      // Сортировка по возрастанию грани
      comps.sort((a, b) => a.face - b.face);

      if (comps.length > 0) {
        const section = this.createResultSection('Осложнения:');
        const list = document.createElement('ul');
        list.className = 'plot-list';

        comps.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item.text;
          list.appendChild(li);
        });

        section.appendChild(list);
        this.resultsContainer.appendChild(section);
      }
    }

    // Если вообще ничего не выпало
    if (this.resultsContainer.children.length === 0) {
      const noMatch = document.createElement('div');
      noMatch.className = 'no-results';
      noMatch.textContent = 'Нет совпадений для данного броска.';
      this.resultsContainer.appendChild(noMatch);
    }
  }

  createResultSection(title) {
    const div = document.createElement('div');
    div.className = 'result-section';

    const h3 = document.createElement('h3');
    h3.textContent = title;

    div.appendChild(h3);
    return div;
  }

  clear() {
    if (this.diceDisplay) this.diceDisplay.innerHTML = '';
    if (this.resultsContainer) this.resultsContainer.innerHTML = '';
    this.rolls = [];
    this.frequencies = {};
    if (this.rollBtn) this.rollBtn.disabled = false;
  }

  destroy() {
    this.clear();
    document.removeEventListener('keydown', this.boundKeyDown);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.dice-plot-module');
  containers.forEach(container => new DicePlotGenerator(container));
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DicePlotGenerator;
}