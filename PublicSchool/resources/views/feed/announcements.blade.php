@php
echo '<?xml version="1.0" encoding="UTF-8"?>';
@endphp

<rss version="2.0">
    <channel>
        <title>PublicSchool Announcements</title>
        <link>{{ $link }}</link>
        <description>Latest published announcements</description>
        <lastBuildDate>{{ $now->toRssString() }}</lastBuildDate>
        @foreach ($items as $item)
            <item>
                <title><![CDATA[{{ $item->title }}]]></title>
                <link>{{ url('/announcements/' . $item->id) }}</link>
                <guid isPermaLink="false">announcement-{{ $item->id }}</guid>
                @if($item->published_at)
                    <pubDate>{{ $item->published_at->toRssString() }}</pubDate>
                @endif
                <description><![CDATA[{{ \Illuminate\Support\Str::limit($item->body, 300) }}]]></description>
            </item>
        @endforeach
    </channel>
</rss>
