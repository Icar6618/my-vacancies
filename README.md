# 💼 Мої вакансії (My Vacancies)

Вебплатформа для моніторингу, збору та фільтрації актуальних вакансій, адаптованих під мій персональний стек навичок:
- **Generative AI Media**: Midjourney, Runway (Gen-2/Gen-3), Luma, ElevenLabs, HeyGen, Stable Diffusion, Suno/Udio
- **Design & UI/UX**: Figma, Pixso, Canva, Merch Design, UI/UX, Print Production
- **Video, Audio & Automation**: DaVinci Resolve, FL Studio, Audacity, Telegram Bot API, LLMs (Gemini, Claude, ChatGPT)
- **Frontend / Web**: HTML5, CSS3, Tailwind CSS, JavaScript, Astro

---

## 🚀 Структура проєкту

```text
my-vacancies/
├── index.html              # Головна сторінка каталогу та фільтрації вакансій
├── css/
│   └── style.css           # Стилі (Tailwind CDN + кастомний темний неоновий/скляний інтерфейс)
├── js/
│   └── app.js              # Логіка фільтрації, пошуку, збереження та перегляду деталей
├── data/
│   └── vacancies.json      # База даних вакансій (JSON-схема)
├── upload_to_github.bat    # Скрипт синхронізації з GitHub репозиторієм
├── package.json
└── README.md
```

## 🛠 Запуск локально
Відкрийте `index.html` напряму у браузері або запустіть локальний сервер:
```bash
npx serve .
```

## 🌐 Синхронізація з GitHub
Для завантаження змін запустіть `upload_to_github.bat` або виконайте:
```bash
git add .
git commit -m "Update vacancies"
git push origin main
```
