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
    .pattern(new RegExp(/^(\d{2})\.(\d{2})\.(\d{4})$/))
    .default(moment().subtract(5, 'year').format('DD.MM.YYYY')),
  timeSpan: Joi.string()
    .pattern(new RegExp(/^[0-9][YMD]$/))
    .default('5Y'),
  codeResolution: Joi.string()
    .pattern(new RegExp(/^[0-9][YMD]$/))
    .default('1D'),
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
      const exchanges = $('#select-exchange > div.menu > div.item').map((i, item) => {
        let title = item.attribs['data-contributor']
        let ex = item.attribs['data-exchange']
        let idNotation = item.attribs['data-value']
        return {
          title,
          ex,
          idNotation
        }
      }).get()
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
