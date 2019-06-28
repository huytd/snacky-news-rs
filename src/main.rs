extern crate crossbeam;
extern crate feed_parser;
extern crate readability;
extern crate actix_web;
extern crate serde;
#[macro_use]
extern crate serde_json;
extern crate chrono;

use std::time::Duration;
use std::sync::{Arc, RwLock};
use actix_web::{
    web, App, HttpRequest, HttpResponse, HttpServer,
};

mod articles;

// Run every 30 min
const FETCH_INTERVAL: u64 = 30 * 60u64;

fn main() -> std::io::Result<()> {
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
    
    let feeds = [feed_vietnamese, feed_financial, feed_tech, feed_other].concat();

    let articles_data: Vec<articles::ParsedEntry> = vec![];
    let mutex = std::sync::RwLock::new(articles_data);
    let arc = std::sync::Arc::new(mutex);

    let write_arc = arc.clone();
    std::thread::spawn(move || {
        loop {
            println!("Collecting data...");
            articles::parse_feed_to_entries(&feeds)
                .for_each(|e| {
                    let entry = articles::fetch_entry_content(e);
                    if entry.is_ok() {
                        let okentry = entry.unwrap();
                        let mut guard = write_arc.write().unwrap();
                        (*guard).push(okentry);
                    }
                });
            println!("Saved all data!");
            std::thread::sleep(Duration::from_secs(FETCH_INTERVAL));
        }
    });

    let web_data = web::Data::new(arc.clone());
    
    std::env::set_var("RUST_LOG", "actix_server=info,actix_web=info");
    env_logger::init();
    
    HttpServer::new(move || {
        App::new()
            .register_data(web_data.clone())
            .service(web::resource("/api/articles").route(web::get().to(|state: web::Data<Arc<RwLock<Vec<articles::ParsedEntry>>>>, _req: HttpRequest| -> HttpResponse {
                let data = state.read().unwrap();
                HttpResponse::Ok().json(json!({ "articles": (*data) }))
            })))
    })
    .bind("127.0.0.1:3366")?
    .run()
}
