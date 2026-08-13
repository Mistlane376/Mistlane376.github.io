'use strict'

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const source = path.join(root, 'node_modules', 'pjax', 'pjax.min.js')
const target = path.join(root, 'themes', 'mistlane', 'source', 'js', 'pjax.min.js')

fs.copyFileSync(source, target)
console.log('Copied pjax runtime into the Mistlane theme')
