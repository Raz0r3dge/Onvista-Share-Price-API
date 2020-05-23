# Onvista-Share-Price-API

## URLs
ETF: https://onvista-share-price-api.now.sh/api/etf?ex=LSX&wkn={WKN}

Share: https://onvista-share-price-api.now.sh/api/share?ex=Lang%20%26%20Schwarz&wkn={WKN}

## Parameters
* ex
  * required with wkn
  * not in combination with idNotation
* wkn
  * required with ex
  * not in combination with idNotation
* idNotation
  * required
  * not in combination with ex, wkn
* datetimeTzStartRange
  * optional
  * format: DD.MM.YYYY
* timeSpan
  * optional
  * format: 1Y,5Y,1M...

## Examples

``` https://onvista-share-price-api.now.sh/api/etf?ex=LSX&wkn={WKN}&timeSpan=5Y ```
```https://onvista-share-price-api.now.sh/api/share?ex=Lang%20%26%20Schwarz&wkn={WKN}&timeSpan=5Y```


## Portfolio Performance Setup
### URLs
ETF:
``` https://onvista-share-price-api.now.sh/api/etf?ex=LSX&wkn={WKN} ```

Share:
```https://onvista-share-price-api.now.sh/api/share?ex=Lang%20%26%20Schwarz&wkn={WKN}```

### JSON Path
Date:
```
$[*].datetimeLast.UTCTimeStamp
```
Last share price:
```
$[*].last
```