@echo off
REM ================================================================
REM redeploy.bat - Quick re-deploy (sau khi da deploy lan dau)
REM ================================================================
REM Buoc:
REM   1. Build check
REM   2. Commit thay doi (skip neu khong co)
REM   3. Push len GitHub
REM   4. Deploy Vercel production
REM ================================================================
REM Su dung:
REM   scripts\redeploy.bat              <- auto commit message
REM   scripts\redeploy.bat "fix bug"    <- custom message
REM ================================================================

setlocal enabledelayedexpansion
chcp 65001 > nul

cd /d "%~dp0\.."

REM Nhan commit message tu tham so hoac auto
set COMMIT_MSG=%~1
if "!COMMIT_MSG!"=="" set COMMIT_MSG=chore: redeploy update

echo.
echo ============================================================
echo   REDEPLOY - tra-cuu-can-ho-mau-noi-that-3d
echo ============================================================
echo.

REM ---- 1. Pre-flight checks ----
if not exist ".git" (
    echo LOI: Chua co git. Chay `scripts\deploy.bat` lan dau.
    exit /b 1
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo LOI: Chua co remote. Chay `scripts\deploy.bat` lan dau.
    exit /b 1
)

REM ---- 2. Build check ----
echo [1/4] Build check...
call npm run build
if errorlevel 1 (
    echo.
    echo LOI: Build that bai! Sua loi truoc khi redeploy.
    exit /b 1
)
echo Build OK.

REM ---- 3. Commit & Push ----
echo.
echo [2/4] Commit & push...

REM Kiem tra co thay doi khong (working tree khac HEAD)
git diff --quiet HEAD 2>nul
set HAS_CHANGES=%errorlevel%
REM exit 0 = khong co thay doi, exit 1 = co thay doi

if !HAS_CHANGES! equ 0 (
    echo Khong co thay doi (working tree clean). Bo qua commit.
) else (
    git add .
    git commit -m "!COMMIT_MSG!"
)

git push origin main
if errorlevel 1 (
    echo.
    echo LOI: Push that bai. Kiem tra ket noi GitHub.
    exit /b 1
)
echo Push OK.

REM ---- 4. Deploy Vercel production ----
echo.
echo [3/4] Deploy len Vercel production...
call vercel --prod
if errorlevel 1 (
    echo.
    echo LOI: Vercel deploy that bai.
    exit /b 1
)

echo.
echo [4/4] Done!
echo.
echo ============================================================
echo   REDEPLOY HOAN TAT!
echo ============================================================
echo.
echo Trang thai: https://vercel.com/dashboard
echo Logs: vercel logs
echo.
pause
