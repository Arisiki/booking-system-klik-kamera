<?php

namespace App\Http\Controllers;

use App\Helpers\CartHelper;
use App\Models\Order;
use App\Models\OrderItems;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Cek ketersediaan produk untuk popup kalender
     */
    public function checkAvailability(Request $request, Product $product)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if (!$startDate || !$endDate) {
            return response()->json(['error' => 'Start date and end date are required.'], 400);
        }

        try {
            $startDate = Carbon::parse($startDate)->toDateString();
            $endDate = Carbon::parse($endDate)->toDateString();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid date format.'], 400);
        }

        try {
            $isAvailable = $product->isAvailableForDates($startDate, $endDate);

            return response()->json([
                'is_available' => $isAvailable,
                'stock' => $product->stock,
                'unavailable_dates' => $this->getUnavailableDates($product),
            ]);
        } catch (\Exception $e) {
            \Log::error('Check Availability Error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Tambah produk ke cart
     */
    public function addToCart(Request $request, Product $product)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'pickup_method' => 'required|in:pickup,cod',
        ]);

        try {
            CartHelper::addToCart(
                $product->id,
                $request->quantity,
                $request->start_date,
                $request->end_date,
                $request->pickup_method
            );

            return redirect()->route('cart.show')->with('success', 'Product added to cart!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Booking langsung tanpa cart
     */
    public function bookNow(Request $request, Product $product)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'pickup_method' => 'required|in:pickup,cod',
        ]);

        // Cek ketersediaan
        if (!$product->isAvailableForDates($request->start_date, $request->end_date)) {
            return back()->withErrors(['error' => 'Product is not available for the selected dates.']);
        }

        if ($request->quantity > $product->stock) {
            return back()->withErrors(['error' => 'Requested quantity exceeds available stock.']);
        }

        // Hitung biaya
        $days = Carbon::parse($request->start_date)->diffInDays(Carbon::parse($request->end_date)) + 1;
        $rentalCost = $product->price_per_day * $request->quantity * $days;

        // Buat order
        $order = Order::create([
            'user_id' => auth()->id(),
            'order_date' => now(),
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'pickup_method' => $request->pickup_method,
            'total_cost' => $rentalCost,
            'status' => 'pending',
        ]);

        // Buat order item
        OrderItems::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => $request->quantity,
            'rental_cost' => $rentalCost,
        ]);

        return redirect()->route('checkout.show', $order->id)->with('success', 'Order created successfully!');
    }

    /**
     * Tampilkan cart
     */
    public function showCart()
    {
        $cartItems = CartHelper::getCart();

        return Inertia::render('Bookings/Cart', [
            'cartItems' => $cartItems,
            'totalCost' => collect($cartItems)->sum('rental_cost'),
        ]);
    }

    /**
     * Checkout dari cart
     */
    public function checkout(Request $request)
    {
        $cartItems = CartHelper::getCart();

        if (empty($cartItems)) {
            return redirect()->route('products.index')->withErrors(['error' => 'Cart is empty.']);
        }

        $order = Order::create([
            'user_id' => auth()->id(),
            'order_date' => now(),
            'start_date' => collect($cartItems)->min('start_date'),
            'end_date' => collect($cartItems)->max('end_date'),
            'pickup_method' => $cartItems[0]['pickup_method'],
            'address' => null,
            'total_cost' => collect($cartItems)->sum('rental_cost'),
            'status' => 'pending',
        ]);

        foreach ($cartItems as $item) {
            OrderItems::create([
                'order_id' => $order->id,
                'product_id' => $item['product']['id'],
                'quantity' => $item['quantity'],
                'rental_cost' => $item['rental_cost'],
            ]);
        }

        CartHelper::clearCart();

        return redirect()->route('checkout.show', $order->id)->with('success', 'Order created successfully!');
    }

    /**
     * Tampilkan halaman checkout
     */
    public function showCheckout(Order $order)
    {
        $order->load('orderItems.product', 'user');

        // Payment Gateway (Midtrans)
        \Midtrans\Config::$serverKey = config('mitrands.serverKey');
        \Midtrans\Config::$isProduction = false;
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;

        $params = array(
            'transaction_details' => array(
                'order_id' => $order->id . '-' . time(),
                'gross_amount' => $order->total_cost,
            ),
            'customer_details' => array(
                'first_name' => auth()->user()->name,
                'email' => auth()->user()->email,
                'phone' => '08111222333',
            ),
        );
        $snapToken = \Midtrans\Snap::getSnapToken($params);

        return Inertia::render('Bookings/Checkout', [
            'order' => $order,
            'clientKey' => config('mitrands.clientKey'),
            'snapToken' => $snapToken
        ]);
    }

    /**
     * Helper untuk mendapatkan tanggal yang tidak tersedia
     */
    private function getUnavailableDates(Product $product)
    {
        $bookedRanges = $product->orderItems()
            ->whereHas('order', fn($query) => $query->where('status', '!=', 'cancelled'))
            ->with('order')
            ->get()
            ->map(function ($orderItem) {
                return [
                    'start_date' => $orderItem->order->start_date->toDateString(),
                    'end_date' => $orderItem->order->end_date->toDateString(),
                ];
            })
            ->all();

        return $bookedRanges;
    }
}
