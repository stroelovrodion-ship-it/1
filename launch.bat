@echo off
chcp 65001 >nul
cls

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║              🎮 МАГИ НОВОГО МИРА 🎮                       ║
echo ║                                                           ║
echo ║         Текстовая RPG с конструктором магии              ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Проверка Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ошибка: Node.js не установлен!
    echo.
    echo 📥 Установите Node.js с официального сайта:
    echo    https://nodejs.org/
    echo.
    echo Рекомендуемая версия: 18.x или выше
    pause
    exit /b 1
)

echo ✅ Node.js найден
node --version
echo.

REM Проверка npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ошибка: npm не установлен!
    pause
    exit /b 1
)

echo ✅ npm найден
npm --version
echo.

REM Проверка наличия node_modules
if not exist "node_modules\" (
    echo 📦 Установка зависимостей...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Ошибка установки зависимостей!
        pause
        exit /b 1
    )
    echo ✅ Зависимости установлены!
    echo.
)

REM Запуск игры
echo 🚀 Запуск игры...
echo.
echo ═══════════════════════════════════════════════════════════
echo   Игра откроется в браузере автоматически
echo   Если не открылась, перейдите по адресу:
echo   http://localhost:5173
echo ═══════════════════════════════════════════════════════════
echo.

call npm run dev
