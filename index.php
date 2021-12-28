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
</head>

<body>
    <nav id="navbar" class="navbar navbar-dark bg-dark fixed-top">
    </nav>

    <div class="container">
        <div id="app-area" class="row position-relative">
        </div>
    </div>

    <script type="module">
        "use strict";
        import * as expensesApp from './expensesApp.js';
        import state from './state.js';
        expensesApp.openFile();

        [
            'openFile',
            'startLineEdit',
            'cancelLineEdit',
            'setViewMode',
            'startNew',
            'setSaved',
            'render',
            'save',
            'handleProposalClick',
            'handleDescriptionInput',
            'handleDescriptionBlur',
            'handleProposalSelect',
            'handleAmountOrExchangeRateInput',
            'validateDecimalField',
            'getAmountInput',
            'handleCurrencyChanged',
            'setDate',
            'decrementMonth',
            'incrementMonth',
            'handleTypeChanged',
            'getExchangeRateInput',
            'handleRecurringCheckboxChanged',
            'validateIntegerField',
            'getRecurringFrequency',
            'setMonthDisplay',
            'removeExpense'
        ].forEach(fn => window[fn] = expensesApp[fn]);

        window.state = state;
    </script>
</body>

</html>
