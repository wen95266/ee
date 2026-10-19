<template>
  <div
    ref="containerRef"
    class="w-full h-full select-none absolute inset-0 overflow-hidden flex items-center justify-center"
    :style="{
      backgroundColor: props.tableTheme?.feltColor || '#B91C1C',
      background: `radial-gradient(ellipse at 50% 45%, ${props.tableTheme?.highlightColor || '#EF4444'} 0%, ${props.tableTheme?.feltColor || '#B91C1C'} 60%, ${props.tableTheme?.edgeColor || '#7F1D1D'} 100%)`
    }"
  >
    <!-- Scene Selection Modal (Before entering the table) -->
    <div v-if="!selectedRoom" class="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-40">
      <div class="text-center max-w-md w-full p-6 rounded-3xl bg-gradient-to-b from-[#2D1B12] via-[#1A100B] to-[#2D1B12] border border-amber-500/40 shadow-2xl relative">
        <!-- Return to Lobby Button -->
        <button
          type="button"
          @click="$emit('exit')"
          class="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-xs font-bold text-amber-200 border border-amber-500/60 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-md"
          title="返回游戏大厅"
        >
          <span>🏠</span>
          <span>返回大厅</span>
        </button>

        <div class="text-4xl mb-2 mt-2">🎴</div>
        <h2 class="text-2xl font-extrabold text-amber-300 font-serif-title mb-1">烟三竞技大厅</h2>
        <p class="text-xs text-amber-100/70 mb-6">请选择您要进入的底分场次</p>
        
        <div class="flex flex-col gap-3.5">
          <button
            type="button"
            @click="selectRoom('5-10')"
            class="group relative px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-800/80 to-amber-950/80 hover:from-amber-700 hover:to-amber-900 border border-amber-400/50 text-amber-100 font-bold shadow-lg hover:scale-102 active:scale-98 transition-all flex items-center justify-between"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-lg">🥉</span>
              <div class="text-left">
                <div class="text-sm font-extrabold text-amber-200">新手 5-10 分场</div>
                <div class="text-[10px] text-amber-200/60">适合新手入门，欢快竞技</div>
              </div>
            </div>
            <span class="text-xs font-mono bg-black/40 px-3 py-1 rounded-full text-amber-300 border border-amber-400/30 group-hover:translate-x-1 transition-transform">进入 ➔</span>
          </button>

          <button
            type="button"
            @click="selectRoom('10-20')"
            class="group relative px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-900/80 to-red-950/80 hover:from-red-800 hover:to-red-900 border border-red-400/50 text-red-100 font-bold shadow-lg hover:scale-102 active:scale-98 transition-all flex items-center justify-between"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-lg">🥈</span>
              <div class="text-left">
                <div class="text-sm font-extrabold text-red-200">进阶 10-20 分场</div>
                <div class="text-[10px] text-red-200/60">高手切磋，策略对决</div>
              </div>
            </div>
            <span class="text-xs font-mono bg-black/40 px-3 py-1 rounded-full text-red-300 border border-red-400/30 group-hover:translate-x-1 transition-transform">进入 ➔</span>
          </button>

          <button
            type="button"
            @click="selectRoom('20-40')"
            class="group relative px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-900/90 to-slate-950/90 hover:from-purple-800 hover:to-slate-900 border border-amber-400/60 text-amber-200 font-bold shadow-lg hover:scale-102 active:scale-98 transition-all flex items-center justify-between"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-lg">🥇</span>
              <div class="text-left">
                <div class="text-sm font-extrabold text-amber-300">大师 20-40 分场</div>
                <div class="text-[10px] text-amber-300/60">巅峰对决，惊心动魄</div>
              </div>
            </div>
            <span class="text-xs font-mono bg-black/40 px-3 py-1 rounded-full text-amber-300 border border-amber-400/30 group-hover:translate-x-1 transition-transform">进入 ➔</span>
          </button>
        </div>
      </div>
    </div>

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



      <!-- Rules Explanation Modal -->
      <div
        v-if="showRulesModal"
        class="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto"
        @click.self="showRulesModal = false"
      >
        <div class="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-[#241711] via-[#1A100B] to-[#120B08] border border-amber-500/50 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col overflow-hidden text-left">
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-3 border-b border-amber-500/30 shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🎴</span>
              <div>
                <h3 class="text-lg sm:text-xl font-black text-amber-300 font-serif-title">
                  经典烟三 · 规则指南与牌型比较
                </h3>
                <p class="text-[11px] text-amber-200/70">四人争锋 · 方块四首出 · 有牌必管 · 强攻独霸</p>
              </div>
            </div>
            <button
              type="button"
              @click="showRulesModal = false"
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Modal Scrollable Content -->
          <div class="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 text-xs text-[#E6DEC8] leading-relaxed">
            <!-- 1. 基础首出与顺序 -->
            <div class="p-3 rounded-xl bg-black/40 border border-amber-500/20">
              <div class="font-bold text-amber-300 flex items-center gap-1.5 mb-1 text-sm">
                <span>🚩</span>
                <span>核心首出规则（每局固定方块4先出）</span>
              </div>
              <ul class="list-disc list-inside space-y-1 text-amber-100/90 pl-1">
                <li><strong class="text-amber-200">用牌与人数：</strong>4 人对局，使用一副扑克牌（52张，无大小王），每人 13 张。</li>
                <li><strong class="text-amber-200">首出先手：</strong>每局（包含新开局与强攻重置开局）固定由持有 <span class="text-red-400 font-bold font-mono">方块4 (♦4)</span> 的玩家先手出牌。</li>
                <li><strong class="text-amber-200">首出必须带方块4：</strong>先手玩家打出的牌型组合中，<span class="text-amber-300 underline font-semibold">必须包含方块4</span>（可以出单张♦4、包含♦4的对子、三条、炸弹或顺子等）。</li>
                <li><strong class="text-amber-200">逆时针轮转：</strong>本家 (0) ➔ 东席 (3) ➔ 北席 (2) ➔ 西席 (1) 逆时针流转。</li>
              </ul>
            </div>

            <!-- 2. 点数与花色权重 -->
            <div class="p-3 rounded-xl bg-black/40 border border-amber-500/20">
              <div class="font-bold text-amber-300 flex items-center gap-1.5 mb-1 text-sm">
                <span>🔢</span>
                <span>点数与花色大小（3最大，4最小）</span>
              </div>
              <div class="space-y-1.5">
                <div class="p-2 rounded-lg bg-black/50 font-mono text-center text-amber-300 text-xs sm:text-sm font-bold border border-white/10">
                  3 > 2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4
                </div>
                <div class="text-[11px] text-amber-100/80">
                  • <strong>花色顺序：</strong>黑桃(♠) > 红心(♥) > 梅花(♣) > 方块(♦)。点数相同比花色，黑桃3为全场至尊单张。
                </div>
              </div>
            </div>

            <!-- 3. 可出牌型体系与比较 -->
            <div class="p-3 rounded-xl bg-black/40 border border-amber-500/20">
              <div class="font-bold text-amber-300 flex items-center gap-1.5 mb-1.5 text-sm">
                <span>🃏</span>
                <span>合法牌型与压制比较关系（无纯炸弹，无纯同花）</span>
              </div>
              <div class="space-y-2 text-[11px]">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div class="p-2 rounded-lg bg-white/5 border border-white/10">
                    <div class="font-bold text-amber-200 mb-0.5">① 单张 (1张)</div>
                    <div class="text-amber-100/70">比点数大小(3最大,4最小)；同点数比花色(♠>♥>♣>♦)。</div>
                  </div>
                  <div class="p-2 rounded-lg bg-white/5 border border-white/10">
                    <div class="font-bold text-amber-200 mb-0.5">② 一对 (2张)</div>
                    <div class="text-amber-100/70">2张同点数牌，先比点数；同点数比较两张牌中最大的花色。</div>
                  </div>
                  <div class="p-2 rounded-lg bg-white/5 border border-white/10">
                    <div class="font-bold text-amber-200 mb-0.5">③ 三条 (3张)</div>
                    <div class="text-amber-100/70">3张同点数牌，直接比较点数大小(3×3 最大)。</div>
                  </div>
                </div>

                <div class="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <div class="font-bold text-amber-300 mb-1">④ 五张牌型梯队（牌型最多出5张，高阶直接压低阶）：</div>
                  <div class="space-y-1 font-mono text-[11px]">
                    <div class="text-amber-400 font-bold">【Tier 5 最高】同花顺：同花色5张顺子（含A2345/34567，不可出10JQKA）。先比花色(♠>♥>♣>♦)，相同花色比单张最大的牌</div>
                    <div class="text-purple-300">【Tier 4】四带一：4张同点数 + 任意1张单牌，比4张的点数大小</div>
                    <div class="text-blue-300">【Tier 3】俘虏 (三带一对 / 葫芦)：3张同点 + 1对子，比3张的点数大小</div>
                    <div class="text-emerald-300">【Tier 2】同花：5张同花色牌（<span class="text-amber-300 font-bold">包含同花色 10 J Q K A</span> 或其他同花）。先比花色(♠>♥>♣>♦)，相同花色比单张最大的牌</div>
                    <div class="text-slate-300">【Tier 1】顺子：5张点数相连牌（<span class="text-amber-300 font-bold">包含 A2345 与 34567</span>，<span class="text-red-400 font-bold underline">唯独不可出杂色 10 J Q K A</span>）。<span class="text-amber-300 font-bold">顺子是比单张最大的牌</span></div>
                  </div>
                  <div class="mt-1.5 text-[10px] text-amber-200/70 border-t border-white/10 pt-1">
                    * 牌型铁则：能打出的牌型最多就是五张（无长顺子、无连对、无炸弹）。合法牌型仅限单张、一对、三条、四带一、俘虏、同花、顺子、同花顺。
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. 关键规则约束 -->
            <div class="p-3 rounded-xl bg-black/40 border border-amber-500/20">
              <div class="font-bold text-amber-300 flex items-center gap-1.5 mb-1 text-sm">
                <span>🎯</span>
                <span>跟牌与防守规则（无有牌必管，无需放顶）</span>
              </div>
              <ul class="list-disc list-inside space-y-1 text-amber-100/90 pl-1 text-[11px]">
                <li><strong class="text-amber-200">自由过牌：</strong><span class="text-amber-300 font-semibold">没有“有牌必管”的规则</span>，哪怕手牌中有能管得起的牌型，也可根据战术自由选择“过牌”。</li>
                <li><strong class="text-amber-200">绝大推算连出：</strong>依据公开已出牌库严格数学推算，若打出全场绝对最大牌型（如♠3单张、最大对子、或对手余牌不足/记牌推算无法凑出压制牌型时），<span class="text-amber-300 font-bold">系统判定全场绝大，无需等待其他玩家点过，出牌者直接获得出牌权继续连出</span>！</li>
                <li><strong class="text-amber-200">报单全场警报：</strong>任何玩家手牌仅剩 1 张时触发全场报单警报与醒目红光标识，提示所有玩家严密防守；持单张获得出牌权时将直接出牌获胜！</li>
                <li><strong class="text-amber-200">无需放顶防守：</strong>逆时针下家只剩 1 张手牌（报单）时，<span class="text-amber-300 font-semibold">不需要放顶防守</span>，可自由出任意单牌或其它牌型。</li>
                <li><strong class="text-amber-200">起手特权决断（强攻与投降）：</strong><span class="text-amber-300 font-bold">仅限于同时拿有黑桃A和黑桃3的玩家</span>，且在 <span class="text-amber-200 underline font-semibold">13张手牌均未打出</span> 的情况下显示：
                  <div class="pl-2 mt-0.5 space-y-0.5 text-[10px]">
                    <div>• 觉得牌大可选择【🔥 强攻】：收回所有玩家已打出的牌（非重新发牌），由方块4先出重新开打，独胜独输翻倍。</div>
                    <div>• 觉得牌小可能会输完可选择【🏳️ 投降】：直接结束本局，<span class="text-red-400 font-bold">5-10分场投降者输 15 分，其余三家各得 5 分</span>（10-20场输30各得10，20-40场输60各得20）。</div>
                    <div>• 只要玩家打出任意一张牌，强攻与投降按钮立即消失！</div>
                    <div>• 强攻与投降操作面板位于桌面右上角，<span class="text-amber-300 font-semibold">绝不遮挡底部扑克牌</span>。</div>
                  </div>
                </li>
              </ul>
            </div>

            <!-- 5. 同盟与胜负结算 -->
            <div class="p-3 rounded-xl bg-black/40 border border-amber-500/20">
              <div class="font-bold text-amber-300 flex items-center gap-1.5 mb-1 text-sm">
                <span>🔥</span>
                <span>阵营同盟与终局结算（任一阵营两人出完即结束）</span>
              </div>
              <ul class="list-disc list-inside space-y-1 text-amber-100/90 pl-1 text-[11px]">
                <li><strong class="text-amber-200">阵营划分：</strong>持 <span class="text-white font-bold">♠3</span> 与 <span class="text-white font-bold">♠A</span> 的两人为“同盟”（1号与3号），其余两人为“农民”（2号与4号）。</li>
                <li><strong class="text-amber-200">终局时刻：</strong>当两个农民或者两个同盟的先打完手牌就立即结束游戏。</li>
                <li><strong class="text-amber-200">双胜翻倍 (各10分)：</strong>1号与3号包揽前两名出完（如1,3），1和3各得10分，2和4各输10分；反之2号与4号包揽前两名出完（如2,4），2和4各得10分，1和3各输10分。</li>
                <li><strong class="text-amber-200">单胜 (各5分)：</strong>1号3号分获第1、第3名出完（如123/321/143/341），1和3各得5分，2和4各输5分；反之2号4号分获第1、第3名出完（如214/234/412/432），2和4各得5分，1和3各输5分。</li>
                <li><strong class="text-amber-200">势均打和 (0分)：</strong>一方拿下第1名但另一方包揽第2、第3名出完（如124/142/324/342/213/231/413/431），双方打和，大家都没有输赢（各得0分）。</li>
              </ul>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="pt-3 border-t border-amber-500/30 flex justify-end shrink-0">
            <button
              type="button"
              @click="showRulesModal = false"
              class="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              已知晓规则 · 返回牌局
            </button>
          </div>
        </div>
      </div>

      <!-- Floating Error Alert Tip (Top Center) -->
      <div
        v-if="errorTip"
        class="absolute top-11 left-1/2 -translate-x-1/2 z-25 px-3.5 py-0.5 rounded-full bg-black/80 border border-white/15 text-xs text-amber-200 font-bold shadow-md animate-bounce"
      >
        ⚠️ {{ errorTip }}
      </div>

      <!-- Floating Danmaku Barrage for Qiang Gong Announcement -->
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-4 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
        <div
          v-if="danmakuText"
          class="absolute top-14 left-1/2 -translate-x-1/2 z-35 pointer-events-none max-w-[94vw] text-center"
        >
          <div class="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-red-600 via-amber-600 to-red-600 border-2 border-amber-300 text-white font-extrabold text-xs sm:text-sm shadow-[0_0_28px_rgba(239,68,68,0.95)] flex items-center gap-2 justify-center animate-pulse">
            <span class="text-base sm:text-lg">🔥</span>
            <span class="tracking-wide text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">{{ danmakuText }}</span>
            <span class="text-base sm:text-lg">🔥</span>
          </div>
        </div>
      </transition>

      <!-- Floating Unbeatable (全场绝大·无需等待点过) Notice -->
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-4 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
        <div
          v-if="unbeatableNotice"
          class="absolute top-14 left-1/2 -translate-x-1/2 z-35 pointer-events-none max-w-[94vw] text-center"
        >
          <div class="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border-2 border-yellow-200 text-stone-950 font-black text-xs sm:text-sm shadow-[0_0_32px_rgba(245,158,11,0.95)] flex items-center gap-2 justify-center animate-bounce">
            <span class="text-base sm:text-lg">👑</span>
            <span class="tracking-wide drop-shadow-sm">{{ unbeatableNotice }}</span>
            <span class="text-base sm:text-lg">👑</span>
          </div>
        </div>
      </transition>

      <!-- Floating 报单警报 Notice (余1张牌警报提示) -->
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-4 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-4">
        <div
          v-if="baodanNotice"
          class="absolute top-26 left-1/2 -translate-x-1/2 z-35 pointer-events-none max-w-[94vw] text-center"
        >
          <div class="px-5 sm:px-6 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 border-2 border-red-300 text-white font-black text-xs sm:text-sm shadow-[0_0_24px_rgba(239,68,68,0.95)] flex items-center gap-2 justify-center animate-pulse">
            <span class="text-base sm:text-lg">🚨</span>
            <span class="tracking-wide drop-shadow">{{ baodanNotice }}</span>
            <span class="text-base sm:text-lg">🚨</span>
          </div>
        </div>
      </transition>

      <!-- In-Table Floating Action Buttons (手牌底部居中操作栏：加大间距防误触，层次分明) -->
      <div
        v-if="selectedRoom && winnerSeat === null && (turnSeat === 0 || canShowQiangGongBtn || canShowSurrenderBtn)"
        class="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 sm:gap-4 md:gap-5 pointer-events-auto px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-black/90 backdrop-blur-md border border-amber-500/30 shadow-[0_6px_28px_rgba(0,0,0,0.85)]"
      >
        <!-- 特殊操作组（仅限持双煞且未出牌时）：强攻 / 投降，与常规按钮保持清晰视觉隔离 -->
        <div v-if="canShowQiangGongBtn || canShowSurrenderBtn" class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- 强攻按钮 -->
          <button
            v-if="canShowQiangGongBtn"
            type="button"
            @click="handleQiangGong(0)"
            class="px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-[0_0_16px_rgba(239,68,68,0.9)] border border-amber-300 ring-2 ring-red-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 animate-pulse cursor-pointer shrink-0"
            title="开启强攻：所有已出牌收回，由方块4先出重新开打，独胜独输翻倍"
          >
            <span>🔥</span>
            <span>强攻</span>
          </button>

          <!-- 投降按钮 -->
          <button
            v-if="canShowSurrenderBtn"
            type="button"
            @click="handleSurrender"
            class="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-400/50 text-stone-200 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            title="起手投降认输：5-10分场输15分，其余三家各得5分"
          >
            <span>🏳️</span>
            <span>投降</span>
          </button>

          <!-- 分隔竖线 -->
          <div class="h-6 sm:h-7 w-px bg-white/20 mx-0.5 sm:mx-1"></div>
        </div>

        <!-- 常规出牌按钮组：包含 60秒倒计时 / 提示 / 过牌 / 出牌 / 托管 -->
        <template v-if="turnSeat === 0">
          <!-- 60秒限时倒计时指示器（超时1分钟自动托管） -->
          <div
            v-if="!isAutoHost"
            class="px-2 sm:px-2.5 py-1.5 rounded-xl bg-black/60 border text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1 shrink-0"
            :class="turnCountdown <= 10 ? 'text-red-400 border-red-500/80 animate-pulse' : 'text-amber-300 border-amber-500/40'"
            title="本手思考时间上限60秒，倒计时归零将自动启动智能托管"
          >
            <span>⏱️</span>
            <span class="tabular-nums">{{ turnCountdown }}s</span>
          </div>

          <!-- 提示按钮 -->
          <button
            type="button"
            @click="handleHint"
            class="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-400/50 text-amber-200 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            title="智能推荐可大过桌面的合法手牌组合"
          >
            <span>💡</span>
            <span>提示</span>
          </button>

          <!-- 过牌按钮 (与出牌按钮拉开充足间隔，杜绝手滑误点过牌) -->
          <button
            type="button"
            @click="handlePass"
            :disabled="!lastCombo || lastCombo.seat === 0"
            class="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-400/40 text-[#E6DEC8] disabled:opacity-25 disabled:pointer-events-none shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="不出本轮手牌，过牌给下一家"
          >
            过牌
          </button>

          <!-- 出牌按钮 (高亮主行动键，更大更醒目) -->
          <button
            type="button"
            @click="handlePlay"
            :disabled="selectedIds.size === 0"
            class="px-4.5 sm:px-7 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white disabled:opacity-30 disabled:pointer-events-none shadow-[0_4px_22px_rgba(239,68,68,0.7)] hover:scale-105 active:scale-95 transition-all ring-2 ring-red-400 flex items-center gap-1.5 cursor-pointer shrink-0"
            title="打出当前选中的手牌组合"
          >
            <span>出牌</span>
            <span v-if="selectedIds.size > 0" class="text-[11px] font-mono bg-black/40 px-1.5 py-0.5 rounded-full border border-white/20">
              {{ selectedIds.size }}
            </span>
          </button>

          <!-- 托管按钮（手牌下常驻托管控制） -->
          <button
            type="button"
            @click="toggleAutoHost"
            class="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 shadow-md"
            :class="isAutoHost ? 'bg-amber-600/90 hover:bg-amber-500 text-white border-amber-300 ring-2 ring-amber-400 animate-pulse' : 'bg-stone-800/90 hover:bg-stone-700 text-amber-200 border-amber-500/40'"
            :title="isAutoHost ? '点击取消托管' : '开启自动托管（超时1分钟也会自动托管）'"
          >
            <span>🤖</span>
            <span>{{ isAutoHost ? '取消托管' : '托管' }}</span>
          </button>
        </template>

        <!-- 非本家回合但持有双煞时，在强攻/投降右侧显示等待提示与托管按钮 -->
        <div
          v-else-if="canShowQiangGongBtn || canShowSurrenderBtn"
          class="text-xs text-amber-200/80 px-2 font-mono flex items-center gap-2.5"
        >
          <span>⏳</span>
          <span class="hidden sm:inline">等待其他玩家出牌中...</span>
          <button
            type="button"
            @click="toggleAutoHost"
            class="px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-sm active:scale-95"
            :class="isAutoHost ? 'bg-amber-600 text-white border-amber-300' : 'bg-stone-800 text-amber-300 border-amber-500/30'"
          >
            🤖 {{ isAutoHost ? '取消托管' : '托管' }}
          </button>
        </div>
      </div>

      <!-- 非本家回合且无特殊操作时，在底部展示轻量托管切换栏 -->
      <div
        v-if="selectedRoom && winnerSeat === null && turnSeat !== 0 && !canShowQiangGongBtn && !canShowSurrenderBtn"
        class="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 pointer-events-auto px-4 py-1.5 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
      >
        <span class="text-xs text-amber-200/70 font-mono flex items-center gap-1">
          <span>⏳</span>
          <span>{{ ['本家', '西席', '北席', '东席'][turnSeat] }} 思考出牌中...</span>
        </span>
        <button
          type="button"
          @click="toggleAutoHost"
          class="ml-1 px-3 py-1 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
          :class="isAutoHost ? 'bg-amber-600 text-white border-amber-300 ring-1 ring-amber-400 animate-pulse' : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-amber-500/40'"
          :title="isAutoHost ? '点击取消托管' : '提前开启托管，轮到本家时由增强AI自动出牌'"
        >
          <span>🤖</span>
          <span>{{ isAutoHost ? '托管中 · 取消' : '托管' }}</span>
        </button>
      </div>

      <!-- 托管状态大浮层提示（置于手牌上方，醒目易见，支持一键取消托管） -->
      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
        <div
          v-if="isAutoHost && selectedRoom && winnerSeat === null"
          class="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-25 flex items-center gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-950/95 via-stone-900/95 to-amber-950/95 backdrop-blur-md border-2 border-amber-400/90 shadow-[0_0_24px_rgba(245,158,11,0.65)] pointer-events-auto"
        >
          <div class="flex items-center gap-2">
            <span class="text-lg animate-bounce">🤖</span>
            <div>
              <div class="text-xs sm:text-sm text-amber-200 font-extrabold tracking-wide flex items-center gap-1.5">
                <span>增强AI托管对局中</span>
                <span class="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full font-mono">超时/自主</span>
              </div>
              <div class="text-[10px] text-amber-200/70">高智能同盟协助 · 随时点击右侧解除</div>
            </div>
          </div>
          <button
            type="button"
            @click="toggleAutoHost"
            class="ml-2 px-3.5 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white border border-amber-200 shadow-md active:scale-95 cursor-pointer transition-all flex items-center gap-1 shrink-0"
          >
            <span>✕</span>
            <span>取消托管</span>
          </button>
        </div>
      </transition>

      <!-- Victory Modal (Landscape adapted) -->
      <div v-if="winnerSeat !== null" class="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 text-center z-30 overflow-y-auto">
        <div class="text-3xl sm:text-4xl mb-1.5">{{ allianceScoreResult?.isTie ? '🤝' : '🏆' }}</div>
        <h3 class="text-xl sm:text-2xl font-bold text-amber-400 mb-1 font-serif-title">
          {{ allianceScoreResult?.isTie ? '烟三对局结束 · 双方平局打和！' : `烟三对局结束 · ${allianceScoreResult?.winnerAlliance} 获胜！` }}
        </h3>
        <p class="text-xs sm:text-sm text-amber-200/90 mb-3 font-mono max-w-xl">
          {{ allianceScoreResult?.summary }}
        </p>

        <!-- 各席位得分清单 -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 w-full max-w-lg">
          <div
            v-for="(sc, sIdx) in (allianceScoreResult?.seatScores || [0,0,0,0])"
            :key="sIdx"
            class="p-2 rounded-xl bg-black/60 border border-white/10 text-center"
            :class="{ 'border-amber-400/50 bg-amber-950/40': sIdx === winnerSeat }"
          >
            <div class="text-[11px] text-stone-400 font-semibold">{{ ['本家', '西席', '北席', '东席'][sIdx] }}</div>
            <div class="text-sm font-bold font-mono" :class="sc >= 0 ? 'text-amber-400' : 'text-red-400'">
              {{ sc >= 0 ? `+${sc}` : sc }} 分
            </div>
          </div>
        </div>

        <p class="text-[11px] sm:text-xs text-[#B8A99A] mb-4">
          出牌出清顺序：{{ finishedSeats.map(s => `${s+1}号玩家(${['本家', '西席', '北席', '东席'][s]})`).join(' ➔ ') }}
        </p>
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="selectedRoom = null"
            class="px-5 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 shadow-lg active:scale-95"
          >
            返回大厅
          </button>
          <button
            type="button"
            @click="dealNewMatch"
            class="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 shadow-lg active:scale-95"
          >
            再战烟三
          </button>
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
import {
  detectYansanSpecialHolders,
  calculateYansanSettlement,
  calculateYansanSurrenderSettlement,
  getYansanAIPlay,
  parseYansanCombo,
  isYansanComboDeductivelyUnbeatable,
  YansanCard,
  YansanCombo
} from '../../engine/yansanRules';

interface Card {
  id: string;
  rank: number; // 3..15 (15=2, 14=A, 13=K... 3=3)
  suitVal: number; // 4=♠, 3=♥, 2=♣, 1=♦
  label: string;
  suit: '♠' | '♥' | '♣' | '♦';
  isRed: boolean;
}

interface Combo {
  seat: number;
  cards: Card[];
  type: string;
  comboTier?: number;
  primaryRank: number;
  primarySuitVal: number;
  flushSuit?: number;
  label: string;
}

const props = defineProps<{
  tableTheme?: TableTheme;
  isRotated90?: boolean;
}>();

const emit = defineEmits<{
  (e: 'move', payload: any): void;
  (e: 'restart'): void;
  (e: 'fx', payload: any): void;
  (e: 'status', payload: any): void;
  (e: 'exit'): void;
}>();

function emitStatus() {
  emit('status', {
    turnSeat: turnSeat.value,
    turnText: turnSeat.value === 0 ? '轮到本家' : `席位${turnSeat.value + 1}出牌`,
    cards: hands[0]?.length || 0,
    isAutoHost: isAutoHost.value,
  });
}

watch(() => props.tableTheme, () => {
  drawTable();
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
const hands = reactive<Card[][]>([[], [], [], []]);
const initialHands: Card[][] = [[], [], [], []];
const selectedIds = reactive(new Set<string>());
const turnSeat = ref(0);
const lastCombo = ref<Combo | null>(null);
const seatStatus = reactive(['等待出牌', '等待', '等待', '等待']);
const winnerSeat = ref<number | null>(null);
const errorTip = ref('');
const isDragging = ref(false);
const isFirstTurn = ref(true);
const showRulesModal = ref(false);
const consecutivePasses = ref(0);

// 记牌器历史与全场绝大推算
const playedCardsHistory = ref<Card[]>([]);
const unbeatableNotice = ref('');
let unbeatableTimer: any = null;
let unbeatablePauseTimer: any = null;

// 报单警报状态（仅剩1张牌）
const baodanNotice = ref('');
let baodanTimer: any = null;
const baodanAlertedSeats = reactive(new Set<number>());

function checkAndTriggerBaoDan(seat: number) {
  if (hands[seat].length === 1 && !baodanAlertedSeats.has(seat) && !finishedSeats.includes(seat)) {
    baodanAlertedSeats.add(seat);
    const names = ['本家', '西席', '北席', '东席'];
    const seatName = names[seat];
    baodanNotice.value = seat === 0
      ? '🚨 警报：您已报单（仅剩最后 1 张手牌）！'
      : `🚨 警报：【${seatName}】已报单（仅剩 1 张手牌）！`;
    if (baodanTimer) clearTimeout(baodanTimer);
    baodanTimer = setTimeout(() => {
      baodanNotice.value = '';
    }, 3200);

    if (seat === 0) {
      soundFX.speakAction('baodan_self');
    } else {
      soundFX.speakVoice(`${seatName}报单，只剩一张牌！`);
    }
    haptics.tap();
  }
}
const isQiangGongActive = ref(false);
const qiangGongSeat = ref<number | null>(null);
const danmakuText = ref('');
let danmakuTimer: any = null;
const spade3Seat = ref(0);
const spadeASeat = ref(0);
const animTime = ref(0);
let animFrameId: number | null = null;
let botTimer: any = null;

function hasSpade3AndA(seat: number): boolean {
  const h = hands[seat];
  if (!h || h.length === 0) return false;
  return h.some(c => c.rank === 3 && c.suit === '♠') && h.some(c => c.rank === 14 && c.suit === '♠');
}

// 强攻按钮：拿有黑桃A和黑桃3的玩家13张手牌都没有出的情况下才显示强攻按钮，只要手牌不足13张就不显示，点击强攻后强攻按钮消失
const canShowQiangGongBtn = computed(() => {
  return (
    !!selectedRoom.value &&
    winnerSeat.value === null &&
    !isQiangGongActive.value &&
    (hands[0]?.length === 13) &&
    hasSpade3AndA(0)
  );
});

// 投降按钮：仅限于同时拿有黑桃A和黑桃3的玩家，且在13张手牌都没有出的情况下显示，只要打出任意一张牌或强攻后就消失
const canShowSurrenderBtn = computed(() => {
  return (
    !!selectedRoom.value &&
    winnerSeat.value === null &&
    !isQiangGongActive.value &&
    (hands[0]?.length === 13) &&
    hasSpade3AndA(0)
  );
});

function handleSurrender() {
  if (winnerSeat.value !== null || (hands[0]?.length || 0) !== 13) return;

  stopTurnCountdown();
  if (botTimer) clearTimeout(botTimer);
  if (autoHostTimer) clearTimeout(autoHostTimer);
  if (animFrameId) cancelAnimationFrame(animFrameId);

  const res = calculateYansanSurrenderSettlement(selectedRoom.value || '5-10', 0);
  winnerSeat.value = 1;
  finishedSeats.splice(0, finishedSeats.length, 1, 2, 3, 0);

  allianceScoreResult.value = {
    winnerAlliance: res.winnerAlliance,
    score: Math.abs(res.seatScores[0]),
    summary: res.summary,
    seatScores: res.seatScores,
  };

  if (typeof soundFX.playDefeat === 'function') soundFX.playDefeat();
  else soundFX.playTap?.();
  soundFX.speakVoice('本家起手认输投降！', 1.05, 1.0);
  drawTable();

  emit('move', {
    winner: 1,
    pointsDelta: res.seatScores[0],
    detailText: res.summary,
    finishedSeats: [...finishedSeats],
    allianceScoreResult: allianceScoreResult.value,
  });
}

function handleQiangGong(seat: number) {
  if (isQiangGongActive.value || winnerSeat.value !== null) return;
  if (!hasSpade3AndA(seat) || (hands[seat]?.length || 0) !== 13) return;

  isQiangGongActive.value = true;
  qiangGongSeat.value = seat;

  // 1. 所有玩家打出的牌自动收回去，恢复初始13张手牌，重新开始出牌
  for (let i = 0; i < 4; i++) {
    hands[i] = sortCards([...initialHands[i]]);
  }
  lastCombo.value = null;
  consecutivePasses.value = 0;
  playedCardsHistory.value = [];
  baodanAlertedSeats.clear();
  unbeatableNotice.value = '';
  baodanNotice.value = '';
  finishedSeats.splice(0, finishedSeats.length);
  selectedIds.clear();
  errorTip.value = '';

  // 强攻不是首出牌权，仍然由方块4先出
  let starter = 0;
  for (let i = 0; i < 4; i++) {
    if (initialHands[i].some((c) => c.rank === 4 && c.suit === '♦')) {
      starter = i;
      break;
    }
  }
  turnSeat.value = starter;
  isFirstTurn.value = true;

  const seatNames = ['本家', '西席', '北席', '东席'];
  for (let i = 0; i < 4; i++) {
    seatStatus[i] = i === starter ? '先手出方块4' : '等待';
  }

  // 2. 弹幕提示其他玩家该玩家强攻，倍数翻倍
  const announcer = seatNames[seat];
  danmakuText.value = `🔥【${announcer} 宣布强攻】倍数翻倍！所有手牌收回，重新出牌！`;
  if (danmakuTimer) clearTimeout(danmakuTimer);
  danmakuTimer = setTimeout(() => {
    danmakuText.value = '';
  }, 4500);

  // 3. 语音播报与音效
  soundFX.playCardSnap(true);
  soundFX.speakVoice(`${announcer}宣布强攻！倍数翻倍，重新出牌！`, 1.1, 1.05);
  emit('fx', 'bomb');
  haptics.bomb();

  // 4. 保持头像框变成红色一闪一闪
  startPulseLoop();
  drawTable();

  if (starter !== 0) {
    stopTurnCountdown();
    if (botTimer) clearTimeout(botTimer);
    botTimer = setTimeout(() => {
      runBotTurns(starter);
    }, 700);
  } else if (isAutoHost.value) {
    stopTurnCountdown();
    checkAutoHostTurn();
  } else {
    startTurnCountdown();
  }
}

function startPulseLoop() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  function loop() {
    if (!isQiangGongActive.value || winnerSeat.value !== null) {
      drawTable();
      return;
    }
    animTime.value = performance.now();
    drawTable();
    animFrameId = requestAnimationFrame(loop);
  }
  animFrameId = requestAnimationFrame(loop);
}

const isAutoHost = ref(false);
let autoHostTimer: any = null;
const turnCountdown = ref(60);
let countdownInterval: any = null;

function startTurnCountdown() {
  stopTurnCountdown();
  if (turnSeat.value === 0 && winnerSeat.value === null && !isAutoHost.value) {
    turnCountdown.value = 60;
    countdownInterval = setInterval(() => {
      if (turnSeat.value !== 0 || winnerSeat.value !== null || isAutoHost.value) {
        stopTurnCountdown();
        return;
      }
      turnCountdown.value--;
      if (turnCountdown.value <= 0) {
        stopTurnCountdown();
        isAutoHost.value = true;
        errorTip.value = '思考超时1分钟，已自动开启托管！';
        if (typeof soundFX.speakVoice === 'function') {
          soundFX.speakVoice('思考超时，自动开启托管');
        }
        emitStatus();
        checkAutoHostTurn();
      }
    }, 1000);
  }
}

function stopTurnCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  turnCountdown.value = 60;
}

const selectedRoom = ref<string | null>(null);

function selectRoom(room: string) {
  selectedRoom.value = room;
  soundFX.playTap();
  dealNewMatch();
}

function toggleAutoHost() {
  isAutoHost.value = !isAutoHost.value;
  soundFX.playTap();
  emitStatus();
  if (isAutoHost.value) {
    stopTurnCountdown();
    if (turnSeat.value === 0 && winnerSeat.value === null) {
      checkAutoHostTurn();
    }
  } else {
    if (turnSeat.value === 0 && winnerSeat.value === null) {
      startTurnCountdown();
    }
  }
}

function checkAutoHostTurn() {
  if (!isAutoHost.value || turnSeat.value !== 0 || winnerSeat.value !== null) return;
  if (autoHostTimer) clearTimeout(autoHostTimer);

  seatStatus[0] = '🤖 托管思考出牌中...';
  drawTable();

  // 自愈修复：若本家手中无方块4，说明首出已结束，重置首出标记防卡死
  if (isFirstTurn.value && !hands[0].some((c) => c.rank === 4 && c.suit === '♦')) {
    isFirstTurn.value = false;
  }

  // 拟真思考时间 (300ms ~ 500ms)，迅速响应，防止卡顿
  const delay = 320 + Math.floor(Math.random() * 180);
  autoHostTimer = setTimeout(() => {
    if (!isAutoHost.value || turnSeat.value !== 0 || winnerSeat.value !== null) return;

    if (isFirstTurn.value && !hands[0].some((c) => c.rank === 4 && c.suit === '♦')) {
      isFirstTurn.value = false;
    }

    let playCards = getEnhancedAIPlay(0);

    // 校验牌型是否能真正打出并大过桌面
    if (playCards && playCards.length > 0) {
      const ev = evaluateCombo(playCards, 0);
      if (!ev || (lastCombo.value && lastCombo.value.seat !== 0 && !canBeat(ev, lastCombo.value))) {
        playCards = null;
      }
    }

    // 领牌保障：若是本家领牌回合(桌面无牌或上一手为本家出牌)，绝对不可过牌，必须出牌！
    const isLeadTurn = !lastCombo.value || lastCombo.value.seat === 0;
    if (isLeadTurn && (!playCards || playCards.length === 0)) {
      const d4 = isFirstTurn.value ? hands[0].find((c) => c.rank === 4 && c.suit === '♦') : null;
      const smallest = sortCards(hands[0])[0];
      playCards = d4 ? [d4] : (smallest ? [smallest] : null);
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

        // 终极容错保障：若 handlePlay 异常未能推进，强制兜底解决卡死
        if (turnSeat.value === 0 && winnerSeat.value === null && isAutoHost.value) {
          if (lastCombo.value && lastCombo.value.seat !== 0) {
            handlePass();
          } else {
            const fallbackCard = (isFirstTurn.value && hands[0].find((c) => c.rank === 4 && c.suit === '♦')) || sortCards(hands[0])[0];
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
        const fallbackCard = (isFirstTurn.value && hands[0].find((c) => c.rank === 4 && c.suit === '♦')) || sortCards(hands[0])[0];
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
  { rank: 3, label: '3' }, { rank: 4, label: '4' }, { rank: 5, label: '5' },
  { rank: 6, label: '6' }, { rank: 7, label: '7' }, { rank: 8, label: '8' },
  { rank: 9, label: '9' }, { rank: 10, label: '10' }, { rank: 11, label: 'J' },
  { rank: 12, label: 'Q' }, { rank: 13, label: 'K' }, { rank: 14, label: 'A' },
  { rank: 15, label: '2' },
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

function getRankWeight(rank: number): number {
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

function getCardPower(c: Card): number {
  return getRankWeight(c.rank) * 10 + c.suitVal;
}

function sortCards(c: Card[]): Card[] {
  return [...c].sort((a, b) => getCardPower(b) - getCardPower(a));
}

const finishedSeats = reactive<number[]>([]);
const allianceScoreResult = ref<{ winnerAlliance: string; score: number; summary: string; seatScores?: number[] } | null>(null);

function dealNewMatch() {
  if (!selectedRoom.value) return;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (botTimer) clearTimeout(botTimer);
  if (unbeatablePauseTimer) clearTimeout(unbeatablePauseTimer);
  if (danmakuTimer) clearTimeout(danmakuTimer);
  danmakuText.value = '';
  isQiangGongActive.value = false;
  qiangGongSeat.value = null;

  const deck = createDeck();
  initialHands[0] = sortCards(deck.slice(0, 13));
  initialHands[1] = sortCards(deck.slice(13, 26));
  initialHands[2] = sortCards(deck.slice(26, 39));
  initialHands[3] = sortCards(deck.slice(39, 52));

  hands[0] = [...initialHands[0]];
  hands[1] = [...initialHands[1]];
  hands[2] = [...initialHands[2]];
  hands[3] = [...initialHands[3]];

  // 检测黑桃3与黑桃A持有人，动态确立同盟（同盟不固定位置）
  const holders = detectYansanSpecialHolders(hands);
  spade3Seat.value = holders.spade3Seat;
  spadeASeat.value = holders.spadeASeat;

  let starter = 0;
  for (let i = 0; i < 4; i++) {
    if (hands[i].some((c) => c.rank === 4 && c.suit === '♦')) {
      starter = i;
      break;
    }
  }
  turnSeat.value = starter;
  isFirstTurn.value = true;
  lastCombo.value = null;
  consecutivePasses.value = 0;
  playedCardsHistory.value = [];
  baodanAlertedSeats.clear();
  unbeatableNotice.value = '';
  baodanNotice.value = '';
  winnerSeat.value = null;
  finishedSeats.splice(0, finishedSeats.length);
  allianceScoreResult.value = null;
  selectedIds.clear();
  seatStatus.forEach((_, idx) => {
    seatStatus[idx] = idx === starter ? '先手出方块4' : '等待';
  });

  drawTable();
  emit('restart');
  emitStatus();

  if (starter !== 0) {
    stopTurnCountdown();
    // 留出 2.0 秒给洗发牌与玩家理牌看牌时间，避免刚进房间就听到机器人出牌语音
    seatStatus[starter] = `${['本家', '西席', '北席', '东席'][starter]} 执♦4准备首出...`;
    if (botTimer) clearTimeout(botTimer);
    botTimer = setTimeout(() => {
      if (!selectedRoom.value) return;
      runBotTurns(starter);
    }, 2000);
  } else if (isAutoHost.value && turnSeat.value === 0) {
    stopTurnCountdown();
    checkAutoHostTurn();
  } else {
    startTurnCountdown();
  }
}

// 逆时针寻找下一个手牌未走完的存活席位：本家(0) ➔ 东席(3) ➔ 北席(2) ➔ 西席(1) ➔ 本家(0)
function getNextActiveSeat(fromSeat: number): number {
  let s = (fromSeat - 1 + 4) % 4;
  let guard = 0;
  while (finishedSeats.includes(s) && guard < 4) {
    s = (s - 1 + 4) % 4;
    guard++;
  }
  return s;
}

function checkGameFinishAfterPlay(seat: number) {
  if (!finishedSeats.includes(seat)) {
    finishedSeats.push(seat);
  }

  const isQiangGong = isQiangGongActive.value;
  let shouldEnd = false;

  if (isQiangGong) {
    // 强攻规则：只要强攻者打完，或者其他任意一家打完，游戏立即结束！
    shouldEnd = finishedSeats.length >= 1;
  } else if (spade3Seat.value !== spadeASeat.value) {
    // 2v2 经典同盟对决：
    // 当两个农民或者两个同盟的先打完手牌就立即结束游戏！
    const spadeFinishedCount = finishedSeats.filter(
      (s) => s === spade3Seat.value || s === spadeASeat.value
    ).length;
    const farmerFinishedCount = finishedSeats.filter(
      (s) => s !== spade3Seat.value && s !== spadeASeat.value
    ).length;

    shouldEnd = spadeFinishedCount >= 2 || farmerFinishedCount >= 2;
  } else {
    // 独占 ♠3 & ♠A (1 vs 3 模式):
    const soloSeat = spade3Seat.value;
    const soloFinished = finishedSeats.includes(soloSeat);
    const farmerFinishedCount = finishedSeats.filter((s) => s !== soloSeat).length;
    shouldEnd = soloFinished || farmerFinishedCount >= 2;
  }

  if (shouldEnd) {
    if (botTimer) clearTimeout(botTimer);
    if (autoHostTimer) clearTimeout(autoHostTimer);
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const firstWinner = finishedSeats[0];
    winnerSeat.value = firstWinner;

    const result = calculateYansanSettlement(
      selectedRoom.value || '5-10',
      firstWinner,
      isQiangGongActive.value,
      qiangGongSeat.value,
      spade3Seat.value,
      spadeASeat.value,
      [...finishedSeats]
    );

    allianceScoreResult.value = {
      winnerAlliance: result.winnerAlliance,
      score: Math.abs(result.seatScores[0]),
      summary: result.summary,
      seatScores: result.seatScores,
      isTie: result.isTie,
    };

    const myDelta = result.seatScores[0];
    if (myDelta > 0) {
      if (typeof soundFX.playVictory === 'function') soundFX.playVictory();
      else soundFX.playTap?.();
    } else if (myDelta < 0) {
      if (typeof soundFX.playDefeat === 'function') soundFX.playDefeat();
      else soundFX.playTap?.();
    } else {
      soundFX.playTap?.();
      soundFX.speakVoice?.('双方势均力敌，本局打和！');
    }

    emit('move', {
      winner: myDelta > 0 ? 0 : (myDelta < 0 ? firstWinner : -1),
      pointsDelta: myDelta,
      detailText: result.summary,
      finishedSeats: [...finishedSeats],
      allianceScoreResult: allianceScoreResult.value,
    });
  }
}

function evaluateCombo(cards: Card[], seat: number): Combo | null {
  if (cards.length === 0) return null;
  const sorted = sortCards(cards);
  const n = sorted.length;
  const counts = new Map<number, number>();
  for (const c of sorted) counts.set(c.rank, (counts.get(c.rank) || 0) + 1);

  // 1. 单张 (1张)
  if (n === 1) {
    return { seat, cards: sorted, type: 'single', primaryRank: sorted[0].rank, primarySuitVal: getCardPower(sorted[0]), label: `单张 ${sorted[0].label}${sorted[0].suit}` };
  }

  // 2. 一对 (2张)
  if (n === 2 && sorted[0].rank === sorted[1].rank) {
    return { seat, cards: sorted, type: 'pair', primaryRank: sorted[0].rank, primarySuitVal: Math.max(getCardPower(sorted[0]), getCardPower(sorted[1])), label: `对子 ${sorted[0].label}对` };
  }

  // 3. 三条 (3张)
  if (n === 3 && counts.size === 1) {
    return { seat, cards: sorted, type: 'triple', primaryRank: sorted[0].rank, primarySuitVal: getCardPower(sorted[0]), label: `三条 ${sorted[0].label}` };
  }

  // 烟三规则：没有纯4张炸弹，没有纯同花！

  // 4. 五张牌型（顺子、同花、俘虏、四带一、同花顺）
  if (n === 5) {
    const isFlush = sorted.every((c) => c.suit === sorted[0].suit);
    const ranks = sorted.map(c => c.rank).sort((a, b) => a - b);
    
    // 顺子判断：连续5张递增1，或者特殊回环顺 A-2-3-4-5
    let isNormalSeq = true;
    for (let i = 1; i < 5; i++) {
      if (ranks[i] !== ranks[i - 1] + 1) {
        isNormalSeq = false;
        break;
      }
    }
    const isA2345 = (ranks[0] === 3 && ranks[1] === 4 && ranks[2] === 5 && ranks[3] === 14 && ranks[4] === 15);
    const is10JQKA = (ranks[0] === 10 && ranks[1] === 11 && ranks[2] === 12 && ranks[3] === 13 && ranks[4] === 14);
    
    // 烟三规则：10JQKA 如果同花可以出（属于同花牌型，不属于同花顺）；如果是杂色则不可出！
    const isLegalStraight = (isNormalSeq || isA2345) && !is10JQKA;

    // ① 同花顺 (Tier 5)：同花色且构成合法顺子 (允许A2345/34567，不可出10JQKA)
    // 规则：同花顺先比花色(♠>♥>♣>♦)，相同花色比单张最大的牌
    if (isFlush && isLegalStraight) {
      const maxCard = sorted.reduce((max, c) => (getCardPower(c) > getCardPower(max) ? c : max), sorted[0]);
      return {
        seat,
        cards: sorted,
        type: '5_card',
        comboTier: 5,
        primaryRank: maxCard.rank,
        primarySuitVal: getCardPower(maxCard),
        flushSuit: sorted[0].suitVal,
        label: isA2345 ? `同花顺 (A2345 · ${maxCard.suit})` : `同花顺 (${maxCard.suit})`
      };
    }

    // ② 四带一 (Tier 4)：4张相同点数 + 任意1张单牌
    for (const [rk, cnt] of counts.entries()) {
      if (cnt === 4) {
        return {
          seat,
          cards: sorted,
          type: '5_card',
          comboTier: 4,
          primaryRank: rk,
          primarySuitVal: 0,
          label: `四带一`
        };
      }
    }

    // ③ 俘虏 (Tier 3)：3张同点 + 1个对子 (三带一对 / 葫芦)
    for (const [rk, cnt] of counts.entries()) {
      if (cnt === 3 && counts.size === 2) {
        return {
          seat,
          cards: sorted,
          type: '5_card',
          comboTier: 3,
          primaryRank: rk,
          primarySuitVal: 0,
          label: `俘虏 (三带一对)`
        };
      }
    }

    // ④ 同花 (Tier 2)：5张同花色牌（包含同花色 10 J Q K A，或其他同花）
    // 规则：同花先比花色(♠>♥>♣>♦)，相同花色比单张最大的牌
    if (isFlush) {
      const maxCard = sorted.reduce((max, c) => (getCardPower(c) > getCardPower(max) ? c : max), sorted[0]);
      return {
        seat,
        cards: sorted,
        type: '5_card',
        comboTier: 2,
        primaryRank: maxCard.rank,
        primarySuitVal: getCardPower(maxCard),
        flushSuit: sorted[0].suitVal,
        label: is10JQKA ? `同花 (10JQKA · ${sorted[0].suit})` : `同花 (${sorted[0].suit})`
      };
    }

    // ⑤ 顺子 (Tier 1)：5张杂色点数相连牌，包含A2345与34567，唯独不可出杂色 10 J Q K A
    // 规则：顺子是比单张最大的牌
    if (isLegalStraight) {
      const maxCard = sorted.reduce((max, c) => (getCardPower(c) > getCardPower(max) ? c : max), sorted[0]);
      return {
        seat,
        cards: sorted,
        type: '5_card',
        comboTier: 1,
        primaryRank: maxCard.rank,
        primarySuitVal: getCardPower(maxCard),
        label: isA2345 ? `顺子 (A2345)` : `顺子`
      };
    }
  }

  return null;
}

function canBeat(cand: Combo, target: Combo | null): boolean {
  if (!target || target.seat === cand.seat) return true;

  // 必须同类型相管（单张打单张，对子打对子，三条打三条，5张打5张）
  if (cand.type !== target.type) return false;

  if (cand.type === 'single' || cand.type === 'pair') {
    const candRW = getRankWeight(cand.primaryRank);
    const targetRW = getRankWeight(target.primaryRank);
    if (candRW !== targetRW) return candRW > targetRW;
    return cand.primarySuitVal > target.primarySuitVal;
  }
  if (cand.type === 'triple') {
    return getRankWeight(cand.primaryRank) > getRankWeight(target.primaryRank);
  }
  if (cand.type === '5_card') {
    const candTier = cand.comboTier || 1;
    const targTier = target.comboTier || 1;
    // 五张牌型压制：同花顺 (Tier 5) > 四带一 (Tier 4) > 俘虏 (Tier 3) > 同花 (Tier 2) > 顺子 (Tier 1)
    if (candTier !== targTier) return candTier > targTier;

    // 1. 同花顺 (Tier 5) 或 同花 (Tier 2)：先比花色（黑桃 > 红桃 > 梅花 > 方块），花色相同比单张最大牌
    if (candTier === 5 || candTier === 2) {
      const candSuit = cand.flushSuit || 0;
      const targetSuit = target.flushSuit || 0;
      if (candSuit !== targetSuit) return candSuit > targetSuit;
      // 相同花色比单张最大的牌
      const candRW = getRankWeight(cand.primaryRank);
      const targetRW = getRankWeight(target.primaryRank);
      if (candRW !== targetRW) return candRW > targetRW;
      return cand.primarySuitVal > target.primarySuitVal;
    }

    // 2. 四带一 (Tier 4) 或 俘虏 (Tier 3)：比主牌点数权重
    if (candTier === 4 || candTier === 3) {
      return getRankWeight(cand.primaryRank) > getRankWeight(target.primaryRank);
    }

    // 3. 顺子 (Tier 1)：顺子是比单张最大的牌
    if (candTier === 1) {
      const candRW = getRankWeight(cand.primaryRank);
      const targetRW = getRankWeight(target.primaryRank);
      if (candRW !== targetRW) return candRW > targetRW;
      return cand.primarySuitVal > target.primarySuitVal;
    }
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

  const highlight = props.tableTheme?.highlightColor || '#EF4444';
  const felt = props.tableTheme?.feltColor || '#B91C1C';
  const edge = props.tableTheme?.edgeColor || '#7F1D1D';

  const grad = ctx.createRadialGradient(width / 2, height / 2 - 20, 20, width / 2, height / 2, 430);
  grad.addColorStop(0, highlight);
  grad.addColorStop(0.35, felt);
  grad.addColorStop(0.85, edge);
  grad.addColorStop(1, edge);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 0);
  ctx.stroke();
  ctx.restore();

  const drawSeat = (x: number, y: number, name: string, count: number, status: string, active: boolean, seatIdx: number) => {
    const isQiangGong = isQiangGongActive.value && qiangGongSeat.value === seatIdx;
    const pulse = 0.5 + 0.5 * Math.sin((animTime.value || performance.now()) / 120);

    const isBaoDan = count === 1 && !finishedSeats.includes(seatIdx);

    let fillStyle = active ? 'rgba(239, 68, 68, 0.35)' : 'rgba(0, 0, 0, 0.25)';
    let strokeStyle = active ? '#F87171' : 'rgba(255, 255, 255, 0.22)';
    let lineWidth = active ? 2 : 1;

    if (isBaoDan && !isQiangGong) {
      fillStyle = `rgba(220, 38, 38, ${0.28 + 0.18 * pulse})`;
      strokeStyle = `rgba(239, 68, 68, ${0.75 + 0.25 * pulse})`;
      lineWidth = 2.5;
    }

    if (isQiangGong) {
      // 保持头像框变成红色一闪一闪
      fillStyle = `rgba(220, 38, 38, ${0.25 + 0.35 * pulse})`;
      strokeStyle = `rgba(255, 68, 68, ${0.6 + 0.4 * pulse})`;
      lineWidth = 3 + 1.5 * pulse;
    }

    ctx.save();
    if (isQiangGong || isBaoDan) {
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = isQiangGong ? (12 + 12 * pulse) : (8 + 8 * pulse);
    }
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.roundRect(x, y, 138, 72, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(name, x + 10, y + 22);

    // 强攻徽章标识（严禁显示任何同盟标签）
    if (isQiangGong) {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.roundRect(x + 82, y + 6, 50, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔥强攻', x + 107, y + 19);
    }

    // 报单警报徽章
    if (isBaoDan) {
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.roundRect(x + 80, y + 28, 52, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🚨报单', x + 106, y + 41);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#FF4D4D';
      ctx.font = '800 12px monospace';
      ctx.fillText(`仅剩 1 张!`, x + 10, y + 42);
    } else {
      ctx.textAlign = 'left';
      ctx.fillStyle = count <= 2 ? '#EF4444' : '#FDE047';
      ctx.font = '700 12px monospace';
      ctx.fillText(`剩余 ${count} 张 ${count === 2 ? '⚠️' : ''}`, x + 10, y + 42);
    }

    ctx.fillStyle = isQiangGong ? '#FECACA' : '#FCA5A5';
    ctx.font = '600 11px sans-serif';
    ctx.fillText(status, x + 10, y + 60);
  };

  drawSeat(26, 105, '西席 (南洋商贾)', hands[1]?.length || 0, seatStatus[1], turnSeat.value === 1, 1);
  drawSeat(width / 2 - 65, 22, '北席 (九龙棋杰)', hands[2]?.length || 0, seatStatus[2], turnSeat.value === 2, 2);
  drawSeat(width - 154, 105, '东席 (濠江赌客)', hands[3]?.length || 0, seatStatus[3], turnSeat.value === 3, 3);
  drawSeat(26, height - 82, '本家 (尊贵玩家)', hands[0]?.length || 0, seatStatus[0], turnSeat.value === 0, 0);

  if (lastCombo.value) {
    const list = lastCombo.value.cards;
    const overlap = 28;
    const totalW = 54 + (list.length - 1) * overlap;
    const startY = 105;
    const s = lastCombo.value.seat;

    let startX = width / 2 - totalW / 2;
    let textX = width / 2;

    if (s === 1) {
      // 左边玩家打出的牌靠左对齐
      startX = width / 2 - 190;
      textX = startX + totalW / 2;
    } else if (s === 3) {
      // 右边玩家打出的牌靠右对齐
      startX = width / 2 + 50;
      textX = startX + totalW / 2;
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
    ctx.textAlign = 'center';
    const names = ['本家', '西席', '北席', '东席'];
    ctx.fillText(`${names[s]} · ${lastCombo.value.label}`, textX, startY + 76 + 18);
  }

  const myHand = hands[0] || [];
  if (myHand.length > 0) {
    const cardW = 70;
    const cardH = 100;
    const step = Math.min(34, (width - 130) / Math.max(1, myHand.length));
    const totalW = cardW + (myHand.length - 1) * step;
    const baseLeft = width / 2 - totalW / 2;
    const baseY = height - 192;

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

  const cardW = 70;
  const cardH = 100;
  const step = Math.min(34, (680 - 130) / Math.max(1, myHand.length));
  const totalW = cardW + (myHand.length - 1) * step;
  const baseLeft = 680 / 2 - totalW / 2;
  const baseY = 430 - 192;

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

/**
 * 报单玩家自动出牌并宣布出清获胜
 */
function executeBaoDanPlay(seat: number) {
  if (winnerSeat.value !== null || (hands[seat]?.length || 0) !== 1) return;
  const remainingCard = hands[seat][0];
  const cb = evaluateCombo([remainingCard], seat);
  if (!cb) return;
  hands[seat] = [];
  playedCardsHistory.value.push(remainingCard);
  lastCombo.value = cb;
  consecutivePasses.value = 0;
  seatStatus[seat] = `出牌：${cb.label} (出清获胜)`;
  soundFX.playCardSnap(false);
  soundFX.speakAction('baodan_win', { isFemale: seat === 1 });
  checkGameFinishAfterPlay(seat);
  drawTable();
  emitStatus();
}

/**
 * 当有玩家打出一手牌后的状态机处理：
 * 1. 记录已出牌库 (用于记牌推算绝大)
 * 2. 检查获胜 (一手走完)
 * 3. 报单检测：若出牌后仅剩 1 张手牌，立即触发报单警报
 * 4. 核心体验机制：全场绝大（绝对压制）记牌推算：
 *    依据公开已出牌库（严禁偷窥对手暗牌，杜绝信息泄露）。
 *    若未出牌库中数学上不可能存在任何压制牌（如黑桃3全场至尊、或3已出后的2、或对手张数不足）：
 *    直接由系统判定为全场绝大，该玩家保留出牌权直接继续出牌！无需等待其他玩家点过！
 * 5. 正常逆时针流转
 */
function afterComboPlayed(seat: number, combo: Combo) {
  playedCardsHistory.value.push(...combo.cards);

  // 1. 检查获胜
  if (hands[seat].length === 0) {
    checkGameFinishAfterPlay(seat);
    drawTable();
    emitStatus();
    return;
  }

  // 2. 报单检测：若出牌后手牌仅剩 1 张，立即触发报单警报
  checkAndTriggerBaoDan(seat);

  // 3. 记牌器推算全场绝大（绝对压制）：
  const yCombo: YansanCombo = {
    type: combo.type === 'triple' ? 'triplet' : (combo.type as any),
    comboTier: combo.comboTier,
    rank: combo.primaryRank,
    suitVal: combo.flushSuit || (combo.primarySuitVal % 10),
    cards: combo.cards as any,
    seat: combo.seat,
  };

  const all52 = createDeck();
  const knownCardIds = new Set<string>();
  for (const c of playedCardsHistory.value) knownCardIds.add(c.id);
  if (hands[seat]) {
    for (const c of hands[seat]) knownCardIds.add(c.id);
  }

  const availableOpponentPool = all52.filter((c) => !knownCardIds.has(c.id));
  const otherActiveHands = hands.filter((_, idx) => idx !== seat && !finishedSeats.includes(idx));
  const maxOpponentCards = otherActiveHands.length > 0 ? Math.max(...otherActiveHands.map((h) => h.length)) : 0;

  const isDeductivelyUnbeatable = isYansanComboDeductivelyUnbeatable(
    yCombo,
    availableOpponentPool as any,
    maxOpponentCards
  );

  if (isDeductivelyUnbeatable) {
    const isCountShort = maxOpponentCards < combo.cards.length;
    const names = ['本家', '西席', '北席', '东席'];
    unbeatableNotice.value = isCountShort
      ? `👑 对手余牌均不足${combo.cards.length}张！【${names[seat]}】打出【${combo.label}】全场绝大，直接连出`
      : `👑 记牌推算全场绝大【${combo.label}】！【${names[seat]}】无人可压，获得连出新牌权`;
    if (unbeatableTimer) clearTimeout(unbeatableTimer);
    unbeatableTimer = setTimeout(() => {
      unbeatableNotice.value = '';
    }, 3500);

    soundFX.speakAction(isCountShort ? 'cards_short' : 'unbeatable');
    emit('fx', 'dragon');

    // 其它存活各家直接显示要不起
    for (let i = 0; i < 4; i++) {
      if (i !== seat && !finishedSeats.includes(i)) {
        seatStatus[i] = isCountShort ? `余牌不足${combo.cards.length}张` : '要不起 (记牌推算)';
      }
    }

    // 重点优化：打出绝大牌型后保留在桌布中央，停顿 1.8 秒供玩家看清牌型与压制结果，切勿瞬间出牌！
    lastCombo.value = combo;
    seatStatus[seat] = `👑 全场绝大：${combo.label} (无人可压)`;
    turnSeat.value = seat;
    drawTable();
    emitStatus();

    if (unbeatablePauseTimer) clearTimeout(unbeatablePauseTimer);
    unbeatablePauseTimer = setTimeout(() => {
      if (winnerSeat.value !== null) return;

      // 停顿 1.8 秒后清理桌面，正式进入该席位领出新一轮牌型回合
      lastCombo.value = null;
      consecutivePasses.value = 0;
      turnSeat.value = seat;

      // 若该席位仅余1张牌(报单)，且获得了领出权，间隔700毫秒自动出牌获胜！
      if (hands[seat].length === 1) {
        setTimeout(() => {
          executeBaoDanPlay(seat);
        }, 700);
        return;
      }

      for (let i = 0; i < 4; i++) {
        if (i !== seat && !finishedSeats.includes(i)) {
          seatStatus[i] = '等待';
        }
      }

      if (seat === 0) {
        seatStatus[0] = '全场绝大 · 该您自由出牌！';
        drawTable();
        emitStatus();
        if (isAutoHost.value) {
          checkAutoHostTurn();
        } else {
          startTurnCountdown();
        }
      } else {
        seatStatus[seat] = '全场绝大 · 领出新牌';
        drawTable();
        emitStatus();
        // 拟真思考延迟 (850ms ~ 1250ms)，给予从容观战节奏
        const thinkingDelay = 850 + Math.floor(Math.random() * 400);
        if (botTimer) clearTimeout(botTimer);
        botTimer = setTimeout(() => {
          botStep(seat);
        }, thinkingDelay);
      }
    }, 1800);

    return;
  }

  // 正常逆时针流转至下一个存活玩家
  const nextS = getNextActiveSeat(seat);
  const isBigCombo = combo.type === '5_card' || combo.cards.length >= 4 || combo.comboTier !== undefined;

  if (isBigCombo) {
    for (let i = 0; i < 4; i++) {
      if (i !== seat && !finishedSeats.includes(i)) {
        seatStatus[i] = `欣赏大牌：${combo.label}`;
      }
    }
    turnSeat.value = -1;
    drawTable();
    emitStatus();

    setTimeout(() => {
      if (winnerSeat.value !== null) return;
      turnSeat.value = nextS;
      emit('move', { seat, combo, winner: null, nextTurn: nextS });

      if (nextS === 0) {
        seatStatus[0] = lastCombo.value ? '该您跟牌' : '该您出牌';
        drawTable();
        emitStatus();
        if (isAutoHost.value) {
          checkAutoHostTurn();
        } else {
          startTurnCountdown();
        }
      } else {
        runBotTurns(nextS);
      }
    }, 2000);
    return;
  }

  turnSeat.value = nextS;
  drawTable();
  emitStatus();
  emit('move', { seat, combo, winner: null, nextTurn: nextS });

  if (nextS === 0) {
    seatStatus[0] = lastCombo.value ? '该您跟牌' : '该您出牌';
    drawTable();
    emitStatus();
    if (isAutoHost.value) {
      checkAutoHostTurn();
    } else {
      startTurnCountdown();
    }
  } else {
    runBotTurns(nextS);
  }
}

function handlePlay() {
  if (turnSeat.value !== 0 || winnerSeat.value !== null) return;
  stopTurnCountdown();
  errorTip.value = '';
  const chosen = hands[0].filter((c) => selectedIds.has(c.id));
  if (chosen.length === 0) return;

  // 烟三铁律：每局首出必须包含方块4 (♦4)
  if (isFirstTurn.value && !hands[0].some((c) => c.rank === 4 && c.suit === '♦')) {
    isFirstTurn.value = false;
  }
  if (isFirstTurn.value && !chosen.some((c) => c.rank === 4 && c.suit === '♦')) {
    errorTip.value = '每局首出必须包含方块4 (♦4)！';
    return;
  }

  const combo = evaluateCombo(chosen, 0);
  if (!combo) {
    errorTip.value = '牌型不符合烟三规则（单张、一对、三条、顺子、同花、俘虏、四带一、同花顺，杂色10-J-Q-K-A不可出）';
    return;
  }
  if (!canBeat(combo, lastCombo.value)) {
    errorTip.value = '必须大过桌面牌型！';
    return;
  }

  const isSpecialHighTier = combo.type === '5_card' && (combo.comboTier || 1) >= 3;
  if (typeof soundFX.playCardSnap === 'function') soundFX.playCardSnap(isSpecialHighTier);
  if (isSpecialHighTier) {
    haptics.bomb();
    emit('fx', 'bomb');
  } else {
    haptics.playCard();
  }

  hands[0] = hands[0].filter((c) => !selectedIds.has(c.id));
  selectedIds.clear();
  lastCombo.value = combo;
  consecutivePasses.value = 0;
  seatStatus[0] = `出牌：${combo.label}`;
  soundFX.speakAction(isFirstTurn.value ? 'yansan_lead' : combo.label);
  isFirstTurn.value = false;

  afterComboPlayed(0, combo);
}

function handlePass() {
  if (!lastCombo.value || lastCombo.value.seat === 0) return;
  if (turnSeat.value !== 0 || winnerSeat.value !== null) return;
  stopTurnCountdown();

  selectedIds.clear();
  errorTip.value = '';
  seatStatus[0] = '过牌';
  if (typeof soundFX.playTap === 'function') soundFX.playTap();
  soundFX.speakAction('pass');
  consecutivePasses.value++;

  const activeSeats = [0, 1, 2, 3].filter((s) => !finishedSeats.includes(s));
  const activeCount = activeSeats.length;
  const lastLeader = lastCombo.value?.seat;
  const leaderFinished = lastLeader !== undefined && finishedSeats.includes(lastLeader);
  const passThreshold = leaderFinished ? activeCount : activeCount - 1;

  if (consecutivePasses.value >= passThreshold) {
    // 剩余玩家全部过牌，本轮结束！
    // 用户明确规则："如果剩下的三个玩家都不出，就是打完手牌的下家接权，可以出其他牌型"
    const leadSeat = leaderFinished ? getNextActiveSeat(lastLeader!) : lastLeader!;
    lastCombo.value = null;
    consecutivePasses.value = 0;
    for (const s of activeSeats) {
      if (s === leadSeat) {
        seatStatus[s] = s === 0 ? '该您出牌 (接权领出)' : (leaderFinished ? '接权领牌' : '领出新牌');
      } else {
        seatStatus[s] = '等待';
      }
    }
    turnSeat.value = leadSeat;
    drawTable();
    emitStatus();
    if (leadSeat !== 0) {
      runBotTurns(leadSeat);
    } else if (isAutoHost.value) {
      checkAutoHostTurn();
    } else {
      startTurnCountdown();
    }
  } else {
    // 未达出清轮数，逆时针轮到下一个未走完的玩家
    const nextS = getNextActiveSeat(0);
    turnSeat.value = nextS;
    drawTable();
    emitStatus();
    runBotTurns(nextS);
  }
}

function isTeamMate(s1: number, s2: number): boolean {
  if (s1 === s2) return true;
  if (isQiangGongActive.value) {
    if (s1 === qiangGongSeat.value || s2 === qiangGongSeat.value) return false;
    return true;
  }
  const holders = detectYansanSpecialHolders(hands);
  if (holders.isSolo) {
    if (s1 === holders.spade3Seat || s2 === holders.spade3Seat) return false;
    return true;
  }
  const isS1Spade = s1 === holders.spade3Seat || s1 === holders.spadeASeat;
  const isS2Spade = s2 === holders.spade3Seat || s2 === holders.spadeASeat;
  return isS1Spade === isS2Spade;
}

function findWinningCombo(cardList: Card[], target: Combo, seat: number): Card[] | null {
  // 必须严格按真实牌力从弱到强升序排列（4最小，3最大）：
  const cards = [...cardList].sort((a, b) => getCardPower(a) - getCardPower(b));
  const rankGroups = new Map<number, Card[]>();
  for (const c of cards) {
    if (!rankGroups.has(c.rank)) rankGroups.set(c.rank, []);
    rankGroups.get(c.rank)!.push(c);
  }
  const sortedRanks = Array.from(rankGroups.keys()).sort((a, b) => getRankWeight(a) - getRankWeight(b));

  if (target.type === 'single') {
    // 升序查找：选择能管上牌的【最小单张】
    for (const c of cards) {
      const ev = evaluateCombo([c], seat);
      if (ev && canBeat(ev, target)) return [c];
    }
    return null;
  }

  if (target.type === 'pair') {
    // 1. 优先从纯对子 (group.length === 2) 中由小到大寻找
    for (const rk of sortedRanks) {
      const group = rankGroups.get(rk)!;
      if (group.length === 2) {
        const ev = evaluateCombo(group, seat);
        if (ev && canBeat(ev, target)) return group;
      }
    }
    // 2. 无纯对子时，从三条中拆出最小对子（不拆四张四条）
    for (const rk of sortedRanks) {
      const group = rankGroups.get(rk)!;
      if (group.length === 3) {
        const subPair = group.slice(0, 2);
        const ev = evaluateCombo(subPair, seat);
        if (ev && canBeat(ev, target)) return subPair;
      }
    }
    // 3. 终局紧急情况才允许拆四张
    for (const rk of sortedRanks) {
      const group = rankGroups.get(rk)!;
      if (group.length === 4) {
        const subPair = group.slice(0, 2);
        const ev = evaluateCombo(subPair, seat);
        if (ev && canBeat(ev, target)) return subPair;
      }
    }
    return null;
  }

  if (target.type === 'triple') {
    for (const rk of sortedRanks) {
      const group = rankGroups.get(rk)!;
      if (group.length === 3) {
        const ev = evaluateCombo(group, seat);
        if (ev && canBeat(ev, target)) return group;
      }
    }
    for (const rk of sortedRanks) {
      const group = rankGroups.get(rk)!;
      if (group.length === 4) {
        const subTriple = group.slice(0, 3);
        const ev = evaluateCombo(subTriple, seat);
        if (ev && canBeat(ev, target)) return subTriple;
      }
    }
    return null;
  }

  if (target.type === '5_card') {
    const tTier = target.comboTier || 1;

    // ① 顺子 (Tier 1)
    const validStraights: Card[][] = [];
    const uniqueRanks = Array.from(new Set(cards.map((c) => c.rank)));
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
        const combo = sub.map((r) => cards.find((c) => c.rank === r)!);
        const ev = evaluateCombo(combo, seat);
        if (ev && ev.comboTier === 1 && canBeat(ev, target)) {
          validStraights.push(combo);
        }
      }
    }
    // A2345 特殊顺子 (3, 4, 5, 14, 15)
    if (uniqueRanks.includes(3) && uniqueRanks.includes(4) && uniqueRanks.includes(5) && uniqueRanks.includes(14) && uniqueRanks.includes(15)) {
      const combo = [3, 4, 5, 14, 15].map((r) => cards.find((c) => c.rank === r)!);
      const ev = evaluateCombo(combo, seat);
      if (ev && ev.comboTier === 1 && canBeat(ev, target)) {
        validStraights.push(combo);
      }
    }

    if (tTier === 1 && validStraights.length > 0) {
      // 挑出能管上的最小顺子
      validStraights.sort((a, b) => {
        const evA = evaluateCombo(a, seat)!;
        const evB = evaluateCombo(b, seat)!;
        return getRankWeight(evA.primaryRank) - getRankWeight(evB.primaryRank) || evA.primarySuitVal - evB.primarySuitVal;
      });
      return validStraights[0];
    }

    // ② 同花 (Tier 2)
    const flushes: Card[][] = [];
    const suitGroups = new Map<string, Card[]>();
    for (const c of cards) {
      if (!suitGroups.has(c.suit)) suitGroups.set(c.suit, []);
      suitGroups.get(c.suit)!.push(c);
    }
    for (const group of suitGroups.values()) {
      if (group.length >= 5) {
        const sSorted = [...group].sort((a, b) => getCardPower(a) - getCardPower(b));
        for (let i = 0; i <= sSorted.length - 5; i++) {
          const sub = sSorted.slice(i, i + 5);
          const ev = evaluateCombo(sub, seat);
          if (ev && ev.comboTier === 2 && canBeat(ev, target)) {
            flushes.push(sub);
          }
        }
      }
    }
    if (tTier <= 2 && flushes.length > 0) {
      flushes.sort((a, b) => {
        const evA = evaluateCombo(a, seat)!;
        const evB = evaluateCombo(b, seat)!;
        return (evA.flushSuit || 0) - (evB.flushSuit || 0) || getRankWeight(evA.primaryRank) - getRankWeight(evB.primaryRank);
      });
      return flushes[0];
    }

    // ③ 俘虏 (Tier 3)
    const fulus: Card[][] = [];
    const triples = sortedRanks.filter((rk) => rankGroups.get(rk)!.length >= 3);
    const pairs = sortedRanks.filter((rk) => rankGroups.get(rk)!.length >= 2);
    for (const tRk of triples) {
      for (const pRk of pairs) {
        if (tRk !== pRk) {
          const fh = [...rankGroups.get(tRk)!.slice(0, 3), ...rankGroups.get(pRk)!.slice(0, 2)];
          const ev = evaluateCombo(fh, seat);
          if (ev && ev.comboTier === 3 && canBeat(ev, target)) {
            fulus.push(fh);
          }
        }
      }
    }
    if (tTier <= 3 && fulus.length > 0) {
      fulus.sort((a, b) => {
        const evA = evaluateCombo(a, seat)!;
        const evB = evaluateCombo(b, seat)!;
        return getRankWeight(evA.primaryRank) - getRankWeight(evB.primaryRank);
      });
      return fulus[0];
    }

    // ④ 四带一 (Tier 4)：仅当目标也是高阶牌，或终局紧迫时才动用
    // 严禁拿四条3或四条2当普通牌打出！
    const fourOnes: Card[][] = [];
    const fourRanks = sortedRanks.filter((rk) => rankGroups.get(rk)!.length === 4);
    for (const fRk of fourRanks) {
      // 挑选一张最小的非本条单牌作为带牌 (从cards[0]小牌找起)
      const kicker = cards.find((c) => c.rank !== fRk);
      if (kicker) {
        const fo = [...rankGroups.get(fRk)!, kicker];
        const ev = evaluateCombo(fo, seat);
        if (ev && ev.comboTier === 4 && canBeat(ev, target)) {
          fourOnes.push(fo);
        }
      }
    }
    if (fourOnes.length > 0) {
      fourOnes.sort((a, b) => {
        const evA = evaluateCombo(a, seat)!;
        const evB = evaluateCombo(b, seat)!;
        return getRankWeight(evA.primaryRank) - getRankWeight(evB.primaryRank);
      });
      const oppCards = hands[target.seat]?.length || 10;
      // 若对手牌尚多（>=5张）且只是普通顺子或同花，绝不轻易浪费四带一
      if (tTier >= 3 || oppCards <= 4 || cards.length <= 5) {
        return fourOnes[0];
      }
    }

    // ⑤ 同花顺 (Tier 5)
    for (const group of suitGroups.values()) {
      if (group.length >= 5) {
        const sSorted = [...group].sort((a, b) => getCardPower(a) - getCardPower(b));
        for (let i = 0; i <= sSorted.length - 5; i++) {
          const sub = sSorted.slice(i, i + 5);
          const ev = evaluateCombo(sub, seat);
          if (ev && ev.comboTier === 5 && canBeat(ev, target)) {
            const oppCards = hands[target.seat]?.length || 10;
            if (tTier >= 4 || oppCards <= 3 || cards.length <= 5) {
              return sub;
            }
          }
        }
      }
    }
  }

  return null;
}

function getEnhancedAIPlay(seat: number): Card[] | null {
  const currentHand = hands[seat];
  if (!currentHand || currentHand.length === 0) return null;

  // 自愈校验：若此席位并无方块4，则绝不可能是首出方块4限制
  const hasD4 = currentHand.some((c) => c.rank === 4 && c.suit === '♦');
  const isActualFirstTurn = isFirstTurn.value && hasD4;
  if (seat === 0 && isFirstTurn.value && !hasD4) {
    isFirstTurn.value = false;
  }

  // 1. 如果一手牌本身就是合法组合，直接走完获胜！
  const allEv = evaluateCombo(currentHand, seat);
  if (allEv && (!lastCombo.value || lastCombo.value.seat === seat || canBeat(allEv, lastCombo.value))) {
    if (isActualFirstTurn) {
      if (hasD4) {
        return [...currentHand];
      }
    } else {
      return [...currentHand];
    }
  }

  // 2. 转换目标牌型为 YansanCombo 供引擎决策
  const targetCombo = lastCombo.value && lastCombo.value.seat !== seat ? lastCombo.value : null;
  let yTarget: YansanCombo | null = null;
  if (targetCombo) {
    yTarget = {
      type: targetCombo.type === 'triple' ? 'triplet' : (targetCombo.type as any),
      comboTier: targetCombo.comboTier,
      rank: targetCombo.primaryRank,
      suitVal: targetCombo.flushSuit || (targetCombo.primarySuitVal % 10),
      cards: targetCombo.cards as any,
      seat: targetCombo.seat,
    };
  }

  // 3. 计算同盟与对手信息
  let teammateSeat: number | undefined;
  for (let s = 0; s < 4; s++) {
    if (s !== seat && isTeamMate(seat, s)) {
      teammateSeat = s;
      break;
    }
  }
  const isTeammateTarget = targetCombo ? isTeamMate(seat, targetCombo.seat) : false;
  const handsCount = [hands[0]?.length || 0, hands[1]?.length || 0, hands[2]?.length || 0, hands[3]?.length || 0];

  // 4. 调用强大的 getYansanAIPlay 决策核心
  const candidateYansanCards = getYansanAIPlay(currentHand as any, yTarget, {
    isFirstTurn: isActualFirstTurn,
    seat,
    teammateSeat,
    handsCount,
    isTeammateTarget,
  });

  if (candidateYansanCards && candidateYansanCards.length > 0) {
    const idSet = new Set(candidateYansanCards.map((c) => c.id));
    const matched = currentHand.filter((c) => idSet.has(c.id));
    if (matched.length === candidateYansanCards.length) {
      const ev = evaluateCombo(matched, seat);
      if (ev && (!targetCombo || canBeat(ev, targetCombo))) {
        return matched;
      }
    }
  }

  // 5. 备选方案：若规则引擎决策在特殊牌型下未匹配，使用 findWinningCombo
  if (targetCombo) {
    if (isTeammateTarget) {
      const isTargetStrong =
        (targetCombo.type === 'single' && getRankWeight(targetCombo.primaryRank) >= 10) ||
        (targetCombo.type === 'pair' && getRankWeight(targetCombo.primaryRank) >= 9) ||
        (targetCombo.type === 'triple') ||
        (targetCombo.type === '5_card' && (targetCombo.comboTier || 1) >= 2);
      if (isTargetStrong) return null;
    }
    return findWinningCombo(currentHand, targetCombo, seat);
  } else {
    // 领牌备选
    if (isActualFirstTurn) {
      const d4 = currentHand.find((c) => c.rank === 4 && c.suit === '♦');
      if (d4) return [d4];
    }
    const sorted = [...currentHand].sort((a, b) => getCardPower(a) - getCardPower(b));
    return [sorted[0]];
  }
}

function handleHint() {
  errorTip.value = '';
  selectedIds.clear();

  const suggested = getEnhancedAIPlay(0);
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

function runBotTurns(startSeat: number) {
  if (!selectedRoom.value || winnerSeat.value !== null) return;

  let s = startSeat;
  if (finishedSeats.includes(s)) {
    s = getNextActiveSeat(s);
  }
  if (!selectedRoom.value || winnerSeat.value !== null) return;

  if (s === 0) {
    turnSeat.value = 0;
    seatStatus[0] = lastCombo.value ? '该您跟牌' : '该您出牌';
    drawTable();
    emitStatus();
    if (isAutoHost.value) {
      checkAutoHostTurn();
    } else {
      startTurnCountdown();
    }
    return;
  }

  turnSeat.value = s;
  const seatNames = ['本家', '西席', '北席', '东席'];
  seatStatus[s] = `${seatNames[s]} 思考中...`;
  drawTable();
  emitStatus();

  // 报单快速响应：若对手出的是对子/三条/五张，而机器人张数不足(如报单仅剩1张牌)，无法跟牌，迅速过牌
  const isCountShort = lastCombo.value && lastCombo.value.cards.length > hands[s].length;
  const thinkingDelay = isCountShort ? 450 : Math.floor(1300 + Math.random() * 800);

  if (botTimer) clearTimeout(botTimer);
  botTimer = setTimeout(() => {
    if (!selectedRoom.value || winnerSeat.value !== null || turnSeat.value !== s) return;
    botStep(s);
  }, thinkingDelay);
}

function botStep(seat: number) {
  if (!selectedRoom.value || winnerSeat.value !== null || turnSeat.value !== seat) return;

  // 1. 强攻判断：同时持黑桃3和黑桃A，13张手牌均未动
  if (!isQiangGongActive.value && hands[seat].length === 13 && hasSpade3AndA(seat)) {
    // 评估手牌实力：有强力大牌护体才选择强攻
    const highCards = hands[seat].filter((c) => getRankWeight(c.rank) >= 10);
    if (highCards.length >= 4 && Math.random() < 0.8) {
      handleQiangGong(seat);
      return;
    }
  }

  // 2. 调用增强版高智能决策引擎
  const chosen = getEnhancedAIPlay(seat);

  if (chosen) {
    const cb = evaluateCombo(chosen, seat)!;
    const rmIds = new Set(chosen.map((c) => c.id));
    hands[seat] = hands[seat].filter((c) => !rmIds.has(c.id));
    lastCombo.value = cb;
    consecutivePasses.value = 0;
    seatStatus[seat] = `出牌：${cb.label}`;
    if (typeof soundFX.playCardSnap === 'function') soundFX.playCardSnap(cb.type === 'bomb');
    soundFX.speakAction(cb.type === 'bomb' ? 'bomb' : cb.label, { isFemale: seat === 1 });
    if (cb.type === 'bomb') emit('fx', 'bomb');
    isFirstTurn.value = false;

    afterComboPlayed(seat, cb);
  } else {
    seatStatus[seat] = '过牌';
    if (typeof soundFX.playTap === 'function') soundFX.playTap();
    soundFX.speakAction('pass', { isFemale: seat === 1 });
    consecutivePasses.value++;

    const activeSeats = [0, 1, 2, 3].filter((s) => !finishedSeats.includes(s));
    const activeCount = activeSeats.length;
    const lastLeader = lastCombo.value?.seat;
    const leaderFinished = lastLeader !== undefined && finishedSeats.includes(lastLeader);
    const passThreshold = leaderFinished ? activeCount : activeCount - 1;

    if (consecutivePasses.value >= passThreshold) {
      // 所有剩余玩家都不出，本轮结束！
      // 用户明确规则："如果剩下的三个玩家都不出，就是打完手牌的下家接权，可以出其他牌型"
      const leadSeat = leaderFinished ? getNextActiveSeat(lastLeader!) : lastLeader!;
      lastCombo.value = null;
      consecutivePasses.value = 0;
      for (const s of activeSeats) {
        if (s === leadSeat) {
          seatStatus[s] = s === 0 ? '该您出牌 (接权领出)' : (leaderFinished ? '接权领牌' : '领出新牌');
        } else {
          seatStatus[s] = '等待';
        }
      }
      turnSeat.value = leadSeat;
      drawTable();
      emitStatus();
      if (leadSeat === 0) {
        if (isAutoHost.value) {
          checkAutoHostTurn();
        } else {
          startTurnCountdown();
        }
      } else {
        runBotTurns(leadSeat);
      }
    } else {
      // 未达出清轮数，逆时针轮到下一个未走完的玩家
      const nextS = getNextActiveSeat(seat);
      turnSeat.value = nextS;
      drawTable();
      emitStatus();
      runBotTurns(nextS);
    }
  }
}

let cleanupCardLoader: (() => void) | null = null;

onMounted(() => {
  preloadCardAssets();
  cleanupCardLoader = onCardAssetsLoaded(() => {
    drawTable();
  });
  if (selectedRoom.value) {
    dealNewMatch();
  }
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
  stopTurnCountdown();
  if (autoHostTimer) clearTimeout(autoHostTimer);
  if (botTimer) clearTimeout(botTimer);
  if (danmakuTimer) clearTimeout(danmakuTimer);
  if (unbeatableTimer) clearTimeout(unbeatableTimer);
  if (unbeatablePauseTimer) clearTimeout(unbeatablePauseTimer);
  if (baodanTimer) clearTimeout(baodanTimer);
  if (animFrameId) cancelAnimationFrame(animFrameId);
});

defineExpose({
  dealNewMatch,
  toggleAutoHost,
});
</script>
