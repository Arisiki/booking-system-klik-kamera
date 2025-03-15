<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QualityControlChecks extends Model
{
    /** @use HasFactory<\Database\Factories\QualityControlChecksFactory> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'type',
        'condition',
        'is_damaged',
        'checked_at',
    ];

    protected $casts = [
        'type' => 'string', // ENUM('receipt', 'return', 'admin_return')
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
