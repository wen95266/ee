export interface TableTheme {
  id: string;
  name: string;
  gameType?: string;
  feltColor: string;
  edgeColor: string;
  borderColor: string;
  accentColor: string;
  textColor: string;
  highlightColor?: string;
}

// 5 Dedicated Game Theme Colors matching the 3D Lobby Cards 1:1 - Upgraded to luminous, bright salon palettes
export const GAME_THEMES_MAP: Record<string, TableTheme> = {
  doudizhu: {
    id: 'theme-doudizhu',
    name: '琥珀赤金 · 经典斗地主',
    gameType: 'doudizhu',
    highlightColor: '#D97706',
    feltColor: '#92400E',
    edgeColor: '#592806',
    borderColor: '#F59E0B',
    accentColor: '#FCD34D',
    textColor: '#FFFBEB',
  },
  paodekuai: {
    id: 'theme-paodekuai',
    name: '烈焰绯红 · 16张跑得快',
    gameType: 'paodekuai',
    highlightColor: '#EF4444',
    feltColor: '#B91C1C',
    edgeColor: '#7F1D1D',
    borderColor: '#F87171',
    accentColor: '#FECDD3',
    textColor: '#FFF1F2',
  },
  yansan: {
    id: 'theme-yansan',
    name: '烈焰绯红 · 经典烟三',
    gameType: 'yansan',
    highlightColor: '#EF4444',
    feltColor: '#B91C1C',
    edgeColor: '#7F1D1D',
    borderColor: '#F87171',
    accentColor: '#FECDD3',
    textColor: '#FFF1F2',
  },
  chudadi: {
    id: 'theme-chudadi',
    name: '翡翠苍翠 · 四人锄大地',
    gameType: 'chudadi',
    highlightColor: '#10B981',
    feltColor: '#047857',
    edgeColor: '#065F46',
    borderColor: '#34D399',
    accentColor: '#A7F3D0',
    textColor: '#ECFDF5',
  },
  shisanshui: {
    id: 'theme-shisanshui',
    name: '深海幻蓝 · 水镜十三水',
    gameType: 'shisanshui',
    highlightColor: '#3B82F6',
    feltColor: '#1D4ED8',
    edgeColor: '#1E3A8A',
    borderColor: '#60A5FA',
    accentColor: '#BAE6FD',
    textColor: '#EFF6FF',
  },
  mahjong: {
    id: 'theme-mahjong',
    name: '幻彩紫晶 · 国标麻将',
    gameType: 'mahjong',
    highlightColor: '#A855F7',
    feltColor: '#7E22CE',
    edgeColor: '#581C87',
    borderColor: '#C084FC',
    accentColor: '#E9D5FF',
    textColor: '#FAF5FF',
  },
};

export const TABLE_THEMES: TableTheme[] = [
  GAME_THEMES_MAP.doudizhu,
  GAME_THEMES_MAP.yansan,
  GAME_THEMES_MAP.chudadi,
  GAME_THEMES_MAP.shisanshui,
  GAME_THEMES_MAP.mahjong,
];

export function getGameTheme(gameType: string): TableTheme {
  return GAME_THEMES_MAP[gameType] || GAME_THEMES_MAP.doudizhu;
}

export function getSavedTheme(): TableTheme {
  try {
    const id = localStorage.getItem('rustchess_table_theme');
    if (id) {
      const found = TABLE_THEMES.find((t) => t.id === id);
      if (found) return found;
    }
  } catch {}
  return TABLE_THEMES[0];
}

export function saveTheme(themeId: string) {
  try {
    localStorage.setItem('rustchess_table_theme', themeId);
  } catch {}
}
