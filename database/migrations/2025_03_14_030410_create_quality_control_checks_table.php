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
            $table->string('category'); // Kolom category harus ada
            $table->foreignId('checked_by')->constrained('users')->onDelete('cascade');
            $table->dateTime('check_date');
            $table->json('results');
            $table->enum('status', ['Layak Digunakan', 'Perlu Perbaikan', 'Tidak Layak']);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('quality_control_checks');
    }
}
