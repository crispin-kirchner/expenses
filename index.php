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
    <style>
        html {
            font-family: sans-serif;
        }

        h1 {
            display: inline;
        }

        .xpns-modal {
            color: gray;
        }

        .display-none {
            display: none;
        }

        .error {
            border-color: red;
        }

        .currency {
            width: 3ex;
            display: inline-block;
        }

        .va-bottom {
            vertical-align: bottom;
        }

        tr.heading {
            font-weight: bold;
        }

        tr.heading:not(:first-child) td {
            padding-top: 0.5em;
        }
    </style>
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
            <form id="modification-buttons" class="display-none">
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
