use feed_parser::parser;
use readability::extractor;
use chrono::{NaiveDateTime};
use serde::{ Serialize, Deserialize };

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ParsedEntry {
    pub title: String,
    pub url: String,
    pub published: NaiveDateTime,
    pub text: String,
    pub content: String
}

pub fn parse_feed_to_entries<'a>(feeds: &'a Vec<&str>) -> impl Iterator<Item=ParsedEntry> + 'a {
    let parsed_feeds =
        feeds.iter()
        .map(|url| parser::from_url(url))
        .filter_map(std::convert::identity);

    let entries =
        parsed_feeds
        .flat_map(|feed| feed.entries)
        .map(|entry| ParsedEntry {
            title: entry.title.as_ref().unwrap().to_owned(),
            url: entry.alternate.first().unwrap().href.to_owned(),
            published: entry.published,
            text: "".to_owned(),
            content: "".to_owned()
        });

    entries
}

pub fn fetch_entry_content(entry: ParsedEntry) -> Result<ParsedEntry, readability::error::Error> {
    let scraped_data = extractor::scrape(&entry.url)?;
    Ok(ParsedEntry {
        text: scraped_data.text.to_owned(),
        content: scraped_data.content.to_owned(),
        ..entry
    })
}
