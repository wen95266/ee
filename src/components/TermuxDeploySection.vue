<template>
  <div v-if="props.isModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
    <div class="w-[96vw] max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#1C1815] border border-amber-500/30 p-3 sm:p-5 shadow-2xl overflow-hidden text-[#F5EFE6]">
      <div class="flex items-center justify-between pb-2.5 border-b border-[#2E2722] shrink-0 mb-3">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl p-1.5 rounded-xl bg-[#26201B] border border-[#3A3029] shrink-0">📱</span>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-[#F5EFE6] font-serif-title flex items-center gap-2">
              Android Termux 原生编译与高性能守护
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-600/30 text-amber-300 border border-amber-500/40 font-mono">
                Rust Axum + Tokio
              </span>
            </h3>
            <p class="text-[11px] text-[#A89887]">
              架构：aarch64-linux-android · WS延迟：{{ wsRtt }}ms · 状态：{{ wsConnected ? '已连通' : '重连中' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-[#B8A99A] hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div class="flex-1 overflow-y-auto pr-1 space-y-4">
        <!-- 3 Tech Highlights -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="p-3 rounded-xl bg-[#14110F] border border-[#2E2722]">
            <div class="text-amber-400 font-semibold text-xs mb-1">
              1. Rust Axum + DashMap 无锁房间网关
            </div>
            <p class="text-[11px] text-[#B8A99A] leading-relaxed">
              手机本地编译仅占约 14MB 内存，利用 Tokio 异步协程处理斗地主、烟三、锄大地、十三水、麻将五大棋种广播。
            </p>
          </div>

          <div class="p-3 rounded-xl bg-[#14110F] border border-[#2E2722]">
            <div class="text-amber-400 font-semibold text-xs mb-1">
              2. Termux 防睡眠与局域网对决
            </div>
            <p class="text-[11px] text-[#B8A99A] leading-relaxed">
              启动脚本配置 termux-wake-lock 锁定 CPU 调度，自动绑定手机 Wi-Fi IP，宿舍/聚会同热点下直接扫码对战。
            </p>
          </div>

          <div class="p-3 rounded-xl bg-[#14110F] border border-[#2E2722]">
            <div class="text-amber-400 font-semibold text-xs mb-1">
              3. Vue 3 + Canvas 触控滑动连选
            </div>
            <p class="text-[11px] text-[#B8A99A] leading-relaxed">
              基于 HTML5 Canvas 原生手势监听，支持横向滑牌连选顺子、麻将点选摸打与智能理牌提示，原生流畅无微卡顿。
            </p>
          </div>
        </div>

        <!-- Code Viewer & WS Frames Split -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div class="lg:col-span-8 rounded-xl bg-[#14110F] border border-[#2E2722] flex flex-col overflow-hidden">
            <div class="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#211C18] border-b border-[#2E2722]">
              <div class="flex items-center gap-1 p-0.5 bg-[#14110F] rounded-lg">
                <button
                  type="button"
                  @click="activeTab = 'deploy'"
                  :class="activeTab === 'deploy' ? 'bg-amber-600 text-white' : 'text-[#B8A99A] hover:text-white'"
                  class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  deploy_termux.sh (一键部署)
                </button>
                <button
                  type="button"
                  @click="activeTab = 'apk'"
                  :class="activeTab === 'apk' ? 'bg-amber-600 text-white' : 'text-[#B8A99A] hover:text-white'"
                  class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  build-apk.yml (APK自动打包)
                </button>
                <button
                  type="button"
                  @click="activeTab = 'rust'"
                  :class="activeTab === 'rust' ? 'bg-amber-600 text-white' : 'text-[#B8A99A] hover:text-white'"
                  class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  src/main.rs (Rust WS服务)
                </button>
                <button
                  type="button"
                  @click="activeTab = 'cargo'"
                  :class="activeTab === 'cargo' ? 'bg-amber-600 text-white' : 'text-[#B8A99A] hover:text-white'"
                  class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  Cargo.toml
                </button>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="copyCode"
                  class="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#2C2520] hover:bg-[#382F29] text-[#F5EFE6] transition-colors whitespace-nowrap shrink-0"
                >
                  {{ copied ? '已复制到剪贴板' : '复制当前源码' }}
                </button>
                <button
                  type="button"
                  @click="downloadCode"
                  class="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#2C2520] hover:bg-[#382F29] text-[#F5EFE6] transition-colors whitespace-nowrap shrink-0"
                >
                  下载文件
                </button>
              </div>
            </div>

            <pre class="p-3 text-[11px] font-mono text-[#E6DEC8] overflow-x-auto max-h-[300px] leading-relaxed"><code>{{ currentCode }}</code></pre>
          </div>

          <!-- Right: Quick Termux Command & Frame logs -->
          <div class="lg:col-span-4 rounded-xl bg-[#14110F] border border-[#2E2722] p-3 flex flex-col justify-between">
            <div>
              <h4 class="text-xs font-bold text-[#F5EFE6] mb-1">
                Termux 终端快速启动指令
              </h4>
              <p class="text-[10px] text-[#B8A99A] mb-2">
                在安卓 Termux 粘贴执行下列命令，即刻完成 Rust 编译并拉起服务：
              </p>
              <div class="p-2 rounded-lg bg-[#12100E] border border-[#2E2722] font-mono text-[10px] text-amber-300 mb-3 flex items-center justify-between gap-1">
                <span class="truncate">bash rust-termux-bundle/deploy_termux.sh</span>
                <button
                  type="button"
                  @click="copyCommand"
                  class="px-2 py-0.5 rounded bg-[#26211D] text-[#E6DEC8] hover:text-white text-[10px] whitespace-nowrap shrink-0"
                >
                  {{ cmdCopied ? '已复制' : '复制' }}
                </button>
              </div>

              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[11px] font-semibold text-[#E6DEC8]">
                  WS 报文监控 ({{ wsConnected ? '已连通 /ws' : '重连中' }})
                </span>
                <button
                  type="button"
                  @click="$emit('ping')"
                  class="px-2 py-0.5 text-[10px] font-medium rounded bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30 transition-colors whitespace-nowrap shrink-0"
                >
                  Ping 测速
                </button>
              </div>

              <div class="space-y-1 max-h-[160px] overflow-y-auto pr-1 font-mono text-[10px]">
                <div
                  v-for="pkt in packetLogs"
                  :key="pkt.id"
                  class="px-2 py-1 rounded bg-[#1C1815] border border-[#2A231E] flex items-center justify-between gap-1.5"
                >
                  <span :class="pkt.dir === 'OUT' ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'">
                    [{{ pkt.dir }}]
                  </span>
                  <span class="text-[#D6C7B2] truncate flex-1">{{ pkt.summary }}</span>
                  <span class="text-[#8C7A6B] tabular-nums shrink-0">{{ pkt.ts }}</span>
                </div>
              </div>
            </div>

            <div class="pt-2 border-t border-[#2E2722] flex items-center justify-between text-[10px] text-[#8C7A6B]">
              <span>服务端口：0.0.0.0:3000</span>
              <button
                type="button"
                @click="$emit('close')"
                class="px-3 py-1 text-xs rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors"
              >
                完成返回
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <section v-else id="termux-deploy" class="w-full py-10 border-t border-[#2E2722]">
    <div class="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div>
        <p class="text-xs text-amber-400/90 mb-1">
          03. Android Termux 原生编译与高性能守护
        </p>
        <h2 class="text-2xl sm:text-3xl font-bold text-[#F5EFE6] font-serif-title">
          Rust (Axum + Tokio) + Vue 3 + Canvas 源码与一键脚本
        </h2>
        <p class="text-sm text-[#B8A99A] mt-1 max-w-2xl">
          针对安卓 ARM64 处理器 (aarch64-linux-android) 调优：包含 termux-wake-lock 防息屏断联、Rust 无锁协程 WebSocket 广播与 High-DPI Canvas 60FPS 硬件加速。
        </p>
      </div>

      <div class="flex items-center gap-3 text-xs text-[#D6C7B2] tabular-nums">
        <span>架构：aarch64-linux-android</span>
        <span aria-hidden="true">·</span>
        <span>WS 延迟：{{ wsRtt }} ms</span>
        <span aria-hidden="true">·</span>
        <span>连接：{{ wsConnected ? '已连通' : '重连中' }}</span>
      </div>
    </div>

    <!-- 3 Tech Highlights -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      <div class="p-5 rounded-xl bg-[#1C1815] border border-[#2E2722]">
        <div class="text-amber-400 font-semibold text-sm mb-2">
          1. Rust Axum + DashMap 无锁房间网关
        </div>
        <p class="text-xs text-[#B8A99A] leading-relaxed">
          手机本地编译仅占约 14MB 内存，利用 Tokio 异步协程处理斗地主、跑得快、锄大地、十三水、麻将、中国象棋六大棋种广播。
        </p>
      </div>

      <div class="p-5 rounded-xl bg-[#1C1815] border border-[#2E2722]">
        <div class="text-amber-400 font-semibold text-sm mb-2">
          2. Termux 防睡眠与局域网对决
        </div>
        <p class="text-xs text-[#B8A99A] leading-relaxed">
          启动脚本配置 `termux-wake-lock` 锁定 CPU 调度，自动绑定手机 Wi-Fi IP，宿舍/聚会同热点下扫码即入同桌对战。
        </p>
      </div>

      <div class="p-5 rounded-xl bg-[#1C1815] border border-[#2E2722]">
        <div class="text-amber-400 font-semibold text-sm mb-2">
          3. Vue 3 + Canvas 触控滑动连选
        </div>
        <p class="text-xs text-[#B8A99A] leading-relaxed">
          基于 HTML5 Canvas 原生手势监听，支持横向滑牌连选顺子、麻将点选摸打与智能理牌提示，原生流畅无微卡顿。
        </p>
      </div>
    </div>

    <!-- Code Viewer & WS Frames Split -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      <div class="lg:col-span-8 rounded-xl bg-[#181412] border border-[#2E2722] flex flex-col overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#211C18] border-b border-[#2E2722]">
          <div class="flex items-center gap-1 p-1 bg-[#14110F] rounded-lg">
            <button
              type="button"
              @click="activeTab = 'deploy'"
              :class="activeTab === 'deploy' ? 'bg-amber-600 text-white' : 'text-[#B8A99A] hover:text-white'"
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              deploy_termux.sh (一键部署)
            </button>
            <button
              type="button"
              @click="activeTab = 'apk'"
              :class="activeTab === 'apk' ? 'bg-amber-600 text-white' : 'text-[#B8A99A] hover:text-white'"
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              build-apk.yml (APK自动打包)
            </button>
            <button
              type="button"
              @click="activeTab = 'rust'"
              :class="activeTab === 'rust' ? 'bg-amber-600 text-white' : 'text-[#B8A99A] hover:text-white'"
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              src/main.rs (Rust WS服务)
            </button>
            <button
              type="button"
              @click="activeTab = 'cargo'"
              :class="activeTab === 'cargo' ? 'bg-amber-600 text-white' : 'text-[#B8A99A] hover:text-white'"
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              Cargo.toml
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="copyCode"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#2C2520] hover:bg-[#382F29] text-[#F5EFE6] transition-colors whitespace-nowrap shrink-0"
            >
              {{ copied ? '已复制到剪贴板' : '复制当前源码' }}
            </button>
            <button
              type="button"
              @click="downloadCode"
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#2C2520] hover:bg-[#382F29] text-[#F5EFE6] transition-colors whitespace-nowrap shrink-0"
            >
              下载文件
            </button>
          </div>
        </div>

        <pre class="p-4 text-xs font-mono text-[#E6DEC8] overflow-x-auto max-h-[380px] leading-relaxed"><code>{{ currentCode }}</code></pre>
      </div>

      <!-- Right: Quick Termux Command & Frame logs -->
      <div class="lg:col-span-4 rounded-xl bg-[#1C1815] border border-[#2E2722] p-5 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-[#F5EFE6] mb-1">
            Termux 终端快速启动指令
          </h3>
          <p class="text-xs text-[#B8A99A] mb-3">
            在安卓 Termux 粘贴执行下列命令，即刻完成 Rust 编译并拉起 WebSocket 服务：
          </p>
          <div class="p-3 rounded-lg bg-[#12100E] border border-[#2E2722] font-mono text-xs text-amber-300 mb-4 flex items-center justify-between gap-2">
            <span class="truncate">bash rust-termux-bundle/deploy_termux.sh</span>
            <button
              type="button"
              @click="copyCommand"
              class="px-2 py-1 rounded bg-[#26211D] text-[#E6DEC8] hover:text-white text-[11px] whitespace-nowrap shrink-0"
            >
              {{ cmdCopied ? '已复制' : '复制' }}
            </button>
          </div>

          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-[#E6DEC8]">
              WebSocket 报文监控 ({{ wsConnected ? '已连通 /ws' : '重连中' }})
            </span>
            <button
              type="button"
              @click="$emit('ping')"
              class="px-2.5 py-1 text-xs font-medium rounded bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30 transition-colors whitespace-nowrap shrink-0"
            >
              发送 Ping 测速
            </button>
          </div>

          <div class="space-y-1.5 max-h-[210px] overflow-y-auto pr-1 font-mono text-[11px]">
            <div
              v-for="pkt in packetLogs"
              :key="pkt.id"
              class="px-2.5 py-1.5 rounded bg-[#14110F] border border-[#2A231E] flex items-center justify-between gap-2"
            >
              <span :class="pkt.dir === 'OUT' ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'">
                [{{ pkt.dir }}]
              </span>
              <span class="text-[#D6C7B2] truncate flex-1">{{ pkt.summary }}</span>
              <span class="text-[#8C7A6B] tabular-nums shrink-0">{{ pkt.ts }}</span>
            </div>
            <div v-if="packetLogs.length === 0" class="text-[#8C7A6B] py-6 text-center">
              等待 WebSocket 对局实时报文...
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-[#2E2722] flex items-center justify-between text-xs text-[#B8A99A] tabular-nums">
          <span>唤醒锁：termux-wake-lock 激活</span>
          <span>服务端口：0.0.0.0:3000</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  wsConnected: boolean;
  wsRtt: number;
  packetLogs: { id: string; dir: 'IN' | 'OUT'; summary: string; ts: string }[];
  isModal?: boolean;
}>();

defineEmits<{
  (e: 'ping'): void;
  (e: 'close'): void;
}>();

const activeTab = ref<'deploy' | 'apk' | 'rust' | 'cargo'>('deploy');
const copied = ref(false);
const cmdCopied = ref(false);

const deployScript = `#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# RustChess Terminal - 棋牌大厅 Android Termux 一键编译与常驻守护脚本
# 架构: Rust (Axum + Tokio Server-Authoritative WebSocket) + Vue 3 + HTML5 Canvas
# 游戏: 经典斗地主、经典烟三、四人锄大地、水镜十三水、经典国标麻将
# ==============================================================================

set -e

echo "[1/6] 正在配置 Termux 环境并安装 Rust 构建工具链..."
pkg update -y && pkg upgrade -y
pkg install -y rust clang make pkg-config openssl nodejs-lts git tmux termux-api

echo "[2/6] 申请 Android 唤醒锁 (阻止息屏时 WebSocket 掉线与降频)..."
if command -v termux-wake-lock >/dev/null 2>&1; then
  termux-wake-lock
  echo "  -> 已开启 termux-wake-lock 唤醒守护"
fi

# 提示用户关闭系统级 Doze 电源限制
echo "  -> 提示: 请在 Android 系统设置中将 Termux 应用电池策略设置为【无限制】避免锁屏被杀"

echo "[3/6] 配置 Cargo 针对 Android ARM64 极速编译选项..."
mkdir -p ~/.cargo
cat << 'EOF' > ~/.cargo/config.toml
[build]
jobs = 4

[target.aarch64-linux-android]
rustflags = ["-C", "target-cpu=native"]
EOF

echo "[4/6] 编译前端 Vue 3 + Canvas 产物..."
npm install --no-audit --no-fund
npm run build

echo "[5/6] 编译 Rust Axum WebSocket 服务端 (Release 权威对战引擎模式)..."
cd rust-termux-bundle
cargo build --release
cp -r ../dist ./dist
mkdir -p data
cp -n ../data/game_database.json ./data/game_database.json 2>/dev/null || true

echo "[6/6] 检查端口 3000、获取本机局域网 IP 并启动服务..."
if command -v fuser >/dev/null 2>&1; then
  fuser -k 3000/tcp 2>/dev/null || true
elif command -v lsof >/dev/null 2>&1; then
  OLD_PID=$(lsof -t -i:3000 2>/dev/null || true)
  if [ -n "$OLD_PID" ]; then
    kill -9 $OLD_PID 2>/dev/null || true
  fi
fi

LAN_IP=$(ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\\.){3}[0-9]*' | grep -Eo '([0-9]*\\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n 1)
echo "=================================================================="
echo "  棋牌大厅在 Android Termux 启动成功！(服务端权威状态机已载入)"
echo "  本机访问地址: http://127.0.0.1:3000"
echo "  局域网对局地址: http://\${LAN_IP:-192.168.1.x}:3000"
echo "  WebSocket 端点: ws://\${LAN_IP:-127.0.0.1}:3000/ws"
echo "  后台守护提示: 如需锁屏长效对战，请使用 tmux new -s chess 并在其中运行"
echo "=================================================================="

./target/release/mingju-termux-server
`;

const rustSource = `use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    http::{header, HeaderValue},
    response::IntoResponse,
    routing::get,
    Router,
};
use dashmap::DashMap;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::{net::SocketAddr, sync::Arc, time::Instant};
use tokio::sync::broadcast;
use tower_http::{cors::CorsLayer, services::ServeDir, set_header::SetResponseHeaderLayer};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthoritativeBoardState {
    pub sequence: u64,
    pub turn_seat: usize,
    pub phase: String,
    pub landlord_seat: Option<usize>,
    pub multiplier: u32,
    pub pass_count: usize,
    pub last_action: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoomState {
    pub id: String,
    pub title: String,
    pub game_type: String,
    pub status: String,
    pub turn_seat: usize,
    pub move_count: usize,
    pub board_state: Option<AuthoritativeBoardState>,
}

pub struct AppState {
    pub rooms: DashMap<String, RoomState>,
    pub tx: broadcast::Sender<String>,
    pub boot_time: Instant,
}

#[tokio::main(flavor = "multi_thread", worker_threads = 4)]
async fn main() {
    tracing_subscriber::fmt::init();
    let (tx, _rx) = broadcast::channel(1024);
    let state = Arc::new(AppState {
        rooms: DashMap::new(),
        tx,
        boot_time: Instant::now(),
    });

    let static_service = ServeDir::new("dist")
        .append_index_html_on_directories(true);

    let cache_layer = SetResponseHeaderLayer::overriding(
        header::CACHE_CONTROL,
        HeaderValue::from_static("public, max-age=604800, immutable"),
    );

    let app = Router::new()
        .route("/ws", get(ws_handler))
        .nest_service("/", static_service)
        .layer(cache_layer)
        .layer(CorsLayer::permissive())
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("RustChess Authoritative Server running on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
`;

const cargoToml = `[package]
name = "mingju-termux-server"
version = "1.0.0"
edition = "2021"

[dependencies]
axum = { version = "0.7", features = ["ws", "macros"] }
tokio = { version = "1.39", features = ["rt-multi-thread", "macros", "sync", "time", "net", "fs"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tower-http = { version = "0.5", features = ["fs", "cors", "set-header"] }
futures-util = { version = "0.3", default-features = false, features = ["sink", "std"] }
dashmap = "6.0"
tracing = "0.1"
tracing-subscriber = "0.3"

[profile.release]
opt-level = 3
lto = "thin"
codegen-units = 1
panic = "abort"
strip = true
`;

const apkWorkflow = `name: Build and Package Android APK

on:
  push:
    branches:
      - main
      - master
    paths-ignore:
      - '**.md'
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: apk-build-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-apk:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Setup Java JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'
          cache: 'gradle'

      - name: Accept Android SDK Licenses & Install Android 36 SDK
        run: |
          echo "Using Android SDK at: $ANDROID_HOME"
          yes 2>/dev/null | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses 2>/dev/null || true
          "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" "platforms;android-36" 2>/dev/null || true

      - name: Install NPM Dependencies
        run: npm install --no-audit --no-fund

      - name: Build Web Application
        run: npm run build

      - name: Ensure Android Native Project and Gradlew Exist
        run: |
          mkdir -p android
          echo "sdk.dir=$ANDROID_HOME" > android/local.properties
          
          if [ ! -f "android/gradlew" ]; then
            echo "android/gradlew not found in repository! Generating android platform via Capacitor..."
            rm -rf android
            npx cap add android
            mkdir -p android
            echo "sdk.dir=$ANDROID_HOME" > android/local.properties
          fi

          # Ensure SDK 36 is configured as required by Capacitor 8 (androidx.activity 1.11.0, androidx.core 1.17.0)
          sed -i 's/compileSdkVersion = 35/compileSdkVersion = 36/g' android/variables.gradle 2>/dev/null || true
          sed -i 's/targetSdkVersion = 35/targetSdkVersion = 36/g' android/variables.gradle 2>/dev/null || true

          # Ensure release APK has debug signing so it can be installed on Android without manual keystore
          if ! grep -q "signingConfig signingConfigs.debug" android/app/build.gradle 2>/dev/null; then
            sed -i '/release {/a \            signingConfig signingConfigs.debug' android/app/build.gradle 2>/dev/null || true
          fi

          # Ensure Java 21 compatibility required by Capacitor 8
          if ! grep -q "JavaVersion.VERSION_21" android/app/build.gradle 2>/dev/null; then
            sed -i '/android {/a \    compileOptions {\n        sourceCompatibility JavaVersion.VERSION_21\n        targetCompatibility JavaVersion.VERSION_21\n    }' android/app/build.gradle 2>/dev/null || true
          fi

      - name: Sync Capacitor Android Project
        run: npx cap sync android

      - name: Make Gradlew Executable
        run: chmod +x android/gradlew || true

      - name: Build Android APK (Release & Debug)
        run: |
          cd android
          ./gradlew assembleRelease assembleDebug --no-daemon --stacktrace

      - name: Prepare APK Output Directory
        id: vars
        run: |
          mkdir -p release-apks
          if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
            cp android/app/build/outputs/apk/release/app-release.apk release-apks/chess-game-release.apk
          elif [ -f "android/app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
            cp android/app/build/outputs/apk/release/app-release-unsigned.apk release-apks/chess-game-release.apk
          fi
          if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
            cp android/app/build/outputs/apk/debug/app-debug.apk release-apks/chess-game-debug.apk
          fi
          if [ ! -f "release-apks/chess-game-release.apk" ] && [ -f "release-apks/chess-game-debug.apk" ]; then
            cp release-apks/chess-game-debug.apk release-apks/chess-game-release.apk
          fi
          echo "build_time=\$(date -u '+%Y-%m-%d %H:%M:%S UTC')" >> \$GITHUB_OUTPUT
          echo "short_sha=\$(git rev-parse --short HEAD)" >> \$GITHUB_OUTPUT

      - name: Upload APKs to GitHub Actions Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: chess-game-apk
          path: release-apks/*.apk
          overwrite: true
          retention-days: 30

      - name: Update Latest Git Tag
        continue-on-error: true
        run: |
          git tag -f latest-apk
          git push -f origin latest-apk || true

      - name: Publish and Overwrite Latest APK in GitHub Releases
        uses: softprops/action-gh-release@v2
        continue-on-error: true
        with:
          tag_name: latest-apk
          target_commitish: \${{ github.sha }}
          name: "五大经典国粹棋牌 - 最新打包 APK (Auto Build)"
          body: |
            🎮 **五大经典国粹棋牌 Android APK 最新安装包**

            - 🚀 **自动覆盖机制**：仓库代码有任何更新并推送，本 Release 中的旧 APK 会被自动重新构建并覆盖替换为最新版本。
            - 🕒 **最新构建时间**：\${{ steps.vars.outputs.build_time }}
            - 🔖 **Git 提交版本**：\`\${{ steps.vars.outputs.short_sha }}\`

            ---

            ### 🇨🇳 国内极速加速下载通道 (免代理·高速直链，推荐国内网络使用)
            - 🚀 **[极速线路 1 (GHProxy 专线)]**：
              [点击直接高速下载 chess-game-release.apk](https://ghproxy.net/https://github.com/\${{ github.repository }}/releases/download/latest-apk/chess-game-release.apk)
            - ⚡️ **[高速线路 2 (GitMirror 专线)]**：
              [点击直接高速下载 chess-game-release.apk](https://hub.gitmirror.com/https://github.com/\${{ github.repository }}/releases/download/latest-apk/chess-game-release.apk)
            - 🌐 **[镜像线路 3 (KKGitHub 节点)]**：
              [点击前往 KKGitHub 镜像下载](https://kkgithub.com/\${{ github.repository }}/releases/download/latest-apk/chess-game-release.apk)
            - 📦 **[仓库 Raw 文件加速直链]**：
              [点击高速下载仓库 app-latest.apk](https://ghproxy.net/https://raw.githubusercontent.com/\${{ github.repository }}/main/apk/app-latest.apk)

            ---

            ### 🌍 GitHub 官方原始下载通道
            - ⭐️ **[推荐] 正式安装版 (Release APK)**：
              [点击下载 chess-game-release.apk](https://github.com/\${{ github.repository }}/releases/download/latest-apk/chess-game-release.apk)
            - 🛠️ **调试测试版 (Debug APK)**：
              [点击下载 chess-game-debug.apk](https://github.com/\${{ github.repository }}/releases/download/latest-apk/chess-game-debug.apk)

            > 💡 **安卓安装说明**：手机浏览器下载完成后点击安装，如遇系统提示“允许来自此来源的应用”或“允许未知应用安装”，勾选允许即可安全畅玩！
          draft: false
          prerelease: false
          make_latest: true
          files: |
            release-apks/chess-game-release.apk
            release-apks/chess-game-debug.apk

      - name: Auto-Commit & Overwrite APK in Repository
        continue-on-error: true
        run: |
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          mkdir -p apk
          cp release-apks/chess-game-release.apk apk/app-latest.apk
          git add -f apk/app-latest.apk
          if git diff --staged --quiet; then
            echo "No change in binary apk file."
          else
            git commit -m "chore(apk): auto-update app-latest.apk [skip ci]"
            git push origin HEAD:\${{ github.ref_name }} || echo "Push skipped or branch protected"
          fi
`;

const currentCode = computed(() => {
  if (activeTab.value === 'deploy') return deployScript;
  if (activeTab.value === 'apk') return apkWorkflow;
  if (activeTab.value === 'rust') return rustSource;
  return cargoToml;
});

function copyCode() {
  navigator.clipboard?.writeText(currentCode.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function copyCommand() {
  navigator.clipboard?.writeText('bash rust-termux-bundle/deploy_termux.sh');
  cmdCopied.value = true;
  setTimeout(() => (cmdCopied.value = false), 2000);
}

function downloadCode() {
  let filename = 'Cargo.toml';
  if (activeTab.value === 'deploy') filename = 'deploy_termux.sh';
  else if (activeTab.value === 'apk') filename = 'build-apk.yml';
  else if (activeTab.value === 'rust') filename = 'main.rs';
  const blob = new Blob([currentCode.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
</script>
