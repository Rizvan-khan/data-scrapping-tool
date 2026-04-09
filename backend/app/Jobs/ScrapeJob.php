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
        $response = Http::post('http://localhost:3000/scrape', [
            'keyword' => $this->data['keyword'],
            'location' => $this->data['location']
        ]);

        $result = $response->json();

        // 🔥 Check kar data aa raha hai ya nahi
        if (!isset($result['results'])) {
            \Log::error('Scraper failed: No results', $result);
            return;
        }

        foreach ($result['results'] as $item) {
            ScrapeResult::create([
                'user_id' => $this->data['user_id'],
                'title' => $item['business_info']['title'],
                'category' => $item['business_info']['category'],
                'rating' => $item['metrics']['rating'],
                'phone' => $item['contact_details']['phone'],
                'address' => $item['contact_details']['address'],
                'link' => $item['business_info']['link'],
                 'search_keyword' => $this->data['keyword'],   // ✅ add
        'search_location' => $this->data['location'],
            ]);
        }

    } catch (\Exception $e) {
        \Log::error('ScrapeJob Error: ' . $e->getMessage());
    }
       
}

}