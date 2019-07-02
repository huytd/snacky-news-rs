# Snacky News API

## The API

Calling this endpoint to get the article data:

```
GET /api/articles/{topic}

topic = vietnamese | financial | technical | other | everything (or) all
```

For example:

```
GET /api/articles/all
GET /api/articles/vietnamese
GET /api/articles/financial
```

## How it works?

There are two threads on the server, one is for serving the web API, and another one is for fetching the news data, that run every 30 minutes.

The two thread shared the same piece of data `articles_data: Vec<articles::ParsedEntry>`.

When the data is empty, the API will return an empty array, and continue to fill it up as the articles coming, so, in frontend code, this case need to be handled.

For example:

```
+  // Fetching Thread Started
|
v
+ // User requested, no data yet, hence, articles = []
|
|
v
+ // 5 entries fetched
|
v
+ // User requested, articles = [ { 5 items } ]
|
|
v
+ // more data coming
|
:
```