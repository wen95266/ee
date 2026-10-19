/**
 * YanSan (Four Players Poker Classic) Rules Engine
 * 52 cards (no Jokers), 13 cards per player
 * Diamond 4 (♦4) starts first and must be played on the first trick.
 * Ranking: 3 > 2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4
 * Suits: ♠ > ♥ > ♣ > ♦
 * Allowed Combos: Single, Pair, Triple, Straight (no 10JQKA), Fulu, Four-With-One, Straight Flush.
 * No pure 4-card bomb, no pure flush, free pass (no must-beat), no top-defense required.
 * Qiang Gong returns played cards to hand (no redeal) and resets lead to Diamond 4.
 */

export interface YansanCard {
  id: string;
  rank: number; // 3..15 (15=2, 14=A, 13=K... 3=3)
  suitVal: number; // 4=♠, 3=♥, 2=♣, 1=♦
  label: string;
  suit: '♠' | '♥' | '♣' | '♦';
  isRed: boolean;
}

export type YansanComboType = 'single' | 'pair' | 'triplet' | '5_card';

export interface YansanCombo {
  type: YansanComboType;
  comboTier?: number; // 1=Straight, 2=Flush, 3=Fulu, 4=Four-With-One, 5=Straight Flush
  rank: number;
  suitVal?: number;
  length?: number;
  cards: YansanCard[];
  seat?: number;
}

export function getYansanRankWeight(rank: number): number {
  if (rank === 3) return 13;
  if (rank === 15) return 12; // 2
  if (rank === 14) return 11; // A
  if (rank === 13) return 10; // K
  if (rank === 12) return 9;  // Q
  if (rank === 11) return 8;  // J
  if (rank === 10) return 7;  // 10
  if (rank === 9) return 6;   // 9
  if (rank === 8) return 5;   // 8
  if (rank === 7) return 4;   // 7
  if (rank === 6) return 3;   // 6
  if (rank === 5) return 2;   // 5
  if (rank === 4) return 1;   // 4
  return 0;
}

export function getYansanCardPower(c: YansanCard): number {
  return getYansanRankWeight(c.rank) * 10 + c.suitVal;
}

export function parseYansanCombo(cards: YansanCard[]): YansanCombo | null {
  if (!cards || cards.length === 0) return null;
  const count = cards.length;
  const sorted = [...cards].sort((a, b) => getYansanCardPower(b) - getYansanCardPower(a));

  if (count === 1) {
    return { type: 'single', rank: sorted[0].rank, suitVal: sorted[0].suitVal, cards: sorted };
  }

  const rankCounts = new Map<number, number>();
  for (const c of sorted) {
    rankCounts.set(c.rank, (rankCounts.get(c.rank) || 0) + 1);
  }
  const entries = Array.from(rankCounts.entries());

  if (count === 2 && entries.length === 1) {
    const highestSuit = Math.max(...sorted.map((c) => c.suitVal));
    return { type: 'pair', rank: entries[0][0], suitVal: highestSuit, cards: sorted };
  }

  if (count === 3 && entries.length === 1) {
    return { type: 'triplet', rank: entries[0][0], cards: sorted };
  }

  // 烟三规则：没有纯4张炸弹，能出的牌型最多就是五张！
  // 五张牌型梯队：同花顺 (Tier 5) > 四带一 (Tier 4) > 俘虏 (Tier 3) > 同花 (Tier 2) > 顺子 (Tier 1)
  if (count === 5) {
    const isFlush = sorted.every((c) => c.suit === sorted[0].suit);
    const ranks = sorted.map((c) => c.rank).sort((a, b) => a - b);
    
    let isNormalSeq = true;
    for (let i = 1; i < 5; i++) {
      if (ranks[i] !== ranks[i - 1] + 1) {
        isNormalSeq = false;
        break;
      }
    }
    const isA2345 = ranks[0] === 3 && ranks[1] === 4 && ranks[2] === 5 && ranks[3] === 14 && ranks[4] === 15;
    const is10JQKA = ranks[0] === 10 && ranks[1] === 11 && ranks[2] === 12 && ranks[3] === 13 && ranks[4] === 14;
    const isLegalStraight = (isNormalSeq || isA2345) && !is10JQKA;

    // ① 同花顺 (Tier 5)：同花色且构成合法顺子 (允许A2345/34567，不可出10JQKA)
    // 规则：同花顺先比花色(♠>♥>♣>♦)，相同花色比单张最大的牌
    if (isFlush && isLegalStraight) {
      const maxCard = sorted[0]; // sorted is descending by getCardPower
      return { type: '5_card', comboTier: 5, rank: maxCard.rank, suitVal: sorted[0].suitVal, cards: sorted };
    }

    // ② 四带一 (Tier 4)：4张相同点数 + 任意1张单牌
    if (entries.some(([, cnt]) => cnt === 4)) {
      const fourRank = entries.find(([, cnt]) => cnt === 4)![0];
      return { type: '5_card', comboTier: 4, rank: fourRank, cards: sorted };
    }

    // ③ 俘虏 (Tier 3)：3张同点 + 1对子 (三带一对 / 葫芦)
    if (entries.some(([, cnt]) => cnt === 3) && entries.length === 2) {
      const threeRank = entries.find(([, cnt]) => cnt === 3)![0];
      return { type: '5_card', comboTier: 3, rank: threeRank, cards: sorted };
    }

    // ④ 同花 (Tier 2)：5张同花色牌（包含同花色 10 J Q K A，或其他同花5张）
    // 规则：同花先比花色(♠>♥>♣>♦)，相同花色比单张最大的牌
    if (isFlush) {
      const maxCard = sorted[0];
      return { type: '5_card', comboTier: 2, rank: maxCard.rank, suitVal: sorted[0].suitVal, cards: sorted };
    }

    // ⑤ 顺子 (Tier 1)：5张相连（包含A2345与34567，唯独不可出杂色 10 J Q K A）
    // 规则：顺子是比单张最大的牌
    if (isLegalStraight) {
      const maxCard = sorted[0];
      return { type: '5_card', comboTier: 1, rank: maxCard.rank, suitVal: maxCard.suitVal, cards: sorted };
    }
  }

  return null;
}

export function canBeatYansanCombo(candidate: YansanCombo, target: YansanCombo | null): boolean {
  if (!target) return true;
  if (candidate.type !== target.type) return false;

  if (candidate.type === 'single' || candidate.type === 'pair') {
    const candRW = getYansanRankWeight(candidate.rank);
    const targetRW = getYansanRankWeight(target.rank);
    if (candRW !== targetRW) return candRW > targetRW;
    return (candidate.suitVal || 0) > (target.suitVal || 0);
  }

  if (candidate.type === 'triplet') {
    return getYansanRankWeight(candidate.rank) > getYansanRankWeight(target.rank);
  }

  if (candidate.type === '5_card') {
    const candTier = candidate.comboTier || 1;
    const targTier = target.comboTier || 1;
    if (candTier !== targTier) return candTier > targTier;

    // 同花顺 (Tier 5) 或 同花 (Tier 2)：先比花色(♠>♥>♣>♦)，相同花色比单张最大牌
    if (candTier === 5 || candTier === 2) {
      const candSuit = candidate.suitVal || 0;
      const targSuit = target.suitVal || 0;
      if (candSuit !== targSuit) return candSuit > targSuit;
      const candRW = getYansanRankWeight(candidate.rank);
      const targRW = getYansanRankWeight(target.rank);
      return candRW > targRW;
    }

    // 四带一 (Tier 4) 或 俘虏 (Tier 3)：比主牌点数权重
    if (candTier === 4 || candTier === 3) {
      return getYansanRankWeight(candidate.rank) > getYansanRankWeight(target.rank);
    }

    // 顺子 (Tier 1)：比单张最大的牌（先比点数权重，相同比花色）
    if (candTier === 1) {
      const candRW = getYansanRankWeight(candidate.rank);
      const targRW = getYansanRankWeight(target.rank);
      if (candRW !== targRW) return candRW > targRW;
      return (candidate.suitVal || 0) > (target.suitVal || 0);
    }
  }

  return false;
}

export interface YansanAIContext {
  isFirstTurn?: boolean;
  seat?: number;
  teammateSeat?: number;
  handsCount?: number[];
  isTeammateTarget?: boolean;
}

export function getYansanAIPlay(
  hand: YansanCard[],
  target: YansanCombo | null,
  isFirstTurnOrContext: boolean | YansanAIContext = false
): YansanCard[] | null {
  if (!hand || hand.length === 0) return null;

  const ctx: YansanAIContext =
    typeof isFirstTurnOrContext === 'boolean'
      ? { isFirstTurn: isFirstTurnOrContext }
      : isFirstTurnOrContext;

  const isFirstTurn = !!ctx.isFirstTurn;
  const sorted = [...hand].sort((a, b) => getYansanCardPower(a) - getYansanCardPower(b));

  // 1. 首出必须包含方块4 (♦4)
  if (isFirstTurn) {
    const diamond4 = sorted.find((c) => c.rank === 4 && c.suit === '♦');
    if (diamond4) {
      // 策略A：如果手牌有包含方块4的顺子(如 4-5-6-7-8 或 A-2-3-4-5)，首发顺子清掉5张牌
      const rankMap = new Map<number, YansanCard>();
      for (const c of sorted) {
        if (!rankMap.has(c.rank)) rankMap.set(c.rank, c);
      }
      if (rankMap.has(4) && rankMap.has(5) && rankMap.has(6) && rankMap.has(7) && rankMap.has(8)) {
        const st5 = [diamond4, rankMap.get(5)!, rankMap.get(6)!, rankMap.get(7)!, rankMap.get(8)!];
        const combo = parseYansanCombo(st5);
        if (combo && combo.comboTier === 1) return st5;
      }
      // 策略B：如果有4的对子或三条，顺势出对4或三条4
      const fours = sorted.filter((c) => c.rank === 4);
      if (fours.length === 3) return fours;
      if (fours.length === 2) return fours;
      // 策略C：标准单出方块4
      return [diamond4];
    }
  }

  // 分组与牌力分类
  const rankGroups = new Map<number, YansanCard[]>();
  for (const c of sorted) {
    if (!rankGroups.has(c.rank)) rankGroups.set(c.rank, []);
    rankGroups.get(c.rank)!.push(c);
  }
  const sortedRanks = Array.from(rankGroups.keys()).sort(
    (a, b) => getYansanRankWeight(a) - getYansanRankWeight(b)
  );

  // 检查是否一手走完直接获胜
  const instantCombo = parseYansanCombo(sorted);
  if (instantCombo) {
    if (!target || canBeatYansanCombo(instantCombo, target)) {
      return sorted;
    }
  }

  // 辅助：获取所有合法的5张牌组合
  function getCandidate5Cards(): YansanCard[][] {
    const results: YansanCard[][] = [];

    // ① 顺子 (Tier 1)
    const uniqueRanks = Array.from(new Set(sorted.map((c) => c.rank))).sort((a, b) => a - b);
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      const sub = uniqueRanks.slice(i, i + 5);
      let isSeq = true;
      for (let j = 1; j < 5; j++) {
        if (sub[j] !== sub[j - 1] + 1) {
          isSeq = false;
          break;
        }
      }
      const is10JQKA = sub[0] === 10 && sub[4] === 14;
      if (isSeq && !is10JQKA) {
        const combo = sub.map((r) => sorted.find((c) => c.rank === r)!);
        const parsed = parseYansanCombo(combo);
        if (parsed && parsed.comboTier === 1) results.push(combo);
      }
    }
    // 特殊顺子 A2345 (3, 4, 5, 14, 15)
    if ([3, 4, 5, 14, 15].every((r) => uniqueRanks.includes(r))) {
      const combo = [3, 4, 5, 14, 15].map((r) => sorted.find((c) => c.rank === r)!);
      const parsed = parseYansanCombo(combo);
      if (parsed && parsed.comboTier === 1) results.push(combo);
    }

    // ② 同花 (Tier 2) & 同花顺 (Tier 5)
    const suitGroups = new Map<string, YansanCard[]>();
    for (const c of sorted) {
      if (!suitGroups.has(c.suit)) suitGroups.set(c.suit, []);
      suitGroups.get(c.suit)!.push(c);
    }
    for (const group of suitGroups.values()) {
      if (group.length >= 5) {
        const sSorted = [...group].sort((a, b) => getYansanCardPower(a) - getYansanCardPower(b));
        for (let i = 0; i <= sSorted.length - 5; i++) {
          const sub = sSorted.slice(i, i + 5);
          const parsed = parseYansanCombo(sub);
          if (parsed && (parsed.comboTier === 2 || parsed.comboTier === 5)) {
            results.push(sub);
          }
        }
      }
    }

    // ③ 俘虏 / 葫芦 (Tier 3)
    const triples = sortedRanks.filter((rk) => rankGroups.get(rk)!.length >= 3);
    const pairs = sortedRanks.filter((rk) => rankGroups.get(rk)!.length >= 2);
    for (const tRk of triples) {
      for (const pRk of pairs) {
        if (tRk !== pRk) {
          const fh = [...rankGroups.get(tRk)!.slice(0, 3), ...rankGroups.get(pRk)!.slice(0, 2)];
          const parsed = parseYansanCombo(fh);
          if (parsed && parsed.comboTier === 3) results.push(fh);
        }
      }
    }

    // ④ 四带一 (Tier 4)
    const fourRanks = sortedRanks.filter((rk) => rankGroups.get(rk)!.length === 4);
    for (const fRk of fourRanks) {
      const kicker = sorted.find((c) => c.rank !== fRk);
      if (kicker) {
        const fo = [...rankGroups.get(fRk)!, kicker];
        const parsed = parseYansanCombo(fo);
        if (parsed && parsed.comboTier === 4) results.push(fo);
      }
    }

    return results;
  }

  // -------------------------------------------------------------------------
  // 领出阶段 (Lead)
  // -------------------------------------------------------------------------
  if (!target) {
    const handsCount = ctx.handsCount || [13, 13, 13, 13];
    const mySeat = ctx.seat !== undefined ? ctx.seat : 0;
    const teammateSeat = ctx.teammateSeat;

    // 威胁检测：非队友玩家是否只剩1张牌（报单）
    let opponentSingleThreat = false;
    for (let s = 0; s < 4; s++) {
      if (s !== mySeat && s !== teammateSeat && handsCount[s] === 1) {
        opponentSingleThreat = true;
        break;
      }
    }

    // 队友助攻：队友只剩1张牌且不是独战
    let teammateNeedsFeed = false;
    if (teammateSeat !== undefined && teammateSeat !== mySeat && handsCount[teammateSeat] === 1) {
      teammateNeedsFeed = true;
    }

    if (teammateNeedsFeed) {
      // 队友只剩1张，送一张最小的单牌帮队友出清获胜！
      return [sorted[0]];
    }

    if (opponentSingleThreat) {
      // 对手报单！绝不可轻易出小单牌！
      // 优先出对子、三条或5张牌
      const lowPairs = sortedRanks.find((rk) => rankGroups.get(rk)!.length === 2);
      if (lowPairs) return rankGroups.get(lowPairs)!;

      const lowTriples = sortedRanks.find((rk) => rankGroups.get(rk)!.length === 3);
      if (lowTriples) return rankGroups.get(lowTriples)!;

      const candidate5s = getCandidate5Cards();
      if (candidate5s.length > 0) return candidate5s[0];

      // 若只能出单张，必须出最大的单牌压死对手，防止对手借机跑掉！
      return [sorted[sorted.length - 1]];
    }

    // 常规领牌：
    // 1. 优先甩低阶5张牌型 (顺子/俘虏/同花)
    const candidate5s = getCandidate5Cards();
    const low5s = candidate5s.filter((cards) => {
      const p = parseYansanCombo(cards);
      return p && getYansanRankWeight(p.rank) <= 9;
    });
    if (low5s.length > 0) return low5s[0];

    // 2. 甩小三条 (4..10)
    const lowTriples = sortedRanks.find(
      (rk) => getYansanRankWeight(rk) <= 7 && rankGroups.get(rk)!.length === 3
    );
    if (lowTriples) return rankGroups.get(lowTriples)!;

    // 3. 甩小对子 (4..10)
    const lowPairs = sortedRanks.find(
      (rk) => getYansanRankWeight(rk) <= 7 && rankGroups.get(rk)!.length === 2
    );
    if (lowPairs) return rankGroups.get(lowPairs)!;

    // 4. 甩孤张小单牌 (4..9)
    const singletons = sorted.filter((c) => rankGroups.get(c.rank)!.length === 1);
    if (singletons.length > 0) {
      return [singletons[0]];
    }

    // 5. 兜底出最小单张
    return [sorted[0]];
  }

  // -------------------------------------------------------------------------
  // 跟牌阶段 (Follow)
  // -------------------------------------------------------------------------

  // 队友保护原则：如果桌面最大牌是队友打出且比较大，主动让行过牌保送队友
  if (ctx.isTeammateTarget) {
    const isTargetStrong =
      (target.type === 'single' && getYansanRankWeight(target.rank) >= 10) ||
      (target.type === 'pair' && getYansanRankWeight(target.rank) >= 9) ||
      (target.type === 'triplet') ||
      (target.type === '5_card' && (target.comboTier || 1) >= 2);

    if (isTargetStrong) {
      return null;
    }
  }

  // 单张跟牌
  if (target.type === 'single') {
    // 优先从孤张中挑选能管上的最小单张
    const singletons = sorted.filter((c) => rankGroups.get(c.rank)!.length === 1);
    for (const c of singletons) {
      const cand = parseYansanCombo([c]);
      if (cand && canBeatYansanCombo(cand, target)) {
        // 若对手牌尚多，且用3或2等至尊王牌去吃小牌(<=9)，战略性保留
        const isSupreme = getYansanRankWeight(c.rank) >= 12;
        const targetIsSmall = getYansanRankWeight(target.rank) <= 6;
        if (isSupreme && targetIsSmall && sorted.length >= 5) {
          continue;
        }
        return [c];
      }
    }
    // 孤张管不上时，从小到大在全部手牌中找
    for (const c of sorted) {
      const cand = parseYansanCombo([c]);
      if (cand && canBeatYansanCombo(cand, target)) {
        const isSupreme = getYansanRankWeight(c.rank) >= 12;
        const targetIsSmall = getYansanRankWeight(target.rank) <= 6;
        if (isSupreme && targetIsSmall && sorted.length >= 5) {
          continue;
        }
        return [c];
      }
    }
  } else if (target.type === 'pair') {
    // 对子跟牌：优先用纯对子
    for (const rk of sortedRanks) {
      const grp = rankGroups.get(rk)!;
      if (grp.length === 2) {
        const cand = parseYansanCombo(grp);
        if (cand && canBeatYansanCombo(cand, target)) {
          return grp;
        }
      }
    }
    // 拆三条的对子
    for (const rk of sortedRanks) {
      const grp = rankGroups.get(rk)!;
      if (grp.length === 3) {
        const subPair = grp.slice(0, 2);
        const cand = parseYansanCombo(subPair);
        if (cand && canBeatYansanCombo(cand, target)) {
          return subPair;
        }
      }
    }
  } else if (target.type === 'triplet') {
    for (const rk of sortedRanks) {
      const grp = rankGroups.get(rk)!;
      if (grp.length >= 3) {
        const subTrip = grp.slice(0, 3);
        const cand = parseYansanCombo(subTrip);
        if (cand && canBeatYansanCombo(cand, target)) {
          return subTrip;
        }
      }
    }
  } else if (target.type === '5_card') {
    const candidate5s = getCandidate5Cards();
    const winning5s: YansanCard[][] = [];
    for (const c5 of candidate5s) {
      const cand = parseYansanCombo(c5);
      if (cand && canBeatYansanCombo(cand, target)) {
        winning5s.push(c5);
      }
    }
    if (winning5s.length > 0) {
      // 升序选择最小能管上的5张组合
      winning5s.sort((a, b) => {
        const ca = parseYansanCombo(a)!;
        const cb = parseYansanCombo(b)!;
        return (
          (ca.comboTier || 1) - (cb.comboTier || 1) ||
          getYansanRankWeight(ca.rank) - getYansanRankWeight(cb.rank)
        );
      });
      return winning5s[0];
    }
  }

  return null;
}

/**
 * 判定某一特定玩家手牌中是否存在任何合法牌型能够压制目标 target 牌型
 */
export function canHandBeatYansanCombo(hand: YansanCard[], target: YansanCombo): boolean {
  if (!hand || hand.length === 0 || !target) return false;

  // 1. 单张
  if (target.type === 'single') {
    const sortedDesc = [...hand].sort((a, b) => getYansanCardPower(b) - getYansanCardPower(a));
    const maxCard = sortedDesc[0];
    const cand = parseYansanCombo([maxCard]);
    return !!(cand && canBeatYansanCombo(cand, target));
  }

  // 2. 对子
  if (target.type === 'pair') {
    if (hand.length < 2) return false;
    const rankMap = new Map<number, YansanCard[]>();
    for (const c of hand) {
      if (!rankMap.has(c.rank)) rankMap.set(c.rank, []);
      rankMap.get(c.rank)!.push(c);
    }
    for (const grp of rankMap.values()) {
      if (grp.length >= 2) {
        const sortedByPower = [...grp].sort((a, b) => getYansanCardPower(b) - getYansanCardPower(a));
        const cand = parseYansanCombo([sortedByPower[0], sortedByPower[1]]);
        if (cand && canBeatYansanCombo(cand, target)) {
          return true;
        }
      }
    }
    return false;
  }

  // 3. 三条
  if (target.type === 'triplet') {
    if (hand.length < 3) return false;
    const rankMap = new Map<number, YansanCard[]>();
    for (const c of hand) {
      if (!rankMap.has(c.rank)) rankMap.set(c.rank, []);
      rankMap.get(c.rank)!.push(c);
    }
    for (const grp of rankMap.values()) {
      if (grp.length >= 3) {
        const cand = parseYansanCombo(grp.slice(0, 3));
        if (cand && canBeatYansanCombo(cand, target)) {
          return true;
        }
      }
    }
    return false;
  }

  // 4. 五张牌型
  if (target.type === '5_card') {
    if (hand.length < 5) return false;
    // 如果当前是黑桃至尊同花顺且具有最高单牌，全场绝大
    if (target.comboTier === 5 && target.suitVal === 4 && target.rank === 3) {
      return false;
    }
    const aiPlay = getYansanAIPlay(hand, target);
    return !!(aiPlay && aiPlay.length === 5);
  }

  return false;
}

/**
 * 判定其他三位玩家中，是否有任意一位玩家的独立手牌能够压制当前打出的 combo。
 */
export function canOpponentsBeatYansanCombo(
  playedCombo: YansanCombo,
  opponentHands: YansanCard[][]
): boolean {
  if (!playedCombo) return false;
  for (const hand of opponentHands) {
    if (hand && hand.length > 0 && canHandBeatYansanCombo(hand, playedCombo)) {
      return true;
    }
  }
  return false;
}

/**
 * 检验剩余未知牌池中，是否能组合出任何大于 target 的 5 张牌型
 */
export function canPoolBeatYansan5CardCombo(
  pool: YansanCard[],
  target: YansanCombo
): boolean {
  if (!pool || pool.length < 5) return false;

  const targetTier = target.comboTier || 1;
  const targetRW = getYansanRankWeight(target.rank);
  const targetSuit = target.suitVal || 0;

  // 准备花色分组与点数分组
  const suitMap = new Map<string, YansanCard[]>();
  const rankMap = new Map<number, YansanCard[]>();
  for (const c of pool) {
    if (!suitMap.has(c.suit)) suitMap.set(c.suit, []);
    suitMap.get(c.suit)!.push(c);
    if (!rankMap.has(c.rank)) rankMap.set(c.rank, []);
    rankMap.get(c.rank)!.push(c);
  }

  const legalStraightRankSets = [
    [3, 4, 5, 14, 15],
    [3, 4, 5, 6, 7],
    [4, 5, 6, 7, 8],
    [5, 6, 7, 8, 9],
    [6, 7, 8, 9, 10],
    [7, 8, 9, 10, 11],
    [8, 9, 10, 11, 12],
    [9, 10, 11, 12, 13],
    [11, 12, 13, 14, 15],
  ];

  // (1) 检查同花顺 (Tier 5)
  for (const [, sCards] of suitMap.entries()) {
    if (sCards.length >= 5) {
      const sRankSet = new Set(sCards.map((c) => c.rank));
      for (const rSet of legalStraightRankSets) {
        if (rSet.every((r) => sRankSet.has(r))) {
          const straightCards = rSet.map((r) => sCards.find((c) => c.rank === r)!);
          const parsed = parseYansanCombo(straightCards);
          if (parsed && canBeatYansanCombo(parsed, target)) {
            return true;
          }
        }
      }
    }
  }

  if (targetTier === 5) return false;

  // (2) 检查四带一 (Tier 4)
  const fourRanks = Array.from(rankMap.entries())
    .filter(([, list]) => list.length === 4)
    .map(([r]) => r);
  if (fourRanks.length > 0 && pool.length >= 5) {
    if (targetTier < 4) return true;
    for (const fr of fourRanks) {
      if (getYansanRankWeight(fr) > targetRW) return true;
    }
  }

  if (targetTier === 4) return false;

  // (3) 检查俘虏 (Tier 3)
  const tripleRanks = Array.from(rankMap.entries())
    .filter(([, list]) => list.length >= 3)
    .map(([r]) => r);
  const pairRanks = Array.from(rankMap.entries())
    .filter(([, list]) => list.length >= 2)
    .map(([r]) => r);

  for (const tr of tripleRanks) {
    for (const pr of pairRanks) {
      if (tr !== pr) {
        if (targetTier < 3) return true;
        if (targetTier === 3 && getYansanRankWeight(tr) > targetRW) return true;
      }
    }
  }

  if (targetTier === 3) return false;

  // (4) 检查同花 (Tier 2)
  for (const [, sCards] of suitMap.entries()) {
    if (sCards.length >= 5) {
      const suitVal = sCards[0].suitVal;
      if (targetTier < 2) return true;
      if (targetTier === 2) {
        if (suitVal > targetSuit) return true;
        if (suitVal === targetSuit) {
          const sortedDesc = [...sCards].sort((a, b) => getYansanCardPower(b) - getYansanCardPower(a));
          const maxPower = getYansanCardPower(sortedDesc[0]);
          const targetPower = getYansanRankWeight(target.rank) * 10 + targetSuit;
          if (maxPower > targetPower) return true;
        }
      }
    }
  }

  if (targetTier === 2) return false;

  // (5) 检查顺子 (Tier 1)
  for (const rSet of legalStraightRankSets) {
    if (rSet.every((r) => rankMap.has(r) && rankMap.get(r)!.length > 0)) {
      const cards = rSet.map((r) => {
        const list = rankMap.get(r)!;
        return [...list].sort((a, b) => getYansanCardPower(b) - getYansanCardPower(a))[0];
      });
      const parsed = parseYansanCombo(cards);
      if (parsed && canBeatYansanCombo(parsed, target)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 烟三基于公开已出牌库（记牌推算）的绝对压制判定：
 * 
 * 核心设计原则（严禁偷窥对手手牌，杜绝信息泄露）：
 * 绝不可通过读取对手暗牌来判定！
 * 仅依据公开打出过的废牌堆 (playedCardsHistory)、出牌者自己的手牌与本手打出的牌推算出“全场剩余不可见未知牌池 (availableOpponentPool)”：
 * 1. 张数推算：若全场对手中最多手牌者张数不足（如打出5张牌，但对手最多只剩4张），则必定绝大！
 * 2. 单张推算：若未知牌池中不存在任何点数更大、或同点数花色更大的单张（如♠3全场至尊，或♠3已出后的♥3），则必定绝大！
 * 3. 对子推算：若未知牌池中任何大于当前对子的点数，剩余可用张数都小于2张（无法凑出一对）；且同点数的无法产生更大花色对子，则必定绝大！
 * 4. 三条推算：若未知牌池中任何大于当前三条的点数，剩余可用张数都小于3张（如3张3已出，打出三条2），则必定绝大！
 * 5. 五张牌型推算：若未知牌池完全无法拼出任何能够压制当前牌型的五张组合（同花顺、四带一、俘虏、同花、顺子），则必定绝大！
 * 
 * 若返回 true，说明任何对手在数学物理意义上都不可能要得起，无需等待对手过牌，首出者直接保留出牌权连打！
 */
export function isYansanComboDeductivelyUnbeatable(
  combo: YansanCombo,
  availablePool: YansanCard[],
  maxOpponentHandSize: number
): boolean {
  if (!combo) return false;

  // 1. 张数推算：若对手最多手牌数少于当前牌型所需张数，全场无人能接
  const neededCards = combo.type === '5_card' ? 5 : combo.type === 'triplet' ? 3 : combo.type === 'pair' ? 2 : 1;
  if (maxOpponentHandSize < neededCards || availablePool.length < neededCards) {
    return true;
  }

  // 2. 单张推算
  if (combo.type === 'single') {
    const targetPower = getYansanRankWeight(combo.rank) * 10 + (combo.suitVal || 0);
    for (const c of availablePool) {
      const p = getYansanRankWeight(c.rank) * 10 + c.suitVal;
      if (p > targetPower) {
        return false;
      }
    }
    return true;
  }

  // 3. 对子推算
  if (combo.type === 'pair') {
    const targetRW = getYansanRankWeight(combo.rank);
    const targetSuit = combo.suitVal || 0;

    const rankMap = new Map<number, YansanCard[]>();
    for (const c of availablePool) {
      if (!rankMap.has(c.rank)) rankMap.set(c.rank, []);
      rankMap.get(c.rank)!.push(c);
    }

    for (const [rank, grp] of rankMap.entries()) {
      if (grp.length >= 2) {
        const rw = getYansanRankWeight(rank);
        if (rw > targetRW) return false;
        if (rw === targetRW) {
          const maxSuitInPool = Math.max(...grp.map((c) => c.suitVal));
          if (maxSuitInPool > targetSuit) return false;
        }
      }
    }
    return true;
  }

  // 4. 三条推算
  if (combo.type === 'triplet') {
    const targetRW = getYansanRankWeight(combo.rank);
    const rankCounts = new Map<number, number>();
    for (const c of availablePool) {
      rankCounts.set(c.rank, (rankCounts.get(c.rank) || 0) + 1);
    }
    for (const [rank, count] of rankCounts.entries()) {
      if (count >= 3 && getYansanRankWeight(rank) > targetRW) {
        return false;
      }
    }
    return true;
  }

  // 5. 五张牌型推算
  if (combo.type === '5_card') {
    return !canPoolBeatYansan5CardCombo(availablePool, combo);
  }

  return false;
}

export interface YansanSpecialHolders {
  spade3Seat: number;
  spadeASeat: number;
  isSolo: boolean; // True if same seat holds both ♠3 and ♠A
  soloSeat: number | null;
}

export function detectYansanSpecialHolders(hands: YansanCard[][]): YansanSpecialHolders {
  let spade3Seat = 0;
  let spadeASeat = 0;

  for (let s = 0; s < hands.length; s++) {
    if (hands[s].some((c) => c.rank === 3 && c.suit === '♠')) {
      spade3Seat = s;
    }
    if (hands[s].some((c) => c.rank === 14 && c.suit === '♠')) {
      spadeASeat = s;
    }
  }

  const isSolo = spade3Seat === spadeASeat;
  return {
    spade3Seat,
    spadeASeat,
    isSolo,
    soloSeat: isSolo ? spade3Seat : null,
  };
}

export interface YansanSettlement {
  winnerSeat: number;
  winnerAlliance: string;
  isQiangGong: boolean;
  qiangGongSeat: number | null;
  seatScores: [number, number, number, number];
  summary: string;
  isTie?: boolean;
}

export function calculateYansanSettlement(
  roomType: string,
  winnerSeat: number,
  isQiangGong: boolean,
  qiangGongSeat: number | null,
  spade3Seat: number,
  spadeASeat: number,
  finishedSeats: number[]
): YansanSettlement {
  const lowStake = roomType === '20-40' ? 20 : roomType === '10-20' ? 10 : 5;
  const highStake = lowStake * 2;
  const seatNames = ['本家', '西席', '北席', '东席'];

  if (isQiangGong && qiangGongSeat !== null) {
    // 强攻规则：全胜翻倍或翻倍全输
    // 5-10分场：赢60分（其他3家各输20分）；输60分（其他3家各得20分）
    const totalStake = highStake * 3; // 60 for 20-40, 30 for 10-20, 15 for 5-10 (翻倍: 60 for 5-10 with x2)
    const baseMult = highStake * 3;
    const isSoloWin = winnerSeat === qiangGongSeat;

    const scores: [number, number, number, number] = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      if (i === qiangGongSeat) {
        scores[i] = isSoloWin ? baseMult * 2 : -(baseMult * 2);
      } else {
        scores[i] = isSoloWin ? -(highStake * 2) : (highStake * 2);
      }
    }

    const summary = isSoloWin
      ? `${seatNames[qiangGongSeat]} 开启强攻率先出清，全胜翻倍！独赢 +${scores[qiangGongSeat]} 分，其余三家各输 -${highStake * 2} 分`
      : `强攻被破！${seatNames[winnerSeat]} 率先出清，强攻者 ${seatNames[qiangGongSeat]} 翻倍全输 ${scores[qiangGongSeat]} 分，其余三家各得 +${highStake * 2} 分`;

    return {
      winnerSeat,
      winnerAlliance: isSoloWin ? `${seatNames[qiangGongSeat]} (强攻独胜)` : `${seatNames[winnerSeat]} (防守同盟)`,
      isQiangGong: true,
      qiangGongSeat,
      seatScores: scores,
      summary,
    };
  }

  const scores: [number, number, number, number] = [0, 0, 0, 0];

  // 经典 2v2 对局：同盟由 ♠3 与 ♠A 持有者构成
  if (spade3Seat !== spadeASeat) {
    const isSpade = (s: number) => s === spade3Seat || s === spadeASeat;

    const p1 = finishedSeats[0] ?? winnerSeat;
    const p2 = finishedSeats[1] ?? -1;
    const p3 = finishedSeats[2] ?? -1;

    let spadeWinPoints = 0;
    let winningAllianceName = '';
    let summary = '';
    let isTie = false;

    // 规则判定：
    // ① 双胜（双跑）：同一阵营两人包揽前两名（如1和3或2和4先出清手牌）
    // 5-10分场：胜方各得10分，负方各输10分
    if (finishedSeats.length === 2 || (p2 !== -1 && isSpade(p1) === isSpade(p2))) {
      if (isSpade(p1) && isSpade(p2)) {
        // 1号与3号玩家包揽前二 (1,3 或 3,1)
        spadeWinPoints = highStake;
        winningAllianceName = '黑桃同盟 (♠3 & ♠A)';
        summary = `黑桃同盟 (♠3 & ♠A) 双跑全胜！包揽前两名率先出清，各得 +${highStake} 分，平民各输 -${highStake} 分`;
      } else {
        // 2号与4号玩家包揽前二 (2,4 或 4,2)
        spadeWinPoints = -highStake;
        winningAllianceName = '平民同盟';
        summary = `平民同盟 双跑全胜！包揽前两名率先出清，各得 +${highStake} 分，黑桃同盟各输 -${highStake} 分`;
      }
    } else if (p3 !== -1) {
      // ② 出清三人时分出胜负或打和：
      const p1IsSpade = isSpade(p1);
      const p3IsSpade = isSpade(p3);

      if (p1IsSpade && p3IsSpade) {
        // 顺序 123 / 321 / 143 / 341：黑桃同盟拿下第1名与第3名出清
        // 5-10分场：1和3各得5分，2和4各输5分
        spadeWinPoints = lowStake;
        winningAllianceName = '黑桃同盟 (♠3 & ♠A)';
        summary = `黑桃同盟 (♠3 & ♠A) 单胜！夺得第一名及第三名出清，各得 +${lowStake} 分，平民各输 -${lowStake} 分`;
      } else if (!p1IsSpade && !p3IsSpade) {
        // 顺序 214 / 234 / 412 / 432：平民同盟拿下第1名与第3名出清
        // 5-10分场：2和4各得5分，1和3各输5分
        spadeWinPoints = -lowStake;
        winningAllianceName = '平民同盟';
        summary = `平民同盟 单胜！夺得第一名及第三名出清，各得 +${lowStake} 分，黑桃同盟各输 -${lowStake} 分`;
      } else {
        // ③ 打和：顺序 124 / 142 / 324 / 342 / 213 / 231 / 413 / 431
        // 一方拿第1名，但另一方包揽第2名和第3名出清，双方打和，大家都没有输赢 (各得0分)
        spadeWinPoints = 0;
        winningAllianceName = '双方平局 (打和)';
        isTie = true;
        summary = `势均力敌 · 本局打和！一方拿下头彩但另一方包揽二三名，双方势均力敌，大家都没有输赢 (各 0 分)`;
      }
    } else {
      // 容错备用
      if (isSpade(p1)) {
        spadeWinPoints = lowStake;
        winningAllianceName = '黑桃同盟 (♠3 & ♠A)';
        summary = `黑桃同盟率先出清，各得 +${lowStake} 分，平民同盟各输 -${lowStake} 分`;
      } else {
        spadeWinPoints = -lowStake;
        winningAllianceName = '平民同盟';
        summary = `平民同盟率先出清，各得 +${lowStake} 分，黑桃同盟各输 -${lowStake} 分`;
      }
    }

    for (let i = 0; i < 4; i++) {
      scores[i] = isSpade(i) ? spadeWinPoints : -spadeWinPoints;
    }

    return {
      winnerSeat,
      winnerAlliance: winningAllianceName,
      isQiangGong: false,
      qiangGongSeat: null,
      seatScores: scores,
      summary,
      isTie,
    };
  } else {
    // 独占 ♠3 & ♠A 但未开启强攻（1对3）
    const solo = spade3Seat;
    const firstPlace = finishedSeats[0] ?? winnerSeat;
    const isSoloWin = firstPlace === solo;

    const totalStake = isSoloWin ? lowStake * 3 : -(lowStake * 3);
    const eachStake = isSoloWin ? -lowStake : lowStake;

    for (let i = 0; i < 4; i++) {
      scores[i] = i === solo ? totalStake : eachStake;
    }

    const summary = isSoloWin
      ? `${seatNames[solo]} (独持♠3♠A) 率先出清，独得 +${totalStake} 分，其余各扣 -${lowStake} 分`
      : `平民同盟包揽出清！独持者 ${seatNames[solo]} 共扣 -${Math.abs(totalStake)} 分，平民各得 +${lowStake} 分`;

    return {
      winnerSeat,
      winnerAlliance: isSoloWin ? `${seatNames[solo]} (独战胜)` : '平民盟',
      isQiangGong: false,
      qiangGongSeat: null,
      seatScores: scores,
      summary,
    };
  }
}

export function calculateYansanSurrenderSettlement(
  roomType: string,
  surrenderSeat: number
): YansanSettlement {
  // 5-10分场：该玩家输15分，其他玩家各得5分 (eachStake = 5, totalStake = 15)
  // 10-20分场：输30分，其他玩家各得10分 (eachStake = 10, totalStake = 30)
  // 20-40分场：输60分，其他玩家各得20分 (eachStake = 20, totalStake = 60)
  const eachStake = roomType === '20-40' ? 20 : roomType === '10-20' ? 10 : 5;
  const totalStake = eachStake * 3;
  const seatNames = ['本家', '西席', '北席', '东席'];

  const scores: [number, number, number, number] = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    if (i === surrenderSeat) {
      scores[i] = -totalStake;
    } else {
      scores[i] = eachStake;
    }
  }

  const summary = `${seatNames[surrenderSeat]} 在起手手牌未动时选择投降认输！输 -${totalStake} 分，其余三家各得 +${eachStake} 分`;

  return {
    winnerSeat: (surrenderSeat + 1) % 4,
    winnerAlliance: '胜方同盟 (对手投降)',
    isQiangGong: false,
    qiangGongSeat: null,
    seatScores: scores,
    summary,
  };
}
