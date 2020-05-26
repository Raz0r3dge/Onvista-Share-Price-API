const FormData = require('form-data');
const axios = require('axios');
const cheerio = require('cheerio');
const _ = require('lodash');
const moment = require('moment');
const Joi = require('@hapi/joi');
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
    idNotation: Joi.string(),
    today: Joi.string().default(false)
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
      const exhange = _.find(exchanges, function (o) {
        return o.ex === _.toUpper(query.ex);
      });
      if (exhange === undefined) {
        return res.status(400).send('idNotation konnte nicht ermittelt werden!')
      }
      query.idNotation = exhange.idNotation
    }
    if (query.today !== false) {
      const { data } = await axios.post(`https://www.onvista.de/api/quote/${query.idNotation}/RLT`);
      res.json(data)
    } else {
      const formData = new FormData();
      formData.append('datetimeTzStartRange', query.datetimeTzStartRange);
      formData.append('timeSpan', query.timeSpan);
      formData.append('codeResolution', query.codeResolution);
      formData.append('idNotation', query.idNotation);
      const {data} = await axios.post('https://www.onvista.de/etf/ajax/snapshotHistory', formData, {
        // You need to use `getHeaders()` in Node.js because Axios doesn't
        // automatically set the multipart form boundary in Node.
        headers: formData.getHeaders()
      });
      res.json(data)
    }
  } catch (error) {
    console.error(error)
    res.status(400).json(error)
  }
}

