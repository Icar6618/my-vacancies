@echo off
chcp 65001 >nul
title Завантаження проєкту 'Мої вакансії' на GitHub
echo ===================================================================
echo   Завантаження проєкту 'Мої вакансії' на GitHub
echo   Репозиторій: https://github.com/whynotartcompany-tech/my-vacancies.git
echo ===================================================================
echo.
cd /d "%~dp0"
git remote remove origin 2>nul
git remote add origin https://github.com/whynotartcompany-tech/my-vacancies.git
git branch -M main
echo Відправляємо файли...
echo Якщо з'явиться віконце входу в GitHub — натисніть "Sign in with your browser".
echo.
git push -u origin main
echo.
echo ===================================================================
echo   Готово! Перевірте оновлення репозиторію на GitHub.
echo ===================================================================
pause
