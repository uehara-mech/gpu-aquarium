const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const port = 3000; // このサーバーのポート番号

// '/merged_data'へのリクエストをプロキシする
app.use('/merged_data', createProxyMiddleware({
    target: 'http://0.0.0.0:8000',
    changeOrigin: true,
}));

// '/node'へのリクエストをプロキシする
app.use('/node', createProxyMiddleware({
    target: 'http://0.0.0.0:8000',
    changeOrigin: true,
    timeout: 10000,
    // pathRewrite: {
    //     '^/node': '/node', // パスの書き換えは不要な場合、この行は削除可能
    // },
}));

// Reactのビルドされた静的ファイルを提供
app.use(express.static('build'));

// すべてのリクエストをReactアプリに転送
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
