set TARGET_PATH="%LocalAppData%\Expenses"
mkdir %TARGET_PATH%

set FILE_LIST=^
    "package.json"^
    "package-lock.json"^
    "open.php"^
    "save.php"^
    "common.php"^
    "index.php"^
    "expenses.bat"^
    "expenses.vbs"

(for %%f in (%FILE_LIST%) do (
    copy %%f %TARGET_PATH%
))

copy "env-prod.bat" "%TARGET_PATH%\env.bat"

set currentfolder=%cd%
cd %TARGET_PATH%
npm install
cd %currentfolder%
