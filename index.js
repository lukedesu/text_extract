const fs = require('fs')
const path = require('path')

const SOURCE_DIRECTORY = './src_demo'
const FILENAME_REGEXP = new RegExp(/\.(html|vue|js)$/, 'g')
const I18N_REGEXP = new RegExp(/(\$t|\$i18n.t)\(\S*['"]\)/, 'gm')

// get all files by folder
function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath, { withFileTypes: true })

  arrayOfFiles = arrayOfFiles || []

  files.forEach(file => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
    } else if (FILENAME_REGEXP.test(file)) {
      arrayOfFiles.push(path.join(__dirname, dirPath, '/', file))
    }
  })

  return arrayOfFiles
}

// get all files content
const final = []
const allFiles = getAllFiles(SOURCE_DIRECTORY)
allFiles.forEach(file => {
  const buffer = fs.readFileSync(file)
  const matched = buffer.toString().match(I18N_REGEXP)
  if (matched) {
    final.push(...matched)
  }
})

console.log(final)
