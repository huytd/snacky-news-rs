FROM rust:latest as build
RUN apt-get update && apt-get -y install ca-certificates libssl-dev
COPY ./ ./
RUN mkdir -p /build-out/static/dist
RUN cargo build --release
RUN ls target/release/
RUN cp target/release/rss-reader-rs /build-out/
RUN cp static/dist/*.* /build-out/static/dist/
CMD ["/build-out/rss-reader-rs"]
