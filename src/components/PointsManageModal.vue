<template>
  <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-1.5 sm:p-2 select-none">
    <!-- Landscape-Optimized Master Container: Extra Wide & Low Profile Height -->
    <div
      class="w-[99vw] max-w-[1520px] 2xl:max-w-[1720px] h-[68vh] min-h-[250px] max-h-[325px] rounded-2xl bg-gradient-to-br from-[#181310] via-[#120E0C] to-[#0A0706] border border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-row overflow-hidden text-[#F5EFE6]"
    >
      <!-- LEFT SIDEBAR: Ultra-Compact Horizontal Navigation & User Balance Hub -->
      <aside class="w-40 sm:w-46 shrink-0 bg-[#0E0B09] border-r border-amber-500/20 p-2 sm:p-2.5 flex flex-col justify-between">
        <div class="space-y-1.5">
          <!-- Brand Header -->
          <div class="flex items-center gap-1.5 pb-1.5 border-b border-white/10">
            <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500/40 to-amber-700/20 border border-amber-400/60 flex items-center justify-center text-xs text-amber-300 shadow-inner">
              🪙
            </div>
            <div class="min-w-0">
              <h3 class="text-xs font-bold text-amber-200 font-serif-title leading-tight truncate">
                钱庄与积分中枢
              </h3>
              <p class="text-[8px] text-[#8C7A6B] leading-none mt-0.5 truncate">
                横屏专席资产管理
              </p>
            </div>
          </div>

          <!-- User Asset Card (Compact Landscape Bar) -->
          <div class="p-1.5 rounded-lg bg-gradient-to-br from-[#1E1712] to-[#14100D] border border-amber-500/35 shadow-inner">
            <div class="flex items-center justify-between text-[9px] text-amber-300/80 mb-0.5">
              <span>持有筹码</span>
              <span v-if="effectiveIsAdmin" class="px-1 py-0.2 rounded bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[8px] font-bold">
                👑 TG管理员
              </span>
              <span v-else class="text-[#8C7A6B] text-[8px]">
                LV.{{ userLevel }}
              </span>
            </div>
            <div class="text-xs sm:text-sm font-mono font-black text-amber-300 tabular-nums truncate">
              {{ userCoins.toLocaleString() }} <span class="text-[9px] font-normal text-amber-400/80">贯</span>
            </div>
            <div class="text-[8px] text-[#8C7A6B] font-mono mt-0.5 truncate flex items-center justify-between">
              <span class="truncate">{{ props.profile.name }}</span>
              <span class="shrink-0">天梯:{{ userRating }}</span>
            </div>
          </div>

          <!-- Navigation Menu -->
          <nav class="space-y-0.5">
            <button
              type="button"
              @click="activeTab = 'transfer'"
              :class="activeTab === 'transfer' ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold shadow-md' : 'text-[#A89888] hover:text-white hover:bg-white/5'"
              class="w-full px-2 py-1 text-[11px] rounded-lg transition-all flex items-center gap-1.5 text-left cursor-pointer"
            >
              <span class="text-xs">🎁</span>
              <span class="truncate">手机号筹码互赠</span>
            </button>

            <button
              type="button"
              @click="activeTab = 'history'"
              :class="activeTab === 'history' ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold shadow-md' : 'text-[#A89888] hover:text-white hover:bg-white/5'"
              class="w-full px-2 py-1 text-[11px] rounded-lg transition-all flex items-center gap-1.5 text-left cursor-pointer"
            >
              <span class="text-xs">📜</span>
              <span class="truncate">收支流水账册</span>
            </button>

            <button
              type="button"
              @click="activeTab = 'exchange'"
              :class="activeTab === 'exchange' ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold shadow-md' : 'text-[#A89888] hover:text-white hover:bg-white/5'"
              class="w-full px-2 py-1 text-[11px] rounded-lg transition-all flex items-center gap-1.5 text-left cursor-pointer"
            >
              <span class="text-xs">⚡</span>
              <span class="truncate">钱庄福利兑换</span>
            </button>

            <!-- Telegram Admin Tab (Highlight) -->
            <button
              type="button"
              @click="activeTab = 'telegram-admin'"
              :class="activeTab === 'telegram-admin' ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 text-white font-bold shadow-md ring-1 ring-amber-400/50' : 'text-amber-300/80 hover:text-white hover:bg-amber-950/30 border border-amber-500/20'"
              class="w-full px-2 py-1 text-[11px] rounded-lg transition-all flex items-center justify-between text-left cursor-pointer mt-0.5"
            >
              <div class="flex items-center gap-1.5 truncate">
                <span class="text-xs">🛡️</span>
                <span class="truncate font-medium">TG 管理员中枢</span>
              </div>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
            </button>
          </nav>
        </div>

        <!-- Sidebar Footer: Fast Admin Switch & Close -->
        <div class="pt-1.5 border-t border-white/10 space-y-1">
          <button
            v-if="!effectiveIsAdmin"
            type="button"
            @click="showAdminAuthModal = true"
            class="w-full py-0.5 text-[9px] text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/40 rounded transition-colors border border-amber-500/30 text-center cursor-pointer"
          >
            🔑 验证管理员
          </button>
          <div v-else class="text-[8px] text-center text-emerald-400 font-mono leading-none">
            ● TG 鉴权在线
          </div>

          <button
            type="button"
            @click="$emit('close')"
            class="w-full py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-[#D6C7B2] hover:text-white transition-colors text-center cursor-pointer font-medium"
          >
            ✕ 关闭钱庄
          </button>
        </div>
      </aside>

      <!-- RIGHT MAIN CONTENT WORKSPACE (Expansive Landscape Stage) -->
      <main class="flex-1 flex flex-col justify-between p-2 sm:p-2.5 overflow-hidden bg-gradient-to-b from-[#15100E] to-[#0C0A09]">
        <!-- Top Tab Status Header -->
        <div class="h-6 flex items-center justify-between border-b border-white/10 pb-1 shrink-0">
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] sm:text-xs font-bold text-amber-200 truncate">
              {{
                activeTab === 'transfer'
                  ? '🎁 手机号精准搜索与筹码赠送'
                  : activeTab === 'history'
                  ? `📜 账户积分流水账册 (共 ${transactions.length} 笔明细)`
                  : activeTab === 'exchange'
                  ? '⚡ 钱庄福利专席 · 每日低保与筹码补给'
                  : '🛡️ Telegram 机器人管理员管控中枢'
              }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[9px] sm:text-[10px] text-[#8C7A6B] font-mono">
              实时结余: <strong class="text-amber-300">{{ userCoins }} 贯</strong>
            </span>
            <button
              type="button"
              @click="$emit('close')"
              class="w-4.5 h-4.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[9px] text-[#B8A99A] hover:text-white transition-colors cursor-pointer"
              title="关闭"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- CENTER STAGE (Optimized Landscape Scrolling Area) -->
        <div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-1.5 pr-1 space-y-2">
          <!-- ======================================================== -->
          <!-- TAB 1: 筹码互赠 (TRANSFER)                              -->
          <!-- ======================================================== -->
          <div v-if="activeTab === 'transfer'" class="h-full flex flex-col justify-between space-y-2">
            <div class="grid grid-cols-2 gap-2.5 flex-1 min-h-0">
              <!-- Left: Search & Target -->
              <div class="p-2.5 rounded-xl bg-[#120E0C] border border-amber-500/25 flex flex-col justify-between">
                <div>
                  <div class="text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <span>🔍</span> 查找茶友手机号
                  </div>
                  <div class="flex items-center gap-1.5 mb-1.5">
                    <input
                      v-model="searchPhone"
                      type="text"
                      placeholder="输入手机号 (如 13900139000)..."
                      class="flex-1 px-2.5 py-1 text-xs rounded-lg bg-[#1C1613] border border-amber-500/40 text-white focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                      @keydown.enter="searchUser"
                    />
                    <button
                      type="button"
                      @click="searchUser"
                      class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shadow-xs"
                    >
                      搜索
                    </button>
                  </div>
                  <div v-if="searchError" class="text-[10px] text-red-400 font-medium">
                    {{ searchError }}
                  </div>

                  <!-- Quick Select Recipient Suggestions -->
                  <div class="mt-2">
                    <div class="text-[9px] text-[#8C7A6B] mb-1">快捷联系列表:</div>
                    <div class="flex flex-wrap gap-1">
                      <button
                        v-for="u in quickContacts"
                        :key="u.phone"
                        type="button"
                        @click="selectQuickContact(u)"
                        class="px-2 py-0.5 text-[10px] rounded bg-[#1C1613] hover:bg-amber-950/60 border border-white/10 hover:border-amber-500/40 text-[#D6C7B2] cursor-pointer"
                      >
                        {{ u.name }} ({{ u.phone.slice(-4) }})
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Recipient Preview Card -->
                <div v-if="searchedUser" class="p-2 rounded-lg bg-[#1A1412] border border-amber-500/40 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{{ searchedUser.avatar || '👤' }}</span>
                    <div>
                      <div class="text-xs font-bold text-white flex items-center gap-1">
                        <span>{{ searchedUser.name }}</span>
                        <span class="text-[9px] px-1 rounded bg-amber-900/60 text-amber-300 font-mono">LV.{{ searchedUser.level || 1 }}</span>
                      </div>
                      <div class="text-[9px] text-[#A89888] font-mono">手机: {{ searchedUser.phone }}</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-[9px] text-[#A89888]">结余</div>
                    <div class="text-xs font-mono font-bold text-amber-300">{{ searchedUser.coins }} 贯</div>
                  </div>
                </div>
                <div v-else class="text-center py-2 text-[10px] text-[#8C7A6B] bg-[#181310] rounded-lg border border-dashed border-white/10">
                  请输入手机号搜索或从快捷联系列表中挑选
                </div>
              </div>

              <!-- Right: Transfer Form -->
              <div class="p-2.5 rounded-xl bg-[#120E0C] border border-amber-500/25 flex flex-col justify-between">
                <div>
                  <div class="text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <span>💸</span> 转账赠送筹码
                  </div>
                  <div class="space-y-1.5">
                    <div>
                      <label class="block text-[9px] text-[#A89888] mb-0.5">接收茶客</label>
                      <input
                        :value="searchedUser ? `${searchedUser.name} (${searchedUser.phone})` : '请先左侧选定接收茶客'"
                        disabled
                        type="text"
                        class="w-full px-2 py-1 text-xs rounded-lg bg-[#181310] border border-white/10 text-amber-200 cursor-not-allowed truncate"
                      />
                    </div>

                    <div>
                      <div class="flex items-center justify-between text-[9px] text-[#A89888] mb-0.5">
                        <span>赠送数量 (贯)</span>
                        <div class="flex items-center gap-1">
                          <button
                            v-for="amt in [100, 500, 1000, 5000]"
                            :key="amt"
                            type="button"
                            @click="transferAmount = amt"
                            class="px-1 py-0.2 rounded text-[9px] bg-[#1E1712] hover:bg-amber-800/40 text-amber-300 border border-amber-500/20 cursor-pointer"
                          >
                            +{{ amt }}
                          </button>
                          <button
                            type="button"
                            @click="transferAmount = userCoins"
                            class="px-1 py-0.2 rounded text-[9px] bg-amber-950/60 text-amber-300 border border-amber-500/40 cursor-pointer font-bold"
                          >
                            全部
                          </button>
                        </div>
                      </div>
                      <input
                        v-model.number="transferAmount"
                        type="number"
                        min="1"
                        :max="userCoins"
                        placeholder="输入赠送数量..."
                        class="w-full px-2.5 py-1 text-xs rounded-lg bg-[#1C1613] border border-amber-500/40 text-white focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                      />
                    </div>
                  </div>

                  <div v-if="transferMessage" class="text-[10px] mt-1 font-bold" :class="transferSuccess ? 'text-emerald-400' : 'text-red-400'">
                    {{ transferMessage }}
                  </div>
                </div>

                <button
                  type="button"
                  @click="submitTransfer"
                  :disabled="!searchedUser || transferAmount <= 0"
                  :class="(!searchedUser || transferAmount <= 0) ? 'bg-[#2E2722] text-[#736354] cursor-not-allowed' : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold shadow-md active:scale-95 cursor-pointer'"
                  class="w-full py-1.5 text-xs rounded-xl transition-all"
                >
                  确认转账赠送筹码
                </button>
              </div>
            </div>

            <!-- Bottom Transfer Note -->
            <div class="px-2.5 py-1 rounded-lg bg-[#120E0C] border border-white/10 text-[9px] text-[#8C7A6B] flex items-center justify-between shrink-0">
              <span>💡 赠送积分秒级到账，且记入双方对账流水。</span>
              <span class="font-mono text-amber-300">当前持有: {{ userCoins }} 贯</span>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- TAB 2: 收支明细 (LEDGER)                                -->
          <!-- ======================================================== -->
          <div v-else-if="activeTab === 'history'" class="h-full flex flex-col justify-between space-y-1.5">
            <!-- Filter Pills -->
            <div class="flex items-center justify-between text-[10px] text-[#8C7A6B] shrink-0">
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="historyFilter = 'all'"
                  :class="historyFilter === 'all' ? 'bg-amber-600 text-white font-bold' : 'bg-[#1C1613] text-[#A89888] hover:text-white'"
                  class="px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  全部明细
                </button>
                <button
                  type="button"
                  @click="historyFilter = 'income'"
                  :class="historyFilter === 'income' ? 'bg-emerald-600 text-white font-bold' : 'bg-[#1C1613] text-[#A89888] hover:text-white'"
                  class="px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  收入入账
                </button>
                <button
                  type="button"
                  @click="historyFilter = 'expense'"
                  :class="historyFilter === 'expense' ? 'bg-rose-600 text-white font-bold' : 'bg-[#1C1613] text-[#A89888] hover:text-white'"
                  class="px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  支出扣除
                </button>
              </div>
              <span>共 {{ filteredTransactions.length }} 笔记录</span>
            </div>

            <!-- Landscape Table -->
            <div class="flex-1 overflow-y-auto min-h-0 space-y-1">
              <div v-if="filteredTransactions.length === 0" class="py-8 text-center text-xs text-[#8C7A6B]">
                暂无符合筛选条件的收支明细记录
              </div>
              <div
                v-for="tx in paginatedTransactions"
                :key="tx.id"
                class="px-2.5 py-1.5 rounded-lg bg-[#120E0C] border border-white/10 flex items-center justify-between text-xs hover:border-amber-500/30 transition-colors"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-sm">
                    {{ tx.amount >= 0 ? '🪙' : '💸' }}
                  </span>
                  <div class="min-w-0">
                    <div class="font-semibold text-[#F5EFE6] truncate text-[11px]">{{ tx.title }}</div>
                    <div class="text-[9px] text-[#8C7A6B] font-mono">{{ tx.timestamp }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <span class="text-[10px] text-[#8C7A6B] font-mono">结余: {{ tx.balanceAfter }}</span>
                  <span
                    :class="tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                    class="font-mono font-bold text-xs tabular-nums w-16 text-right"
                  >
                    {{ tx.amount >= 0 ? `+${tx.amount}` : tx.amount }} 贯
                  </span>
                </div>
              </div>
            </div>

            <!-- Pagination Bar -->
            <div class="pt-1 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8C7A6B] shrink-0">
              <span>第 {{ historyPage + 1 }} / {{ totalHistoryPages }} 页</span>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="prevHistoryPage"
                  :disabled="historyPage === 0"
                  :class="historyPage === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10 text-white cursor-pointer'"
                  class="px-2 py-0.5 rounded border border-white/15"
                >
                  ◀ 上页
                </button>
                <button
                  type="button"
                  @click="nextHistoryPage"
                  :disabled="historyPage >= totalHistoryPages - 1"
                  :class="historyPage >= totalHistoryPages - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10 text-white cursor-pointer'"
                  class="px-2 py-0.5 rounded border border-white/15"
                >
                  下页 ▶
                </button>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- TAB 3: 钱庄福利与兑换 (BANK RELIEF & EXCHANGE)            -->
          <!-- ======================================================== -->
          <div v-else-if="activeTab === 'exchange'" class="h-full flex flex-col justify-between space-y-2">
            <div class="grid grid-cols-3 gap-2 flex-1 min-h-0">
              <!-- Card 1: 每日低保扶持金 -->
              <div class="p-2.5 rounded-xl bg-[#14100D] border border-amber-500/30 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-1 text-xs font-bold text-amber-300">
                    <span>🌾</span> 每日低保救济
                  </div>
                  <p class="text-[9px] text-[#A89888] mt-1 leading-relaxed">
                    当持仓筹码低于 2,000 贯时，可每日申领一次茶楼义仓补助。
                  </p>
                </div>
                <div class="pt-2 border-t border-white/10">
                  <div class="text-[10px] font-mono text-amber-400 mb-1.5">+3,000 贯应急金</div>
                  <button
                    type="button"
                    @click="claimReliefFund"
                    :disabled="userCoins >= 2000"
                    :class="userCoins < 2000 ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer' : 'bg-white/10 text-[#736354] cursor-not-allowed'"
                    class="w-full py-1 text-xs font-bold rounded-lg transition-all"
                  >
                    {{ userCoins < 2000 ? '立即领取低保' : '持有筹码充裕' }}
                  </button>
                </div>
              </div>

              <!-- Card 2: 荣誉勋章兑换 -->
              <div class="p-2.5 rounded-xl bg-[#14100D] border border-amber-500/30 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-1 text-xs font-bold text-amber-300">
                    <span>🎖️</span> 天梯荣誉禄米
                  </div>
                  <p class="text-[9px] text-[#A89888] mt-1 leading-relaxed">
                    凭借当前对弈天梯段位（{{ userRating }} 分）按周领取段位俸禄。
                  </p>
                </div>
                <div class="pt-2 border-t border-white/10">
                  <div class="text-[10px] font-mono text-amber-400 mb-1.5">+{{ Math.floor(userRating * 2.5) }} 贯周俸禄</div>
                  <button
                    type="button"
                    @click="claimRatingReward"
                    class="w-full py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white cursor-pointer transition-all"
                  >
                    申领天梯俸禄
                  </button>
                </div>
              </div>

              <!-- Card 3: 筹码补给礼包 -->
              <div class="p-2.5 rounded-xl bg-[#14100D] border border-amber-500/30 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-1 text-xs font-bold text-amber-300">
                    <span>💰</span> 快速筹码兑换
                  </div>
                  <p class="text-[9px] text-[#A89888] mt-1 leading-relaxed">
                    模拟快捷兑取茶楼筹码，供高倍数房畅爽切磋。
                  </p>
                </div>
                <div class="space-y-1 pt-1 border-t border-white/10">
                  <div class="grid grid-cols-2 gap-1">
                    <button
                      v-for="pack in [2000, 5000, 10000, 20000]"
                      :key="pack"
                      type="button"
                      @click="quickExchangeChips(pack)"
                      class="py-1 text-[10px] rounded bg-[#1C1613] hover:bg-amber-900/40 border border-amber-500/30 text-amber-300 font-mono font-bold cursor-pointer transition-colors"
                    >
                      +{{ pack }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Exchange feedback alert -->
            <div v-if="exchangeNotice" class="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-600/50 text-[10px] text-emerald-300 font-medium">
              {{ exchangeNotice }}
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- TAB 4: TELEGRAM 管理员中枢 (TELEGRAM ADMIN HUB)          -->
          <!-- ======================================================== -->
          <div v-else class="h-full flex flex-col justify-between space-y-2">
            <!-- Admin Sub-Navigation Pills -->
            <div class="flex items-center justify-between pb-1 border-b border-white/10 shrink-0">
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="adminSubTab = 'users'"
                  :class="adminSubTab === 'users' ? 'bg-amber-600 text-white font-bold' : 'bg-[#1C1613] text-[#A89888] hover:text-white'"
                  class="px-2.5 py-0.5 text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span>👥</span> 玩家调分
                </button>
                <button
                  type="button"
                  @click="adminSubTab = 'whitelist'"
                  :class="adminSubTab === 'whitelist' ? 'bg-amber-600 text-white font-bold' : 'bg-[#1C1613] text-[#A89888] hover:text-white'"
                  class="px-2.5 py-0.5 text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span>📋</span> 授权白名单
                </button>
                <button
                  type="button"
                  @click="adminSubTab = 'bot'"
                  :class="adminSubTab === 'bot' ? 'bg-amber-600 text-white font-bold' : 'bg-[#1C1613] text-[#A89888] hover:text-white'"
                  class="px-2.5 py-0.5 text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span>🤖</span> Bot 指令台
                </button>
                <button
                  type="button"
                  @click="adminSubTab = 'broadcast'"
                  :class="adminSubTab === 'broadcast' ? 'bg-amber-600 text-white font-bold' : 'bg-[#1C1613] text-[#A89888] hover:text-white'"
                  class="px-2.5 py-0.5 text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span>📢</span> 全服通告
                </button>
                <button
                  type="button"
                  @click="adminSubTab = 'logs'"
                  :class="adminSubTab === 'logs' ? 'bg-amber-600 text-white font-bold' : 'bg-[#1C1613] text-[#A89888] hover:text-white'"
                  class="px-2.5 py-0.5 text-xs rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                >
                  <span>📜</span> 审计日志
                </button>
              </div>

              <div class="flex items-center gap-1.5">
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 font-mono">
                  TG Admin: {{ props.profile.phone || '13800138000' }}
                </span>
                <button
                  type="button"
                  @click="refreshAdminData"
                  class="px-1.5 py-0.5 text-[10px] rounded bg-white/10 hover:bg-white/20 text-[#D6C7B2] cursor-pointer"
                  title="刷新数据"
                >
                  🔄
                </button>
              </div>
            </div>

            <!-- SubTab Content -->
            <div class="flex-1 min-h-0 overflow-y-auto">
              <!-- 4.1 玩家管理与调分 (Users) -->
              <div v-if="adminSubTab === 'users'" class="space-y-2">
                <!-- Search & Batch Tools Bar -->
                <div class="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[#14100D] border border-white/10 text-xs">
                  <div class="flex items-center gap-1.5 flex-1 max-w-xs">
                    <input
                      v-model="adminUserSearch"
                      type="text"
                      placeholder="按手机号/昵称/UID筛选..."
                      class="w-full px-2 py-1 text-xs rounded bg-[#1C1613] border border-white/15 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      @click="showBatchModal = true"
                      class="px-2 py-1 text-[11px] font-bold rounded bg-amber-700/80 hover:bg-amber-600 text-white cursor-pointer"
                    >
                      🎁 全服普发筹码
                    </button>
                  </div>
                </div>

                <!-- Users Table -->
                <div class="space-y-1">
                  <div
                    v-for="u in filteredAdminUsers"
                    :key="u.id"
                    class="px-2.5 py-1.5 rounded-lg bg-[#120E0C] border border-white/10 flex items-center justify-between text-xs hover:border-amber-500/30 transition-colors"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="text-xl">{{ u.avatar || '👤' }}</span>
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                          <span class="font-bold text-white truncate text-[11px]">{{ u.name }}</span>
                          <span v-if="u.isAdmin" class="text-[9px] px-1 rounded bg-amber-900/60 text-amber-300 font-bold">管理员</span>
                          <span v-if="u.isBanned" class="text-[9px] px-1 rounded bg-rose-950 text-rose-300 font-bold border border-rose-800">已封禁</span>
                        </div>
                        <div class="text-[9px] text-[#8C7A6B] font-mono">
                          📱 {{ u.phone }} · UID: {{ u.id }}
                        </div>
                      </div>
                    </div>

                    <!-- Points & Fast Adjust Actions -->
                    <div class="flex items-center gap-2 shrink-0">
                      <div class="text-right">
                        <div class="font-mono font-bold text-xs text-amber-300">{{ u.coins.toLocaleString() }} 贯</div>
                        <div class="text-[9px] text-[#8C7A6B] font-mono">段位: {{ u.rating }}</div>
                      </div>

                      <div class="flex items-center gap-1">
                        <button
                          type="button"
                          @click="quickAdjustUserPoints(u, 1000)"
                          class="px-1.5 py-0.5 text-[10px] rounded bg-emerald-950 hover:bg-emerald-800 border border-emerald-600/50 text-emerald-300 font-mono cursor-pointer"
                          title="增加1000筹码"
                        >
                          +1k
                        </button>
                        <button
                          type="button"
                          @click="quickAdjustUserPoints(u, -1000)"
                          class="px-1.5 py-0.5 text-[10px] rounded bg-rose-950 hover:bg-rose-800 border border-rose-600/50 text-rose-300 font-mono cursor-pointer"
                          title="扣减1000筹码"
                        >
                          -1k
                        </button>
                        <button
                          type="button"
                          @click="openCustomAdjustModal(u)"
                          class="px-2 py-0.5 text-[10px] rounded bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
                        >
                          调分
                        </button>
                        <button
                          type="button"
                          @click="toggleUserBan(u)"
                          :class="u.isBanned ? 'bg-emerald-900/60 text-emerald-200' : 'bg-red-950/70 text-red-300'"
                          class="px-1.5 py-0.5 text-[10px] rounded border border-white/10 cursor-pointer"
                        >
                          {{ u.isBanned ? '解封' : '封禁' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4.2 授权白名单 (Whitelist) -->
              <div v-else-if="adminSubTab === 'whitelist'" class="space-y-2">
                <!-- Add to Whitelist Box -->
                <div class="p-2 rounded-lg bg-[#14100D] border border-amber-500/25 flex items-center gap-2">
                  <input
                    v-model="newWhitelistPhone"
                    type="text"
                    placeholder="输入要加入白名单的手机号 (支持逗号批量添加)..."
                    class="flex-1 px-2.5 py-1 text-xs rounded bg-[#1C1613] border border-white/15 text-white focus:outline-none focus:border-amber-400 font-mono"
                    @keydown.enter="addWhitelistPhone"
                  />
                  <button
                    type="button"
                    @click="addWhitelistPhone"
                    class="px-3 py-1 text-xs font-bold rounded bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
                  >
                    + 加入授权白名单
                  </button>
                </div>

                <!-- Whitelist Tags Grid -->
                <div class="p-2.5 rounded-lg bg-[#120E0C] border border-white/10">
                  <div class="flex items-center justify-between text-[10px] text-[#8C7A6B] mb-2">
                    <span>当前已授权手机号列表 (共 {{ whitelistPhones.length }} 个)</span>
                    <span class="text-amber-400/80">白名单内的手机号方可注册登录</span>
                  </div>
                  <div class="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    <div
                      v-for="phone in whitelistPhones"
                      :key="phone"
                      class="px-2 py-1 rounded bg-[#1A1412] border border-amber-500/30 flex items-center gap-2 text-xs font-mono"
                    >
                      <span class="text-amber-200">{{ phone }}</span>
                      <span v-if="adminPhonesList.includes(phone)" class="text-[9px] px-1 rounded bg-amber-700/60 text-white">管理员</span>
                      <button
                        v-if="!adminPhonesList.includes(phone)"
                        type="button"
                        @click="removeWhitelistPhone(phone)"
                        class="text-red-400 hover:text-red-200 text-[10px] cursor-pointer"
                        title="移出白名单"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4.3 Bot 指令终端 (Bot Simulator) -->
              <div v-else-if="adminSubTab === 'bot'" class="h-full flex flex-col justify-between space-y-1.5">
                <!-- CLI Terminal Output -->
                <div class="h-20 sm:h-22 p-2 rounded-lg bg-black/90 border border-amber-500/30 font-mono text-[10px] overflow-y-auto space-y-0.5 text-emerald-400 shadow-inner">
                  <div class="text-[#8C7A6B] text-[9px]">
                    // Telegram Bot Admin Terminal Ready. 键入指令或点击快捷指令按钮执行。
                  </div>
                  <div v-for="(log, idx) in botOutputLogs" :key="idx" class="whitespace-pre-wrap leading-tight text-[10px]">
                    <span v-if="log.type === 'cmd'" class="text-amber-300 font-bold">&gt; {{ log.text }}</span>
                    <span v-else class="text-emerald-300">{{ log.text }}</span>
                  </div>
                </div>

                <!-- Command Quick Buttons -->
                <div class="flex flex-wrap gap-1 text-[9px]">
                  <button
                    v-for="c in ['/users', '/stats', '/addpoints 13800138000 5000', '/subpoints 13900139000 1000', '/authphone 13500135000', '/broadcast 祝茶友牌运亨通！']"
                    :key="c"
                    type="button"
                    @click="runBotCommand(c)"
                    class="px-1.5 py-0.2 rounded bg-[#1C1613] hover:bg-amber-950/70 border border-white/10 text-amber-300 font-mono cursor-pointer"
                  >
                    {{ c }}
                  </button>
                </div>

                <!-- Input Row -->
                <div class="flex items-center gap-1.5">
                  <input
                    v-model="botInputCmd"
                    type="text"
                    placeholder="输入 Telegram 指令 (如 /addpoints 13800138000 10000)..."
                    class="flex-1 px-2.5 py-1 text-xs rounded-lg bg-[#120E0C] border border-amber-500/40 text-white font-mono focus:outline-none focus:border-amber-400"
                    @keydown.enter="runBotCommand(botInputCmd)"
                  />
                  <button
                    type="button"
                    @click="runBotCommand(botInputCmd)"
                    class="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs"
                  >
                    发送指令
                  </button>
                </div>
              </div>

              <!-- 4.4 全服通告 (Broadcast) -->
              <div v-else-if="adminSubTab === 'broadcast'" class="space-y-1.5">
                <div class="p-2 rounded-lg bg-[#14100D] border border-amber-500/25 space-y-1.5">
                  <div class="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <span>📢</span> 向所有在线牌桌广播全服通告
                  </div>
                  <input
                    v-model="broadcastText"
                    type="text"
                    placeholder="输入通告内容 (将通过 WebSocket 实时推送到所有正在对局的牌桌顶端及聊天频道)..."
                    class="w-full px-2.5 py-1 text-xs rounded-lg bg-[#1C1613] border border-white/15 text-white focus:outline-none focus:border-amber-400"
                    @keydown.enter="sendBroadcast"
                  />
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1 text-[9px]">
                      <button
                        v-for="tpl in ['🎉 周末茶楼狂欢加倍开启！', '🏆 天梯雀神争霸赛火热进行中！', '🛠️ 经典牌局已完成防作弊热更新！']"
                        :key="tpl"
                        type="button"
                        @click="broadcastText = tpl"
                        class="px-1.5 py-0.2 rounded bg-white/5 hover:bg-white/10 text-[#D6C7B2] cursor-pointer"
                      >
                        {{ tpl }}
                      </button>
                    </div>
                    <button
                      type="button"
                      @click="sendBroadcast"
                      class="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shadow-xs"
                    >
                      立即全服广播
                    </button>
                  </div>
                  <div v-if="broadcastNotice" class="text-[10px] text-emerald-400 font-bold">
                    {{ broadcastNotice }}
                  </div>
                </div>

                <!-- Broadcast History -->
                <div class="p-1.5 rounded-lg bg-[#120E0C] border border-white/10">
                  <div class="text-[9px] text-[#8C7A6B] mb-1">最近播报记录:</div>
                  <div class="space-y-0.5 max-h-20 overflow-y-auto">
                    <div
                      v-for="ann in systemAnnouncements"
                      :key="ann.id"
                      class="px-2 py-0.5 rounded bg-[#181310] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span class="text-[#F5EFE6] truncate text-[10px]">{{ ann.text }}</span>
                      <span class="text-[8px] text-[#8C7A6B] font-mono shrink-0 ml-2">{{ ann.author }} ({{ ann.timestamp }})</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4.5 审计日志 (Logs) -->
              <div v-else class="space-y-1 max-h-[220px] overflow-y-auto">
                <div
                  v-for="log in adminLogs"
                  :key="log.id"
                  class="px-2.5 py-1.5 rounded-lg bg-[#120E0C] border border-white/10 flex items-center justify-between text-xs font-mono"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-amber-400">●</span>
                    <span class="text-amber-200 text-[10px] font-bold">[{{ log.action }}]</span>
                    <span class="text-[#D6C7B2] truncate text-[11px]">{{ log.details }}</span>
                  </div>
                  <div class="text-[9px] text-[#8C7A6B] shrink-0 ml-2">
                    {{ log.operator }} · {{ log.timestamp }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Admin Status Bar -->
            <div class="px-2.5 py-1 rounded-lg bg-[#120E0C] border border-white/10 text-[9px] text-[#8C7A6B] flex items-center justify-between shrink-0">
              <span>🛡️ Telegram Bot 管理协议：已同步服务器内存与本地数据库。</span>
              <span class="text-amber-400/80">操作全程加密留痕</span>
            </div>
          </div>
        </div>

        <!-- Landscape Footer Note -->
        <div class="h-5 border-t border-white/10 flex items-center justify-between text-[9px] text-[#8C7A6B] shrink-0 pt-1">
          <span>💡 筹码与战绩实时云端/本地双重加密存档</span>
          <span class="text-amber-400/80">横屏专席 · 掌上茶楼</span>
        </div>
      </main>
    </div>

    <!-- MODAL: Custom Points Adjust Dialog -->
    <div v-if="adjustTargetUser" class="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-2">
      <div class="w-72 sm:w-80 rounded-xl bg-[#1C1714] border border-amber-500/50 p-3 text-[#F5EFE6] space-y-2 shadow-2xl">
        <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
          <div class="font-bold text-xs text-amber-300">
            调配玩家筹码 - {{ adjustTargetUser.name }}
          </div>
          <button @click="adjustTargetUser = null" class="text-xs text-white/50 hover:text-white cursor-pointer">✕</button>
        </div>

        <div class="space-y-1.5 text-xs">
          <div>
            <div class="text-[9px] text-[#8C7A6B] mb-0.5">当前筹码: {{ adjustTargetUser.coins }} 贯</div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click="adjustType = 'add'"
                :class="adjustType === 'add' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-[#A89888]'"
                class="flex-1 py-0.5 text-xs rounded cursor-pointer"
              >
                + 增加
              </button>
              <button
                type="button"
                @click="adjustType = 'subtract'"
                :class="adjustType === 'subtract' ? 'bg-rose-600 text-white' : 'bg-white/10 text-[#A89888]'"
                class="flex-1 py-0.5 text-xs rounded cursor-pointer"
              >
                - 扣除
              </button>
              <button
                type="button"
                @click="adjustType = 'set'"
                :class="adjustType === 'set' ? 'bg-amber-600 text-white' : 'bg-white/10 text-[#A89888]'"
                class="flex-1 py-0.5 text-xs rounded cursor-pointer"
              >
                = 设定
              </button>
            </div>
          </div>

          <div>
            <label class="block text-[9px] text-[#8C7A6B] mb-0.5">数值 (贯)</label>
            <input
              v-model.number="adjustAmount"
              type="number"
              class="w-full px-2 py-0.5 text-xs rounded bg-[#14100D] border border-amber-500/40 text-white font-mono focus:outline-none"
              placeholder="输入筹码数值..."
            />
          </div>

          <div>
            <label class="block text-[9px] text-[#8C7A6B] mb-0.5">调配事由</label>
            <input
              v-model="adjustReason"
              type="text"
              class="w-full px-2 py-0.5 text-xs rounded bg-[#14100D] border border-white/15 text-white focus:outline-none"
              placeholder="例如: 赛事奖励 / 违规罚扣 / 充值到账"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1.5">
          <button
            type="button"
            @click="adjustTargetUser = null"
            class="flex-1 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-[#D6C7B2] cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            @click="confirmAdjustUserPoints"
            class="flex-1 py-1 text-xs font-bold rounded bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
          >
            确认执行
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: Batch Grant Modal -->
    <div v-if="showBatchModal" class="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-2">
      <div class="w-72 sm:w-80 rounded-xl bg-[#1C1714] border border-amber-500/50 p-3 text-[#F5EFE6] space-y-2 shadow-2xl">
        <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
          <div class="font-bold text-xs text-amber-300">
            🎁 全服普发筹码福利
          </div>
          <button @click="showBatchModal = false" class="text-xs text-white/50 hover:text-white cursor-pointer">✕</button>
        </div>

        <div class="space-y-1.5 text-xs">
          <div>
            <label class="block text-[9px] text-[#8C7A6B] mb-0.5">每人发放筹码 (贯)</label>
            <input
              v-model.number="batchAmount"
              type="number"
              class="w-full px-2 py-0.5 text-xs rounded bg-[#14100D] border border-amber-500/40 text-white font-mono focus:outline-none"
              placeholder="输入每人发放数量..."
            />
          </div>
          <div>
            <label class="block text-[9px] text-[#8C7A6B] mb-0.5">发放公告内容</label>
            <input
              v-model="batchReason"
              type="text"
              class="w-full px-2 py-0.5 text-xs rounded bg-[#14100D] border border-white/15 text-white focus:outline-none"
              placeholder="例如: 普天同庆茶楼大喜"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1.5">
          <button
            type="button"
            @click="showBatchModal = false"
            class="flex-1 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-[#D6C7B2] cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            @click="confirmBatchGrant"
            class="flex-1 py-1 text-xs font-bold rounded bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
          >
            一键全服发放
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: Admin Auth / Unlock Modal -->
    <div v-if="showAdminAuthModal" class="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-2">
      <div class="w-72 sm:w-80 rounded-xl bg-[#1C1714] border border-amber-500/50 p-3 text-[#F5EFE6] space-y-2 shadow-2xl">
        <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
          <div class="font-bold text-xs text-amber-300 flex items-center gap-1">
            <span>🔑</span> Telegram 管理员身份认证
          </div>
          <button @click="showAdminAuthModal = false" class="text-xs text-white/50 hover:text-white cursor-pointer">✕</button>
        </div>

        <div class="space-y-1.5 text-xs">
          <p class="text-[9px] text-[#A89888] leading-tight">
            输入 Telegram 管理员授权手机号或管理密令即可激活控制台。
          </p>
          <div>
            <label class="block text-[9px] text-[#8C7A6B] mb-0.5">管理员手机号或管理密匙</label>
            <input
              v-model="adminAuthInput"
              type="text"
              class="w-full px-2 py-0.5 text-xs rounded bg-[#14100D] border border-amber-500/40 text-white font-mono focus:outline-none"
              placeholder="默认: 13800138000 或 admin888"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 pt-1.5">
          <button
            type="button"
            @click="quickDemoAdminAuth"
            class="flex-1 py-1 text-[10px] rounded bg-white/10 hover:bg-white/20 text-amber-300 cursor-pointer"
          >
            一键快速授权
          </button>
          <button
            type="button"
            @click="submitAdminAuth"
            class="flex-1 py-1 text-xs font-bold rounded bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
          >
            验证激活
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  UserProfile,
  loadPointsTransactions,
  recordPointsTx,
  saveLocalProfile,
} from '../utils/storage';
import { soundFX } from '../utils/sound';

const props = defineProps<{
  profile: UserProfile;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:profile', p: UserProfile): void;
}>();

// Tabs: transfer | history | exchange | telegram-admin
const activeTab = ref<'transfer' | 'history' | 'exchange' | 'telegram-admin'>('transfer');

const userCoins = computed(() => props.profile.coins);
const userRating = computed(() => props.profile.rating);
const userLevel = computed(() => props.profile.level);

// Admin Mode state
const localIsAdmin = ref(Boolean(props.profile.isAdmin));
const effectiveIsAdmin = computed(() => localIsAdmin.value || props.profile.phone === '13800138000' || props.profile.username === 'admin');

const showAdminAuthModal = ref(false);
const adminAuthInput = ref('');

function submitAdminAuth() {
  const val = adminAuthInput.value.trim();
  if (val === '13800138000' || val.toLowerCase() === 'admin888' || val.toLowerCase() === 'admin') {
    localIsAdmin.value = true;
    const updated = { ...props.profile, isAdmin: true, phone: props.profile.phone || '13800138000' };
    saveLocalProfile(updated);
    emit('update:profile', updated);
    showAdminAuthModal.value = false;
    soundFX.playVictory();
    activeTab.value = 'telegram-admin';
  } else {
    alert('密令或手机号不正确 (可使用 13800138000 或 admin888)');
  }
}

function quickDemoAdminAuth() {
  localIsAdmin.value = true;
  const updated = { ...props.profile, isAdmin: true, phone: props.profile.phone || '13800138000' };
  saveLocalProfile(updated);
  emit('update:profile', updated);
  showAdminAuthModal.value = false;
  soundFX.playVictory();
  activeTab.value = 'telegram-admin';
}

// ==========================================
// 1. 筹码互赠逻辑 (Transfer)
// ==========================================
const searchPhone = ref('');
const searchedUser = ref<any>(null);
const searchError = ref('');
const transferAmount = ref<number>(500);
const transferMessage = ref('');
const transferSuccess = ref(false);

const quickContacts = ref<any[]>([
  { name: '江南茶客', phone: '13900139000', coins: 16800, level: 5, avatar: '🍵' },
  { name: '云游散人', phone: '13700137000', coins: 12500, level: 4, avatar: '☁️' },
  { name: '醉月居士', phone: '13600136000', coins: 9200, level: 4, avatar: '🌙' },
]);

function selectQuickContact(u: any) {
  searchPhone.value = u.phone;
  searchedUser.value = u;
  searchError.value = '';
}

async function searchUser() {
  searchError.value = '';
  searchedUser.value = null;
  const phone = searchPhone.value.trim();
  if (!phone) {
    searchError.value = '请输入手机号';
    return;
  }
  try {
    const res = await fetch(`/api/users/search?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    if (data.success && data.user) {
      if (data.user.phone === props.profile.phone) {
        searchError.value = '不能向自己赠送筹码';
        return;
      }
      searchedUser.value = data.user;
    } else {
      searchError.value = data.error || '未找到该手机号对应的茶客';
    }
  } catch (e) {
    searchError.value = '网络请求失败';
  }
}

async function submitTransfer() {
  transferMessage.value = '';
  transferSuccess.value = false;
  if (!searchedUser.value) {
    transferMessage.value = '请先搜索并选定接收茶客';
    return;
  }
  const amt = Number(transferAmount.value);
  if (isNaN(amt) || amt <= 0) {
    transferMessage.value = '请输入有效的赠送数量';
    return;
  }
  if (props.profile.coins < amt) {
    transferMessage.value = '持有筹码不足';
    return;
  }

  try {
    const res = await fetch('/api/points/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: props.profile.id,
        recipientPhone: searchedUser.value.phone,
        amount: amt,
      }),
    });
    const data = await res.json();
    if (data.success) {
      const updatedProfile: UserProfile = {
        ...props.profile,
        coins: data.senderProfile.coins,
      };
      saveLocalProfile(updatedProfile);
      recordPointsTx('admin_grant', `向茶友【${searchedUser.value.name}】赠送筹码`, -amt, updatedProfile.coins);
      transactions.value = loadPointsTransactions();
      historyPage.value = 0;
      emit('update:profile', updatedProfile);
      transferSuccess.value = true;
      transferMessage.value = `成功向 ${searchedUser.value.name} 赠送 ${amt} 贯筹码！`;
      soundFX.playVictory();
      searchPhone.value = '';
      searchedUser.value = null;
    } else {
      transferMessage.value = data.error || '转账失败';
    }
  } catch (e) {
    transferMessage.value = '网络请求失败';
  }
}

// ==========================================
// 2. 收支明细逻辑 (History)
// ==========================================
const transactions = ref(loadPointsTransactions());
const historyFilter = ref<'all' | 'income' | 'expense'>('all');
const historyPage = ref(0);
const pageSize = 4;

const filteredTransactions = computed(() => {
  if (historyFilter.value === 'income') {
    return transactions.value.filter((t) => t.amount >= 0);
  }
  if (historyFilter.value === 'expense') {
    return transactions.value.filter((t) => t.amount < 0);
  }
  return transactions.value;
});

const totalHistoryPages = computed(() => Math.max(1, Math.ceil(filteredTransactions.value.length / pageSize)));

const paginatedTransactions = computed(() => {
  const start = historyPage.value * pageSize;
  return filteredTransactions.value.slice(start, start + pageSize);
});

function prevHistoryPage() {
  if (historyPage.value > 0) historyPage.value--;
}

function nextHistoryPage() {
  if (historyPage.value < totalHistoryPages.value - 1) historyPage.value++;
}

// ==========================================
// 3. 钱庄福利与兑换逻辑 (Exchange)
// ==========================================
const exchangeNotice = ref('');

function claimReliefFund() {
  if (props.profile.coins >= 2000) return;
  const newCoins = props.profile.coins + 3000;
  const updated: UserProfile = { ...props.profile, coins: newCoins };
  saveLocalProfile(updated);
  recordPointsTx('relief', '茶楼义仓每日救济扶持金', 3000, newCoins);
  transactions.value = loadPointsTransactions();
  emit('update:profile', updated);
  soundFX.playVictory();
  exchangeNotice.value = '成功领受茶楼义仓 3,000 贯应急筹码！';
  setTimeout(() => (exchangeNotice.value = ''), 4000);
}

function claimRatingReward() {
  const reward = Math.floor(userRating.value * 2.5);
  const newCoins = props.profile.coins + reward;
  const updated: UserProfile = { ...props.profile, coins: newCoins };
  saveLocalProfile(updated);
  recordPointsTx('reward', `天梯段位(${userRating.value}分)荣誉周俸禄`, reward, newCoins);
  transactions.value = loadPointsTransactions();
  emit('update:profile', updated);
  soundFX.playVictory();
  exchangeNotice.value = `成功领取段位俸禄 +${reward} 贯！`;
  setTimeout(() => (exchangeNotice.value = ''), 4000);
}

function quickExchangeChips(amt: number) {
  const newCoins = props.profile.coins + amt;
  const updated: UserProfile = { ...props.profile, coins: newCoins };
  saveLocalProfile(updated);
  recordPointsTx('exchange', `钱庄兑取筹码锦囊`, amt, newCoins);
  transactions.value = loadPointsTransactions();
  emit('update:profile', updated);
  soundFX.playVictory();
  exchangeNotice.value = `成功注入筹码 +${amt} 贯！`;
  setTimeout(() => (exchangeNotice.value = ''), 4000);
}

// ==========================================
// 4. TELEGRAM 管理员功能与控制台逻辑
// ==========================================
const adminSubTab = ref<'users' | 'whitelist' | 'bot' | 'broadcast' | 'logs'>('users');
const adminUsers = ref<any[]>([]);
const adminUserSearch = ref('');
const whitelistPhones = ref<string[]>([]);
const adminPhonesList = ref<string[]>(['13800138000']);
const newWhitelistPhone = ref('');
const adminLogs = ref<any[]>([]);
const systemAnnouncements = ref<any[]>([]);

// Bot command simulator
const botInputCmd = ref('/users');
const botOutputLogs = ref<{ type: 'cmd' | 'reply'; text: string }[]>([
  { type: 'reply', text: '🤖 Telegram Bot 连接成功。输入 /help 查看指令说明。' },
]);

// Broadcast
const broadcastText = ref('');
const broadcastNotice = ref('');

// Custom Adjust Dialog
const adjustTargetUser = ref<any>(null);
const adjustType = ref<'add' | 'subtract' | 'set'>('add');
const adjustAmount = ref<number>(1000);
const adjustReason = ref('管理员调配');

// Batch Grant Dialog
const showBatchModal = ref(false);
const batchAmount = ref<number>(2000);
const batchReason = ref('茶楼新秀狂欢普发礼金');

const filteredAdminUsers = computed(() => {
  const q = adminUserSearch.value.trim().toLowerCase();
  if (!q) return adminUsers.value;
  return adminUsers.value.filter(
    (u) =>
      u.name?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.id?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q)
  );
});

async function refreshAdminData() {
  try {
    const [uRes, wRes, lRes] = await Promise.all([
      fetch('/api/admin/users').then((r) => r.json()),
      fetch('/api/admin/whitelist').then((r) => r.json()),
      fetch('/api/admin/logs').then((r) => r.json()),
    ]);
    if (uRes.success) adminUsers.value = uRes.users;
    if (wRes.success) {
      whitelistPhones.value = wRes.authorizedPhones || [];
      adminPhonesList.value = wRes.adminPhones || [];
    }
    if (lRes.success) adminLogs.value = lRes.logs || [];
  } catch {}
}

async function quickAdjustUserPoints(user: any, delta: number) {
  try {
    const res = await fetch('/api/admin/points/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: user.id,
        phone: user.phone,
        delta: Math.abs(delta),
        type: delta >= 0 ? 'add' : 'subtract',
        reason: 'TG管理员快捷调分',
      }),
    });
    const data = await res.json();
    if (data.success) {
      user.coins = data.newCoins;
      soundFX.playTap();
      refreshAdminData();
      if (user.id === props.profile.id) {
        emit('update:profile', { ...props.profile, coins: data.newCoins });
      }
    }
  } catch {}
}

function openCustomAdjustModal(user: any) {
  adjustTargetUser.value = user;
  adjustAmount.value = 1000;
  adjustReason.value = '管理员手动调分';
  adjustType.value = 'add';
}

async function confirmAdjustUserPoints() {
  if (!adjustTargetUser.value) return;
  try {
    const res = await fetch('/api/admin/points/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: adjustTargetUser.value.id,
        phone: adjustTargetUser.value.phone,
        delta: adjustAmount.value,
        type: adjustType.value,
        reason: adjustReason.value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      adjustTargetUser.value.coins = data.newCoins;
      soundFX.playVictory();
      if (adjustTargetUser.value.id === props.profile.id) {
        emit('update:profile', { ...props.profile, coins: data.newCoins });
      }
      adjustTargetUser.value = null;
      refreshAdminData();
    }
  } catch {}
}

async function toggleUserBan(user: any) {
  try {
    const nextBan = !user.isBanned;
    const res = await fetch('/api/admin/user/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        isBanned: nextBan,
        reason: nextBan ? '违规游戏封禁' : '',
      }),
    });
    const data = await res.json();
    if (data.success) {
      user.isBanned = nextBan;
      soundFX.playTap();
      refreshAdminData();
    }
  } catch {}
}

async function addWhitelistPhone() {
  const val = newWhitelistPhone.value.trim();
  if (!val) return;
  try {
    const res = await fetch('/api/admin/whitelist/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phones: val }),
    });
    const data = await res.json();
    if (data.success) {
      whitelistPhones.value = data.totalAuthorized;
      newWhitelistPhone.value = '';
      soundFX.playTap();
      refreshAdminData();
    }
  } catch {}
}

async function removeWhitelistPhone(phone: string) {
  try {
    const res = await fetch('/api/admin/whitelist/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (data.success) {
      whitelistPhones.value = data.totalAuthorized;
      broadcastNotice.value = `已成功将手机号 ${phone} 移出 Telegram 授权白名单`;
      setTimeout(() => (broadcastNotice.value = ''), 4000);
      soundFX.playTap();
      refreshAdminData();
    }
  } catch {}
}

async function runBotCommand(cmdStr: string) {
  const text = cmdStr.trim();
  if (!text) return;
  botOutputLogs.value.push({ type: 'cmd', text });
  try {
    const res = await fetch('/api/telegram/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: text }),
    });
    const data = await res.json();
    botOutputLogs.value.push({ type: 'reply', text: data.reply || '无回执信息' });
    soundFX.playTap();
    refreshAdminData();
  } catch (e) {
    botOutputLogs.value.push({ type: 'reply', text: `❌ 执行失败: ${String(e)}` });
  }
  botInputCmd.value = '';
}

async function sendBroadcast() {
  const msg = broadcastText.value.trim();
  if (!msg) return;
  try {
    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msg, author: props.profile.name || 'Telegram 管理员' }),
    });
    const data = await res.json();
    if (data.success) {
      broadcastNotice.value = '全服广播发送成功！所有牌桌均已收到通告。';
      broadcastText.value = '';
      systemAnnouncements.value.unshift(data.announcement);
      soundFX.playVictory();
      setTimeout(() => (broadcastNotice.value = ''), 4000);
    }
  } catch {}
}

async function confirmBatchGrant() {
  try {
    const res = await fetch('/api/admin/points/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: batchAmount.value,
        reason: batchReason.value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showBatchModal.value = false;
      broadcastNotice.value = `已成功向全服 ${data.affectedCount} 位茶客每人派发 ${data.amount} 贯筹码！`;
      setTimeout(() => (broadcastNotice.value = ''), 4000);
      soundFX.playVictory();
      refreshAdminData();
      // Update self coins too
      const selfUpdatedCoins = props.profile.coins + batchAmount.value;
      emit('update:profile', { ...props.profile, coins: selfUpdatedCoins });
    }
  } catch {}
}

onMounted(() => {
  refreshAdminData();
});
</script>
