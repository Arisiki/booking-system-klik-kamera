<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the orders.
     */
    public function index(Request $request)
    {
        $orders = Order::with(['user', 'orderItems.product'])
            ->when($request->search, function($query, $search) {
                $query->where('id', 'like', "%{$search}%")
                    ->orWhereHas('user', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($request->status, function($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->date_from, function($query, $dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($request->date_to, function($query, $dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
            'statuses' => [
                'pending' => 'Pending',
                'payment_complete' => 'Payment Complete',
                'booked' => 'Booked',
                'being_returned' => 'Being Returned',
                'completed' => 'Completed',
                'cancelled' => 'Cancelled',
            ],
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $order->load(['user', 'orderItems.product']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'statuses' => [
                'pending' => 'Pending',
                'payment_complete' => 'Payment Complete',
                'booked' => 'Booked',
                'being_returned' => 'Being Returned',
                'completed' => 'Completed',
                'cancelled' => 'Cancelled',
            ],
        ]);
    }

    /**
     * Update the order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,payment_complete,booked,being_returned,completed,cancelled',
            'admin_notes' => 'nullable|string|max:500',
        ]);
    
        $order->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'],
        ]);
    
        return redirect()->back()->with('success', 'Order status updated successfully.');
    }

    /**
     * Add Export Functionality
     */
    public function export(Request $request)
    {
        $orders = Order::with(['user', 'orderItems.product'])
            ->when($request->search, function($query, $search) {
                $query->where('id', 'like', "%{$search}%")
                    ->orWhere('user_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->status, function($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->date_from, function($query, $dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($request->date_to, function($query, $dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        
        $filename = 'orders-' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];
        
        $callback = function() use ($orders) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Order ID', 'Customer', 'Email', 'Phone', 'Total', 'Status', 'Created At']);
            
            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->user_name ?? ($order->user ? $order->user->name : 'N/A'),
                    $order->email ?? ($order->user ? $order->user->email : 'N/A'),
                    $order->phone_number ?? 'N/A',
                    $order->total_cost,
                    $order->status,
                    $order->created_at->format('Y-m-d H:i:s')
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }

    /**
     * Show the form for creating a new offline order.
     */
    public function create()
    {
        // Change this line - use 'stock' instead of 'is_available'
        $users = \App\Models\User::where('role', 'user')->get();
        $products = \App\Models\Product::where('stock', '>', 0)->get();
        
        return Inertia::render('Admin/Orders/Create', [
            'users' => $users,
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created offline order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id', 
            'user_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone_number' => 'required|string|max:20',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'pickup_method' => 'required|in:pickup,delivery',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'admin_notes' => 'nullable|string|max:500',
        ]);
        
        // Calculate duration and total price
        $startDate = \Carbon\Carbon::parse($validated['start_date']);
        $endDate = \Carbon\Carbon::parse($validated['end_date']);
        $duration = $startDate->diffInDays($endDate);
        
        $totalPrice = 0;
        foreach ($validated['items'] as $item) {
            $product = \App\Models\Product::find($item['product_id']);
            $totalPrice += $product->price_per_day * $item['quantity'] * $duration;
        }
        
        // Create order
        $order = Order::create([
            'user_id' => $validated['user_id'] ?? null, 
            'user_name' => $validated['user_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'order_date' => now(),
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'pickup_method' => $validated['pickup_method'],
            'total_cost' => $totalPrice,
            'status' => 'booked', 
            'admin_notes' => $validated['admin_notes'],
        ]);
        
        // Create order items
        foreach ($validated['items'] as $item) {
            $product = \App\Models\Product::find($item['product_id']);
            $order->orderItems()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price_per_day' => $product->price_per_day,
                'rental_cost' => $product->price_per_day * $item['quantity'] * $duration,
                'address' => $validated['pickup_method'] === 'delivery' ? 'Store pickup' : 'Store pickup', // Add this line
                'pickup_method' => $validated['pickup_method'], // Add this line
            ]);
        }
        
        // Create transaction record for offline payment
        $order->transaction()->create([
            'amount' => $totalPrice,
            'payment_method' => $validated['payment_method'],
            'status' => 'success',
            'is_offline' => true,
            'transaction_date' => now(),
        ]);
        
        return redirect()->route('admin.orders.index')->with('success', 'Offline order created successfully.');
    }
}