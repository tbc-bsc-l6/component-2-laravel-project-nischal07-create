<?php

namespace Tests\Unit;

use App\Models\Announcement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementScopesTest extends TestCase
{
    use RefreshDatabase;

    public function test_published_scope_excludes_future_or_null_dates(): void
    {
        $past = Announcement::factory()->create(['published_at' => now()->subDay()]);
        $future = Announcement::factory()->create(['published_at' => now()->addDay()]);
        $draft = Announcement::factory()->create(['published_at' => null]);

        $results = Announcement::published()->pluck('id');

        $this->assertTrue($results->contains($past->id));
        $this->assertFalse($results->contains($future->id));
        $this->assertFalse($results->contains($draft->id));
    }

    public function test_search_scope_matches_title_and_body(): void
    {
        $match = Announcement::factory()->create(['title' => 'Holiday Break Notice']);
        $bodyMatch = Announcement::factory()->create(['body' => 'This contains cafeteria update keyword.']);
        Announcement::factory()->create(['title' => 'Unrelated']);

        $results = Announcement::search('update')->pluck('id');

        $this->assertTrue($results->contains($bodyMatch->id));
        $this->assertFalse($results->contains($match->id));

        $titleResults = Announcement::search('Holiday')->pluck('id');
        $this->assertTrue($titleResults->contains($match->id));
    }
}
