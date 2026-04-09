<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\Api\ScrapeController;
use App\Http\Controllers\Api\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected route
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/profile', function (Request $request) {
        return $request->user();
    });


Route::post('/scrape', [ScrapeController::class, 'startScraping']);
    
    Route::get('/results', [ScrapeController::class, 'getResults']);
    
    Route::delete('/results/{id}', [ScrapeController::class, 'deleteResult']);

});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


