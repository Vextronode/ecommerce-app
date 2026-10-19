<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Category;
use App\Models\ChatNegotiation;
use App\Models\ChatRoom;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatNegotiationSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $buyer;
    private User $merchantUser;
    private Store $store;
    private Product $product;
    private ChatRoom $room;

    protected function setUp(): void
    {
        parent::setUp();

        $this->buyer = User::factory()->create(['role' => 'user', 'status' => 'active']);
        $this->merchantUser = User::factory()->create(['role' => 'pedagang', 'status' => 'active']);

        $category = Category::create(['name' => 'Seafood', 'slug' => 'seafood']);

        $this->store = Store::create([
            'user_id' => $this->merchantUser->id,
            'name' => 'Toko Nelayan Jaya',
            'slug' => 'toko-nelayan-jaya',
            'sid_status' => 'verified',
            'address' => 'Jl. Pantai Timur No. 12',
            'latitude' => -7.701234,
            'longitude' => 108.491234,
        ]);

        $this->product = Product::create([
            'store_id' => $this->store->id,
            'category_id' => $category->id,
            'name' => 'Ikan Kakap Segar',
            'slug' => 'ikan-kakap-segar',
            'price' => 100000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $this->room = ChatRoom::create([
            'user_id' => $this->buyer->id,
            'store_id' => $this->store->id,
            'last_message_at' => now(),
        ]);
    }

    public function test_buyer_cannot_submit_offer_higher_or_equal_to_original_price(): void
    {
        $response = $this->actingAs($this->buyer)
            ->postJson("/chat/rooms/{$this->room->id}/negotiate", [
                'product_id' => $this->product->id,
                'offered_price' => 100000,
                'quantity' => 1,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['offered_price']);
    }

    public function test_buyer_cannot_submit_offer_below_thirty_percent_price_floor(): void
    {
        $response = $this->actingAs($this->buyer)
            ->postJson("/chat/rooms/{$this->room->id}/negotiate", [
                'product_id' => $this->product->id,
                'offered_price' => 25000, // 25% of 100.000 (< 30%)
                'quantity' => 1,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['offered_price']);
    }

    public function test_buyer_cannot_submit_offer_exceeding_stock(): void
    {
        $response = $this->actingAs($this->buyer)
            ->postJson("/chat/rooms/{$this->room->id}/negotiate", [
                'product_id' => $this->product->id,
                'offered_price' => 85000,
                'quantity' => 15, // Stock is only 10
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['quantity']);
    }

    public function test_buyer_can_successfully_submit_valid_offer(): void
    {
        $response = $this->actingAs($this->buyer)
            ->postJson("/chat/rooms/{$this->room->id}/negotiate", [
                'product_id' => $this->product->id,
                'offered_price' => 80000,
                'quantity' => 2,
                'note' => 'Beli untuk syukuran keluarga',
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('chat_negotiations', [
            'chat_room_id' => $this->room->id,
            'user_id' => $this->buyer->id,
            'product_id' => $this->product->id,
            'offered_price' => 80000,
            'quantity' => 2,
            'status' => 'pending',
            'last_action_by' => 'user',
        ]);

        $this->assertDatabaseHas('chat_messages', [
            'chat_room_id' => $this->room->id,
            'sender_id' => $this->buyer->id,
            'message_type' => 'negotiation',
        ]);
    }

    public function test_merchant_can_accept_offer(): void
    {
        $negotiation = ChatNegotiation::create([
            'chat_room_id' => $this->room->id,
            'user_id' => $this->buyer->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product->id,
            'original_price' => 100000,
            'offered_price' => 85000,
            'quantity' => 2,
            'status' => 'pending',
            'last_action_by' => 'user',
            'expires_at' => now()->addHours(24),
        ]);

        $response = $this->actingAs($this->merchantUser)
            ->postJson("/pedagang/chat/negotiations/{$negotiation->id}/accept");

        $response->assertStatus(200);
        $this->assertEquals('accepted', $negotiation->fresh()->status);
        $this->assertEquals('merchant', $negotiation->fresh()->last_action_by);
    }

    public function test_merchant_can_counter_offer(): void
    {
        $negotiation = ChatNegotiation::create([
            'chat_room_id' => $this->room->id,
            'user_id' => $this->buyer->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product->id,
            'original_price' => 100000,
            'offered_price' => 70000,
            'quantity' => 2,
            'status' => 'pending',
            'last_action_by' => 'user',
            'expires_at' => now()->addHours(24),
        ]);

        $response = $this->actingAs($this->merchantUser)
            ->postJson("/pedagang/chat/negotiations/{$negotiation->id}/counter", [
                'counter_price' => 85000,
                'note' => 'Pasnya 85rb ya kak',
            ]);

        $response->assertStatus(200);
        $fresh = $negotiation->fresh();
        $this->assertEquals('countered', $fresh->status);
        $this->assertEquals(85000, (float) $fresh->counter_price);
        $this->assertEquals('merchant', $fresh->last_action_by);
    }

    public function test_buyer_can_checkout_accepted_negotiation(): void
    {
        $negotiation = ChatNegotiation::create([
            'chat_room_id' => $this->room->id,
            'user_id' => $this->buyer->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product->id,
            'original_price' => 100000,
            'offered_price' => 80000,
            'quantity' => 2,
            'status' => 'accepted',
            'last_action_by' => 'merchant',
            'expires_at' => now()->addHours(24),
        ]);

        $response = $this->actingAs($this->buyer)
            ->postJson("/chat/negotiations/{$negotiation->id}/checkout");

        $response->assertStatus(200);
        $response->assertJsonStructure(['status', 'checkout_url']);

        $cart = Cart::where('user_id', $this->buyer->id)
            ->where('product_id', $this->product->id)
            ->first();

        $this->assertNotNull($cart);
        $this->assertEquals($negotiation->id, $cart->negotiation_id);
        $this->assertEquals(2, $cart->quantity);
    }

    public function test_user_cannot_alter_quantity_of_negotiated_cart_item(): void
    {
        $negotiation = ChatNegotiation::create([
            'chat_room_id' => $this->room->id,
            'user_id' => $this->buyer->id,
            'store_id' => $this->store->id,
            'product_id' => $this->product->id,
            'original_price' => 100000,
            'offered_price' => 80000,
            'quantity' => 2,
            'status' => 'accepted',
            'last_action_by' => 'merchant',
            'expires_at' => now()->addHours(24),
        ]);

        $cart = Cart::create([
            'user_id' => $this->buyer->id,
            'product_id' => $this->product->id,
            'preparation_option' => '',
            'quantity' => 2,
            'negotiation_id' => $negotiation->id,
        ]);

        // Attempt to increase quantity to exploit the negotiated price
        $response = $this->actingAs($this->buyer)
            ->patchJson("/cart/{$cart->id}", [
                'quantity' => 5,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['quantity']);
        $this->assertEquals(2, $cart->fresh()->quantity);
    }
}
