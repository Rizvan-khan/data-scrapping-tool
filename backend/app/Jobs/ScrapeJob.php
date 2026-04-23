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

            $response = Http::timeout(180)
                ->post('http://127.0.0.1:3000/scrape', [
                    'keyword' => $this->data['keyword'],
                    'location' => $this->data['location'],
                    'limit' => $this->data['limit'] ?? 50
                ]);

            if (!$response->successful()) {
                \Log::error('❌ API Failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return;
            }

            $result = $response->json();

            \Log::info('✅ Data received', ['count' => count($result['results'] ?? [])]);

            if (!isset($result['results']) || empty($result['results'])) {
                \Log::error('❌ No results found', $result);
                return;
            }

            foreach ($result['results'] as $item) {
                ScrapeResult::create([
                    'user_id' => $this->data['user_id'],
                    'title' => $item['business_info']['title'] ?? null,
                    'category' => $item['business_info']['category'] ?? null,
                    'rating' => $item['metrics']['rating'] ?? null,
                    'phone' => $item['contact_details']['phone'] ?? null,
                    'address' => $item['contact_details']['address'] ?? null,
                    'link' => $item['business_info']['link'] ?? null,
                    'search_keyword' => $this->data['keyword'],
                    'search_location' => $this->data['location'],
                ]);
            }

            \Log::info('🔥 Scrape Job Completed');
        } catch (\Exception $e) {
            \Log::error('💣 ScrapeJob Error: ' . $e->getMessage());
        }
    }
}
