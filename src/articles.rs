use feed_parser::parser;
use feed_parser::feed::Feed;
use readability::extractor;
use chrono::{NaiveDateTime};

#[derive(Debug)]
pub struct ParsedEntry {
    title: String,
    url: String,
    published: NaiveDateTime
}

pub fn parse_feed_to_entries(feeds: Vec<&str>) -> Vec<ParsedEntry> {
    let parsed_feeds: Vec<Feed> =
        feeds.iter()
        .map(|url| parser::from_url(url))
        .filter(|feed| feed.is_some())
        .map(|feed| feed.unwrap())
        .collect();

    let entries: Vec<ParsedEntry> =
        parsed_feeds.iter()
        .flat_map(|feed| &feed.entries)
        .map(|entry| ParsedEntry {
            title: entry.title.as_ref().unwrap().to_owned(),
            url: entry.alternate.first().unwrap().href.to_owned(),
            published: entry.published
        })
        .collect();

    entries
}

pub fn parse_entries_content<'a>(entries: &'a Vec<ParsedEntry>) -> Vec<(&'a ParsedEntry, String)> {
    let articles: Vec<String> =
        entries.iter()
        .map(|article| extractor::scrape(&article.url))
        .filter(|result| result.is_ok())
        .map(|product| product.unwrap())
        .map(|product| product.text)
        .collect();

    let parsed_articles: Vec<(&ParsedEntry, String)> =
        entries.iter().zip(articles).collect();

    parsed_articles
}
