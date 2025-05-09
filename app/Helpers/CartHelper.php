<?php

namespace App\Helpers;

use App\Models\Product;
use Illuminate\Support\Carbon;

class CartHelper
{
  public static function addToCart($productId, $quantity, $startDate, $endDate, $pickupMethod, $pickupAddress = null, $userName, $email, $phoneNumber)
  {
    $product = Product::findOrFail($productId);

    if (!$product->isAvailableForDates($startDate, $endDate)) {
      throw new \Exception('Product is not available for the selected dates.');
    }

    if ($quantity > $product->stock) {
      throw new \Exception('Requested quantity exceeds available stock.');
    }

    $days = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
    $rentalCost = $product->price_per_day * $quantity * $days;

    $cart = session()->get('cart', []);

    $cart[$productId] = [
      'product_id' => $productId,
      'quantity' => $quantity,
      'start_date' => $startDate,
      'end_date' => $endDate,
      'pickup_method' => $pickupMethod,
      'pickup_address' => $pickupAddress,
      'rental_cost' => $rentalCost,
      'user_name' => $userName,
      'email' => $email,
      'phone_number' => $phoneNumber
    ];

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
          'user_name' => $item['user_name'],
          'email' => $item['email'],
          'phone_number' => $item['phone_number']
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
