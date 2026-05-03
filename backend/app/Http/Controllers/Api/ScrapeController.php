<?php

// ============================================================
// app/Http/Controllers/Api/ScrapeController.php
// ============================================================

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ScrapeJob;
use App\Models\ScrapeResult;
use App\Models\ScrapeSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScrapeController extends Controller
{
    // ✅ 1. START SCRAPING — Creates session + dispatches job
    public function startScraping(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'keyword'  => 'required|string|max:100',
            'location' => 'required|string|max:100',
            'limit'    => 'required|integer|min:1|max:500',
        ]);

        // Create a tracking session
        $session = ScrapeSession::create([
            'user_id'         => auth()->id(),
            'keyword'         => $validated['keyword'],
            'location'        => $validated['location'],
            'requested_limit' => $validated['limit'],
            'status'          => 'pending',
        ]);

        // Dispatch async job
        ScrapeJob::dispatch([
            'session_id' => $session->id,
            'user_id'    => auth()->id(),
            'keyword'    => $validated['keyword'],
            'location'   => $validated['location'],
            'limit'      => $validated['limit'],
        ]);

        return response()->json([
            'status'     => true,
            'message'    => 'Scraping shuru ho gaya hai, results ready hone par /results/{session_id} se check karo',
            'session_id' => $session->id,
        ], 202);
    }

    // ✅ 2. INSTANT STATUS — Check session progress
    public function sessionStatus(int $sessionId): JsonResponse
    {
        $session = ScrapeSession::where('user_id', auth()->id())
            ->findOrFail($sessionId);

        return response()->json([
            'status' => true,
            'data'   => [
                'id'              => $session->id,
                'keyword'         => $session->keyword,
                'location'        => $session->location,
                'status'          => $session->status,
                'result_count'    => $session->result_count,
                'requested_limit' => $session->requested_limit,
                'error'           => $session->error_message,
                'started_at'      => $session->created_at,
                'completed_at'    => $session->completed_at,
            ],
        ]);
    }

   public function sessionResults(Request $request, int $sessionId): JsonResponse
{
    $session = ScrapeSession::where('user_id', auth()->id())
        ->findOrFail($sessionId);

    $results = ScrapeResult::where('scrape_session_id', $sessionId)  // ← yeh change kiya
        ->where('user_id', auth()->id())
        ->orderBy('id')
        ->paginate($request->integer('per_page', 20));

    return response()->json([
        'status'  => true,
        'session' => [
            'id'           => $session->id,
            'keyword'      => $session->keyword,
            'location'     => $session->location,
            'status'       => $session->status,
            'result_count' => $session->result_count,
            'created_at'   => $session->created_at,
        ],
        'data' => $results,
    ]);
}

    // ✅ 4. HISTORY — All past sessions (no results, just metadata)
    public function history(Request $request): JsonResponse
    {
        $sessions = ScrapeSession::forUser(auth()->id())
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => true,
            'data'   => $sessions,
        ]);
    }

    // ✅ 5. ALL RESULTS — Across all sessions (with optional filters)
    public function allResults(Request $request): JsonResponse
    {
        $query = ScrapeResult::where('user_id', auth()->id());

        // Optional filters
        if ($request->filled('keyword')) {
            $query->where('search_keyword', 'like', '%' . $request->keyword . '%');
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('has_email')) {
            $query->where('email', '!=', 'Not Available');
        }
        if ($request->filled('has_phone')) {
            $query->where('phone', '!=', 'N/A');
        }

        $results = $query->latest()->paginate($request->integer('per_page', 20));

        return response()->json([
            'status' => true,
            'data'   => $results,
        ]);
    }

    // ✅ 6. DELETE SESSION (+ its results)
    public function deleteSession(int $sessionId): JsonResponse
    {
        $session = ScrapeSession::where('user_id', auth()->id())
            ->findOrFail($sessionId);

        // Results cascade delete via DB foreign key
        $session->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Session aur uske results delete ho gaye',
        ]);
    }

    // ✅ 7. DELETE SINGLE RESULT
    public function deleteResult(int $id): JsonResponse
    {
        ScrapeResult::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail()
            ->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Result delete ho gaya',
        ]);
    }
}