const axios = require('axios');
const csv = require("csvtojson");
const cheerio = require('cheerio');
const _ = require('lodash');

const pattern = /(\d{2})\.(\d{2})\.(\d{4})/;

function toTimestamp(strDate) {
  var d = new Date(strDate.replace(pattern, '$3-$2-$1'))
  d.setHours(12)
  return d / 1000;
}

module.exports = async (req, res) => {
  let notationId;
  let interval;
  const dateStart = req.query.dateStart || '01.01.2019'
  if (req.query.interval) {
    interval = `${req.query.interval.substring(1)}${req.query.interval.substring(0, 1)}`
  } else {
    interval = 'Y5'
  }

  if (req.query.idNotation) {
    notationId = req.query.idNotation
  } else if (req.query.wkn && req.query.ex) {
    console.log(req.query.ex)
    const SearchReponse = await axios.get(`https://www.onvista.de/suche/?searchValue=${req.query.wkn}`)
    const $ = cheerio.load(SearchReponse.data);
    const exchanges = $('#exchangesLayer > ul > li > a').map((i, item) => {
      let title = $(item).children().remove().end().text().trim()
      let ex = $(item).children().remove().end().text().trim()
      let idNotation = $(item).attr('href').match(/\?notation=([\d]*)/)[1]
      return {
        title,
        ex,
        idNotation
      }
    }).get()
    const exhange = _.find(exchanges, function (o) {
      return _.toUpper(o.ex) === _.toUpper(req.query.ex);
    });
    if (exhange === undefined) {
      return res.status(400).send('idNotation konnte nicht ermittelt werden!')
    }
    notationId = exhange.idNotation
  } else {
    return res.status(400).send('idNotation oder WKN + EX müssen übergeben werden!')
  }

  const {data} = await axios({
    url: 'https://www.onvista.de/onvista/boxes/historicalquote/export.csv',
    method: 'GET',
    responseType: 'blob',
    params: {
      dateStart,
      interval,
      notationId
    }
  })
  const datalist = await csv({
    delimiter: [";"]
  }).fromString(data.trimRight())
  const responsedata =_.map(datalist, (i) => {
    return {
      last: i.Schluss,
      first: i.Eroeffnung,
      high: i.Hoch,
      low: i.Tief,
      datetimeLast: {
        localTime: "12:00:00 " + i.Datum,
        localTimeZone: "GMT",
        UTCTimeStamp: toTimestamp(i.Datum)
      },
      datetimeFirst: {
        localTime: "12:00:00 " + i.Datum,
        localTimeZone: "GMT",
        UTCTimeStamp: toTimestamp(i.Datum)
      },
      datetimeHigh: {
        localTime: "12:00:00 " + i.Datum,
        localTimeZone: "GMT",
        UTCTimeStamp: toTimestamp(i.Datum)
      },
      datetimeLow: {
        localTime: "12:00:00 " + i.Datum,
        localTimeZone: "GMT",
        UTCTimeStamp: toTimestamp(i.Datum)
      }
    }
  })
  res.send(responsedata)
}

