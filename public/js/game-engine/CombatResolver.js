/**
 * Combat resolution system
 * Handles the rock-paper-scissors-like combat mechanics
 */

import { MOVES } from './constants.js';

export class CombatResolver {
  constructor() {
    // Map of all possible combat interactions
    this.resolutions = {
      [MOVES.ATTACK]: {
        [MOVES.ATTACK]: this.attackVsAttack.bind(this),
        [MOVES.DEFEND]: this.attackVsDefend.bind(this),
        [MOVES.CHARGE]: this.attackVsCharge.bind(this)
      },
      [MOVES.DEFEND]: {
        [MOVES.ATTACK]: this.defendVsAttack.bind(this),
        [MOVES.DEFEND]: this.defendVsDefend.bind(this),
        [MOVES.CHARGE]: this.defendVsCharge.bind(this)
      },
      [MOVES.CHARGE]: {
        [MOVES.ATTACK]: this.chargeVsAttack.bind(this),
        [MOVES.DEFEND]: this.chargeVsDefend.bind(this),
        [MOVES.CHARGE]: this.chargeVsCharge.bind(this)
      }
    };
  }

  /**
   * Resolve a combat round between two players
   * @param {Player} p1 - First player
   * @param {Player} p2 - Second player
   * @returns {Object} Combat result with damage and effects
   */
  resolve(p1, p2) {
    const result = {
      p1Damage: 0,
      p2Damage: 0,
      message: '',
      p1Effects: [],
      p2Effects: []
    };

    this.resolutions[p1.move][p2.move](p1, p2, result);

    p1.takeDamage(result.p1Damage);
    p2.takeDamage(result.p2Damage);

    return result;
  }

  /**
   * Both players attack - higher ATK wins
   */
  attackVsAttack(p1, p2, result) {
    const diff = p1.atk - p2.atk;

    if (diff > 0) {
      result.p2Damage = diff;
      result.message = `${p1.name} overpowered ${p2.name}!`;
      result.p1Effects.push('success');
    } else if (diff < 0) {
      result.p1Damage = Math.abs(diff);
      result.message = `${p2.name} overpowered ${p1.name}!`;
      result.p2Effects.push('success');
    } else {
      result.message = 'Both attacks clashed!';
    }

    p1.resetAttack();
    p2.resetAttack();
    p1.blockCount = 0;
    p2.blockCount = 0;
  }

  /**
   * P1 attacks, P2 defends
   */
  attackVsDefend(p1, p2, result) {
    p2.blockCount++;

    if (p2.blockCount > 2) {
      result.p2Damage = p1.atk;
      result.message = `${p2.name}'s defense shattered!`;
      result.p1Effects.push('success');
      p2.blockCount = 0;
    } else {
      result.message = `${p2.name} blocked the attack!`;
      result.p2Effects.push('blocked');
    }

    p1.resetAttack();
    p1.blockCount = 0;
  }

  /**
   * P1 attacks, P2 charges
   */
  attackVsCharge(p1, p2, result) {
    result.p2Damage = p1.atk;
    p2.increaseAttack();
    result.message = `${p1.name} struck ${p2.name} while charging!`;
    result.p1Effects.push('success');
    result.p2Effects.push('charged');

    p1.resetAttack();
    p1.blockCount = 0;
    p2.blockCount = 0;
  }

  /**
   * P1 defends, P2 attacks (mirror of attackVsDefend)
   */
  defendVsAttack(p1, p2, result) {
    this.attackVsDefend(p2, p1, result);
    result.message = result.message.replace(p1.name, 'TEMP').replace(p2.name, p1.name).replace('TEMP', p2.name);
    [result.p1Damage, result.p2Damage] = [result.p2Damage, result.p1Damage];
    [result.p1Effects, result.p2Effects] = [result.p2Effects, result.p1Effects];
  }

  /**
   * Both players defend
   */
  defendVsDefend(p1, p2, result) {
    p1.blockCount++;
    p2.blockCount++;
    result.message = 'Both players defended!';
    result.p1Effects.push('blocked');
    result.p2Effects.push('blocked');
  }

  /**
   * P1 defends, P2 charges
   */
  defendVsCharge(p1, p2, result) {
    p1.blockCount++;
    p2.increaseAttack();
    result.message = `${p1.name} defended while ${p2.name} charged!`;
    result.p1Effects.push('blocked');
    result.p2Effects.push('charged');
  }

  /**
   * P1 charges, P2 attacks (mirror of attackVsCharge)
   */
  chargeVsAttack(p1, p2, result) {
    this.attackVsCharge(p2, p1, result);
    result.message = result.message.replace(p1.name, 'TEMP').replace(p2.name, p1.name).replace('TEMP', p2.name);
    [result.p1Damage, result.p2Damage] = [result.p2Damage, result.p1Damage];
    [result.p1Effects, result.p2Effects] = [result.p2Effects, result.p1Effects];
  }

  /**
   * P1 charges, P2 defends (mirror of defendVsCharge)
   */
  chargeVsDefend(p1, p2, result) {
    p1.increaseAttack();
    p2.blockCount++;
    result.message = `${p1.name} charged while ${p2.name} defended!`;
    result.p1Effects.push('charged');
    result.p2Effects.push('blocked');
  }

  /**
   * Both players charge
   */
  chargeVsCharge(p1, p2, result) {
    p1.increaseAttack();
    p2.increaseAttack();
    result.message = 'Both players charged up!';
    result.p1Effects.push('charged');
    result.p2Effects.push('charged');
    p1.blockCount = 0;
    p2.blockCount = 0;
  }
}
