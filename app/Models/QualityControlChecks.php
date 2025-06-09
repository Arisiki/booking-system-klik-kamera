<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QualityControlChecks extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'category',
        'checked_by',
        'checked_at',
        'results',
        'status',
        'notes',
        'condition',
    ];

    protected $casts = [
        'results' => 'array',
        'checked_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function checkedBy()
    {
        return $this->belongsTo(User::class, 'checked_by');
    }
}
