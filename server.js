const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const MUSIC_DIR = path.join(__dirname, 'public', 'music');

// 确保所有运行时目录存在
[DATA_DIR, UPLOADS_DIR, MUSIC_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Health check — Railway 需要这个来判断服务是否存活
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// API routes before static — prevents a public/ file from shadowing /api
app.use('/api/settings', require('./routes/settings'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/records', require('./routes/records'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/questions', require('./routes/questions'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// ── Get LAN IP ──
function getLANIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '0.0.0.0';
}

app.listen(PORT, HOST, () => {
  const lanIP = getLANIP();
  const line = '='.repeat(56);
  console.log('');
  console.log(line);
  console.log('  ✨  Mythic Naturecore — Reverie  服务已启动 ✨');
  console.log(line);
  console.log('');
  console.log('  📡  服务地址：');
  console.log('      本地访问  →  http://localhost:' + PORT);
  console.log('      局域网    →  http://' + lanIP + ':' + PORT);
  console.log('');
  console.log('  🌐  前端页面：');
  console.log('      首页      →  http://' + lanIP + ':' + PORT + '/index.html');
  console.log('      照片墙    →  http://' + lanIP + ':' + PORT + '/worlds.html');
  console.log('      日常      →  http://' + lanIP + ':' + PORT + '/atelier.html');
  console.log('      留言      →  http://' + lanIP + ':' + PORT + '/codex.html');
  console.log('');
  console.log('  ⚙️  后台管理：');
  console.log('      Admin UI  →  http://' + lanIP + ':' + PORT + '/admin.html');
  console.log('');
  console.log(line);
});
