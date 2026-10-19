<template>
  <div
    ref="containerRef"
    class="w-full h-full select-none absolute inset-0 overflow-hidden flex items-center justify-center"
    :style="{
      backgroundColor: props.tableTheme?.feltColor || '#1D4ED8',
      background: `radial-gradient(ellipse at 50% 45%, ${props.tableTheme?.highlightColor || '#3B82F6'} 0%, ${props.tableTheme?.feltColor || '#1D4ED8'} 60%, ${props.tableTheme?.edgeColor || '#1E3A8A'} 100%)`
    }"
  >
    <!-- Fullscreen Card Table Surface with In-Table Action Overlay -->
    <div class="w-full h-full absolute inset-0 overflow-hidden flex items-center justify-center">
      <canvas
        ref="canvasRef"
        @pointerdown="onCanvasPointerDown"
        @pointermove="onCanvasPointerMove"
        @pointerup="onCanvasPointerUp"
        @pointercancel="onCanvasPointerCancel"
        class="w-full h-full absolute inset-0 block cursor-pointer"
      ></canvas>





      <!-- In-Table Floating Strategy & Compare Controls (Left Sidebar) -->
      <div class="absolute bottom-4 left-4 z-20 flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl bg-black/75 border border-white/10 backdrop-blur-xs shadow-xl">
        <button
          type="button"
          @click="handleCompare"
          :disabled="!isSetComplete || isWatering || hasCompared"
          class="w-24 px-2 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:opacity-30 shadow-[0_4px_16px_rgba(59,130,246,0.6)] ring-2 ring-blue-400 transition-all active:scale-95 cursor-pointer"
        >
          ⚔️ 开牌比水
        </button>

        <button
          type="button"
          @click="applyStrategy('solid')"
          class="w-24 px-2 py-1.5 text-xs font-medium rounded-xl bg-[#1C1612] hover:bg-[#2A211B] border border-white/10 text-blue-200 transition-colors cursor-pointer"
        >
          稳健葫芦
        </button>
        <button
          type="button"
          @click="applyStrategy('flush')"
          class="w-24 px-2 py-1.5 text-xs font-medium rounded-xl bg-[#1C1612] hover:bg-[#2A211B] border border-white/10 text-blue-200 transition-colors cursor-pointer"
        >
          同花攻势
        </button>
        <button
          type="button"
          @click="applyStrategy('balanced')"
          class="w-24 px-2 py-1.5 text-xs font-medium rounded-xl bg-[#1C1612] hover:bg-[#2A211B] border border-white/10 text-blue-200 transition-colors cursor-pointer"
        >
          三道均衡
        </button>
        <div class="w-full border-t border-white/10 my-0.5"></div>
        <button
          type="button"
          @click="applyStrategy('optimal')"
          class="w-24 px-2 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all active:scale-95 cursor-pointer"
        >
          ⚡ 一键最优
        </button>
      </div>

      <!-- Gunshot / Grand Slam Animation Overlay -->
      <div
        v-if="showGunshotAnim"
        class="absolute inset-0 bg-black/60 flex items-center justify-center z-30 pointer-events-none animate-pulse"
      >
        <div class="text-center">
          <div class="text-5xl mb-2">💥 🔫 💥</div>
          <div class="text-2xl sm:text-3xl font-extrabold text-amber-400 font-serif-title">
            {{ isGrandSlam ? '【全垒打！通关所有对手 · 水数翻倍！】' : '【连环打枪！全胜对手！】' }}
          </div>
        </div>
      </div>

      <!-- 重新设计的2+2+2六道大牌墩比水界面 (左3道我的牌，右3道滚动显示其他玩家，右侧展示分数与继续/退出按钮) -->
      <div
        v-if="hasCompared"
        class="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-row items-stretch p-2 sm:p-3.5 z-40 overflow-hidden select-none"
      >
        <!-- 左侧及中间：2+2+2 六道大牌墩对决区 (像理牌界面的三道大牌墩，切割为2列×3行) -->
        <div class="flex-1 min-w-0 h-full flex flex-col justify-between pr-2 sm:pr-3">
          <!-- 顶部抬头：左为我的牌墩标识，右为其他玩家滚动切换栏 -->
          <div class="flex items-center justify-between pb-1.5 mb-1 border-b border-white/10 shrink-0">
            <!-- 左侧本家标题 -->
            <div class="flex items-center gap-1.5">
              <span class="text-xs sm:text-sm font-bold text-amber-300 font-serif-title flex items-center gap-1">
                <span>👑</span>
                <span>我的牌墩 (本家三道)</span>
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                13张
              </span>
            </div>

            <!-- 右侧当前对决玩家状态 (改在比水总谱点击切换，不在顶部横幅挤占) -->
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-bold text-blue-300 font-serif-title flex items-center gap-1.5">
                <span>👥</span>
                <span>当前对比玩家:</span>
                <span class="text-xs sm:text-sm font-black text-amber-300">{{ currentOpponentInfo?.name || '对手牌墩' }}</span>
              </span>
              <span
                v-if="currentOpponentInfo"
                :class="currentOpponentInfo.netWater >= 0 ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' : 'bg-red-950/80 text-red-300 border-red-500/50'"
                class="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border"
              >
                {{ currentOpponentInfo.netWater >= 0 ? `+${currentOpponentInfo.netWater}` : currentOpponentInfo.netWater }} 水
              </span>
              <span v-if="currentOpponentInfo?.isShot" class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-400/40 font-bold">
                🔫 被我打枪
              </span>
            </div>
          </div>

          <!-- 2+2+2 六道大牌墩核心区：三行对决 (顶部与置牌框顶部平行，卡牌放大且底部溢出置牌框裁切，间距为牌宽的1/3) -->
          <div class="flex-1 min-h-0 flex flex-col justify-between gap-1.5 sm:gap-2">
            <!-- 1. 第一行 (2道牌墩)：头道对决 (3张 vs 3张 大扑克牌，顶部对齐，底部溢出切割，步长1/4卡牌宽) -->
            <div class="flex-1 min-h-0 grid grid-cols-2 gap-1.5 sm:gap-2">
              <!-- 左墩：我的头道 -->
              <div class="h-full bg-gradient-to-r from-[#231A12]/90 via-[#1B140F]/90 to-[#120E0C]/90 border-2 border-amber-400/80 rounded-xl pl-2 sm:pl-3 pr-1 flex items-start justify-start shadow-xl ring-1 ring-amber-500/30 overflow-hidden relative">
                <div class="relative w-full h-full flex items-start">
                  <div
                    v-for="(c, idx) in frontTier"
                    :key="c.id"
                    :style="{
                      left: `calc(${idx} * 25% * 0.714)`, // 1/4 of card width (aspect ratio 5/7 = 0.714 of height)
                      zIndex: idx + 1
                    }"
                    class="absolute top-0 h-[125%] aspect-[5/7] bg-white rounded-none shadow-[2px_3px_10px_rgba(0,0,0,0.55)] shrink-0 overflow-visible flex items-start justify-center transition-transform hover:-translate-y-1 hover:z-30 cursor-pointer"
                  >
                    <img :src="getCardImagePath(c)" :alt="c.label + c.suit" class="w-full h-full object-contain" />
                  </div>
                </div>
              </div>

              <!-- 右墩：其他玩家头道 -->
              <div class="h-full bg-gradient-to-r from-[#120E0C]/90 via-[#141A28]/90 to-[#0F1420]/90 border-2 border-blue-400/60 rounded-xl pl-2 sm:pl-3 pr-1 flex items-start justify-start shadow-xl overflow-hidden relative">
                <div class="relative w-full h-full flex items-start">
                  <div
                    v-for="(c, idx) in currentOpponentHands.front"
                    :key="c.id"
                    :style="{
                      left: `calc(${idx} * 25% * 0.714)`,
                      zIndex: idx + 1
                    }"
                    class="absolute top-0 h-[125%] aspect-[5/7] bg-white rounded-none shadow-[2px_3px_10px_rgba(0,0,0,0.55)] shrink-0 overflow-visible flex items-start justify-center transition-transform hover:-translate-y-1 hover:z-30 cursor-pointer"
                  >
                    <img :src="getCardImagePath(c)" :alt="c.label + c.suit" class="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. 第二行 (2道牌墩)：中道对决 (5张 vs 5张 大扑克牌，顶部对齐，底部溢出切割，步长1/4卡牌宽) -->
            <div class="flex-1 min-h-0 grid grid-cols-2 gap-1.5 sm:gap-2">
              <!-- 左墩：我的中道 -->
              <div class="h-full bg-gradient-to-r from-[#231A12]/90 via-[#1B140F]/90 to-[#120E0C]/90 border-2 border-amber-400/80 rounded-xl pl-2 sm:pl-3 pr-1 flex items-start justify-start shadow-xl ring-1 ring-amber-500/30 overflow-hidden relative">
                <div class="relative w-full h-full flex items-start">
                  <div
                    v-for="(c, idx) in midTier"
                    :key="c.id"
                    :style="{
                      left: `calc(${idx} * 25% * 0.714)`,
                      zIndex: idx + 1
                    }"
                    class="absolute top-0 h-[125%] aspect-[5/7] bg-white rounded-none shadow-[2px_3px_10px_rgba(0,0,0,0.55)] shrink-0 overflow-visible flex items-start justify-center transition-transform hover:-translate-y-1 hover:z-30 cursor-pointer"
                  >
                    <img :src="getCardImagePath(c)" :alt="c.label + c.suit" class="w-full h-full object-contain" />
                  </div>
                </div>
              </div>

              <!-- 右墩：其他玩家中道 -->
              <div class="h-full bg-gradient-to-r from-[#120E0C]/90 via-[#141A28]/90 to-[#0F1420]/90 border-2 border-blue-400/60 rounded-xl pl-2 sm:pl-3 pr-1 flex items-start justify-start shadow-xl overflow-hidden relative">
                <div class="relative w-full h-full flex items-start">
                  <div
                    v-for="(c, idx) in currentOpponentHands.mid"
                    :key="c.id"
                    :style="{
                      left: `calc(${idx} * 25% * 0.714)`,
                      zIndex: idx + 1
                    }"
                    class="absolute top-0 h-[125%] aspect-[5/7] bg-white rounded-none shadow-[2px_3px_10px_rgba(0,0,0,0.55)] shrink-0 overflow-visible flex items-start justify-center transition-transform hover:-translate-y-1 hover:z-30 cursor-pointer"
                  >
                    <img :src="getCardImagePath(c)" :alt="c.label + c.suit" class="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. 第三行 (2道牌墩)：尾道对决 (5张 vs 5张 大扑克牌，顶部对齐，底部溢出切割，步长1/4卡牌宽) -->
            <div class="flex-1 min-h-0 grid grid-cols-2 gap-1.5 sm:gap-2">
              <!-- 左墩：我的尾道 -->
              <div class="h-full bg-gradient-to-r from-[#231A12]/90 via-[#1B140F]/90 to-[#120E0C]/90 border-2 border-amber-400/80 rounded-xl pl-2 sm:pl-3 pr-1 flex items-start justify-start shadow-xl ring-1 ring-amber-500/30 overflow-hidden relative">
                <div class="relative w-full h-full flex items-start">
                  <div
                    v-for="(c, idx) in backTier"
                    :key="c.id"
                    :style="{
                      left: `calc(${idx} * 25% * 0.714)`,
                      zIndex: idx + 1
                    }"
                    class="absolute top-0 h-[125%] aspect-[5/7] bg-white rounded-none shadow-[2px_3px_10px_rgba(0,0,0,0.55)] shrink-0 overflow-visible flex items-start justify-center transition-transform hover:-translate-y-1 hover:z-30 cursor-pointer"
                  >
                    <img :src="getCardImagePath(c)" :alt="c.label + c.suit" class="w-full h-full object-contain" />
                  </div>
                </div>
              </div>

              <!-- 右墩：其他玩家尾道 -->
              <div class="h-full bg-gradient-to-r from-[#120E0C]/90 via-[#141A28]/90 to-[#0F1420]/90 border-2 border-blue-400/60 rounded-xl pl-2 sm:pl-3 pr-1 flex items-start justify-start shadow-xl overflow-hidden relative">
                <div class="relative w-full h-full flex items-start">
                  <div
                    v-for="(c, idx) in currentOpponentHands.back"
                    :key="c.id"
                    :style="{
                      left: `calc(${idx} * 25% * 0.714)`,
                      zIndex: idx + 1
                    }"
                    class="absolute top-0 h-[125%] aspect-[5/7] bg-white rounded-none shadow-[2px_3px_10px_rgba(0,0,0,0.55)] shrink-0 overflow-visible flex items-start justify-center transition-transform hover:-translate-y-1 hover:z-30 cursor-pointer"
                  >
                    <img :src="getCardImagePath(c)" :alt="c.label + c.suit" class="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：比水总谱、结算分数与继续/退出游戏按钮 -->
        <div class="w-60 sm:w-72 md:w-80 shrink-0 h-full bg-gradient-to-b from-[#1C1613] via-[#14100E] to-[#0A0807] border-2 border-amber-500/50 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.85)] overflow-hidden">
          <!-- 标题与战局胜利状态 -->
          <div class="space-y-1 shrink-0 pb-1.5 border-b border-white/10">
            <div class="flex items-center justify-between">
              <h3 class="text-xs sm:text-sm font-bold text-amber-300 font-serif-title flex items-center gap-1.5">
                <span>⚔️</span>
                <span>比水总谱</span>
              </h3>
              <span
                class="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold font-mono border"
                :class="totalScore >= 0 ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' : 'bg-red-950/80 text-red-300 border-red-500/50'"
              >
                {{ totalScore >= 0 ? '🏆 克敌大捷' : '🍂 稍逊一筹' }}
              </span>
            </div>

            <div v-if="isGrandSlam" class="p-1 rounded-lg bg-gradient-to-r from-amber-600/30 to-red-600/30 border border-amber-500/50 text-[10px] text-amber-300 font-bold flex items-center gap-1 animate-pulse">
              <span>🔥</span>
              <span>全垒打 (Grand Slam) · 水数翻倍！</span>
            </div>
          </div>

          <!-- 本局总水数卡片 (精炼紧凑) -->
          <div class="my-1.5 p-2 rounded-xl bg-gradient-to-br from-[#1C1613] to-[#120E0C] border border-amber-500/40 flex items-center justify-between shadow-lg shrink-0">
            <div>
              <div class="text-[10px] text-[#A89887]">本局总净水</div>
              <div class="text-lg sm:text-xl font-black font-mono tracking-tight" :class="totalScore >= 0 ? 'text-amber-400' : 'text-red-400'">
                {{ totalScore >= 0 ? `+${totalScore}` : totalScore }}
                <span class="text-xs text-amber-200/70 font-sans ml-0.5">水</span>
              </div>
            </div>
            <div class="text-right space-y-0.5">
              <div class="text-xs font-mono font-bold text-amber-300">
                🪙 {{ totalScore >= 0 ? `+${totalScore * 50}` : `${totalScore * 50}` }} 贯
              </div>
              <div class="text-[9px] text-[#8C7A6B]">筹码入账</div>
            </div>
          </div>

          <!-- 比水总谱玩家列表 (点击切换该玩家牌型显示，适配4人和8人场) -->
          <div class="flex-1 min-h-0 flex flex-col my-1 rounded-xl bg-[#120E0C] border border-white/10 overflow-hidden">
            <div class="text-[10px] sm:text-[11px] font-bold text-amber-200/90 px-2.5 py-1.5 bg-[#1B140F] border-b border-white/10 flex items-center justify-between shrink-0">
              <span class="flex items-center gap-1">
                <span>👇</span>
                <span>点击玩家切换牌型 (共{{ opponentsBreakdown.length }}家)</span>
              </span>
              <span class="text-[9px] text-[#8C7A6B] font-mono">输赢水数</span>
            </div>
            <div class="flex-1 min-h-0 overflow-y-auto p-1.5 space-y-1">
              <div
                v-for="(opp, oIdx) in opponentsBreakdown"
                :key="opp.seat"
                @click="scrollToOpponent(oIdx)"
                :class="
                  activeOpponentIdx === oIdx
                    ? 'bg-gradient-to-r from-blue-900/95 via-indigo-950/95 to-blue-900/95 border-blue-400 ring-2 ring-blue-400/80 text-white font-bold shadow-md'
                    : 'bg-[#181310]/90 text-[#D6C7B2] hover:bg-white/10 hover:border-white/20 border-white/5'
                "
                class="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg border transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div class="flex items-center gap-1.5 truncate">
                  <span class="text-xs shrink-0">{{ activeOpponentIdx === oIdx ? '👉' : '👤' }}</span>
                  <span class="truncate font-medium text-[11px] sm:text-xs" :class="activeOpponentIdx === oIdx ? 'text-amber-200 font-black' : ''">
                    {{ opp.name }}
                  </span>
                </div>
                <div class="flex items-center gap-1 shrink-0 ml-1">
                  <span v-if="opp.isShot" class="text-[9px] px-1 py-0.2 rounded bg-amber-500/25 text-amber-300 border border-amber-400/40 font-bold">
                    打枪
                  </span>
                  <span
                    class="font-mono font-bold text-xs"
                    :class="opp.netWater >= 0 ? 'text-emerald-400' : 'text-red-400'"
                  >
                    {{ opp.netWater >= 0 ? `+${opp.netWater}` : opp.netWater }} 水
                  </span>
                  <span
                    v-if="activeOpponentIdx === oIdx"
                    class="text-[9px] px-1 py-0.5 rounded bg-blue-500/40 text-blue-200 border border-blue-400/50 font-bold"
                  >
                    对比中
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部按钮区：退出游戏与继续游戏 -->
          <div class="pt-2 border-t border-white/10 flex flex-col gap-2 shrink-0">
            <button
              type="button"
              @click="emit('exit')"
              class="w-full py-2 px-3 text-xs sm:text-sm font-bold rounded-xl bg-[#26201B] hover:bg-red-950/80 text-[#D6C7B2] hover:text-red-300 border border-white/15 hover:border-red-500/40 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              title="返回茶楼大厅"
            >
              <span>🚪</span>
              <span>退出游戏</span>
            </button>
            <button
              type="button"
              @click="dealNewMatch"
              class="w-full py-2 px-3 text-xs sm:text-sm font-extrabold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 text-white shadow-[0_4px_20px_rgba(59,130,246,0.6)] ring-2 ring-blue-400 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>⚡ 继续游戏 (再战十三水)</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { soundFX } from '../../utils/sound';
import { haptics } from '../../utils/haptics';
import { TableTheme } from '../../utils/theme';
import { getCanvasEventCoords } from '../../utils/canvasCoords';
import { renderPlayingCard, preloadCardAssets, onCardAssetsLoaded, getCardImagePath } from '../../utils/cardAssets';

interface Card {
  id: string;
  rank: number; // 2..14
  suit: '♠' | '♥' | '♣' | '♦';
  label: string;
  isRed: boolean;
}

interface PlayerTiers {
  front: Card[];
  mid: Card[];
  back: Card[];
}

interface HistorySnapshot {
  front: Card[];
  mid: Card[];
  back: Card[];
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  draggedCard: Card | null;
  draggedCards: Card[];
  sourceTier: 'front' | 'mid' | 'back' | null;
  hoverTier: 'front' | 'mid' | 'back' | null;
  hoverCardId: string | null;
  pointerDownCard: Card | null;
  pointerDownTier: 'front' | 'mid' | 'back' | null;
  pointerDownTime: number;
}

const props = defineProps<{
  tableTheme?: TableTheme;
  isRotated90?: boolean;
  sceneMode?: string;
}>();

const emit = defineEmits<{
  (e: 'move', payload: any): void;
  (e: 'restart'): void;
  (e: 'fx', payload: any): void;
  (e: 'exit'): void;
}>();

watch(() => props.tableTheme, () => {
  drawBoard();
});

watch(() => props.sceneMode, () => {
  dealNewMatch();
});

const isEightPlayer = computed(() => {
  return props.sceneMode === 'eight-realtime' || props.sceneMode === 'eight-booking';
});

const isBookingScene = computed(() => {
  return props.sceneMode === 'four-booking' || props.sceneMode === 'eight-booking';
});

const currentSceneLabel = computed(() => {
  if (props.sceneMode === 'eight-realtime') return '八人实时场 · 两副扑克(104张全发)';
  if (props.sceneMode === 'eight-booking') return '八人预约包厢 · 两副扑克(104张全发)';
  if (props.sceneMode === 'four-booking') return '四人预约雅座 · 一副扑克(52张全发)';
  return '四人实时场 · 一副扑克(52张全发)';
});

const containerRef = ref<HTMLDivElement | null>(null);
const tableWidthPx = ref(680);
const tableHeightPx = ref(430);
let resizeObserver: ResizeObserver | null = null;
let rafId: number | null = null;
let cleanupCardLoader: (() => void) | null = null;

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
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => drawBoard());
}

const canvasRef = ref<HTMLCanvasElement | null>(null);
const fullHand = ref<Card[]>([]);
const frontTier = ref<Card[]>([]);
const midTier = ref<Card[]>([]);
const backTier = ref<Card[]>([]);
const selectedIds = ref<Set<string>>(new Set<string>());
const hasCompared = ref(false);
const showGunshotAnim = ref(false);
const isGrandSlam = ref(false);
const totalScore = ref(16);

const frontTierLabel = ref('乌龙');
const midTierLabel = ref('顺子');
const backTierLabel = ref('葫芦');

// History stack for instant Undo
const historyStack = ref<HistorySnapshot[]>([]);

function pushHistory() {
  historyStack.value.push({
    front: [...frontTier.value],
    mid: [...midTier.value],
    back: [...backTier.value],
  });
  if (historyStack.value.length > 25) {
    historyStack.value.shift();
  }
}

function undo() {
  if (historyStack.value.length === 0) return;
  const snapshot = historyStack.value.pop()!;
  frontTier.value = [...snapshot.front];
  midTier.value = [...snapshot.mid];
  backTier.value = [...snapshot.back];
  selectedIds.value.clear();
  updateLabels();
  soundFX.playCardSnap();
  drawBoard();
}

// Map tiers for clean access
const tiersMap = {
  front: frontTier,
  mid: midTier,
  back: backTier,
};

// Drag and drop state
const dragState = ref<DragState>({
  isDragging: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  draggedCard: null,
  draggedCards: [],
  sourceTier: null,
  hoverTier: null,
  hoverCardId: null,
  pointerDownCard: null,
  pointerDownTier: null,
  pointerDownTime: 0,
});

// 3 Opponent Bot Hands and active opponent switcher
const botNames = ['西席 (罗宋巧手)', '北席 (十三飞龙)', '东席 (七星居士)'];
const botHands = ref<PlayerTiers[]>([]);
const opponentsBreakdown = ref<any[]>([]);
const activeOpponentIdx = ref(0);

const currentOpponentHands = computed<PlayerTiers>(() => {
  return botHands.value[activeOpponentIdx.value] || { front: [], mid: [], back: [] };
});

const currentOpponentInfo = computed(() => {
  return opponentsBreakdown.value[activeOpponentIdx.value] || null;
});

function scrollToOpponent(idx: number) {
  if (idx < 0 || idx >= botHands.value.length) return;
  activeOpponentIdx.value = idx;
  soundFX.playTap();
}

function compareTier(myCards: Card[], oppCards: Card[]): { text: string; delta: number } {
  if (!myCards.length || !oppCards.length) return { text: '平 0水', delta: 0 };
  const myScore = calcHandScore(myCards);
  const oppScore = calcHandScore(oppCards);
  if (myScore > oppScore) return { text: '我胜 +1水', delta: 1 };
  if (myScore < oppScore) return { text: '我负 -1水', delta: -1 };
  return { text: '平 0水', delta: 0 };
}

const isSetComplete = computed(() => (frontTier.value.length + midTier.value.length + backTier.value.length) === 13);

// Precise 13-Water watering diagnosis with exact reason and quick-fix target
const wateringDetail = computed(() => {
  if (!isSetComplete.value) {
    return {
      isWater: false,
      reason: '',
      violatingTier: null as 'front' | 'mid' | 'back' | null,
      fixAction: 'none',
      fixLabel: '',
    };
  }

  const fScore = calcHandScore(frontTier.value);
  const mScore = calcHandScore(midTier.value);
  const bScore = calcHandScore(backTier.value);

  if (mScore > bScore) {
    return {
      isWater: true,
      reason: `⚠️ 倒水：中道【${midTierLabel.value}】强于尾道【${backTierLabel.value}】`,
      violatingTier: 'mid' as const,
      fixAction: 'swap_mid_back',
      fixLabel: '点击一键对调中尾道',
    };
  }
  if (fScore > mScore) {
    return {
      isWater: true,
      reason: `⚠️ 倒水：头道【${frontTierLabel.value}】强于中道【${midTierLabel.value}】`,
      violatingTier: 'front' as const,
      fixAction: 'rebalance_front_mid',
      fixLabel: '点击一键平衡头中道',
    };
  }

  return {
    isWater: false,
    reason: '',
    violatingTier: null,
    fixAction: 'none',
    fixLabel: '',
  };
});

const isWatering = computed(() => wateringDetail.value.isWater);

function findCardById(id: string): Card | null {
  for (const c of frontTier.value) if (c.id === id) return c;
  for (const c of midTier.value) if (c.id === id) return c;
  for (const c of backTier.value) if (c.id === id) return c;
  return null;
}

/**
 * Calculates absolute numeric score for ranking any tier (3 cards or 5 cards)
 * Follows authentic 13-Water Chinese Poker rules with full tie-breaking resolution.
 */
function calcHandScore(cards: Card[]): number {
  if (cards.length === 0) return 0;
  const sorted = [...cards].sort((a, b) => b.rank - a.rank);
  const counts = new Map<number, number>();
  for (const c of sorted) counts.set(c.rank, (counts.get(c.rank) || 0) + 1);

  // 5 cards tier (Mid and Back)
  if (cards.length === 5) {
    const isFlush = cards.every((c) => c.suit === cards[0].suit);

    // Straight detection (Standard or Ace-low wheel A-2-3-4-5)
    let isStraight = false;
    let straightHigh = 0;

    let standardStraight = true;
    for (let i = 1; i < 5; i++) {
      if (sorted[i].rank !== sorted[i - 1].rank - 1) {
        standardStraight = false;
        break;
      }
    }
    if (standardStraight) {
      isStraight = true;
      straightHigh = sorted[0].rank;
    } else if (
      sorted[0].rank === 14 &&
      sorted[1].rank === 5 &&
      sorted[2].rank === 4 &&
      sorted[3].rank === 3 &&
      sorted[4].rank === 2
    ) {
      // Ace-low straight wheel: top rank is 5
      isStraight = true;
      straightHigh = 5;
    }

    // 0. Five of a Kind (五同/五条 - 双副扑克牌专属至尊): 10,000,000 + fiveRank * 100
    for (const [rk, cnt] of counts.entries()) {
      if (cnt >= 5) {
        return 10000000 + rk * 100;
      }
    }

    // 1. Straight Flush: 9,000,000 + straightHigh
    if (isFlush && isStraight) return 9000000 + straightHigh;

    // 2. Four of a Kind (铁支): 8,000,000 + quadRank * 100 + kicker
    for (const [rk, cnt] of counts.entries()) {
      if (cnt === 4) {
        const kicker = sorted.find((c) => c.rank !== rk)?.rank || 0;
        return 8000000 + rk * 100 + kicker;
      }
    }

    // 3. Full House (葫芦): 7,000,000 + tripRank * 100 + pairRank
    for (const [rk, cnt] of counts.entries()) {
      if (cnt === 3 && counts.size === 2) {
        const pairRank = Array.from(counts.keys()).find((k) => k !== rk) || 0;
        return 7000000 + rk * 100 + pairRank;
      }
    }

    // 4. Flush (同花): 6,000,000 + weighted sum of all cards
    if (isFlush) {
      return (
        6000000 +
        sorted[0].rank * 10000 +
        sorted[1].rank * 1000 +
        sorted[2].rank * 100 +
        sorted[3].rank * 10 +
        sorted[4].rank
      );
    }

    // 5. Straight (顺子): 5,000,000 + straightHigh
    if (isStraight) return 5000000 + straightHigh;

    // 6. Three of a Kind (三条): 4,000,000 + tripRank * 100 + kickers
    for (const [rk, cnt] of counts.entries()) {
      if (cnt === 3) {
        const kickers = sorted.filter((c) => c.rank !== rk);
        return 4000000 + rk * 100 + (kickers[0]?.rank || 0) * 10 + (kickers[1]?.rank || 0);
      }
    }

    // 7. Two Pair (两对): 3,000,000 + highPair * 1000 + lowPair * 50 + kicker
    if (counts.size === 3) {
      const pairs: number[] = [];
      let kicker = 0;
      for (const [rk, cnt] of counts.entries()) {
        if (cnt === 2) pairs.push(rk);
        else kicker = rk;
      }
      pairs.sort((a, b) => b - a);
      return 3000000 + pairs[0] * 1000 + pairs[1] * 50 + kicker;
    }

    // 8. One Pair (对子): 2,000,000 + pairRank * 1000 + kickers
    if (counts.size === 4) {
      for (const [rk, cnt] of counts.entries()) {
        if (cnt === 2) {
          const kickers = sorted.filter((c) => c.rank !== rk);
          return (
            2000000 +
            rk * 1000 +
            (kickers[0]?.rank || 0) * 50 +
            (kickers[1]?.rank || 0) * 5 +
            (kickers[2]?.rank || 0)
          );
        }
      }
    }

    // 9. High card (乌龙): 1,000,000 + weighted sum
    return (
      1000000 +
      sorted[0].rank * 10000 +
      sorted[1].rank * 1000 +
      sorted[2].rank * 100 +
      sorted[3].rank * 10 +
      sorted[4].rank
    );
  } else {
    // 3 cards (Front Tier)
    for (const [rk, cnt] of counts.entries()) {
      if (cnt === 3) return 4000000 + rk * 100; // Three of kind in front
      if (cnt === 2) {
        const kicker = sorted.find((c) => c.rank !== rk)?.rank || 0;
        return 2000000 + rk * 1000 + kicker;
      }
    }
    return 1000000 + sorted[0].rank * 1000 + (sorted[1]?.rank || 0) * 50 + (sorted[2]?.rank || 0);
  }
}

function getHandLabel(cards: Card[]): string {
  if (cards.length === 0) return '空';
  const score = calcHandScore(cards);
  if (score >= 10000000) return '五同(五条)';
  if (score >= 9000000) return '同花顺';
  if (score >= 8000000) return '铁支(四条)';
  if (score >= 7000000) return '葫芦';
  if (score >= 6000000) return '同花';
  if (score >= 5000000) return '顺子';
  if (score >= 4000000) return cards.length === 3 ? '冲头三条' : '三条';
  if (score >= 3000000) return '两对';
  if (score >= 2000000) return cards.length === 3 ? '头道对子' : '对子';
  return '乌龙(高牌)';
}

const SUITS: { suit: '♠' | '♥' | '♣' | '♦'; isRed: boolean }[] = [
  { suit: '♠', isRed: false },
  { suit: '♥', isRed: true },
  { suit: '♣', isRed: false },
  { suit: '♦', isRed: true },
];

const RANKS = [
  { rank: 2, label: '2' }, { rank: 3, label: '3' }, { rank: 4, label: '4' },
  { rank: 5, label: '5' }, { rank: 6, label: '6' }, { rank: 7, label: '7' },
  { rank: 8, label: '8' }, { rank: 9, label: '9' }, { rank: 10, label: '10' },
  { rank: 11, label: 'J' }, { rank: 12, label: 'Q' }, { rank: 13, label: 'K' },
  { rank: 14, label: 'A' },
];

function createDecks(deckCount: number): Card[] {
  const pool: Card[] = [];
  for (let d = 0; d < deckCount; d++) {
    for (const r of RANKS) {
      for (const s of SUITS) {
        pool.push({
          id: `${r.label}-${s.suit}-${d}`,
          rank: r.rank,
          suit: s.suit,
          label: r.label,
          isRed: s.isRed,
        });
      }
    }
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function partitionHandLegally(cards13: Card[]): PlayerTiers {
  const sorted = [...cards13].sort((a, b) => b.rank - a.rank);

  // Group by rank
  const rankBuckets = new Map<number, Card[]>();
  sorted.forEach((c) => {
    if (!rankBuckets.has(c.rank)) rankBuckets.set(c.rank, []);
    rankBuckets.get(c.rank)!.push(c);
  });

  // Group by suit
  const suitBuckets = new Map<string, Card[]>();
  sorted.forEach((c) => {
    if (!suitBuckets.has(c.suit)) suitBuckets.set(c.suit, []);
    suitBuckets.get(c.suit)!.push(c);
  });

  const fives = Array.from(rankBuckets.values()).filter((l) => l.length >= 5);
  const quads = Array.from(rankBuckets.values()).filter((l) => l.length === 4);
  const triples = Array.from(rankBuckets.values()).filter((l) => l.length >= 3);
  const pairs = Array.from(rankBuckets.values()).filter((l) => l.length >= 2);
  const flushes = Array.from(suitBuckets.values()).filter((l) => l.length >= 5);

  const candidates: { tiers: PlayerTiers; totalPower: number }[] = [];

  function evaluateCandidate(b: Card[], m: Card[], f: Card[]) {
    if (b.length !== 5 || m.length !== 5 || f.length !== 3) return;
    const bScore = calcHandScore(b);
    const mScore = calcHandScore(m);
    const fScore = calcHandScore(f);
    if (bScore >= mScore && mScore >= fScore) {
      const power = bScore * 1.5 + mScore * 1.3 + fScore * 1.0;
      candidates.push({ tiers: { back: b, mid: m, front: f }, totalPower: power });
    }
  }

  // Candidate 0: Five of a Kind in Back (五同/五条 - 双副牌专属)
  if (fives.length >= 1) {
    const back = fives[0].slice(0, 5);
    const remain = sorted.filter((c) => !back.some((x) => x.id === c.id));
    const mid = remain.slice(0, 5);
    const front = remain.slice(5, 8);
    evaluateCandidate(back, mid, front);
  }

  // Candidate 1: Quad in Back (铁支)
  if (quads.length >= 1) {
    const kicker = sorted.find((c) => c.rank !== quads[0][0].rank)!;
    const back = [...quads[0], kicker];
    const remain = sorted.filter((c) => !back.some((x) => x.id === c.id));
    const mid = remain.slice(0, 5);
    const front = remain.slice(5, 8);
    evaluateCandidate(back, mid, front);
  }

  // Candidate 2: Full House in Back (葫芦)
  if (triples.length >= 1 && pairs.length >= 2) {
    const trip = triples[0].slice(0, 3);
    const pairK = pairs.find((p) => p[0].rank !== trip[0].rank)!.slice(0, 2);
    const back = [...trip, ...pairK];
    const remain = sorted.filter((c) => !back.some((x) => x.id === c.id));

    const remainPairs = pairs.filter((p) => p[0].rank !== trip[0].rank && p[0].rank !== pairK[0].rank);

    if (remainPairs.length >= 2) {
      const midTwoPair = [
        ...remainPairs[0].slice(0, 2),
        ...remainPairs[1].slice(0, 2),
        remain.find((c) => c.rank !== remainPairs[0][0].rank && c.rank !== remainPairs[1][0].rank)!,
      ];
      const front = remain.filter((c) => !midTwoPair.some((x) => x.id === c.id)).slice(0, 3);
      evaluateCandidate(back, midTwoPair, front);
    } else if (remainPairs.length === 1) {
      const p = remainPairs[0].slice(0, 2);
      const kickers = remain.filter((c) => !p.some((x) => x.id === c.id)).slice(0, 3);
      const mid = [...p, ...kickers];
      const front = remain.filter((c) => !mid.some((x) => x.id === c.id)).slice(0, 3);
      evaluateCandidate(back, mid, front);
    }
  }

  // Candidate 3: Flush in Back (同花)
  if (flushes.length >= 1) {
    const back = flushes[0].slice(0, 5);
    const remain = sorted.filter((c) => !back.some((x) => x.id === c.id));
    const mid = remain.slice(0, 5);
    const front = remain.slice(5, 8);
    evaluateCandidate(back, mid, front);
  }

  // Candidate 4: Balanced
  {
    const b = sorted.slice(0, 5);
    const m = sorted.slice(5, 10);
    const f = sorted.slice(10, 13);
    evaluateCandidate(b, m, f);
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.totalPower - a.totalPower);
    return candidates[0].tiers;
  }

  // Fallback
  let b = sorted.slice(0, 5);
  let m = sorted.slice(5, 10);
  let f = sorted.slice(10, 13);
  let bScore = calcHandScore(b);
  let mScore = calcHandScore(m);
  let fScore = calcHandScore(f);

  if (mScore > bScore) {
    [b, m] = [m, b];
    [bScore, mScore] = [mScore, bScore];
  }
  if (fScore > mScore) {
    const combined = [...m, ...f].sort((x, y) => y.rank - x.rank);
    m = combined.slice(0, 5);
    f = combined.slice(5, 8);
  }

  return { back: b, mid: m, front: f };
}

function dealNewMatch() {
  const deckCount = isEightPlayer.value ? 2 : 1;
  const oppCount = isEightPlayer.value ? 7 : 3;
  const deck = createDecks(deckCount);
  fullHand.value = deck.slice(0, 13);

  // Opponents (3 bots for 4-player, 7 bots for 8-player)
  const opps: PlayerTiers[] = [];
  for (let i = 0; i < oppCount; i++) {
    opps.push(partitionHandLegally(deck.slice(13 + i * 13, 13 + (i + 1) * 13)));
  }
  botHands.value = opps;
  activeOpponentIdx.value = 0;

  selectedIds.value.clear();
  historyStack.value = [];
  hasCompared.value = false;
  showGunshotAnim.value = false;
  applyStrategy('optimal', false);
  emit('restart');
}

function applyStrategy(strat: 'optimal' | 'solid' | 'flush' | 'balanced', recordHistory = true) {
  if (recordHistory) pushHistory();
  const sorted = [...fullHand.value].sort((a, b) => b.rank - a.rank);

  const rankBuckets = new Map<number, Card[]>();
  sorted.forEach((c) => {
    if (!rankBuckets.has(c.rank)) rankBuckets.set(c.rank, []);
    rankBuckets.get(c.rank)!.push(c);
  });

  const triples = Array.from(rankBuckets.values()).filter((list) => list.length >= 3);
  const pairs = Array.from(rankBuckets.values()).filter((list) => list.length === 2);

  if (strat === 'solid' && triples.length >= 1 && pairs.length >= 1) {
    const trip = triples[0].slice(0, 3);
    const p1 = pairs[0].slice(0, 2);
    backTier.value = [...trip, ...p1];
    const remain = sorted.filter((c) => !backTier.value.some((x) => x.id === c.id));
    midTier.value = remain.slice(0, 5);
    frontTier.value = remain.slice(5, 8);
  } else if (strat === 'flush') {
    const suitBuckets = new Map<string, Card[]>();
    sorted.forEach((c) => {
      if (!suitBuckets.has(c.suit)) suitBuckets.set(c.suit, []);
      suitBuckets.get(c.suit)!.push(c);
    });
    const flushSuit = Array.from(suitBuckets.values()).find((list) => list.length >= 5);
    if (flushSuit) {
      backTier.value = flushSuit.slice(0, 5);
      const remain = sorted.filter((c) => !backTier.value.some((x) => x.id === c.id));
      midTier.value = remain.slice(0, 5);
      frontTier.value = remain.slice(5, 8);
    } else {
      backTier.value = sorted.slice(0, 5);
      midTier.value = sorted.slice(5, 10);
      frontTier.value = sorted.slice(10, 13);
    }
  } else {
    // Optimal / Balanced
    const partitioned = partitionHandLegally(sorted);
    frontTier.value = partitioned.front;
    midTier.value = partitioned.mid;
    backTier.value = partitioned.back;
  }

  // Auto-Fix Watering (一键防倒水)
  let bScore = calcHandScore(backTier.value);
  let mScore = calcHandScore(midTier.value);
  if (bScore < mScore) {
    const tmp = backTier.value;
    backTier.value = midTier.value;
    midTier.value = tmp;
    bScore = calcHandScore(backTier.value);
    mScore = calcHandScore(midTier.value);
  }

  let fScore = calcHandScore(frontTier.value);
  if (mScore < fScore) {
    const pool = [...midTier.value, ...frontTier.value].sort((a, b) => b.rank - a.rank);
    midTier.value = pool.slice(0, 5);
    frontTier.value = pool.slice(5, 8);
  }

  updateLabels();
  soundFX.playCardSnap();
  drawBoard();
}

function updateLabels() {
  frontTierLabel.value = getHandLabel(frontTier.value);
  midTierLabel.value = getHandLabel(midTier.value);
  backTierLabel.value = getHandLabel(backTier.value);
}

/**
 * Whole Tier Swap: Fast swap between Mid and Back (5 cards vs 5 cards)
 */
function swapTiers(tierA: 'front' | 'mid' | 'back', tierB: 'front' | 'mid' | 'back') {
  if (tierA === tierB) return;
  pushHistory();

  if ((tierA === 'mid' && tierB === 'back') || (tierA === 'back' && tierB === 'mid')) {
    const tmp = [...midTier.value];
    midTier.value = [...backTier.value];
    backTier.value = tmp;
  } else {
    // Front vs Mid or Front vs Back: balance pool
    const otherTier = tierA === 'front' ? tierB : tierA;
    const pool = [...frontTier.value, ...tiersMap[otherTier].value].sort((a, b) => b.rank - a.rank);
    if (otherTier === 'mid') {
      midTier.value = pool.slice(0, 5);
      frontTier.value = pool.slice(5, 8);
    } else {
      backTier.value = pool.slice(0, 5);
      frontTier.value = pool.slice(5, 8);
    }
  }

  selectedIds.value.clear();
  soundFX.playCardSnap();
  updateLabels();
  drawBoard();
}

/**
 * Sorts single tier descending by rank
 */
function sortTier(tierName: 'front' | 'mid' | 'back') {
  pushHistory();
  tiersMap[tierName].value.sort((a, b) => b.rank - a.rank);
  soundFX.playCardSnap();
  updateLabels();
  drawBoard();
}

/**
 * One-click intelligent anti-watering auto balance
 */
function autoFixWatering() {
  pushHistory();
  const detail = wateringDetail.value;
  if (detail.fixAction === 'swap_mid_back') {
    const tmp = [...midTier.value];
    midTier.value = [...backTier.value];
    backTier.value = tmp;
  } else if (detail.fixAction === 'rebalance_front_mid') {
    const pool = [...midTier.value, ...frontTier.value].sort((a, b) => b.rank - a.rank);
    midTier.value = pool.slice(0, 5);
    frontTier.value = pool.slice(5, 8);
    if (calcHandScore(midTier.value) > calcHandScore(backTier.value)) {
      const tmp = [...midTier.value];
      midTier.value = [...backTier.value];
      backTier.value = tmp;
    }
  } else {
    applyStrategy('optimal', false);
  }

  updateLabels();
  soundFX.playCardSnap();
  drawBoard();
}

/**
 * Precision 1-to-1 card swap between two tiers or reordering within the same tier
 */
function swapCardsDirectly(
  cardA: Card,
  fromTierA: 'front' | 'mid' | 'back',
  cardB: Card,
  fromTierB: 'front' | 'mid' | 'back'
) {
  pushHistory();
  const listA = tiersMap[fromTierA].value;
  const listB = tiersMap[fromTierB].value;

  const idxA = listA.findIndex((c) => c.id === cardA.id);
  const idxB = listB.findIndex((c) => c.id === cardB.id);

  if (fromTierA === fromTierB) {
    if (idxA !== -1 && idxB !== -1) {
      const tmp = listA[idxA];
      listA[idxA] = listA[idxB];
      listA[idxB] = tmp;
    }
  } else {
    if (idxA !== -1 && idxB !== -1) {
      listA[idxA] = cardB;
      listB[idxB] = cardA;
    }
  }

  selectedIds.value.clear();
  updateLabels();
  soundFX.playCardSnap();
  haptics.playCard();
  drawBoard();
}

/**
 * Reorders cards in the same tier by dragging one card and inserting near another
 */
function reorderCardInTier(tierName: 'front' | 'mid' | 'back', cardId: string, targetCardId: string) {
  const list = [...tiersMap[tierName].value];
  const fromIdx = list.findIndex((c) => c.id === cardId);
  const toIdx = list.findIndex((c) => c.id === targetCardId);
  if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
    pushHistory();
    const [card] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, card);
    tiersMap[tierName].value = list;
    soundFX.playCardSnap();
    haptics.playCard();
    updateLabels();
    drawBoard();
  }
}

/**
 * Moves currently selected cards to target tier with intelligent capacity balance
 */
function moveSelectedCardsTo(targetTierName: 'front' | 'mid' | 'back', preferredSwapCardId?: string) {
  if (selectedIds.value.size === 0) return;

  const maxCapacity: Record<'front' | 'mid' | 'back', number> = {
    front: 3,
    mid: 5,
    back: 5,
  };

  const movingCards: { card: Card; fromTier: 'front' | 'mid' | 'back' }[] = [];
  (['front', 'mid', 'back'] as const).forEach((t) => {
    if (t !== targetTierName) {
      tiersMap[t].value.forEach((c) => {
        if (selectedIds.value.has(c.id)) {
          movingCards.push({ card: c, fromTier: t });
        }
      });
    }
  });

  if (movingCards.length === 0) {
    selectedIds.value.clear();
    drawBoard();
    return;
  }

  // If exactly 1 card selected and user clicked a specific target card -> direct 1-to-1 swap!
  if (movingCards.length === 1 && preferredSwapCardId) {
    const targetCard = tiersMap[targetTierName].value.find((c) => c.id === preferredSwapCardId);
    if (targetCard) {
      swapCardsDirectly(movingCards[0].card, movingCards[0].fromTier, targetCard, targetTierName);
      return;
    }
  }

  pushHistory();

  const currentFront = [...frontTier.value];
  const currentMid = [...midTier.value];
  const currentBack = [...backTier.value];

  const tiers: Record<'front' | 'mid' | 'back', Card[]> = {
    front: currentFront,
    mid: currentMid,
    back: currentBack,
  };

  for (const { card, fromTier } of movingCards) {
    const targetArr = tiers[targetTierName];
    const sourceArr = tiers[fromTier];

    const srcIdx = sourceArr.findIndex((c) => c.id === card.id);
    if (srcIdx !== -1) {
      sourceArr.splice(srcIdx, 1);
    }
    targetArr.push(card);

    if (targetArr.length > maxCapacity[targetTierName]) {
      let swapIdx = targetArr.findIndex((c) => !selectedIds.value.has(c.id));
      if (swapIdx === -1) swapIdx = 0;
      const swapCard = targetArr.splice(swapIdx, 1)[0];
      sourceArr.push(swapCard);
    }
  }

  frontTier.value = currentFront;
  midTier.value = currentMid;
  backTier.value = currentBack;

  selectedIds.value.clear();
  soundFX.playCardSnap();
  updateLabels();
  drawBoard();
}

function drawBoard() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = tableWidthPx.value;
  const height = tableHeightPx.value;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Background with luxury sapphire table felt gradient
  const highlight = props.tableTheme?.highlightColor || '#3B82F6';
  const felt = props.tableTheme?.feltColor || '#1D4ED8';
  const edge = props.tableTheme?.edgeColor || '#1E3A8A';

  const grad = ctx.createRadialGradient(width / 2, height / 2 - 20, 20, width / 2, height / 2, Math.max(width, height));
  grad.addColorStop(0, highlight);
  grad.addColorStop(0.35, felt);
  grad.addColorStop(0.85, edge);
  grad.addColorStop(1, edge);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle luxury table felt inner rim
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 0);
  ctx.stroke();

  // Ambient spotlight
  const spotGrad = ctx.createRadialGradient(width / 2, height / 2 - 20, 0, width / 2, height / 2 - 20, Math.min(width, height) / 1.5);
  spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
  spotGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
  spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Top In-Canvas HUD Controls: Undo & Watering Warning
  // 1. Undo Button
  if (historyStack.value.length > 0) {
    const undoW = 76;
    const undoH = 22;
    const undoX = width - undoW - 12;
    const undoY = 8;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(undoX, undoY, undoW, undoH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`↶ 撤销 (${historyStack.value.length})`, undoX + undoW / 2, undoY + undoH / 2);
    ctx.restore();
  }

  // 2. Watering Diagnosis Banner (interactive click-to-fix)
  if (isWatering.value) {
    const bannerX = 120;
    const bannerY = 7;
    const bannerW = Math.max(200, width - 120 - 95);
    const bannerH = 24;
    ctx.save();
    ctx.fillStyle = 'rgba(185, 28, 28, 0.85)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(wateringDetail.value.reason, bannerX + 8, bannerY + bannerH / 2);

    // Click to fix badge
    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`⚡ ${wateringDetail.value.fixLabel}`, bannerX + bannerW - 8, bannerY + bannerH / 2);
    ctx.restore();
  }

  // Draw 3 Tiers Slots
  const drawTierSlot = (
    y: number,
    title: string,
    cards: Card[],
    maxCount: number,
    label: string,
    slotName: 'front' | 'mid' | 'back'
  ) => {
    const isHovered = dragState.value.isDragging && dragState.value.hoverTier === slotName;
    const hasSelection = selectedIds.value.size > 0;
    const hasCardsFromOtherTier = Array.from(selectedIds.value).some((id) => !cards.some((c) => c.id === id));
    const canAcceptMoving = hasSelection && hasCardsFromOtherTier;
    const isViolating = isWatering.value && wateringDetail.value.violatingTier === slotName;

    // Slot surface
    ctx.save();
    if (isHovered) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      ctx.shadowBlur = 10;
    } else if (canAcceptMoving) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
    } else if (isViolating) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 1;
    }

    ctx.beginPath();
    ctx.roundRect(120, y, width - 132, 118, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Title & count
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    const titleText = `${title} (${cards.length}/${maxCount})`;
    ctx.fillText(titleText, width - 24, y + 22);

    // Hand label or move indicator
    ctx.font = '600 11px sans-serif';
    if (canAcceptMoving) {
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(`👉 点击换入[${title}] (${selectedIds.value.size}张)`, width - 24, y + 40);
    } else {
      ctx.fillStyle = isViolating ? '#F87171' : '#6EE7B7';
      ctx.fillText(`【${label}】`, width - 24, y + 40);
    }

    // In-Canvas quick tier action buttons (Swap/Sort)
    if (slotName === 'mid' || slotName === 'back') {
      const btnW = 86;
      const btnH = 20;
      const btnX = width - btnW - 24;
      const btnY = y + 50;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#93C5FD';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(slotName === 'mid' ? '🔄 中尾对调' : '🔄 尾中对调', btnX + btnW / 2, btnY + btnH / 2);
      ctx.restore();
    } else if (slotName === 'front') {
      const btnW = 60;
      const btnH = 20;
      const btnX = width - btnW - 24;
      const btnY = y + 50;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#93C5FD';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('↕ 排序', btnX + btnW / 2, btnY + btnH / 2);
      ctx.restore();
    }

    // Stacked cards rendering
    const cardW = 62;
    const cardH = 96;
    const startX = 130;
    const slotAreaWidth = width - 132;
    const denom = Math.max(maxCount - 1, 1);
    const overlap = Math.min(50, (slotAreaWidth - startX - cardW) / denom);

    for (let i = 0; i < Math.max(cards.length, maxCount); i++) {
      const cx = startX + i * overlap;
      const c = cards[i];

      if (c) {
        const isSel = selectedIds.value.has(c.id);
        const isHoverTarget =
          dragState.value.isDragging &&
          dragState.value.hoverCardId === c.id &&
          dragState.value.draggedCard?.id !== c.id;
        const isBeingDragged =
          dragState.value.isDragging && dragState.value.draggedCard?.id === c.id;

        const cy = y + (isSel ? 2 : 12);

        if (isBeingDragged) {
          // Render placeholder in the original slot
          ctx.save();
          ctx.globalAlpha = 0.35;
          renderPlayingCard(ctx, c, cx, cy, cardW, cardH, {
            isSelected: false,
            borderRadius: 4,
            shadow: false,
            borderColor: 'rgba(255, 255, 255, 0.4)',
            borderWidth: 1,
          });
          ctx.restore();
        } else {
          renderPlayingCard(ctx, c, cx, cy, cardW, cardH, {
            isSelected: isSel,
            borderRadius: 4,
            shadow: true,
            borderColor: isHoverTarget ? '#FBBF24' : (isSel ? '#EF4444' : undefined),
            borderWidth: isHoverTarget ? 3.5 : (isSel ? 3.5 : 1),
          });

          // Selected card visual indicators
          if (isSel) {
            ctx.save();
            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 3.5;
            ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(cx, cy, cardW, cardH, 4);
            ctx.stroke();

            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.arc(cx + cardW - 8, cy + 8, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Target swap highlight icon
          if (isHoverTarget) {
            ctx.save();
            ctx.fillStyle = '#F59E0B';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 6;
            ctx.fillText('⇄', cx + cardW / 2, cy + cardH / 2);
            ctx.restore();
          }
        }
      } else {
        const cy = y + 12;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cardW, cardH, 4);
        ctx.fill();
        ctx.stroke();
      }
    }
  };

  drawTierSlot(40, '头道', frontTier.value, 3, frontTierLabel.value, 'front');
  drawTierSlot(165, '中道', midTier.value, 5, midTierLabel.value, 'mid');
  drawTierSlot(290, '尾道', backTier.value, 5, backTierLabel.value, 'back');

  // Floating Dragged Card(s) Rendering
  if (dragState.value.isDragging && dragState.value.draggedCard) {
    const cardW = 62;
    const cardH = 96;
    const fx = dragState.value.currentX - cardW / 2;
    const fy = dragState.value.currentY - cardH / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;

    // Slight dynamic rotation for natural card physics
    ctx.translate(fx + cardW / 2, fy + cardH / 2);
    ctx.rotate(0.04);
    ctx.translate(-(fx + cardW / 2), -(fy + cardH / 2));

    renderPlayingCard(ctx, dragState.value.draggedCard, fx, fy, cardW, cardH, {
      isSelected: true,
      shadow: true,
      borderRadius: 4,
      borderColor: '#F59E0B',
      borderWidth: 3,
    });
    ctx.restore();
  }
}

function onCanvasPointerDown(e: PointerEvent) {
  if (hasCompared.value) return;
  const canvas = canvasRef.value;
  if (!canvas) return;

  try {
    canvas.setPointerCapture(e.pointerId);
  } catch {}

  const width = tableWidthPx.value;
  const height = tableHeightPx.value;
  const { x, y } = getCanvasEventCoords(canvas, e.clientX, e.clientY, props.isRotated90, width, height);

  // 1. Undo Button Tap
  if (historyStack.value.length > 0) {
    const undoW = 76;
    const undoH = 22;
    const undoX = width - undoW - 12;
    const undoY = 8;
    if (x >= undoX && x <= undoX + undoW && y >= undoY && y <= undoY + undoH) {
      undo();
      return;
    }
  }

  // 2. Watering Diagnosis Banner Tap (Click to Fix)
  if (isWatering.value) {
    const bannerX = 120;
    const bannerY = 7;
    const bannerW = Math.max(200, width - 120 - 95);
    const bannerH = 24;
    if (x >= bannerX && x <= bannerX + bannerW && y >= bannerY && y <= bannerY + bannerH) {
      autoFixWatering();
      return;
    }
  }

  // 3. Quick Action Buttons on Tiers
  // Front sort button
  if (x >= width - 84 && x <= width - 24 && y >= 40 + 50 && y <= 40 + 70) {
    sortTier('front');
    return;
  }
  // Mid swap with back button
  if (x >= width - 110 && x <= width - 24 && y >= 165 + 50 && y <= 165 + 70) {
    swapTiers('mid', 'back');
    return;
  }
  // Back swap with mid button
  if (x >= width - 110 && x <= width - 24 && y >= 290 + 50 && y <= 290 + 70) {
    swapTiers('mid', 'back');
    return;
  }

  // 4. Cards hit detection
  const tiers = [
    { list: frontTier.value, y: 40, max: 3, name: 'front' as const, title: '头道' },
    { list: midTier.value, y: 165, max: 5, name: 'mid' as const, title: '中道' },
    { list: backTier.value, y: 290, max: 5, name: 'back' as const, title: '尾道' },
  ];

  const slotAreaWidth = width - 132;
  const cardW = 62;
  const cardH = 96;
  const startX = 130;

  let hitCard: Card | null = null;
  let hitTier: typeof tiers[0] | null = null;

  for (const t of tiers) {
    const denom = Math.max(t.max - 1, 1);
    const overlap = Math.min(50, (slotAreaWidth - startX - cardW) / denom);
    for (let i = t.list.length - 1; i >= 0; i--) {
      const cx = startX + i * overlap;
      const isSel = selectedIds.value.has(t.list[i].id);
      const cy = t.y + (isSel ? 2 : 12);
      const hitW = (i === t.list.length - 1) ? cardW : overlap;

      if (x >= cx && x <= cx + hitW && y >= cy && y <= cy + cardH) {
        hitCard = t.list[i];
        hitTier = t;
        break;
      }
    }
    if (hitCard) break;
  }

  dragState.value = {
    isDragging: false,
    startX: x,
    startY: y,
    currentX: x,
    currentY: y,
    draggedCard: hitCard,
    draggedCards: hitCard ? [hitCard] : [],
    sourceTier: hitTier ? hitTier.name : null,
    hoverTier: null,
    hoverCardId: null,
    pointerDownCard: hitCard,
    pointerDownTier: hitTier ? hitTier.name : null,
    pointerDownTime: Date.now(),
  };

  // If didn't hit card, check if tapped empty space in a tier slot
  if (!hitCard) {
    for (const t of tiers) {
      if (x >= 120 && x <= width - 12 && y >= t.y && y <= t.y + 118) {
        if (selectedIds.value.size > 0) {
          moveSelectedCardsTo(t.name);
          return;
        }
      }
    }
    // Tapped table empty area -> clear selection
    if (selectedIds.value.size > 0) {
      selectedIds.value.clear();
      soundFX.playTap();
      drawBoard();
    }
  }
}

function onCanvasPointerMove(e: PointerEvent) {
  if (hasCompared.value) return;
  const canvas = canvasRef.value;
  if (!canvas) return;

  const width = tableWidthPx.value;
  const height = tableHeightPx.value;
  const { x, y } = getCanvasEventCoords(canvas, e.clientX, e.clientY, props.isRotated90, width, height);

  if (dragState.value.pointerDownCard) {
    const dx = x - dragState.value.startX;
    const dy = y - dragState.value.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (!dragState.value.isDragging && dist > 5) {
      dragState.value.isDragging = true;
      soundFX.playTap();
    }

    if (dragState.value.isDragging) {
      dragState.value.currentX = x;
      dragState.value.currentY = y;

      const tiers = [
        { list: frontTier.value, y: 40, max: 3, name: 'front' as const },
        { list: midTier.value, y: 165, max: 5, name: 'mid' as const },
        { list: backTier.value, y: 290, max: 5, name: 'back' as const },
      ];

      let foundHoverTier: 'front' | 'mid' | 'back' | null = null;
      let foundHoverCardId: string | null = null;
      const slotAreaWidth = width - 132;
      const cardW = 62;
      const cardH = 96;
      const startX = 130;

      for (const t of tiers) {
        if (y >= t.y - 10 && y <= t.y + 128 && x >= 115 && x <= width) {
          foundHoverTier = t.name;
          const denom = Math.max(t.max - 1, 1);
          const overlap = Math.min(50, (slotAreaWidth - startX - cardW) / denom);

          for (let i = t.list.length - 1; i >= 0; i--) {
            const cx = startX + i * overlap;
            const isSel = selectedIds.value.has(t.list[i].id);
            const cy = t.y + (isSel ? 2 : 12);
            const hitW = (i === t.list.length - 1) ? cardW : overlap;

            if (x >= cx && x <= cx + hitW && y >= cy && y <= cy + cardH) {
              foundHoverCardId = t.list[i].id;
              break;
            }
          }
          break;
        }
      }

      dragState.value.hoverTier = foundHoverTier;
      dragState.value.hoverCardId = foundHoverCardId;
      drawBoard();
    }
  }
}

function onCanvasPointerUp(e: PointerEvent) {
  if (hasCompared.value) return;
  const canvas = canvasRef.value;
  if (!canvas) return;

  try {
    canvas.releasePointerCapture(e.pointerId);
  } catch {}

  if (dragState.value.isDragging) {
    const draggedCard = dragState.value.draggedCard;
    const sourceTier = dragState.value.sourceTier;
    const hoverTier = dragState.value.hoverTier;
    const hoverCardId = dragState.value.hoverCardId;

    if (draggedCard && sourceTier && hoverTier) {
      if (sourceTier === hoverTier) {
        // Drag within the SAME tier: Reorder cards!
        if (hoverCardId && hoverCardId !== draggedCard.id) {
          reorderCardInTier(sourceTier, draggedCard.id, hoverCardId);
        }
      } else {
        // Cross-tier drop!
        if (hoverCardId) {
          // Precision swap with target card!
          const targetCard = findCardById(hoverCardId);
          if (targetCard) {
            swapCardsDirectly(draggedCard, sourceTier, targetCard, hoverTier);
          }
        } else {
          // Drop into empty slot of hoverTier
          if (!selectedIds.value.has(draggedCard.id)) {
            selectedIds.value.clear();
            selectedIds.value.add(draggedCard.id);
          }
          moveSelectedCardsTo(hoverTier);
        }
      }
    }

    dragState.value.isDragging = false;
    dragState.value.pointerDownCard = null;
    dragState.value.draggedCard = null;
    drawBoard();
    return;
  }

  // Not dragging -> Pure Tap/Click!
  const tappedCard = dragState.value.pointerDownCard;
  const tappedTier = dragState.value.pointerDownTier;

  dragState.value.pointerDownCard = null;

  if (tappedCard && tappedTier) {
    // If cards from ANOTHER tier are currently selected:
    const cardsFromOtherTiers: { card: Card; tier: 'front' | 'mid' | 'back' }[] = [];
    (['front', 'mid', 'back'] as const).forEach((t) => {
      if (t !== tappedTier) {
        tiersMap[t].value.forEach((c) => {
          if (selectedIds.value.has(c.id)) {
            cardsFromOtherTiers.push({ card: c, tier: t });
          }
        });
      }
    });

    if (cardsFromOtherTiers.length === 1) {
      // Instant 1-to-1 Precision Swap!
      swapCardsDirectly(cardsFromOtherTiers[0].card, cardsFromOtherTiers[0].tier, tappedCard, tappedTier);
      return;
    } else if (cardsFromOtherTiers.length > 1) {
      // Multiple cards selected -> move to tapped tier
      moveSelectedCardsTo(tappedTier, tappedCard.id);
      return;
    }

    // Otherwise toggle selection on this card in current tier
    if (selectedIds.value.has(tappedCard.id)) {
      selectedIds.value.delete(tappedCard.id);
    } else {
      selectedIds.value.add(tappedCard.id);
    }
    soundFX.playTap();
    haptics.tap();
    drawBoard();
  }
}

function onCanvasPointerCancel(e: PointerEvent) {
  dragState.value.isDragging = false;
  dragState.value.pointerDownCard = null;
  dragState.value.draggedCard = null;
  drawBoard();
}

function handleCompare() {
  if (isWatering.value) return;
  showGunshotAnim.value = true;
  soundFX.playCardSnap(true);
  haptics.gunshot();

  // Compute scoring against all opponents (3 in 4-player, 7 in 8-player)
  const myFront = calcHandScore(frontTier.value);
  const myMid = calcHandScore(midTier.value);
  const myBack = calcHandScore(backTier.value);

  const bNames = isEightPlayer.value
    ? ['一席 (罗宋巧手)', '二席 (十三飞龙)', '三席 (七星居士)', '四席 (青龙剑客)', '五席 (百花仙子)', '六席 (金牌赌神)', '七席 (八方豪侠)']
    : ['西席 (罗宋巧手)', '北席 (十三飞龙)', '东席 (七星居士)'];

  const oppCount = isEightPlayer.value ? 7 : 3;
  let totalNet = 0;
  let wonOpponentCount = 0;
  const oppResults = [];

  for (let i = 0; i < oppCount; i++) {
    const opp = botHands.value[i];
    if (!opp) continue;
    const oppF = calcHandScore(opp.front);
    const oppM = calcHandScore(opp.mid);
    const oppB = calcHandScore(opp.back);

    let net = 0;
    let tiersWon = 0;

    // Front
    if (myFront > oppF) {
      net += 1;
      tiersWon++;
    } else if (myFront < oppF) {
      net -= 1;
    }

    // Mid
    if (myMid > oppM) {
      net += 1;
      tiersWon++;
    } else if (myMid < oppM) {
      net -= 1;
    }

    // Back
    if (myBack > oppB) {
      net += 1;
      tiersWon++;
    } else if (myBack < oppB) {
      net -= 1;
    }

    const isShot = tiersWon === 3;
    if (isShot) net *= 2; // Gunshot double

    if (net > 0) wonOpponentCount++;
    totalNet += net;

    oppResults.push({
      seat: i + 1,
      name: bNames[i] || `牌友${i + 1}`,
      netWater: net,
      isShot,
      handSummary: `头:${getHandLabel(opp.front)} 中:${getHandLabel(opp.mid)} 尾:${getHandLabel(opp.back)}`,
    });
  }

  isGrandSlam.value = wonOpponentCount === oppCount;
  if (isGrandSlam.value) {
    totalNet *= 2;
    haptics.victory();
    emit('fx', 'grandslam');
    soundFX.speakAction('grand_slam');
  } else if (wonOpponentCount > 0) {
    emit('fx', 'gunshot');
    soundFX.speakAction('gunshot');
  } else {
    soundFX.speakVoice('开牌比水完毕。');
  }
  totalScore.value = totalNet;
  opponentsBreakdown.value = oppResults;

  setTimeout(() => {
    showGunshotAnim.value = false;
    hasCompared.value = true;
    soundFX.playVictory();
    if (totalNet > 0) {
      haptics.victory();
      emit('fx', 'win');
    }
    emit('move', { score: totalScore.value, winner: totalNet >= 0 ? 0 : 1 });
  }, 1200);
}

onMounted(() => {
  preloadCardAssets();
  cleanupCardLoader = onCardAssetsLoaded(() => {
    drawBoard();
  });
  dealNewMatch();
  updateDimensions();
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
  if (rafId) cancelAnimationFrame(rafId);
});
</script>
