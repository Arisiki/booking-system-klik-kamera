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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\FacadesLog;
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
            Log::error('Check Availability Error: ' . $e->getMessage());
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
            'pickupAddress' => 'required_if:pickup_method,pickup|nullable|string',
            'userName' => 'required|string|max:25',
            'email' => 'required|email',
            'phoneNumber' => 'required|numeric'
        ]);

        try {
            CartHelper::addToCart(
                $product->id,
                $request->quantity,
                $request->start_date,
                $request->end_date,
                $request->pickup_method,
                $request->pickupAddress,
                $request->userName,
                $request->email,
                $request->phoneNumber,
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
            'pickupAddress' => 'required_if:pickup_method,pickup|nullable|string',
            'userName' => 'required|string|max:25',
            'email' => 'required|email',
            'phoneNumber' => 'required|numeric'
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
            'address' => $request->pickupAddress,
            'total_cost' => $rentalCost,
            'status' => 'pending',
            'user_name' => $request->userName,
            'email' => $request->email,
            'phone_number' => $request->phoneNumber
        ]);

        // Buat order item
        OrderItems::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => $request->quantity,
            'rental_cost' => $rentalCost,
            'address' => $request->pickupAddress,
            'pickup_method' => $request->pickup_method
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

        $firstItem = $cartItems[0];

        $order = Order::create([
            'user_id' => auth()->id(),
            'order_date' => now(),
            'start_date' => collect($cartItems)->min('start_date'),
            'end_date' => collect($cartItems)->max('end_date'),
            'pickup_method' => $firstItem['pickup_method'],
            'address' => $firstItem['pickup_address'],
            'user_name' => $firstItem['user_name'],
            'email' => $firstItem['email'],
            'phone_number' => $firstItem['phone_number'],
            'total_cost' => collect($cartItems)->sum('rental_cost'),
            'status' => 'pending',
        ]);

        foreach ($cartItems as $item) {
            OrderItems::create([
                'order_id' => $order->id,
                'product_id' => $item['product']['id'],
                'quantity' => $item['quantity'],
                'address' => $item['pickup_address'],
                'pickup_method' => $item['pickup_method'],
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
        $itemDetails = [];
        foreach ($order->orderItems as $orderItem) {
            $itemDetails[] = [
                'id' => 'P' . $orderItem->product->id,
                'price' => $orderItem->rental_cost / $orderItem->quantity,
                'quantity' => $orderItem->quantity,
                'name' => $orderItem->product->name,
            ];
        }


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
                'first_name' => $order->user_name,
                'email' => $order->email,
                'phone' => $order->phone_number,
            ),
            'item_details' => $itemDetails

        );
        $snapToken = \Midtrans\Snap::getSnapToken($params);

        return Inertia::render('Bookings/Checkout', [
            'order' => $order,
            'snapToken' => $snapToken,
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



    /**
     * Tampilkan halaman orders
     */
    public function showOrders()
    {
        $orders = Order::where('user_id', auth()->id())
            ->with('orderItems.product')
            ->orderBy('order_date', 'desc')
            ->get();

        // Cek apakah masa booking telah selesai
        foreach ($orders as $order) {
            if ($order->status == 'Booked' && Carbon::parse($order->end_date)->isPast()) {
                $order->update(['status' => 'Being returned']);
            }
        }

        // Ambil ulang data setelah update
        $orders = Order::where('user_id', auth()->id())
            ->with('orderItems.product')
            ->orderBy('order_date', 'desc')
            ->get();

        return Inertia::render('Bookings/Orders', [
            'orders' => $orders,
        ]);
    }

    /**
     * Batalkan order
     */
    public function cancelOrder(Request $request, Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['error' => 'Only pending orders can be cancelled'], 400);
        }

        $order->update([
            'status' => 'cancelled',
        ]);

        return redirect()->route('orders.show')->with('success', 'Order cancelled successfully!');
    }

    /**
     * Perpanjang masa sewa order
     */
    public function extendOrder(Request $request, Order $order)
    {
        $request->validate([
            'new_end_date' => 'required|date|after:end_date',
        ]);

        if ($order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!in_array($order->status, ['processed', 'completed'])) {
            return response()->json(['error' => 'Only processed or completed orders can be extended'], 400);
        }

        $newEndDate = Carbon::parse($request->new_end_date);
        $currentEndDate = Carbon::parse($order->end_date);
        $additionalDays = $currentEndDate->diffInDays($newEndDate);

        // Cek ketersediaan produk untuk tanggal baru
        $isAvailable = true;
        foreach ($order->orderItems as $item) {
            if (!$item->product->isAvailableForDates($order->end_date, $newEndDate)) {
                $isAvailable = false;
                break;
            }
        }

        if (!$isAvailable) {
            return response()->json(['error' => 'Product is not available for the selected dates'], 400);
        }

        // Hitung biaya tambahan
        $additionalCost = 0;
        foreach ($order->orderItems as $item) {
            $additionalCost += $item->product->price_per_day * $item->quantity * $additionalDays;
        }

        $order->update([
            'end_date' => $newEndDate,
            'total_cost' => $order->total_cost + $additionalCost,
        ]);

        return redirect()->route('orders.show')->with('success', 'Order extended successfully!');
    }
}
