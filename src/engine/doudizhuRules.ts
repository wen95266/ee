/**
 * Classic Doudizhu Rules & AI Engine
 * Handles full combination recognition, comparison, and humanized bot strategies
 */

export interface DDZCard {
  id: string;
  rank: number; // 3..17 (11=J, 12=Q, 13=K, 14=A, 15=2, 16=小王, 17=大王)
  label: string;
  suit: '♠' | '♥' | '♣' | '♦' | 'JOKER';
  isRed: boolean;
}

export type DDZComboType =
  | 'single'
  | 'pair'
  | 'triplet'
  | 'triplet_one'
  | 'triplet_pair'
  | 'straight'
  | 'straight_pairs'
  | 'airplane'
  | 'airplane_small'
  | 'airplane_large'
  | 'four_two_singles'
  | 'four_two_pairs'
  | 'bomb'
  | 'rocket';

export interface DDZCombo {
  type: DDZComboType;
  rank: number;
  cards: DDZCard[];
  length?: number;
  seat?: number;
}

export function parseDoudizhuCombo(cards: DDZCard[]): DDZCombo | null {
  if (!cards || cards.length === 0) return null;
  const count = cards.length;
  const sorted = [...cards].sort((a, b) => a.rank - b.rank);

  // 1. Rocket (Rocket is 16 + 17)
  if (count === 2 && sorted[0].rank === 16 && sorted[1].rank === 17) {
    return { type: 'rocket', rank: 100, cards: sorted };
  }

  // 2. Single
  if (count === 1) {
    return { type: 'single', rank: sorted[0].rank, cards: sorted };
  }

  // Rank frequency map
  const rankCounts = new Map<number, number>();
  for (const c of sorted) {
    rankCounts.set(c.rank, (rankCounts.get(c.rank) || 0) + 1);
  }

  const entries = Array.from(rankCounts.entries()).sort((a, b) => b[1] - a[1] || a[0] - b[0]);

  // 3. Pair
  if (count === 2 && entries.length === 1 && entries[0][1] === 2) {
    return { type: 'pair', rank: entries[0][0], cards: sorted };
  }

  // 4. Triplet
  if (count === 3 && entries.length === 1 && entries[0][1] === 3) {
    return { type: 'triplet', rank: entries[0][0], cards: sorted };
  }

  // 5. Bomb
  if (count === 4 && entries.length === 1 && entries[0][1] === 4) {
    return { type: 'bomb', rank: entries[0][0], cards: sorted };
  }

  // 6. Triplet with 1 (3+1)
  if (count === 4 && entries[0][1] === 3) {
    return { type: 'triplet_one', rank: entries[0][0], cards: sorted };
  }

  // 7. Triplet with pair (3+2)
  if (count === 5 && entries[0][1] === 3 && entries[1][1] === 2) {
    return { type: 'triplet_pair', rank: entries[0][0], cards: sorted };
  }

  // 8. Straight (>= 5 cards, rank strictly consecutive up to 14, 2 and Jokers cannot be part of straight)
  if (count >= 5 && entries.length === count) {
    const ranks = sorted.map((c) => c.rank);
    if (ranks[ranks.length - 1] <= 14) {
      let isSeq = true;
      for (let i = 1; i < ranks.length; i++) {
        if (ranks[i] !== ranks[i - 1] + 1) {
          isSeq = false;
          break;
        }
      }
      if (isSeq) {
        return { type: 'straight', rank: ranks[0], length: count, cards: sorted };
      }
    }
  }

  // 9. Consecutive Pairs (>= 3 pairs = 6 cards)
  if (count >= 6 && count % 2 === 0 && entries.every((e) => e[1] === 2)) {
    const pairRanks = entries.map((e) => e[0]).sort((a, b) => a - b);
    if (pairRanks[pairRanks.length - 1] <= 14) {
      let isSeq = true;
      for (let i = 1; i < pairRanks.length; i++) {
        if (pairRanks[i] !== pairRanks[i - 1] + 1) {
          isSeq = false;
          break;
        }
      }
      if (isSeq) {
        return { type: 'straight_pairs', rank: pairRanks[0], length: pairRanks.length, cards: sorted };
      }
    }
  }

  // 10. Airplane pure / with wings
  const triplets = entries.filter((e) => e[1] >= 3).map((e) => e[0]).sort((a, b) => a - b);
  // Find longest consecutive triplet sequence (< 15)
  if (triplets.length >= 2) {
    for (let len = triplets.length; len >= 2; len--) {
      for (let start = 0; start <= triplets.length - len; start++) {
        const sub = triplets.slice(start, start + len);
        if (sub[sub.length - 1] >= 15) continue;
        let isSeq = true;
        for (let i = 1; i < sub.length; i++) {
          if (sub[i] !== sub[i - 1] + 1) {
            isSeq = false;
            break;
          }
        }
        if (isSeq) {
          // Pure airplane
          if (count === len * 3) {
            return { type: 'airplane', rank: sub[0], length: len, cards: sorted };
          }
          // Airplane with small wings (len singles)
          if (count === len * 4) {
            return { type: 'airplane_small', rank: sub[0], length: len, cards: sorted };
          }
          // Airplane with large wings (len pairs)
          if (count === len * 5) {
            const wings = entries.filter((e) => !sub.includes(e[0]));
            if (wings.every((e) => e[1] === 2)) {
              return { type: 'airplane_large', rank: sub[0], length: len, cards: sorted };
            }
          }
        }
      }
    }
  }

  // 11. Four with two (4+2 singles or 4+2 pairs)
  const quads = entries.filter((e) => e[1] === 4);
  if (quads.length >= 1) {
    const quadRank = quads[0][0];
    if (count === 6) {
      return { type: 'four_two_singles', rank: quadRank, cards: sorted };
    }
    if (count === 8) {
      const rest = entries.filter((e) => e[0] !== quadRank);
      if (rest.length === 2 && rest.every((e) => e[1] === 2)) {
        return { type: 'four_two_pairs', rank: quadRank, cards: sorted };
      }
    }
  }

  return null;
}

export function canBeatDoudizhuCombo(candidate: DDZCombo, target: DDZCombo | null): boolean {
  if (!target) return true;
  if (candidate.type === 'rocket') return true;
  if (candidate.type === 'bomb') {
    if (target.type === 'rocket') return false;
    if (target.type !== 'bomb') return true;
    return candidate.rank > target.rank;
  }
  if (target.type === 'bomb' || target.type === 'rocket') return false;
  if (candidate.type !== target.type) return false;
  if (candidate.length && target.length && candidate.length !== target.length) return false;
  return candidate.rank > target.rank;
}

/**
 * Humanized AI strategy: picks legal moves with intelligent delay simulation
 */
export function getDoudizhuAIPlay(hand: DDZCard[], target: DDZCombo | null): DDZCard[] | null {
  const sorted = [...hand].sort((a, b) => a.rank - b.rank);
  if (sorted.length === 0) return null;

  // Free turn: play lowest sensible card or combo
  if (!target) {
    // 1. Try playing longest straight
    for (let len = 12; len >= 5; len--) {
      for (let s = 3; s <= 14 - len + 1; s++) {
        const straightCards: DDZCard[] = [];
        for (let r = s; r < s + len; r++) {
          const match = sorted.find((c) => c.rank === r);
          if (match) straightCards.push(match);
        }
        if (straightCards.length === len) {
          return straightCards;
        }
      }
    }
    // 2. Try single lowest
    return [sorted[0]];
  }

  // Beating target combo
  if (target.type === 'single') {
    const cand = sorted.find((c) => c.rank > target.rank);
    if (cand) return [cand];
  } else if (target.type === 'pair') {
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].rank === sorted[i + 1].rank && sorted[i].rank > target.rank) {
        return [sorted[i], sorted[i + 1]];
      }
    }
  } else if (target.type === 'triplet') {
    for (let i = 0; i < sorted.length - 2; i++) {
      if (sorted[i].rank === sorted[i + 1].rank && sorted[i + 1].rank === sorted[i + 2].rank && sorted[i].rank > target.rank) {
        return [sorted[i], sorted[i + 1], sorted[i + 2]];
      }
    }
  }

  // Fallback: check if we should drop a bomb
  const rankMap = new Map<number, DDZCard[]>();
  for (const c of sorted) {
    if (!rankMap.has(c.rank)) rankMap.set(c.rank, []);
    rankMap.get(c.rank)!.push(c);
  }
  for (const [r, list] of rankMap.entries()) {
    if (list.length === 4) {
      if (target.type !== 'bomb' || r > target.rank) {
        return list;
      }
    }
  }

  // Rocket
  const rocket = sorted.filter((c) => c.rank === 16 || c.rank === 17);
  if (rocket.length === 2) return rocket;

  return null;
}

/**
 * Humanized delay in ms based on game situation
 */
export function getHumanizedThinkingDelay(situation: 'easy_pass' | 'normal' | 'bomb_or_big'): number {
  if (situation === 'easy_pass') {
    return Math.floor(450 + Math.random() * 350);
  }
  if (situation === 'bomb_or_big') {
    return Math.floor(1300 + Math.random() * 800);
  }
  return Math.floor(800 + Math.random() * 600);
}
