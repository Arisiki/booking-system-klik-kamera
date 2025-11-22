<?php

namespace App\Http\Controllers;

use App\Helpers\CartHelper;
use App\Jobs\CancelOrderJob;
use App\Mail\OrderCancelledNotification;
use App\Models\Order;
use App\Models\OrderItems;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

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
            'end_date' => 'required|date|after_or_equal:start_date',
            'pickup_method' => 'required|in:pickup,home_delivery',
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
            'end_date' => 'required|date|after_or_equal:start_date',
            'pickup_method' => 'required|in:pickup,home_delivery',
            'pickup_time' => 'required|date_format:H:i',
            'return_time' => 'required|date_format:H:i|after:pickup_time',
            'pickupAddress' => 'required_if:pickup_method,pickup|nullable|string',
            'userName' => 'required|string|max:25',
            'email' => 'required|email',
            'phoneNumber' => 'required|numeric'
        ]);

        // Cek ketersediaan
        if (!$product->isAvailableForDates($request->start_date, $request->end_date)) {
            return back()->withErrors(['quantity' => 'Product is not available for the selected dates.']);
        }

        if ($request->quantity > $product->stock) {
            return back()->withErrors(['quantity' => 'Requested quantity exceeds available stock.']);
        }

        // Ganti logika perhitungan biaya
        $rentalCalculation = $product->calculateRentalCost(
            $request->start_date,
            $request->end_date,
            $request->quantity
        );
        $rentalCost = $rentalCalculation['total_cost'];

        // Gunakan database transaction untuk memastikan data konsisten dan mencegah race condition
        try {
            return DB::transaction(function () use ($request, $product, $rentalCost) {
                // Lock product row untuk mencegah race condition (double booking)
                $lockedProduct = Product::where('id', $product->id)->lockForUpdate()->first();

                // Cek ketersediaan lagi setelah lock
                if (!$lockedProduct->isAvailableForDates($request->start_date, $request->end_date)) {
                    throw new \Exception('Product is not available for the selected dates.');
                }

                if ($request->quantity > $lockedProduct->stock) {
                    throw new \Exception('Requested quantity exceeds available stock.');
                }

                // Buat order
                $order = Order::create([
                    'user_id' => auth()->id(),
                    'order_date' => now(),
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'pickup_method' => $request->pickup_method,
                    'pickup_time' => $request->pickup_time,
                    'return_time' => $request->return_time,
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
                    'product_id' => $lockedProduct->id,
                    'quantity' => $request->quantity,
                    'rental_cost' => $rentalCost,
                    'address' => $request->pickupAddress,
                    'pickup_method' => $request->pickup_method,
                    'pickup_time' => $request->pickup_time,
                    'return_time' => $request->return_time
                ]);

                CancelOrderJob::dispatch($order->id)->delay(now()->addHours(3));

                return redirect()->route('checkout.show', $order->id)->with('success', 'Order created successfully!');
            });
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
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
            return redirect('/cart')->withErrors(['cart' => 'Cart is empty.']);
        }

        // Pastikan cartItems adalah array dan memiliki setidaknya satu item
        if (!is_array($cartItems) || count($cartItems) === 0) {
            return redirect('/cart')->withErrors(['error' => 'Invalid cart data.']);
        }

        // Ambil item pertama dari values array jika cartItems adalah associative array
        $firstItem = is_array(reset($cartItems)) ? reset($cartItems) : $cartItems[0];

        // Validasi data yang diperlukan
        if (
            !isset($firstItem['pickup_method']) || !isset($firstItem['pickup_address']) ||
            !isset($firstItem['user_name']) || !isset($firstItem['email']) ||
            !isset($firstItem['phone_number'])
        ) {
            return redirect('/cart')->withErrors(['error' => 'Missing required cart data.']);
        }

        try {
            return DB::transaction(function () use ($cartItems, $firstItem) {
                // 1. Validasi ulang stok untuk SEMUA item dalam cart sebelum membuat order
                foreach ($cartItems as $item) {
                    // Lock product untuk mencegah race condition
                    $lockedProduct = Product::where('id', $item['product']['id'])->lockForUpdate()->first();

                    if (!$lockedProduct) {
                        throw new \Exception("Product {$item['product']['name']} not found.");
                    }

                    if (!$lockedProduct->isAvailableForDates($item['start_date'], $item['end_date'])) {
                        throw new \Exception("Product {$lockedProduct->name} is no longer available for the selected dates.");
                    }

                    if ($item['quantity'] > $lockedProduct->stock) {
                        throw new \Exception("Requested quantity for {$lockedProduct->name} exceeds available stock.");
                    }
                }

                // 2. Jika semua tersedia, buat Order
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

                // 3. Buat Order Items
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

                // Bersihkan cart setelah checkout berhasil
                session()->forget('cart');

                // Schedule job untuk membatalkan order jika tidak dibayar dalam 3 jam
                CancelOrderJob::dispatch($order->id)->delay(now()->addHours(3));

                return redirect()->route('checkout.show', $order->id)
                    ->with('success', 'Order created successfully!');
            });

        } catch (\Exception $e) {
            Log::error('Checkout Error: ' . $e->getMessage());
            // Kembalikan pesan error spesifik jika ada (misal stok habis)
            return redirect('/cart')->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Tampilkan halaman checkout
     */
    public function showCheckout(Order $order)
    {
        $order->load('orderItems.product', 'user');

        return Inertia::render('Bookings/Checkout', [
            'order' => $order,
        ]);
    }

    public function getMidtransToken(Order $order)
    {
        $order->load('orderItems.product', 'user');
        $itemDetails = [];
        foreach ($order->orderItems as $orderItem) {
            $itemDetails[] = [
                'id' => 'P' . $orderItem->product->id,
                'price' => (int) ($orderItem->rental_cost / $orderItem->quantity),
                'quantity' => $orderItem->quantity,
                'name' => $orderItem->product->name,
            ];
        }

        // Payment Gateway (Midtrans)
        \Midtrans\Config::$serverKey = config('midtrans.serverKey');
        \Midtrans\Config::$isProduction = config('midtrans.isProduction');
        \Midtrans\Config::$isSanitized = config('midtrans.isSanitized');
        \Midtrans\Config::$is3ds = config('midtrans.is3ds');

        $params = array(
            'transaction_details' => array(
                'order_id' => $order->id . '-' . time(),
                'gross_amount' => (int) $order->total_cost,
            ),
            'customer_details' => array(
                'first_name' => $order->user_name,
                'email' => $order->email,
                'phone' => $order->phone_number,
            ),
            'item_details' => $itemDetails
        );

        try {
            $snapToken = \Midtrans\Snap::getSnapToken($params);
            return response()->json(['token' => $snapToken]);
        } catch (\Exception $e) {
            Log::error('Midtrans Token Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    /**
     * Midtrans notification for automatic payment confirmation
     */
    public function handleMidtransNotification(Request $request)
    {
        Log::info('Midtrans Notification Received', [
            'method' => $request->method(),
            'payload' => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        try {
            $serverKey = config('midtrans.serverKey');
            if (empty($serverKey)) {
                throw new \Exception('Midtrans server key is not set in configuration');
            }

            \Midtrans\Config::$serverKey = $serverKey;
            \Midtrans\Config::$isProduction = config('midtrans.isProduction');
            \Midtrans\Config::$isSanitized = config('midtrans.isSanitized');
            \Midtrans\Config::$is3ds = config('midtrans.is3ds');

            try {
                $notification = new \Midtrans\Notification();
                Log::info('Midtrans Notification Created', ['notification' => (array) $notification]);
            } catch (\Exception $e) {
                Log::error('Failed to verify Midtrans notification', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                return response()->json(['status' => 'error', 'message' => 'Failed to verify transaction'], 400);
            }

            $signatureKey = $notification->signature_key;
            $orderId = $notification->order_id;
            $statusCode = $notification->status_code;
            $grossAmount = $notification->gross_amount;
            $mySignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

            if ($signatureKey !== $mySignature) {
                Log::warning('Invalid signature', ['signature_key' => $signatureKey, 'my_signature' => $mySignature]);
                return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 403);
            }

            $transactionStatus = $notification->transaction_status;
            $orderIdParts = explode('-', $notification->order_id);
            $orderId = null;

            if (!empty($orderIdParts) && is_numeric($orderIdParts[0])) {
                $orderId = $orderIdParts[0];
            }

            if (!$orderId) {
                Log::warning('Invalid order_id format', ['order_id' => $notification->order_id]);
                return response()->json(['status' => 'error', 'message' => 'Invalid order_id format'], 400);
            }

            Log::info('Parsed order_id', ['order_id' => $orderId]);

            $order = Order::find($orderId);

            if (!$order) {
                Log::warning('Order not found', ['order_id' => $orderId]);
                return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
            }


            if ($transactionStatus == 'pending') {
                $order->update([
                    'status' => 'pending_payment',
                ]);
            } elseif ($transactionStatus == 'settlement' || $transactionStatus == 'capture') {
                $order->update([
                    'status' => 'payment_complete',
                ]);
            } elseif ($transactionStatus == 'expire' || $transactionStatus == 'cancel' || $transactionStatus == 'deny') {
                Mail::to($order->email)->send(new OrderCancelledNotification($order));

                $order->orderItems()->delete();
                $order->update(['status' => 'cancelled']);
                Log::info('Order cancelled due to Midtrans notification', ['order_id' => $orderId]);
            }

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Error handling Midtrans notification', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
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
    /**
     * Konfirmasi pembayaran manual
     */
    public function confirmManualPayment(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['error' => 'Order status must be pending'], 400);
        }

        $order->update([
            'status' => 'waiting_confirmation',
        ]);

        return redirect()->route('orders.show')->with('success', 'Payment confirmation submitted. Please wait for admin verification.');
    }

    /**
     * Tampilkan halaman orders
     */
    public function showOrders()
    {
        $orders = Order::where('user_id', auth()->id())
            ->with(['orderItems.product', 'review'])
            ->orderBy('order_date', 'desc')
            ->get()
            ->map(function ($order) {
                if (in_array($order->status, ['pending', 'pending_payment'])) {
                    $expiryTime = Carbon::parse($order->order_date)->addHours(3);
                    if (now()->isAfter($expiryTime)) {
                        $order->update(['status' => 'cancelled']);
                        $order->status = 'cancelled';
                    } else {
                        $order->expires_at = $expiryTime;
                    }
                }
                // waiting_confirmation expires in 24 hours
                elseif ($order->status == 'waiting_confirmation') {
                    $expiryTime = Carbon::parse($order->order_date)->addHours(24);
                    if (now()->isAfter($expiryTime)) {
                        $order->update(['status' => 'cancelled']);
                        $order->status = 'cancelled';
                    } else {
                        $order->expires_at = $expiryTime;
                    }
                }

                if ($order->status == 'booked' && Carbon::parse($order->end_date)->isPast()) {
                    $order->update(['status' => 'being_returned']);
                    $order->status = 'being_returned';
                }

                return $order;
            });

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
            $pricePerDay = $item->product->hasActiveDiscount() ? $item->product->getDiscountedPrice() : $item->product->price_per_day;
            $additionalCost += $pricePerDay * $item->quantity * $additionalDays;
        }

        $order->update([
            'end_date' => $newEndDate,
            'total_cost' => $order->total_cost + $additionalCost,
        ]);

        return redirect()->route('orders.show')->with('success', 'Order extended successfully!');
    }

    /**
     * Submit ulasan dan rating untuk order
     */
    public function submitReview(Request $request, Order $order)
    {
        $request->validate([
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
        ]);


        if ($order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'completed') {
            return response()->json(['error' => 'You can only review completed orders'], 400);
        }

        if ($order->review) {
            return response()->json(['error' => 'You have already reviewed this order'], 400);
        }

        $productId = $order->orderItems->first()->product_id;

        $review = Review::create([
            'user_id' => auth()->id(),
            'order_id' => $order->id,
            'product_id' => $productId,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return redirect()->route('orders.show')->with('success', 'Review submitted successfully!');
    }
}
