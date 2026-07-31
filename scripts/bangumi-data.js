'use strict';

const fs = require('fs');
const path = require('path');

hexo.extend.generator.register('bangumi-data', function () {
  const dataPath = path.join(this.source_dir, '_data', 'bangumis.json');
  let data = { wantWatch: [], watching: [], watched: [] };

  if (fs.existsSync(dataPath)) {
    try {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } catch (error) {
      hexo.log.warn('Unable to read Bilibili bangumi data: ' + error.message);
    }
  }

  return {
    path: 'data/bangumis.json',
    data: JSON.stringify(data),
    layout: false
  };
});
