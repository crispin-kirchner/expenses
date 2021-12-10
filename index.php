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
<html>

<head>
    <title><?php echo getTitle(); ?></title>
    <meta charset="UTF-8">
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
    <nav class="navbar navbar-dark bg-dark">
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
            <form id="modification-buttons" class="d-none">
                <button class="btn btn-light me-2" type="button" title="Bearbeiten"
                    onclick="startLineEdit(state.selected);"><i class="bi-pencil"></i> Bearbeiten</button>
                <button class="btn btn-light me-2" type="button" title="Löschen"
                    onclick="removeExpense(state.selected);"><i class="bi-trash"></i> Löschen</button>
            </form>
            <form class="d-flex">
                <button class="btn btn-light" type="button" id="save-button" title="Speichern" onclick="save();">
                    <i class="bi-save"></i> Speichern
                </button>
            </form>
        </div>
    </nav>

    <div class="container my-4">
        <div class="row">
            <div id="main-area" class="col col-8"> </div>
            <div class="col col-4">
                <div id="day-expenses"></div>
            </div>
        </div>
    </div>

    <script>
        "use strict";
        openFile();
    </script>
</body>

</html>
