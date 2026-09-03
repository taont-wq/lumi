@echo off
REM ================================================================
REM deploy.bat - One-shot deployment script
REM ================================================================
REM Chay lan dau: init git + push GitHub + deploy Vercel
REM Cac lan sau: chi commit + push + vercel --prod
REM ================================================================
REM Yeu cau:
REM   - Da chay `gh auth login` 1 lan
REM   - Da chay `vercel login` 1 lan
REM   - Da tao repo tren GitHub (URL se duoc hoi)
REM ================================================================

setlocal enabledelayedexpansion
chcp 65001 > nul

cd /d "%~dp0\.."

echo.
echo ============================================================
echo   DEPLOY SCRIPT - tra-cuu-can-ho-mau-noi-that-3d
echo ============================================================
echo.

REM ---- 1. Kiem tra git ----
if not exist ".git" (
    echo [1/5] Khoi tao git repository...
    git init
    git branch -M main
) else (
    echo [1/5] Git da ton tai, bo qua init.
)

REM ---- 2. Kiem tra remote ----
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo [2/5] Chua co remote. Nhap URL repo GitHub:
    echo        Vi du: https://github.com/username/tra-cuu-can-ho-mau-noi-that-3d.git
    set /p REPO_URL="Repo URL: "
    if "!REPO_URL!"=="" (
        echo LOI: Phai nhap URL repo. Thoat.
        exit /b 1
    )
    git remote add origin "!REPO_URL!"
) else (
    echo [2/5] Remote da ton tai:
    git remote get-url origin
)

REM ---- 3. Build check ----
echo.
echo [3/5] Build check (npm run build)...
call npm run build
if errorlevel 1 (
    echo.
    echo LOI: Build that bai! Sua loi truoc khi deploy.
    exit /b 1
)
echo Build OK.

REM ---- 4. Commit & Push ----
echo.
echo [4/5] Commit & push len GitHub...
git add .

REM Chi commit neu co thay doi
git diff --quiet HEAD
set HAS_CHANGES=%errorlevel%
if !HAS_CHANGES! neq 0 (
    set /p COMMIT_MSG="Nhap commit message (Enter = auto): "
    if "!COMMIT_MSG!"=="" set COMMIT_MSG=chore: deploy update
    git commit -m "!COMMIT_MSG!"
) else (
    echo Khong co thay doi de commit.
)

REM Push (hoac set upstream neu lan dau)
git push -u origin main 2>nul
if errorlevel 1 (
    echo Loi push. Kiem tra:
    echo   - Repo da tao chua?
    echo   - Da co quyen push chua?
    echo   - Token con han khong? `gh auth status`
    exit /b 1
)
echo Push OK.

REM ---- 5. Deploy Vercel ----
echo.
echo [5/5] Deploy len Vercel...
echo.
echo Lua chon:
echo   1. Production (main branch)
echo   2. Preview (deploy tam, khong phai production)
set /p DEPLOY_TYPE="Chon 1 hoac 2 (mac dinh 1): "
if "!DEPLOY_TYPE!"=="2" (
    call vercel
) else (
    call vercel --prod
)

if errorlevel 1 (
    echo.
    echo LOI: Vercel deploy that bai. Kiem tra:
    echo   - Da chay `vercel login` chua?
    echo   - Environment Variables da them tren Vercel Dashboard chua?
    echo   - Output: xem log ben duoi
    exit /b 1
)

echo.
echo ============================================================
echo   DEPLOY HOAN TAT!
echo ============================================================
echo.
echo Buoc tiep theo:
echo   1. Vao https://vercel.com/dashboard kiem tra deployment
echo   2. Cau hinh Environment Variables (neu chua)
echo   3. Them custom domain (tuy chon)
echo.
echo Lan sau chi can: scripts\redeploy.bat
echo.
pause
