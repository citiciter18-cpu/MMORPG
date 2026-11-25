/* ==========================================================================
   BladeRealm — Supabase Cloud Save & Cross-Device Account Sync
   Syncs full player progress (level, gear, bag, Coin Bank, pets, cosmetics,
   Battle Pass) using Telegram User ID or portable Sync Code (BR-XXXX-XXXX).
   ========================================================================== */

window.CloudSave = (function () {
  const LS_CODE_KEY = 'bladerealm_cloud_account_id';
  const TABLE_NAME = 'bladerealm_saves';
  let lastStatus = 'Готово к синхронизации';
  let lastSyncAt = '';
  let needsTableSql = false;
  let busy = false;

  const CREATE_TABLE_SQL =
`CREATE TABLE IF NOT EXISTS public.bladerealm_saves (
  account_id TEXT PRIMARY KEY,
  player_name TEXT NOT NULL DEFAULT 'Герой',
  level INT NOT NULL DEFAULT 1,
  pvp_rating INT NOT NULL DEFAULT 1000,
  save_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.bladerealm_saves ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_public_saves" ON public.bladerealm_saves;
CREATE POLICY "allow_public_saves" ON public.bladerealm_saves
  FOR ALL USING (true) WITH CHECK (true);`;

  function getAccountId() {
    const tgUser = window.TelegramStars && window.TelegramStars.getEnvStatus().user;
    if (tgUser && tgUser.id) return 'tg_' + tgUser.id;
    try {
      let cid = localStorage.getItem(LS_CODE_KEY);
      if (!cid) {
        const part = () => Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4).padEnd(4, '7');
        cid = 'BR-' + part() + '-' + part();
        localStorage.setItem(LS_CODE_KEY, cid);
      }
      return cid;
    } catch (_e) {
      return 'BR-LOCAL-0001';
    }
  }

  function setCustomAccountId(raw) {
    const cleaned = String(raw || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 28);
    if (cleaned.length < 4) {
      if (window.UI) window.UI.toast('Код аккаунта должен быть не короче 4 символов!');
      return false;
    }
    try { localStorage.setItem(LS_CODE_KEY, cleaned); } catch (_e) {}
    return true;
  }

  function getSupabaseCreds() {
    if (window.Multiplayer && window.Multiplayer.getSupabaseConfig) {
      return window.Multiplayer.getSupabaseConfig();
    }
    return {
      url: 'https://khhnjppmwrughklyqcym.supabase.co',
      key: 'sb_publishable_m4fv3rOSTuUGtjj-l8J1tA_trjQdcyE'
    };
  }

  function buildPayloadObject() {
    if (!window.MMO || !window.MMO.buildSaveObject) {
      return window.MMO ? window.MMO.loadRawSave() : null;
    }
    return window.MMO.buildSaveObject();
  }

  async function uploadToCloud(silent) {
    if (busy || !window.GameState || !window.GameState.started) return { ok: false, msg: 'Игра не запущена' };
    const creds = getSupabaseCreds();
    if (!creds.url || !creds.key) {
      lastStatus = 'Не указан Supabase URL/ключ';
      return { ok: false, msg: lastStatus };
    }
    busy = true;
    try {
      const saveObj = buildPayloadObject();
      const accId = getAccountId();
      const p = window.GameState.player;
      const resp = await fetch(creds.url + '/rest/v1/' + TABLE_NAME + '?on_conflict=account_id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': creds.key,
          'Authorization': 'Bearer ' + creds.key,
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
          account_id: accId,
          player_name: p.name || 'Герой',
          level: p.level || 1,
          pvp_rating: p.pvpRating || 1000,
          save_data: saveObj,
          updated_at: new Date().toISOString()
        })
      });

      if (resp.ok) {
        needsTableSql = false;
        lastSyncAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        lastStatus = 'Сохранено в облако (' + lastSyncAt + ')';
        if (!silent && window.UI) window.UI.toast('Прогресс сохранён в облако Supabase!');
        return { ok: true, msg: lastStatus };
      }

      const errTxt = await resp.text().catch(() => '');
      if (resp.status === 404 || errTxt.includes('42P01') || errTxt.includes('Could not find the table')) {
        needsTableSql = true;
        lastStatus = 'Таблица bladerealm_saves не создана в Supabase (см. SQL ниже)';
      } else {
        lastStatus = 'Ошибка облака (' + resp.status + ')';
      }
      if (!silent && window.UI) window.UI.toast(lastStatus);
      return { ok: false, msg: lastStatus };
    } catch (_e) {
      lastStatus = 'Нет соединения с Supabase';
      if (!silent && window.UI) window.UI.toast(lastStatus);
      return { ok: false, msg: lastStatus };
    } finally {
      busy = false;
    }
  }

  async function downloadFromCloud(silent) {
    if (busy) return { ok: false, msg: 'Занято' };
    const creds = getSupabaseCreds();
    if (!creds.url || !creds.key) return { ok: false, msg: 'Нет настроек Supabase' };
    busy = true;
    try {
      const accId = getAccountId();
      const resp = await fetch(
        creds.url + '/rest/v1/' + TABLE_NAME + '?account_id=eq.' + encodeURIComponent(accId) + '&select=save_data,updated_at',
        {
          headers: {
            'apikey': creds.key,
            'Authorization': 'Bearer ' + creds.key
          }
        }
      );

      if (!resp.ok) {
        const errTxt = await resp.text().catch(() => '');
        if (resp.status === 404 || errTxt.includes('42P01') || errTxt.includes('Could not find the table')) {
          needsTableSql = true;
          lastStatus = 'Таблица bladerealm_saves ещё не создана в Supabase';
        } else {
          lastStatus = 'Ошибка загрузки (' + resp.status + ')';
        }
        if (!silent && window.UI) window.UI.toast(lastStatus);
        return { ok: false, msg: lastStatus };
      }

      const rows = await resp.json();
      if (!Array.isArray(rows) || rows.length === 0 || !rows[0].save_data) {
        lastStatus = 'В облаке нет сохранения для ' + accId;
        if (!silent && window.UI) window.UI.toast(lastStatus);
        return { ok: false, msg: lastStatus };
      }

      needsTableSql = false;
      const saveData = rows[0].save_data;
      if (window.GameAPI && window.GameAPI.applyCloudSave) {
        window.GameAPI.applyCloudSave(saveData);
      }
      lastSyncAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      lastStatus = 'Загружено из облака (' + lastSyncAt + ')';
      if (!silent && window.UI) window.UI.toast('Аккаунт восстановлен из облака Supabase!');
      return { ok: true, data: saveData, msg: lastStatus };
    } catch (_e) {
      lastStatus = 'Ошибка сети при загрузке из облака';
      if (!silent && window.UI) window.UI.toast(lastStatus);
      return { ok: false, msg: lastStatus };
    } finally {
      busy = false;
    }
  }

  function exportBackupString() {
    try {
      const obj = buildPayloadObject();
      const json = JSON.stringify(obj);
      return btoa(unescape(encodeURIComponent(json)));
    } catch (_e) {
      return '';
    }
  }

  function importBackupString(raw) {
    try {
      const json = decodeURIComponent(escape(atob(String(raw || '').trim())));
      const data = JSON.parse(json);
      if (!data || !data.player || !data.player.name) {
        if (window.UI) window.UI.toast('Неверный код резервной копии!');
        return false;
      }
      if (window.GameAPI && window.GameAPI.applyCloudSave) {
        window.GameAPI.applyCloudSave(data);
      }
      if (window.UI) window.UI.toast('Сохранение успешно импортировано!');
      return true;
    } catch (_e) {
      if (window.UI) window.UI.toast('Ошибка чтения кода сохранения!');
      return false;
    }
  }

  return {
    CREATE_TABLE_SQL,
    getAccountId,
    setCustomAccountId,
    uploadToCloud,
    downloadFromCloud,
    exportBackupString,
    importBackupString,
    getStatus: () => ({ lastStatus, lastSyncAt, needsTableSql, busy, accountId: getAccountId() })
  };
})();
