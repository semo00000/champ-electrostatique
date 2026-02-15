@echo off
chcp 65001 >nul 2>&1
title Champ Electrostatique - Lancement
echo.
echo  ══════════════════════════════════════════════════
echo  ⚡  Champ Electrostatique - Simulation Interactive
echo  ══════════════════════════════════════════════════
echo.
echo  Ouverture dans votre navigateur...
echo.

:: Try to open index.html in the default browser
start "" "%~dp0index.html"

echo  ✓ Simulation lancee !
echo.
echo  Si la page ne s'ouvre pas automatiquement,
echo  ouvrez le fichier "index.html" manuellement
echo  dans Chrome, Edge ou Firefox.
echo.
echo  Appuyez sur une touche pour fermer...
pause >nul
