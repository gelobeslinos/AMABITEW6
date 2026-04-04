<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Create a test announcement using a simpler approach
$announcement = \App\Models\Announcement::create([
    'title' => 'Test Announcement with Image',
    'message' => 'This is a test announcement with an image attachment to verify the file upload and display functionality.',
    'target_audience' => 'all',
    'attachment_path' => null, // Will be updated if file upload works
    'attachment_type' => null,
    'attachment_name' => null,
    'is_active' => true,
    'expires_at' => null,
]);

echo "Created test announcement: " . $announcement->title . " (ID: " . $announcement->id . ")\n";
echo "Target audience: " . $announcement->target_audience . "\n";
echo "Created at: " . $announcement->created_at . "\n";
