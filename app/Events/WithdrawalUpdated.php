<?php

namespace App\Events;

use App\Models\Withdrawal;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WithdrawalUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $withdrawal;
    public int $storeId;
    public array $stats;

    /**
     * Create a new event instance.
     */
    public function __construct(Withdrawal $withdrawal)
    {
        $withdrawal->loadMissing('store');
        $store = $withdrawal->store;

        $rawAccount = (string) ($withdrawal->account_number ?? '');
        $maskedAccount = strlen($rawAccount) > 4
            ? \Illuminate\Support\Str::mask($rawAccount, '*', 0, strlen($rawAccount) - 4)
            : $rawAccount;

        $this->storeId = (int) $withdrawal->store_id;
        $this->withdrawal = [
            'id' => $withdrawal->id,
            'reference_no' => $withdrawal->reference_no,
            'amount' => (float) $withdrawal->amount,
            'bank_name' => $withdrawal->bank_name,
            'account_number' => $maskedAccount,
            'account_holder' => $withdrawal->account_holder,
            'status' => $withdrawal->status,
            'notes' => $withdrawal->notes,
            'created_at' => $withdrawal->created_at ? $withdrawal->created_at->format('d M Y, H.i') : '',
        ];

        $available = (float) ($store?->available_balance ?? 0);
        $pending = (float) ($store?->pending_balance ?? 0);
        $totalWithdrawn = (float) Withdrawal::where('store_id', $this->storeId)
            ->where('status', 'completed')
            ->sum('amount');
        $pendingWithdrawals = (float) Withdrawal::where('store_id', $this->storeId)
            ->where('status', 'pending')
            ->sum('amount');

        $this->stats = [
            'available_balance' => $available,
            'pending_balance' => $pending,
            'total_withdrawn' => $totalWithdrawn,
            'total_earnings' => $available + $pending + $totalWithdrawn + $pendingWithdrawals,
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('store.' . $this->storeId),
        ];
    }
}
