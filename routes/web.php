<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QualityControlChecksController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Change this route to use the showRecomendations method
Route::get('/', [ProductsController::class, 'showRecomendations'])->name('home');

Route::get('/products', [ProductsController::class, 'index'])->name('products.index');
Route::get('/products/cameras', [ProductsController::class, 'showCameras'])->name('product.camera');
Route::get('/products/accecories', [ProductsController::class, 'showAccecories'])->name('product.accecories');
Route::get('/products/{product}', [ProductsController::class, 'show'])->name('products.show');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/cart', [BookingController::class, 'showCart'])->name('cart.show');
    Route::post('/products/{product}/add-to-cart', [BookingController::class, 'addToCart'])->name('cart.add');
    Route::post('/products/{product}/book-now', [BookingController::class, 'bookNow'])->name('book.now');
    Route::post('/checkout', [BookingController::class, 'checkout'])->name('checkout');
    Route::get('/checkout/{order}', [BookingController::class, 'showCheckout'])->name('checkout.show');
    Route::get('/products/{product}/check-availability', [BookingController::class, 'checkAvailability'])->name('products.checkAvailability');
    Route::get('/orders', [BookingController::class, 'showOrders'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [BookingController::class, 'cancelOrder'])->name('orders.cancel');
    Route::post('/orders/{order}/extend', [BookingController::class, 'extendOrder'])->name('orders.extend');
    Route::post('/orders/{order}/review', [BookingController::class, 'submitReview'])->name('orders.review');
    Route::get('/orders/{order}/midtrans-token', [BookingController::class, 'getMidtransToken'])->name('orders.midtrans-token');
    Route::post('/orders/{order}/confirm-manual', [BookingController::class, 'confirmManualPayment'])->name('orders.confirm-manual');
    Route::get('/orders/{order}/qc', [QualityControlChecksController::class, 'showForm'])->name('qc.show');
    Route::post('/orders/{order}/qc', [QualityControlChecksController::class, 'store'])->name('qc.store');
});

// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // User Management
    Route::resource('users', UserController::class);

    // Product Management
    Route::resource('products', ProductController::class);

    // Order Management
    // Custom order routes must come BEFORE the resource route
    Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::get('/orders/export', [OrderController::class, 'export'])->name('orders.export');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');

    // This must come AFTER the custom routes
    Route::resource('orders', OrderController::class)->only(['index', 'show']);

    // Availability routes
    Route::get('/availability', [App\Http\Controllers\Admin\AvailabilityController::class, 'index'])->name('availability.index');
    Route::get('/availability/data', [App\Http\Controllers\Admin\AvailabilityController::class, 'getAvailability'])->name('availability.data');
    Route::post('/availability/block', [App\Http\Controllers\Admin\AvailabilityController::class, 'blockDates'])->name('availability.block');
    // Add this to your admin routes group
    Route::post('/products/{product}/set-primary-image/{image}', [ProductController::class, 'setPrimaryImage'])
        ->name('admin.products.set-primary-image');
});

require __DIR__ . '/auth.php';
