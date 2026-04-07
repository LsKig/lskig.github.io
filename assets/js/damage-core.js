/* jshint esversion: 11 */

/**
 * Калькулятор урона для НРИ "Ведьмак"
 * Реализует полный алгоритм расчета из "Расчет урона.md" и "Место попадания.md"
 */
class WitcherDamageCalculator {
  /**
   * @param {Object} params - Входные параметры
   */
  constructor(params) {
    this.params = this._normalizeInput(params);
    this.instructions = [];
    this.meta = { log: [], critical: null, hit: false };
  }

  /**
   * Основной метод расчета
   * @returns {{instructions: string[], meta: Object}}
   */
  calculate() {
    this.instructions = [];
    this.meta = { log: [], critical: null, hit: false };

    // 1. Проверка попадания (с учётом сильной атаки, прицеливания и штрафов части тела)
    var hitData = this._checkHit();
    this.meta.hit = hitData.hit;
    this.meta.log.push('Атака: ' + hitData.attackTotal + ' vs Защита: ' + hitData.defenseTotal + '. Разница: ' + hitData.diff);

    if (!hitData.hit) {
      this.instructions.push('Атака промахнулась. Урон и эффекты не применяются.');
      return this._getResult();
    }

    // 2. Определение части тела
    var bodyPart = this._resolveBodyPart();
    bodyPart = this._handleSpiritLegReroll(bodyPart);
    this.meta.log.push('Часть тела: ' + bodyPart);

    // 3. Проверка критического попадания
    this.meta.critical = this._evaluateCritical(hitData.diff, bodyPart);

    // 4. Расчет урона (с учётом множителей части тела и сопротивления)
    var damageData = this._calculateDamage(bodyPart, this.meta.critical);

    // 5. Генерация инструкций
    this._generateInstructions(damageData, bodyPart, this.meta.critical);

    return this._getResult();
  }

  // ==================== ВНУТРЕННИЕ МЕТОДЫ ====================

  _normalizeInput(params) {
    var p = params || {};
    var weapon = p.weapon || {};
    var attacker = p.attacker || {};
    var target = p.target || {};
    var attack = p.attack || {};
    var options = p.options || {};

    return {
      weapon: {
        baseDamage: weapon.baseDamage || '1d6',
        damageBonus: weapon.damageBonus || 0,
        modifiers: Object.assign({
          armorPiercing: false,
          silver: false,
          elemental: null,
          holy: false
        }, weapon.modifiers || {})
      },
      attacker: Object.assign({
        stats: { body: 0 }
      }, attacker),
      target: {
        defense: target.defense || 0,
        armor: target.armor || { head: 0, torso: 0, arm: 0, leg: 0 },
        resistances: target.resistances || { head: false, torso: false, arm: false, leg: false },
        type: target.type || 'humanoid',
        stabilityThreshold: target.stabilityThreshold || 0
      },
      attack: {
        attackRoll: attack.attackRoll !== undefined ? attack.attackRoll : 0,
        defenseRoll: attack.defenseRoll !== undefined ? attack.defenseRoll : 0,
        aiming: attack.aiming || 0,
        strongAttack: !!attack.strongAttack,
        targetBodyPart: attack.targetBodyPart || null
      },
      options: {
        showLog: options.showLog !== undefined ? options.showLog : true
      }
    };
  }

  _rollDice(expression) {
    var match = expression.match(/^(\d+)d(\d+)$/);
    if (!match) return parseInt(expression, 10) || 0;
    var count = parseInt(match[1], 10);
    var sides = parseInt(match[2], 10);
    var sum = 0;
    for (var i = 0; i < count; i++) {
      sum += Math.floor(Math.random() * sides) + 1;
    }
    return sum;
  }

  _checkHit() {
    var attackRoll = this.params.attack.attackRoll;
    var defenseRoll = this.params.attack.defenseRoll;

    // Прицеливание: +1 за раунд, макс +3
    var aimingBonus = Math.min(this.params.attack.aiming, 3);

    // Сильная атака: штраф -3 к попаданию
    var strongAttackPenalty = this.params.attack.strongAttack ? -3 : 0;

    // Штраф за прицеливание в часть тела (только если атака прицельная)
    var bodyPartPenalty = 0;
    if (this.params.attack.targetBodyPart) {
      bodyPartPenalty = this._getBodyPartAimingPenalty(this.params.attack.targetBodyPart);
    }

    var ambushPenalty = this.params.attacker.modifiers.ambush ? 5 : 0;
    var blindedPenalty = this.params.attacker.modifiers.blinded ? -3 : 0;
    var quickDrawPenalty = this.params.attacker.modifiers.quickDraw ? -3 : 0;
    var ricochetPenalty = this.params.attacker.modifiers.ricochet ? -5 : 0;
    var targetDodgingPenalty = this.params.attacker.modifiers.targetDodging ? -2 : 0;
    var targetImmobilizedPenalty = this.params.attacker.modifiers.targetImmobilized ? 4 : 0;
    var targetMovingPenalty = this.params.attacker.modifiers.targetMoving ? -3 : 0;
    var targetSilhouettedPenalty = this.params.attacker.modifiers.targetSilhouetted ? 2 : 0;


    var attackTotal = attackRoll + aimingBonus + strongAttackPenalty + bodyPartPenalty + ambushPenalty
    + blindedPenalty + quickDrawPenalty + ricochetPenalty + targetDodgingPenalty + targetImmobilizedPenalty+
    targetMovingPenalty + targetSilhouettedPenalty;

    var defenseTotal = defenseRoll + this.params.target.defense;
    var diff = attackTotal - defenseTotal;

    if (this.params.attack.strongAttack) {
      this.meta.log.push('Сильная атака: -3 к попаданию');
    }
    if (aimingBonus > 0) {
      this.meta.log.push('Прицеливание: +' + aimingBonus + ' к попаданию');
    }
    if (bodyPartPenalty < 0) {
      this.meta.log.push('Штраф за часть тела (' + this.params.attack.targetBodyPart + '): ' + bodyPartPenalty + ' к попаданию');
    }
    if (this.params.attacker.modifiers.ambush) {
      this.meta.log.push('Засада: +5 к попаданию');
    }
    if (this.params.attacker.modifiers.blinded) {
      this.meta.log.push('Атакующий ослеплен: -3 к попаданию');
    }
    if (this.params.attacker.modifiers.quickDraw) {
      this.meta.log.push('Штраф за быстрое выхватывание: -3 к попаданию');
    }
    if (this.params.attacker.modifiers.ricochet) {
      this.meta.log.push('Снаряд отрекошетил: -5 к попаданию');
    }
    if (this.params.attacker.modifiers.targetDodging) {
      this.meta.log.push('Цель активно уклоняется: -2 к попаданию');
    }
    if (this.params.attacker.modifiers.targetImmobilized) {
      this.meta.log.push('Цель обездвижена: +4 к попаданию');
    }
    if (this.params.attacker.modifiers.targetMoving) {
      this.meta.log.push('Цель движется: -3 к попаданию');
    }
    if (this.params.attacker.modifiers.targetSilhouetted) {
      this.meta.log.push('Силуэт цели выделяется: +2 к попаданию');
    }

    return {
      hit: diff > 0,
      diff: diff,
      attackTotal: attackTotal,
      defenseTotal: defenseTotal
    };
  }

  _getBodyPartAimingPenalty(bodyPart) {
    // Таблица штрафов из "Место попадания.md"
    // Для упрощения используем общую таблицу (гуманоиды/чудовища имеют схожие штрафы)
    switch (bodyPart) {
      case 'head':
        return -6;      // -6 за голову
      case 'torso':
        return -1;      // -1 за туловище
      case 'arm':
        return -3;      // -3 за руку
      case 'leg':
        return -2;      // -2 за ногу
      default:
        return 0;       // Нет штрафа для случайного попадания
    }
  }

  _resolveBodyPart() {
    // Если часть тела не выбрана - бросаем 1d10 (неприцельная атака)
    if (!this.params.attack.targetBodyPart) {
      var roll = this._rollDice('1d10');
      if (roll <= 2) return 'leg';
      if (roll <= 4) return 'arm';
      if (roll <= 8) return 'torso';
      return 'head';
    }
    // Иначе используем выбранную часть тела (прицельная атака)
    return this.params.attack.targetBodyPart;
  }

  _handleSpiritLegReroll(bodyPart) {
    var targetType = this.params.target.type;
    if ((targetType === 'spirit' || targetType === 'elemental_spirit') && bodyPart === 'leg') {
      var newPart = bodyPart;
      var attempts = 0;
      while (newPart === 'leg' && attempts < 10) {
        newPart = this._resolveBodyPart();
        attempts++;
      }
      this.meta.log.push('Дух/Дух стихии: переброс ноги -> ' + newPart);
      return newPart;
    }
    return bodyPart;
  }

  _evaluateCritical(diff, bodyPart) {
    if (diff < 7) return null;

    var level;
    if (diff >= 15) level = 'lethal';
    else if (diff >= 13) level = 'heavy';
    else if (diff >= 10) level = 'medium';
    else level = 'light';

    var isSpirit = this.params.target.type === 'spirit' || this.params.target.type === 'elemental_spirit';
    var unabsorbableMap = { light: 5, medium: 10, heavy: 15, lethal: 20 };

    if (isSpirit) {
      if (bodyPart === 'torso') {
        return {
          level: level,
          unabsorbable: unabsorbableMap[level],
          effect: null,
          stabilityRequired: false
        };
      }
      return { level: level, unabsorbable: 0, effect: null, stabilityRequired: false };
    }

    var critRoll;
    var isAimed = !!this.params.attack.targetBodyPart;

    // Прицельная атака в голову/торс: 1d6 → маппинг на таблицу
    if (isAimed && (bodyPart === 'head' || bodyPart === 'torso')) {
      var d6 = this._rollDice('1d6');
      if (bodyPart === 'head') {
        critRoll = d6 <= 4 ? 11 : 12;
      } else {
        critRoll = d6 <= 4 ? this._rollRange(6, 8) : this._rollRange(9, 10);
      }
    }
    else if (isAimed && (bodyPart === 'hand' )) {
      critRoll = 4;
    }
    else if (isAimed && (bodyPart === 'leg' )) {
      critRoll = 3;
    }

    else {
      // Неприцельная или конечности: 2d6
      critRoll = this._rollDice('2d6');
    }

    var effect = this._getCriticalEffect(level, critRoll);
    return {
      level: level,
      unabsorbable: 0,
      effect: effect,
      critRoll: critRoll,
      stabilityRequired: true
    };
  }

  _rollRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  _getCriticalEffect(level, roll) {
    var tables = {
      light: {
        12: 'Треснувшая челюсть: -2 к магическим навыкам и Словесной дуэли.',
        11: 'Уродующий шрам: -3 к эмпатической Словесной дуэли.',
        10: 'Треснувшие рёбра: -2 к Тел. (9-10)',
        9: 'Треснувшие рёбра: -2 к Тел. (9-10)',
        8: 'Инородный объект: Заражение. Отдых/исцеление /4. (6-8)',
        7: 'Инородный объект: Заражение. Отдых/исцеление /4. (6-8)',
        6: 'Инородный объект: Заражение. Отдых/исцеление /4. (6-8)',
        5: 'Вывих руки: -2 к действиям этой рукой. (4-5)',
        4: 'Вывих руки: -2 к действиям этой рукой. (4-5)',
        3: 'Вывих ноги: -2 к Скор, Уклонению/Изворотливости и Атлетике. (2-3)',
        2: 'Вывих ноги: -2 к Скор, Уклонению/Изворотливости и Атлетике. (2-3)'
      },
      medium: {
        12: 'Небольшая травма головы: -1 к Инт, Воле и Уст.',
        11: 'Выбитые зубы: -3 к магическим навыкам и Словесной дуэли.',
        10: 'Разрыв селезёнки: Испытание Уст каждые 5 раундов. Кровотечение.',
        9: 'Разрыв селезёнки: Испытание Уст каждые 5 раундов. Кровотечение.',
        8: 'Сломанные рёбра: -2 к Тел, -1 к Реа и Лвк.',
        7: 'Сломанные рёбра: -2 к Тел, -1 к Реа и Лвк.',
        6: 'Сломанные рёбра: -2 к Тел, -1 к Реа и Лвк.',
        5: 'Перелом руки: -3 ко всем действиям этой рукой.',
        4: 'Перелом руки: -3 ко всем действиям этой рукой.',
        3: 'Перелом ноги: -3 к Скор, Уклонению/Изворотливости и Атлетике.',
        2: 'Перелом ноги: -3 к Скор, Уклонению/Изворотливости и Атлетике.'
      },
      heavy: {
        12: 'Проломленный череп: -1 к Инт и Лвк. Ранения в голову ×4 урона. Кровотечение.',
        11: 'Контузия: Испытание Уст каждые 1d6 раундов. -2 к Инт, Реа, Лвк.',
        10: 'Рана в живот: -2 ко всем действиям. 4 урона кислотой в раунд.',
        9: 'Рана в живот: -2 ко всем действиям. 4 урона кислотой в раунд.',
        8: 'Сосущая рана грудной клетки: -3 к Тел и Скор. Задыхается.',
        7: 'Сосущая рана грудной клетки: -3 к Тел и Скор. Задыхается.',
        6: 'Сосущая рана грудной клетки: -3 к Тел и Скор. Задыхается.',
        5: 'Открытый перелом руки: Рука раздроблена. Невозможно двигать. Кровотечение.',
        4: 'Открытый перелом руки: Рука раздроблена. Невозможно двигать. Кровотечение.',
        3: 'Открытый перелом ноги: Скор/Уклонение/Атлетика /4. Кровотечение.',
        2: 'Открытый перелом ноги: Скор/Уклонение/Атлетика /4. Кровотечение.'
      },
      lethal: {
        12: 'Сломанная шея / отсечение головы: Немедленная смерть.',
        11: 'Повреждение глаза: -5 к зрительному Вниманию, -4 к Лвк. Кровотечение.',
        10: 'Травма сердца: Испытание против смерти. Вын/Скор/Тел /4. Кровотечение.',
        9: 'Травма сердца: Испытание против смерти. Вын/Скор/Тел /4. Кровотечение.',
        8: 'Септический шок: Вын /4. -3 к Инт, Воле, Реа, Лвк. Отравлен.',
        7: 'Септический шок: Вын /4. -3 к Инт, Воле, Реа, Лвк. Отравлен.',
        6: 'Септический шок: Вын /4. -3 к Инт, Воле, Реа, Лвк. Отравлен.',
        5: 'Потеря руки: Рука отрублена. Невозможно пользоваться. Кровотечение.',
        4: 'Потеря руки: Рука отрублена. Невозможно пользоваться. Кровотечение.',
        3: 'Потеря ноги: Скор/Уклонение/Атлетика /4. Кровотечение.',
        2: 'Потеря ноги: Скор/Уклонение/Атлетика /4. Кровотечение.'
      }
    };

    var levelTable = tables[level];
    if (!levelTable) return 'Неизвестный эффект';
    return levelTable[roll] || 'Неизвестный эффект';
  }

  _calculateDamage(bodyPart, crit) {
    var weapon = this.params.weapon;
    var attacker = this.params.attacker;
    var stats = attacker.stats;

    // 1. Базовый урон
    var rawDamage = this._rollDice(weapon.baseDamage);
    rawDamage += weapon.damageBonus;
    rawDamage += stats.body;
    if (weapon.modifiers.elemental) {
      rawDamage += weapon.modifiers.elemental === 'fire' ? 2 : 1;
    }
    if (weapon.modifiers.holy) rawDamage += 3; /// WTF is this
    if (weapon.modifiers.silver) rawDamage += 2; /// Fix  silver

    this.meta.log.push('Базовый урон (до брони): ' + rawDamage);

    // 2. Броня
    var armorValue = this.params.target.armor[bodyPart] || 0;
    if (weapon.modifiers.armorPiercing) {
      armorValue = Math.floor(armorValue / 2);
      this.meta.log.push('Усиленное пробивание: броня уменьшена вдвое (' + armorValue + ')');
    }
    var absorbed = Math.min(rawDamage, armorValue);
    var damageAfterArmor = Math.max(0, rawDamage - absorbed);

    this.meta.log.push('Броня поглощает: ' + absorbed + ', урон после брони: ' + damageAfterArmor);

    // 3. Множитель части тела (п. 5.1.6.1)
    var bodyPartMultiplier = this._getBodyPartMultiplier(bodyPart);
    var damageAfterBodyPart = damageAfterArmor * bodyPartMultiplier;

    if (bodyPartMultiplier !== 1) {
      this.meta.log.push('Множитель части тела (' + bodyPart + '): ×' + bodyPartMultiplier);
    }

    // 4. Сопротивление части тела (п. 5.1.6.2) - ×1/2 если есть
    var hasResistance = this.params.target.resistances[bodyPart] || false;
    var resistanceMultiplier = hasResistance ? 0.5 : 1;
    var finalDamage = damageAfterBodyPart * resistanceMultiplier;

    if (hasResistance) {
      this.meta.log.push('Сопротивление части тела: ×1/2');
    }

    // 5. Сильная атака: множитель ×2 (п. 5.1.6.3)
    if (this.params.attack.strongAttack) {
      finalDamage = finalDamage * 2;
      this.meta.log.push('Сильная атака: урон умножен на 2');
    }

    // 6. Доп. урон от крита и духа
    var critLevelBonus = { light: 3, medium: 5, heavy: 8, lethal: 10 };
    if (crit && crit.level) {
      finalDamage += critLevelBonus[crit.level] || 0;
      this.meta.log.push('Урон от критического ранения: ' + critLevelBonus[crit.level]);
    }
    if (crit && crit.unabsorbable) {
      finalDamage += crit.unabsorbable;
      this.meta.log.push('Непоглощаемый доп урон для духов: ' + crit.unabsorbable);
    }

    finalDamage = Math.max(0, Math.round(finalDamage));

    return {
      rawDamage: rawDamage,
      absorbed: absorbed,
      finalDamage: finalDamage,
      strongAttack: this.params.attack.strongAttack,
      bodyPartMultiplier: bodyPartMultiplier,
      hasResistance: hasResistance
    };
  }

  _getBodyPartMultiplier(bodyPart) {
    // Таблица множителей из "Место попадания.md"
    switch (bodyPart) {
      case 'head':
        return 3;      // ×3 за голову
      case 'torso':
        return 1;      // ×1 за туловище
      case 'arm':
        return 0.5;    // ×1/2 за руку
      case 'leg':
        return 0.5;    // ×1/2 за ногу
      default:
        return 1;
    }
  }

  _generateInstructions(damage, bodyPart, crit) {
    var partNames = { head: 'голове', torso: 'туловище', arm: 'руке', leg: 'ноге' };
    var partName = partNames[bodyPart] || bodyPart;

    // Урон здоровью
    if (damage.finalDamage > 0) {
      this.instructions.push('Отнимите у цели ' + damage.finalDamage + ' пунктов здоровья.');
    } else {
      this.instructions.push('Броня полностью поглотила урон. Здоровье не потеряно.');
    }

    // Прочность брони
    if ((damage.absorbed > 0  || this.params.weapon.modifiers.armorPiercing ) && this.params.target.type ==  "humanoid") {
      this.instructions.push('Уменьшите прочность брони на ' + partName + ' на 1 пункт.');
    }


    // Эффекты критического ранения
    if (crit && crit.effect) {
      var effectText = crit.effect.split(':')[0];
      this.instructions.push('Примените эффект критического ранения (' + crit.level + '): ' + effectText + '.');

      if (crit.effect.indexOf('Тел') !== -1) {
        this.instructions.push('Снизьте показатель Телосложения согласно эффекту ранения.');
      }
      if (crit.effect.indexOf('Инт') !== -1) {
        this.instructions.push('Снизьте показатель Интеллекта согласно эффекту ранения.');
      }
      if (crit.effect.indexOf('Выносливость') !== -1 || crit.effect.indexOf('Вын') !== -1) {
        this.instructions.push('Уменьшите текущую выносливость согласно эффекту ранения.');
      }
    }

    // Испытание устойчивости
    if (crit && crit.stabilityRequired) {
      var stabilityMsg = 'Цель должна пройти испытание Устойчивости (СЛ ' + this.params.target.stabilityThreshold + ').';
      this.instructions.push(stabilityMsg);
    }

    // Статусы
    if (crit && crit.effect) {
      if (crit.effect.indexOf('Кровотечение') !== -1) {
        this.instructions.push('Наложите состояние "Кровотечение" (2 урона в ход).');
      }
      if (crit.effect.indexOf('Отравлен') !== -1) {
        this.instructions.push('Наложите состояние "Отравление" (3 урона в ход, не снижается бронёй).');
      }
      if (crit.effect.indexOf('Задыхается') !== -1) {
        this.instructions.push('Наложите состояние "Удушье" (3 урона в раунд).');
      }
      if (crit.effect.indexOf('Немедленная смерть') !== -1) {
        this.instructions.push('Цель немедленно погибает.');
      }
    }
  }

  _getResult() {
    return {
      instructions: this.instructions,
      meta: this.meta
    };
  }
}

// Экспорт для Node.js / Jekyll
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WitcherDamageCalculator;
}