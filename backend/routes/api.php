<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\Api\ScrapeController;
use App\Http\Controllers\Api\AuthController;

// Route::post('/register', [AuthController::class, 'register']);
// Route::post('/login', [AuthController::class, 'login']);

// // Protected route
// Route::middleware('auth:sanctum')->group(function () {
//     Route::post('/logout', [AuthController::class, 'logout']);

//     Route::get('/profile', function (Request $request) {
//         return $request->user();
//     });


// Route::post('/scrape', [ScrapeController::class, 'startScraping']);
    
//     Route::get('/results', [ScrapeController::class, 'getResults']);
    
//     Route::delete('/results/{id}', [ScrapeController::class, 'deleteResult']);

// });

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


use App\Http\Controllers\Api\UserController;

// ─────────────────────────────────────────────
// PUBLIC ROUTES — No auth needed
// ─────────────────────────────────────────────
// Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
// });

// ─────────────────────────────────────────────
// PROTECTED ROUTES — Sanctum token required
// ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout',     [AuthController::class, 'logout']);
        Route::post('logout-all', [AuthController::class, 'logoutAll']);
        Route::get('me',          [AuthController::class, 'me']);
    });

    // User Profile
    Route::prefix('user')->group(function () {
        Route::get('profile',           [UserController::class, 'getProfile']);
        Route::put('profile',           [UserController::class, 'updateProfile']);
        Route::post('change-password',  [UserController::class, 'changePassword']);
        Route::post('avatar',           [UserController::class, 'updateAvatar']);
        Route::delete('avatar',         [UserController::class, 'deleteAvatar']);
        Route::get('sessions',          [UserController::class, 'getSessions']);
        Route::delete('sessions/{id}',  [UserController::class, 'revokeSession']);
        Route::delete('sessions',       [UserController::class, 'revokeAllSessions']);
    });

    // Scraper (existing — untouched)
    Route::prefix('scrape')->group(function () {
        Route::post('/',         [ScrapeController::class, 'startScraping']);
        Route::get('/results',   [ScrapeController::class, 'getResults']);
        Route::delete('/results/{id}', [ScrapeController::class, 'deleteResult']);
    });

});




