<template>
  <div class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
    <div class="w-full max-w-2xl max-h-[95vh] flex flex-col rounded-2xl bg-[#1C1815] border border-amber-500/30 p-4 shadow-2xl overflow-hidden text-[#F5EFE6]">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-[#2E2722] shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-xl">📲</span>
          <div>
            <h3 class="text-sm font-bold text-[#F5EFE6] font-serif-title">Android APK 客户端下载</h3>
            <p class="text-[10px] text-[#A89887]">高速直链 · 自动同步 · Android 7.0+</p>
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
      <div class="flex-1 overflow-y-auto py-3 space-y-3">
        <!-- 仓库配置 -->
        <div class="p-3 rounded-xl bg-[#14110F] border border-[#2E2722]">
          <label class="text-[10px] font-semibold text-amber-300">关联 GitHub 仓库 (格式: 用户名/仓库名)</label>
          <div class="flex items-center gap-2 mt-1">
            <input
              v-model="repoPath"
              type="text"
              class="flex-1 px-2 py-1 text-xs rounded bg-[#0D0A08] border border-amber-500/30 text-[#F5EFE6] font-mono"
            />
            <button @click="resetRepo" class="px-2 py-1 text-xs rounded bg-[#26201B] text-[#D6C7B2] cursor-pointer">重置</button>
          </div>
        </div>

        <!-- 线路 -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold text-[#F5EFE6]">🚀 极速下载通道 (点击直接下载APK)</h4>
          <a :href="rawApkUrl" download="chess-game-release.apk" class="block p-3 rounded-xl bg-gradient-to-r from-amber-900/20 to-amber-700/20 border border-amber-500/40 hover:border-amber-400 text-xs text-white">
            线路 1：仓库直链直下 (最快)
          </a>
          <a :href="ghproxyRawUrl" download="chess-game-release.apk" class="block p-3 rounded-xl bg-[#171310] border border-[#2E2722] hover:border-amber-500/40 text-xs text-white">
            线路 2：国内加速镜像
          </a>
        </div>

        <!-- 说明 -->
        <div class="p-3 rounded-xl bg-[#120E0C] border border-[#2E2722] text-[10px] text-[#A89887]">
          <p>💡 <strong class="text-[#E6DEC8]">下载提示</strong>：若提示 404，请稍候几分钟等待 Action 编译完成。如遇安装拦截，请允许安装未知来源应用。</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="pt-3 border-t border-[#2E2722] flex items-center justify-between shrink-0 mt-1">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-1.5 text-xs rounded-xl bg-[#2E2722] hover:bg-[#3D352F] text-[#F5EFE6] font-medium flex items-center gap-1.5 cursor-pointer"
        >
          <span>🏠</span> 返回大厅
        </button>
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-1.5 text-xs rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium cursor-pointer"
        >
          完成返回
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

defineEmits<{ (e: 'close'): void }>();

const defaultRepo = 'junwuji717/chess-game';
const repoPath = ref(localStorage.getItem('app_github_repo') || defaultRepo);

function resetRepo() { repoPath.value = defaultRepo; localStorage.removeItem('app_github_repo'); }

const cleanRepo = computed(() => repoPath.value.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/^\/+|\/+$/g, '') || defaultRepo);
const rawApkUrl = computed(() => `https://raw.githubusercontent.com/${cleanRepo.value}/main/apk/app-latest.apk`);
const ghproxyRawUrl = computed(() => `https://ghproxy.net/${rawApkUrl.value}`);
</script>
