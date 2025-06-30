<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItems extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'rental_cost',
        'pickup_method',
        'pickup_time',
        'return_time',
        'address'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'rental_cost' => 'decimal:2',
        'pickup_time' => 'datetime:H:i',
        'return_time' => 'datetime:H:i',
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
