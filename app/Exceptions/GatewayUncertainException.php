<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * dilempar kalau gateway balikin 5xx (502/503/504), artinya request udah kekirim
 * tapi kita ga dapet jawaban pasti. payout mungkin udah kebuat di sisi gateway,
 * jadi jangan auto-reset ke pending dan jangan asal refund, tunggu rekonsiliasi.
 */
class GatewayUncertainException extends RuntimeException
{
    public function __construct(
        string $message = 'Gateway pembayaran memberi respons ambigu (5xx). Status payout belum pasti, perlu rekonsiliasi.',
        int $code = 0,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
