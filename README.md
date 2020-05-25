---
home: true
lang: de-DE
footer: Made with ❤️ in Düsseldorf
---

# Documentation

## Endpoints

ETF: ``` https://onvista-share-price-api.now.sh/api/etf ```

Share: ``` https://onvista-share-price-api.now.sh/api/share ```

## Parameters

* ex
  * required with wkn
  * not in combination with idNotation
  * options
    * ETFs: LSE, GER, AMS, GAT, LSE, STU, PNK, LSX, QUO, SWX, FRA, MUN, HAM, BER, DUS, TRO, WM, WM, BBF, LUSG
    * Shares: Tradegate, Stuttgart, Frankfurt, LS Exchange, München, London Trade Rep., Quotrix, Hamburg, Nasdaq OTC, Gettex, Lang &amp; Schwarz, Düsseldorf, Berlin, Baader Bank

* wkn
  * required with ex
  * not in combination with idNotation
* idNotation
  * required
  * not in combination with ex, wkn
* datetimeTzStartRange
  * optional
  * Default: five years ago
  * format: DD.MM.YYYY
* timeSpan
  * optional
  * default: 5Y
  * format: 1Y,5Y,1M...

## Examples

* ``` https://onvista-share-price-api.now.sh/api/etf?ex=LSX&wkn=A111X9&timeSpan=5Y ```

* ``` https://onvista-share-price-api.now.sh/api/share?ex=LS%20Exchange&wkn=A111X9&timeSpan=5Y ```

* ``` https://onvista-share-price-api.now.sh/api/share?ex=LS%20Exchange&wkn=A111X9&timeSpan=5Y&datetimeTzStartRange=01.01.2020 ```

## Portfolio Performance Setup

You can use the API in [Portfolio Performance](https://www.portfolio-performance.info/). Use the [JSON Interface](https://help.portfolio-performance.info/kursdaten_laden/#json) with the following config:

### URLs

ETF with Lang & Schwarz Exchange:

``` https://onvista-share-price-api.now.sh/api/etf?ex=LSX&wkn={WKN} ```

Share with Lang & Schwarz Exchange:

``` https://onvista-share-price-api.now.sh/api/share?ex=LS%20Exchange&wkn={WKN} ```

### JSON Path

Date:

```js
$[*].datetimeLast.UTCTimeStamp
```

Last share price:

```js
$[*].last
```
