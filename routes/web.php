<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
});

Route::get('/products', [ProductsController::class, 'index'])->name('products.index');
Route::get('/products/cameras', [ProductsController::class, 'showCameras'])->name('product.camera');
Route::get('/products/accecories', [ProductsController::class, 'showAccecories'])->name('product.accecories');
Route::get('/products/{product}', [ProductsController::class, 'show'])->name('products.show');


Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::middleware('auth')->group(function () {
    Route::get('/cart', [BookingController::class, 'showCart'])->name('cart.show');
    Route::post('/products/{product}/add-to-cart', [BookingController::class, 'addToCart'])->name('cart.add');
    Route::post('/products/{product}/book-now', [BookingController::class, 'bookNow'])->name('book.now');
    Route::post('/checkout', [BookingController::class, 'checkout'])->name('checkout');
    Route::get('/checkout/{order}', [BookingController::class, 'showCheckout'])->name('checkout.show');
    Route::get('/products/{product}/check-availability', [BookingController::class, 'checkAvailability'])->name('products.checkAvailability');
});
require __DIR__ . '/auth.php';
