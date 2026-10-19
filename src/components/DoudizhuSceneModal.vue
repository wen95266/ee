<template>
  <div class="w-full h-full flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden bg-[#100B08] text-[#F5EFE6]">
    <!-- Top Header Bar -->
    <div class="flex items-center justify-between pb-2.5 border-b border-[#2C211A] shrink-0">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="$emit('close')"
          class="px-3.5 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-xs sm:text-sm font-bold text-amber-200 border border-amber-500/60 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md"
          title="返回游戏大厅"
        >
          <span>🏠</span>
          <span>返回大厅</span>
        </button>
        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-base sm:text-lg md:text-xl font-black text-[#F5EFE6] font-serif-title">
              斗地主茶社 · 游戏场景选择
            </h2>
            <span class="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
              当前默认：经典场
            </span>
          </div>
          <p class="text-[10px] sm:text-xs text-[#A89887] font-mono mt-0.5">
            经典场（传统规则与发牌） · 不洗牌场（炸弹满天飞 · 超高倍数刺激对决）
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="$emit('close')"
          class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm text-[#B8A99A] hover:text-white transition-colors cursor-pointer"
          title="关闭返回大厅"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 2 Cards Grid: Classic vs No-Shuffle -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 flex-1 min-h-0 my-4 items-stretch">
      <div
        v-for="s in SCENES"
        :key="s.id"
        @click="selectedScene = s.id"
        @dblclick="confirmAndEnter(s.id)"
        class="relative rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between p-5 sm:p-7 overflow-hidden cursor-pointer group active:scale-[0.99] select-none shadow-xl"
        :class="[
          selectedScene === s.id
            ? s.id === 'noshuffle'
              ? 'border-amber-400 bg-gradient-to-br from-amber-950/90 via-[#2E1D13] to-[#140E0A] ring-2 ring-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.35)]'
              : 'border-blue-400 bg-gradient-to-br from-blue-950/90 via-[#142036] to-[#0A0D14] ring-2 ring-blue-400/80 shadow-[0_0_40px_rgba(59,130,246,0.35)]'
            : 'border-[#382C24] bg-gradient-to-br from-[#1C1511] via-[#16100D] to-[#110C09] hover:border-amber-600/60 hover:bg-[#221A15]'
        ]"
      >
        <!-- Active Corner Tag -->
        <div
          v-if="selectedScene === s.id"
          class="absolute top-0 right-0 text-xs font-black px-4 py-1 rounded-bl-2xl shadow-md z-10"
          :class="s.id === 'noshuffle' ? 'bg-gradient-to-l from-amber-500 to-orange-600 text-black' : 'bg-gradient-to-l from-blue-500 to-indigo-600 text-white'"
        >
          已选中当前场次 ✓
        </div>

        <!-- Top Section: Icon & Title -->
        <div class="flex items-start gap-4">
          <div
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl border shadow-inner shrink-0"
            :class="s.iconBg"
          >
            {{ s.icon }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-xl sm:text-2xl font-black text-white font-serif-title truncate group-hover:text-amber-300 transition-colors">
                {{ s.name }}
              </h3>
              <span class="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border" :class="s.badgeColor">
                {{ s.badge }}
              </span>
            </div>
            <p class="text-xs sm:text-sm text-[#A89887] font-medium mt-1 leading-relaxed">
              {{ s.desc }}
            </p>
          </div>
        </div>

        <!-- Middle Highlights Box -->
        <div class="my-3 p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 font-mono text-xs">
          <div class="flex items-center justify-between" :class="s.feature1Color">
            <span class="flex items-center gap-1.5 font-bold"><span>●</span> {{ s.feature1Title }}</span>
            <span class="font-bold">{{ s.feature1Value }}</span>
          </div>
          <div class="flex items-center justify-between text-amber-300">
            <span class="flex items-center gap-1.5 font-bold"><span>●</span> {{ s.feature2Title }}</span>
            <span class="font-bold">{{ s.feature2Value }}</span>
          </div>
        </div>

        <!-- Bottom Section: Stake & Action Button -->
        <div class="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
          <div class="flex flex-col">
            <span class="text-[10px] text-[#A89887] font-mono">底分 / 准入</span>
            <span class="text-base sm:text-lg font-mono font-black text-amber-300">
              🪙 10分 · 100贯
            </span>
          </div>
          <button
            type="button"
            @click.stop="confirmAndEnter(s.id)"
            class="px-5 sm:px-7 py-2 text-xs sm:text-sm font-black rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            :class="
              selectedScene === s.id
                ? s.id === 'noshuffle'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black shadow-amber-500/40 ring-1 ring-amber-300'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/40 ring-1 ring-blue-300'
                : 'bg-white/10 hover:bg-white/20 text-[#E6DEC8]'
            "
          >
            <span>{{ selectedScene === s.id ? '进入牌桌 ➔' : '入座' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Footer Bar -->
    <div class="flex items-center justify-between pt-2.5 border-t border-[#2C211A] shrink-0">
      <div class="text-[10px] sm:text-xs text-[#A89887] flex items-center gap-2 font-mono">
        <span class="text-amber-400">💡 提示：</span>
        <span>双击场景卡片或点击「确定进入牌桌」即刻开始对战</span>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="confirmAndEnter(selectedScene)"
          class="px-7 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-amber-600/40 ring-1 ring-amber-300 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <span>确定进入牌桌</span>
          <span>🃏 ➔</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

export type DoudizhuSceneMode = 'classic' | 'noshuffle';

interface SceneItem {
  id: DoudizhuSceneMode;
  name: string;
  badge: string;
  badgeColor: string;
  icon: string;
  iconBg: string;
  desc: string;
  feature1Title: string;
  feature1Value: string;
  feature1Color: string;
  feature2Title: string;
  feature2Value: string;
}

const props = defineProps<{
  initialScene?: DoudizhuSceneMode;
}>();

const emit = defineEmits<{
  (e: 'select', mode: DoudizhuSceneMode): void;
  (e: 'close'): void;
}>();

const selectedScene = ref<DoudizhuSceneMode>(props.initialScene || 'classic');

const SCENES: SceneItem[] = [
  {
    id: 'classic',
    name: '经典场',
    badge: '传统发牌 · 策略博弈',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    icon: '🃏',
    iconBg: 'bg-blue-900/40 border-blue-500/40 text-blue-300',
    desc: '最正宗的斗地主规则。随机洗牌发牌，考验记牌算牌与叫地主胆略。',
    feature1Title: '洗牌规则',
    feature1Value: '随机洗牌发牌',
    feature1Color: 'text-blue-300',
    feature2Title: '倍数机制',
    feature2Value: '标准底分倍数',
  },
  {
    id: 'noshuffle',
    name: '不洗牌场',
    badge: '炸弹满天飞 · 刺激翻倍',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: '💣',
    iconBg: 'bg-amber-900/40 border-amber-500/40 text-amber-300',
    desc: '不洗牌模式！起手牌型炸弹概率大幅提升，王炸火箭频出，倍数暴增，畅快淋漓！',
    feature1Title: '发牌优化',
    feature1Value: '高概率多炸弹/大牌',
    feature1Color: 'text-amber-400',
    feature2Title: '刺激倍数',
    feature2Value: '初始加倍 & 炸弹上限翻倍',
  },
];

function confirmAndEnter(mode: DoudizhuSceneMode) {
  selectedScene.value = mode;
  emit('select', mode);
}
</script>
