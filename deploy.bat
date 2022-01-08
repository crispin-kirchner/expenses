set TARGET_PATH="%LocalAppData%\Expenses"
mkdir %TARGET_PATH%

set FILE_LIST=^
    "Calendar.js"^
    "colors.js"^
    "common.php"^
    "constants.js"^
    "expenses.bat"^
    "expenses.js"^
    "expensesApp.js"^
    "expenses.vbs"^
    "index.php"^
    "ManageTags.js"^
    "Migration.js"^
    "MonthChart.js"^
    "Navbar.js"^
    "open.php"^
    "package.json"^
    "package-lock.json"^
    "save.php"^
    "state.js"^
    "styles.css"^
    "TagForm.js"^
    "tags.js"

(for %%f in (%FILE_LIST%) do (
    copy %%f %TARGET_PATH%
))

copy "env-prod.bat" "%TARGET_PATH%\env.bat"

set currentfolder=%cd%
cd %TARGET_PATH%
npm install
cd %currentfolder%
