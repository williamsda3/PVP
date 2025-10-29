/**
 * AI opponent logic
 * Uses a scoring system to choose the best move
 */

import { MOVES } from './constants.js';

export class AI {
  /**
   * Choose the best move for the AI based on game state
   * @param {Player} player - AI player
   * @param {Player} opponent - Human opponent
   * @returns {string} Chosen move (attack, defend, or charge)
   */
  static chooseMove(player, opponent) {
    const score = {
      [MOVES.ATTACK]: 0,
      [MOVES.DEFEND]: 0,
      [MOVES.CHARGE]: 0
    };

    // Defensive: if we're in danger, prioritize defending
    if (player.hp <= opponent.atk && player.blockCount < 2) {
      score[MOVES.DEFEND] += 10;
    }

    // Aggressive: if we have higher attack, use it
    if (player.atk > opponent.atk) {
      score[MOVES.ATTACK] += 5;
    }

    // Punish: if opponent has defended too much, break their defense
    if (opponent.blockCount >= 2) {
      score[MOVES.ATTACK] += 8;
    }

    // Lethal: if we can kill opponent, prioritize attack
    if (opponent.hp <= player.atk) {
      score[MOVES.ATTACK] += 20;
    }

    // Greedy: if we're safe, charge up for bigger damage
    if (player.hp > opponent.atk + 1) {
      score[MOVES.CHARGE] += 3;
    }

    // Avoid: don't defend if we're about to break
    if (player.blockCount >= 2) {
      score[MOVES.DEFEND] = -10;
    }

    // Add randomness to make AI less predictable
    Object.keys(score).forEach(move => {
      score[move] += Math.random() * 2;
    });

    // Return move with highest score
    return Object.keys(score).reduce((a, b) => score[a] > score[b] ? a : b);
  }
}
