<?php
// Only prepares isolated local browser fixtures; never seeds production.
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
if (!app()->environment('testing') || config('database.connections.'.config('database.default').'.database') !== 'panaprisin_ecommerce_test') {
    throw new RuntimeException('Only panaprisin_ecommerce_test in testing environment is allowed');
}
App\Models\Category::firstOrCreate(['name' => 'Browser test category']);
App\Models\User::updateOrCreate(['email' => 'browser-admin@example.test'], [
    'first_name' => 'Browser', 'last_name' => 'Admin', 'password' => 'Testing-password-123', 'role' => 'admin',
]);
echo "Isolated browser fixtures ready\n";
