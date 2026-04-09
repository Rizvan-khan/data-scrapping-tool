<?php 

// app/Http/Controllers/Api/ScrapeController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Jobs\ScrapeJob;
use App\Models\ScrapeResult;
use Illuminate\Support\Facades\Http;

class ScrapeController extends Controller
{
    // 🚀 Start Scraping
    public function startScraping(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string',
            'location' => 'required|string',
            'limit' => 'required|integer|min:1|max:500'
        ]);

        ScrapeJob::dispatch([
            'user_id' => auth()->id(),
            'keyword' => $request->keyword,
            'location' => $request->location,
            'limit' => $request->limit
        ]);

    //       $response = Http::post('http://localhost:3000/scrape', [
    //     'keyword' => $request->keyword,
    //     'location' => $request->location
    // ]);

        //  $data = $response->json();

    // 🔥 DEBUG (pehle check kar)
    // dd($data);

//     foreach ($data['results'] as $item) {
//     ScrapeResult::create([
//         'user_id' => auth()->id(),
//         'title' => $item['business_info']['title'],
//         'category' => $item['business_info']['category'],
//         'rating' => $item['metrics']['rating'],
//         'phone' => $item['contact_details']['phone'],
//         'address' => $item['contact_details']['address'],
//         'link' => $item['business_info']['link'],
//     ]);
// }

    return response()->json([
        'status' => true,
        'message' => "scrapper is running"
    ]);

        
    }

    // 📊 Get Results (User-wise + Pagination)
    public function getResults(Request $request)
    {
        $data = ScrapeResult::where('user_id', auth()->id())
            ->latest()
            ->paginate(20);

        return response()->json([
            'status' => true,
            'data' => $data
        ]);
    }

    // ❌ Delete Result
    public function deleteResult($id)
    {
        $result = ScrapeResult::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        $result->delete();

        return response()->json([
            'status' => true,
            'message' => 'Deleted successfully'
        ]);
    }
}