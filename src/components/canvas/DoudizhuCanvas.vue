<template>
  <div
    ref="containerRef"
    class="w-full h-full select-none absolute inset-0 overflow-hidden flex items-center justify-center"
    :style="{
      backgroundColor: props.tableTheme?.feltColor || '#92400E',
      background: `radial-gradient(ellipse at 50% 45%, ${props.tableTheme?.highlightColor || '#D97706'} 0%, ${props.tableTheme?.feltColor || '#92400E'} 60%, ${props.tableTheme?.edgeColor || '#592806'} 100%)`
    }"
  >
    <!-- Fullscreen Card Table Surface with In-Table Action Overlay -->
    <div class="w-full h-full absolute inset-0 overflow-hidden flex items-center justify-center">
      <canvas
        ref="canvasRef"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointerleave="onPointerUp"
        @pointercancel="onPointerUp"
        class="w-full h-full absolute inset-0 block cursor-pointer"
      ></canvas>

      <!-- Integrated Card Counter Inside Table (Top-Left, below HUD) -->
      <div
        v-if="showCardCounter"
        class="absolute top-11 left-3 z-15 px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-xs flex items-center gap-2 text-[10px] font-mono shadow-md pointer-events-none"
      >
        <span class="text-[#A89887] font-sans font-bold">记牌器:</span>
        <span class="text-amber-400 font-bold">大王:{{ cardCounter[17] || 0 }}</span>
        <span class="text-amber-400 font-bold">小王:{{ cardCounter[16] || 0 }}</span>
        <span class="text-emerald-400 font-bold">2:{{ cardCounter[15] || 0 }}</span>
        <span class="text-emerald-400 font-bold">A:{{ cardCounter[14] || 0 }}</span>
        <span class="text-slate-300">K:{{ cardCounter[13] || 0 }}</span>
        <span class="text-slate-300">Q:{{ cardCounter[12] || 0 }}</span>
        <span class="text-slate-300">J:{{ cardCounter[11] || 0 }}</span>
        <span class="text-slate-400">10:{{ cardCounter[10] || 0 }}</span>
      </div>

      <!-- Scene Mode Badge -->
      <div
        class="absolute top-11 right-3 z-15 px-2.5 py-1 rounded-xl bg-black/70 border border-amber-500/50 backdrop-blur-xs flex items-center gap-1.5 text-[10px] font-mono shadow-md text-amber-300 font-bold pointer-events-none"
      >
        <span>{{ props.sceneMode === 'noshuffle' ? '💣 不洗牌场 (炸弹满天)' : '🃏 经典场' }}</span>
      </div>



      <!-- Auto-Host Active Banner Overlay -->
      <div
        v-if="isAutoHost"
        class="absolute bottom-[32%] left-1/2 -translate-x-1/2 z-25 px-4 py-1.5 rounded-2xl bg-amber-600/90 border-2 border-amber-300 text-white text-xs font-extrabold shadow-[0_4px_20px_rgba(245,158,11,0.6)] animate-bounce flex items-center gap-2 pointer-events-auto cursor-pointer"
        @click="toggleAutoHost"
      >
        <span>🤖 正在智能托管中 (点击可取消)</span>
      </div>

      <!-- Floating Error Alert Tip (Top Center) -->
      <div
        v-if="errorTip"
        class="absolute top-11 left-1/2 -translate-x-1/2 z-20 px-3.5 py-0.5 rounded-full bg-black/80 border border-white/15 text-xs text-amber-200 font-bold shadow-md animate-bounce"
      >
        ⚠️ {{ errorTip }}
      </div>

      <!-- In-Table Floating Action Buttons (Directly above hand cards) -->
      <div
        v-if="winnerSeat === null && turnSeat === 0"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-2.5 pointer-events-auto"
      >
        <!-- Bidding Phase Buttons -->
        <template v-if="gamePhase === 'bidding'">
          <button
            type="button"
            @click="handleBid(0)"
            class="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-black/75 hover:bg-black/90 border border-white/25 text-[#E6DEC8] shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            不叫
          </button>
          <button
            type="button"
            @click="handleBid(1)"
            class="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-amber-700 hover:bg-amber-600 border border-amber-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            叫地主 (1分)
          </button>
          <button
            type="button"
            @click="handleBid(3)"
            class="px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_4px_20px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all ring-2 ring-amber-300"
          >
            抢地主 (3分)
          </button>
        </template>

        <!-- Playing Phase Buttons -->
        <template v-else>
          <button
            type="button"
            @click="handleHint"
            class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-black/75 hover:bg-black/90 border border-amber-400/50 text-amber-200 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>💡</span>
            <span>提示</span>
          </button>
          <button
            type="button"
            @click="toggleAutoHost"
            class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl shadow-xl transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            :class="isAutoHost ? 'bg-amber-600 text-white animate-pulse border border-amber-300' : 'bg-black/75 hover:bg-black/90 text-amber-200 border border-amber-500/50'"
            title="AI智能托管开关"
          >
            <span>🤖</span>
            <span>{{ isAutoHost ? '取消托管' : '托管' }}</span>
          </button>
          <button
            type="button"
            @click="handlePass"
            :disabled="!lastCombo || lastCombo.seat === 0"
            class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-black/75 hover:bg-black/90 border border-white/25 text-[#E6DEC8] disabled:opacity-30 shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            不出
          </button>
          <button
            type="button"
            @click="handlePlay"
            :disabled="selectedIds.size === 0"
            class="px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black disabled:opacity-35 disabled:pointer-events-none shadow-[0_4px_20px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all ring-2 ring-amber-300 flex items-center gap-1"
          >
            <span>出牌</span>
            <span v-if="selectedIds.size > 0" class="text-[11px] font-mono">({{ selectedIds.size }})</span>
          </button>
        </template>
      </div>

      <!-- 斗地主对局胜负结算面板 (全面完善：三方明细与继续/退出按钮) -->
      <div
        v-if="winnerSeat !== null && settlementDetails"
        class="absolute inset-0 bg-black/92 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-40 overflow-y-auto select-none"
      >
        <div class="w-full max-w-lg sm:max-w-xl max-h-[92vh] flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#241710] via-[#1A100B] to-[#120B07] border-2 border-amber-500/70 p-3 sm:p-5 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.3)] text-[#F5EFE6] overflow-hidden">
          <!-- 头部标题栏 -->
          <div class="flex items-center justify-between pb-2 sm:pb-2.5 border-b border-amber-500/30 shrink-0">
            <div class="flex items-center gap-2.5 sm:gap-3">
              <span class="text-3xl sm:text-4xl filter drop-shadow">
                {{ settlementDetails.isUserWinner ? '🏆' : '🍂' }}
              </span>
              <div>
                <h3 class="text-sm sm:text-base md:text-lg font-black text-amber-300 font-serif-title leading-tight">
                  <span v-if="isSpring" class="text-red-400">【春天大捷 · 翻倍爆分】</span>
                  <span v-else-if="isAntiSpring" class="text-red-400">【反春天大捷 · 翻倍绝杀】</span>
                  <span>{{ settlementDetails.isUserWinner ? (landlordSeat === 0 ? '本家地主独霸全场！' : '农民同盟克敌大捷！') : (landlordSeat === 0 ? '本家地主遗憾告负！' : '地主率先出清获胜！') }}</span>
                </h3>
                <p class="text-[9px] sm:text-[10px] text-amber-200/80 font-mono mt-0.5">
                  {{ props.sceneMode === 'noshuffle' ? '💣 不洗牌炸弹场' : '🃏 经典叫分场' }} · 最终倍数 ×{{ multiplier }}
                </p>
              </div>
            </div>

            <!-- 右上角收益状态徽章 -->
            <div class="flex items-center gap-2">
              <div class="text-right">
                <div class="text-[9px] text-[#A89887] font-mono">结算倍数</div>
                <div class="text-xs sm:text-sm font-mono font-bold text-amber-400">
                  ×{{ multiplier }}
                </div>
              </div>
              <div
                class="px-2.5 sm:px-3 py-1 rounded-xl border text-xs sm:text-sm font-black font-mono shadow-sm"
                :class="settlementDetails.players[0].coinsDelta >= 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-rose-500/20 text-rose-300 border-rose-500/50'"
              >
                {{ settlementDetails.players[0].coinsDelta >= 0 ? `+${settlementDetails.players[0].coinsDelta}` : settlementDetails.players[0].coinsDelta }} 贯
              </div>
            </div>
          </div>

          <!-- 三位玩家结算详情明细卡片 -->
          <div class="py-2 sm:py-3 space-y-2 flex-1 overflow-y-auto min-h-0 pr-0.5">
            <div
              v-for="p in settlementDetails.players"
              :key="p.seat"
              class="p-2 sm:p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 sm:gap-3"
              :class="p.seat === winnerSeat ? 'bg-amber-950/50 border-amber-400/60 shadow-md ring-1 ring-amber-400/30' : p.seat === 0 ? 'bg-black/55 border-amber-500/30' : 'bg-black/40 border-white/10'"
            >
              <!-- 席位与身份徽章 -->
              <div class="flex items-center gap-2 min-w-[120px] sm:min-w-[140px]">
                <span class="text-xl sm:text-2xl">{{ p.isLandlord ? '👑' : p.avatar }}</span>
                <div>
                  <div class="text-xs sm:text-sm font-extrabold flex items-center gap-1.5" :class="p.seat === 0 ? 'text-amber-300' : 'text-white'">
                    <span>{{ p.name }}</span>
                    <span
                      class="text-[9px] px-1.5 py-0.2 rounded-md font-bold"
                      :class="p.isLandlord ? 'bg-amber-500 text-black' : 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/40'"
                    >
                      {{ p.isLandlord ? '地主' : '农民' }}
                    </span>
                  </div>
                  <div class="text-[10px] text-[#A89887] font-mono">
                    {{ p.seat === winnerSeat ? '率先出清 · 登顶胜出' : `剩余 ${p.remainingCount} 张手牌` }}
                  </div>
                </div>
              </div>

              <!-- 手牌剩余概览或胜负状态 -->
              <div class="text-center px-2 py-0.5 rounded-lg bg-black/40 border border-white/5 min-w-[80px] sm:min-w-[100px]">
                <span
                  class="text-xs font-bold font-mono"
                  :class="p.isWin ? 'text-amber-400' : 'text-stone-400'"
                >
                  {{ p.isWin ? (p.seat === winnerSeat ? '👑 夺魁胜出' : '🤝 同盟获胜') : '🍂 对局告负' }}
                </span>
              </div>

              <!-- 筹码收益变动 -->
              <div class="text-right min-w-[80px] sm:min-w-[95px]">
                <div
                  class="text-xs sm:text-sm md:text-base font-black font-mono"
                  :class="p.coinsDelta >= 0 ? 'text-amber-300' : 'text-rose-400'"
                >
                  {{ p.coinsDelta >= 0 ? `+${p.coinsDelta}` : p.coinsDelta }} 贯
                </div>
              </div>
            </div>
          </div>

          <!-- 底部操作按钮栏：退出游戏 与 继续游戏 -->
          <div class="pt-2 sm:pt-2.5 border-t border-amber-500/30 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              @click="handleExitGame"
              class="px-4 sm:px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm font-bold border border-white/10 shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🚪</span>
              <span>退出游戏</span>
            </button>
            <button
              type="button"
              @click="dealNewMatch"
              class="px-6 sm:px-8 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all ring-2 ring-amber-300 flex items-center gap-1.5 cursor-pointer"
            >
              <span>继续游戏</span>
              <span class="text-sm">➔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { soundFX } from '../../utils/sound';
import { haptics } from '../../utils/haptics';
import { TableTheme } from '../../utils/theme';
import { getCanvasEventCoords } from '../../utils/canvasCoords';
import { renderPlayingCard, preloadCardAssets, onCardAssetsLoaded } from '../../utils/cardAssets';

interface Card {
  id: string;
  rank: number; // 3..17 (11=J, 12=Q, 13=K, 14=A, 15=2, 16=小王, 17=大王)
  label: string;
  suit: '♠' | '♥' | '♣' | '♦' | 'JOKER';
  isRed: boolean;
}

interface Combo {
  seat: number;
  cards: Card[];
  type: string;
  primaryRank: number;
  length?: number;
  label: string;
}

const props = defineProps<{
  roomId?: string;
  tableTheme?: TableTheme;
  isRotated90?: boolean;
  sceneMode?: 'classic' | 'noshuffle';
}>();

const emit = defineEmits<{
  (e: 'move', payload: any): void;
  (e: 'restart'): void;
  (e: 'fx', payload: any): void;
  (e: 'status', payload: any): void;
  (e: 'exit'): void;
}>();

function handleExitGame() {
  soundFX.playTap();
  emit('exit');
}

const settlementDetails = computed(() => {
  if (winnerSeat.value === null) return null;
  const mult = multiplier.value;
  const isLandlordWinner = (winnerSeat.value === landlordSeat.value);
  const isUserWinner = (winnerSeat.value === 0) || (landlordSeat.value !== 0 && !isLandlordWinner);

  const players = [0, 1, 2].map((s) => {
    const isLandlord = (s === landlordSeat.value);
    const isWin = isLandlord ? isLandlordWinner : !isLandlordWinner;
    const delta = isLandlord ? (isWin ? 200 * mult : -200 * mult) : (isWin ? 100 * mult : -100 * mult);
    const name = s === 0 ? '本家 (尊贵玩家)' : (s === 1 ? '西席 (南洋商贾)' : '东席 (濠江赌客)');
    const avatar = s === 0 ? '👤' : (s === 1 ? '🎩' : '🎲');

    return {
      seat: s,
      name,
      avatar,
      isLandlord,
      roleName: isLandlord ? '地主' : '农民',
      isWin,
      remainingCount: hands[s]?.length || 0,
      remainingCards: hands[s] || [],
      coinsDelta: delta,
    };
  });

  return {
    isUserWinner,
    isLandlordWinner,
    multiplier: mult,
    players,
  };
});

function emitStatus() {
  emit('status', {
    landlordSeat: landlordSeat.value,
    multiplier: multiplier.value,
    gamePhase: gamePhase.value,
    myCardCount: hands[0]?.length || 0,
    isAutoHost: isAutoHost.value,
    sortMode: sortMode.value,
    showCardCounter: showCardCounter.value,
    landlordText: gamePhase.value === 'bidding' ? '叫地主阶段' : (landlordSeat.value === 0 ? '👑 本家地主' : (landlordSeat.value === 1 ? '👑 西席地主' : '👑 东席地主')),
  });
}

function toggleCardCounter() {
  showCardCounter.value = !showCardCounter.value;
  soundFX.playTap();
  emitStatus();
}

watch(() => props.tableTheme, () => {
  drawTable();
});

watch(() => props.sceneMode, () => {
  dealNewMatch();
});

const containerRef = ref<HTMLDivElement | null>(null);
const tableWidthPx = ref(680);
const tableHeightPx = ref(430);
let resizeObserver: ResizeObserver | null = null;

function updateDimensions() {
  if (!containerRef.value) return;
  const availW = containerRef.value.clientWidth || 680;
  const availH = containerRef.value.clientHeight || 430;
  const targetAspect = 680 / 430;

  let w = availW;
  let h = w / targetAspect;

  if (h > availH) {
    h = availH;
    w = h * targetAspect;
  }

  tableWidthPx.value = Math.max(280, Math.floor(w));
  tableHeightPx.value = Math.max(180, Math.floor(h));
  drawTable();
}

const canvasRef = ref<HTMLCanvasElement | null>(null);
const gamePhase = ref<'bidding' | 'playing'>('bidding');
const landlordSeat = ref(0);
const hands = reactive<Card[][]>([[], [], []]);
const kitty = ref<Card[]>([]);
const selectedIds = reactive(new Set<string>());
const turnSeat = ref(0);
const lastCombo = ref<Combo | null>(null);
const seatStatus = reactive(['等待叫地主', '等待', '等待']);
const multiplier = ref(1);
const winnerSeat = ref<number | null>(null);
const errorTip = ref('');
const isDragging = ref(false);
const showCardCounter = ref(true);
const isSpring = ref(false);
const isAntiSpring = ref(false);

const isAutoHost = ref(false);
const sortMode = ref<'rank' | 'count'>('rank');
let autoHostTimer: any = null;
let botTurnTimer: any = null;
const consecutivePasses = ref(0);
const cachedHintCombos = ref<Card[][]>([]);
const hintIndex = ref(0);
const lastHintKey = ref('');

const cardCounter = reactive<Record<number, number>>({
  17: 1, 16: 1, 15: 4, 14: 4, 13: 4, 12: 4, 11: 4, 10: 4,
});

const RANKS = [
  { rank: 3, label: '3' }, { rank: 4, label: '4' }, { rank: 5, label: '5' },
  { rank: 6, label: '6' }, { rank: 7, label: '7' }, { rank: 8, label: '8' },
  { rank: 9, label: '9' }, { rank: 10, label: '10' }, { rank: 11, label: 'J' },
  { rank: 12, label: 'Q' }, { rank: 13, label: 'K' }, { rank: 14, label: 'A' },
  { rank: 15, label: '2' },
];

const SUITS: { suit: '♠' | '♥' | '♣' | '♦'; isRed: boolean }[] = [
  { suit: '♠', isRed: false },
  { suit: '♥', isRed: true },
  { suit: '♣', isRed: false },
  { suit: '♦', isRed: true },
];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const r of RANKS) {
    for (const s of SUITS) {
      deck.push({ id: `${r.label}-${s.suit}`, rank: r.rank, label: r.label, suit: s.suit, isRed: s.isRed });
    }
  }
  deck.push({ id: 'JOKER-S', rank: 16, label: '小王', suit: 'JOKER', isRed: false });
  deck.push({ id: 'JOKER-B', rank: 17, label: '大王', suit: 'JOKER', isRed: true });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function sortCards(c: Card[]): Card[] {
  if (sortMode.value === 'count') {
    const counts = new Map<number, number>();
    for (const item of c) counts.set(item.rank, (counts.get(item.rank) || 0) + 1);
    return [...c].sort((a, b) => {
      const cA = counts.get(a.rank) || 0;
      const cB = counts.get(b.rank) || 0;
      if (cA !== cB) return cB - cA;
      return b.rank - a.rank || a.id.localeCompare(b.id);
    });
  }
  return [...c].sort((a, b) => b.rank - a.rank || a.id.localeCompare(b.id));
}

function toggleSortMode() {
  sortMode.value = sortMode.value === 'rank' ? 'count' : 'rank';
  hands[0] = sortCards(hands[0]);
  soundFX.playTap();
  drawTable();
  emitStatus();
}

function toggleAutoHost() {
  isAutoHost.value = !isAutoHost.value;
  soundFX.playTap();
  emitStatus();
  if (isAutoHost.value && turnSeat.value === 0 && winnerSeat.value === null) {
    checkAutoHostTurn();
  }
}

function updateCardCounter() {
  const counts: Record<number, number> = { 17: 0, 16: 0, 15: 0, 14: 0, 13: 0, 12: 0, 11: 0, 10: 0 };
  for (let s = 1; s < 3; s++) {
    for (const c of hands[s]) {
      if (counts[c.rank] !== undefined) counts[c.rank]++;
    }
  }
  for (const rk in counts) {
    cardCounter[rk as any] = counts[rk as any];
  }
}

function createNoShuffleHands(): { hands: [Card[], Card[], Card[]]; kitty: Card[] } {
  // 1. Group all 54 cards by rank
  const rankMap = new Map<number, Card[]>();
  for (const r of RANKS) {
    rankMap.set(r.rank, []);
    for (const s of SUITS) {
      rankMap.get(r.rank)!.push({
        id: `${r.label}-${s.suit}`,
        rank: r.rank,
        label: r.label,
        suit: s.suit,
        isRed: s.isRed,
      });
    }
    // Randomize suits inside rank
    const list = rankMap.get(r.rank)!;
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }

  const jokers: Card[] = [
    { id: 'JOKER-S', rank: 16, label: '小王', suit: 'JOKER', isRed: false },
    { id: 'JOKER-B', rank: 17, label: '大王', suit: 'JOKER', isRed: true },
  ];

  const clusters: Card[][] = [];

  // 2. Decide if Kings are together (王炸 / Rocket) (~35% chance together, ~65% separated)
  if (Math.random() < 0.35) {
    clusters.push([...jokers]);
  } else {
    clusters.push([jokers[0]]);
    clusters.push([jokers[1]]);
  }

  // 3. Form 2 to 5 random Bombs (4-of-a-kind) with completely randomized ranks across rounds!
  const shuffledRanks = RANKS.map((r) => r.rank).sort(() => Math.random() - 0.5);
  const numBombs = Math.floor(2 + Math.random() * 4); // 2 to 5 bombs in this match
  for (let b = 0; b < numBombs && b < shuffledRanks.length; b++) {
    const rk = shuffledRanks[b];
    const cards = rankMap.get(rk);
    if (cards && cards.length === 4) {
      clusters.push([...cards]);
      rankMap.set(rk, []);
    }
  }

  // 4. Form 1 to 2 random Straights (length 5..8) from available ranks <= 14 (3..A)
  for (let sIdx = 0; sIdx < 2; sIdx++) {
    let currentStart = -1;
    let currentLen = 0;
    let longestStart = -1;
    let longestLen = 0;

    for (let r = 3; r <= 14; r++) {
      if ((rankMap.get(r)?.length || 0) > 0) {
        if (currentLen === 0) currentStart = r;
        currentLen++;
        if (currentLen > longestLen) {
          longestLen = currentLen;
          longestStart = currentStart;
        }
      } else {
        currentLen = 0;
      }
    }

    if (longestLen >= 5 && longestStart !== -1) {
      const takeLen = Math.min(longestLen, Math.floor(5 + Math.random() * 3));
      const straightCards: Card[] = [];
      for (let r = longestStart; r < longestStart + takeLen; r++) {
        const pool = rankMap.get(r)!;
        if (pool.length > 0) {
          straightCards.push(pool.pop()!);
        }
      }
      if (straightCards.length >= 5) {
        clusters.push(straightCards);
      }
    }
  }

  // 5. Form consecutive pairs or airplanes or triplets from remaining cards
  for (let r = 3; r <= 15; r++) {
    const pool = rankMap.get(r) || [];
    if (pool.length >= 3) {
      clusters.push(pool.splice(0, 3));
    } else if (pool.length === 2) {
      clusters.push(pool.splice(0, 2));
    } else if (pool.length === 1) {
      clusters.push(pool.splice(0, 1));
    }
  }

  // 6. Gather any remaining cards
  for (const [, pool] of rankMap.entries()) {
    while (pool.length > 0) {
      clusters.push([pool.pop()!]);
    }
  }

  // 7. Shuffle the clusters order (clusters stay contiguous!)
  for (let i = clusters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clusters[i], clusters[j]] = [clusters[j], clusters[i]];
  }

  // 8. Flatten into assembled deck
  let noshuffleDeck: Card[] = [];
  for (const c of clusters) {
    noshuffleDeck.push(...c);
  }

  // 9. Perform 1 to 3 random physical cuts (切牌)
  const cutCount = Math.floor(1 + Math.random() * 3);
  for (let k = 0; k < cutCount; k++) {
    const cutPoint = Math.floor(10 + Math.random() * 34);
    noshuffleDeck = [...noshuffleDeck.slice(cutPoint), ...noshuffleDeck.slice(0, cutPoint)];
  }

  // 10. Distribute in packets of 2 to 5 contiguous cards to 3 seats with randomized starting seat
  const pHands: [Card[], Card[], Card[]] = [[], [], []];
  let deckPtr = 0;
  let curSeat = Math.floor(Math.random() * 3);

  while (pHands[0].length < 17 || pHands[1].length < 17 || pHands[2].length < 17) {
    const seat = curSeat % 3;
    curSeat++;
    const needed = 17 - pHands[seat].length;
    if (needed <= 0) continue;

    const remainingDeck = (noshuffleDeck.length - 3) - deckPtr;
    const packetSize = Math.max(1, Math.min(needed, Math.min(Math.floor(2 + Math.random() * 4), remainingDeck)));
    const chunk = noshuffleDeck.slice(deckPtr, deckPtr + packetSize);
    deckPtr += chunk.length;
    pHands[seat].push(...chunk);
  }

  // The 3 remaining cards are the kitty
  const noshuffleKitty = noshuffleDeck.slice(deckPtr, deckPtr + 3);

  return {
    hands: [sortCards(pHands[0]), sortCards(pHands[1]), sortCards(pHands[2])],
    kitty: noshuffleKitty,
  };
}

function dealNewMatch() {
  if (autoHostTimer) clearTimeout(autoHostTimer);
  if (botTurnTimer) clearTimeout(botTurnTimer);

  if (props.sceneMode === 'noshuffle') {
    const ns = createNoShuffleHands();
    hands[0] = ns.hands[0];
    hands[1] = ns.hands[1];
    hands[2] = ns.hands[2];
    kitty.value = ns.kitty;
  } else {
    const deck = createDeck();
    hands[0] = sortCards(deck.slice(0, 17));
    hands[1] = sortCards(deck.slice(17, 34));
    hands[2] = sortCards(deck.slice(34, 51));
    kitty.value = deck.slice(51, 54);
  }

  selectedIds.clear();
  cachedHintCombos.value = [];
  hintIndex.value = 0;
  lastHintKey.value = '';
  consecutivePasses.value = 0;
  gamePhase.value = 'bidding';
  turnSeat.value = 0;
  landlordSeat.value = 0;
  lastCombo.value = null;
  seatStatus[0] = '请叫地主';
  seatStatus[1] = '等待';
  seatStatus[2] = '等待';
  multiplier.value = 1;
  winnerSeat.value = null;
  isSpring.value = false;
  isAntiSpring.value = false;
  errorTip.value = '';

  updateCardCounter();
  drawTable();
  emit('restart');
  emitStatus();

  if (isAutoHost.value) {
    checkAutoHostTurn();
  }
}

function calculateHandPower(cards: Card[]): number {
  let power = 0;
  const rankCounts = new Map<number, number>();
  for (const c of cards) {
    rankCounts.set(c.rank, (rankCounts.get(c.rank) || 0) + 1);
    if (c.rank === 17) power += 4; // 大王
    else if (c.rank === 16) power += 3; // 小王
    else if (c.rank === 15) power += 2; // 2
    else if (c.rank === 14) power += 1; // A
  }
  for (const cnt of rankCounts.values()) {
    if (cnt === 4) power += 4; // 炸弹
  }
  if (cards.some((c) => c.rank === 16) && cards.some((c) => c.rank === 17)) power += 3; // 王炸
  return power;
}

function handleBid(score: number) {
  if (score > 0) {
    landlordSeat.value = 0;
    multiplier.value = score;
    hands[0] = sortCards([...hands[0], ...kitty.value]);
    gamePhase.value = 'playing';
    turnSeat.value = 0;
    consecutivePasses.value = 0;
    lastCombo.value = null;
    seatStatus[0] = `地主 (叫${score}分先出)`;
    seatStatus[1] = '农民待命';
    seatStatus[2] = '农民待命';
    soundFX.playCardSnap(true);
    soundFX.speakAction(score >= 3 ? 'grab_landlord' : 'call_landlord');
    if (isAutoHost.value) {
      checkAutoHostTurn();
    }
  } else {
    // 玩家不叫，智能评估西席与东席手牌实力谁抢地主
    const power1 = calculateHandPower(hands[1]);
    const power2 = calculateHandPower(hands[2]);
    const winnerBot = power2 >= power1 ? 2 : 1; // 逆时针优先东席
    const bestPower = Math.max(power1, power2);
    const botBid = bestPower >= 8 ? 3 : (bestPower >= 5 ? 2 : 1);

    landlordSeat.value = winnerBot;
    multiplier.value = botBid;
    hands[winnerBot] = sortCards([...hands[winnerBot], ...kitty.value]);
    gamePhase.value = 'playing';
    turnSeat.value = winnerBot;
    consecutivePasses.value = 0;
    lastCombo.value = null;

    seatStatus[winnerBot] = `地主 (抢${botBid}分先出)`;
    seatStatus[winnerBot === 1 ? 2 : 1] = '农民防守';
    seatStatus[0] = '农民防守';
    soundFX.speakAction('pass_bid');
    scheduleBotTurn(winnerBot);
  }
  updateCardCounter();
  drawTable();
}

/**
 * Complete Doudizhu Combo Recognition
 */
function evaluateHand(cards: Card[], seat: number): Combo | null {
  if (cards.length === 0) return null;
  const sorted = [...cards].sort((a, b) => a.rank - b.rank);
  const n = sorted.length;
  const counts = new Map<number, number>();
  for (const c of sorted) counts.set(c.rank, (counts.get(c.rank) || 0) + 1);

  // 1 card: Single
  if (n === 1) {
    return { seat, cards: sorted, type: 'single', primaryRank: sorted[0].rank, label: `单张 ${sorted[0].label}` };
  }

  // 2 cards: Rocket or Pair
  if (n === 2) {
    if (sorted[0].rank === 16 && sorted[1].rank === 17) {
      return { seat, cards: sorted, type: 'rocket', primaryRank: 99, label: '王炸 · 至尊' };
    }
    if (sorted[0].rank === sorted[1].rank) {
      return { seat, cards: sorted, type: 'pair', primaryRank: sorted[0].rank, label: `对${sorted[0].label}` };
    }
    return null;
  }

  // 3 cards: Triplet
  if (n === 3 && counts.size === 1) {
    return { seat, cards: sorted, type: 'triple', primaryRank: sorted[0].rank, label: `三张${sorted[0].label}` };
  }

  // 4 cards: Bomb or Triple + 1
  if (n === 4) {
    if (counts.size === 1) {
      return { seat, cards: sorted, type: 'bomb', primaryRank: sorted[0].rank, label: `四张${sorted[0].label}炸弹` };
    }
    for (const [rk, cnt] of counts.entries()) {
      if (cnt === 3) return { seat, cards: sorted, type: 'triple_one', primaryRank: rk, label: `三带一` };
    }
  }

  // 5 cards: Triple + Pair, or 5-Straight
  if (n === 5) {
    for (const [rk, cnt] of counts.entries()) {
      if (cnt === 3 && counts.size === 2) return { seat, cards: sorted, type: 'triple_pair', primaryRank: rk, label: `三带对` };
    }
    if (counts.size === 5 && sorted[4].rank <= 14) {
      let isStr = true;
      for (let i = 1; i < 5; i++) {
        if (sorted[i].rank !== sorted[i - 1].rank + 1) { isStr = false; break; }
      }
      if (isStr) return { seat, cards: sorted, type: 'straight', primaryRank: sorted[4].rank, length: 5, label: '5张顺子' };
    }
  }

  // 6 cards: 6-Straight, 3-Consecutive Pairs (连对), Four with Two Singles, or Airplane (333444)
  if (n === 6) {
    // 4 + 2 singles
    for (const [rk, cnt] of counts.entries()) {
      if (cnt === 4) return { seat, cards: sorted, type: 'four_two', primaryRank: rk, label: `四带二` };
    }
    // 333444
    if (counts.size === 2) {
      const vals = Array.from(counts.keys()).sort((a, b) => a - b);
      if (counts.get(vals[0]) === 3 && counts.get(vals[1]) === 3 && vals[1] === vals[0] + 1 && vals[1] <= 14) {
        return { seat, cards: sorted, type: 'airplane', primaryRank: vals[1], length: 2, label: '飞机 (两连三)' };
      }
    }
    // 3 consecutive pairs
    if (counts.size === 3) {
      const vals = Array.from(counts.keys()).sort((a, b) => a - b);
      if (vals.every((v) => counts.get(v) === 2) && vals[2] === vals[0] + 2 && vals[2] <= 14) {
        return { seat, cards: sorted, type: 'consecutive_pairs', primaryRank: vals[2], length: 3, label: '3连对' };
      }
    }
    // 6-Straight
    if (counts.size === 6 && sorted[5].rank <= 14) {
      let isStr = true;
      for (let i = 1; i < 6; i++) {
        if (sorted[i].rank !== sorted[i - 1].rank + 1) { isStr = false; break; }
      }
      if (isStr) return { seat, cards: sorted, type: 'straight', primaryRank: sorted[5].rank, length: 6, label: '6张顺子' };
    }
  }

  // General Straights (7..12)
  if (n >= 7 && n <= 12 && counts.size === n && sorted[n - 1].rank <= 14) {
    let isStr = true;
    for (let i = 1; i < n; i++) {
      if (sorted[i].rank !== sorted[i - 1].rank + 1) { isStr = false; break; }
    }
    if (isStr) return { seat, cards: sorted, type: 'straight', primaryRank: sorted[n - 1].rank, length: n, label: `${n}张顺子` };
  }

  // General Consecutive Pairs (4..8 pairs)
  if (n >= 8 && n % 2 === 0) {
    const pairCount = n / 2;
    if (counts.size === pairCount) {
      const vals = Array.from(counts.keys()).sort((a, b) => a - b);
      if (vals.every((v) => counts.get(v) === 2) && vals[pairCount - 1] - vals[0] === pairCount - 1 && vals[pairCount - 1] <= 14) {
        return { seat, cards: sorted, type: 'consecutive_pairs', primaryRank: vals[pairCount - 1], length: pairCount, label: `${pairCount}连对` };
      }
    }
  }

  // Airplane with small wings (8 cards: 333444 + 2 singles, or 10 cards: 333444 + 2 pairs)
  if (n === 8) {
    // 2 triples + 2 singles
    const triples: number[] = [];
    for (const [rk, cnt] of counts.entries()) {
      if (cnt >= 3) triples.push(rk);
    }
    triples.sort((a, b) => a - b);
    for (let i = 0; i < triples.length - 1; i++) {
      if (triples[i + 1] === triples[i] + 1 && triples[i + 1] <= 14) {
        return { seat, cards: sorted, type: 'airplane_wings', primaryRank: triples[i + 1], length: 2, label: '飞机带翅膀' };
      }
    }
    // Four with two pairs (8 cards: 4 of rank + 2 pairs)
    for (const [rk, cnt] of counts.entries()) {
      if (cnt === 4 && (counts.size === 3 || counts.size === 2)) {
        return { seat, cards: sorted, type: 'four_two_pairs', primaryRank: rk, label: '四带两对' };
      }
    }
  }

  if (n === 10) {
    // 2 triples + 2 pairs
    const triples: number[] = [];
    for (const [rk, cnt] of counts.entries()) {
      if (cnt >= 3) triples.push(rk);
    }
    triples.sort((a, b) => a - b);
    for (let i = 0; i < triples.length - 1; i++) {
      if (triples[i + 1] === triples[i] + 1 && triples[i + 1] <= 14) {
        return { seat, cards: sorted, type: 'airplane_pairs', primaryRank: triples[i + 1], length: 2, label: '飞机带两对' };
      }
    }
  }

  return null;
}

function canBeat(cand: Combo, target: Combo | null): boolean {
  if (!target || target.seat === cand.seat) return true;
  if (cand.type === 'rocket') return true;
  if (target.type === 'rocket') return false;
  if (cand.type === 'bomb' && target.type !== 'bomb') return true;
  if (cand.type === 'bomb' && target.type === 'bomb') return cand.primaryRank > target.primaryRank;
  if (cand.type === target.type && cand.cards.length === target.cards.length) {
    return cand.primaryRank > target.primaryRank;
  }
  return false;
}

function drawTable() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = 680;
  const height = 430;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Table Felt Background with bright spotlight illumination
  const highlight = props.tableTheme?.highlightColor || '#D97706';
  const felt = props.tableTheme?.feltColor || '#92400E';
  const edge = props.tableTheme?.edgeColor || '#592806';

  const grad = ctx.createRadialGradient(width / 2, height / 2 - 20, 20, width / 2, height / 2, 430);
  grad.addColorStop(0, highlight);
  grad.addColorStop(0.35, felt);
  grad.addColorStop(0.85, edge);
  grad.addColorStop(1, edge);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle luxury table felt inner rim (bright golden/amber pinstripe border)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 0);
  ctx.stroke();

  // Subtle ambient table spotlight ellipse
  const spotGrad = ctx.createRadialGradient(width / 2, height / 2 - 20, 0, width / 2, height / 2 - 20, 260);
  spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
  spotGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
  spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Kitty Cards above Right Player Avatar (East / Seat 2) - No bg, no text, attached to avatar top
  const kittyX = width - 164;
  const kittyY = 44;

  kitty.value.forEach((c, idx) => {
    const kx = kittyX + 6 + idx * 43;
    const ky = kittyY;
    const isFaceDown = gamePhase.value === 'bidding';
    renderPlayingCard(ctx, c, kx, ky, 38, 52, {
      isFaceDown,
      borderRadius: 4,
      shadow: true,
    });
  });

  // Seats (Seat 0: 本家, Seat 1: 西席, Seat 2: 东席)
  const drawSeat = (x: number, y: number, name: string, count: number, status: string, active: boolean, isLand: boolean, isMe = false) => {
    const boxW = isMe ? 76 : 138;
    const boxH = isMe ? 44 : 82;

    ctx.fillStyle = active ? 'rgba(245, 158, 11, 0.35)' : 'rgba(0, 0, 0, 0.25)';
    ctx.strokeStyle = active ? '#FDE047' : 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = active ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(x, y, boxW, boxH, isMe ? 6 : 8);
    ctx.fill();
    ctx.stroke();

    if (isMe) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(name.split('·')[0].trim(), x + 6, y + 14);

      ctx.fillStyle = isLand ? '#EF4444' : '#6EE7B7';
      ctx.font = '700 10px sans-serif';
      ctx.fillText(isLand ? '🔥地主' : '🌾农民', x + 40, y + 14);

      ctx.fillStyle = count <= 2 ? '#EF4444' : '#FDE047';
      ctx.font = '700 10px monospace';
      ctx.fillText(`剩${count}张`, x + 6, y + 30);

      ctx.fillStyle = '#D6C7B2';
      ctx.font = '500 9px sans-serif';
      ctx.fillText(status, x + 40, y + 30);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(name, x + 10, y + 20);

      ctx.fillStyle = isLand ? '#EF4444' : '#6EE7B7';
      ctx.font = '700 12px sans-serif';
      ctx.fillText(isLand ? '🔥 地主' : '🌾 农民同盟', x + 10, y + 40);

      ctx.fillStyle = count <= 2 ? '#EF4444' : '#FDE047';
      ctx.font = '700 12px monospace';
      ctx.fillText(`剩余 ${count} 张 ${count <= 2 ? '⚠️' : ''}`, x + 10, y + 58);

      ctx.fillStyle = '#D6C7B2';
      ctx.font = '500 10px sans-serif';
      ctx.fillText(status, x + 10, y + 73);
    }
  };

  drawSeat(12, 100, '西席 · 云游散人', hands[1]?.length || 0, seatStatus[1], turnSeat.value === 1, landlordSeat.value === 1, false);
  drawSeat(width - 150, 100, '东席 · 醉月居士', hands[2]?.length || 0, seatStatus[2], turnSeat.value === 2, landlordSeat.value === 2, false);
  drawSeat(12, height - 54, '本家 · 尊贵玩家', hands[0]?.length || 0, seatStatus[0], turnSeat.value === 0, landlordSeat.value === 0, true);

  // Active Played Combo
  if (lastCombo.value) {
    const seat = lastCombo.value.seat;
    const list = lastCombo.value.cards;
    const overlap = 28;
    const totalW = 54 + (list.length - 1) * overlap;
    const startY = 96;

    let startX = width / 2 - totalW / 2;
    let textAlign = 'center';
    let textX = width / 2;

    if (seat === 1) {
      startX = 170;
      textAlign = 'left';
      textX = 170;
    } else if (seat === 2) {
      startX = width - 170 - totalW;
      textAlign = 'right';
      textX = width - 170;
    } else {
      startX = width / 2 - totalW / 2;
      textAlign = 'center';
      textX = width / 2;
    }

    list.forEach((c, idx) => {
      const cx = startX + idx * overlap;
      renderPlayingCard(ctx, c, cx, startY, 54, 76, {
        borderRadius: 5,
        shadow: true,
      });
    });

    ctx.fillStyle = '#FDE68A';
    ctx.font = '600 13px sans-serif';
    ctx.textAlign = textAlign;
    const who = seat === 0 ? '本家' : (lastCombo.value.seat === 1 ? '西席' : '东席');
    ctx.fillText(`${who} · ${lastCombo.value.label}`, textX, startY + 76 + 18);
  }

  // Player Hand
  const myHand = hands[0] || [];
  if (myHand.length > 0) {
    const cardW = 68;
    const cardH = 98;
    const step = Math.min(32, (width - 120) / Math.max(1, myHand.length));
    const totalW = cardW + (myHand.length - 1) * step;
    const baseLeft = width / 2 - totalW / 2;
    const baseY = height - 165;

    myHand.forEach((c, idx) => {
      const isSel = selectedIds.has(c.id);
      const x = baseLeft + idx * step;
      const y = isSel ? baseY - 20 : baseY;

      renderPlayingCard(ctx, c, x, y, cardW, cardH, {
        isSelected: isSel,
        borderRadius: 6,
        shadow: true,
      });
    });
  }
}

let dragStartIndex = -1;
let dragCurrentIndex = -1;
let initialSelectedIds = new Set<string>();
let isSelectMode = true;
let pointerStartX = 0;
let pointerStartY = 0;
let dragMovedDistance = 0;
let clickedEmpty = false;

function getCardIndexAtPoint(clientX: number, clientY: number, isDuringDrag = false): number {
  const canvas = canvasRef.value;
  if (!canvas) return -1;
  const { x, y } = getCanvasEventCoords(canvas, clientX, clientY, props.isRotated90);

  const myHand = hands[0] || [];
  if (myHand.length === 0) return -1;

  const cardW = 68;
  const cardH = 98;
  const step = Math.min(32, (680 - 120) / Math.max(1, myHand.length));
  const totalW = cardW + (myHand.length - 1) * step;
  const baseLeft = 680 / 2 - totalW / 2;
  const baseY = 430 - 165;

  if (isDuringDrag) {
    // When actively dragging, provide very generous vertical bounds across the hand area
    if (y < baseY - 120 || y > 430 + 60) return dragCurrentIndex;
    const clampedX = Math.max(baseLeft, Math.min(x, baseLeft + totalW - 1));
    return Math.min(myHand.length - 1, Math.max(0, Math.floor((clampedX - baseLeft) / step)));
  }

  // Generous vertical hit box for initial touch
  if (y < baseY - 40 || y > baseY + cardH + 30) return -1;

  // Horizontal bounds (with 15px padding)
  if (x < baseLeft - 15 || x > baseLeft + totalW + 15) return -1;

  // 1. Precise card hit check from right to left (topmost cards first)
  for (let i = myHand.length - 1; i >= 0; i--) {
    const c = myHand[i];
    const isSel = selectedIds.has(c.id);
    const cx = baseLeft + i * step;
    const cy = isSel ? baseY - 20 : baseY;
    if (x >= cx && x <= cx + cardW && y >= cy - 15 && y <= cy + cardH + 15) {
      return i;
    }
  }

  // 2. Continuous horizontal projection fallback
  const clampedX = Math.max(baseLeft, Math.min(x, baseLeft + totalW - 1));
  return Math.min(myHand.length - 1, Math.max(0, Math.floor((clampedX - baseLeft) / step)));
}

function onPointerDown(e: PointerEvent) {
  if (gamePhase.value !== 'playing') return;
  const canvas = canvasRef.value;
  if (canvas) {
    try {
      (canvas as any)?.setPointerCapture?.(e.pointerId);
    } catch {}
    const coords = getCanvasEventCoords(canvas, e.clientX, e.clientY, props.isRotated90);
    pointerStartX = coords.x;
    pointerStartY = coords.y;
    dragMovedDistance = 0;
  }
  const idx = getCardIndexAtPoint(e.clientX, e.clientY, false);
  if (idx === -1) {
    clickedEmpty = true;
    return;
  }

  clickedEmpty = false;
  const myHand = hands[0] || [];
  const startCard = myHand[idx];
  if (!startCard) return;

  isDragging.value = true;
  dragStartIndex = idx;
  dragCurrentIndex = idx;
  initialSelectedIds = new Set(selectedIds);

  // If the initial card was unselected, sliding will select cards; if selected, sliding toggles/deselects
  isSelectMode = !initialSelectedIds.has(startCard.id);

  if (isSelectMode) {
    selectedIds.add(startCard.id);
  } else {
    selectedIds.delete(startCard.id);
  }

  soundFX.playTap();
  haptics.tap();
  drawTable();
}

function onPointerMove(e: PointerEvent) {
  if (canvasRef.value) {
    const coords = getCanvasEventCoords(canvasRef.value, e.clientX, e.clientY, props.isRotated90);
    dragMovedDistance += Math.hypot(coords.x - pointerStartX, coords.y - pointerStartY);
  }
  if (!isDragging.value || gamePhase.value !== 'playing') return;
  const idx = getCardIndexAtPoint(e.clientX, e.clientY, true);
  if (idx === -1 || idx === dragCurrentIndex) return;

  dragCurrentIndex = idx;
  const myHand = hands[0] || [];
  const minIdx = Math.min(dragStartIndex, dragCurrentIndex);
  const maxIdx = Math.max(dragStartIndex, dragCurrentIndex);

  // Start with clean initial selection state
  const nextSelected = new Set(initialSelectedIds);

  // Apply continuous range selection for every card between start and current index
  for (let i = minIdx; i <= maxIdx; i++) {
    const card = myHand[i];
    if (card) {
      if (isSelectMode) {
        nextSelected.add(card.id);
      } else {
        nextSelected.delete(card.id);
      }
    }
  }

  // Update selectedIds if changed
  let changed = false;
  if (nextSelected.size !== selectedIds.size) {
    changed = true;
  } else {
    for (const id of nextSelected) {
      if (!selectedIds.has(id)) {
        changed = true;
        break;
      }
    }
  }

  if (changed) {
    selectedIds.clear();
    nextSelected.forEach((id) => selectedIds.add(id));
    soundFX.playCardSnap();
    haptics.tap();
    drawTable();
  }
}

function onPointerUp(e: PointerEvent) {
  const canvas = canvasRef.value;
  if (canvas) {
    try {
      (canvas as any)?.releasePointerCapture?.(e.pointerId);
    } catch {}

    const coords = getCanvasEventCoords(canvas, e.clientX, e.clientY, props.isRotated90);

    // Tap on empty table area to deselect all cards
    if (clickedEmpty && dragMovedDistance < 12 && selectedIds.size > 0) {
      selectedIds.clear();
      soundFX.playTap();
      drawTable();
    }

    // Flick upwards gesture: only if predominantly vertical flick up
    const upDist = pointerStartY - coords.y;
    const horizDist = Math.abs(coords.x - pointerStartX);
    if (
      isDragging.value &&
      gamePhase.value === 'playing' &&
      upDist > 45 &&
      upDist > horizDist * 1.5 &&
      selectedIds.size > 0 &&
      turnSeat.value === 0 &&
      winnerSeat.value === null
    ) {
      handlePlay();
    }
  }
  isDragging.value = false;
  dragStartIndex = -1;
  dragCurrentIndex = -1;
  clickedEmpty = false;
}

function getNextSeat(seat: number): number {
  // 逆时针出牌方向：本家 (0, 下方) -> 东席 (2, 右侧) -> 西席 (1, 左侧) -> 本家 (0)
  if (seat === 0) return 2;
  if (seat === 2) return 1;
  return 0;
}

function scheduleBotTurn(seat: number) {
  if (botTurnTimer) clearTimeout(botTurnTimer);
  if (winnerSeat.value !== null || gamePhase.value !== 'playing') return;

  // Humanized AI thinking delay between 550ms and 1100ms
  const thinkingDelay = Math.floor(550 + Math.random() * 550);
  botTurnTimer = setTimeout(() => {
    if (winnerSeat.value !== null || gamePhase.value !== 'playing') return;
    botStep(seat);
  }, thinkingDelay);
}

function handlePlay() {
  errorTip.value = '';
  const chosen = hands[0].filter((c) => selectedIds.has(c.id));
  const combo = evaluateHand(chosen, 0);
  if (!combo) {
    errorTip.value = '不符合规则牌型（单张、对子、三张、三带一/二、顺子、连对、飞机、炸弹、王炸）';
    return;
  }
  if (!canBeat(combo, lastCombo.value)) {
    errorTip.value = '所选牌型小于桌面牌型';
    return;
  }

  const isBomb = combo.type === 'bomb' || combo.type === 'rocket';
  soundFX.playCardSnap(isBomb);
  if (combo.type === 'rocket') {
    haptics.rocket();
  } else if (combo.type === 'bomb') {
    haptics.bomb();
  } else {
    haptics.playCard();
  }
  if (isBomb) multiplier.value *= 2;

  // Trigger 3D special effects
  if (combo.type === 'bomb') emit('fx', 'bomb');
  else if (combo.type === 'rocket') emit('fx', 'rocket');
  else if (combo.type === 'airplane' || combo.type === 'airplane_wings' || combo.type === 'airplane_pairs') emit('fx', 'airplane');
  else if (combo.type === 'straight' || combo.type === 'consecutive_pairs') emit('fx', 'straight');

  hands[0] = hands[0].filter((c) => !selectedIds.has(c.id));
  selectedIds.clear();
  lastCombo.value = combo;
  consecutivePasses.value = 0;
  seatStatus[0] = `出牌：${combo.label}`;

  if (hands[0].length === 0) {
    winnerSeat.value = 0;
    haptics.victory();
    // Check Spring: Landlord played out, Farmers played 0 cards
    if (landlordSeat.value === 0 && hands[1].length === 17 && hands[2].length === 17) {
      isSpring.value = true;
      multiplier.value *= 2;
      soundFX.speakAction('spring');
    } else if (landlordSeat.value !== 0 && hands[landlordSeat.value].length === 20) {
      isAntiSpring.value = true;
      multiplier.value *= 2;
      soundFX.speakAction('anti_spring');
    } else {
      soundFX.speakAction(combo.type === 'rocket' ? 'rocket' : combo.type === 'bomb' ? 'bomb' : combo.type.startsWith('airplane') ? 'airplane' : combo.type === 'straight' ? 'straight' : combo.label);
    }
    soundFX.playVictory();
    emit('fx', 'win');
    emit('move', { seat: 0, combo, winner: 0, multiplier: multiplier.value });
  } else {
    soundFX.speakAction(combo.type === 'rocket' ? 'rocket' : combo.type === 'bomb' ? 'bomb' : combo.type.startsWith('airplane') ? 'airplane' : combo.type === 'straight' ? 'straight' : combo.label);
    const next = getNextSeat(0);
    turnSeat.value = next;
    seatStatus[next] = '思考出牌...';
    emit('move', { seat: 0, combo, winner: null });
    scheduleBotTurn(next);
  }
  updateCardCounter();
  drawTable();
}

function handlePass() {
  if (!lastCombo.value || lastCombo.value.seat === 0) return;
  selectedIds.clear();
  seatStatus[0] = '不出';
  soundFX.speakAction('pass');
  soundFX.playTap();
  consecutivePasses.value++;

  if (consecutivePasses.value >= 2) {
    // 桌面其他两家均不出，上一次出牌者获得新一轮领出权
    const nextLead = lastCombo.value ? lastCombo.value.seat : getNextSeat(0);
    lastCombo.value = null;
    consecutivePasses.value = 0;
    turnSeat.value = nextLead;

    if (nextLead === 0) {
      seatStatus[0] = '该您出牌 (获得领出权)';
      drawTable();
      if (isAutoHost.value) checkAutoHostTurn();
    } else {
      seatStatus[nextLead] = '新一轮领出...';
      drawTable();
      scheduleBotTurn(nextLead);
    }
  } else {
    const next = getNextSeat(0);
    turnSeat.value = next;
    seatStatus[next] = '思考出牌...';
    drawTable();
    scheduleBotTurn(next);
  }
}

/**
 * 遍历并计算当前手牌能压制 target 的所有可行牌型候选（或在领出阶段提供丰富可选开牌组合）
 */
function findBeatingCandidateCombos(hand: Card[], target: Combo | null, seat: number): Card[][] {
  const sortedHand = [...hand].sort((a, b) => a.rank - b.rank);
  const candidates: Card[][] = [];

  // 牌张频次分组
  const rankGroups = new Map<number, Card[]>();
  for (const c of sortedHand) {
    if (!rankGroups.has(c.rank)) rankGroups.set(c.rank, []);
    rankGroups.get(c.rank)!.push(c);
  }

  // 标记炸弹与王炸，避免随意被普通出牌拆散
  const bombRanks = new Set<number>();
  for (const [rk, list] of rankGroups.entries()) {
    if (list.length === 4) bombRanks.add(rk);
  }
  const hasRocket = sortedHand.some((c) => c.rank === 16) && sortedHand.some((c) => c.rank === 17);
  const rocketCards = hasRocket ? [sortedHand.find((c) => c.rank === 16)!, sortedHand.find((c) => c.rank === 17)!] : null;

  // 添加炸弹与王炸到候选列表
  const addBombsAndRocket = (minBombRank = 0) => {
    for (const [rk, list] of rankGroups.entries()) {
      if (list.length === 4 && rk > minBombRank) {
        candidates.push([...list]);
      }
    }
    if (rocketCards && minBombRank < 99) {
      candidates.push([...rocketCards]);
    }
  };

  if (!target || target.seat === seat) {
    // ===== 领出阶段 (Leading Phase) =====
    // 1. 单张（由小到大，优先纯单张，其次拆对）
    for (const [rk, list] of rankGroups.entries()) {
      if (bombRanks.has(rk)) continue;
      if (hasRocket && (rk === 16 || rk === 17)) continue;
      candidates.push([list[0]]);
    }

    // 2. 对子（由小到大，优先纯对子）
    for (const [rk, list] of rankGroups.entries()) {
      if (bombRanks.has(rk)) continue;
      if (list.length >= 2) {
        candidates.push([list[0], list[1]]);
      }
    }

    // 3. 三张 & 三带一 & 三带对
    for (const [rk, list] of rankGroups.entries()) {
      if (bombRanks.has(rk)) continue;
      if (list.length >= 3) {
        candidates.push([list[0], list[1], list[2]]);
        // 带单张
        const kicker = sortedHand.find((c) => c.rank !== rk && !bombRanks.has(c.rank) && (!hasRocket || (c.rank !== 16 && c.rank !== 17)));
        if (kicker) {
          candidates.push([list[0], list[1], list[2], kicker]);
        }
        // 带对子
        const pairKicker = Array.from(rankGroups.entries()).find(([kRk, kList]) => kRk !== rk && !bombRanks.has(kRk) && kList.length >= 2);
        if (pairKicker) {
          candidates.push([list[0], list[1], list[2], pairKicker[1][0], pairKicker[1][1]]);
        }
      }
    }

    // 4. 顺子 (5..12 张)
    const nonBombRanks = Array.from(new Set(sortedHand.filter((c) => c.rank <= 14 && !bombRanks.has(c.rank)).map((c) => c.rank))).sort((a, b) => a - b);
    for (let len = 5; len <= Math.min(12, nonBombRanks.length); len++) {
      for (let s = 0; s <= nonBombRanks.length - len; s++) {
        let isStr = true;
        for (let j = 0; j < len - 1; j++) {
          if (nonBombRanks[s + j + 1] !== nonBombRanks[s + j] + 1) { isStr = false; break; }
        }
        if (isStr) {
          const strCards: Card[] = [];
          for (let j = 0; j < len; j++) {
            const card = sortedHand.find((c) => c.rank === nonBombRanks[s + j]);
            if (card) strCards.push(card);
          }
          if (strCards.length === len) candidates.push(strCards);
        }
      }
    }

    // 5. 连对 (3..6 对)
    const availablePairs = Array.from(rankGroups.entries()).filter(([rk, l]) => !bombRanks.has(rk) && l.length >= 2 && rk <= 14).sort((a, b) => a[0] - b[0]);
    for (let pCount = 3; pCount <= Math.min(6, availablePairs.length); pCount++) {
      for (let s = 0; s <= availablePairs.length - pCount; s++) {
        let isConsec = true;
        for (let j = 0; j < pCount - 1; j++) {
          if (availablePairs[s + j + 1][0] !== availablePairs[s + j][0] + 1) { isConsec = false; break; }
        }
        if (isConsec) {
          const combo: Card[] = [];
          for (let j = 0; j < pCount; j++) {
            combo.push(availablePairs[s + j][1][0], availablePairs[s + j][1][1]);
          }
          candidates.push(combo);
        }
      }
    }

    // 6. 飞机 (两连三) 与飞机带翅膀
    const availableTriples = Array.from(rankGroups.entries()).filter(([rk, l]) => !bombRanks.has(rk) && l.length >= 3 && rk <= 14).sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < availableTriples.length - 1; i++) {
      if (availableTriples[i + 1][0] === availableTriples[i][0] + 1) {
        const apBase = [
          ...availableTriples[i][1].slice(0, 3),
          ...availableTriples[i + 1][1].slice(0, 3),
        ];
        candidates.push(apBase);
        const wings = sortedHand.filter((c) => c.rank !== availableTriples[i][0] && c.rank !== availableTriples[i + 1][0] && !bombRanks.has(c.rank)).slice(0, 2);
        if (wings.length === 2) {
          candidates.push([...apBase, ...wings]);
        }
      }
    }

    // 7. 炸弹与王炸
    addBombsAndRocket();
  } else {
    // ===== 跟牌压牌阶段 (Following / Beating Phase) =====
    const tRank = target.primaryRank;

    if (target.type === 'single') {
      // 1) 纯单张
      for (const [rk, list] of rankGroups.entries()) {
        if (bombRanks.has(rk)) continue;
        if (hasRocket && (rk === 16 || rk === 17)) continue;
        if (list.length === 1 && rk > tRank) {
          candidates.push([list[0]]);
        }
      }
      // 2) 拆对单张
      for (const [rk, list] of rankGroups.entries()) {
        if (bombRanks.has(rk)) continue;
        if (hasRocket && (rk === 16 || rk === 17)) continue;
        if (list.length >= 2 && rk > tRank) {
          candidates.push([list[0]]);
        }
      }
      // 3) 非王炸单张大王/小王
      if (!hasRocket) {
        const jokers = sortedHand.filter((c) => (c.rank === 16 || c.rank === 17) && c.rank > tRank);
        jokers.forEach((j) => candidates.push([j]));
      }
      addBombsAndRocket();
    } else if (target.type === 'pair') {
      // 1) 纯对子
      for (const [rk, list] of rankGroups.entries()) {
        if (bombRanks.has(rk)) continue;
        if (list.length === 2 && rk > tRank) {
          candidates.push([list[0], list[1]]);
        }
      }
      // 2) 拆三张对子
      for (const [rk, list] of rankGroups.entries()) {
        if (bombRanks.has(rk)) continue;
        if (list.length >= 3 && rk > tRank) {
          candidates.push([list[0], list[1]]);
        }
      }
      addBombsAndRocket();
    } else if (target.type === 'triple') {
      for (const [rk, list] of rankGroups.entries()) {
        if (!bombRanks.has(rk) && list.length >= 3 && rk > tRank) {
          candidates.push([list[0], list[1], list[2]]);
        }
      }
      addBombsAndRocket();
    } else if (target.type === 'triple_one') {
      for (const [rk, list] of rankGroups.entries()) {
        if (!bombRanks.has(rk) && list.length >= 3 && rk > tRank) {
          const kickers = sortedHand.filter((c) => c.rank !== rk && !bombRanks.has(c.rank) && (!hasRocket || (c.rank !== 16 && c.rank !== 17)));
          const checkedKickers = new Set<number>();
          for (const k of kickers) {
            if (!checkedKickers.has(k.rank)) {
              checkedKickers.add(k.rank);
              candidates.push([list[0], list[1], list[2], k]);
            }
          }
        }
      }
      addBombsAndRocket();
    } else if (target.type === 'triple_pair' || target.type === 'triple_two') {
      for (const [rk, list] of rankGroups.entries()) {
        if (!bombRanks.has(rk) && list.length >= 3 && rk > tRank) {
          for (const [kRk, kList] of rankGroups.entries()) {
            if (kRk !== rk && !bombRanks.has(kRk) && kList.length >= 2) {
              candidates.push([list[0], list[1], list[2], kList[0], kList[1]]);
            }
          }
        }
      }
      addBombsAndRocket();
    } else if (target.type === 'straight') {
      const len = target.cards.length;
      const validRanks = Array.from(new Set(sortedHand.filter((c) => c.rank <= 14 && !bombRanks.has(c.rank)).map((c) => c.rank))).sort((a, b) => a - b);
      for (let s = 0; s <= validRanks.length - len; s++) {
        let isStr = true;
        for (let j = 0; j < len - 1; j++) {
          if (validRanks[s + j + 1] !== validRanks[s + j] + 1) { isStr = false; break; }
        }
        if (isStr && validRanks[s + len - 1] > tRank) {
          const cards: Card[] = [];
          for (let j = 0; j < len; j++) {
            const card = sortedHand.find((c) => c.rank === validRanks[s + j]);
            if (card) cards.push(card);
          }
          if (cards.length === len) candidates.push(cards);
        }
      }
      addBombsAndRocket();
    } else if (target.type === 'consecutive_pairs') {
      const pCount = target.length || target.cards.length / 2 || 3;
      const availablePairs = Array.from(rankGroups.entries()).filter(([rk, l]) => !bombRanks.has(rk) && l.length >= 2 && rk <= 14).sort((a, b) => a[0] - b[0]);
      for (let s = 0; s <= availablePairs.length - pCount; s++) {
        let isConsec = true;
        for (let j = 0; j < pCount - 1; j++) {
          if (availablePairs[s + j + 1][0] !== availablePairs[s + j][0] + 1) { isConsec = false; break; }
        }
        if (isConsec && availablePairs[s + pCount - 1][0] > tRank) {
          const combo: Card[] = [];
          for (let j = 0; j < pCount; j++) {
            combo.push(availablePairs[s + j][1][0], availablePairs[s + j][1][1]);
          }
          candidates.push(combo);
        }
      }
      addBombsAndRocket();
    } else if (target.type === 'airplane' || target.type === 'airplane_wings' || target.type === 'airplane_pairs') {
      const availableTriples = Array.from(rankGroups.entries()).filter(([rk, l]) => !bombRanks.has(rk) && l.length >= 3 && rk <= 14).sort((a, b) => a[0] - b[0]);
      for (let i = 0; i < availableTriples.length - 1; i++) {
        if (availableTriples[i + 1][0] === availableTriples[i][0] + 1 && availableTriples[i + 1][0] > tRank) {
          const baseTriples = [
            ...availableTriples[i][1].slice(0, 3),
            ...availableTriples[i + 1][1].slice(0, 3),
          ];
          if (target.type === 'airplane') {
            candidates.push(baseTriples);
          } else if (target.type === 'airplane_wings') {
            const wings = sortedHand.filter((c) => c.rank !== availableTriples[i][0] && c.rank !== availableTriples[i + 1][0] && !bombRanks.has(c.rank)).slice(0, 2);
            if (wings.length === 2) {
              candidates.push([...baseTriples, ...wings]);
            }
          } else if (target.type === 'airplane_pairs') {
            const pKickers = Array.from(rankGroups.entries()).filter(([kRk, kL]) => kRk !== availableTriples[i][0] && kRk !== availableTriples[i + 1][0] && !bombRanks.has(kRk) && kL.length >= 2).slice(0, 2);
            if (pKickers.length === 2) {
              candidates.push([...baseTriples, pKickers[0][1][0], pKickers[0][1][1], pKickers[1][1][0], pKickers[1][1][1]]);
            }
          }
        }
      }
      addBombsAndRocket();
    } else if (target.type === 'bomb') {
      addBombsAndRocket(tRank);
    } else if (target.type === 'rocket') {
      // 王炸无人可管
    } else {
      addBombsAndRocket();
    }
  }

  // 去重过滤与合法性校验
  const seen = new Set<string>();
  const uniqueCandidates: Card[][] = [];
  for (const cand of candidates) {
    if (!cand || cand.length === 0) continue;
    const ev = evaluateHand(cand, seat);
    if (!ev || !canBeat(ev, target)) continue;
    const key = cand.map((c) => c.id).sort().join(',');
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCandidates.push(cand);
    }
  }

  return uniqueCandidates;
}

/**
 * 轮到出牌时点击提示：每次点击循环变换不同的可以压制的牌型
 */
function handleHint() {
  errorTip.value = '';
  const target = (lastCombo.value && lastCombo.value.seat !== 0) ? lastCombo.value : null;
  const stateKey = `${target ? `${target.type}-${target.primaryRank}-${target.cards.length}` : 'lead'}-${hands[0].map(c => c.id).join(',')}`;

  if (lastHintKey.value !== stateKey) {
    lastHintKey.value = stateKey;
    cachedHintCombos.value = findBeatingCandidateCombos(hands[0], target, 0);
    hintIndex.value = 0;
  }

  if (cachedHintCombos.value.length === 0) {
    selectedIds.clear();
    errorTip.value = target ? '没有能管得起的牌型，请选择不出' : '暂无推荐出牌组合';
    soundFX.playTap();
    drawTable();
    return;
  }

  const chosenCards = cachedHintCombos.value[hintIndex.value % cachedHintCombos.value.length];
  hintIndex.value = (hintIndex.value + 1) % cachedHintCombos.value.length;
  selectedIds.clear();
  chosenCards.forEach((c) => selectedIds.add(c.id));
  errorTip.value = '';
  soundFX.playTap();
  drawTable();
}

/**
 * 专业级 AI 决策引擎：严谨农民同盟配合、不拆王炸炸弹、地主顶牌、顺畅出清与精准跟牌
 */
function smartChooseBestPlay(seat: number): Card[] | null {
  const bHand = [...hands[seat]].sort((a, b) => a.rank - b.rank);
  const target = lastCombo.value && lastCombo.value.seat !== seat ? lastCombo.value : null;
  const isSeatLandlord = seat === landlordSeat.value;

  // 1. 终局一步绝杀：如果整手牌就是一种合法合规牌型且能管得起，直接一手清空获胜！
  const wholeEv = evaluateHand(bHand, seat);
  if (wholeEv && canBeat(wholeEv, target)) {
    return bHand;
  }

  const allCandidates = findBeatingCandidateCombos(bHand, target, seat);
  if (allCandidates.length === 0) {
    return null; // 管不起
  }

  // 牌张频次与炸弹标记
  const rankGroups = new Map<number, Card[]>();
  for (const c of bHand) {
    if (!rankGroups.has(c.rank)) rankGroups.set(c.rank, []);
    rankGroups.get(c.rank)!.push(c);
  }
  const bombRanks = new Set<number>();
  for (const [rk, list] of rankGroups.entries()) {
    if (list.length === 4) bombRanks.add(rk);
  }
  const hasRocket = bHand.some((c) => c.rank === 16) && bHand.some((c) => c.rank === 17);

  // 区分常规候选牌型与炸弹候选牌型（保护炸弹与王炸不被普通出牌破坏）
  const regularCandidates: Card[][] = [];
  const bombCandidates: Card[][] = [];

  for (const cand of allCandidates) {
    const ev = evaluateHand(cand, seat);
    if (!ev) continue;
    if (ev.type === 'bomb' || ev.type === 'rocket') {
      bombCandidates.push(cand);
    } else {
      const usesBomb = cand.some((c) => bombRanks.has(c.rank));
      const usesRocket = hasRocket && cand.some((c) => c.rank === 16 || c.rank === 17);
      if (!usesBomb && !usesRocket) {
        regularCandidates.push(cand);
      }
    }
  }

  // 若无不拆炸弹的常规牌，降级允许非王炸的常规牌
  if (regularCandidates.length === 0) {
    for (const cand of allCandidates) {
      const ev = evaluateHand(cand, seat);
      if (ev && ev.type !== 'bomb' && ev.type !== 'rocket') {
        if (!hasRocket || !cand.some((c) => c.rank === 16 || c.rank === 17)) {
          regularCandidates.push(cand);
        }
      }
    }
  }

  if (!target) {
    // ===== 主动领出 (Leading Phase) =====
    if (!isSeatLandlord) {
      // 农民默契传牌
      const partnerSeat = [0, 1, 2].find((s) => s !== seat && s !== landlordSeat.value)!;
      const partnerCards = hands[partnerSeat]?.length || 10;
      const landlordCards = hands[landlordSeat.value]?.length || 10;

      // 盟友报单（剩1张），领出最小单张传球助力队友登顶！
      if (partnerCards === 1) {
        const feedSingle = regularCandidates.find((c) => c.length === 1 && c[0].rank <= 10);
        if (feedSingle) return feedSingle;
      }
      // 盟友报双（剩2张），领出小对子传球！
      if (partnerCards === 2) {
        const feedPair = regularCandidates.find((c) => c.length === 2 && c[0].rank === c[1].rank && c[0].rank <= 10);
        if (feedPair) return feedPair;
      }

      // 地主报单（剩1张），严防出小单张！优先出对子或长牌型，若只能出单则放顶出最大单牌
      if (landlordCards === 1) {
        const nonSingle = regularCandidates.find((c) => c.length > 1);
        if (nonSingle) return nonSingle;
        const biggestSingle = regularCandidates.filter((c) => c.length === 1).sort((a, b) => b[0].rank - a[0].rank)[0];
        if (biggestSingle) return biggestSingle;
      }
    }

    // 常规领出优先级：多张连牌（顺子/飞机/连对） -> 三带 -> 小对子 -> 小单张
    const multiCombos = regularCandidates.filter((c) => c.length >= 5).sort((a, b) => b.length - a.length);
    if (multiCombos.length > 0) return multiCombos[0];

    const triplesWithKickers = regularCandidates.filter((c) => c.length === 4 || c.length === 5);
    if (triplesWithKickers.length > 0) return triplesWithKickers[0];

    const smallPairs = regularCandidates.filter((c) => c.length === 2 && c[0].rank === c[1].rank && c[0].rank <= 10);
    if (smallPairs.length > 0) return smallPairs[0];

    const smallSingles = regularCandidates.filter((c) => c.length === 1 && c[0].rank <= 10);
    if (smallSingles.length > 0) return smallSingles[0];

    if (regularCandidates.length > 0) return regularCandidates[0];
    if (bombCandidates.length > 0) return bombCandidates[0];
    return allCandidates[0];
  }

  // ===== 跟牌压牌 (Following Phase) =====
  // 1. 农民同盟防误伤策略：
  if (!isSeatLandlord && target.seat !== landlordSeat.value) {
    const partnerLeft = hands[target.seat]?.length || 10;
    // 盟友快跑完了（剩<=4张），坚决过牌保送！
    if (partnerLeft <= 4) return null;
    // 盟友已经出出大牌（10以上）、顺子、飞机或炸弹，绝对不压盟友！
    if (target.primaryRank >= 10 || target.type === 'straight' || target.type === 'consecutive_pairs' || target.type === 'bomb' || target.type === 'airplane') {
      return null;
    }
    // 盟友出极小单牌或小对子（<=8）且下家是地主，适度接手防止地主白赚出牌
    const mediumTake = regularCandidates.find((c) => c.length === target.cards.length && (evaluateHand(c, seat)?.primaryRank || 0) <= 13);
    if (mediumTake) return mediumTake;
    return null;
  }

  // 2. 对抗地主（或地主对抗农民）：
  const oppCardsLeft = hands[target.seat]?.length || 10;
  const myCardsLeft = bHand.length;
  const isEmergency = oppCardsLeft <= 3 || (isSeatLandlord && oppCardsLeft <= 2) || (target.type === 'bomb');
  const canWinSoon = myCardsLeft <= 4;

  // 常规牌：优先用最小能管起的牌跟牌，不浪费大牌
  if (regularCandidates.length > 0) {
    // 地主报单且出了单牌：地主上家/下家农民放顶（压出最大单牌封杀）
    if (!isSeatLandlord && target.seat === landlordSeat.value && oppCardsLeft === 1 && target.type === 'single') {
      const topSingle = [...regularCandidates].filter((c) => c.length === 1).sort((a, b) => b[0].rank - a[0].rank)[0];
      if (topSingle) return topSingle;
    }

    regularCandidates.sort((a, b) => {
      const evA = evaluateHand(a, seat)?.primaryRank || 0;
      const evB = evaluateHand(b, seat)?.primaryRank || 0;
      return evA - evB;
    });
    return regularCandidates[0];
  }

  // 炸弹使用时机：紧急阻击或自身即将走完
  if (bombCandidates.length > 0) {
    if (isEmergency || canWinSoon || target.primaryRank >= 14) {
      bombCandidates.sort((a, b) => {
        const evA = evaluateHand(a, seat)?.primaryRank || 0;
        const evB = evaluateHand(b, seat)?.primaryRank || 0;
        return evA - evB;
      });
      return bombCandidates[0];
    }
  }

  return null;
}

function botStep(seat: number) {
  if (winnerSeat.value !== null || gamePhase.value !== 'playing') return;

  const bestMove = smartChooseBestPlay(seat);

  if (bestMove && bestMove.length > 0) {
    const cb = evaluateHand(bestMove, seat)!;
    const rmIds = new Set(bestMove.map((c) => c.id));
    hands[seat] = hands[seat].filter((c) => !rmIds.has(c.id));
    lastCombo.value = cb;
    consecutivePasses.value = 0;
    seatStatus[seat] = `出牌：${cb.label}`;

    const isBomb = cb.type === 'bomb' || cb.type === 'rocket';
    if (isBomb) {
      multiplier.value *= 2;
      soundFX.speakVoice(cb.type === 'rocket' ? '至尊王炸！' : '炸弹！');
    }
    soundFX.playCardSnap(isBomb);
    if (cb.type === 'bomb') emit('fx', 'bomb');
    else if (cb.type === 'rocket') emit('fx', 'rocket');
    else if (cb.type === 'airplane' || cb.type === 'airplane_wings' || cb.type === 'airplane_pairs') emit('fx', 'airplane');
    else if (cb.type === 'straight' || cb.type === 'consecutive_pairs') emit('fx', 'straight');

    if (hands[seat].length === 0) {
      winnerSeat.value = seat;
      // Spring detection
      if (seat === landlordSeat.value) {
        const farmer1 = [0, 1, 2].find((s) => s !== landlordSeat.value)!;
        const farmer2 = [0, 1, 2].find((s) => s !== landlordSeat.value && s !== farmer1)!;
        if (hands[farmer1].length === 17 && hands[farmer2].length === 17) {
          isSpring.value = true;
          multiplier.value *= 2;
        }
      } else {
        if (hands[landlordSeat.value].length === 20) {
          isAntiSpring.value = true;
          multiplier.value *= 2;
        }
      }

      soundFX.playVictory();
      emit('move', { seat, combo: cb, winner: seat, multiplier: multiplier.value });
      updateCardCounter();
      drawTable();
      return;
    }

    soundFX.speakAction(cb.type === 'rocket' ? 'rocket' : cb.type === 'bomb' ? 'bomb' : cb.type.startsWith('airplane') ? 'airplane' : cb.type === 'straight' ? 'straight' : cb.label, { isFemale: seat === 1 });
    emit('move', { seat, combo: cb, winner: null });
    const next = getNextSeat(seat);
    turnSeat.value = next;

    if (next === 0) {
      seatStatus[0] = '该您压牌';
      updateCardCounter();
      drawTable();
      if (isAutoHost.value) checkAutoHostTurn();
    } else {
      seatStatus[next] = '思考出牌...';
      updateCardCounter();
      drawTable();
      scheduleBotTurn(next);
    }
  } else {
    // 过牌
    seatStatus[seat] = '不出';
    soundFX.playTap();
    soundFX.speakAction('pass', { isFemale: seat === 1 });
    consecutivePasses.value++;

    if (consecutivePasses.value >= 2) {
      // 桌面其他两家均不出，上家出牌者获得领出权
      const nextLead = lastCombo.value ? lastCombo.value.seat : getNextSeat(seat);
      lastCombo.value = null;
      consecutivePasses.value = 0;
      turnSeat.value = nextLead;

      if (nextLead === 0) {
        seatStatus[0] = '该您出牌 (获得领出权)';
        updateCardCounter();
        drawTable();
        if (isAutoHost.value) checkAutoHostTurn();
      } else {
        seatStatus[nextLead] = '新一轮领出...';
        updateCardCounter();
        drawTable();
        scheduleBotTurn(nextLead);
      }
    } else {
      const next = getNextSeat(seat);
      turnSeat.value = next;

      if (next === 0) {
        seatStatus[0] = lastCombo.value ? '该您压牌' : '该您出牌';
        updateCardCounter();
        drawTable();
        if (isAutoHost.value) checkAutoHostTurn();
      } else {
        seatStatus[next] = '思考出牌...';
        updateCardCounter();
        drawTable();
        scheduleBotTurn(next);
      }
    }
  }
}

function checkAutoHostTurn() {
  if (!isAutoHost.value || turnSeat.value !== 0 || winnerSeat.value !== null || gamePhase.value !== 'playing') return;
  if (autoHostTimer) clearTimeout(autoHostTimer);

  autoHostTimer = setTimeout(() => {
    if (!isAutoHost.value || turnSeat.value !== 0 || winnerSeat.value !== null || gamePhase.value !== 'playing') return;
    const bestMove = smartChooseBestPlay(0);
    if (bestMove && bestMove.length > 0) {
      selectedIds.clear();
      bestMove.forEach((c) => selectedIds.add(c.id));
      drawTable();
      setTimeout(() => {
        handlePlay();
      }, 350);
    } else {
      if (lastCombo.value && lastCombo.value.seat !== 0) {
        handlePass();
      } else {
        handleHint();
        setTimeout(() => {
          handlePlay();
        }, 350);
      }
    }
  }, 650);
}

let cleanupCardLoader: (() => void) | null = null;

onMounted(() => {
  preloadCardAssets();
  cleanupCardLoader = onCardAssetsLoaded(() => {
    drawTable();
  });
  dealNewMatch();
  updateDimensions();
  emitStatus();
  window.addEventListener('resize', updateDimensions);
  if (containerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (cleanupCardLoader) cleanupCardLoader();
  window.removeEventListener('resize', updateDimensions);
  resizeObserver?.disconnect();
  if (autoHostTimer) clearTimeout(autoHostTimer);
  if (botTurnTimer) clearTimeout(botTurnTimer);
});

defineExpose({
  dealNewMatch,
  toggleAutoHost,
  toggleSortMode,
  toggleCardCounter,
});
</script>
