const FormData = require('form-data');
const axios = require('axios');
const cheerio = require('cheerio');
const _ = require('lodash');

module.exports = async (req, res) => {
  let idNotation;
  if (req.query.idNotation) {
    idNotation = req.query.idNotation
  } else if (req.query.wkn && req.query.ex) {
    const SearchReponse = await axios.get(`https://www.onvista.de/suche/?searchValue=${req.query.wkn}`)
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
      return o.ex === _.toUpper(req.query.ex);
    });
    if (exhange === undefined) {
      return res.status(400).send('idNotation konnte nicht ermittelt werden!')
    }
    idNotation = exhange.idNotation
  } else {
    return res.status(400).send('idNotation oder WKN + EX müssen übergeben werden!')
  }

  const formData = new FormData();
  formData.append('datetimeTzStartRange', req.query.datetimeTzStartRange || '01.01.2019');
  formData.append('timeSpan', req.query.timeSpan || '5Y');
  formData.append('codeResolution', req.query.codeResolution || '1D');
  formData.append('idNotation', idNotation);
  const {data} = await axios.post('https://www.onvista.de/etf/ajax/snapshotHistory', formData, {
    // You need to use `getHeaders()` in Node.js because Axios doesn't
    // automatically set the multipart form boundary in Node.
    headers: formData.getHeaders()
  });
  res.json(data)
}

