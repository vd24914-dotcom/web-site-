# 🧶 УютНить — Магазин вязаных изделий

Полнофункциональный интернет-магазин с админкой, Telegram-уведомлениями и загрузкой фото.

## 🚀 Запуск локально

```bash
npm install
npx prisma db push
node seed.js
npm run dev
```

Сайт: http://localhost:3000  
Админка: http://localhost:3000/admin/login  
Email: admin@uyutnit.uz | Пароль: admin123

## 🌐 Деплой на Vercel

1. Загрузите проект на GitHub
2. Зайдите на vercel.com → Import project  
3. В Settings → Environment Variables добавьте:
   - `JWT_SECRET` — любая длинная строка (32+ символа)
   - `ADMIN_EMAIL` — ваш email
   - `ADMIN_PASSWORD` — ваш пароль
   - `TELEGRAM_BOT_TOKEN` — токен от @BotFather (опционально)
   - `TELEGRAM_CHAT_ID` — ваш Chat ID (опционально)
   - `NEXT_PUBLIC_SITE_URL` — ваш домен Vercel
4. В Settings → Database добавьте Vercel Postgres (бесплатно)
5. Нажмите Deploy

**Важно для Vercel:** SQLite не работает на Vercel.  
Подключите бесплатную базу данных:  
- Vercel Postgres (встроено)  
- или [Neon](https://neon.tech) (бесплатно)

После подключения БД измените в `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 📱 Telegram уведомления

1. @BotFather → /newbot → получите токен
2. Напишите боту /start
3. @userinfobot → получите Chat ID
4. Добавьте в .env.local и перезапустите
