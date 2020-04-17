extern crate reqwest;
extern crate scraper;
extern crate feed_parser;
extern crate readability;
extern crate actix_web;
extern crate actix_files;
extern crate serde;
#[macro_use]
extern crate serde_json;
extern crate chrono;

use std::time::Duration;
use std::sync::{Arc, RwLock};
use actix_web::{
    web, App, HttpResponse, HttpServer,
};
use actix_files as fs;

mod articles;
mod sources;

// Run every 30 min
const FETCH_INTERVAL: u64 = 30 * 60u64;

#[derive(serde::Deserialize)]
struct ArticleParams {
    topic: String
}

fn main() -> std::io::Result<()> {

    let feeds = sources::get_sources_from_range(sources::ID_VIETNAMESE..sources::ID_OTHER);

    let articles_data: Vec<articles::ParsedEntry> = vec![];
    let mutex = std::sync::RwLock::new(articles_data);
    let arc = std::sync::Arc::new(mutex);

    let write_arc = arc.clone();
    std::thread::spawn(move || {
        loop {
            println!("Reseting data entries...");
            {
                let mut guard = write_arc.write().unwrap();
                (*guard).clear();
            }
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

    let port = std::env::var("PORT").unwrap_or("3366".to_owned()).parse::<u16>().unwrap_or(3366);

    HttpServer::new(move || {
        App::new()
            .register_data(web_data.clone())
            .service(web::resource("/api/articles/{topic}").route(web::get().to(|state: web::Data<Arc<RwLock<Vec<articles::ParsedEntry>>>>, params: web::Path<ArticleParams>| -> HttpResponse {
                let sources = match params.topic.as_str() {
                    "vietnamese" => sources::get_sources_from_list(&[sources::ID_VIETNAMESE]),
                    "financial" => sources::get_sources_from_list(&[sources::ID_FINANCIAL]),
                    "technical" => sources::get_sources_from_list(&[sources::ID_TECHNICAL]),
                    "other" => sources::get_sources_from_list(&[sources::ID_OTHER]),
                    _ => sources::get_sources_from_range(sources::ID_VIETNAMESE..sources::ID_OTHER)
                };
                let domains = sources::get_domains_from_sources(sources);
                let data = state.read().unwrap();
                let articles: Vec<_> = data.iter().cloned().collect();

                // TODO: pagination, maybe?
                HttpResponse::Ok().json(json!({
                    "articles": articles
                                .into_iter()
                                .filter(|e: &articles::ParsedEntry| domains.iter().any(|url| e.url.contains(url)))
                                .collect::<Vec<_>>()
                }))
            })))
            .service(fs::Files::new("/", "./static/dist/").index_file("index.html"))
    })
    .bind(("0.0.0.0", port))?
    .run()
}
