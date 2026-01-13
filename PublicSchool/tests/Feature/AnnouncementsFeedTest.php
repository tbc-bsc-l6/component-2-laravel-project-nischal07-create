<?php

namespace Tests\Feature;

use App\Models\Announcement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementsFeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_feed_returns_rss_xml(): void
    {
        $announcement = Announcement::factory()->create([
            'title' => 'Feed Title',
            'body' => 'Feed body content',
            'published_at' => now()->subHour(),
        ]);

        $response = $this->get('/feed/announcements');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
        $response->assertSee('Feed Title');
        $response->assertSee('rss');
    }
}
