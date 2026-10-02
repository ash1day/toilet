トイレ危険地帯
=================
本アプリはLOD Challenge2013 ビジュアライゼーション部門への応募作品です。

作品URL
-----------------
[https://ash1day.github.io/toilet/](https://ash1day.github.io/toilet/)


作品概略
-----------------
鯖江市のトイレ情報データセットを利用して、トイレが無い場所の可視化を行いました。

LODを使ってモノがある場所の可視化をすることは広まってきたので、本アプリではモノがないことを可視化することを目標に制作しました。

作品詳細
-----------------
鯖江市のトイレ情報データセットを利用して、トイレ位置を地図上に表示させると同時にトイレが無い範囲を色付けして表示させました。

LODを使ってモノがある場所の可視化をすることは広まってきたので、本アプリではモノがないことを可視化することを目標に制作しました。

データセットの差し替えによる逆マッシュアップによって、様々な場面で、市民の立場からの利便性向上や、行政やビジネスの立場からの意思決定材料に役立てられることを期待します。

仕組み
-----------------
トイレの位置を母点としたボロノイ図を作り、各ボロノイ頂点（周囲のトイレから最も遠い点）を中心に、
「最寄りのトイレまでの距離 − 全頂点の平均距離/2」を半径とする円を描いています。

- 地図: [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/copyright)
- ボロノイ計算: [d3-delaunay](https://github.com/d3/d3-delaunay)
- データ: [公共トイレ(福井県鯖江市)](https://ckan.odp.jig.jp/dataset/jp-fukui-sabae-202-odp)（[CC BY 2.1 JP](https://creativecommons.org/licenses/by/2.1/jp/)）

開発
-----------------
ビルド不要の静的サイトです。ES Modules を使うので、`file://` ではなくHTTPサーバー経由で開いてください。

```sh
npm install         # テスト用 (d3-delaunay)
npm test            # node --test
npm run serve       # http://localhost:8000
npm run fetch-data  # 鯖江市のオープンデータから data/toilets.json を再生成
```

配信元のCSVはCORS非対応のため、ブラウザから直接は読まずに `data/toilets.json` として同梱しています。
