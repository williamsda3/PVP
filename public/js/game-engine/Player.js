/**
 * Player class representing a combatant in the game
 */

export class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.maxHP = 5;
    this.hp = 5;
    this.baseATK = 1;
    this.atk = 1;
    this.blockCount = 0;
    this.move = null;
  }

  /**
   * Reset player to initial state for a new round
   */
  reset() {
    this.hp = this.maxHP;
    this.atk = this.baseATK;
    this.blockCount = 0;
    this.move = null;
  }

  /**
   * Apply damage to the player
   * @param {number} amount - Amount of damage to take
   */
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  /**
   * Increase attack power by 1
   */
  increaseAttack() {
    this.atk++;
  }

  /**
   * Reset attack to base value
   */
  resetAttack() {
    this.atk = this.baseATK;
  }
}
