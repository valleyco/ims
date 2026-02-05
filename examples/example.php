<?php
$TOKEN="YOUR_TOKEN_HERE";
$context_options = [
    "http" => [
        "method" => "GET",
        "header" => "Authorization: ApiToken $TOKEN\r\n"
    ]
];

$stations = json_decode(file_get_contents("https://api.ims.gov.il/v1/envista/stations", false, stream_context_create($context_options)));
foreach ($stations as $station)
    echo "$station->stationId: $station->name ($station->shortName)\n";

?>
