<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();
        $connection = config('database.default');
        $database = config("database.connections.$connection.database");
        if (!app()->environment('testing') || !(($connection === 'sqlite' && $database === ':memory:')
            || ($connection === 'pgsql' && $database === 'panaprisin_ecommerce_test'))) {
            throw new \RuntimeException('Tests may only use SQLite :memory: or panaprisin_ecommerce_test in testing environment.');
        }
        return $app;
    }
}
