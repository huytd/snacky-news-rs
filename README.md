# Snacky News

![](screenshot.gif)

## How to run on your local machine

First, build the UI app:

```
cd static
yarn install
yarn build
```

Then compile and run the server:
```
cd .. # go back to the project's root folder
cargo r
```

## The UI

The UI built with React and TailwindCSS, the source are sitting in `./static` folder.

If you aren't happy with the built-in UI, blame [the guy who designed it](https://github.com/dvkndn/), or just build a new one yourself.

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

Sample return data:

```
{
  "articles": [
    {
      "content": "...<html data>...",
      "published": "2019-07-02T01:30:29.896221",
      "text": "Thuốc trừ cỏ gốc Paraquat được giới thiệu trên website annong.com.vn chiều 1-7 - Ảnh: QUANG ĐỊNHĐiều này không chỉ gây bức xúc trong cộng đồng doanh nghiệp vì đối xử thiên vị mà còn đi ngược lại những tuyên bố về sản xuất nông nghiệp sạch mà Bộ NN&PTNT tuyên bố trước đó khi cấm hàng loạt thuốc trừ cỏ độc hại.Công khai bán chất cấmNgày 8-2-2017, Bộ trưởng Bộ NN&PTNT Nguyễn Xuân Cường đã ký ban hành quyết định số 278/QĐ-BNN-BVTV về việc loại bỏ thuốc bảo vệ thực vật (BVTV) chứa hoạt chất 2,4D và Paraquat ra khỏi danh mục thuốc BVTV được phép sử dụng tại VN.Quyết định này căn cứ trên các bằng chứng khoa học về thuốc BVTV gây ảnh hưởng xấu đến sức khỏe con người, vật nuôi, hệ sinh thái, môi trường... <full text>",
      "title": "'Công văn đặc biệt' của Bộ Nông nghiệp với một doanh nghiệp",
      "url": "https://tuoitre.vn/cong-van-dac-biet-cua-bo-nong-nghiep-voi-mot-doanh-nghiep-2019070207524595.htm"
    },
    ...
  ]
}
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