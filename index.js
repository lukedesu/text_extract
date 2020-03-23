const fs = require('fs')
const _ = require('lodash')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

const helper = require('./helper')

const I18N_REGEXP = new RegExp(/(\$t|\$i18n.t)\(\S*['"]\)/, 'gm')

// scan folder
const SOURCE_DIRECTORY = './dist'
// source local file (as benchmark, usually the english one)
const SOURCE_LOCALE_FILE = './locale.json'

// get all matched content
const final = []
const allFiles = helper.getAllFilesSync(SOURCE_DIRECTORY)

allFiles.forEach(file => {
  const buffer = fs.readFileSync(file)
  const matched = buffer.toString().match(I18N_REGEXP)
  if (matched) {
    final.push(...matched)
  }
})

// create report
const csvWriter = createCsvWriter({
  path: 'out.csv',
  header: [{ id: 'key', title: 'KEY' }]
})

const data = _.uniq(final).map(o => ({ key: o }))
csvWriter
  .writeRecords(data)
  .then(() => console.log('The CSV file was created successfully'))
