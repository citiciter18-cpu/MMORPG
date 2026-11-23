# BladeRealm на Cloudflare Workers (Игра + Онлайн + Telegram Stars)

## Быстрый деплой на ваш Worker (`patient-dream-8c58.citiciter18.workers.dev`)
1. В Cloudflare Dashboard откройте ваш Worker → **Settings → Variables and Secrets** и добавьте:
   - `BOT_TOKEN` — токен вашего бота от `@BotFather`
   - `ADMIN_PROMO` — ваш секретный промокод для выдачи Админ Бота себе (например `OWNER2026`)
2. Задеплойте эту папку через GitHub в Cloudflare Workers (Root directory: `bladerealm-cloudflare`) или с ПК командой:
   ```bash
   cd bladerealm-cloudflare
   npx wrangler deploy
   ```
3. Один раз откройте в браузере ссылку (подставьте ваш `BOT_TOKEN`), чтобы Telegram подтверждал платежи Stars:
   ```text
   https://api.telegram.org/botВАШ_ТОКЕН/setWebhook?url=https://patient-dream-8c58.citiciter18.workers.dev/tg-webhook
   ```
4. В `@BotFather` (Menu Button) укажите ссылку Mini App:
   ```text
   https://patient-dream-8c58.citiciter18.workers.dev/?api=https://patient-dream-8c58.citiciter18.workers.dev&ws=wss://patient-dream-8c58.citiciter18.workers.dev/ws
   ```
