<?php

namespace App\Jobs;

use App\Events\NewSellerApplicationEvent;
use App\Exceptions\Sid\SidApplicationCancelledException;
use App\Models\SellerApplication;
use App\Services\Sid\SidApiService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncSidSellerApplicationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(SidApiService $sidService): void
    {
        if (! $sidService->isEnabled()) {
            return;
        }

        try {
            $page = 1;
            $perPage = 50;
            $seenBusinessRefs = [];

            do {
                $response = $sidService->fetchApplications('pending', $page, $perPage);
                $items = $response['data'] ?? [];
                $meta = $response['meta'] ?? [];
                $lastPage = $meta['last_page'] ?? 1;

                foreach ($items as $item) {
                    $businessRef = $item['business_ref'] ?? null;
                    if (! $businessRef) {
                        continue;
                    }

                    $seenBusinessRefs[] = $businessRef;

                    $existing = SellerApplication::where('business_ref', $businessRef)->first();
                    $isNew = ! $existing;

                    $payload = [
                        'status' => SellerApplication::STATUS_PENDING,
                        'requested_at' => isset($item['requested_at']) ? Carbon::parse($item['requested_at']) : now(),
                        'decided_at' => null,
                        'note' => null,
                        'nik' => $item['nik'] ?? null,
                        'name' => $item['name'] ?? null,
                        'business_name' => $item['business_name'] ?? null,
                        'business_activity' => $item['business_activity'] ?? null,
                        'category' => $item['category'] ?? null,
                        'category_label' => $item['category_label'] ?? null,
                        'email' => $item['email'] ?? null,
                        'phone' => $item['phone'] ?? null,
                        'address' => $item['address'] ?? null,
                        'letter_number' => $item['letter_number'] ?? null,
                        'issued_at' => isset($item['issued_at']) ? Carbon::parse($item['issued_at']) : null,
                        'expires_at' => isset($item['expires_at']) ? Carbon::parse($item['expires_at']) : null,
                        'raw_payload' => $item,
                    ];

                    if ($isNew) {
                        $application = SellerApplication::create(array_merge([
                            'business_ref' => $businessRef,
                        ], $payload));

                        // Broadcast new application event to admin
                        broadcast(new NewSellerApplicationEvent($application))->toOthers();
                    } else {
                        // Re-registration or update
                        $wasPending = $existing->status === SellerApplication::STATUS_PENDING;
                        $existing->update($payload);

                        if (! $wasPending) {
                            broadcast(new NewSellerApplicationEvent($existing))->toOthers();
                        }
                    }
                }

                $page++;
            } while ($page <= $lastPage);

            // Check locally pending applications that are no longer in the SID pending list
            $missingPendingApplications = SellerApplication::where('status', SellerApplication::STATUS_PENDING)
                ->whereNotIn('business_ref', $seenBusinessRefs)
                ->get();

            foreach ($missingPendingApplications as $missingApp) {
                try {
                    $detail = $sidService->getApplicationDetail($missingApp->business_ref);
                    $remoteStatus = $detail['data']['status'] ?? null;
                    if ($remoteStatus && in_array($remoteStatus, [SellerApplication::STATUS_ACCEPTED, SellerApplication::STATUS_REJECTED])) {
                        $missingApp->update([
                            'status' => $remoteStatus,
                            'decided_at' => isset($detail['data']['decided_at']) ? Carbon::parse($detail['data']['decided_at']) : now(),
                            'note' => $detail['data']['note'] ?? null,
                        ]);
                    }
                } catch (SidApplicationCancelledException) {
                    // Section 7.4: Mark as cancelled and delete personal data (PII)
                    $missingApp->anonymizeCancelled();
                } catch (\Throwable $e) {
                    Log::warning("Failed to reconcile missing SID application {$missingApp->business_ref}: " . $e->getMessage());
                }
            }
        } catch (\Throwable $e) {
            Log::error("SyncSidSellerApplicationsJob error: " . $e->getMessage(), [
                'exception' => $e,
            ]);
        }
    }
}
