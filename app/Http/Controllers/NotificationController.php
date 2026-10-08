<?php

namespace App\Http\Controllers;

use App\Services\FcmTokenManager;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->latest()->limit(100)->get();

        $grouped = [
            'all' => $notifications->values(),
            'orders' => $notifications->filter(fn($n) => in_array($n->data['type'] ?? '', ['order', 'pesanan', 'payment']))->values(),
            'promotions' => $notifications->filter(fn($n) => in_array($n->data['type'] ?? '', ['promo', 'promotions', 'diskon']))->values(),
            'security' => $notifications->filter(fn($n) => ($n->data['type'] ?? '') === 'security')->values(),
        ];

        return response()->json($grouped);
    }

    /**
     * Get unread notification count
     */
    public function unreadCount(Request $request)
    {
        return response()->json([
            'count' => $request->user()->unreadNotifications()->count()
        ]);
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
        }
        
        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);
        return response()->json(['success' => true]);
    }

    /**
     * Delete all notifications
     */
    public function clearAll(Request $request)
    {
        $request->user()->notifications()->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->delete();
        }

        return response()->json(['success' => true]);
    }

    /**
     * simpan fcm token milik user yang login.
     *
     * token itu kredensial perangkat, bukan identifier publik. menolak klaim token
     * yang sudah dimiliki user lain mencegah attacker mematikan push korban (hijack/dos).
     * perangkat yang sah wajib mengirim ulang token yang sama ke akunnya sendiri.
     */
    public function saveFcmToken(Request $request)
    {
        $validated = $request->validate([
            'fcm_token' => [
                'required',
                'string',
                'min:30',
                'max:500',
                'regex:/^[a-zA-Z0-9_\-:]+$/',
            ],
        ]);

        $user = $request->user();
        $token = $validated['fcm_token'];

        // semua logika kepemilikan token ada di FcmTokenManager supaya tidak terpisah
        // dari jalur logout/handoff dan guard anti-hijack tidak pernah terlewat.
        $hasil = app(FcmTokenManager::class)->claim($user, $token);

        return response()->json([
            'success' => $hasil['status'] === FcmTokenManager::SUKSES,
            'message' => $hasil['message'],
        ], $hasil['status']);
    }
}
