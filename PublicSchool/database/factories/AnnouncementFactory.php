<?php

namespace Database\Factories;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    public function definition(): array
    {
        $published = $this->faker->boolean(80);
        return [
            'title' => $this->faker->sentence(6),
            'body' => $this->faker->paragraphs(3, true),
            'published_at' => $published ? $this->faker->dateTimeBetween('-30 days', '+1 day') : null,
            'is_pinned' => $this->faker->boolean(10),
            'user_id' => User::query()->inRandomOrder()->value('id'),
        ];
    }
}
