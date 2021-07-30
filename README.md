# Onvista-Share-Price-API

__Update 26.07.2021: Due to the limitation of the free Vercel account, I no longer run a public instance via my personal account. But everyone is free to run his own instance.__

## Host via Vercel

To host your instance of Onvista-Share-Price-API, you can click this button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2FThisIsBenny%2FOnvista-Share-Price-API)

## Documentation

### Endpoints

ETF: ``` https://[DOMAIN]/api/etf ```

Share: ``` https://[DOMAIN]/api/share ```

### Parameters

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
  * format: YYYY-MM-DD
* timeSpan
  * optional
  * default: 5Y
  * format: 1Y,5Y,1M...

### Examples

* ``` https://[DOMAIN]/api/etf?ex=LSX&wkn=A111X9&timeSpan=5Y ```

* ``` https://[DOMAIN]/api/share?ex=LS%20Exchange&wkn=A111X9&timeSpan=5Y ```

* ``` https://[DOMAIN]/api/share?ex=LS%20Exchange&wkn=A111X9&timeSpan=5Y&datetimeTzStartRange=2020-01-01 ```

### Portfolio Performance Setup

You can use the API in [Portfolio Performance](https://www.portfolio-performance.info/). Use the [JSON Interface](https://help.portfolio-performance.info/kursdaten_laden/#json) with the following config:

#### URLs

ETF with Lang & Schwarz Exchange:

``` https://[DOMAIN]/api/etf?ex=LSX&wkn={WKN} ```

Share with Lang & Schwarz Exchange:

``` https://[DOMAIN]/api/share?ex=LS%20Exchange&wkn={WKN} ```

### JSON Path

Date:

```js
$[*].datetimeLast.UTCTimeStamp
```

Last share price:

```js
$[*].last
```
