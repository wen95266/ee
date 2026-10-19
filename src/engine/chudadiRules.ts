/**
 * Chu Da Di (Big Two / 经典正统锄大地 / 锄大D) Rules & AI Engine (A-Max, 2-Min Variant)
 * 
 * 规则体系说明：
 * 1. 单张大小：
 *    - A 最大，然后是 K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2 (2 最小)
 *    - A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 > 2
 * 2. 花色大小：
 *    - 黑桃(♠, 4) > 红桃(♥, 3) > 梅花(♣, 2) > 方块(♦, 1)
 *    - 黑桃A (♠A) 为全场至尊第一单张牌（绝大至尊大地）
 *    - 方块2 (♦2) 为全场绝对最小单张牌（第一局开局首发先手）
 * 3. 首出规则：
 *    - 第一局由持有【方块2 (♦2)】的玩家先手首出，且首出打出的牌型中必须包含方块2 (♦2)
 *    - 第二局及后续各局由上一局最先出清手牌登顶的赢家（胜者）率先任意出牌
 * 4. 可出牌型：
 *    - 单张 (1张)：黑桃A最大，方块2最小
 *    - 对子 (2张)：对A最大，对2最小；点数相同比对子中最大的花色（含♠A的对A绝大）
 *    - 三条 (3张)：AAA最大，222最小
 *    - 五张牌型 (5张)：顺子、同花、俘虏(葫芦/3带2)、四带一(铁支)、同花顺
 * 5. 五张牌型梯队压制关系：
 *    同花顺 (Tier 5) > 四带一 (Tier 4) > 俘虏 (Tier 3) > 同花 (Tier 2) > 顺子 (Tier 1)
 *    高梯队五张牌型可压制任意低梯队五张牌型！
 * 6. 俘虏规则 (Full House / 葫芦 / 3带2)：
 *    - 3张同点数 + 2张同点数（三带一对）
 *    - 比较3张主牌的点数大小：AAA最大，KKK次之 ... 222最小！
 * 7. 四带一规则 (Four of a Kind / 铁支)：
 *    - 4张同点数 + 1张任意单牌
 *    - 比较4张主牌的点数大小：AAAA最大，KKKK次之 ... 2222最小！
 * 8. 同花规则 (Flush)：
 *    - 5张相同花色的牌
 *    - 先比花色(♠>♥>♣>♦)，相同花色比其中单张最大的牌（A最大，K次之 ... 2最小）
 * 9. 顺子规则 (Straight)：
 *    - 5张点数相连的牌 (2-3-4-5-6 到 10-J-Q-K-A)
 *    - 比顺子时，先比顺子最大牌点数，相同比顺子中最大单牌的花色(♠>♥>♣>♦)
 * 10. 同花顺规则 (Straight Flush)：
 *    - 5张相同花色且点数相连的牌
 *    - 先比花色(♠>♥>♣>♦)，相同花色比顺子最大牌
 * 11. 绝大压制规则：
 *    - 凡打出全场绝大无牌可压之牌型（如♠A、含♠A的对A、AAA三条、黑桃同花顺、或对手张数不足/无牌可压），
 *      出牌者直接获得出牌权，继续自由领出新牌，绝不轮到其他玩家出牌！
 */

export interface ChudadiCard {
  id: string;
  rank: number; // 2..14 (2=2, 3..10, 11=J, 12=Q, 13=K, 14=A)
  suitVal: number; // 4=♠, 3=♥, 2=♣, 1=♦
  label: string;
  suit: '♠' | '♥' | '♣' | '♦';
  isRed: boolean;
}

export type ChudadiComboType = 'single' | 'pair' | 'triplet' | '5_card';

export interface ChudadiCombo {
  type: ChudadiComboType;
  comboTier?: number; // 1=Straight, 2=Flush, 3=Full House (俘虏), 4=Four of a Kind (四带一), 5=Straight Flush (同花顺)
  primaryRank: number; // 点数权重 (A为14最大 ... 2为2最小)
  primarySuitVal: number; // 关键单张花色 (4=♠, 3=♥, 2=♣, 1=♦)
  flushSuit?: number; // 同花/同花顺花色
  cards: ChudadiCard[];
  seat?: number;
  label: string;
}

/**
 * 点数权重：A (14) 最大，K (13) ... 2 (2) 最小
 */
export function getChudadiRankWeight(rank: number): number {
  if (rank === 14 || rank === 1) return 14; // A 最大
  if (rank === 13) return 13; // K
  if (rank === 12) return 12; // Q
  if (rank === 11) return 11; // J
  if (rank === 10) return 10;
  if (rank === 9) return 9;
  if (rank === 8) return 8;
  if (rank === 7) return 7;
  if (rank === 6) return 6;
  if (rank === 5) return 5;
  if (rank === 4) return 4;
  if (rank === 3) return 3;
  if (rank === 2) return 2; // 2 最小
  return 2;
}

/**
 * 单张综合牌力：点数权重 * 10 + 花色
 * 黑桃A (♠A) = 14 * 10 + 4 = 144 (全场最高至尊)
 * 方块2 (♦2) = 2 * 10 + 1 = 21 (全场最低首出)
 */
export function getChudadiCardPower(c: ChudadiCard): number {
  return getChudadiRankWeight(c.rank) * 10 + c.suitVal;
}

/**
 * 降序排序手牌（黑桃A在最前，方块2在最后）
 */
export function sortChudadiCards(cards: ChudadiCard[]): ChudadiCard[] {
  return [...cards].sort((a, b) => getChudadiCardPower(b) - getChudadiCardPower(a));
}

export interface StraightCheckResult {
  isStraight: boolean;
  straightTierRank: number; // 顺子最大牌点数 (6到14)
  maxCard: ChudadiCard; // 顺子中代表最大牌力的单牌（用于比花色）
  strVal: string;
}

/**
 * 顺子判定引擎：5张点数相连牌型 (2-3-4-5-6 到 10-J-Q-K-A)
 */
export function checkChudadiStraight(cards: ChudadiCard[]): StraightCheckResult | null {
  if (!cards || cards.length !== 5) return null;

  const weights = cards.map((c) => getChudadiRankWeight(c.rank)).sort((a, b) => a - b);
  const set = new Set(weights);
  if (set.size !== 5) return null; // 必须5张不同点数

  let isConsecutive = true;
  for (let i = 1; i < 5; i++) {
    if (weights[i] !== weights[i - 1] + 1) {
      isConsecutive = false;
      break;
    }
  }

  if (isConsecutive && weights[0] >= 2 && weights[4] <= 14) {
    const highWeight = weights[4]; // 6..14
    const maxCard = cards.find((c) => getChudadiRankWeight(c.rank) === highWeight)!;
    const sortedByWeight = [...cards].sort((a, b) => getChudadiRankWeight(a.rank) - getChudadiRankWeight(b.rank));
    const strVal = sortedByWeight.map((c) => c.label).join('');
    return {
      isStraight: true,
      straightTierRank: highWeight,
      maxCard,
      strVal,
    };
  }

  return null;
}

/**
 * 牌型解析引擎
 */
export function parseChudadiCombo(cards: ChudadiCard[], seat: number = 0): ChudadiCombo | null {
  if (!cards || cards.length === 0) return null;
  const n = cards.length;
  const sorted = sortChudadiCards(cards); // 降序

  // 1. 单张 (1张)
  if (n === 1) {
    const card = sorted[0];
    return {
      seat,
      cards: sorted,
      type: 'single',
      primaryRank: getChudadiRankWeight(card.rank),
      primarySuitVal: card.suitVal,
      label: `单张 ${card.label}${card.suit}`,
    };
  }

  const counts = new Map<number, number>();
  for (const c of sorted) {
    const rw = getChudadiRankWeight(c.rank);
    counts.set(rw, (counts.get(rw) || 0) + 1);
  }

  // 2. 一对 (2张)
  if (n === 2 && counts.size === 1) {
    const rw = getChudadiRankWeight(sorted[0].rank);
    const maxSuit = Math.max(sorted[0].suitVal, sorted[1].suitVal);
    return {
      seat,
      cards: sorted,
      type: 'pair',
      primaryRank: rw,
      primarySuitVal: maxSuit,
      label: `对${sorted[0].label}`,
    };
  }

  // 3. 三条 (3张)
  if (n === 3 && counts.size === 1) {
    const rw = getChudadiRankWeight(sorted[0].rank);
    const maxSuit = Math.max(...sorted.map((c) => c.suitVal));
    return {
      seat,
      cards: sorted,
      type: 'triplet',
      primaryRank: rw,
      primarySuitVal: maxSuit,
      label: `三条 ${sorted[0].label}`,
    };
  }

  // 4. 五张牌型
  if (n === 5) {
    const isFlush = sorted.every((c) => c.suit === sorted[0].suit);
    const straightInfo = checkChudadiStraight(sorted);

    // ① 同花顺 (Tier 5)
    if (isFlush && straightInfo) {
      const suitName = sorted[0].suit === '♠' ? '黑桃' : sorted[0].suit === '♥' ? '红桃' : sorted[0].suit === '♣' ? '梅花' : '方块';
      return {
        seat,
        cards: sorted,
        type: '5_card',
        comboTier: 5,
        primaryRank: straightInfo.straightTierRank,
        primarySuitVal: straightInfo.maxCard.suitVal,
        flushSuit: sorted[0].suitVal,
        label: `${suitName}同花顺 ${straightInfo.strVal}`,
      };
    }

    // ② 四带一 (Tier 4)：4张相同点数 + 1张任意单牌 (AAAA带单最大，2222带单最小)
    for (const [rw, cnt] of counts.entries()) {
      if (cnt === 4) {
        const quadCard = sorted.find((c) => getChudadiRankWeight(c.rank) === rw)!;
        return {
          seat,
          cards: sorted,
          type: '5_card',
          comboTier: 4,
          primaryRank: rw,
          primarySuitVal: 0,
          label: `四带一 ${quadCard.label}`,
        };
      }
    }

    // ③ 俘虏 / 葫芦 (Tier 3)：3张相同点数 + 2张相同点数 (AAA最大，222最小)
    if (counts.size === 2) {
      let tripleRank: number | null = null;
      let pairRank: number | null = null;
      for (const [rw, cnt] of counts.entries()) {
        if (cnt === 3) tripleRank = rw;
        else if (cnt === 2) pairRank = rw;
      }
      if (tripleRank !== null && pairRank !== null) {
        const tripleCard = sorted.find((c) => getChudadiRankWeight(c.rank) === tripleRank)!;
        const pairCard = sorted.find((c) => getChudadiRankWeight(c.rank) === pairRank)!;
        return {
          seat,
          cards: sorted,
          type: '5_card',
          comboTier: 3,
          primaryRank: tripleRank,
          primarySuitVal: 0,
          label: `俘虏 ${tripleCard.label}带${pairCard.label}`,
        };
      }
    }

    // ④ 同花 (Tier 2)：5张相同花色牌
    if (isFlush) {
      const suitName = sorted[0].suit === '♠' ? '黑桃' : sorted[0].suit === '♥' ? '红桃' : sorted[0].suit === '♣' ? '梅花' : '方块';
      return {
        seat,
        cards: sorted,
        type: '5_card',
        comboTier: 2,
        primaryRank: getChudadiRankWeight(sorted[0].rank),
        primarySuitVal: sorted[0].suitVal,
        flushSuit: sorted[0].suitVal,
        label: `${suitName}同花 ${sorted.map((c) => c.label).join('')}`,
      };
    }

    // ⑤ 顺子 (Tier 1)
    if (straightInfo) {
      return {
        seat,
        cards: sorted,
        type: '5_card',
        comboTier: 1,
        primaryRank: straightInfo.straightTierRank,
        primarySuitVal: straightInfo.maxCard.suitVal,
        label: `顺子 ${straightInfo.strVal}`,
      };
    }
  }

  return null;
}

/**
 * 判断 handCombo 是否能压制 lastCombo
 */
export function canHandBeatCombo(handCombo: ChudadiCombo, lastCombo: ChudadiCombo): boolean {
  if (handCombo.cards.length !== lastCombo.cards.length) return false;

  // 1. 5张牌型 vs 5张牌型
  if (handCombo.type === '5_card' && lastCombo.type === '5_card') {
    const t1 = handCombo.comboTier || 1;
    const t2 = lastCombo.comboTier || 1;
    if (t1 !== t2) {
      return t1 > t2; // 高梯队压制低梯队
    }
    // 同梯队比大小
    if (t1 === 5 || t1 === 2) {
      // 同花顺 / 同花：先比花色，再比主牌点数
      if (handCombo.flushSuit !== lastCombo.flushSuit) {
        return (handCombo.flushSuit || 0) > (lastCombo.flushSuit || 0);
      }
      if (handCombo.primaryRank !== lastCombo.primaryRank) {
        return handCombo.primaryRank > lastCombo.primaryRank;
      }
      return handCombo.primarySuitVal > lastCombo.primarySuitVal;
    }
    if (t1 === 3 || t1 === 4) {
      // 俘虏 / 四带一：比主牌点数权重
      return handCombo.primaryRank > lastCombo.primaryRank;
    }
    if (t1 === 1) {
      // 顺子：比最大牌点数，相同比花色
      if (handCombo.primaryRank !== lastCombo.primaryRank) {
        return handCombo.primaryRank > lastCombo.primaryRank;
      }
      return handCombo.primarySuitVal > lastCombo.primarySuitVal;
    }
    return handCombo.primaryRank > lastCombo.primaryRank;
  }

  // 2. 非5张牌型 (单张、对子、三条)
  if (handCombo.type !== lastCombo.type) return false;

  if (handCombo.primaryRank !== lastCombo.primaryRank) {
    return handCombo.primaryRank > lastCombo.primaryRank;
  }
  return handCombo.primarySuitVal > lastCombo.primarySuitVal;
}

export function canBeatChudadiCombo(handCombo: ChudadiCombo, lastCombo: ChudadiCombo): boolean {
  return canHandBeatCombo(handCombo, lastCombo);
}

/**
 * 演绎法判定该 combo 是否全场绝大（无人能压）
 */
export function isComboDeductivelyUnbeatable(combo: ChudadiCombo, opponentHands: ChudadiCard[][]): boolean {
  const allOpponentCards = opponentHands.flat();
  const allCombos = findAllValidCombosFromCards(allOpponentCards, combo.type, combo.cards.length, combo.comboTier);

  for (const oc of allCombos) {
    if (canHandBeatCombo(oc, combo)) {
      return false; // 存在对手手牌能压制此combo
    }
  }
  return true;
}

export function canOpponentsBeatChudadiCombo(combo: ChudadiCombo, opponentHands: ChudadiCard[][]): boolean {
  return !isComboDeductivelyUnbeatable(combo, opponentHands);
}

function findAllValidCombosFromCards(
  cards: ChudadiCard[],
  targetType: ChudadiComboType,
  length: number,
  targetTier?: number
): ChudadiCombo[] {
  const results: ChudadiCombo[] = [];
  if (cards.length < length) return results;

  function comb(start: number, curr: ChudadiCard[]) {
    if (curr.length === length) {
      const parsed = parseChudadiCombo(curr, 0);
      if (parsed && parsed.type === targetType) {
        if (targetType === '5_card') {
          if (parsed.comboTier === targetTier) {
            results.push(parsed);
          }
        } else {
          results.push(parsed);
        }
      }
      return;
    }
    for (let i = start; i < cards.length; i++) {
      curr.push(cards[i]);
      comb(i + 1, curr);
      curr.pop();
    }
  }

  comb(0, []);
  return results;
}

/**
 * 生成AI出牌决策
 */
export function getChudadiAIPlay(
  myHand: ChudadiCard[],
  lastCombo: ChudadiCombo | null,
  isLead: boolean,
  opponentHands: ChudadiCard[][]
): ChudadiCard[] | null {
  const sorted = sortChudadiCards(myHand);

  if (isLead || !lastCombo) {
    if (sorted.length === 0) return null;
    // 默认从最小的单张或可行组合出起
    return [sorted[sorted.length - 1]];
  }

  // 跟牌逻辑：查找手牌中所有符合条件的组合并尝试压制
  const targetLen = lastCombo.cards.length;
  const candidateCombos: ChudadiCard[][] = [];

  function findComb(start: number, curr: ChudadiCard[]) {
    if (curr.length === targetLen) {
      const parsed = parseChudadiCombo(curr, 0);
      if (parsed && canHandBeatCombo(parsed, lastCombo)) {
        candidateCombos.push([...curr]);
      }
      return;
    }
    for (let i = start; i < sorted.length; i++) {
      curr.push(sorted[i]);
      findComb(i + 1, curr);
      curr.pop();
    }
  }

  findComb(0, []);

  if (candidateCombos.length === 0) return null;

  // 排序优先选牌力最小能压上的组合（留大牌）
  candidateCombos.sort((a, b) => {
    const pa = parseChudadiCombo(a, 0);
    const pb = parseChudadiCombo(b, 0);
    const wa = pa ? pa.primaryRank * 10 + pa.primarySuitVal : 0;
    const wb = pb ? pb.primaryRank * 10 + pb.primarySuitVal : 0;
    return wa - wb;
  });

  return candidateCombos[0];
}

/**
 * 校验顶大规则：若下家报单，跟单张必须出最大单张顶大
 */
export function validateDingDaRule(
  myHand: ChudadiCard[],
  chosen: ChudadiCard[],
  lastCombo: ChudadiCombo | null,
  isNextBaoDan: boolean
): { valid: boolean; reason?: string } {
  if (isNextBaoDan && lastCombo && lastCombo.type === 'single' && chosen.length === 1) {
    const chosenCombo = parseChudadiCombo(chosen);
    if (chosenCombo && canHandBeatCombo(chosenCombo, lastCombo)) {
      const sortedByPower = sortChudadiCards(myHand);
      for (const card of sortedByPower) {
        const candidateCombo = parseChudadiCombo([card]);
        if (candidateCombo && canHandBeatCombo(candidateCombo, lastCombo)) {
          if (card.id !== chosen[0].id) {
            return {
              valid: false,
              reason: `下家已报单，跟单张必须出最大的单张【${card.label}${card.suit}】顶大！`,
            };
          }
          break;
        }
      }
    }
  }
  return { valid: true };
}

/**
 * 计算积分惩罚
 */
export function calculateChudadiPenalty(remainingCount: number): number {
  if (remainingCount <= 0) return 0;
  if (remainingCount <= 7) return remainingCount * 100;
  if (remainingCount <= 9) return remainingCount * 200; // 余8~9张翻倍
  if (remainingCount <= 12) return remainingCount * 300; // 余10~12张翻三倍
  return remainingCount * 400; // 余13张一张未出四倍
}

export function calculateChudadiMatchSettlement(hands: ChudadiCard[][], winnerSeat: number) {
  const scores = [0, 0, 0, 0];
  let totalLoserPenalty = 0;

  for (let i = 0; i < 4; i++) {
    if (i === winnerSeat) continue;
    const p = calculateChudadiPenalty(hands[i].length);
    scores[i] = -p;
    totalLoserPenalty += p;
  }
  scores[winnerSeat] = totalLoserPenalty;
  return scores;
}
