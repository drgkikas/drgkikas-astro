@echo off
echo ==============================================
echo Pushing changes to drgkikas-astro-site...
echo ==============================================

set GIT_EXE="C:\Users\Pacco\AppData\Local\GitHubDesktop\app-3.5.7\resources\app\git\cmd\git.exe"

%GIT_EXE% add .
%GIT_EXE% commit -m "Fix 500 error on SSR by prerendering dynamic routes"
%GIT_EXE% push

echo.
echo ==============================================
echo DONE! The fixes have been pushed successfully.
echo You can close this window now.
echo ==============================================
pause
