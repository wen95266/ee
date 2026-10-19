export interface GameStat {
  played: number;
  won: number;
  highestScore: number;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  phone?: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  bannedReason?: string;
  coins: number;
  rating: number;
  level: number;
  lastCheckinDate: string;
  isLoggedIn: boolean;
  stats: {
    doudizhu: GameStat;
    paodekuai?: GameStat;
    yansan?: GameStat;
    chudadi: GameStat;
    shisanshui: GameStat;
    mahjong: GameStat;
    [key: string]: GameStat | undefined;
  };
  updatedAt?: number;
}

export interface MatchRecord {
  id: string;
  gameType: string;
  gameName: string;
  result: 'win' | 'lose' | 'draw';
  coinsDelta: number;
  ratingDelta: number;
  details: string;
  timestamp: string;
  updatedAt?: number;
}

export interface PointsTransaction {
  id: string;
  type: 'checkin' | 'game_win' | 'game_loss' | 'relief' | 'exchange' | 'achievement' | 'reward' | 'admin_grant';
  title: string;
  amount: number;
  balanceAfter: number;
  timestamp: string;
}

export interface AccountData {
  username: string;
  password: string;
  profile: UserProfile;
  updatedAt?: number;
}

export async function hashPassword(plain: string): Promise<string> {
  if (!plain) return '';
  if (plain.startsWith('sha256:')) return plain;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`rustchess_salt_2026_${plain}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `sha256:${hex}`;
  } catch {
    return plain;
  }
}

export async function verifyPassword(input: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  if (!stored.startsWith('sha256:')) {
    return input === stored;
  }
  const hashedInput = await hashPassword(input);
  return hashedInput === stored;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'USER-' + Math.floor(1000 + Math.random() * 9000),
  name: '茗局雅客',
  username: 'mingju_guest',
  avatar: '🀄',
  phone: '13800138000',
  isAdmin: true,
  coins: 8888,
  rating: 1800,
  level: 3,
  lastCheckinDate: '',
  isLoggedIn: true,
  stats: {
    doudizhu: { played: 28, won: 19, highestScore: 1200 },
    paodekuai: { played: 16, won: 11, highestScore: 800 },
    yansan: { played: 16, won: 11, highestScore: 800 },
    chudadi: { played: 14, won: 9, highestScore: 960 },
    shisanshui: { played: 12, won: 8, highestScore: 24 },
    mahjong: { played: 35, won: 22, highestScore: 88 },
  },
};

const STORAGE_KEY_PROFILE = 'rustchess_user_profile_v3';
const STORAGE_KEY_RECORDS = 'rustchess_match_records_v3';
const STORAGE_KEY_POINTS_TX = 'rustchess_points_tx_v3';
const STORAGE_KEY_ACCOUNTS = 'rustchess_accounts_v3';

export function loadLocalProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      const profile = { ...DEFAULT_PROFILE, ...parsed };
      profile.coins = Math.max(0, Math.floor(Number(profile.coins) || 0));
      if (!profile.stats.yansan) {
        profile.stats.yansan = { played: 16, won: 11, highestScore: 800 };
      }
      return profile;
    }
  } catch {}
  return { ...DEFAULT_PROFILE };
}

export function saveLocalProfile(profile: UserProfile): void {
  try {
    profile.coins = Math.max(0, Math.floor(Number(profile.coins) || 0));
    profile.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch {}
}

export function loadLocalRecords(): MatchRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [
    {
      id: 'REC-101',
      gameType: 'doudizhu',
      gameName: '经典斗地主',
      result: 'win',
      coinsDelta: 600,
      ratingDelta: 25,
      details: '地主连下春天，倍数 ×6',
      timestamp: '10:05',
    },
    {
      id: 'REC-102',
      gameType: 'yansan',
      gameName: '经典烟三',
      result: 'win',
      coinsDelta: 450,
      ratingDelta: 20,
      details: '方块三连环开路，率先出清',
      timestamp: '10:08',
    },
    {
      id: 'REC-103',
      gameType: 'mahjong',
      gameName: '经典国标麻将',
      result: 'win',
      coinsDelta: 880,
      ratingDelta: 40,
      details: '自摸清一色满贯',
      timestamp: '10:12',
    },
    {
      id: 'REC-104',
      gameType: 'shisanshui',
      gameName: '水镜十三水',
      result: 'win',
      coinsDelta: 600,
      ratingDelta: 30,
      details: '头道三条尾道葫芦全垒打',
      timestamp: '10:18',
    },
  ];
}

export function saveLocalRecords(records: MatchRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  } catch {}
}

export function loadPointsTransactions(): PointsTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POINTS_TX);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [
    {
      id: 'tx_init',
      type: 'checkin',
      title: '新手大厅开运礼金',
      amount: 5000,
      balanceAfter: 8888,
      timestamp: '10:00',
    },
    {
      id: 'tx_1',
      type: 'game_win',
      title: '斗地主春天获胜结算',
      amount: 600,
      balanceAfter: 9488,
      timestamp: '10:05',
    },
    {
      id: 'tx_2',
      type: 'game_win',
      title: '十三水全垒打得分',
      amount: 500,
      balanceAfter: 9988,
      timestamp: '10:08',
    },
  ];
}

export function recordPointsTx(
  type: PointsTransaction['type'],
  title: string,
  amount: number,
  balanceAfter: number
): void {
  try {
    const list = loadPointsTransactions();
    const newTx: PointsTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      title,
      amount,
      balanceAfter,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    list.unshift(newTx);
    if (list.length > 50) list.pop();
    localStorage.setItem(STORAGE_KEY_POINTS_TX, JSON.stringify(list));
  } catch {}
}

// User accounts management (Local Accounts & Persistent Auth)
export function getRegisteredAccounts(): AccountData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      username: 'guest',
      password: '123',
      profile: {
        ...DEFAULT_PROFILE,
        name: '江南客官',
        username: 'guest',
        coins: 6666,
        isLoggedIn: true,
      },
    },
  ];
}

export function saveRegisteredAccounts(accounts: AccountData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch {}
}

// Sync with server API
export async function syncWithServer(profile: UserProfile, records: MatchRecord[]) {
  try {
    await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, records }),
    });
  } catch {}
}

// Backup & restore utilities (安全数据备份与恢复)
export function exportGameBackup(): string {
  try {
    const profile = loadLocalProfile();
    const records = loadLocalRecords();
    const pointsTx = loadPointsTransactions();
    const backupObj = {
      version: 'v3',
      exportDate: new Date().toISOString(),
      profile,
      records,
      pointsTx,
    };
    return JSON.stringify(backupObj, null, 2);
  } catch {
    return '';
  }
}

export function importGameBackup(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !parsed.profile) return false;
    if (parsed.profile) saveLocalProfile(parsed.profile);
    if (Array.isArray(parsed.records)) saveLocalRecords(parsed.records);
    if (Array.isArray(parsed.pointsTx)) {
      localStorage.setItem(STORAGE_KEY_POINTS_TX, JSON.stringify(parsed.pointsTx));
    }
    return true;
  } catch {
    return false;
  }
}
