<?php

namespace App\Events;

use App\Models\SellerApplication;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewSellerApplicationEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $application;

    public function __construct(SellerApplication $application)
    {
        $this->application = [
            'id' => $application->id,
            'business_ref' => $application->business_ref,
            'business_name' => $application->business_name,
            'name' => $application->name,
            'category' => $application->category,
            'category_label' => $application->category_label,
            'letter_number' => $application->letter_number,
            'requested_at' => $application->requested_at?->toIso8601String(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin-notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'seller.application.created';
    }
}
