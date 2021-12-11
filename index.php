<?php
    namespace Xpns;

    function getTitle() {
        $title = 'Ausgaben';
        $appzone = getenv('XPNS_APPZONE');
        if(!empty($appzone)) {
            $title .= " **$appzone**";
        }
        return $title;
    }
?>

<!doctype html>
<html lang="de">

<head>
    <title><?php echo getTitle(); ?></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="node_modules/bootstrap-icons/font/bootstrap-icons.css">
    <link rel="stylesheet" href="styles.css">

    <script src="node_modules/uuid/dist/umd/uuidv4.min.js"></script>
    <script src="node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    <script src="node_modules/chart.js/dist/chart.js"></script>
    <script src="expenses.js"></script>
</head>

<body>
    <nav class="navbar navbar-dark bg-dark fixed-top">
        <div class="container">
            <div class="navbar-brand">
                <button class="btn text-light" onclick="setDate(decrementMonth(state.date));">
                    <i class="bi-chevron-left"></i>
                </button>
                <button class="btn text-light" onclick="setDate(incrementMonth(state.date));">
                    <i class="bi-chevron-right"></i>
                </button>
                <span id="month-label">Ausgaben</span>
            </div>
            <form class="d-flex">
                <button class="btn btn-light me-2" type="button" id="save-button" title="Speichern" onclick="save();">
                    <i class="bi-save"></i><span class="d-none d-sm-inline-block">&nbsp;Speichern</span>
                </button>
                <button class="btn btn-light" type="button" title="Neu" onclick="state.new = true; render();">
                    <i class="bi-plus-square"></i><span class="d-none d-sm-inline-block">&nbsp;Neu</span>
                </button>
            </form>
        </div>
    </nav>

    <div class="container">
        <div id="app-area" class="row position-relative">
        </div>
    </div>

    <script>
        "use strict";
        openFile();
    </script>
</body>

</html>
