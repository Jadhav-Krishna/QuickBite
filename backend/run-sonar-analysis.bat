@echo off
echo Killing Java processes...
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM javaw.exe /T 2>nul
timeout /t 5

set SONAR_TOKEN=squ_6825486dda4d2bc8e5df3777fd95678d7fadd261
set SONAR_HOST=http://localhost:9000

echo.
echo ========== Analyzing Auth Service ==========
cd auth-service
call mvn clean verify sonar:sonar -Dsonar.projectKey=QuickBite-Auth-Service -Dsonar.projectName="QuickBite - Auth Service" -Dsonar.host.url=%SONAR_HOST% -Dsonar.login=%SONAR_TOKEN%

echo.
echo ========== Analyzing Menu Service ==========
cd ..\menu-service
call mvn clean verify sonar:sonar -Dsonar.projectKey=QuickBite-Menu-Service -Dsonar.projectName="QuickBite - Menu Service" -Dsonar.host.url=%SONAR_HOST% -Dsonar.login=%SONAR_TOKEN%

echo.
echo ========== Analyzing Notification Service ==========
cd ..\notification-service
call mvn clean verify sonar:sonar -Dsonar.projectKey=QuickBite-Notification-Service -Dsonar.projectName="QuickBite - Notification Service" -Dsonar.host.url=%SONAR_HOST% -Dsonar.login=%SONAR_TOKEN%

echo.
echo ========== Analyzing Order Service ==========
cd ..\order-service
call mvn clean verify sonar:sonar -Dsonar.projectKey=QuickBite-Order-Service -Dsonar.projectName="QuickBite - Order Service" -Dsonar.host.url=%SONAR_HOST% -Dsonar.login=%SONAR_TOKEN%

echo.
echo ========== Analyzing Payment Service ==========
cd ..\payment-service
call mvn clean verify sonar:sonar -Dsonar.projectKey=QuickBite-Payment-Service -Dsonar.projectName="QuickBite - Payment Service" -Dsonar.host.url=%SONAR_HOST% -Dsonar.login=%SONAR_TOKEN%

echo.
echo ========== Analyzing Restaurant Service ==========
cd ..\restaurant-service
call mvn clean verify sonar:sonar -Dsonar.projectKey=QuickBite-Restaurant-Service -Dsonar.projectName="QuickBite - Restaurant Service" -Dsonar.host.url=%SONAR_HOST% -Dsonar.login=%SONAR_TOKEN%

echo.
echo ========== Analyzing Review Service ==========
cd ..\review-service
call mvn clean verify sonar:sonar -Dsonar.projectKey=QuickBite-Review-Service -Dsonar.projectName="QuickBite - Review Service" -Dsonar.host.url=%SONAR_HOST% -Dsonar.login=%SONAR_TOKEN%

echo.
echo ========== Analyzing Delivery Service ==========
cd ..\delivery-service
call mvn clean verify sonar:sonar -Dsonar.projectKey=QuickBite-Delivery-Service -Dsonar.projectName="QuickBite - Delivery Service" -Dsonar.host.url=%SONAR_HOST% -Dsonar.login=%SONAR_TOKEN%

echo.
echo ========== Analyzing Cart Service ==========
cd ..\cart-service
call mvn clean verify sonar:sonar -Dsonar.projectKey=QuickBite-Cart-Service -Dsonar.projectName="QuickBite - Cart Service" -Dsonar.host.url=%SONAR_HOST% -Dsonar.login=%SONAR_TOKEN%

echo.
echo ========== Analysis Complete ==========
echo Check results at: http://localhost:9000
echo.
echo Press any key to exit...
pause
