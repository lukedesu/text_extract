const fs = require('fs')
const path = require('path')

const FILENAME_REGEXP = new RegExp(/\.(html|vue|js)$/, 'g')

// sync get all files under specific folder
function getAllFilesSync(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath, { withFileTypes: true })

  arrayOfFiles = arrayOfFiles || []

  files.forEach(file => {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFilesSync(dirPath + '/' + file, arrayOfFiles)
    } else if (FILENAME_REGEXP.test(file)) {
      arrayOfFiles.push(path.join(__dirname, dirPath, '/', file))
    }
  })

  return arrayOfFiles
}

module.exports = {
  getAllFilesSync
}
