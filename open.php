<?php
    namespace Xpns;
    include 'common.php';

    $files = glob(getDataRoot() . '/*ausgaben.json');
    rsort($files, SORT_NATURAL | SORT_FLAG_CASE);
    $mostRecentFile = $files[0];

    echo(file_get_contents($mostRecentFile));
?>
