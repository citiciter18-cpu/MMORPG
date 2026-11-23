# BladeRealm — Деплой на Railway (Игра + Telegram Stars + Мультиплеер)

## Способ 1 (самый быстрый — через GitHub прямо из AI Studio)
1. В AI Studio нажмите **Push to GitHub** (отправить проект в свой репозиторий).
2. На **railway.app** нажмите **New Project → Deploy from GitHub repo** и выберите ваш репозиторий.
3. В настройках сервиса Railway откройте **Settings → Source → Root Directory** и укажите:
   `bladerealm-railway`
   *(Сервер сам найдёт файлы игры в `../app/src/main/assets/www` — ничего копировать не нужно!)*
4. В **Settings → Networking** нажмите **Generate Domain** — получите `https://ваш-домен.up.railway.app`.
5. В **Variables** добавьте:
   - `BOT_TOKEN` — токен бота от `@BotFather`
   - `ADMIN_PROMO` — ваш секретный промокод на Админ Бота (например `OWNER2026`)
   *(Webhook для оплаты Telegram Stars пропишется автоматически при запуске сервера!)*
6. В `@BotFather` → `/mybots` → **Bot Settings → Menu Button → Configure menu button** вставьте ссылку:
   `https://ваш-домен.up.railway.app/?api=https://ваш-домен.up.railway.app&ws=wss://ваш-домен.up.railway.app`

## Способ 2 (если выгружаете только папку `bladerealm-railway` из ZIP)
Скопируйте содержимое `app/src/main/assets/www` внутрь `bladerealm-railway/public/` и загрузите `bladerealm-railway` на GitHub → Railway.
