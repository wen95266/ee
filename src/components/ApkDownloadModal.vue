<template>
  <div class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
    <div class="w-[96vw] max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#1C1815] border border-amber-500/30 p-4 sm:p-6 shadow-2xl overflow-hidden text-[#F5EFE6]">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-[#2E2722] shrink-0 mb-4">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl p-2 rounded-xl bg-[#26201B] border border-[#3A3029] shrink-0">📲</span>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-[#F5EFE6] font-serif-title flex items-center gap-2">
              Android APK 客户端下载
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-mono">
                国内极速加速
              </span>
            </h3>
            <p class="text-[11px] text-[#A89887]">
              自动同步仓库最新版本 · 覆盖更新永久有效 · Android 7.0+ 原生畅玩
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-[#B8A99A] hover:text-white transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto pr-1 space-y-4">
        <!-- 仓库配置提示卡 -->
        <div class="p-3.5 rounded-2xl bg-[#14110F] border border-[#2E2722] space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <span>🔗</span>
              <span>关联 GitHub 仓库（用于生成专属加速直链）：</span>
            </label>
            <span class="text-[10px] text-[#8C7A6B]">格式: 用户名/仓库名</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="repoPath"
              type="text"
              placeholder="例如: your-name/chess-lobby"
              class="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[#0D0A08] border border-amber-500/30 text-[#F5EFE6] focus:outline-none focus:border-amber-400 font-mono"
            />
            <button
              type="button"
              @click="resetRepo"
              class="px-2.5 py-1.5 text-xs rounded-xl bg-[#26201B] hover:bg-[#342C25] text-[#D6C7B2] border border-[#3A3029] transition-colors whitespace-nowrap cursor-pointer"
            >
              重置
            </button>
          </div>
        </div>

        <!-- 国内极速下载通道列表 -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
              <span>🚀</span>
              <span>国内高速加速节点 (免翻墙·电信/联通/移动全网直连)</span>
            </h4>
            <span class="text-[10px] text-emerald-400 font-mono">已优化 CDN 路由</span>
          </div>

          <!-- 线路 1: GHProxy -->
          <div class="p-3 rounded-2xl bg-gradient-to-r from-[#211B15] to-[#171310] border border-amber-500/40 hover:border-amber-400/80 transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                ⚡️
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-xs text-white">线路 1：GHProxy 极速专线</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">首选推荐</span>
                </div>
                <div class="text-[10px] text-[#A89887] mt-0.5">国内全网大带宽节点缓存，直接拉取 Release 正式版 APK</div>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                @click="copyUrl(ghproxyUrl, '线路1')"
                class="px-2.5 py-1.5 text-[11px] rounded-xl bg-[#2A221C] hover:bg-[#3A2F27] text-[#D6C7B2] border border-[#3E3229] transition-all cursor-pointer"
              >
                {{ copiedName === '线路1' ? '✓ 已复制' : '复制链接' }}
              </button>
              <a
                :href="ghproxyUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>立即下载</span>
                <span>↓</span>
              </a>
            </div>
          </div>

          <!-- 线路 2: GitMirror -->
          <div class="p-3 rounded-2xl bg-[#171310] border border-[#2E2722] hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#211B15] border border-[#2E2722] flex items-center justify-center text-xl shrink-0">
                🚀
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-xs text-white">线路 2：GitMirror 高速镜像</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">备用专线</span>
                </div>
                <div class="text-[10px] text-[#A89887] mt-0.5">多线 BGP 节点中继，支持断点续传与多线程拉取</div>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                @click="copyUrl(gitmirrorUrl, '线路2')"
                class="px-2.5 py-1.5 text-[11px] rounded-xl bg-[#2A221C] hover:bg-[#3A2F27] text-[#D6C7B2] border border-[#3E3229] transition-all cursor-pointer"
              >
                {{ copiedName === '线路2' ? '✓ 已复制' : '复制链接' }}
              </button>
              <a
                :href="gitmirrorUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#2E2620] hover:bg-amber-600 text-white shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>立即下载</span>
                <span>↓</span>
              </a>
            </div>
          </div>

          <!-- 线路 3: KKGitHub -->
          <div class="p-3 rounded-2xl bg-[#171310] border border-[#2E2722] hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#211B15] border border-[#2E2722] flex items-center justify-center text-xl shrink-0">
                🌐
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-xs text-white">线路 3：KKGitHub 节点</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">网页直开</span>
                </div>
                <div class="text-[10px] text-[#A89887] mt-0.5">国内可免翻墙直接浏览 Releases 详情页并下载</div>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                @click="copyUrl(kkgithubUrl, '线路3')"
                class="px-2.5 py-1.5 text-[11px] rounded-xl bg-[#2A221C] hover:bg-[#3A2F27] text-[#D6C7B2] border border-[#3E3229] transition-all cursor-pointer"
              >
                {{ copiedName === '线路3' ? '✓ 已复制' : '复制链接' }}
              </button>
              <a
                :href="kkgithubUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#2E2620] hover:bg-amber-600 text-white shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>前往页面</span>
                <span>→</span>
              </a>
            </div>
          </div>

          <!-- 线路 4: 官方 GitHub 原始直链 -->
          <div class="p-3 rounded-2xl bg-[#14110F] border border-[#26201B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#1C1815] border border-[#2E2722] flex items-center justify-center text-xl shrink-0">
                🌍
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-xs text-[#C8BAA8]">线路 4：GitHub 官方源直链</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-gray-500/20 text-gray-300 border border-gray-500/30 font-mono">海外/科学上网</span>
                </div>
                <div class="text-[10px] text-[#8C7A6B] mt-0.5">官方 Release 原生发布地址 (国内直连可能较慢)</div>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                @click="copyUrl(officialUrl, '官方')"
                class="px-2.5 py-1.5 text-[11px] rounded-xl bg-[#201A16] hover:bg-[#2B231E] text-[#B8A99A] border border-[#2E2722] transition-all cursor-pointer"
              >
                {{ copiedName === '官方' ? '✓ 已复制' : '复制链接' }}
              </button>
              <a
                :href="officialUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-[#26201B] hover:bg-[#342C25] text-[#D6C7B2] border border-[#3A3029] transition-all cursor-pointer"
              >
                官方下载
              </a>
            </div>
          </div>
        </div>

        <!-- 3点安装与自动覆盖说明 -->
        <div class="p-3 rounded-2xl bg-[#120E0C] border border-[#2E2722] space-y-1.5 text-[11px] text-[#A89887] leading-relaxed">
          <div class="text-amber-400 font-bold text-xs flex items-center gap-1.5">
            <span>💡</span>
            <span>自动覆盖与安装须知：</span>
          </div>
          <p>
            1. <strong class="text-[#E6DEC8]">代码更新自动覆盖</strong>：每次向仓库 push 代码，GitHub Actions 将全自动编译并将新 APK 覆盖到固定标签 <code class="text-amber-300 font-mono">latest-apk</code>，上述下载直链永久有效、随时下载即为最新版本。
          </p>
          <p>
            2. <strong class="text-[#E6DEC8]">手机安装提示</strong>：下载完成后点击安装，如遇系统提示「来自未知来源应用」或「允许此来源安装」，勾选允许即可直接安装畅玩。
          </p>
          <p>
            3. <strong class="text-[#E6DEC8]">五大棋牌完整内置</strong>：APK 已打包斗地主、烟三、四人锄大地、十三水、国标麻将所有游戏引擎及离线 Canvas 资源，支持局域网或公网实时联机。
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="pt-3 border-t border-[#2E2722] flex items-center justify-between shrink-0 mt-3 text-xs">
        <span class="text-[#8C7A6B] text-[10px]">
          文件: chess-game-release.apk (预签名免配置)
        </span>
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-1.5 text-xs rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors cursor-pointer"
        >
          完成返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

defineEmits<{
  (e: 'close'): void;
}>();

// Default repository path (can be customized by user or retrieved from env)
const defaultRepo = 'junwuji717/chess-game';
const repoPath = ref(localStorage.getItem('app_github_repo') || defaultRepo);
const copiedName = ref<string | null>(null);

function resetRepo() {
  repoPath.value = defaultRepo;
  localStorage.removeItem('app_github_repo');
}

const cleanRepo = computed(() => {
  let val = repoPath.value.trim();
  // Remove leading https://github.com/ if pasted
  val = val.replace(/^https?:\/\/github\.com\//i, '');
  val = val.replace(/^\/+|\/+$/g, '');
  return val || defaultRepo;
});

// Download URLs
const officialUrl = computed(() => {
  return `https://github.com/${cleanRepo.value}/releases/download/latest-apk/chess-game-release.apk`;
});

const ghproxyUrl = computed(() => {
  return `https://ghproxy.net/${officialUrl.value}`;
});

const gitmirrorUrl = computed(() => {
  return `https://hub.gitmirror.com/${officialUrl.value}`;
});

const kkgithubUrl = computed(() => {
  return `https://kkgithub.com/${cleanRepo.value}/releases/tag/latest-apk`;
});

function copyUrl(url: string, name: string) {
  navigator.clipboard?.writeText(url);
  copiedName.value = name;
  localStorage.setItem('app_github_repo', cleanRepo.value);
  setTimeout(() => {
    if (copiedName.value === name) {
      copiedName.value = null;
    }
  }, 2000);
}
</script>
