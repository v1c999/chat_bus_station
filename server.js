import express from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const app = express();
const port = 3005;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 路由來執行腳本並讀取 GetStop.json 文件
app.get('/getstopid', (req, res) => {
  exec('node script.cjs', (error, stdout, stderr) => {
    if (error) {
      console.error(`執行腳本時發生錯誤: ${error}`);
      return res.status(500).json({ error: `執行腳本時發生錯誤: ${stderr}` });
    }

    const jsonPath = path.join(__dirname, 'GetStop.json');

    fs.readFile(jsonPath, 'utf8', (err, data) => {
      if (err) {
        console.error('讀取 .json 檔案時發生錯誤:', err);
        return res.status(500).json({ error: '讀取 .json 檔案時發生錯誤' });
      }

      console.log('JSON 檔案大小:', Buffer.byteLength(data, 'utf8'), '位元組');

      try {
        const parsedData = JSON.parse(data);
        console.log('JSON 資料解析成功');
        res.json({ message: `腳本執行成功: ${stdout}`, data: parsedData });
      } catch (parseError) {
        console.error('JSON 解析錯誤:', parseError);
        res.status(500).json({ error: 'JSON 解析錯誤' });
      }
    });
  });
});

// 新增的路由來讀取 GetEstimateTime.json 文件
app.get('/getrouteid', (req, res) => {
  const jsonPath = path.join(__dirname, 'GetEstimateTime.json');

  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('讀取 GetEstimateTime.json 檔案時發生錯誤:', err);
      return res.status(500).json({ error: '讀取 GetEstimateTime.json 檔案時發生錯誤' });
    }

    console.log('GetEstimateTime.json 檔案大小:', Buffer.byteLength(data, 'utf8'), '位元組');

    try {
      const parsedData = JSON.parse(data);
      console.log('GetEstimateTime.json 資料解析成功');
      res.json({ data: parsedData });
    } catch (parseError) {
      console.error('JSON 解析錯誤:', parseError);
      res.status(500).json({ error: 'JSON 解析錯誤' });
    }
  });
});
app.get('/getroutename', (req, res) => {
    const jsonPath = path.join(__dirname, 'GetRoute.json');
    
    fs.readFile(jsonPath, 'utf8', (err, data) => {
        if (err) {
        console.error('讀取 GetRoute.json 檔案時發生錯誤:', err);
        return res.status(500).json({ error: '讀取 GetRoute.json 檔案時發生錯誤' });
        }
    
        console.log('GetRoute.json 檔案大小:', Buffer.byteLength(data, 'utf8'), '位元組');
    
        try {
        const parsedData = JSON.parse(data);
        console.log('GetRoute.json 資料解析成功');
        res.json({ data: parsedData });
        } catch (parseError) {
        console.error('JSON 解析錯誤:', parseError);
        res.status(500).json({ error: 'JSON 解析錯誤' });
        }
    });
    });

app.get('/getfinaltime', (req, res) => {
    const jsonPath = path.join(__dirname, 'GetEstimateTime.json');
    
    fs.readFile(jsonPath, 'utf8', (err, data) => {
        if (err) {
        console.error('讀取 GetPathDetail.json 檔案時發生錯誤:', err);
        return res.status(500).json({ error: '讀取 GetPathDetail.json 檔案時發生錯誤' });
        }
    
        console.log('GetPathDetail.json 檔案大小:', Buffer.byteLength(data, 'utf8'), '位元組');
    
        try {
        const parsedData = JSON.parse(data);
        console.log('GetPathDetail.json 資料解析成功');
        res.json({ data: parsedData });
        } catch (parseError) {
        console.error('JSON 解析錯誤:', parseError);
        res.status(500).json({ error: 'JSON 解析錯誤' });
        }
    });
    });
app.listen(port, () => {
  console.log(`伺服器在 http://localhost:${port} 執行`);
});
