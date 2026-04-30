<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\Api\ScrapeController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WebhookController;
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

// Razorpay Webhook — public (no auth, Razorpay se aata hai)
Route::post('webhooks/razorpay', [WebhookController::class, 'razorpay']);


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


    // Plans — public (anyone can view)
Route::prefix('plans')->group(function () {
    Route::get('/',        [PlanController::class, 'index']);   // GET /api/plans
    Route::get('/{slug}',  [PlanController::class, 'show']);    // GET /api/plans/pro-monthly
});


 // Subscriptions
    Route::prefix('subscriptions')->group(function () {
        Route::post('create-order',    [SubscriptionController::class, 'createOrder']);
        Route::post('verify-payment',  [SubscriptionController::class, 'verifyPayment']);
        Route::get('current',          [SubscriptionController::class, 'current']);
        Route::post('cancel',          [SubscriptionController::class, 'cancel']);
        Route::get('invoices',         [SubscriptionController::class, 'invoices']);
    });


  Route::middleware('admin')->prefix('admin')->group(function () {
        Route::post('plans', [PlanController::class, 'store']); // POST /api/admin/plans
    });

});




