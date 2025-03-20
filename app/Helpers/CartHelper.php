<?php

namespace App\Helpers;

use App\Models\Product;
use Illuminate\Support\Carbon;

class CartHelper
{
  public static function addToCart($productId, $quantity, $startDate, $endDate, $pickupMethod, $pickupAddress = null)
  {
    $product = Product::findOrFail($productId);

    // Validasi ketersediaan
    if (!$product->isAvailableForDates($startDate, $endDate)) {
      throw new \Exception('Product is not available for the selected dates.');
    }

    if ($quantity > $product->stock) {
      throw new \Exception('Requested quantity exceeds available stock.');
    }

    // Hitung rental cost
    $days = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
    $rentalCost = $product->price_per_day * $quantity * $days;

    // Ambil cart dari session
    $cart = session()->get('cart', []);

    // Tambah atau update item di cart
    $cart[$productId] = [
      'product_id' => $productId,
      'quantity' => $quantity,
      'start_date' => $startDate,
      'end_date' => $endDate,
      'pickup_method' => $pickupMethod,
      'pickup_address' => $pickupAddress,
      'rental_cost' => $rentalCost,
    ];

    // Simpan kembali ke session
    session()->put('cart', $cart);

    return true;
  }

  public static function getCart()
  {
    $cart = session()->get('cart', []);
    $items = [];

    foreach ($cart as $item) {
      $product = Product::find($item['product_id']);
      if ($product) {
        $items[] = [
          'product' => $product,
          'quantity' => $item['quantity'],
          'start_date' => $item['start_date'],
          'end_date' => $item['end_date'],
          'pickup_method' => $item['pickup_method'],
          'pickup_address' => $item['pickup_address'] ?? null,
          'rental_cost' => $item['rental_cost'],
        ];
      }
    }

    return $items;
  }

  public static function clearCart()
  {
    session()->forget('cart');
  }
}
