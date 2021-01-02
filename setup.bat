@echo off
SET startupbat=anime-wallpaper.bat
SET stopbat=stop.bat
SET jspath="%cd%\index.js"
SET pm2exe="%cd%\node_modules\.bin\pm2"

@REM 创建开机启动文件 anime-wallpaper.bat
if exist %startupbat% del %startupbat%
echo @echo off >> %startupbat%
echo. >> %startupbat%
echo %pm2exe% start "%jspath%" --name anime-wallpaper >> %startupbat%

@REM 创建 stop.bat
if exist %stopbat% del %stopbat%
echo @echo off >> %stopbat%
echo. >> %stopbat%
echo %pm2exe% stop anime-wallpaper >> %stopbat%


@REM 拷贝anime-wallpaper.bat到启动项
copy %startupbat% "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
del %startupbat%

@REM 启动脚本
"%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\%startupbat%"
