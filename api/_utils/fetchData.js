'use strict';
const FormData = require('form-data');
const axios = require('axios');

const fetchRealtimeData = async (idNotation) => {
  const { data } = await axios.post(`https://www.onvista.de/api/quote/${idNotation}/RLT`);
  return {
    ...data,
    last: data.price,
    datetimeLast: data.datetimePrice
  }
}

const fetchHistoricalData = async (query) => {
  const formData = new FormData();
  formData.append('datetimeTzStartRange', query.datetimeTzStartRange);
  formData.append('timeSpan', query.timeSpan);
  formData.append('codeResolution', query.codeResolution);
  formData.append('idNotation', query.idNotation);
  let { data } = await axios.post('https://www.onvista.de/etf/ajax/snapshotHistory', formData, {
    // You need to use `getHeaders()` in Node.js because Axios doesn't
    // automatically set the multipart form boundary in Node.
    headers: formData.getHeaders()
  });
  return data
}

module.exports = async (query) => {
  const data = await Promise.all([
    fetchHistoricalData(query),
    fetchRealtimeData(query.idNotation)
  ])
  return data.flat()
}
