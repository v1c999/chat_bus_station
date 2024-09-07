const axios = require('axios');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const urls = [
    'https://tcgbusfs.blob.core.windows.net/blobbus/GetStop.gz',
    'https://tcgbusfs.blob.core.windows.net/blobbus/GetEstimateTime.gz',
    'https://tcgbusfs.blob.core.windows.net/blobbus/GetRoute.gz',
    'https://tcgbusfs.blob.core.windows.net/blobbus/GetPathDetail.gz',
    'https://tcgbusfs.blob.core.windows.net/blobbus/GetStopLocation.gz'
];

async function downloadAndUnzipGz() {
    try {
        for (const url of urls) {
            const fileName = path.basename(url, '.gz'); // 获取文件名（去掉 .gz 后缀）
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream',
            });

            const unzip = zlib.createGunzip();
            const jsonPath = path.join(__dirname, `${fileName}.json`);
            const jsonWriteStream = fs.createWriteStream(jsonPath);

            response.data.pipe(unzip).pipe(jsonWriteStream);

            await new Promise((resolve, reject) => {
                jsonWriteStream.on('finish', () => {
                    console.log(`${fileName}.json 檔案已保存。`);
                    resolve();
                });

                jsonWriteStream.on('error', (err) => {
                    console.error(`${fileName}.json 寫入發生錯誤:`, err);
                    reject(err);
                });
            });
        }
    } catch (error) {
        console.error('下載或解壓縮檔案時發生錯誤:', error);
    }
}

downloadAndUnzipGz();
