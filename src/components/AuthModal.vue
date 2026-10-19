<template>
  <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
    <div class="w-[94vw] max-w-md max-h-[92vh] flex flex-col rounded-3xl bg-[#1C1815] border border-amber-500/30 p-4 sm:p-6 shadow-2xl overflow-hidden relative text-[#F5EFE6]">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-[#2E2722] shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🏮</span>
          <div>
            <h3 class="text-base font-bold text-[#F5EFE6] font-serif-title">
              {{ isLoggedIn ? '用户账号管理' : (authTab === 'login' ? '牌友登录' : '新秀注册') }}
            </h3>
            <p class="text-[11px] text-[#A89887]">
              {{ isLoggedIn ? '管理您的对局身份与云端战绩存档' : '登录或注册即可保存专属天梯积分与对弈档案' }}
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

      <!-- Scrollable Container -->
      <div class="flex-1 overflow-y-auto pr-1 pt-2">
        <!-- Logged In Profile Card Mode -->
        <div v-if="isLoggedIn" class="py-2 space-y-3.5">
        <div class="p-4 rounded-xl bg-[#14110F] border border-[#2A231E] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 rounded-xl bg-[#26201B] border border-[#3A3029]">
              {{ currentProfile.avatar }}
            </span>
            <div>
              <div class="text-sm font-bold text-[#F5EFE6] flex items-center gap-2">
                {{ currentProfile.name }}
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-600/30 text-amber-300 border border-amber-500/40">
                  LV.{{ currentProfile.level }}
                </span>
              </div>
              <div class="text-xs text-[#8C7A6B] font-mono mt-0.5">
                账号: {{ currentProfile.username }} · UID: {{ currentProfile.id }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-amber-400 font-mono font-bold">🪙 {{ currentProfile.coins }} 贯</div>
            <div class="text-[11px] text-[#8C7A6B] mt-0.5">积分: {{ currentProfile.rating }}</div>
          </div>
        </div>

        <!-- Edit Nickname & Avatar -->
        <div class="space-y-3">
          <div>
            <label class="block text-xs text-[#B8A99A] mb-1">修改堂号名讳</label>
            <input
              v-model="editName"
              type="text"
              class="w-full px-3 py-2 text-xs rounded-lg bg-[#12100E] border border-[#2E2722] text-[#F5EFE6] focus:outline-none focus:border-amber-500"
              placeholder="请输入新的名号..."
            />
          </div>

          <div>
            <label class="block text-xs text-[#B8A99A] mb-1">更换牌桌头像印信</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="av in AVATAR_OPTIONS"
                :key="av"
                type="button"
                @click="editAvatar = av"
                :class="editAvatar === av ? 'border-amber-500 bg-amber-600/30 text-amber-200' : 'border-[#2E2722] bg-[#14110F] text-white'"
                class="w-9 h-9 rounded-lg border text-lg flex items-center justify-center transition-all hover:scale-105"
              >
                {{ av }}
              </button>
            </div>
          </div>
        </div>

        <div class="pt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            @click="handleLogout"
            class="px-4 py-2 text-xs font-medium rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-200 border border-red-800/50 transition-colors"
          >
            退出当前登录
          </button>
          <button
            type="button"
            @click="handleSaveProfile"
            class="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
          >
            保存资料
          </button>
        </div>
      </div>

      <!-- Auth Form (Not logged in) -->
      <div v-else class="py-4">
        <!-- Tab Switcher -->
        <div class="flex items-center gap-1 p-1 bg-[#14110F] rounded-lg mb-4">
          <button
            type="button"
            @click="authTab = 'login'"
            :class="authTab === 'login' ? 'bg-amber-600 text-white font-semibold' : 'text-[#8C7A6B] hover:text-white'"
            class="flex-1 py-1.5 text-xs rounded transition-colors text-center"
          >
            登录账号
          </button>
          <button
            type="button"
            @click="authTab = 'register'"
            :class="authTab === 'register' ? 'bg-amber-600 text-white font-semibold' : 'text-[#8C7A6B] hover:text-white'"
            class="flex-1 py-1.5 text-xs rounded transition-colors text-center"
          >
            快速注册
          </button>
        </div>

        <form @submit.prevent="authTab === 'login' ? submitLogin() : submitRegister()" class="space-y-3.5">
          <div>
            <label class="block text-xs text-[#B8A99A] mb-1">账号用户名</label>
            <input
              v-model="formUsername"
              type="text"
              required
              class="w-full px-3 py-2 text-xs rounded-lg bg-[#12100E] border border-[#2E2722] text-[#F5EFE6] focus:outline-none focus:border-amber-500 font-mono"
              placeholder="请输入英文字母或数字 (如 player88)"
            />
          </div>

          <div>
            <label class="block text-xs text-[#B8A99A] mb-1">登录密匙</label>
            <input
              v-model="formPassword"
              type="password"
              required
              class="w-full px-3 py-2 text-xs rounded-lg bg-[#12100E] border border-[#2E2722] text-[#F5EFE6] focus:outline-none focus:border-amber-500"
              placeholder="请输入密码..."
            />
          </div>

          <div v-if="authTab === 'register'">
            <label class="block text-xs text-[#B8A99A] mb-1">授权手机号 (Telegram Bot授权)</label>
            <input
              v-model="formPhone"
              type="tel"
              required
              class="w-full px-3 py-2 text-xs rounded-lg bg-[#12100E] border border-[#2E2722] text-[#F5EFE6] focus:outline-none focus:border-amber-500 font-mono"
              placeholder="请输入手机号..."
            />
          </div>

          <div v-if="authTab === 'register'">
            <label class="block text-xs text-[#B8A99A] mb-1">牌桌名号 (游戏内昵称)</label>
            <input
              v-model="formNickname"
              type="text"
              required
              class="w-full px-3 py-2 text-xs rounded-lg bg-[#12100E] border border-[#2E2722] text-[#F5EFE6] focus:outline-none focus:border-amber-500"
              placeholder="例如：孤舟蓑笠、香江雀仙"
            />
          </div>

          <div v-if="authTab === 'register'">
            <label class="block text-xs text-[#B8A99A] mb-1">个性头像印信</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="av in AVATAR_OPTIONS"
                :key="av"
                type="button"
                @click="formAvatar = av"
                :class="formAvatar === av ? 'border-amber-500 bg-amber-600/30 text-amber-200 ring-1 ring-amber-500' : 'border-[#2E2722] bg-[#14110F] text-white'"
                class="w-8 h-8 rounded-lg border text-base flex items-center justify-center transition-all"
              >
                {{ av }}
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="p-2 rounded bg-red-950/80 border border-red-700/60 text-[11px] text-red-200">
            {{ errorMessage }}
          </div>

          <div class="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              @click="quickDemoLogin"
              class="px-3 py-2 text-xs font-medium rounded-lg bg-[#26201B] hover:bg-[#322B26] text-amber-300 border border-[#3A3029] transition-colors"
            >
              一键免密试玩
            </button>
            <button
              type="submit"
              class="flex-1 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
            >
              {{ authTab === 'login' ? '立即登录' : '立即注册 (+8888开局筹码)' }}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  UserProfile,
  AccountData,
  getRegisteredAccounts,
  saveRegisteredAccounts,
  saveLocalProfile,
  recordPointsTx,
  hashPassword,
  verifyPassword,
} from '../utils/storage';
import { soundFX } from '../utils/sound';

const props = defineProps<{
  profile: UserProfile;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:profile', p: UserProfile): void;
}>();

const authTab = ref<'login' | 'register'>('login');
const isLoggedIn = ref(props.profile.isLoggedIn);
const currentProfile = reactive<UserProfile>({ ...props.profile });

const editName = ref(currentProfile.name);
const editAvatar = ref(currentProfile.avatar);

const formUsername = ref('');
const formPassword = ref('');
const formPhone = ref('');
const formNickname = ref('');
const formAvatar = ref('🀄');
const errorMessage = ref('');

const AVATAR_OPTIONS = ['🀄', '♟️', '🃏', '👑', '🐉', '🍵', '⚡', '🪓', '🐯', '🦅', '🪙', '🏮'];

async function submitLogin() {
  errorMessage.value = '';
  const accounts = getRegisteredAccounts();
  const uname = formUsername.value.trim().toLowerCase();
  const acc = accounts.find((a) => a.username.toLowerCase() === uname);

  if (acc) {
    const isValid = await verifyPassword(formPassword.value, acc.password);
    if (isValid) {
      // Smoothly migrate legacy plaintext passwords to secure sha256
      if (!acc.password.startsWith('sha256:')) {
        acc.password = await hashPassword(formPassword.value);
        saveRegisteredAccounts(accounts);
      }

      const updatedProfile: UserProfile = {
        ...acc.profile,
        isLoggedIn: true,
      };

      Object.assign(currentProfile, updatedProfile);
      isLoggedIn.value = true;
      saveLocalProfile(updatedProfile);
      emit('update:profile', updatedProfile);
      soundFX.playVictory();
      emit('close');
      return;
    }
  }

  // Attempt server login if local account not found or password check failed locally
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formUsername.value.trim(),
        password: formPassword.value,
      }),
    });
    const data = await res.json();
    if (data.success && data.profile) {
      const serverProfile: UserProfile = {
        ...data.profile,
        isLoggedIn: true,
      };
      const hashedPassword = await hashPassword(formPassword.value);
      const exIdx = accounts.findIndex((a) => a.username.toLowerCase() === uname);
      const accountEntry: AccountData = {
        username: formUsername.value.trim(),
        password: hashedPassword,
        profile: serverProfile,
        updatedAt: Date.now(),
      };
      if (exIdx >= 0) {
        accounts[exIdx] = accountEntry;
      } else {
        accounts.push(accountEntry);
      }
      saveRegisteredAccounts(accounts);
      saveLocalProfile(serverProfile);
      Object.assign(currentProfile, serverProfile);
      isLoggedIn.value = true;
      emit('update:profile', serverProfile);
      soundFX.playVictory();
      emit('close');
      return;
    } else {
      errorMessage.value = data.error || '用户名或密码不匹配，请核对后再试，或直接点击“一键免密试玩”';
      soundFX.playTap();
      return;
    }
  } catch {
    errorMessage.value = '用户名或密码不匹配，请核对后再试，或直接点击“一键免密试玩”';
    soundFX.playTap();
  }
}

async function submitRegister() {
  errorMessage.value = '';
  const uname = formUsername.value.trim();
  if (uname.length < 3) {
    errorMessage.value = '用户名长度请不少于 3 个字符';
    return;
  }
  if (formPassword.value.length !== 6) {
    errorMessage.value = '密码必须为六位数';
    return;
  }
  if (!formPhone.value.trim()) {
    errorMessage.value = '请输入授权手机号';
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: uname,
        password: formPassword.value,
        nickname: formNickname.value.trim(),
        phone: formPhone.value.trim(),
        avatar: formAvatar.value,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      errorMessage.value = data.error || '该手机号无效';
      return;
    }
    const newProfile = data.profile;
    saveLocalProfile(newProfile);

    // Save to local registered accounts store for offline/persistent login
    const hashedPassword = await hashPassword(formPassword.value);
    const accounts = getRegisteredAccounts();
    const existingIdx = accounts.findIndex((a) => a.username.toLowerCase() === uname.toLowerCase());
    const accountEntry: AccountData = {
      username: uname,
      password: hashedPassword,
      profile: { ...newProfile, isLoggedIn: true },
      updatedAt: Date.now(),
    };
    if (existingIdx >= 0) {
      accounts[existingIdx] = accountEntry;
    } else {
      accounts.push(accountEntry);
    }
    saveRegisteredAccounts(accounts);

    recordPointsTx('reward', '新秀注册迎新礼金', 8888, 8888);
    Object.assign(currentProfile, newProfile);
    isLoggedIn.value = true;
    emit('update:profile', newProfile);
    soundFX.playVictory();
    emit('close');
  } catch (e) {
    errorMessage.value = '该手机号无效';
  }
}

function quickDemoLogin() {
  const demoProfile: UserProfile = {
    ...currentProfile,
    username: 'guest_player',
    name: '逍遥茶客',
    avatar: '🍵',
    isLoggedIn: true,
    coins: Math.max(5000, currentProfile.coins),
  };
  Object.assign(currentProfile, demoProfile);
  isLoggedIn.value = true;
  saveLocalProfile(demoProfile);
  emit('update:profile', demoProfile);
  soundFX.playTap();
  emit('close');
}

function handleSaveProfile() {
  currentProfile.name = editName.value.trim() || currentProfile.name;
  currentProfile.avatar = editAvatar.value;
  saveLocalProfile(currentProfile);

  // Update in accounts store if present
  const accounts = getRegisteredAccounts();
  const acc = accounts.find((a) => a.username === currentProfile.username);
  if (acc) {
    acc.profile = { ...currentProfile };
    saveRegisteredAccounts(accounts);
  }

  emit('update:profile', { ...currentProfile });
  soundFX.playTap();
  emit('close');
}

function handleLogout() {
  const loggedOut: UserProfile = {
    ...currentProfile,
    isLoggedIn: false,
    username: 'guest',
    name: '茗局雅客',
    avatar: '🀄',
  };
  Object.assign(currentProfile, loggedOut);
  isLoggedIn.value = false;
  saveLocalProfile(loggedOut);
  emit('update:profile', loggedOut);
  soundFX.playTap();
  emit('close');
}
</script>
