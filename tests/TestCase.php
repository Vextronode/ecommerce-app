<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    /**
     * Cegah PHPUnit (termasuk jika dijalankan dengan --no-configuration)
     * menyentuh atau me-wipe database development utama (cibenda_mart).
     */
    protected function refreshApplication(): void
    {
        parent::refreshApplication();

        $defaultConnection = (string) $this->app['config']->get('database.default');
        $databaseName = (string) $this->app['config']->get("database.connections.{$defaultConnection}.database");

        if ($databaseName === 'cibenda_mart') {
            throw new RuntimeException(
                "FATAL SAFETY GUARD: PHPUnit terdeteksi mengarah ke database development 'cibenda_mart' (connection: '{$defaultConnection}')! "
                .'DILARANG KERAS menjalankan test atau --no-configuration pada DB utama. Gunakan phpunit.xml (sqlite :memory:) atau DB_DATABASE=test.'
            );
        }
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }
}
