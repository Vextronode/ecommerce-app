<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications;

        // Grouping notifications by our predefined UI tabs
        // You can adjust these depending on the exact 'type' we store in the DB
        $grouped = [
            'all' => $notifications,
            'orders' => $notifications->filter(fn($n) => $n->data['type'] ?? '' === 'order')->values(),
            'promotions' => $notifications->filter(fn($n) => $n->data['type'] ?? '' === 'promo')->values(),
            'security' => $notifications->filter(fn($n) => $n->data['type'] ?? '' === 'security')->values(),
            'payments' => $notifications->filter(fn($n) => $n->data['type'] ?? '' === 'payment')->values(),
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
        $request->user()->unreadNotifications->markAsRead();
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
     * Save the FCM token for the authenticated user
     */
    public function saveFcmToken(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string'
        ]);

        $user = $request->user();
        $user->fcm_token = $request->fcm_token;
        $user->save();

        return response()->json(['success' => true]);
    }
}
