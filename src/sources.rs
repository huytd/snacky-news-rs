pub const ID_VIETNAMESE: usize = 0;
pub const ID_FINANCIAL: usize  = 1;
pub const ID_OTHER: usize      = 2;

fn sources_vietnamese() -> Vec<&'static str> {
    vec![
        // Vietnamese
        "https://tuoitre.vn/rss/tin-moi-nhat.rss",
        "https://tinhte.vn/rss",
        "https://www.thesaigontimes.vn/rssview/tinnoibat/",
        "https://www.thesaigontimes.vn/rssview/moicapnhat/"
    ]
}

fn sources_financial() -> Vec<&'static str> {
    vec![
        // Investing, Economics and Financial
        "http://feeds.marketwatch.com/marketwatch/topstories/",
        "https://www.investing.com/rss/news.rss",
        "https://www.cnbc.com/id/100003114/device/rss/rss.html",
        "https://www.cnbc.com/id/10000664/device/rss/rss.html",
        "https://www.cnbc.com/id/10000115/device/rss/rss.html",
        "https://www.cnbc.com/id/15839069/device/rss/rss.html",
        "http://feeds.reuters.com/reuters/businessNews"
    ]
}

fn sources_other() -> Vec<&'static str> {
    vec![
        // Other News
        "https://www.theonion.com/rss",
        "http://feeds.reuters.com/reuters/topNews",
        "http://feeds.reuters.com/Reuters/domesticNews",
        "http://feeds.reuters.com/Reuters/worldNews"
    ]
}

pub fn get_source_by_id(id: usize) -> Vec<&'static str> {
    match id {
        ID_VIETNAMESE => sources_vietnamese(),
        ID_FINANCIAL => sources_financial(),
        ID_OTHER => sources_other(),
        _ => vec![]
    }
}

pub fn get_sources_from_range(range: std::ops::Range<usize>) -> Vec<&'static str> {
    range.map(|id| get_source_by_id(id)).flatten().collect()
}

pub fn get_sources_from_list(array: &[usize]) -> Vec<&'static str> {
    array.iter().map(|id| get_source_by_id(*id)).flatten().collect()
}

pub fn get_domains_from_sources(sources: Vec<&'static str>) -> Vec<&'static str> {
    let mut domains: Vec<&'static str> = sources
    .iter()
    .map(|s| {
        let parts: Vec<&'static str> = s.split("/").collect();
        parts[2]
    })
    .collect();
    domains.dedup();
    domains
}

#[cfg(test)]
mod test {
    use sources::*;

    #[test]
    fn test_get_domains_by_category() {
        let vietnamese = get_domains_from_sources(get_source_by_id(ID_VIETNAMESE));
        assert_eq!(&vietnamese, &["tuoitre.vn", "tinhte.vn"])
    }

    #[test]
    fn test_get_domains_strip_duplicates() {
        let others = get_domains_from_sources(get_source_by_id(ID_OTHER));
        assert_eq!(&others, &["www.theonion.com", "www.reddit.com", "feeds.reuters.com"])
    }

    #[test]
    fn test_get_domains_from_multiple_source() {
        let domains = get_domains_from_sources(get_sources_from_list(&[ID_OTHER, ID_VIETNAMESE]));
        assert_eq!(&domains, &["www.theonion.com", "www.reddit.com", "feeds.reuters.com", "tuoitre.vn", "tinhte.vn"])
    }
}
