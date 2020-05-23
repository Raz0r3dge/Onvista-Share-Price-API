const axios = require('axios');
const csv = require("csvtojson");
const cheerio = require('cheerio');
const _ = require('lodash');
const Joi = require('@hapi/joi');
const schema = Joi.object({
  wkn: Joi.string(),
  ex: Joi.string(),
  datetimeTzStartRange: Joi.string()
    .pattern(new RegExp(/^(\d{2})\.(\d{2})\.(\d{4})$/))
    .default('01.01.2019'),
  timeSpan: Joi.string()
    .pattern(new RegExp(/^[YMD][0-9]$/))
    .replace(/^([0-9])([YMD])$/, '$2$1')
    .default('Y5'),
  idNotation: Joi.string()
})
.xor('wkn', 'idNotation')
.xor('ex', 'idNotation')
.with('wkn', 'ex')
.with('ex', 'wkn')

function toTimestamp(strDate) {
  var d = new Date(strDate.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1'))
  d.setHours(12)
  return d / 1000;
}

module.exports = async (req, res) => {
  try {
    let query = await schema.validateAsync(req.query);
    query.dateStart = query.datetimeTzStartRange
    delete query.datetimeTzStartRange
    query.interval = query.timeSpan
    delete query.timeSpan

    if (query.idNotation) {
      query.notationId = query.idNotation
      delete query.idNotation
    } else if (query.wkn && query.ex) {
      const SearchReponse = await axios.get(`https://www.onvista.de/suche/?searchValue=${query.wkn}`)
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
        return _.toUpper(o.ex) === _.toUpper(query.ex);
      });
      if (exhange === undefined) {
        return res.status(400).send('idNotation konnte nicht ermittelt werden!')
      }
      query.notationId = exhange.idNotation
      delete query.wkn
      delete query.ex
    }
    const {data} = await axios({
      url: 'https://www.onvista.de/onvista/boxes/historicalquote/export.csv',
      method: 'GET',
      responseType: 'blob',
      params: query
    })
    const datalist = await csv({
      delimiter: [";"]
    }).fromString(data.trimRight())
    const responsedata =_.map(datalist, (i) => {
      return {
        last: i.Schluss.replace(',', '.'),
        first: i.Eroeffnung.replace(',', '.'),
        high: i.Hoch.replace(',', '.'),
        low: i.Tief.replace(',', '.'),
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
  } catch (error) {
    console.error(error)
    res.status(400).json(error)
  }
}

