npm run build

set TARGET_PATH="%LocalAppData%\Expenses"
mkdir %TARGET_PATH%

xcopy /s /y /f build "%TARGET_PATH%"

del "%TARGET_PATH%\ausgaben_legacy.json"

copy "expenses.bat" "%TARGET_PATH%"
copy "expenses.vbs" "%TARGET_PATH%"
copy "cert.pem" "%TARGET_PATH%"
copy "key.pem" "%TARGET_PATH%"
