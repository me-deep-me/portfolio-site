@echo off
echo ====================================
echo  Installazione PyInstaller...
echo ====================================
pip install pyinstaller --quiet

echo.
echo ====================================
echo  Creazione eseguibile...
echo ====================================
pyinstaller --onefile --windowed --icon="Wood-Container_35529.ico" --name="CassePorTE" doors_pack.py

echo.
echo ====================================
echo  Fatto! Eseguibile in: dist\CassePorTE.exe
echo ====================================
pause
