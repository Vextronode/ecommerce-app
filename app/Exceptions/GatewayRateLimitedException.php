<?php

namespace App\Exceptions;

use RuntimeException;

class GatewayRateLimitedException extends RuntimeException
{
    public function __construct(
        string $message = 'Gateway pembayaran Midtrans IRIS sedang terkena rate limit. Permintaan akan dicoba ulang otomatis.',
        public int $retryAfterSeconds = 60,
        int $code = 429,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
