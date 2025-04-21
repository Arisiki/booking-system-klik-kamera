<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AvailabilityController extends Controller
{
    /**
     * Tampilkan halaman ketersediaan produk
     */
    public function index(Request $request)
    {
        $products = Product::all();
        $selectedProductId = $request->product_id ?? ($products->first() ? $products->first()->id : null);
        $month = $request->month ?? Carbon::now()->format('Y-m');
        
        $selectedProduct = null;
        $availabilityData = [];
        
        if ($selectedProductId) {
            $selectedProduct = Product::findOrFail($selectedProductId);
            $availabilityData = $this->getMonthlyAvailability($selectedProduct, $month);
        }
        
        return Inertia::render('Admin/Availability/Index', [
            'products' => $products,
            'selectedProduct' => $selectedProduct,
            'availabilityData' => $availabilityData,
            'currentMonth' => $month,
        ]);
    }
    
    /**
     * Dapatkan data ketersediaan bulanan untuk produk tertentu
     */
    private function getMonthlyAvailability(Product $product, $month)
    {
        // Parse month string (YYYY-MM)
        $date = Carbon::createFromFormat('Y-m', $month);
        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();
        
        // Get all dates in the month
        $period = CarbonPeriod::create($startOfMonth, $endOfMonth);
        $dates = [];
        
        foreach ($period as $date) {
            $dateString = $date->format('Y-m-d');
            $dates[$dateString] = [
                'date' => $dateString,
                'available' => $product->getAvailableQuantity($dateString, $dateString),
                'total' => $product->stock,
                'bookings' => []
            ];
        }
        
        // Get all orders for this product in this month
        $orders = Order::whereHas('orderItems', function($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->where('status', '!=', 'cancelled')
            ->where(function($query) use ($startOfMonth, $endOfMonth) {
                $query->whereBetween('start_date', [$startOfMonth, $endOfMonth])
                    ->orWhereBetween('end_date', [$startOfMonth, $endOfMonth])
                    ->orWhere(function($q) use ($startOfMonth, $endOfMonth) {
                        $q->where('start_date', '<', $startOfMonth)
                          ->where('end_date', '>', $endOfMonth);
                    });
            })
            ->with(['orderItems' => function($query) use ($product) {
                $query->where('product_id', $product->id);
            }, 'user'])
            ->get();
        
        // Add booking information to dates
        foreach ($orders as $order) {
            $orderStart = Carbon::parse($order->start_date);
            $orderEnd = Carbon::parse($order->end_date);
            
            // Adjust dates to be within the month
            $effectiveStart = $orderStart->lt($startOfMonth) ? $startOfMonth : $orderStart;
            $effectiveEnd = $orderEnd->gt($endOfMonth) ? $endOfMonth : $orderEnd;
            
            $bookingPeriod = CarbonPeriod::create($effectiveStart, $effectiveEnd);
            
            foreach ($bookingPeriod as $bookingDate) {
                $dateString = $bookingDate->format('Y-m-d');
                if (isset($dates[$dateString])) {
                    $quantity = $order->orderItems->first()->quantity;
                    $dates[$dateString]['bookings'][] = [
                        'order_id' => $order->id,
                        'customer' => $order->user_id ? $order->user->name : $order->user_name,
                        'quantity' => $quantity,
                        'status' => $order->status,
                    ];
                }
            }
        }
        
        return array_values($dates);
    }
    
    /**
     * Dapatkan data ketersediaan untuk API
     */
    public function getAvailability(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'month' => 'required|date_format:Y-m',
        ]);
        
        $product = Product::findOrFail($request->product_id);
        $availabilityData = $this->getMonthlyAvailability($product, $request->month);
        
        return response()->json($availabilityData);
    }
    
    /**
     * Blokir tanggal tertentu untuk produk
     */
    public function blockDates(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string|max:255',
        ]);
        
        $product = Product::findOrFail($request->product_id);
        
        $order = Order::create([
            'user_id' => auth()->id(),
            'user_name' => 'Admin Block',
            'email' => auth()->user()->email,
            'phone_number' => '0000000000',
            'order_date' => now(),
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'pickup_method' => 'home_delivery',
            'total_cost' => 0,
            'status' => 'booked', 
            'admin_notes' => 'BLOCKED: ' . ($request->reason ?? 'Blocked by admin'),
        ]);
        
        $order->orderItems()->create([
            'product_id' => $product->id,
            'quantity' => $product->stock,
            'price_per_day' => 0,
            'rental_cost' => 0,
            'address' => 'Konter penatih or Konter Kayubihi',
            'pickup_method' => 'pickup'
        ]);
        
        return redirect()->back()->with('success', 'Dates blocked successfully');
    }
}