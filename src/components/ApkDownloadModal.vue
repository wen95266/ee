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
                直链高速下载
              </span>
            </h3>
            <p class="text-[11px] text-[#A89887]">
              点击立即下载 APK 安装包 · 自动同步最新版本 · Android 7.0+ 原生畅玩
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
              <span>关联 GitHub 仓库（用于生成专属下载直链）：</span>
            </label>
            <span class="text-[10px] text-[#8C7A6B]">格式: 用户名/仓库名</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="repoPath"
              type="text"
              placeholder="例如: your-name/chess-game"
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

        <!-- 极速直链下载通道列表 -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-[#F5EFE6] flex items-center gap-1.5">
              <span>🚀</span>
              <span>APK 文件直接下载通道 (点击即开始下载)</span>
            </h4>
            <span class="text-[10px] text-emerald-400 font-mono">免 404 直链</span>
          </div>

          <!-- 线路 1: 仓库 Raw 源码直链 (首选，确保100%可直接下载) -->
          <div class="p-3 rounded-2xl bg-gradient-to-r from-[#211B15] to-[#171310] border border-amber-500/40 hover:border-amber-400/80 transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                ⚡️
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-xs text-white">线路 1：仓库直链下载 (推荐)</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">秒下正版</span>
                </div>
                <div class="text-[10px] text-[#A89887] mt-0.5">直接从仓库编译产物 `app-latest.apk` 下载，绝无 404</div>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                @click="copyUrl(rawApkUrl, '线路1')"
                class="px-2.5 py-1.5 text-[11px] rounded-xl bg-[#2A221C] hover:bg-[#3A2F27] text-[#D6C7B2] border border-[#3E3229] transition-all cursor-pointer"
              >
                {{ copiedName === '线路1' ? '✓ 已复制' : '复制链接' }}
              </button>
              <a
                :href="rawApkUrl"
                download="chess-game-release.apk"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>立即下载 APK</span>
                <span>↓</span>
              </a>
            </div>
          </div>

          <!-- 线路 2: 国内 GHProxy 加速直链 -->
          <div class="p-3 rounded-2xl bg-[#171310] border border-[#2E2722] hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#211B15] border border-[#2E2722] flex items-center justify-center text-xl shrink-0">
                🚀
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-xs text-white">线路 2：GHProxy 加速镜像</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">国内加速</span>
                </div>
                <div class="text-[10px] text-[#A89887] mt-0.5">国内大带宽 CDN 加速下载仓库最新 APK 文件</div>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                @click="copyUrl(ghproxyRawUrl, '线路2')"
                class="px-2.5 py-1.5 text-[11px] rounded-xl bg-[#2A221C] hover:bg-[#3A2F27] text-[#D6C7B2] border border-[#3E3229] transition-all cursor-pointer"
              >
                {{ copiedName === '线路2' ? '✓ 已复制' : '复制链接' }}
              </button>
              <a
                :href="ghproxyRawUrl"
                download="chess-game-release.apk"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#2E2620] hover:bg-amber-600 text-white shadow-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>加速下载</span>
                <span>↓</span>
              </a>
            </div>
          </div>

          <!-- 线路 3: GitHub Release 官方页面 -->
          <div class="p-3 rounded-2xl bg-[#14110F] border border-[#26201B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#1C1815] border border-[#2E2722] flex items-center justify-center text-xl shrink-0">
                📦
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-xs text-[#C8BAA8]">线路 3：GitHub Releases 发布页</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-gray-500/20 text-gray-300 border border-gray-500/30 font-mono">官方源</span>
                </div>
                <div class="text-[10px] text-[#8C7A6B] mt-0.5">查看所有历史版本与 Release 资产列表</div>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                @click="copyUrl(releasePageUrl, '线路3')"
                class="px-2.5 py-1.5 text-[11px] rounded-xl bg-[#201A16] hover:bg-[#2B231E] text-[#B8A99A] border border-[#2E2722] transition-all cursor-pointer"
              >
                {{ copiedName === '线路3' ? '✓ 已复制' : '复制链接' }}
              </button>
              <a
                :href="releasePageUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3.5 py-1.5 text-xs font-medium rounded-xl bg-[#26201B] hover:bg-[#342C25] text-[#D6C7B2] border border-[#3A3029] transition-all cursor-pointer"
              >
                前往页面
              </a>
            </div>
          </div>
        </div>

        <!-- 安装与说明 -->
        <div class="p-3 rounded-2xl bg-[#120E0C] border border-[#2E2722] space-y-1.5 text-[11px] text-[#A89887] leading-relaxed">
          <div class="text-amber-400 font-bold text-xs flex items-center gap-1.5">
            <span>💡</span>
            <span>温馨提示：</span>
          </div>
          <p>
            1. <strong class="text-[#E6DEC8]">为什么有时会 404？</strong> 如果您的 GitHub 仓库刚刚创建且 Actions 还在第一次编译中，Release 资产或 `apk/app-latest.apk` 尚未生成。推送代码几分钟后编译完成即可正常直接下载！
          </p>
          <p>
            2. <strong class="text-[#E6DEC8]">安卓安装说明</strong>：下载完成后点击安装，如遇系统提示「来自未知来源应用」，勾选允许即可畅玩五大国粹棋牌。
          </p>
        </div>
      </div>

      <!-- Footer (包含返回大厅按钮) -->
      <div class="pt-3 border-t border-[#2E2722] flex items-center justify-between shrink-0 mt-3 text-xs">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-1.5 text-xs rounded-xl bg-[#2E2722] hover:bg-[#3D352F] text-[#F5EFE6] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>🏠</span>
          <span>返回大厅</span>
        </button>

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

// Default repository path
const defaultRepo = 'junwuji717/chess-game';
const repoPath = ref(localStorage.getItem('app_github_repo') || defaultRepo);
const copiedName = ref<string | null>(null);

function resetRepo() {
  repoPath.value = defaultRepo;
  localStorage.removeItem('app_github_repo');
}

const cleanRepo = computed(() => {
  let val = repoPath.value.trim();
  val = val.replace(/^https?:\/\/github\.com\//i, '');
  val = val.replace(/^\/+|\/+$/g, '');
  return val || defaultRepo;
});

// Direct APK Download URLs (pointing to raw committed apk in repo, avoiding 404)
const rawApkUrl = computed(() => {
  return `https://raw.githubusercontent.com/${cleanRepo.value}/main/apk/app-latest.apk`;
});

const ghproxyRawUrl = computed(() => {
  return `https://ghproxy.net/${rawApkUrl.value}`;
});

const releasePageUrl = computed(() => {
  return `https://github.com/${cleanRepo.value}/releases/tag/latest-apk`;
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
