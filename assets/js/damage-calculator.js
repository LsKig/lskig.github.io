/* jshint esversion: 11 */

/**
 * DamageCalculatorUI - Обёртка для WitcherDamageCalculator
 * Конвертирует ввод из формы, вызывает расчёт, отображает инструкции
 */
class DamageCalculatorUI {
  constructor(container) {
    this.container = container;
    this.calculator = null;
    this.data = window.damageData || {};

    this.init();
  }

  init() {
    this._loadDependencies();
    this._initializeElements();
    this._attachEventListeners();
    this._initializeWeaponSelect();
  }

  _loadDependencies() {
    if (typeof WitcherDamageCalculator === 'undefined') {
      console.error('WitcherDamageCalculator not found. Please load damage-core.js first.');
      return;
    }
    this.calculator = WitcherDamageCalculator;
  }

  _initializeElements() {
    this.elements = {
      weaponSelect: this.container.querySelector('.weapon-select'),
      statInputs: this.container.querySelectorAll('.stat-input'),
      modifierCheckboxes: this.container.querySelectorAll('.modifier-checkbox input'),
      targetTypeSelect: this.container.querySelector('.target-type-select'),
      defenseInput: this.container.querySelector('.defense-input'),
      stabilityInput: this.container.querySelector('.stability-input'),
      armorInputs: this.container.querySelectorAll('.armor-grid input'),
      resistanceCheckboxes: this.container.querySelectorAll('.resistances-grid input'),
      attackRollInput: this.container.querySelector('[data-field="attackRoll"]'),
      defenseRollInput: this.container.querySelector('[data-field="defenseRoll"]'),
      rollButtons: this.container.querySelectorAll('.roll-btn'),
      aimingSelect: this.container.querySelector('[data-field="aiming"]'),
      bodyPartSelect: this.container.querySelector('[data-field="targetBodyPart"]'),
      calculateBtn: this.container.querySelector('.calculate-btn'),
      clearBtn: this.container.querySelector('.clear-btn'),
      randomizeBtn: this.container.querySelector('.randomize-btn'),
      instructionsList: this.container.querySelector('.instructions-list'),
      logContent: this.container.querySelector('.log-content')
    };
  }

  _attachEventListeners() {
    var self = this;

    this.elements.calculateBtn.addEventListener('click', function() {
      self._handleCalculate();
    });

    this.elements.clearBtn.addEventListener('click', function() {
      self._handleClear();
    });

    this.elements.randomizeBtn.addEventListener('click', function() {
      self._handleRandomize();
    });

    this.elements.rollButtons.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        var rollType = e.currentTarget.dataset.roll;
        self._rollDiceForInput(rollType);
      });
    });

    if (this.elements.weaponSelect) {
      this.elements.weaponSelect.addEventListener('change', function(e) {
        self._handleWeaponChange(e);
      });
    }
  }

  _initializeWeaponSelect() {
    if (!this.elements.weaponSelect) return;

    var selectedOption = this.elements.weaponSelect.options[this.elements.weaponSelect.selectedIndex];
    if (selectedOption.value) {
      this._applyWeaponData(selectedOption);
    }
  }

  _handleWeaponChange(event) {
    var selectedOption = event.target.options[event.target.selectedIndex];
    this._applyWeaponData(selectedOption);
  }

  _applyWeaponData(option) {
    var isSilver = option.dataset.silver === 'true';
    var isHoly = option.dataset.holy === 'true';
    var elemental = option.dataset.elemental;

    console.log('Weapon selected:', option.value, { isSilver: isSilver, isHoly: isHoly, elemental: elemental });
  }

  _rollDiceForInput(rollType) {
    var result = this._rollDice('1d10');
    var input = rollType === 'attack'
      ? this.elements.attackRollInput
      : this.elements.defenseRollInput;

    if (input) {
      input.value = result;
    }
  }

  _rollDice(expression) {
    var match = expression.match(/^(\d+)d(\d+)$/);
    if (!match) return parseInt(expression, 10) || 1;

    var count = parseInt(match[1], 10);
    var sides = parseInt(match[2], 10);
    var sum = 0;

    for (var i = 0; i < count; i++) {
      sum += Math.floor(Math.random() * sides) + 1;
    }
    return sum;
  }

  _collectFormData() {
    var weaponOption = this.elements.weaponSelect.options[this.elements.weaponSelect.selectedIndex];
    var weapon = {
      baseDamage: weaponOption.dataset.baseDamage || '1d6',
      damageBonus: parseInt(weaponOption.dataset.damageBonus, 10) || 0,
      modifiers: {
        armorPiercing: weaponOption.dataset.armorPiercing === 'true',
        silver: weaponOption.dataset.silver === 'true',
        elemental: weaponOption.dataset.elemental || null,
        holy: weaponOption.dataset.holy === 'true'
      }
    };

    var attacker = {
      stats: {
        body: parseInt(this._getValue('body'), 10) || 0
      }
    };

    var attackModifiers = {};
    this.elements.modifierCheckboxes.forEach(function(cb) {
      var modKey = cb.dataset.mod;
      if (modKey) {
        attackModifiers[modKey] = cb.checked;
      }
    });
    attacker.modifiers = attackModifiers;

    var target = {
      type: this.elements.targetTypeSelect.value || 'humanoid',
      defense: parseInt(this.elements.defenseInput.value, 10) || 0,
      stabilityThreshold: parseInt(this.elements.stabilityInput.value, 10) || 0,
      armor: {},
      resistances: {}
    };

    // Броня по частям тела
    this.elements.armorInputs.forEach(function(input) {
      var part = input.dataset.part;
      target.armor[part] = parseInt(input.value, 10) || 0;
    });

    // Сопротивления по частям тела (чекбоксы)
    this.elements.resistanceCheckboxes.forEach(function(cb) {
      var part = cb.dataset.part;
      target.resistances[part] = cb.checked;
    });

    var attackRollVal = this.elements.attackRollInput.value;
    var defenseRollVal = this.elements.defenseRollInput.value;

    var attack = {
      attackRoll: !attackRollVal ? 0 : parseInt(attackRollVal, 10),
      defenseRoll: !defenseRollVal ? 0 : parseInt(defenseRollVal, 10),
      aiming: parseInt(this.elements.aimingSelect.value, 10) || 0,
      strongAttack: this.container.querySelector('[data-field="strongAttack"]').checked,
      targetBodyPart: this.elements.bodyPartSelect.value || null
    };

    return {
      weapon: weapon,
      attacker: attacker,
      target: target,
      attack: attack,
      options: { showLog: true }
    };
  }

  _getValue(field) {
    var input = this.container.querySelector('[data-field="' + field + '"]');
    return input ? input.value : null;
  }

  _handleCalculate() {
    var formData = this._collectFormData();

    try {
      var calc = new this.calculator(formData);
      var result = calc.calculate();

      this._displayResults(result);

    } catch (error) {
      console.error('Calculation error:', error);
      this._displayError('Ошибка расчёта: ' + error.message);
    }
  }

  _displayResults(result) {
    this.elements.instructionsList.innerHTML = '';

    if (result.instructions && result.instructions.length > 0) {
      var ol = document.createElement('ol');
      ol.className = 'instructions-ordered-list';

      result.instructions.forEach(function(instruction) {
        var li = document.createElement('li');
        li.textContent = instruction;
        li.className = 'instruction-item';
        ol.appendChild(li);
      });

      this.elements.instructionsList.appendChild(ol);
    } else {
      this.elements.instructionsList.innerHTML = '<p class="no-instructions">Нет инструкций для отображения.</p>';
    }

    if (result.meta && result.meta.log) {
      this.elements.logContent.textContent = result.meta.log.join('\n');
    }

    this.elements.instructionsList.scrollIntoView({ behavior: 'smooth' });
  }

  _displayError(message) {
    this.elements.instructionsList.innerHTML =
      '<div class="error-message">❌ ' + message + '</div>';
  }

  _handleClear() {
    var self = this;

    if (this.elements.weaponSelect) {
      this.elements.weaponSelect.selectedIndex = 0;
    }

    this.elements.statInputs.forEach(function(input) {
      input.value = '0';
    });

    this.elements.modifierCheckboxes.forEach(function(cb) {
      cb.checked = false;
    });

    if (this.elements.targetTypeSelect) {
      this.elements.targetTypeSelect.value = 'humanoid';
    }
    if (this.elements.defenseInput) {
      this.elements.defenseInput.value = '0';
    }
    if (this.elements.stabilityInput) {
      this.elements.stabilityInput.value = '0';
    }

    this.elements.armorInputs.forEach(function(input) {
      input.value = '0';
    });

    this.elements.resistanceCheckboxes.forEach(function(cb) {
      cb.checked = false;
    });

    if (this.elements.attackRollInput) {
      this.elements.attackRollInput.value = '0';
    }
    if (this.elements.defenseRollInput) {
      this.elements.defenseRollInput.value = '0';
    }
    if (this.elements.aimingSelect) {
      this.elements.aimingSelect.value = '0';
    }
    if (this.elements.bodyPartSelect) {
      this.elements.bodyPartSelect.selectedIndex = 0;
    }

    this.elements.instructionsList.innerHTML = '';
    if (this.elements.logContent) {
      this.elements.logContent.textContent = '';
    }
  }

  _handleRandomize() {
    var self = this;

    this.elements.statInputs.forEach(function(input) {
      input.value = self._rollDice('1d6');
    });

    if (this.elements.defenseInput) {
      this.elements.defenseInput.value = self._rollDice('1d10');
    }

    this.elements.armorInputs.forEach(function(input) {
      input.value = self._rollDice('1d4');
    });

    this.elements.resistanceCheckboxes.forEach(function(cb) {
      cb.checked = Math.random() > 0.7;
    });

    if (this.elements.attackRollInput) {
      this.elements.attackRollInput.value = self._rollDice('1d10');
    }
    if (this.elements.defenseRollInput) {
      this.elements.defenseRollInput.value = self._rollDice('1d10');
    }

    this.elements.modifierCheckboxes.forEach(function(cb) {
      cb.checked = Math.random() > 0.7;
    });

    if (this.elements.aimingSelect) {
      this.elements.aimingSelect.value = Math.floor(Math.random() * 4).toString();
    }

    console.log('Randomized values applied');
  }

  setFormData(formData) {
    console.log('setFormData called with:', formData);
  }

  getResult() {
    return null;
  }

  destroy() {
    this.elements = null;
    this.calculator = null;
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
  var containers = document.querySelectorAll('.damage-calculator-module');
  containers.forEach(function(container) {
    new DamageCalculatorUI(container);
  });
});

// Экспорт для Node.js / Jekyll
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DamageCalculatorUI;
}