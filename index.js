const path = require('path');
const fs = require('fs');
const bluebird = require('bluebird');

const parser = require('./lib/xlsx-to-json');

const DEFAULT_CSV_PATH = path.resolve(__dirname, 'csv');
const DEFAULT_JSON_PATH = path.resolve(__dirname, 'json');

const BOM = Buffer.from('\uFEFF');

const fsReaddirAsync = bluebird.promisify(fs.readdir);
const fsStatAsync = bluebird.promisify(fs.stat);

const tryConvert = async filepath => {
  if (!filepath) return;
  if (path.extname(filepath) !== '.csv') {
    console.log('skipping non-csv file:', filepath);
    return;
  }

  const destFileCsv = filepath.replace(DEFAULT_CSV_PATH, DEFAULT_JSON_PATH);
  const destFile = destFileCsv.substring(0, destFileCsv.length - 4) + '.json';
  const destDirPath = destFile.replace(path.basename(destFile), '');
  console.log('converting:', filepath, '=>', destFile);
  parser.toJson(filepath, destDirPath);
};

const fileReadRecur = async startPath => {
  //根据文件路径读取文件，返回文件列表
  const files = await fsReaddirAsync(startPath);

  //遍历读取到的文件列表
  for (const filename of files) {
    // 获取当前文件的绝对路径
    let filedir = path.join(startPath, filename);
    // 根据文件路径获取文件信息，返回一个fs.Stats对象
    const stats = await fsStatAsync(filedir);
    if (stats.isDirectory()) {
      // 是文件夹
      // 检查DEFAULT_JSON_PATH下有无对应文件夹
      const rJsonPath = filedir.replace(DEFAULT_CSV_PATH, DEFAULT_JSON_PATH);
      if (!fs.existsSync(rJsonPath)) {
        // 没有则创建
        fs.mkdirSync(rJsonPath);
      }
      fileReadRecur(filedir); // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
    } else {
      // 是文件
      tryConvert(filedir);
    }
  }
};

const fileDelRecur = async startPath => {
  //根据文件路径读取文件，返回文件列表
  const files = await fsReaddirAsync(startPath);

  //遍历读取到的文件列表
  for (const filename of files) {
    // 获取当前文件的绝对路径
    let filedir = path.join(startPath, filename);
    // 根据文件路径获取文件信息，返回一个fs.Stats对象
    const stats = await fsStatAsync(filedir);
    if (stats.isDirectory()) {
      // 是文件夹 递归读取
      fileDelRecur(filedir); // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
    } else {
      // 是文件
      if (filename.endsWith('.json')) fs.unlinkSync(filedir);
    }
  }
};

const fileAddBOMRecur = async startPath => {
  //根据文件路径读取文件，返回文件列表
  const files = await fsReaddirAsync(startPath);

  //遍历读取到的文件列表
  for (const filename of files) {
    // 获取当前文件的绝对路径
    let filedir = path.join(startPath, filename);
    // 根据文件路径获取文件信息，返回一个fs.Stats对象
    const stats = await fsStatAsync(filedir);
    if (stats.isDirectory()) {
      // 是文件夹 递归读取
      fileAddBOMRecur(filedir); // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
    } else {
      // 是文件
      if (filedir.endsWith('.csv')) {
        const file = fs.readFileSync(filedir);
        if (!/^\uFEFF/.test(file)) {
          console.log('converting csv file to UTF-8 with BOM:', filedir);
          fs.writeFileSync(filedir, Buffer.concat([BOM, file]));
        }
      }
    }
  }
};

const start = async () => {
  await fileAddBOMRecur(DEFAULT_CSV_PATH);
  await fileDelRecur(DEFAULT_JSON_PATH);
  await fileReadRecur(DEFAULT_CSV_PATH);
};

start();
