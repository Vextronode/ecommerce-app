<?php

namespace App\Exceptions\Sid;

use Exception;

class SidApiException extends Exception
{
    protected int $statusCode;
    protected ?string $errorCode;

    public function __construct(string $message = "SID API Error", int $statusCode = 500, ?string $errorCode = null, ?Exception $previous = null)
    {
        parent::__construct($message, $statusCode, $previous);
        $this->statusCode = $statusCode;
        $this->errorCode = $errorCode;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getErrorCode(): ?string
    {
        return $this->errorCode;
    }
}
