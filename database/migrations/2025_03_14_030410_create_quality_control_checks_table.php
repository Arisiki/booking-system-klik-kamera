<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateQualityControlChecksTable extends Migration
{
    public function up()
    {
        Schema::create('quality_control_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('category')->nullable();
            $table->foreignId('checked_by')->nullable()->constrained('users')->onDelete('cascade');
            $table->dateTime('checked_at');
            $table->json('results')->nullable();
            $table->enum('type', ['receipt', 'return', 'admin_return']);
            $table->enum('status', ['Layak Digunakan', 'Perlu Perbaikan', 'Tidak Layak'])->nullable();
            $table->string('condition');
            $table->boolean('is_damaged');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('quality_control_checks');
    }
}
