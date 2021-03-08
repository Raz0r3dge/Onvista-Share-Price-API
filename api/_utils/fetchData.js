'use strict';
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
  const url = `https://api.onvista.de/api/v1/instruments/FUND/00000000/eod_history?idNotation=${query.idNotation}&range=${query.timeSpan}&startDate=${query.datetimeTzStartRange}`;
  let { data } = await axios.get(url);
  const mergedData = data.datetimeLast.map(function (e, i) {
    return {
      datetimeLast: {
        UTCTimeStamp: e
      },
      first: data.first[i],
      last: data.last[i],
      high: data.high[i],
      volume: data.last[i],
      numberPrices: data.numberPrices[i],
    }
  });
  return mergedData;
}

module.exports = async (query) => {
  const data = await Promise.all([
    fetchHistoricalData(query),
    fetchRealtimeData(query.idNotation)
  ])
  return data.flat()
}
