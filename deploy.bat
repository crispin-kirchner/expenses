call npm run build

set TARGET_PATH="%LocalAppData%\Expenses"
mkdir %TARGET_PATH%

xcopy /s /y /f build "%TARGET_PATH%"

copy /y "expenses.bat" "%TARGET_PATH%"
copy /y "expenses.vbs" "%TARGET_PATH%"
copy /y "cert.pem" "%TARGET_PATH%"
copy /y "key.pem" "%TARGET_PATH%"
