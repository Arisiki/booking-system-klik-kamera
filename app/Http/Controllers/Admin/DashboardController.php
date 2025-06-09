<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Mendapatkan data untuk statistik
        $now = Carbon::now();
        
        // Menggunakan filter tanggal jika ada
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->startOfMonth();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : Carbon::now()->endOfMonth();
        
        // Menghitung bulan sebelumnya dari tanggal yang dipilih
        $previousPeriodStart = (clone $startDate)->subMonth();
        $previousPeriodEnd = (clone $endDate)->subMonth();
        
        // Total Revenue berdasarkan filter
        $totalRevenue = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_cost');
        
        $lastMonthRevenue = Order::where('status', 'completed')
            ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
            ->sum('total_cost');
        
        $revenueChange = $lastMonthRevenue > 0 
            ? round((($totalRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1) 
            : 100;
        
        // Total Customers berdasarkan filter
        $totalCustomers = User::where('role', 'user')
            ->where('created_at', '<=', $endDate)
            ->count();
        
        $lastMonthCustomers = User::where('role', 'user')
            ->where('created_at', '<=', $previousPeriodEnd)
            ->count();
        
        $customerChange = $lastMonthCustomers > 0 
            ? round((($totalCustomers - $lastMonthCustomers) / $lastMonthCustomers) * 100, 1) 
            : 100;
        
        // Total Sales berdasarkan filter
        $totalSales = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        
        $lastMonthSales = Order::where('status', 'completed')
            ->whereBetween('created_at', [$previousPeriodStart, $previousPeriodEnd])
            ->count();
        
        $salesChange = $lastMonthSales > 0 
            ? round((($totalSales - $lastMonthSales) / $lastMonthSales) * 100, 1) 
            : 100;
        
        // Active Bookings
        $activeBookings = Order::where('status', 'Booked')
            ->count();
        
        // Definisikan $lastHour sebelum digunakan
        $lastHour = Carbon::now()->subHour();
        
        $lastHourBookings = Order::where('status', 'Booked')
            ->where('created_at', '<=', $lastHour)
            ->count();
        
        $activeChange = $activeBookings - $lastHourBookings;
        
        // Monthly Sales berdasarkan filter
        $monthlySales = Order::whereMonth('created_at', $startDate->month)
            ->whereYear('created_at', $startDate->year)
            ->count();
        
        // Recent Sales berdasarkan filter
        $recentSales = Order::with('user')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer_name' => $order->user_name,
                    'email' => $order->email,
                    'amount' => $order->total_cost,
                    'date' => $order->created_at->format('Y-m-d'),
                ];
            });
        
        // Daily Revenue berdasarkan filter
        $dailyRevenueData = $this->getDailyRevenueData($startDate, $endDate);
        
        return Inertia::render('Admin/Index', [
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'revenueChange' => $revenueChange,
                'totalCustomers' => $totalCustomers,
                'customerChange' => $customerChange,
                'totalSales' => $totalSales,
                'salesChange' => $salesChange,
                'activeBookings' => $activeBookings,
                'activeChange' => $activeChange,
                'monthlySales' => $monthlySales,
                'dateRange' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d'),
                ],
            ],
            'recentSales' => $recentSales,
            'dailyRevenue' => $dailyRevenueData,
        ]);
    }

    // Metode untuk mendapatkan data pendapatan harian
    private function getDailyRevenueData($startDate, $endDate)
    {
        // Dapatkan data pendapatan harian dari database
        $dailyRevenue = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, SUM(total_cost) as amount')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date')
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'amount' => (float) $item->amount,
                ];
            })
            ->toArray();
        
        // Buat array dengan semua tanggal dalam rentang
        $dateRange = collect(CarbonPeriod::create($startDate, $endDate))
            ->map(function ($date) use ($dailyRevenue) {
                $dateString = $date->format('Y-m-d');
                return [
                    'date' => $dateString,
                    'amount' => $dailyRevenue[$dateString]['amount'] ?? 0,
                ];
            })
            ->values()
            ->toArray();
        
        return $dateRange;
    }
}
