<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItems extends Model
{
    /** @use HasFactory<\Database\Factories\OrderItemsFactory> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quality',
        'rental_cost'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'rental_cost' => 'decimal:2'
    ];

    //relations
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
