@echo off
REM ================================================================
REM rollback.bat - Rollback Vercel deployment
REM ================================================================
REM Liet ke 5 deployment gan nhat, cho phep chon 1 de
REM promote thanh Production.
REM ================================================================

setlocal enabledelayedexpansion
chcp 65001 > nul

cd /d "%~dp0\.."

echo.
echo ============================================================
echo   ROLLBACK - tra-cuu-can-ho-mau-noi-that-3d
echo ============================================================
echo.
echo Dang lay danh sach deployments...

REM Liet ke 5 deployment gan nhat, output: url | state | created
vercel ls --limit 5
if errorlevel 1 (
    echo.
    echo Loi: khong the lay danh sach deployments.
    echo   - Da login vercel chua?
    echo   - Co project tren Vercel chua?
    exit /b 1
)

echo.
echo.
echo Nhap URL deployment can rollback (copy tu cot URL o tren):
echo Vi du: tra-cuu-can-ho-mau-noi-that-3d-abc123.vercel.app
set /p DEPLOY_URL="Deployment URL: "

if "!DEPLOY_URL!"=="" (
    echo LOI: Phai nhap URL.
    exit /b 1
)

echo.
echo Lua chon:
echo   1. Promote thanh Production (rollback that su)
echo   2. Huy (xem chi tiet deployment do)
set /p ACTION="Chon 1 hoac 2: "

if "!ACTION!"=="1" (
    echo.
    echo Dang promote !DEPLOY_URL! thanh Production...
    call vercel promote !DEPLOY_URL! --yes
    if errorlevel 1 (
        echo.
        echo LOI: Promote that bai.
        exit /b 1
    )
    echo.
    echo ============================================================
    echo   ROLLBACK HOAN TAT!
    echo ============================================================
) else (
    echo.
    echo Da huy. Hoac chay:
    echo   vercel inspect !DEPLOY_URL!
    echo.
)

pause
