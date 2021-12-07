<?php
    namespace Xpns;
    include 'common.php';

    $json = file_get_contents('php://input');
    $date = date('Ymd');
    $fh = fopen(getDataRoot() . "/$date ausgaben.json", 'w');
    fwrite($fh, $json);
    fclose($fh);
?>
