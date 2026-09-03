@echo off
REM ================================================================
REM setup-cli.bat - Cai dat & dang nhap CLI tools
REM ================================================================
REM Chay 1 lan de:
REM   1. Cai dat gh (GitHub CLI) neu chua co
REM   2. Cai dat vercel (Vercel CLI) neu chua co
REM   3. Dang nhap ca hai
REM   4. Verify moi thu OK
REM ================================================================

setlocal enabledelayedexpansion
chcp 65001 > nul

echo.
echo ============================================================
echo   SETUP CLI - GitHub CLI + Vercel CLI
echo ============================================================
echo.

REM ---- 1. GitHub CLI ----
echo [1/4] Kiem tra GitHub CLI (gh)...
where gh >nul 2>&1
if errorlevel 1 (
    echo gh chua cai. Cai dat...
    winget install --id GitHub.cli --accept-source-agreements --accept-package-agreements
    if errorlevel 1 (
        echo.
        echo Cai tu dong that bai. Cai thu cong:
        echo   1. Tai https://cli.github.com/
        echo   2. Hoac chay: winget install GitHub.cli
        echo   3. Hoac chay: scoop install gh
        echo.
        pause
        exit /b 1
    )
) else (
    echo gh da cai:
    gh --version
)

REM ---- 2. Vercel CLI ----
echo.
echo [2/4] Kiem tra Vercel CLI (vercel)...
where vercel >nul 2>&1
if errorlevel 1 (
    echo vercel chua cai. Cai dat qua npm...
    call npm install -g vercel
    if errorlevel 1 (
        echo.
        echo Cai that bai. Thu:
        echo   npm install -g vercel
        echo.
        pause
        exit /b 1
    )
) else (
    echo vercel da cai:
    vercel --version
)

REM ---- 3. Login GitHub ----
echo.
echo [3/4] GitHub login check...
gh auth status >nul 2>&1
if errorlevel 1 (
    echo Chua login GitHub. Dang nhap...
    echo.
    gh auth login
) else (
    echo GitHub OK:
    gh auth status
)

REM ---- 4. Login Vercel ----
echo.
echo [4/4] Vercel login check...
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo Chua login Vercel. Dang nhap...
    echo.
    vercel login
) else (
    echo Vercel OK:
    vercel whoami
)

echo.
echo ============================================================
echo   SETUP HOAN TAT!
echo ============================================================
echo.
echo Buoc tiep theo:
echo   1. Tao repo tren https://github.com/new
echo   2. Chay: scripts\deploy.bat
echo.
pause
