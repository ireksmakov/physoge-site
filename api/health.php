<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
echo json_encode([
  'ok' => true,
  'service' => 'fizmat-course-api',
  'php' => PHP_VERSION
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
