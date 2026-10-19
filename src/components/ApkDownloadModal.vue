<template>
  <div class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-2">
    <div class="w-full max-w-sm rounded-2xl bg-[#1C1815] border border-amber-500/30 p-4 shadow-2xl overflow-hidden text-[#F5EFE6]">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-[#2E2722] mb-3">
        <h3 class="text-sm font-bold">Android APK 下载</h3>
        <button type="button" @click="$emit('close')" class="text-xs text-[#B8A99A] hover:text-white transition-colors">✕</button>
      </div>

      <!-- Links -->
      <div class="space-y-2 mb-4">
        <!-- 线路 1：GHProxy 极速直链下载 -->
        <a 
          :href="rawApkUrl" 
          download 
          class="block w-full p-2.5 rounded-lg bg-[#26201B] hover:bg-amber-700/50 border border-amber-500/30 text-xs text-center transition-colors"
        >
          🚀 线路 1：极速直链下载 (GHProxy)
        </a>

        <!-- 线路 2：GitMirror 国内镜像加速 -->
        <a 
          :href="gitmirrorUrl" 
          download 
          class="block w-full p-2.5 rounded-lg bg-[#26201B] hover:bg-amber-700/50 border border-amber-500/30 text-xs text-center transition-colors"
        >
          ⚡ 线路 2：国内镜像下载 (GitMirror)
        </a>

        <!-- 线路 3：GitHub 官方 Release 发布页 -->
        <a 
          :href="releasePageUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="block w-full p-2.5 rounded-lg bg-[#26201B] hover:bg-amber-700/50 border border-amber-500/30 text-xs text-center transition-colors"
        >
          🌐 线路 3：GitHub 官方页面 (备用)
        </a>
      </div>

      <!-- Footer -->
      <button
        type="button"
        @click="$emit('close')"
        class="w-full py-2.5 text-xs rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors"
      >
        返回大厅
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 仓库配置
const repoPath = 'wen95266/ee';

// 真实存在的 APK 文件名（根据 GitHub Release 资产列表）
const apkFileName = 'chess-game-debug.apk';

// 1. GitHub 官方原始直链
const releaseApkUrl = `https://github.com/${repoPath}/releases/download/latest-apk/${apkFileName}`;

// 2. 线路 1：GHProxy 极速直链下载
const rawApkUrl = `https://ghproxy.net/${releaseApkUrl}`;

// 3. 线路 2：GitMirror 镜像加速
const gitmirrorUrl = `https://hub.gitmirror.com/${releaseApkUrl}`;

// 4. 线路 3：GitHub 发布页面
const releasePageUrl = `https://github.com/${repoPath}/releases/tag/latest-apk`;

defineEmits<{ (e: 'close'): void }>();
</script>
