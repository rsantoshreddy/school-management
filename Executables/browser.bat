@ECHO OFF
SET BROWSER=chrome.exe
SET WAIT_TTIME=2
START %BROWSER% -new-tab "http://myapp.com:3000/"
pause?