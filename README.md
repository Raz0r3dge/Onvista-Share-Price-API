# Onvista-Share-Price-API

ETF URL:
https://onvista-share-price-api.now.sh/api/etf?ex=LSX&wkn={WKN}

Share URL:
https://onvista-share-price-api.now.sh/api/share?ex=Lang%20%26%20Schwarz&wkn={WKN}

## JSON Path for Portfolio Performance
Date:
```
$[*].datetimeLast.UTCTimeStamp
```
Last share price:
```
$[*].last
```