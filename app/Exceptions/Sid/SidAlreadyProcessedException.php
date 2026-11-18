<?php

namespace App\Exceptions\Sid;

class SidAlreadyProcessedException extends SidApiException
{
    public function __construct(string $message = "Permohonan sudah diproses sebelumnya.")
    {
        parent::__construct($message, 409, 'application_already_processed');
    }
}
