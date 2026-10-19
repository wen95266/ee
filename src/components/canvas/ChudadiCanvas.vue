<template>
  <div
    ref="containerRef"
    class="w-full h-full select-none absolute inset-0 overflow-hidden flex items-center justify-center"
    :style="{
      backgroundColor: props.tableTheme?.feltColor || '#047857',
      background: `radial-gradient(ellipse at 50% 45%, ${props.tableTheme?.highlightColor || '#10B981'} 0%, ${props.tableTheme?.feltColor || '#047857'} 60%, ${props.tableTheme?.edgeColor || '#065F46'} 100%)`
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


      <!-- 全场最大 · 绝对压制 · 连出提示浮标 -->
      <div
        v-if="unbeatableNotice"
        class="absolute top-11 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-950/95 via-yellow-900/95 to-amber-950/95 border-2 border-yellow-400 text-xs text-yellow-200 font-extrabold shadow-[0_0_24px_rgba(250,204,21,0.85)] flex items-center gap-2 animate-bounce pointer-events-none"
      >
        <span class="text-base">👑</span>
        <span>{{ unbeatableNotice }}</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-mono">连出新牌</span>
      </div>

      <!-- Floating Error Alert Tip (Top Center) -->
      <div
        v-else-if="errorTip"
        class="absolute top-11 left-1/2 -translate-x-1/2 z-35 px-4 py-1.5 rounded-full bg-black/95 border border-amber-400/80 text-xs text-amber-200 font-bold shadow-2xl animate-bounce flex items-center gap-1.5"
      >
        <span>⚠️</span>
        <span>{{ errorTip }}</span>
      </div>

      <!-- 下家报单顶大警示浮标 -->
      <div
        v-else-if="hands[3]?.length === 1 && hands[3]?.length < 13 && winnerSeat === null"
        class="absolute top-11 left-1/2 -translate-x-1/2 z-25 px-3.5 py-1 rounded-full bg-red-950/90 border border-red-500/80 text-xs text-red-200 font-bold shadow-[0_0_18px_rgba(239,68,68,0.7)] flex items-center gap-1.5 animate-pulse"
      >
        <span>🚨</span>
        <span>下家(东席)已报单 · 出单张必须顶大</span>
      </div>

      <!-- In-Table Floating Action Buttons (手牌底部居中操作栏) -->
      <div
        v-if="winnerSeat === null && turnSeat === 0"
        class="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 sm:gap-3.5 pointer-events-auto px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-emerald-500/40 shadow-[0_6px_24px_rgba(0,0,0,0.8)]"
      >
        <!-- 提示按钮 -->
        <button
          type="button"
          @click="handleHint"
          class="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-400/50 text-emerald-200 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          title="智能推荐可大过桌面的合法手牌"
        >
          <span>💡</span>
          <span>提示</span>
        </button>

        <!-- 过牌按钮 -->
        <button
          type="button"
          @click="handlePass"
          :disabled="!lastCombo || lastCombo.seat === 0"
          class="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-400/40 text-[#E6DEC8] disabled:opacity-25 disabled:pointer-events-none shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="不出本轮手牌，过牌给下一家"
        >
          过牌
        </button>

        <!-- 出牌按钮 (高亮主行动键) -->
        <button
          type="button"
          @click="handlePlay"
          :disabled="selectedIds.size === 0"
          class="px-5 sm:px-7 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white disabled:opacity-30 disabled:pointer-events-none shadow-[0_4px_22px_rgba(16,185,129,0.7)] hover:scale-105 active:scale-95 transition-all ring-2 ring-emerald-400 flex items-center gap-1.5 cursor-pointer"
          title="打出当前选中的手牌"
        >
          <span>出牌</span>
          <span v-if="selectedIds.size > 0" class="text-[11px] font-mono bg-black/40 px-1.5 py-0.5 rounded-full border border-white/20">
            {{ selectedIds.size }}
          </span>
        </button>

        <!-- 托管按钮 -->
        <button
          type="button"
          @click="toggleAutoHost"
          class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-md"
          :class="isAutoHost ? 'bg-amber-600/90 hover:bg-amber-500 text-white border-amber-300 ring-2 ring-amber-400 animate-pulse' : 'bg-stone-800/90 hover:bg-stone-700 text-emerald-200 border-emerald-500/40'"
          :title="isAutoHost ? '点击取消托管' : '开启自动托管'"
        >
          <span>🤖</span>
          <span>{{ isAutoHost ? '取消托管' : '托管' }}</span>
        </button>
      </div>

      <!-- 非本家回合时的轻量托管切换栏 -->
      <div
        v-if="winnerSeat === null && turnSeat !== 0"
        class="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 pointer-events-auto px-4 py-1.5 rounded-2xl bg-black/85 backdrop-blur-md border border-emerald-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
      >
        <span class="text-xs text-emerald-200/80 font-mono flex items-center gap-1">
          <span>⏳</span>
          <span>{{ ['本家', '西席', '北席', '东席'][turnSeat] }} 思考出牌中...</span>
        </span>
        <button
          type="button"
          @click="toggleAutoHost"
          class="ml-1 px-3 py-1 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
          :class="isAutoHost ? 'bg-amber-600 text-white border-amber-300 ring-1 ring-amber-400 animate-pulse' : 'bg-stone-800 hover:bg-stone-700 text-emerald-300 border-emerald-500/40'"
          :title="isAutoHost ? '点击取消托管' : '提前开启托管，轮到本家时由增强AI自动出牌'"
        >
          <span>🤖</span>
          <span>{{ isAutoHost ? '托管中 · 取消' : '托管' }}</span>
        </button>
      </div>

      <!-- 托管状态大浮层提示 -->
      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
        <div
          v-if="isAutoHost && winnerSeat === null"
          class="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-25 flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/95 via-stone-900/95 to-emerald-950/95 backdrop-blur-md border-2 border-emerald-400/90 shadow-[0_0_24px_rgba(16,185,129,0.65)] pointer-events-auto"
        >
          <div class="flex items-center gap-2">
            <span class="text-lg animate-bounce">🤖</span>
            <div>
              <div class="text-xs sm:text-sm text-emerald-200 font-extrabold tracking-wide flex items-center gap-1.5">
                <span>增强AI托管对局中</span>
                <span class="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full font-mono">自主出牌</span>
              </div>
              <div class="text-[10px] text-emerald-200/70">高智能顺位跟牌 · 随时点击右侧解除</div>
            </div>
          </div>
          <button
            type="button"
            @click="toggleAutoHost"
            class="px-3 py-1 bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold rounded-xl border border-red-300 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            取消托管
          </button>
        </div>
      </transition>

      <!-- 左下角：纯数字十字型累计积分面板（红色字体、无背景、无名称、无局数、放大尺寸） -->
      <div
        class="absolute left-3 sm:left-4 bottom-3 sm:bottom-4 z-25 pointer-events-auto flex flex-col items-center select-none"
      >
        <!-- 北 (上方) -->
        <div
          class="text-xl sm:text-2xl font-mono font-black text-red-500 px-1.5 text-center leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        >
          {{ cumulativeScores[2] }}
        </div>
        <!-- 中间横排：西 | 中心点 | 东 -->
        <div class="flex items-center gap-8 my-1">
          <div
            class="text-xl sm:text-2xl font-mono font-black text-red-500 px-1.5 text-center leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          >
            {{ cumulativeScores[1] }}
          </div>
          <div class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(0,0,0,0.9)]"></div>
          <div
            class="text-xl sm:text-2xl font-mono font-black text-red-500 px-1.5 text-center leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
          >
            {{ cumulativeScores[3] }}
          </div>
        </div>
        <!-- 南 (下方 - 本家) -->
        <div
          class="text-xl sm:text-2xl font-mono font-black text-red-500 px-1.5 text-center leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        >
          {{ cumulativeScores[0] }}
        </div>
      </div>

      <!-- 1. 单局结束结算界面 (第 X 局完成，未满100分) -->
      <div
        v-if="showRoundSettlementModal && !showMatchSettlementModal"
        class="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-40 overflow-y-auto"
      >
        <div class="relative w-full max-w-xl bg-gradient-to-b from-[#1C2822] via-[#0D1812] to-[#0A120E] border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col text-left">
          <!-- 头部标题 -->
          <div class="flex items-center justify-between pb-3 border-b border-emerald-500/30 shrink-0">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl sm:text-3xl">🎴</span>
              <div>
                <h3 class="text-lg sm:text-xl font-black text-amber-300 font-serif-title">
                  第 {{ gameRound }} 局 · 对局结算
                </h3>
                <p class="text-[11px] text-emerald-200/70">
                  【{{ ['本家', '西席', '北席', '东席'][winnerSeat || 0] }}】率先出清手牌登顶！累计手牌剩余数满100分结算大场次
                </p>
              </div>
            </div>
            <div class="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-400/40 text-xs font-mono font-bold text-amber-300">
              目标: 100分封顶
            </div>
          </div>

          <!-- 各玩家本局手牌剩余数与累计总分表格 -->
          <div class="py-3.5 space-y-2.5">
            <div
              v-for="s in [0, 1, 2, 3]"
              :key="s"
              class="p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between gap-3"
              :class="s === winnerSeat ? 'bg-emerald-950/60 border-emerald-400/60 shadow-md' : 'bg-black/40 border-white/10'"
            >
              <!-- 席位与胜负徽章 -->
              <div class="flex items-center gap-2.5 min-w-[100px] sm:min-w-[120px]">
                <span class="text-lg">{{ s === winnerSeat ? '👑' : ['👤', '🎩', '♟️', '🎲'][s] }}</span>
                <div>
                  <div class="text-xs sm:text-sm font-bold" :class="s === 0 ? 'text-amber-300 font-extrabold' : 'text-white'">
                    {{ ['本家 (尊贵玩家)', '西席 (南洋商贾)', '北席 (九龙棋杰)', '东席 (濠江赌客)'][s] }}
                  </div>
                  <div class="text-[10px] text-[#A89887]">
                    {{ s === winnerSeat ? '率先出清 · 0张' : `本局余 ${roundPenalties[s]?.remainingCards || 0} 张` }}
                  </div>
                </div>
              </div>

              <!-- 本局折算罚分与倍数 -->
              <div class="text-center px-2 py-1 rounded-xl bg-black/50 border border-white/5 min-w-[110px] sm:min-w-[130px]">
                <div class="text-[10px] text-emerald-200/80 font-medium">
                  {{ roundPenalties[s]?.multiplierDesc || '单倍 (×1)' }}
                </div>
                <div class="text-xs font-mono font-bold" :class="s === winnerSeat ? 'text-emerald-400' : 'text-red-400'">
                  本局罚分: +{{ roundPenalties[s]?.roundPenalty || 0 }} 分
                </div>
              </div>

              <!-- 累计总分与进度 -->
              <div class="text-right min-w-[90px] sm:min-w-[110px]">
                <div class="text-[10px] text-[#B8A99A]">
                  {{ previousCumulativeScores[s] }} + {{ roundPenalties[s]?.roundPenalty || 0 }} =
                </div>
                <div
                  class="text-sm sm:text-base font-black font-mono"
                  :class="cumulativeScores[s] >= 100 ? 'text-red-400 animate-pulse' : cumulativeScores[s] >= 80 ? 'text-amber-300' : 'text-emerald-300'"
                >
                  累计 {{ cumulativeScores[s] }} 分
                </div>
                <div class="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="cumulativeScores[s] >= 100 ? 'bg-red-500' : cumulativeScores[s] >= 80 ? 'bg-amber-400' : 'bg-emerald-400'"
                    :style="{ width: `${Math.min(100, cumulativeScores[s])}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 规则备忘说明提示条 -->
          <div class="px-3 py-2 rounded-xl bg-black/40 border border-emerald-500/20 text-[10px] text-emerald-200/70 leading-relaxed mb-3 flex items-center justify-between">
            <div>
              💡 规则提示：余8~9张翻一倍(×2)，余10~12张翻三倍(×3)，余13张一张未出翻四倍(×4)；首局执♦2先出，次局由上局赢家率先任意出牌！
            </div>
          </div>

          <!-- 底部动作按钮栏：继续游戏与退出游戏 -->
          <div class="pt-2 border-t border-emerald-500/30 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              @click="handleExitGame"
              class="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm font-bold border border-white/10 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              退出游戏
            </button>
            <button
              type="button"
              @click="startNextRound"
              class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 ring-2 ring-emerald-400 cursor-pointer"
            >
              <span>继续下一局 (胜者率先出牌)</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. 场次终局大结算界面 (有玩家累计满100分或超100分) -->
      <div
        v-if="showMatchSettlementModal"
        class="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-40 overflow-y-auto"
      >
        <div class="relative w-full max-w-2xl bg-gradient-to-b from-[#1E2B24] via-[#0E1A13] to-[#0A120E] border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col text-left">
          <!-- 头部标题 -->
          <div class="flex items-center justify-between pb-3 border-b border-amber-500/30 shrink-0">
            <div class="flex items-center gap-2.5">
              <span class="text-3xl sm:text-4xl">🏆</span>
              <div>
                <h3 class="text-xl sm:text-2xl font-black text-amber-300 font-serif-title">
                  锄大地场次终局大结算
                </h3>
                <p class="text-xs text-amber-200/80">
                  历经 {{ gameRound }} 局对战 · 累计罚分触及 100 分上限 · 四舍五入整十两两差额结算
                </p>
              </div>
            </div>
            <div class="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-xs font-mono font-bold text-red-300 animate-pulse">
              100分封顶完成
            </div>
          </div>

          <!-- 场次终局总结横幅 -->
          <div class="mt-3 p-3 rounded-2xl bg-black/40 border border-amber-500/30 text-xs text-amber-100/90 leading-relaxed">
            {{ matchSettlementResult?.summary }}
          </div>

          <!-- 四位玩家两两差额结算明细表 -->
          <div class="py-3 space-y-2">
            <div
              v-for="p in matchSettlementResult?.players"
              :key="p.seat"
              class="p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              :class="p.rank === 1 ? 'bg-amber-950/40 border-amber-400/60 shadow-lg' : p.seat === 0 ? 'bg-emerald-950/40 border-emerald-400/50' : 'bg-black/40 border-white/10'"
            >
              <!-- 名次与席位 -->
              <div class="flex items-center gap-2.5">
                <span class="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs" :class="p.rank === 1 ? 'bg-amber-500 text-black shadow-md' : p.rank === 2 ? 'bg-slate-300 text-black' : p.rank === 3 ? 'bg-amber-800 text-white' : 'bg-stone-700 text-stone-300'">
                  {{ p.rank }}
                </span>
                <div>
                  <div class="text-xs sm:text-sm font-extrabold flex items-center gap-1.5" :class="p.seat === 0 ? 'text-amber-300' : 'text-white'">
                    <span>{{ ['本家 (尊贵玩家)', '西席 (南洋商贾)', '北席 (九龙棋杰)', '东席 (濠江赌客)'][p.seat] }}</span>
                    <span v-if="p.rank === 1" class="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">👑 总冠军</span>
                  </div>
                  <div class="text-[10px] text-[#A89887] font-mono">
                    原始累计: {{ p.rawScore }}分 ➔ 四舍五入整十: {{ p.roundedScore }}分
                  </div>
                </div>
              </div>

              <!-- 两两差额结算公式 -->
              <div class="text-[10px] sm:text-[11px] font-mono text-[#D6C7B2] bg-black/40 px-2.5 py-1 rounded-xl border border-white/5 truncate max-w-xs">
                {{ p.formula }}
              </div>

              <!-- 最终净胜分 -->
              <div class="text-right min-w-[80px]">
                <div
                  class="text-base sm:text-lg font-black font-mono leading-none"
                  :class="p.netScore > 0 ? 'text-amber-400' : p.netScore === 0 ? 'text-stone-300' : 'text-red-400'"
                >
                  {{ p.netScore > 0 ? `+${p.netScore}` : p.netScore }} 分
                </div>
                <div class="text-[9px] text-white/50 mt-0.5">
                  {{ p.netScore > 0 ? '赢取积分' : '输扣积分' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 底部操作按钮：开启新场次与退出游戏 -->
          <div class="pt-3 border-t border-amber-500/30 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              @click="handleExitGame"
              class="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm font-bold border border-white/10 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              退出游戏
            </button>
            <button
              type="button"
              @click="dealNewMatch"
              class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-black text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 ring-2 ring-yellow-400 cursor-pointer"
            >
              <span>开启新场次 (从第1局重计)</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import { soundFX } from '../../utils/sound';
import { haptics } from '../../utils/haptics';
import { TableTheme } from '../../utils/theme';
import { getCanvasEventCoords } from '../../utils/canvasCoords';
import { renderPlayingCard, preloadCardAssets, onCardAssetsLoaded } from '../../utils/cardAssets';
import {
  ChudadiCard,
  ChudadiCombo,
  parseChudadiCombo,
  canBeatChudadiCombo,
  getChudadiAIPlay,
  getChudadiCardPower,
  getChudadiRankWeight,
  sortChudadiCards,
  validateDingDaRule,
  isComboDeductivelyUnbeatable,
  canOpponentsBeatChudadiCombo,
} from '../../engine/chudadiRules';

type Card = ChudadiCard;
type Combo = ChudadiCombo;

const props = defineProps<{
  tableTheme?: TableTheme;
  isRotated90?: boolean;
}>();

const emit = defineEmits<{
  (e: 'move', payload: any): void;
  (e: 'restart'): void;
  (e: 'fx', payload: any): void;
  (e: 'status', payload: any): void;
}>();

function emitStatus() {
  emit('status', {
    turnSeat: turnSeat.value,
    turnText: turnSeat.value === 0 ? '轮到本家' : `席位${turnSeat.value + 1}出牌`,
    cards: hands[0]?.length || 0,
    isAutoHost: isAutoHost.value,
  });
}

watch(
  () => props.tableTheme,
  () => {
    drawTable();
  }
);

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
const hands = reactive<Card[][]>([[], [], [], []]);
const selectedIds = reactive(new Set<string>());
const turnSeat = ref(0);
const lastCombo = ref<Combo | null>(null);
const currentLeadSeat = ref(0);
const seatStatus = reactive(['等待', '等待', '等待', '等待']);
const winnerSeat = ref<number | null>(null);
const errorTip = ref('');
const isDragging = ref(false);
const isFirstTurn = ref(true);
const consecutivePasses = ref(0);
const playedCardsHistory = ref<Card[]>([]);

const unbeatableNotice = ref('');
let unbeatableTimer: any = null;

const isAutoHost = ref(false);
let autoHostTimer: any = null;
let botTimer: any = null;

function toggleAutoHost() {
  isAutoHost.value = !isAutoHost.value;
  soundFX.playTap();
  emitStatus();
  if (isAutoHost.value && turnSeat.value === 0 && winnerSeat.value === null) {
    checkAutoHostTurn();
  }
}

function checkAutoHostTurn() {
  if (!isAutoHost.value || turnSeat.value !== 0 || winnerSeat.value !== null) return;
  if (autoHostTimer) clearTimeout(autoHostTimer);

  // 若本家报单，直接由 advanceToSeat 自动出牌绝杀或自动过牌
  if (hands[0]?.length === 1) {
    advanceToSeat(0);
    return;
  }

  seatStatus[0] = '🤖 托管思考出牌中...';
  drawTable();

  // 自愈修复：若本家手中无方块3，说明首出已结束
  if (isFirstTurn.value && !hands[0].some((c) => getChudadiRankWeight(c.rank) === 3 && c.suit === '♦')) {
    isFirstTurn.value = false;
  }

  // 拟真延迟 (320ms ~ 500ms)
  const delay = 320 + Math.floor(Math.random() * 180);
  autoHostTimer = setTimeout(() => {
    if (!isAutoHost.value || turnSeat.value !== 0 || winnerSeat.value !== null) return;

    if (isFirstTurn.value && !hands[0].some((c) => getChudadiRankWeight(c.rank) === 3 && c.suit === '♦')) {
      isFirstTurn.value = false;
    }

    const isNextBaoDan = hands[3]?.length === 1;
    let playCards = getChudadiAIPlay(hands[0], lastCombo.value, isFirstTurn.value, isNextBaoDan);

    // 校验牌型
    if (playCards && playCards.length > 0) {
      const ev = parseChudadiCombo(playCards, 0);
      if (!ev || (lastCombo.value && lastCombo.value.seat !== 0 && !canBeatChudadiCombo(ev, lastCombo.value))) {
        playCards = null;
      }
    }

    // 领牌保障：若是本家领牌回合，绝对不能过牌
    const isLeadTurn = !lastCombo.value || lastCombo.value.seat === 0;
    if (isLeadTurn && (!playCards || playCards.length === 0)) {
      const d3 = isFirstTurn.value
        ? hands[0].find((c) => getChudadiRankWeight(c.rank) === 3 && c.suit === '♦')
        : null;
      const sortedByDesc = sortChudadiCards(hands[0]);
      const sortedByAsc = [...hands[0]].sort((a, b) => getChudadiCardPower(a) - getChudadiCardPower(b));
      const leadCard = isNextBaoDan ? sortedByDesc[0] : sortedByAsc[0];
      playCards = d3 ? [d3] : (leadCard ? [leadCard] : null);
    }

    if (playCards && playCards.length > 0) {
      selectedIds.clear();
      playCards.forEach((c) => selectedIds.add(c.id));
      drawTable();

      setTimeout(() => {
        if (!isAutoHost.value || turnSeat.value !== 0 || winnerSeat.value !== null) return;
        selectedIds.clear();
        playCards!.forEach((c) => selectedIds.add(c.id));
        handlePlay();

        // 容错兜底
        if (turnSeat.value === 0 && winnerSeat.value === null && isAutoHost.value) {
          if (lastCombo.value && lastCombo.value.seat !== 0) {
            handlePass();
          } else {
            const fallbackCard =
              (isFirstTurn.value && hands[0].find((c) => getChudadiRankWeight(c.rank) === 2 && c.suit === '♦')) ||
              (isNextBaoDan
                ? [...hands[0]].sort((a, b) => getChudadiCardPower(b) - getChudadiCardPower(a))[0]
                : [...hands[0]].sort((a, b) => getChudadiCardPower(a) - getChudadiCardPower(b))[0]);
            if (fallbackCard) {
              selectedIds.clear();
              selectedIds.add(fallbackCard.id);
              handlePlay();
            }
          }
        }
      }, 250);
    } else {
      if (lastCombo.value && lastCombo.value.seat !== 0) {
        handlePass();
      } else {
        const fallbackCard =
          (isFirstTurn.value && hands[0].find((c) => getChudadiRankWeight(c.rank) === 2 && c.suit === '♦')) ||
          (isNextBaoDan
            ? [...hands[0]].sort((a, b) => getChudadiCardPower(b) - getChudadiCardPower(a))[0]
            : [...hands[0]].sort((a, b) => getChudadiCardPower(a) - getChudadiCardPower(b))[0]);
        if (fallbackCard) {
          selectedIds.clear();
          selectedIds.add(fallbackCard.id);
          handlePlay();
        }
      }
    }
  }, delay);
}

const SUITS: { suit: '♠' | '♥' | '♣' | '♦'; suitVal: number; isRed: boolean }[] = [
  { suit: '♠', suitVal: 4, isRed: false },
  { suit: '♥', suitVal: 3, isRed: true },
  { suit: '♣', suitVal: 2, isRed: false },
  { suit: '♦', suitVal: 1, isRed: true },
];

const RANKS = [
  { rank: 2, label: '2' },
  { rank: 3, label: '3' },
  { rank: 4, label: '4' },
  { rank: 5, label: '5' },
  { rank: 6, label: '6' },
  { rank: 7, label: '7' },
  { rank: 8, label: '8' },
  { rank: 9, label: '9' },
  { rank: 10, label: '10' },
  { rank: 11, label: 'J' },
  { rank: 12, label: 'Q' },
  { rank: 13, label: 'K' },
  { rank: 14, label: 'A' },
];

function createDeck(): Card[] {
  const pool: Card[] = [];
  for (const r of RANKS) {
    for (const s of SUITS) {
      pool.push({
        id: `${r.label}-${s.suit}`,
        rank: r.rank,
        suitVal: s.suitVal,
        label: r.label,
        suit: s.suit,
        isRed: s.isRed,
      });
    }
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function sortCards(c: Card[]): Card[] {
  return sortChudadiCards(c);
}

const cumulativeScores = reactive([0, 0, 0, 0]);
const isCumulativeCollapsed = ref(false);
const gameRound = ref(1);
const matchFinished = ref(false);

function dealNewMatch() {
  if (botTimer) clearTimeout(botTimer);
  if (autoHostTimer) clearTimeout(autoHostTimer);
  cumulativeScores.fill(0);
  gameRound.value = 1;
  matchFinished.value = false;

  const deck = createDeck();
  hands[0] = sortCards(deck.slice(0, 13));
  hands[1] = sortCards(deck.slice(13, 26));
  hands[2] = sortCards(deck.slice(26, 39));
  hands[3] = sortCards(deck.slice(39, 52));

  // Find who holds ♦2 for Game 1
  let starter = 0;
  for (let i = 0; i < 4; i++) {
    if (hands[i].some((c) => getChudadiRankWeight(c.rank) === 2 && c.suit === '♦')) {
      starter = i;
      break;
    }
  }

  selectedIds.clear();
  playedCardsHistory.value = [];
  turnSeat.value = starter;
  lastCombo.value = null;
  consecutivePasses.value = 0;
  currentLeadSeat.value = starter;
  seatStatus.fill('等待');
  seatStatus[starter] = '执♦2首出';
  winnerSeat.value = null;
  errorTip.value = '';
  isFirstTurn.value = true;
  drawTable();
  emit('restart');
  emitStatus();

  if (starter !== 0) {
    advanceToSeat(starter);
  } else {
    advanceToSeat(0);
  }
}

function startNextGame(prevWinner: number) {
  if (matchFinished.value) return;
  if (botTimer) clearTimeout(botTimer);
  if (autoHostTimer) clearTimeout(autoHostTimer);
  gameRound.value++;
  const deck = createDeck();
  hands[0] = sortCards(deck.slice(0, 13));
  hands[1] = sortCards(deck.slice(13, 26));
  hands[2] = sortCards(deck.slice(26, 39));
  hands[3] = sortCards(deck.slice(39, 52));

  const starter = prevWinner;
  selectedIds.clear();
  playedCardsHistory.value = [];
  turnSeat.value = starter;
  lastCombo.value = null;
  consecutivePasses.value = 0;
  currentLeadSeat.value = starter;
  seatStatus.fill('等待');
  seatStatus[starter] = '率先出牌';
  winnerSeat.value = null;
  errorTip.value = '';
  isFirstTurn.value = false; // Game 2+: winner leads, no Diamond 3 required
  drawTable();
  emitStatus();

  advanceToSeat(starter);
}

function onGameEnded(winnerSeatVal: number) {
  for (let i = 0; i < 4; i++) {
    if (i !== winnerSeatVal) {
      cumulativeScores[i] += hands[i].length;
    }
  }

  const maxScore = Math.max(...cumulativeScores);
  if (maxScore >= 100) {
    matchFinished.value = true;
    seatStatus[winnerSeatVal] = '场次完成（累计满100分）';
    soundFX.speakVoice('场次完成，积分结算！');
    return;
  }

  setTimeout(() => {
    if (!matchFinished.value) {
      startNextGame(winnerSeatVal);
    }
  }, 2200);
}

function evaluateCombo(cards: Card[], seat: number): Combo | null {
  return parseChudadiCombo(cards, seat);
}

function canBeat(cand: Combo, target: Combo | null): boolean {
  return canBeatChudadiCombo(cand, target);
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

  // Emerald Green Felt with spotlight
  const highlight = props.tableTheme?.highlightColor || '#10B981';
  const felt = props.tableTheme?.feltColor || '#047857';
  const edge = props.tableTheme?.edgeColor || '#065F46';

  const grad = ctx.createRadialGradient(width / 2, height / 2 - 20, 20, width / 2, height / 2, 430);
  grad.addColorStop(0, highlight);
  grad.addColorStop(0.35, felt);
  grad.addColorStop(0.85, edge);
  grad.addColorStop(1, edge);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Border pinstripe
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 0);
  ctx.stroke();

  // Ambient table spotlight ellipse
  const spotGrad = ctx.createRadialGradient(width / 2, height / 2 - 20, 0, width / 2, height / 2 - 20, 260);
  spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
  spotGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.06)');
  spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Opponents Seats: West (1), North (2), East (3)
  const drawSeat = (x: number, y: number, name: string, count: number, status: string, active: boolean) => {
    const isBaoDan = count === 1;

    ctx.save();
    if (isBaoDan) {
      // 报单头像框变成红色，并带红色警报呼吸光晕
      ctx.fillStyle = active ? 'rgba(239, 68, 68, 0.45)' : 'rgba(185, 28, 28, 0.35)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 16;
    } else {
      ctx.fillStyle = active ? 'rgba(16, 185, 129, 0.35)' : 'rgba(0, 0, 0, 0.25)';
      ctx.strokeStyle = active ? '#FDE047' : 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = active ? 2 : 1;
    }
    ctx.beginPath();
    ctx.roundRect(x, y, 130, 64, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = isBaoDan ? '#FCA5A5' : '#FFFFFF';
    ctx.font = '700 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(name, x + 10, y + 20);

    if (isBaoDan) {
      ctx.fillStyle = '#EF4444';
      ctx.font = '800 12px monospace';
      ctx.fillText('余 1 张 🚨 报单', x + 10, y + 38);
    } else {
      ctx.fillStyle = count <= 2 ? '#EF4444' : '#FDE047';
      ctx.font = '700 12px monospace';
      ctx.fillText(`余 ${count} 张 ${count <= 2 ? '⚠️' : ''}`, x + 10, y + 38);
    }

    ctx.fillStyle = isBaoDan ? '#F87171' : '#6EE7B7';
    ctx.font = '600 11px sans-serif';
    ctx.fillText(status, x + 10, y + 54);
  };

  drawSeat(24, 105, '西席 (香江雀仙)', hands[1]?.length || 0, seatStatus[1], turnSeat.value === 1);
  drawSeat(width / 2 - 65, 22, '北席 (九龙棋杰)', hands[2]?.length || 0, seatStatus[2], turnSeat.value === 2);
  drawSeat(width - 154, 105, '东席 (濠江赌客)', hands[3]?.length || 0, seatStatus[3], turnSeat.value === 3);

  // 本家报单红色警报
  if (hands[0]?.length === 1) {
    ctx.save();
    ctx.fillStyle = 'rgba(220, 38, 38, 0.9)';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 65, height - 216, 130, 24, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚨 本家已报单 (余1张)', width / 2, height - 200);
    ctx.restore();
  }

  // Center Active Played Combo
  if (lastCombo.value) {
    const list = lastCombo.value.cards;
    const overlap = 28;
    const totalW = 54 + (list.length - 1) * overlap;
    const startY = 105;
    const s = lastCombo.value.seat !== undefined ? lastCombo.value.seat : 0;

    let startX = width / 2 - totalW / 2;
    if (s === 1) {
      startX = width / 2 - 190;
    } else if (s === 3) {
      startX = width / 2 + 50;
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
    ctx.textAlign = s === 1 ? 'left' : s === 3 ? 'right' : 'center';
    const names = ['本家', '西席', '北席', '东席'];
    const textX = s === 1 ? startX : s === 3 ? startX + totalW : width / 2;
    ctx.fillText(`${names[s]} · ${lastCombo.value.label}`, textX, startY + 76 + 18);
  }

  // Player Hand (South)
  const myHand = hands[0] || [];
  if (myHand.length > 0) {
    const cardW = 72;
    const cardH = 106;
    const step = Math.min(42, (width - 100) / Math.max(1, myHand.length));
    const totalW = cardW + (myHand.length - 1) * step;
    const baseLeft = width / 2 - totalW / 2;
    const baseY = height - 200;

    myHand.forEach((c, idx) => {
      const isSel = selectedIds.has(c.id);
      const x = baseLeft + idx * step;
      const y = isSel ? baseY - 18 : baseY;

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

  const cardW = 72;
  const cardH = 106;
  const step = Math.min(42, (680 - 100) / Math.max(1, myHand.length));
  const totalW = cardW + (myHand.length - 1) * step;
  const baseLeft = 680 / 2 - totalW / 2;
  const baseY = 430 - 200;

  if (isDuringDrag) {
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
    const cy = isSel ? baseY - 18 : baseY;
    if (x >= cx && x <= cx + cardW && y >= cy - 15 && y <= cy + cardH + 15) {
      return i;
    }
  }

  // 2. Continuous horizontal projection fallback
  const clampedX = Math.max(baseLeft, Math.min(x, baseLeft + totalW - 1));
  return Math.min(myHand.length - 1, Math.max(0, Math.floor((clampedX - baseLeft) / step)));
}

function onPointerDown(e: PointerEvent) {
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
  if (!isDragging.value) return;
  const idx = getCardIndexAtPoint(e.clientX, e.clientY, true);
  if (idx === -1 || idx === dragCurrentIndex) return;

  dragCurrentIndex = idx;
  const myHand = hands[0] || [];
  const minIdx = Math.min(dragStartIndex, dragCurrentIndex);
  const maxIdx = Math.max(dragStartIndex, dragCurrentIndex);

  const nextSelected = new Set(initialSelectedIds);
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

function handlePlay() {
  if (turnSeat.value !== 0 || winnerSeat.value !== null) return;
  errorTip.value = '';

  // 报单状态下：如果只有1张牌，出牌即获胜
  if (hands[0].length === 1) {
    executeBaoDanPlay(0);
    return;
  }

  const chosen = hands[0].filter((c) => selectedIds.has(c.id));
  if (chosen.length === 0) return;

  // 自愈校验：若本家手中并无方块2，说明首出环节已结束，重置首出标记
  if (isFirstTurn.value && !hands[0].some((c) => getChudadiRankWeight(c.rank) === 2 && c.suit === '♦')) {
    isFirstTurn.value = false;
  }

  // 锄大地规则：第一局首出必须包含方块2 (♦2)
  if (isFirstTurn.value && !chosen.some((c) => getChudadiRankWeight(c.rank) === 2 && c.suit === '♦')) {
    errorTip.value = '首出必须包含方块2 (♦2)！';
    return;
  }

  const combo = parseChudadiCombo(chosen, 0);
  if (!combo) {
    errorTip.value = '牌型不符合锄大地规则（单张、对子、三条、顺子、同花、俘虏、四带一、同花顺）';
    return;
  }

  if (lastCombo.value) {
    if (!canBeatChudadiCombo(combo, lastCombo.value)) {
      errorTip.value = '必须大过桌面牌型！';
      return;
    }
  }

  // 顶大规则校验：若下家报单，出单张必须顶大
  const isNextBaoDan = hands[3]?.length === 1;
  const dingDaCheck = validateDingDaRule(hands[0], chosen, lastCombo.value, isNextBaoDan);
  if (!dingDaCheck.valid) {
    errorTip.value = dingDaCheck.reason || '下家已报单，跟单张必须顶大！';
    return;
  }

  // 清除任何悬挂的思考定时器
  if (botTimer) clearTimeout(botTimer);
  if (autoHostTimer) clearTimeout(autoHostTimer);

  soundFX.playCardSnap();
  if (combo.type === '5_card') {
    if (combo.comboTier === 5 || combo.comboTier === 4) {
      haptics.bomb();
      emit('fx', 'bomb');
    } else if (combo.comboTier === 3) {
      haptics.playCard();
      emit('fx', 'dragon');
    } else {
      haptics.playCard();
      emit('fx', 'straight');
    }
  } else {
    haptics.playCard();
  }

  hands[0] = hands[0].filter((c) => !selectedIds.has(c.id));
  selectedIds.clear();
  playedCardsHistory.value.push(...chosen);
  lastCombo.value = combo;
  currentLeadSeat.value = 0;
  consecutivePasses.value = 0;
  seatStatus[0] = `出牌：${combo.label}`;
  soundFX.speakAction(combo.label);
  isFirstTurn.value = false;
  drawTable();
  emitStatus();

  afterComboPlayed(0, combo);
}

function handlePass() {
  if (!lastCombo.value || lastCombo.value.seat === 0) return;
  if (turnSeat.value !== 0 || winnerSeat.value !== null) return;

  // 顶大规则校验：若下家报单，其他玩家打单张时，本家若有能管上的单张必须顶大，不可过牌！
  const isNextBaoDan = hands[3]?.length === 1;
  if (isNextBaoDan && lastCombo.value && lastCombo.value.type === 'single') {
    const sortedByPower = sortChudadiCards(hands[0]);
    const largestCard = sortedByPower[0];
    if (largestCard) {
      const largestCombo = parseChudadiCombo([largestCard]);
      if (largestCombo && canBeatChudadiCombo(largestCombo, lastCombo.value)) {
        errorTip.value = `下家已报单，其他玩家打单张必须出最大的单张【${largestCard.label}${largestCard.suit}】顶大，不可过牌！`;
        return;
      }
    }
  }

  selectedIds.clear();
  errorTip.value = '';
  seatStatus[0] = '过牌';
  soundFX.speakAction('pass');
  consecutivePasses.value++;

  if (consecutivePasses.value >= 3 && lastCombo.value) {
    const leadSeat = currentLeadSeat.value;
    lastCombo.value = null;
    consecutivePasses.value = 0;
    for (let i = 0; i < 4; i++) {
      seatStatus[i] = i === leadSeat ? (leadSeat === 0 ? '全场过完 · 该您自由出牌' : '全场过完 · 领出新牌') : '过牌';
    }
    turnSeat.value = leadSeat;
    drawTable();
    emitStatus();
    if (leadSeat === 0) {
      if (isAutoHost.value) {
        if (autoHostTimer) clearTimeout(autoHostTimer);
        autoHostTimer = setTimeout(() => {
          checkAutoHostTurn();
        }, 800);
      }
    } else {
      if (botTimer) clearTimeout(botTimer);
      botTimer = setTimeout(() => {
        advanceToSeat(leadSeat);
      }, 800);
    }
    return;
  }

  const nextS = (0 - 1 + 4) % 4; // 3 (东席)
  advanceToSeat(nextS);
}

function handleHint() {
  errorTip.value = '';
  selectedIds.clear();

  // 自愈校验：若手中无方块3，重置isFirstTurn
  if (isFirstTurn.value && !hands[0].some((c) => getChudadiRankWeight(c.rank) === 3 && c.suit === '♦')) {
    isFirstTurn.value = false;
  }

  // 报单状态下提示自动出单张
  if (hands[0].length === 1) {
    selectedIds.add(hands[0][0].id);
    drawTable();
    return;
  }

  const isNextBaoDan = hands[3]?.length === 1;
  const suggested = getChudadiAIPlay(hands[0], lastCombo.value, isFirstTurn.value, isNextBaoDan);
  if (suggested && suggested.length > 0) {
    suggested.forEach((c) => selectedIds.add(c.id));
    drawTable();
    return;
  }

  // 没有管得起的牌时提示过牌
  if (lastCombo.value && lastCombo.value.seat !== 0) {
    handlePass();
  }
}

/**
 * 当有玩家打出一手牌后的状态机处理：
 * 1. 检查获胜
 * 2. 核心体验改进：全场绝大（绝对压制）推算：
 *    依据公开已出牌库（记牌器推算），严禁偷窥对手暗牌（防止泄露对手手牌信息）。
 *    若未出牌库中数学上不可能存在任何压制牌（如3张A已出，打出三条K；或打出黑桃A；或对手张数不足）：
 *    直接由系统判定为全场绝大，该玩家保留出牌权继续出牌！
 * 3. 正常轮转时：若下一位玩家已【报单】：
 *    要得起就自动出牌获胜，要不起就自动过牌！
 */
function afterComboPlayed(seat: number, combo: Combo) {
  if (hands[seat].length === 0) {
    winnerSeat.value = seat;
    if (seat === 0) {
      haptics.victory();
      soundFX.speakAction('clean_out');
      soundFX.playVictory();
      emit('fx', 'win');
    } else {
      soundFX.playVictory();
    }
    emit('move', { seat, combo, winner: seat });
    onGameEnded(seat);
    drawTable();
    emitStatus();
    return;
  }

  currentLeadSeat.value = seat;

  // 1. 基于公开牌库与己方手牌推算未知牌池
  const all52 = createDeck();
  const knownCardIds = new Set<string>();
  for (const c of playedCardsHistory.value) knownCardIds.add(c.id);
  if (hands[seat]) {
    for (const c of hands[seat]) knownCardIds.add(c.id);
  }

  const availableOpponentPool = all52.filter((c) => !knownCardIds.has(c.id));
  const otherHands = hands.filter((_, idx) => idx !== seat);
  const maxOpponentCards = Math.max(...otherHands.map((h) => h.length), 0);
  const isCountShort = maxOpponentCards < combo.cards.length;

  const isDeductivelyUnbeatable = isComboDeductivelyUnbeatable(combo, availableOpponentPool, maxOpponentCards);
  const anyOpponentCanBeat = !isCountShort && canOpponentsBeatChudadiCombo(combo, otherHands);

  // 综合绝大压制判定：
  // ① 对手张数均不足；② 数学推算全场绝大（如黑桃2至尊、含黑桃2对2等）；③ 实时三家对手手牌均无牌可管（全场要不起）
  const isUnbeatable = isCountShort || isDeductivelyUnbeatable || !anyOpponentCanBeat;

  if (isUnbeatable) {
    const names = ['本家', '西席', '北席', '东席'];
    unbeatableNotice.value = isCountShort
      ? `👑 对手余牌均不足${combo.cards.length}张！【${names[seat]}】直接连出`
      : `👑 牌型绝大·全场要不起！【${names[seat]}】保留出牌权`;
    if (unbeatableTimer) clearTimeout(unbeatableTimer);
    unbeatableTimer = setTimeout(() => {
      unbeatableNotice.value = '';
    }, 2800);

    soundFX.speakAction(isCountShort ? 'cards_short' : 'unbeatable');
    emit('fx', 'dragon');

    // 其它各家直接显示要不起
    for (let i = 0; i < 4; i++) {
      if (i !== seat) {
        seatStatus[i] = isCountShort ? `余牌不足${combo.cards.length}张` : '要不起';
      }
    }

    lastCombo.value = null;
    consecutivePasses.value = 0;
    currentLeadSeat.value = seat;
    turnSeat.value = seat;
    seatStatus[seat] = seat === 0 ? '全场绝大 · 该您自由出牌！' : '全场绝大 · 领出新牌';
    drawTable();
    emitStatus();

    // 清空任何悬挂的思考定时器，防止误触发轮转
    if (botTimer) clearTimeout(botTimer);

    // 若该席位仅余1张牌(报单)，且获得了领出权，间隔1秒自动出牌获胜！
    if (hands[seat].length === 1) {
      setTimeout(() => {
        executeBaoDanPlay(seat);
      }, 1000);
      return;
    }

    if (seat === 0) {
      if (isAutoHost.value) {
        if (autoHostTimer) clearTimeout(autoHostTimer);
        autoHostTimer = setTimeout(() => {
          checkAutoHostTurn();
        }, 800);
      }
    } else {
      botTimer = setTimeout(() => {
        advanceToSeat(seat);
      }, 800);
    }
    return;
  }

  // 正常轮转到逆时针下一家：(seat - 1 + 4) % 4
  const nextS = (seat - 1 + 4) % 4;
  turnSeat.value = nextS;
  drawTable();
  emitStatus();
  advanceToSeat(nextS);
}


/**
 * 轮转到目标席位的统一处理函数（含报单自动绝杀/自动过牌）：
 * 规则：报单的玩家，要得起就自动出牌赢了，要不起就自动过
 */
function advanceToSeat(seat: number) {
  if (winnerSeat.value !== null) return;
  turnSeat.value = seat;

  // 报单玩家（余 1 张牌）处理逻辑：
  if (hands[seat]?.length === 1) {
    drawTable();
    emitStatus();

    // 情况 A：领出回合（无桌面压制牌，或自己上把绝对压制获得出牌权）
    if (!lastCombo.value || lastCombo.value.seat === seat) {
      setTimeout(() => {
        if (winnerSeat.value !== null || hands[seat]?.length !== 1) return;
        executeBaoDanPlay(seat);
      }, 450);
      return;
    }

    // 情况 B：跟牌回合
    // 1) 桌面牌不是单张（是对子、三条、5张牌型），报单玩家只有1张牌，绝对要不起，自动过！
    if (lastCombo.value.type !== 'single') {
      setTimeout(() => {
        if (winnerSeat.value !== null) return;
        executeBaoDanPass(seat);
      }, 450);
      return;
    }

    // 2) 桌面牌是单张，检验能否管上
    const singleCard = hands[seat][0];
    const cand = parseChudadiCombo([singleCard], seat);
    const canBeat = cand && canBeatChudadiCombo(cand, lastCombo.value);

    if (canBeat) {
      // 要得起：自动出牌赢了！
      setTimeout(() => {
        if (winnerSeat.value !== null || hands[seat]?.length !== 1) return;
        executeBaoDanPlay(seat);
      }, 450);
      return;
    } else {
      // 要不起：自动过！
      setTimeout(() => {
        if (winnerSeat.value !== null) return;
        executeBaoDanPass(seat);
      }, 450);
      return;
    }
  }

  // 非报单玩家的常规思考与出牌处理：
  if (seat === 0) {
    seatStatus[0] = lastCombo.value ? '该您跟牌' : '该您出牌';
    drawTable();
    emitStatus();
    if (isAutoHost.value) {
      checkAutoHostTurn();
    }
  } else {
    drawTable();
    emitStatus();
    const thinkingDelay = 700 + Math.floor(Math.random() * 250);
    if (botTimer) clearTimeout(botTimer);
    botTimer = setTimeout(() => {
      botStep(seat);
    }, thinkingDelay);
  }
}

/**
 * 报单玩家自动出牌并宣布胜利
 */
function executeBaoDanPlay(seat: number) {
  if (winnerSeat.value !== null || hands[seat]?.length !== 1) return;
  const card = hands[seat][0];
  const combo = parseChudadiCombo([card], seat)!;
  hands[seat] = [];
  playedCardsHistory.value.push(card);
  lastCombo.value = combo;
  consecutivePasses.value = 0;
  winnerSeat.value = seat;
  seatStatus[seat] = '🚨 报单绝杀 · 获胜！';
  soundFX.playCardSnap();
  soundFX.speakAction('baodan_win');
  soundFX.playVictory();
  emit('fx', 'win');
  emit('move', { seat, combo, winner: seat });
  onGameEnded(seat);
  drawTable();
  emitStatus();
}

/**
 * 报单玩家自动过牌
 */
function executeBaoDanPass(seat: number) {
  if (winnerSeat.value !== null) return;
  seatStatus[seat] = '要不起 (报单自动过)';
  soundFX.playTap();
  soundFX.speakAction('baodan_pass');
  consecutivePasses.value++;

  if (consecutivePasses.value >= 3 && lastCombo.value) {
    const leadSeat = currentLeadSeat.value;
    lastCombo.value = null;
    consecutivePasses.value = 0;
    for (let i = 0; i < 4; i++) {
      seatStatus[i] = i === leadSeat ? (leadSeat === 0 ? '全场过完 · 该您自由出牌' : '全场过完 · 领出新牌') : '过牌';
    }
    turnSeat.value = leadSeat;
    drawTable();
    emitStatus();
    if (leadSeat === 0) {
      if (isAutoHost.value) {
        if (autoHostTimer) clearTimeout(autoHostTimer);
        autoHostTimer = setTimeout(() => {
          checkAutoHostTurn();
        }, 800);
      }
    } else {
      if (botTimer) clearTimeout(botTimer);
      botTimer = setTimeout(() => {
        advanceToSeat(leadSeat);
      }, 800);
    }
    return;
  }

  const nextS = (seat - 1 + 4) % 4;
  setTimeout(() => {
    advanceToSeat(nextS);
  }, 450);
}

/**
 * 电脑席位出牌/过牌决策
 */
function botStep(seat: number) {
  if (winnerSeat.value !== null || turnSeat.value !== seat) return;
  if (hands[seat]?.length === 1) {
    advanceToSeat(seat);
    return;
  }

  const target = lastCombo.value && lastCombo.value.seat !== seat ? lastCombo.value : null;
  const nextSeat = (seat - 1 + 4) % 4;
  const isNextBaoDan = hands[nextSeat]?.length === 1;
  let chosen = getChudadiAIPlay(hands[seat], target, isFirstTurn.value, isNextBaoDan);

  // 领出阶段保底（领出不可过牌）
  if (!target && (!chosen || chosen.length === 0)) {
    const sortedAsc = [...hands[seat]].sort((a, b) => getChudadiCardPower(a) - getChudadiCardPower(b));
    const sortedDesc = [...hands[seat]].sort((a, b) => getChudadiCardPower(b) - getChudadiCardPower(a));
    chosen = isNextBaoDan ? [sortedDesc[0]] : [sortedAsc[0]];
  }

  if (chosen && chosen.length > 0) {
    const cb = parseChudadiCombo(chosen, seat)!;
    const rmIds = new Set(chosen.map((c) => c.id));
    hands[seat] = hands[seat].filter((c) => !rmIds.has(c.id));
    playedCardsHistory.value.push(...chosen);
    lastCombo.value = cb;
    consecutivePasses.value = 0;
    seatStatus[seat] = `出牌：${cb.label}`;
    soundFX.playCardSnap();
    soundFX.speakAction(cb.label, { isFemale: seat === 2 });
    isFirstTurn.value = false;
    drawTable();
    emitStatus();

    afterComboPlayed(seat, cb);
  } else {
    seatStatus[seat] = '过牌';
    soundFX.playTap();
    soundFX.speakAction('pass', { isFemale: seat === 2 });
    consecutivePasses.value++;

    if (consecutivePasses.value >= 3 && lastCombo.value) {
      const leadSeat = currentLeadSeat.value;
      lastCombo.value = null;
      consecutivePasses.value = 0;
      for (let i = 0; i < 4; i++) {
        seatStatus[i] = i === leadSeat ? (leadSeat === 0 ? '全场过完 · 该您自由出牌' : '全场过完 · 领出新牌') : '过牌';
      }
      turnSeat.value = leadSeat;
      drawTable();
      emitStatus();
      if (leadSeat === 0) {
        if (isAutoHost.value) {
          if (autoHostTimer) clearTimeout(autoHostTimer);
          autoHostTimer = setTimeout(() => {
            checkAutoHostTurn();
          }, 800);
        }
      } else {
        if (botTimer) clearTimeout(botTimer);
        botTimer = setTimeout(() => {
          advanceToSeat(leadSeat);
        }, 800);
      }
      return;
    }

    const nextS = (seat - 1 + 4) % 4;
    advanceToSeat(nextS);
  }
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
  if (botTimer) clearTimeout(botTimer);
});

defineExpose({
  dealNewMatch,
  toggleAutoHost,
});
</script>
