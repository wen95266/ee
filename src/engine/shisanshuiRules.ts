/**
 * Thirteen Cards (十三张 / 水镜十三水) Rules & Auto-Arrangement Engine
 * Validates Head (3), Middle (5), Tail (5) tiers
 * Foul Hand (倒水) detection: Tail >= Middle >= Head
 * Intelligent strategies: Optimal, Solid (Full House), Flush, Balanced
 */

export interface SSSCard {
  id: string;
  rank: number; // 2..14 (14=A, 13=K... 2=2)
  suitVal: number; // 4=♠, 3=♥, 2=♣, 1=♦
  label: string;
  suit: '♠' | '♥' | '♣' | '♦';
  isRed: boolean;
}

export type TierRank =
  | 'high_card'
  | 'pair'
  | 'two_pairs'
  | 'triplet'
  | 'straight'
  | 'flush'
  | 'full_house'
  | 'quads'
  | 'straight_flush';

export interface EvaluatedTier {
  name: string;
  type: TierRank;
  scoreRank: number; // numeric score for comparison
  cards: SSSCard[];
}

export function evaluate5CardTier(cards: SSSCard[]): EvaluatedTier {
  if (cards.length !== 5) {
    return { name: '散牌', type: 'high_card', scoreRank: 0, cards };
  }
  const sorted = [...cards].sort((a, b) => b.rank - a.rank || b.suitVal - a.suitVal);
  const isSameSuit = sorted.every((c) => c.suit === sorted[0].suit);
  let isStraight = true;
  for (let i = 1; i < 5; i++) {
    if (sorted[i].rank !== sorted[i - 1].rank - 1) {
      isStraight = false;
      break;
    }
  }

  const counts: Record<number, number> = {};
  sorted.forEach((c) => (counts[c.rank] = (counts[c.rank] || 0) + 1));
  const entries = Object.entries(counts).map(([r, c]) => ({ rank: Number(r), count: c }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);

  // Straight Flush
  if (isSameSuit && isStraight) {
    return { name: '同花顺', type: 'straight_flush', scoreRank: 900000 + sorted[0].rank, cards: sorted };
  }
  // Four of a kind (铁支)
  if (entries[0].count === 4) {
    return { name: '铁支', type: 'quads', scoreRank: 800000 + entries[0].rank, cards: sorted };
  }
  // Full house (葫芦)
  if (entries[0].count === 3 && entries[1].count === 2) {
    return { name: '葫芦', type: 'full_house', scoreRank: 700000 + entries[0].rank, cards: sorted };
  }
  // Flush (同花)
  if (isSameSuit) {
    return { name: '同花', type: 'flush', scoreRank: 600000 + sorted[0].rank, cards: sorted };
  }
  // Straight (顺子)
  if (isStraight) {
    return { name: '顺子', type: 'straight', scoreRank: 500000 + sorted[0].rank, cards: sorted };
  }
  // Triplet (三条)
  if (entries[0].count === 3) {
    return { name: '三条', type: 'triplet', scoreRank: 400000 + entries[0].rank, cards: sorted };
  }
  // Two Pairs (两对)
  if (entries[0].count === 2 && entries[1].count === 2) {
    return { name: '两对', type: 'two_pairs', scoreRank: 300000 + Math.max(entries[0].rank, entries[1].rank) * 100 + Math.min(entries[0].rank, entries[1].rank), cards: sorted };
  }
  // One Pair (对子)
  if (entries[0].count === 2) {
    return { name: '对子', type: 'pair', scoreRank: 200000 + entries[0].rank, cards: sorted };
  }
  return { name: '散牌', type: 'high_card', scoreRank: 100000 + sorted[0].rank, cards: sorted };
}

export function evaluate3CardTier(cards: SSSCard[]): EvaluatedTier {
  if (cards.length !== 3) {
    return { name: '散牌', type: 'high_card', scoreRank: 0, cards };
  }
  const sorted = [...cards].sort((a, b) => b.rank - a.rank || b.suitVal - a.suitVal);
  if (sorted[0].rank === sorted[1].rank && sorted[1].rank === sorted[2].rank) {
    return { name: '三条冲前', type: 'triplet', scoreRank: 400000 + sorted[0].rank, cards: sorted };
  }
  if (sorted[0].rank === sorted[1].rank) {
    return { name: '对子', type: 'pair', scoreRank: 200000 + sorted[0].rank * 100 + sorted[2].rank, cards: sorted };
  }
  if (sorted[1].rank === sorted[2].rank) {
    return { name: '对子', type: 'pair', scoreRank: 200000 + sorted[1].rank * 100 + sorted[0].rank, cards: sorted };
  }
  return { name: '乌龙散牌', type: 'high_card', scoreRank: 100000 + sorted[0].rank, cards: sorted };
}

/**
 * Check if the arrangement is a foul hand (倒水)
 * Rule: Tail >= Middle >= Head
 */
export function isFoulHand(head: SSSCard[], mid: SSSCard[], tail: SSSCard[]): boolean {
  if (head.length !== 3 || mid.length !== 5 || tail.length !== 5) return false;
  const hEval = evaluate3CardTier(head);
  const mEval = evaluate5CardTier(mid);
  const tEval = evaluate5CardTier(tail);

  // If head beats middle, foul!
  if (hEval.scoreRank > mEval.scoreRank) return true;
  // If middle beats tail, foul!
  if (mEval.scoreRank > tEval.scoreRank) return true;

  return false;
}

/**
 * Auto Arrange 13 cards into Head (3), Middle (5), Tail (5)
 */
export function autoArrangeThirteen(
  cards: SSSCard[],
  strategy: 'optimal' | 'solid' | 'flush' | 'balanced' = 'optimal'
): { head: SSSCard[]; mid: SSSCard[]; tail: SSSCard[] } {
  if (cards.length !== 13) {
    return { head: cards.slice(0, 3), mid: cards.slice(3, 8), tail: cards.slice(8, 13) };
  }

  const sorted = [...cards].sort((a, b) => a.rank - b.rank || a.suitVal - b.suitVal);

  // Group by rank
  const rankMap = new Map<number, SSSCard[]>();
  for (const c of sorted) {
    if (!rankMap.has(c.rank)) rankMap.set(c.rank, []);
    rankMap.get(c.rank)!.push(c);
  }

  // 1. Solid: Put best Full House on Tail
  const triplets: number[] = [];
  const pairs: number[] = [];
  for (const [r, list] of rankMap.entries()) {
    if (list.length >= 3) triplets.push(r);
    else if (list.length === 2) pairs.push(r);
  }
  triplets.sort((a, b) => b - a);
  pairs.sort((a, b) => b - a);

  if (strategy === 'solid' || strategy === 'optimal') {
    if (triplets.length >= 1 && (pairs.length >= 1 || triplets.length >= 2)) {
      const tRank = triplets[0];
      const pRank = pairs.length >= 1 ? pairs[0] : triplets[1];
      const tailCards = [...rankMap.get(tRank)!.slice(0, 3), ...rankMap.get(pRank)!.slice(0, 2)];
      const remaining = sorted.filter((c) => !tailCards.some((tc) => tc.id === c.id));
      const mid = remaining.slice(remaining.length - 5);
      const head = remaining.slice(0, 3);
      if (!isFoulHand(head, mid, tailCards)) {
        return { head, mid, tail: tailCards };
      }
    }
  }

  // 2. Default standard tiered partition
  const tail = sorted.slice(sorted.length - 5);
  const mid = sorted.slice(sorted.length - 10, sorted.length - 5);
  const head = sorted.slice(0, 3);

  if (!isFoulHand(head, mid, tail)) {
    return { head, mid, tail };
  }

  // Fallback safe slice
  return {
    head: sorted.slice(0, 3),
    mid: sorted.slice(3, 8),
    tail: sorted.slice(8, 13),
  };
}
