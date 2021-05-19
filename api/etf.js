'use strict';
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const Joi = require('@hapi/joi');
const fetchData = require('./_utils/fetchData');
const schema = Joi.object({
  wkn: Joi.string(),
  ex: Joi.string()
  .valid('LSE', 'GER', 'AMS', 'GAT', 'LSE', 'STU', 'PNK', 'LSX', 'QUO', 'SWX', 'FRA', 'MUN', 'HAM', 'BER', 'DUS', 'TRO', 'WM', 'WM', 'BBF', 'LUSG'),
  datetimeTzStartRange: Joi.string()
    .pattern(new RegExp(/^(\d{4})-(\d{2})-(\d{2})$/))
    .default(moment().subtract(5, 'year').format('YYYY-MM-DD')),
  timeSpan: Joi.string()
    .pattern(new RegExp(/^[YMD][0-9]$/))
    .default('Y5'),
  idNotation: Joi.string()
})
.xor('wkn', 'idNotation')
.xor('ex', 'idNotation')
.with('wkn', 'ex')
.with('ex', 'wkn')

module.exports = async (req, res) => {
  try {
    let query = await schema.validateAsync(req.query);
    if (query.wkn && query.ex) {
      const SearchReponse = await axios.get(`https://www.onvista.de/suche/?searchValue=${query.wkn}`)
      const $ = cheerio.load(SearchReponse.data);
      let jsonData
      try {
        jsonData = JSON.parse($('body > script#__NEXT_DATA__').html())
      } catch (error) {
        return res.status(500).send('unable to parse website data')
      }
      const exchanges = jsonData['props']['pageProps']['data']['snapshot']['quoteList']['list'].map((item) => {
        let title = item.market.name
        let ex = item.market.codeExchange
        let idNotation = item.market.idNotation
        return {
          title,
          ex,
          idNotation
        }
      })
      const exhange = exchanges.find(o => o.ex.toUpperCase() === query.ex.toUpperCase())
      if (exhange === undefined) {
        return res.status(400).send('idNotation konnte nicht ermittelt werden!')
      }
      query.idNotation = exhange.idNotation
    }
    res.json(await fetchData(query))
  } catch (error) {
    console.error(error)
    res.status(400).json(error)
  }
}
