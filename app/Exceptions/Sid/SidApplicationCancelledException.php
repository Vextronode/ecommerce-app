<?php

namespace App\Exceptions\Sid;

class SidApplicationCancelledException extends SidApiException
{
    public function __construct(string $message = "Permohonan telah dibatalkan oleh pemohon.")
    {
        parent::__construct($message, 410, 'application_cancelled');
    }
}
