<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Clean up sensitive shipping PINs from historical notification data in the notifications table.
     */
    public function up(): void
    {
        if (! Schema::hasTable('notifications')) {
            return;
        }

        // Query all notification rows that contain "PIN" in the JSON text
        DB::table('notifications')
            ->where('data', 'like', '%PIN%')
            ->orderBy('id')
            ->chunk(100, function ($notifications) {
                foreach ($notifications as $notification) {
                    $data = json_decode($notification->data, true);
                    if (! is_array($data)) {
                        continue;
                    }

                    $changed = false;

                    // Sanitize message if it contains PIN pattern
                    if (isset($data['message']) && is_string($data['message'])) {
                        // Pattern: PIN 1234 or similar 4-digit PIN mentions
                        $cleanedMessage = preg_replace(
                            '/Berikan PIN \d{4} ke kurir saat barang sampai\./i',
                            'Silakan buka aplikasi untuk melihat PIN serah terima.',
                            $data['message']
                        );
                        $cleanedMessage = preg_replace(
                            '/PIN\s*:?\s*\d{4}/i',
                            'PIN serah terima tersedia di aplikasi',
                            $cleanedMessage
                        );

                        if ($cleanedMessage !== $data['message']) {
                            $data['message'] = $cleanedMessage;
                            $changed = true;
                        }
                    }

                    if ($changed) {
                        DB::table('notifications')
                            ->where('id', $notification->id)
                            ->update(['data' => json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)]);
                    }
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // One-way security cleanup; old PIN plaintext cannot and should not be restored.
    }
};

