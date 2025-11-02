const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

function parseCSV(text) {
  return parse(text, { columns: true, skip_empty_lines: true });
}

function generateCSV(records) {
  return stringify(records, { header: true });
}

module.exports = { parseCSV, generateCSV };
