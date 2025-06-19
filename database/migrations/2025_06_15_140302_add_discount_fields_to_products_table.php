<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('discount_percentage', 5, 2)->default(0)->after('price_per_day');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('discount_percentage');
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage')->after('discount_amount');
            $table->boolean('is_on_sale', false)->default(false)->after('discount_type');
            $table->timestamp('discount_start_date')->nullable()->after('is_on_sale');
            $table->timestamp('discount_end_date')->nullable()->after('discount_start_date');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'discount_percentage',
                'discount_amount', 
                'discount_type',
                'is_on_sale',
                'discount_start_date',
                'discount_end_date'
            ]);
        });
    }
};