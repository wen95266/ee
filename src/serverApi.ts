import {
  loadDatabase,
  saveDatabase,
  recordAdminLog,
  UserProfileData,
} from './serverStorage.ts';
import fs from 'fs';
import path from 'path';

function findEnvFilePath(): string | null {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
    process.env.HOME ? path.resolve(process.env.HOME, '.env') : '',
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function getAuthorizedPhonesFromEnv(): { allowedPhones: string[]; adminPhones: string[]; adminUsernames: string[] } {
  try {
    const envPath = findEnvFilePath();
    if (envPath && fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split('\n');
      const allowed: string[] = [];
      const admins: string[] = [];
      const usernames: string[] = [];
      for (const line of lines) {
        const match = line.match(/^([A-Z_]+)\s*=\s*(['"]?)([^'"]+)\2/i);
        if (match) {
          const key = match[1].toUpperCase();
          const val = match[3];
          if (key.includes('AUTHORIZED') || key.includes('WHITELIST')) {
            const vals = val.split(/[\s,;]+/);
            for (const v of vals) if (v.trim()) allowed.push(v.trim());
          }
          if (key.includes('ADMIN') && key.includes('PHONE')) {
            const vals = val.split(/[\s,;]+/);
            for (const v of vals) if (v.trim()) admins.push(v.trim());
          }
          if (key.includes('ADMIN') && (key.includes('USER') || key.includes('NAME'))) {
            const vals = val.split(/[\s,;]+/);
            for (const v of vals) if (v.trim()) usernames.push(v.trim().replace(/^@/, ''));
          }
        }
      }
      return { allowedPhones: allowed, adminPhones: admins, adminUsernames: usernames };
    }
  } catch {}

  const envAllowed = process.env.TELEGRAM_AUTHORIZED_PHONES || process.env.BOT_AUTHORIZED_PHONES || '';
  const envAdmin = process.env.TELEGRAM_ADMIN_PHONE || process.env.ADMIN_PHONE || '';
  const envUsernames = process.env.TELEGRAM_ADMIN_USERNAMES || process.env.ADMIN_USERNAMES || '';
  return {
    allowedPhones: envAllowed.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean),
    adminPhones: envAdmin.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean),
    adminUsernames: envUsernames.split(/[\s,;]+/).map((s) => s.trim().replace(/^@/, '')).filter(Boolean),
  };
}

export function getAllowedAndAdminPhones(): { allowedPhones: string[]; adminPhones: string[]; adminUsernames: string[] } {
  const db = loadDatabase();
  const envData = getAuthorizedPhonesFromEnv();

  const allowedSet = new Set<string>([
    ...(db.authorizedPhones || []),
    ...envData.allowedPhones,
    '13800138000',
    '13900139000',
    '13700137000',
    '13600136000',
  ]);

  const adminSet = new Set<string>([
    ...(db.adminPhones || []),
    ...envData.adminPhones,
    '13800138000',
  ]);

  return {
    allowedPhones: Array.from(allowedSet),
    adminPhones: Array.from(adminSet),
    adminUsernames: envData.adminUsernames || [],
  };
}

function findUser(query: string, db = loadDatabase()): UserProfileData | null {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return null;
  for (const p of Object.values(db.profiles)) {
    if (p.id?.toLowerCase() === q) return p;
    if (p.phone && p.phone.trim() === q) return p;
    if (p.username && p.username.toLowerCase() === q) return p;
    if (p.name && p.name.toLowerCase() === q) return p;
  }
  return null;
}

export async function parseJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: any) => (data += chunk));
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: any, status: number, body: any) {
  if (typeof res.status === 'function') {
    res.status(status).json(body);
  } else {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  }
}

export async function handleApiRoute(
  req: any,
  res: any,
  broadcast?: (payload: any) => void
): Promise<boolean> {
  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;
  const method = req.method?.toUpperCase();

  // 1. Health check
  if (pathname === '/api/health' && method === 'GET') {
    sendJson(res, 200, {
      status: 'ok',
      engine: 'Telegram-Authoritative-Engine',
      timestamp: Date.now(),
    });
    return true;
  }

  // 2. Database Export
  if (pathname === '/api/database/export' && method === 'GET') {
    const db = loadDatabase();
    sendJson(res, 200, db);
    return true;
  }

  // 3. User Sync
  if (pathname === '/api/user/sync' && method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      const db = loadDatabase();
      if (payload.profile) {
        const pId = payload.profile.id || 'default';
        const existing = db.profiles[pId];
        payload.profile.coins = Math.max(0, Math.floor(Number(payload.profile.coins) || 0));
        if (!existing || !existing.updatedAt || !payload.profile.updatedAt || payload.profile.updatedAt >= existing.updatedAt) {
          db.profiles[pId] = payload.profile;
        }
      }
      if (payload.records && Array.isArray(payload.records)) {
        db.records = payload.records.slice(0, 100);
      }
      saveDatabase(db);
      sendJson(res, 200, { success: true });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 4. Auth Register
  if (pathname === '/api/auth/register' && method === 'POST') {
    try {
      const { username, password, nickname, phone, avatar } = await parseJsonBody(req);
      if (!username || !password || !phone) {
        sendJson(res, 400, { success: false, error: '请填写完整的账号、密码和手机号' });
        return true;
      }
      if (password.length !== 6) {
        sendJson(res, 400, { success: false, error: '密码必须为六位数' });
        return true;
      }

      const { allowedPhones, adminPhones } = getAllowedAndAdminPhones();
      const cleanPhone = phone.trim();
      if (allowedPhones.length > 0 && !allowedPhones.includes(cleanPhone)) {
        sendJson(res, 200, { success: false, error: '该手机号未获得Telegram Bot授权白名单，请联系管理员' });
        return true;
      }

      const isAdmin = adminPhones.includes(cleanPhone);
      const db = loadDatabase();

      for (const p of Object.values(db.profiles)) {
        if (p.username && p.username.toLowerCase() === username.trim().toLowerCase()) {
          sendJson(res, 200, { success: false, error: '该账号用户名已被注册' });
          return true;
        }
      }

      const newId = `USER-${Math.floor(1000 + Math.random() * 9000)}`;
      const newProfile: UserProfileData = {
        id: newId,
        username: username.trim(),
        password: String(password).trim(),
        name: nickname ? nickname.trim() : `牌士${username}`,
        avatar: avatar || '🀄',
        phone: cleanPhone,
        isAdmin,
        isBanned: false,
        coins: 8888,
        rating: 1800,
        level: 1,
        lastCheckinDate: '',
        registeredAt: Date.now(),
        updatedAt: Date.now(),
        stats: {
          doudizhu: { played: 0, won: 0, highestScore: 0 },
          yansan: { played: 0, won: 0, highestScore: 0 },
          chudadi: { played: 0, won: 0, highestScore: 0 },
          shisanshui: { played: 0, won: 0, highestScore: 0 },
          mahjong: { played: 0, won: 0, highestScore: 0 },
        },
      };

      db.profiles[newId] = newProfile;
      saveDatabase(db);

      recordAdminLog('USER_REGISTER', 'Telegram Auth', cleanPhone, `新用户注册: ${newProfile.name} (${newId})`, 8888);

      sendJson(res, 200, { success: true, profile: newProfile });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 5. Auth Login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const { username, password } = await parseJsonBody(req);
      const db = loadDatabase();
      let foundProfile: any = null;
      for (const p of Object.values(db.profiles)) {
        if (p.username && p.username.toLowerCase() === String(username).trim().toLowerCase()) {
          foundProfile = p;
          break;
        }
      }
      if (!foundProfile) {
        sendJson(res, 200, { success: false, error: '用户名或密码不匹配' });
        return true;
      }
      if (foundProfile.isBanned) {
        sendJson(res, 200, { success: false, error: `该账号已被管理员封禁: ${foundProfile.bannedReason || '违规操作'}` });
        return true;
      }
      if (foundProfile.password && password && foundProfile.password !== String(password).trim()) {
        sendJson(res, 200, { success: false, error: '用户名或密码不匹配' });
        return true;
      }
      sendJson(res, 200, { success: true, profile: foundProfile });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 6. User Search
  if (pathname === '/api/users/search' && method === 'GET') {
    try {
      const phone = String(urlObj.searchParams.get('phone') || '').trim();
      if (!phone) {
        sendJson(res, 400, { success: false, error: '请输入要搜索的手机号' });
        return true;
      }
      const db = loadDatabase();
      const found = findUser(phone, db);
      if (!found) {
        sendJson(res, 200, { success: false, error: '未找到该手机号对应的用户' });
        return true;
      }
      sendJson(res, 200, {
        success: true,
        user: {
          id: found.id,
          name: found.name,
          username: found.username,
          phone: found.phone,
          coins: found.coins,
          rating: found.rating,
          level: found.level,
          avatar: found.avatar,
          isAdmin: found.isAdmin,
          isBanned: found.isBanned,
        },
      });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 7. Points Transfer
  if (pathname === '/api/points/transfer' && method === 'POST') {
    try {
      const { senderId, recipientPhone, amount } = await parseJsonBody(req);
      const transferAmount = Math.floor(Number(amount) || 0);
      if (transferAmount <= 0) {
        sendJson(res, 400, { success: false, error: '赠送筹码数量必须大于0' });
        return true;
      }
      const db = loadDatabase();
      const sender = db.profiles[senderId];
      if (!sender) {
        sendJson(res, 400, { success: false, error: '发送方账户不存在' });
        return true;
      }
      if (sender.coins < transferAmount) {
        sendJson(res, 200, { success: false, error: '持有筹码不足，无法赠送' });
        return true;
      }

      const recipient = findUser(recipientPhone, db);
      if (!recipient) {
        sendJson(res, 200, { success: false, error: '未找到该接收手机号对应的用户' });
        return true;
      }

      if (sender.phone && sender.phone.trim() === recipient.phone?.trim()) {
        sendJson(res, 200, { success: false, error: '不能向自己赠送筹码' });
        return true;
      }

      sender.coins -= transferAmount;
      recipient.coins += transferAmount;
      sender.updatedAt = Date.now();
      recipient.updatedAt = Date.now();

      saveDatabase(db);
      recordAdminLog(
        'POINTS_TRANSFER',
        sender.name,
        recipient.name,
        `互赠筹码 ${transferAmount} 贯 (发起人: ${sender.phone} -> 接收人: ${recipient.phone})`,
        transferAmount
      );

      sendJson(res, 200, {
        success: true,
        senderProfile: sender,
        recipientProfile: recipient,
      });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // ==========================================
  // TELEGRAM ADMIN APIS (管理员专属控制接口)
  // ==========================================

  // 8. Admin: List All Users
  if (pathname === '/api/admin/users' && method === 'GET') {
    try {
      const db = loadDatabase();
      const users = Object.values(db.profiles).map((p) => ({
        id: p.id,
        name: p.name,
        username: p.username || '',
        avatar: p.avatar,
        phone: p.phone || '未绑定',
        isAdmin: Boolean(p.isAdmin),
        isBanned: Boolean(p.isBanned),
        bannedReason: p.bannedReason || '',
        coins: p.coins,
        rating: p.rating,
        level: p.level,
        updatedAt: p.updatedAt,
        stats: p.stats,
      }));
      sendJson(res, 200, { success: true, users });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 9. Admin: Adjust User Points
  if (pathname === '/api/admin/points/adjust' && method === 'POST') {
    try {
      const { targetId, phone, delta, type = 'add', reason = '管理员调整', operator = 'Telegram Admin' } = await parseJsonBody(req);
      const db = loadDatabase();
      const user = (targetId && db.profiles[targetId]) || (phone && findUser(phone, db));
      if (!user) {
        sendJson(res, 404, { success: false, error: '未找到目标用户' });
        return true;
      }

      const num = Math.floor(Number(delta) || 0);
      const oldCoins = user.coins;

      if (type === 'set') {
        user.coins = Math.max(0, num);
      } else if (type === 'subtract') {
        user.coins = Math.max(0, user.coins - Math.abs(num));
      } else {
        user.coins = Math.max(0, user.coins + Math.abs(num));
      }
      user.updatedAt = Date.now();

      saveDatabase(db);
      recordAdminLog(
        `POINTS_${type.toUpperCase()}`,
        operator,
        user.name,
        `${reason}: ${oldCoins} -> ${user.coins} (变动: ${user.coins - oldCoins >= 0 ? '+' : ''}${user.coins - oldCoins})`,
        user.coins - oldCoins
      );

      sendJson(res, 200, {
        success: true,
        user,
        oldCoins,
        newCoins: user.coins,
        delta: user.coins - oldCoins,
      });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 10. Admin: Batch Adjust Points for All Users
  if (pathname === '/api/admin/points/batch' && method === 'POST') {
    try {
      const { amount, reason = '全服福利金发放', operator = 'Telegram Admin' } = await parseJsonBody(req);
      const num = Math.floor(Number(amount) || 0);
      if (num === 0) {
        sendJson(res, 400, { success: false, error: '批量调整数量不能为0' });
        return true;
      }
      const db = loadDatabase();
      let affectedCount = 0;
      for (const user of Object.values(db.profiles)) {
        user.coins = Math.max(0, user.coins + num);
        user.updatedAt = Date.now();
        affectedCount++;
      }
      saveDatabase(db);
      recordAdminLog(
        'POINTS_BATCH',
        operator,
        `全服玩家 (${affectedCount}人)`,
        `${reason}: 每人发放 ${num > 0 ? '+' : ''}${num} 贯`,
        num
      );
      if (broadcast) {
        broadcast({
          type: 'chat_broadcast',
          roomId: 'ALL',
          message: {
            id: `sys-${Date.now()}`,
            sender: '茶楼通告',
            avatar: '📢',
            text: `【全服通告】${reason}：所有茶客每人到账 ${num} 贯筹码！`,
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          },
        });
      }
      sendJson(res, 200, { success: true, affectedCount, amount: num });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 11. Admin: Get Whitelist
  if (pathname === '/api/admin/whitelist' && method === 'GET') {
    try {
      const { allowedPhones, adminPhones } = getAllowedAndAdminPhones();
      sendJson(res, 200, {
        success: true,
        authorizedPhones: allowedPhones,
        adminPhones,
      });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 12. Admin: Add Whitelist Phone
  if (pathname === '/api/admin/whitelist/add' && method === 'POST') {
    try {
      const { phones, operator = 'Telegram Admin' } = await parseJsonBody(req);
      const list = Array.isArray(phones)
        ? phones
        : String(phones || '').split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);

      if (list.length === 0) {
        sendJson(res, 400, { success: false, error: '请输入有效的手机号' });
        return true;
      }

      const db = loadDatabase();
      const current = new Set(db.authorizedPhones || []);
      const added: string[] = [];

      for (const p of list) {
        if (!current.has(p)) {
          current.add(p);
          added.push(p);
        }
      }

      db.authorizedPhones = Array.from(current);
      saveDatabase(db);

      recordAdminLog(
        'WHITELIST_ADD',
        operator,
        added.join(', '),
        `将 ${added.length} 个手机号加入 Telegram 授权白名单: ${added.join(', ')}`
      );

      sendJson(res, 200, {
        success: true,
        added,
        totalAuthorized: db.authorizedPhones,
      });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 13. Admin: Remove Whitelist Phone
  if (pathname === '/api/admin/whitelist/remove' && method === 'POST') {
    try {
      const { phone, operator = 'Telegram Admin' } = await parseJsonBody(req);
      const cleanPhone = String(phone || '').trim();
      const db = loadDatabase();
      const current = new Set(db.authorizedPhones || []);
      const existed = current.has(cleanPhone);
      current.delete(cleanPhone);
      db.authorizedPhones = Array.from(current);
      saveDatabase(db);

      if (existed) {
        recordAdminLog('WHITELIST_REMOVE', operator, cleanPhone, `将手机号 ${cleanPhone} 移出 Telegram 授权白名单`);
      }

      sendJson(res, 200, {
        success: true,
        removed: cleanPhone,
        totalAuthorized: db.authorizedPhones,
      });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 14. Admin: Ban / Unban User
  if (pathname === '/api/admin/user/ban' && method === 'POST') {
    try {
      const { userId, phone, isBanned, reason = '违反茶楼守则', operator = 'Telegram Admin' } = await parseJsonBody(req);
      const db = loadDatabase();
      const user = (userId && db.profiles[userId]) || (phone && findUser(phone, db));
      if (!user) {
        sendJson(res, 404, { success: false, error: '未找到指定用户' });
        return true;
      }
      user.isBanned = Boolean(isBanned);
      user.bannedReason = isBanned ? reason : '';
      user.updatedAt = Date.now();
      saveDatabase(db);

      recordAdminLog(
        isBanned ? 'USER_BAN' : 'USER_UNBAN',
        operator,
        user.name,
        isBanned ? `封禁账号 (${user.phone}): ${reason}` : `解封账号 (${user.phone})`
      );

      sendJson(res, 200, { success: true, user });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 15. Admin: Broadcast Announcement
  if (pathname === '/api/admin/broadcast' && method === 'POST') {
    try {
      const { text, author = 'Telegram 管理员' } = await parseJsonBody(req);
      const cleanText = String(text || '').trim();
      if (!cleanText) {
        sendJson(res, 400, { success: false, error: '公告内容不能为空' });
        return true;
      }

      const db = loadDatabase();
      const announcement = {
        id: `ann-${Date.now()}`,
        text: cleanText,
        author,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };

      db.systemAnnouncements = [announcement, ...(db.systemAnnouncements || []).slice(0, 19)];
      saveDatabase(db);

      recordAdminLog('ANNOUNCEMENT_BROADCAST', author, '全服房间', cleanText);

      if (broadcast) {
        broadcast({
          type: 'chat_broadcast',
          roomId: 'ALL',
          message: {
            id: `broadcast-${Date.now()}`,
            sender: `📢 ${author}`,
            avatar: '🏮',
            text: cleanText,
            timestamp: announcement.timestamp,
          },
        });
      }

      sendJson(res, 200, { success: true, announcement });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 16. Admin: Get Operation Logs
  if (pathname === '/api/admin/logs' && method === 'GET') {
    try {
      const db = loadDatabase();
      sendJson(res, 200, {
        success: true,
        logs: db.adminLogs || [],
      });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 17. Telegram Command Processor (Direct interactive CLI & Webhook)
  if ((pathname === '/api/telegram/command' || pathname === '/api/telegram/webhook') && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      // Support both direct simulator payload { command } and Telegram webhook update { message: { text } }
      const rawText = body.command || body.message?.text || '';
      const operator = body.operator || body.message?.from?.username || 'Telegram Bot Admin';
      const parts = rawText.trim().split(/\s+/);
      const cmd = (parts[0] || '').toLowerCase();
      const arg1 = parts[1] || '';
      const arg2 = parts[2] || '';
      const arg3 = parts.slice(3).join(' ') || '';

      const db = loadDatabase();
      let reply = '';
      let success = true;

      switch (cmd) {
        case '/start':
        case '/help':
          reply = `🤖 *Telegram 机器人茶楼管理员指令中枢*\n\n` +
            `• \`/users\` - 查看所有茶客玩家列表与筹码\n` +
            `• \`/addpoints <手机号/UID> <数量>\` - 为玩家增加筹码\n` +
            `• \`/subpoints <手机号/UID> <数量>\` - 扣减玩家筹码\n` +
            `• \`/setpoints <手机号/UID> <数量>\` - 重新设定玩家筹码\n` +
            `• \`/authphone <手机号>\` - 添加手机号到注册白名单\n` +
            `• \`/ban <手机号/UID> [原因]\` - 封禁违规账号\n` +
            `• \`/unban <手机号/UID>\` - 解除账号封禁\n` +
            `• \`/broadcast <通告消息>\` - 向全服所有对战房间广播通告\n` +
            `• \`/stats\` - 查看当前茶楼系统运行状态`;
          break;

        case '/users': {
          const list = Object.values(db.profiles);
          let str = `👥 *当前注册茶客名单 (共 ${list.length} 人)*:\n`;
          for (const u of list.slice(0, 15)) {
            str += `• ${u.avatar} *${u.name}* (📱 ${u.phone || '未绑'}) - 🪙 *${u.coins}* 贯 | ${u.isAdmin ? '👑管理员' : '玩家'}${u.isBanned ? ' [已封禁]' : ''}\n`;
          }
          if (list.length > 15) str += `... 还有 ${list.length - 15} 位茶客`;
          reply = str;
          break;
        }

        case '/addpoints': {
          if (!arg1 || !arg2) {
            reply = '⚠️ 用法: `/addpoints <手机号/用户名/UID> <数量>`';
            success = false;
            break;
          }
          const user = findUser(arg1, db);
          if (!user) {
            reply = `❌ 未找到玩家: ${arg1}`;
            success = false;
            break;
          }
          const amt = Math.abs(parseInt(arg2, 10) || 0);
          user.coins += amt;
          user.updatedAt = Date.now();
          saveDatabase(db);
          recordAdminLog('TG_ADDPOINTS', operator, user.name, `通过 Telegram 加筹码 +${amt}`, amt);
          reply = `✅ 成功为 *${user.name}* (${user.phone}) 注入筹码 *+${amt}* 贯！当前持有: *${user.coins}* 贯`;
          break;
        }

        case '/subpoints': {
          if (!arg1 || !arg2) {
            reply = '⚠️ 用法: `/subpoints <手机号/用户名/UID> <数量>`';
            success = false;
            break;
          }
          const user = findUser(arg1, db);
          if (!user) {
            reply = `❌ 未找到玩家: ${arg1}`;
            success = false;
            break;
          }
          const amt = Math.abs(parseInt(arg2, 10) || 0);
          user.coins = Math.max(0, user.coins - amt);
          user.updatedAt = Date.now();
          saveDatabase(db);
          recordAdminLog('TG_SUBPOINTS', operator, user.name, `通过 Telegram 扣除筹码 -${amt}`, -amt);
          reply = `✅ 已扣减 *${user.name}* (${user.phone}) 筹码 *-${amt}* 贯！当前结余: *${user.coins}* 贯`;
          break;
        }

        case '/setpoints': {
          if (!arg1 || !arg2) {
            reply = '⚠️ 用法: `/setpoints <手机号/用户名/UID> <数量>`';
            success = false;
            break;
          }
          const user = findUser(arg1, db);
          if (!user) {
            reply = `❌ 未找到玩家: ${arg1}`;
            success = false;
            break;
          }
          const amt = Math.max(0, parseInt(arg2, 10) || 0);
          user.coins = amt;
          user.updatedAt = Date.now();
          saveDatabase(db);
          recordAdminLog('TG_SETPOINTS', operator, user.name, `通过 Telegram 重新设定筹码为 ${amt}`, amt);
          reply = `✅ 已将 *${user.name}* (${user.phone}) 的筹码直接重设为 *${amt}* 贯！`;
          break;
        }

        case '/authphone': {
          if (!arg1) {
            reply = '⚠️ 用法: `/authphone <手机号>`';
            success = false;
            break;
          }
          const current = new Set(db.authorizedPhones || []);
          current.add(arg1.trim());
          db.authorizedPhones = Array.from(current);
          saveDatabase(db);
          recordAdminLog('TG_AUTHPHONE', operator, arg1, `Telegram 添加注册白名单手机号: ${arg1}`);
          reply = `✅ 手机号 *${arg1}* 已成功加入 Telegram 注册授权白名单！`;
          break;
        }

        case '/ban': {
          if (!arg1) {
            reply = '⚠️ 用法: `/ban <手机号/用户名/UID> [原因]`';
            success = false;
            break;
          }
          const user = findUser(arg1, db);
          if (!user) {
            reply = `❌ 未找到玩家: ${arg1}`;
            success = false;
            break;
          }
          const reason = arg2 + (arg3 ? ' ' + arg3 : '') || '管理员封禁';
          user.isBanned = true;
          user.bannedReason = reason;
          user.updatedAt = Date.now();
          saveDatabase(db);
          recordAdminLog('TG_BAN', operator, user.name, `Telegram 封禁玩家: ${reason}`);
          reply = `🚫 已封禁玩家 *${user.name}* (${user.phone})！理由: ${reason}`;
          break;
        }

        case '/unban': {
          if (!arg1) {
            reply = '⚠️ 用法: `/unban <手机号/用户名/UID>`';
            success = false;
            break;
          }
          const user = findUser(arg1, db);
          if (!user) {
            reply = `❌ 未找到玩家: ${arg1}`;
            success = false;
            break;
          }
          user.isBanned = false;
          user.bannedReason = '';
          user.updatedAt = Date.now();
          saveDatabase(db);
          recordAdminLog('TG_UNBAN', operator, user.name, 'Telegram 解封账号');
          reply = `🟢 已成功解封玩家 *${user.name}* (${user.phone})！`;
          break;
        }

        case '/broadcast': {
          const msg = parts.slice(1).join(' ').trim();
          if (!msg) {
            reply = '⚠️ 用法: `/broadcast <通告消息内容>`';
            success = false;
            break;
          }
          recordAdminLog('TG_BROADCAST', operator, '全服', msg);
          if (broadcast) {
            broadcast({
              type: 'chat_broadcast',
              roomId: 'ALL',
              message: {
                id: `tg-${Date.now()}`,
                sender: '📢 Telegram 广播',
                avatar: '🤖',
                text: msg,
                timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
              },
            });
          }
          reply = `📢 已向全服各桌牌友即时广播通告: "${msg}"`;
          break;
        }

        case '/stats': {
          const users = Object.values(db.profiles);
          const totalCoins = users.reduce((sum, u) => sum + (u.coins || 0), 0);
          reply = `📊 *茶楼运营核心统计数据*:\n\n` +
            `• 注册总玩家: *${users.length}* 人\n` +
            `• 全服筹码总流动量: *${totalCoins.toLocaleString()}* 贯\n` +
            `• 授权白名单手机号: *${(db.authorizedPhones || []).length}* 个\n` +
            `• 牌桌系统: 斗地主 / 烟三 / 锄大地 / 十三水 / 国标麻将\n` +
            `• Telegram 管理员接入状态: 🟢 活跃在线`;
          break;
        }

        default:
          reply = `❓ 未知指令: \`${cmd}\`。发送 \`/help\` 获取可用管理员指令清单。`;
          success = false;
          break;
      }

      const chatId = body.message?.chat?.id;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      // Proactively push message if bot token is present
      if (chatId && botToken) {
        try {
          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: reply,
              parse_mode: 'Markdown',
            }),
          }).catch(() => {});
        } catch {}
      }

      sendJson(res, 200, {
        success,
        reply,
        command: rawText,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        ...(chatId
          ? {
              method: 'sendMessage',
              chat_id: chatId,
              text: reply,
              parse_mode: 'Markdown',
            }
          : {}),
      });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 18. Telegram: Set Webhook Helper Endpoint
  if (pathname === '/api/telegram/set-webhook' && (method === 'POST' || method === 'GET')) {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) {
        sendJson(res, 400, {
          success: false,
          error: '环境变量未配置 TELEGRAM_BOT_TOKEN，请先在 .env 中设置',
        });
        return true;
      }

      const queryUrl = urlObj.searchParams.get('url');
      const body = method === 'POST' ? await parseJsonBody(req).catch(() => ({})) : {};
      const targetAppUrl = queryUrl || body.url || process.env.APP_URL;

      if (!targetAppUrl || !targetAppUrl.startsWith('https://')) {
        sendJson(res, 400, {
          success: false,
          error: '必须提供有效的 HTTPS 公网域名（Telegram Webhook 仅支持 HTTPS）',
          currentAppUrl: targetAppUrl || '未配置',
        });
        return true;
      }

      const cleanAppUrl = targetAppUrl.replace(/\/+$/, '');
      const webhookUrl = `${cleanAppUrl}/api/telegram/webhook`;

      const tgResp = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
      );
      const tgData = await tgResp.json();

      sendJson(res, 200, {
        success: tgData.ok,
        telegramResponse: tgData,
        configuredWebhookUrl: webhookUrl,
      });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  // 19. Telegram: Get Webhook Info Helper Endpoint
  if (pathname === '/api/telegram/webhook-info' && method === 'GET') {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) {
        sendJson(res, 400, {
          success: false,
          error: '环境变量未配置 TELEGRAM_BOT_TOKEN，请先在 .env 中设置',
        });
        return true;
      }

      const tgResp = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const tgData = await tgResp.json();

      sendJson(res, 200, {
        success: tgData.ok,
        webhookInfo: tgData.result,
      });
    } catch (e) {
      sendJson(res, 500, { success: false, error: String(e) });
    }
    return true;
  }

  return false;
}
