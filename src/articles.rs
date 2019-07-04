use feed_parser::parser;
use readability::extractor;
use chrono::{NaiveDateTime};
use serde::{ Serialize, Deserialize };
use scraper::{Html, Selector};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ParsedEntry {
    pub title: String,
    pub url: String,
    pub published: NaiveDateTime,
    pub text: String,
    pub content: String,
    pub image: String
}

fn fetch_url_image(url: String) -> Option<String> {
    if let Ok(mut req) = reqwest::get(format!("{}", url).as_str()) {
        if let Ok(body) = req.text() {
            let html = Html::parse_document(body.as_str());
            if let Ok(selector) = Selector::parse("meta[property='og:image']") {
                if let Some(meta) = html.select(&selector).next() {
                    return Some(meta.value().attr("content").unwrap_or("").to_owned());
                }
            }
        }
    }
    None
}

pub fn parse_feed_to_entries<'a>(feeds: &'a Vec<&str>) -> impl Iterator<Item=ParsedEntry> + 'a {
    let parsed_feeds =
        feeds.iter()
        .map(|url| parser::from_url(url))
        .filter_map(std::convert::identity);

    let entries =
        parsed_feeds
        .flat_map(|feed| feed.entries)
        .map(|entry| {
            let url = entry.alternate.first().unwrap().href.to_owned();
            let image = fetch_url_image(url.to_owned()).unwrap_or("".to_owned());
            ParsedEntry {
                title: entry.title.as_ref().unwrap().to_owned(),
                url: url,
                published: entry.published,
                text: "".to_owned(),
                content: "".to_owned(),
                image: image
            }
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
