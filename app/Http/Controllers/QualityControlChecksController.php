<?php

namespace App\Http\Controllers;

use App\Models\QualityControlChecks;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QualityControlChecksController extends Controller
{
    // Definisikan checklist untuk setiap kategori (gunakan lowercase)
    private static $checklists = [
        'camera' => [
            'body_condition' => [
                'label' => 'Apakah body kamera bebas dari goresan atau penyok?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'buttons_function' => [
                'label' => 'Apakah semua tombol berfungsi dengan baik?',
                'type' => 'checkbox',
                'options' => ['Berfungsi', 'Tidak Berfungsi'],
            ],
            'screen_condition' => [
                'label' => 'Apakah layar LCD bebas dari goresan atau dead pixel?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'power_on' => [
                'label' => 'Apakah kamera menyala dengan normal?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'autofocus' => [
                'label' => 'Apakah fungsi autofocus berjalan dengan baik?',
                'type' => 'checkbox',
                'options' => ['Berfungsi', 'Tidak Berfungsi'],
            ],
            'sensor_clean' => [
                'label' => 'Apakah sensor kamera bersih (tidak ada debu atau bercak)?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
        ],
        'lens' => [
            'body_condition' => [
                'label' => 'Apakah body lensa bebas dari goresan atau penyok?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'lens_scratch' => [
                'label' => 'Apakah kaca lensa bebas dari goresan?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'lens_fungus' => [
                'label' => 'Apakah kaca lensa bebas dari jamur atau kabut?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'focus_ring' => [
                'label' => 'Apakah cincin fokus berputar dengan mulus?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'autofocus' => [
                'label' => 'Apakah autofocus lensa berfungsi dengan baik?',
                'type' => 'checkbox',
                'options' => ['Berfungsi', 'Tidak Berfungsi'],
            ],
        ],
        'flash_external' => [
            'physical_condition' => [
                'label' => 'Apakah flash bebas dari kerusakan fisik (goresan, penyok)?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'power_on' => [
                'label' => 'Apakah flash menyala dengan normal?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'flash_function' => [
                'label' => 'Apakah flash berfungsi dengan baik (menyala saat dipicu)?',
                'type' => 'checkbox',
                'options' => ['Berfungsi', 'Tidak Berfungsi'],
            ],
            'connection' => [
                'label' => 'Apakah koneksi ke kamera berfungsi dengan baik?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
        ],
        'drone' => [
            'body_condition' => [
                'label' => 'Apakah body drone bebas dari kerusakan fisik (goresan, retak)?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'propellers' => [
                'label' => 'Apakah semua baling-baling utuh dan berfungsi?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'power_on' => [
                'label' => 'Apakah drone menyala dengan normal?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'flight_test' => [
                'label' => 'Apakah drone dapat terbang dengan stabil?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'camera_function' => [
                'label' => 'Apakah kamera drone berfungsi dengan baik?',
                'type' => 'checkbox',
                'options' => ['Berfungsi', 'Tidak Berfungsi'],
            ],
        ],
        'stabilizer' => [
            'physical_condition' => [
                'label' => 'Apakah stabilizer bebas dari kerusakan fisik (goresan, retak)?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'power_on' => [
                'label' => 'Apakah stabilizer menyala dengan normal?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'stabilization' => [
                'label' => 'Apakah fungsi stabilisasi berjalan dengan baik?',
                'type' => 'checkbox',
                'options' => ['Berfungsi', 'Tidak Berfungsi'],
            ],
            'motor_function' => [
                'label' => 'Apakah motor stabilizer berfungsi dengan baik?',
                'type' => 'checkbox',
                'options' => ['Berfungsi', 'Tidak Berfungsi'],
            ],
        ],
        'tripod' => [
            'physical_condition' => [
                'label' => 'Apakah tripod bebas dari kerusakan fisik (retak, patah)?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'legs_lock' => [
                'label' => 'Apakah kaki tripod dapat dikunci dan dilepaskan dengan baik?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'head_movement' => [
                'label' => 'Apakah kepala tripod bergerak dengan mulus?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'stability' => [
                'label' => 'Apakah tripod stabil saat digunakan?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
        ],
        // Default checklist untuk kategori yang belum didefinisikan
        'default' => [
            'physical_condition' => [
                'label' => 'Apakah barang bebas dari kerusakan fisik?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
            'functionality' => [
                'label' => 'Apakah barang berfungsi dengan baik?',
                'type' => 'checkbox',
                'options' => ['Berfungsi', 'Tidak Berfungsi'],
            ],
            'completeness' => [
                'label' => 'Apakah semua bagian barang lengkap?',
                'type' => 'checkbox',
                'options' => ['Ya', 'Tidak'],
            ],
        ],
    ];

    /**
     * Tampilkan form QC untuk order tertentu
     */
    public function showForm(Request $request, Order $order)
    {
        // Pastikan order milik user yang sedang login
        if ($order->user_id !== auth()->id()) {
            return redirect()->route('orders.show')->withErrors(['error' => 'Unauthorized']);
        }

        // Pastikan status order adalah payment_complete
        if ($order->status !== 'payment_complete') {
            return redirect()->route('orders.show')->withErrors(['error' => 'QC can only be filled for orders with status payment_complete']);
        }

        // Ambil semua produk dalam order
        $products = $order->orderItems->map(function ($item) {
            $category = $item->product->category ? strtolower($item->product->category) : 'camera'; // Default ke 'camera' jika tidak ada kategori
            return [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'category' => $category,
            ];
        });

        return Inertia::render('Profile/QualityControl', [
            'order' => $order,
            'products' => $products,
            'checklists' => self::$checklists,
        ]);
    }

    /**
     * Simpan hasil QC
     */
    public function store(Request $request, Order $order)
    {
        // Pastikan order milik user yang sedang login
        if ($order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Pastikan status order adalah payment_complete
        if ($order->status !== 'payment_complete') {
            return response()->json(['error' => 'QC can only be filled for orders with status payment_complete'], 400);
        }

        $request->validate([
            'results' => 'required|array',
            'results.*.product_id' => 'required|exists:products,id',
            'results.*.category' => 'required|string',
            'results.*.checklist' => 'required|array',
            'results.*.status' => 'required|in:Layak Digunakan,Perlu Perbaikan,Tidak Layak',
            'results.*.notes' => 'nullable|string|max:1000',
        ]);

        // Simpan hasil QC untuk setiap produk
        foreach ($request->results as $result) {
            QualityControlChecks::create([
                'order_id' => $order->id,
                'product_id' => $result['product_id'],
                'category' => $result['category'],
                'checked_by' => auth()->id(),
                'check_date' => now(),
                'results' => $result['checklist'],
                'status' => $result['status'],
                'notes' => $result['notes'],
            ]);
        }

        // Langsung ubah status order menjadi booked
        $order->update(['status' => 'booked']);

        return redirect()->route('orders.show')->with('success', 'QC submitted successfully!');
    }
}
