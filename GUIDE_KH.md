# សៀវភៅណែនាំបង្កើត និងភ្ជាប់ Telegram Mini App (Cambo BIM Daily Report)

ឯកសារនេះពន្យល់ពីរបៀបរៀបចំ និងដំណើរការគម្រោង **Telegram Mini App** នេះតាំងពីដើមដល់ចប់ (End-to-End)។

---

## ១. របៀបដំណើរការលើម៉ាស៊ីនផ្ទាល់ (Local Development)

១. បើក Terminal ក្នុងថត `d:\QB_Tech_Solution\bot`
២. ដំណើរការ Command:
   ```bash
   npm run dev
   ```
៣. បើក Browser ចូលមើល: `http://localhost:3000`
   - អ្នកនឹងឃើញផ្ទាំង **Telegram WebApp Simulator** ដែលមានជម្រើសមើលជា:
     - **Desktop Modal** (ដូចក្នុងរូប Telegram Desktop)
     - **Mobile View** (ដូចលើទូរស័ព្ទដៃ)
     - **Full View**

---

## ២. របៀបបង្កើត Telegram Bot និងយក Bot Token (@BotFather)

១. បើកកម្មវិធី Telegram ហើយស្វែងរកគណនីផ្លូវការ `@BotFather`
២. ចុច Start ឬវាយបញ្ជា:
   ```text
   /newbot
   ```
៣. ដាក់ឈ្មោះ Bot (ឧ. `Cambo BIM Reporter`)
៤. ដាក់ Username Bot ដែលត្រូវបញ្ចប់ដោយពាក្យ `bot` (ឧ. `cambobim_report_bot`)
៥. `@BotFather` នឹងផ្ញើសារមកវិញដែលមាន **HTTP API Access Token** (ឧ. `7123456789:AAHxyz...`)
៦. ចម្លង Token នោះមកដាក់ក្នុង `.env.local`:
   ```env
   TELEGRAM_BOT_TOKEN="7123456789:AAHxyz..."
   ```

---

## ៣. របៀបភ្ជាប់ Web App ទៅក្នុង Menu Button របស់ Telegram

ដើម្បីឱ្យ User ចូលទៅក្នុង Bot ហើយឃើញប៊ូតុងបើក Form ផ្ទាល់៖

១. នៅក្នុង `@BotFather` វាយពាក្យបញ្ជា:
   ```text
   /mybots
   ```
២. ជ្រើសរើស Bot របស់អ្នក
៣. ចុចយក **Bot Settings** ➔ **Menu Button** ➔ **Configure menu button**
៤. ផ្ញើតំណភ្ជាប់ URL របស់ Web App (តម្រូវឱ្យប្រើ **HTTPS** ឧ. Vercel URL):
   ```text
   https://cambo-bim-report.vercel.app
   ```
៥. ដាក់ឈ្មោះប៊ូតុង (ឧ. `📋 បើកទម្រង់របាយការណ៍` ឬ `Open Daily Report`)

---

## ៤. របៀបយក Telegram Group Chat ID ដើម្បីឱ្យ Bot ផ្ញើ Report ចូល

១. បង្កើត Telegram Group មួយសម្រាប់ទទួល Report របស់ក្រុមហ៊ុន
២. Add Bot របស់អ្នកចូលទៅក្នុង Group នោះ (និងផ្តល់សិទ្ធិជា Admin ឬ Send Messages)
៣. Add Bot ជំនួយមួយទៀតឈ្មោះ `@userinfobot` ឬ `@raw_data_bot` ចូលក្នុង Group ដើម្បីមើល **Chat ID** (ជាទូទៅចាប់ផ្តើមដោយសញ្ញាដក ដូចជា `-1001987654321`)
៤. ចម្លង ID នោះមកដាក់ក្នុង `.env.local`:
   ```env
   TELEGRAM_CHAT_ID="-1001987654321"
   ```

---

## ៥. របៀបរៀបចំ Supabase Database (PostgreSQL)

១. ចូលទៅកាន់ [https://supabase.com](https://supabase.com) (ចុះឈ្មោះ និងបង្កើត Project ថ្មីដោយឥតគិតថ្លៃ)
២. ចូលទៅកាន់ម៉ឺនុយ **SQL Editor** ➔ ចុច **New query**
៣. បើកឯកសារ `supabase/schema.sql` ក្នុងគម្រោងនេះ ចម្លងកូដទាំងអស់មកបិទភ្ជាប់ (Paste) រួចចុច **Run**
   - វានឹងបង្កើត Table: `daily_reports`, `app_users`, `tasks` ព្រមទាំងដាក់ Sample Tasks ដោយស្វ័យប្រវត្តិ
៤. ចូលទៅកាន់ **Project Settings** ➔ **API**
   - ចម្លង **Project URL** ដាក់ក្នុង `NEXT_PUBLIC_SUPABASE_URL`
   - ចម្លង **anon public key** ដាក់ក្នុង `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## ៦. របៀប Deploy ឡើង Online (Free HTTPS តាម Vercel)

ដោយសារ Telegram Mini App តម្រូវឱ្យមាន HTTPS ជាដាច់ខាត ការ Deploy តាម Vercel គឺលឿន និងឥតគិតថ្លៃបំផុត៖

១. Push កូដនេះទៅកាន់ GitHub របស់អ្នក
២. ចូលទៅកាន់ [https://vercel.com](https://vercel.com) រួច Import Repository
៣. នៅក្នុងផ្ទាំង **Environment Variables** បញ្ចូលតម្លៃពី `.env.example`:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (URL នៃ Vercel domain របស់អ្នក)
៤. ចុច **Deploy** រួចជាស្រេច!
