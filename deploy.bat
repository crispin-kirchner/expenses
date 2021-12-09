set TARGET_PATH="%LocalAppData%\Expenses"
mkdir %TARGET_PATH%

set FILE_LIST=^
    "common.php"^
    "expenses.bat"^
    "expenses.js"^
    "expenses.vbs"^
    "index.php"^
    "open.php"^
    "package.json"^
    "package-lock.json"^
    "save.php"

(for %%f in (%FILE_LIST%) do (
    copy %%f %TARGET_PATH%
))

copy "env-prod.bat" "%TARGET_PATH%\env.bat"

set currentfolder=%cd%
cd %TARGET_PATH%
npm install
cd %currentfolder%
