<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Carbon;

echo 'Real time(): '.date('Y-m-d H:i:s', time()).PHP_EOL;

Carbon::setTestNow('2026-09-28 08:30:00');

echo 'Carbon now(): '.now().PHP_EOL;
echo 'Real time() still: '.date('Y-m-d H:i:s', time()).PHP_EOL;
