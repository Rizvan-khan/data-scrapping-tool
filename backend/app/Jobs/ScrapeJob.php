<?php

// ============================================================
// app/Jobs/ScrapeJob.php  — updated to save all model fields
// ============================================================

namespace App\Jobs;

use App\Models\ScrapeResult;
use App\Models\ScrapeSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ScrapeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;   // 5 minutes max
    public int $tries   = 2;     // 2 retries

    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function handle(): void
    {
        $session = ScrapeSession::find($this->data['session_id']);
        if (!$session) {
            Log::error('ScrapeJob: Session not found', $this->data);
            return;
        }

        $session->markProcessing();
        Log::info('ScrapeJob started', [
            'session' => $session->id,
            'keyword' => $this->data['keyword'],
        ]);

        try {
            // Call Node.js scraper
            $response = Http::timeout(280)
                ->retry(2, 3000)
                ->post(
                    config('services.scraper.url', 'http://127.0.0.1:3000') . '/scrape',
                    [
                        'keyword'  => $this->data['keyword'],
                        'location' => $this->data['location'],
                        'limit'    => $this->data['limit'] ?? 50,
                    ]
                );

            if (! $response->successful()) {
                throw new \Exception('Node scraper error: ' . $response->body());
            }

            $resultsArray = $response->json('results', []);

            if (empty($resultsArray)) {
                $session->markCompleted(0);
                Log::warning('ScrapeJob: No results', ['session' => $session->id]);
                return;
            }

            // Parse city/country from location string
            // e.g. "Karachi, Pakistan" → city=Karachi, country=Pakistan
            [$city, $country] = $this->parseLocation($this->data['location']);

            // Build records — all fields matching ScrapeResult $fillable
            $records = collect($resultsArray)->map(function ($item) use ($session, $city, $country) {
                return [
                    'user_id'          => $this->data['user_id'],
                    'scrape_session_id'=> $session->id,
                    'name'             => $item['name']          ?? 'N/A',
                    'category'         => $item['category']      ?? 'Business',
                    'email'            => $item['email']         ?? 'Not Available',
                    'phone'            => $item['phone']         ?? 'N/A',
                    'address'          => $item['address']       ?? 'N/A',
                    'city'             => $city,
                    'country'          => $country,
                    'website'          => $item['website']       ?? 'N/A',
                    'rating'           => floatval($item['rating']       ?? 0),
                    'review_count'     => intval($item['review_count']   ?? 0),
                    'working_hours'    => $item['working_hours']  ?? null,
                    'instagram'        => $item['instagram']      ?? null,
                    'facebook'         => $item['facebook']       ?? null,
                    'search_keyword'   => $this->data['keyword'],
                    'search_location'  => $this->data['location'],
                    'link'             => $item['link']           ?? null,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ];
            })->toArray();

            // Bulk insert in chunks (memory safe for large limits)
            collect($records)->chunk(200)->each(function ($chunk) {
                ScrapeResult::insert($chunk->toArray());
            });

            $session->markCompleted(count($records));

            Log::info('ScrapeJob completed', [
                'session' => $session->id,
                'saved'   => count($records),
            ]);

        } catch (\Exception $e) {
            Log::error('ScrapeJob failed', [
                'session' => $session->id ?? null,
                'error'   => $e->getMessage(),
            ]);
            $session?->markFailed($e->getMessage());
            throw $e; // Re-throw for retry
        }
    }

    // "Karachi, Pakistan" → ["Karachi", "Pakistan"]
    // "New York"         → ["New York", ""]
    private function parseLocation(string $location): array
    {
        $parts = array_map('trim', explode(',', $location, 2));
        return [
            $parts[0] ?? '',
            $parts[1] ?? '',
        ];
    }

    public function failed(\Throwable $e): void
    {
        Log::error('ScrapeJob permanently failed', [
            'session' => $this->data['session_id'] ?? null,
            'error'   => $e->getMessage(),
        ]);

        ScrapeSession::find($this->data['session_id'] ?? null)
            ?->markFailed('Permanently failed: ' . $e->getMessage());
    }
}