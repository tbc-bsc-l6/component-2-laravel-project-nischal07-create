<?php

namespace Tests\Feature;

use App\Models\Announcement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_returns_published_announcements(): void
    {
        $published = Announcement::factory()->create(['published_at' => now()->subHour()]);
        $future = Announcement::factory()->create(['published_at' => now()->addDay()]);

        $this->getJson('/api/announcements')
            ->assertOk()
            ->assertJsonFragment(['id' => $published->id])
            ->assertJsonMissing(['id' => $future->id]);
    }

    public function test_api_applies_search_and_limit(): void
    {
        $match = Announcement::factory()->create(['title' => 'Cafeteria Menu', 'published_at' => now()]);
        Announcement::factory()->count(30)->create(['published_at' => now()]);

        $response = $this->getJson('/api/announcements?q=cafeteria&limit=5')
            ->assertOk()
            ->assertJsonCount(5, 'data');

        $this->assertTrue(collect($response->json('data'))->pluck('id')->contains($match->id));
    }
}
