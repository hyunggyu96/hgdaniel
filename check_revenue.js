const data = require('./web/src/data/financial_data.json');
const companies = Object.keys(data);
console.log('Total:', companies.length);
for (const c of companies) {
  const h = data[c].financial_history;
  const years = Object.keys(h);
  const ry = years.filter(y => {
    const r = h[y].revenue;
    return r && r !== 'N/A' && r !== '-';
  });
  const my = years.filter(y => {
    const r = h[y].revenue;
    return !r || r === 'N/A' || r === '-';
  });
  console.log(c, '| Has:', ry.join(','), '| Missing:', my.join(','));
}
