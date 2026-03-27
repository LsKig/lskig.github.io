// creatures-card.js
class CreatureCard {
  constructor(container, creatureData, options = {}) {
    this.container = container;
    this.data = creatureData;
    this.options = {
      imageUrl: '/assets/images/creatures/',
      placeholderText: 'Изображение отсутствует',
      ...options
    };

    this.init();
  }

  init() {
    this.render();
    this.relocateContent(); // ✅ Перемещаем контент после инициализации
  }

  formatLabel(key) {
    const labels = {
      hp: 'HP',
      armor: 'Броня',
      resistance: 'Сопротивление',
      vulnerability: 'Уязвимость',
      cr: 'Сложность'
    };
    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  render() {
    const { data, options } = this;

    this.container.innerHTML = `
      <div class="creature-card-container">
        <article class="creature-card" data-creature="${data.key}">
          ${this.renderImage()}
          <div class="card-content">
            <h3 class="card-title">${data.name}</h3>
            <p class="card-description">${data.description}</p>
          </div>
          ${data.stats ? this.renderStats() : ''}
          ${data.lore ? this.renderLore() : ''}
        </article>
      </div>
      <div class="creature-text-content"></div>
    `;
  }

  // ✅ Перемещает контент который идёт после wrapper в creature-text-content
  relocateContent() {
    const wrapper = this.container;
    const textContainer = wrapper.querySelector('.creature-text-content');

    if (!textContainer) {
      console.error('creature-text-content не найден');
      return;
    }

    // Находим все sibling элементы после wrapper
    let nextSibling = wrapper.nextSibling;
    const contentToMove = [];

    // Собираем контент до следующего h2 или hr
    while (nextSibling) {
      const tagName = nextSibling.tagName?.toLowerCase();

      // Останавливаемся на следующем заголовке раздела
      if (tagName === 'h2' || tagName === 'hr') {
        break;
      }

      // Пропускаем пустые текстовые узлы
      if (nextSibling.nodeType === Node.TEXT_NODE && !nextSibling.textContent.trim()) {
        nextSibling = nextSibling.nextSibling;
        continue;
      }

      contentToMove.push(nextSibling);
      nextSibling = nextSibling.nextSibling;
    }

    // ✅ Перемещаем контент в textContainer
    if (contentToMove.length > 0) {
      contentToMove.forEach(node => {
        textContainer.appendChild(node);
      });
    }
  }

  renderImage() {
    const { placeholderText, imageUrl } = this.options;
    const { image, name, cr } = this.data;
    const imgSrc = image ? `${imageUrl}${image}` : null;

    return `
      <div class="card-image">
        ${imgSrc
          ? `<img src="${imgSrc}" alt="${name}" loading="lazy">`
          : `<div class="image-placeholder">${placeholderText}</div>`
        }
        ${cr ? `<span class="card-badge">CR ${cr}</span>` : ''}
      </div>
    `;
  }

  renderStats() {
    const { stats } = this.data;
    if (!stats) return '';

    const statRows = Object.entries(stats)
      .filter(([key]) => !['attacks'].includes(key))
      .map(([key, value]) => `
        <div class="stat-row">
          <span class="stat-label">${this.formatLabel(key)}:</span>
          <span class="stat-value">${value}</span>
        </div>
      `).join('');

    const attacks = stats.attacks?.map(atk => `
      <div class="attack-item">
        <span class="attack-name">${atk.name}</span>
        <span class="attack-damage">${atk.damage}</span>
      </div>
    `).join('') || '';

    return `
      <div class="card-stats">
        ${statRows}
        ${attacks ? `<div class="attacks-list">${attacks}</div>` : ''}
      </div>
    `;
  }

  renderLore() {
    return `<div class="card-lore">${this.data.lore}</div>`;
  }

}

// ✅ Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-creature-module]');

  if (window.creaturesData && containers.length) {
    containers.forEach(container => {
      const key = container.dataset.creatureKey;
      const creature = window.creaturesData.creatures[key];

      if (creature) {
        new CreatureCard(container, creature, {
          imageUrl: window.creaturesConfig?.imageUrl || '/assets/images/creatures/'
        });
      }
    });
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CreatureCard;
}