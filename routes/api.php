<?php

use App\Http\Controllers\BookingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/midtrans/notification', [BookingController::class, 'handleMidtransNotification']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
