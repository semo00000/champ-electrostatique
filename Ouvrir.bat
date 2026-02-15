@echo off
chcp 65001 >nul 2>&1
title ⚡ Champ Electrostatique
color 0A
echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║  ⚡  Champ Electrostatique                       ║
echo  ║      Simulation Interactive                      ║
echo  ╚══════════════════════════════════════════════════╝
echo.

set "ROOT=%~dp0"
set PORT=8765

:: ── 1. Try Python (fastest option) ──────────────────
where python >nul 2>&1
if %ERRORLEVEL%==0 (
    echo  [✓] Python detecte - demarrage du serveur...
    start /b cmd /c "cd /d "%ROOT%" && python -m http.server %PORT% >nul 2>&1"
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:%PORT%"
    echo.
    echo  ✓ Simulation lancee sur http://localhost:%PORT%
    echo.
    echo  ⚠  NE FERMEZ PAS cette fenetre pendant l'utilisation !
    echo     Appuyez sur une touche pour ARRETER le serveur...
    pause >nul
    taskkill /f /im python.exe >nul 2>&1
    exit /b 0
)

:: ── 2. Fallback: PowerShell HTTP server (always available on Windows) ──
echo  [i] Python non installe - utilisation de PowerShell...
echo      (Aucune installation necessaire!)
echo.

:: Write the PowerShell server script to a temp file
set "PS_SCRIPT=%TEMP%\champ_server.ps1"
(
echo $root = '%ROOT:\=\\%'
echo $port = %PORT%
echo $listener = New-Object System.Net.HttpListener
echo $listener.Prefixes.Add("http://localhost:$port/")
echo try { $listener.Start() } catch {
echo     Write-Host '  [!] Port %PORT% occupe, essai sur 8766...' -ForegroundColor Yellow
echo     $port = 8766
echo     $listener = New-Object System.Net.HttpListener
echo     $listener.Prefixes.Add("http://localhost:$port/")
echo     $listener.Start()
echo }
echo Write-Host "  [OK] Serveur demarre sur http://localhost:$port" -ForegroundColor Green
echo Write-Host ''
echo Write-Host '  Ne fermez PAS cette fenetre pendant l''utilisation !' -ForegroundColor Yellow
echo Write-Host '  Fermez cette fenetre pour arreter le serveur.' -ForegroundColor Gray
echo Start-Process "http://localhost:$port"
echo $mimeTypes = @{
echo     '.html' = 'text/html; charset=utf-8'
echo     '.js'   = 'application/javascript; charset=utf-8'
echo     '.css'  = 'text/css; charset=utf-8'
echo     '.json' = 'application/json; charset=utf-8'
echo     '.png'  = 'image/png'
echo     '.jpg'  = 'image/jpeg'
echo     '.jpeg' = 'image/jpeg'
echo     '.gif'  = 'image/gif'
echo     '.svg'  = 'image/svg+xml'
echo     '.ico'  = 'image/x-icon'
echo     '.woff' = 'font/woff'
echo     '.woff2'= 'font/woff2'
echo     '.ttf'  = 'font/ttf'
echo     '.mp3'  = 'audio/mpeg'
echo     '.wav'  = 'audio/wav'
echo }
echo while ($listener.IsListening) {
echo     try {
echo         $ctx = $listener.GetContext()
echo         $req = $ctx.Request
echo         $res = $ctx.Response
echo         $path = $req.Url.LocalPath
echo         if ($path -eq '/') { $path = '/index.html' }
echo         $filePath = Join-Path $root ($path.TrimStart('/').Replace('/', '\'))
echo         if (Test-Path $filePath -PathType Leaf) {
echo             $bytes = [System.IO.File]::ReadAllBytes($filePath)
echo             $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
echo             if ($mimeTypes.ContainsKey($ext)) { $res.ContentType = $mimeTypes[$ext] }
echo             else { $res.ContentType = 'application/octet-stream' }
echo             $res.ContentLength64 = $bytes.Length
echo             $res.OutputStream.Write($bytes, 0, $bytes.Length)
echo         } else {
echo             $res.StatusCode = 404
echo             $msg = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
echo             $res.ContentLength64 = $msg.Length
echo             $res.OutputStream.Write($msg, 0, $msg.Length)
echo         }
echo         $res.Close()
echo     } catch { }
echo }
) > "%PS_SCRIPT%"

:: Launch the PowerShell server
powershell -ExecutionPolicy Bypass -NoProfile -File "%PS_SCRIPT%"

:: Clean up temp script
del "%PS_SCRIPT%" >nul 2>&1
exit /b 0
