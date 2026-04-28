<?php

// app/Jobs/ScrapeJob.php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\ScrapeResult;

class ScrapeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

   public function handle()
{
    try {
        \Log::info('🔥 Scrape Job Started');

        $response = Http::timeout(240)->post('http://127.0.0.1:3000/scrape', [
            'keyword' => $this->data['keyword'],
            'location' => $this->data['location'],
            'limit' => $this->data['limit'] ?? 50
        ]);

        if (!$response->successful()) {
            \Log::error('❌ Node API Failed', ['body' => $response->body()]);
            return;
        }

        $result = $response->json();
        $resultsArray = $result['results'] ?? [];

        \Log::info('✅ Data received', ['count' => count($resultsArray)]);

        if (empty($resultsArray)) {
            \Log::warning('⚠️ No results to save');
            return;
        }

        foreach ($resultsArray as $item) {
            // Yahan keys wahi honi chahiye jo Node.js bhej raha hai
            ScrapeResult::create([
                'user_id'         => $this->data['user_id'],
                'name'           => $item['name'] ?? 'N/A', // 'name' ki jagah 'title'
                'email'           => $item['email'] ?? 'Not Available',
                'phone'           => $item['phone'] ?? 'N/A',
                'address'         => $item['address'] ?? 'N/A',
                'city'            => $item['city'] ?? '',
                'country'         => $item['country'] ?? '',
                'website'         => $item['website'] ?? 'N/A',
                'category'        => $item['category'] ?? 'Business',
                'rating'          => $item['rating'] ?? '0',
                'review_count'    => $item['review_count'] ?? 0,
                'search_keyword'  => $this->data['keyword'],
            ]);
        }

        \Log::info('🔥 Scrape Job Completed Successfully');

    } catch (\Exception $e) {
        \Log::error('💣 ScrapeJob Error: ' . $e->getMessage());
    }
}
}
