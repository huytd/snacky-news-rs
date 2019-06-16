extern crate feed_parser;
extern crate readability;

use feed_parser::parser;
use feed_parser::feed::Feed;
use feed_parser::entry::Entry;
use readability::extractor;
use chrono::{NaiveDateTime};

#[derive(Debug)]
struct ParsedEntry {
    title: String,
    url: String,
    published: NaiveDateTime
}

fn main() {
    let feed_vietnamese = vec![
        // Vietnamese
        "https://tuoitre.vn/rss/tin-moi-nhat.rss",
        "https://tinhte.vn/rss",
        "https://www.voatiengviet.com/api/zkvypemovm",
        "https://www.voatiengviet.com/api/z$uyietpv_",
        "https://www.voatiengviet.com/api/zruyyeuivt",
        "https://www.voatiengviet.com/api/z_ty_erivy"
    ];

    let feed_financial = vec![
        // Investing, Economics and Financial
        "http://feeds.marketwatch.com/marketwatch/topstories/",
        "https://www.investing.com/rss/news.rss",
        "https://www.cnbc.com/id/100003114/device/rss/rss.html",
        "https://www.cnbc.com/id/10000664/device/rss/rss.html",
        "https://www.cnbc.com/id/10000115/device/rss/rss.html",
        "https://www.cnbc.com/id/15839069/device/rss/rss.html",
        "http://feeds.reuters.com/reuters/businessNews"
    ];

    let feed_tech = vec![
        // Technology
        "https://www.reddit.com/r/Technologies+elm+haskell+emacs+javascript+programming+rust.rss",
        "http://feeds.feedburner.com/TechCrunch/",
        "https://news.ycombinator.com/rss",
        "http://feeds.arstechnica.com/arstechnica/index",
        "https://www.theverge.com/rss/index.xml",
        "https://live.engadget.com/rss.xml",
        "https://www.wired.com/feed/rss",
        "https://thenextweb.com/feed/"
    ];

    let feed_other = vec![
        // Other News
        "https://www.theonion.com/rss",
        "https://www.reddit.com/r/UpliftingNews+worldnews.rss",
        "http://feeds.reuters.com/reuters/topNews",
        "http://feeds.reuters.com/Reuters/domesticNews",
        "http://feeds.reuters.com/Reuters/worldNews"
    ];

    let feed_test = vec![
        // Vietnamese
        "https://tuoitre.vn/rss/tin-moi-nhat.rss"
    ];
    
    let _feeds = [feed_vietnamese, feed_financial, feed_tech, feed_other].concat();
    let parsed_feeds: Vec<Feed> =
        feed_test.iter()
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
    
    let articles: Vec<String> =
        entries.iter()
        .map(|article| extractor::scrape(&article.url))
        .filter(|result| result.is_ok())
        .map(|product| product.unwrap())
        .map(|product| product.text)
        .collect();

    let parsed_articles: Vec<(&ParsedEntry, String)> =
        entries.iter().zip(articles).collect();

    println!("{:?}", parsed_articles);
}
