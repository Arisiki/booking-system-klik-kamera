<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    /** @use HasFactory<\Database\Factories\TransactionsFactory> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'type',
        'condition',
        'is_damaged',
        'checked_at',
        'amount',
        'payment_method',
        'transaction_date'
    ];

    protected $casts = [
        'type' => 'string',
        'condition' => 'string',
        'is_damaged' => 'boolean',
        'checked_at' => 'datetime',
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
