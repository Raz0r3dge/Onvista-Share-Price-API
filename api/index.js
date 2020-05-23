const FormData = require('form-data');
const axios = require('axios');

module.exports = async (req, res) => {
  const formData = new FormData();
  formData.append('datetimeTzStartRange', req.query.datetimeTzStartRange || '01.01.2019');
  formData.append('timeSpan', req.query.timeSpan || '5Y');
  formData.append('codeResolution', req.query.codeResolution || '1D');
  formData.append('idNotation', req.query.idNotation || '162951783');
  const {data} = await axios.post('https://www.onvista.de/etf/ajax/snapshotHistory', formData, {
    // You need to use `getHeaders()` in Node.js because Axios doesn't
    // automatically set the multipart form boundary in Node.
    headers: formData.getHeaders()
  });
  res.json(data)
}

