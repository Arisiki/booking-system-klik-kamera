<?php

namespace App\Helpers;

use App\Models\Product;
use Illuminate\Support\Carbon;

class CartHelper
{
    public static function addToCart($productId, $quantity, $startDate, $endDate, $pickupMethod, $pickupAddress, $userName, $email, $phoneNumber)
    {
        $product = Product::findOrFail($productId);
        
        // Hitung rental cost dengan logika diskon per hari yang benar
        $rentalCalculation = $product->calculateRentalCost($startDate, $endDate, $quantity);
        $rentalCost = $rentalCalculation['total_cost'];
    
        $cartItem = [
            'product_id' => $productId,
            'product' => $product,
            'quantity' => $quantity,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'pickup_method' => $pickupMethod,
            'pickup_address' => $pickupAddress,
            'user_name' => $userName,
            'email' => $email,
            'phone_number' => $phoneNumber,
            'rental_cost' => $rentalCost,
            'price_breakdown' => $rentalCalculation['breakdown'] // Opsional: untuk transparansi
        ];
    
        session()->put("cart.{$productId}", $cartItem);
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
        // session()->forget('cart');
    }

    public static function calculateItemTotal($item)
    {
        $product = Product::find($item['product_id']);
        if (!$product) return 0;
        
        $rentalCalculation = $product->calculateRentalCost(
            $item['start_date'],
            $item['end_date'],
            $item['quantity']
        );
        
        return $rentalCalculation['total_cost'];
    }
}
