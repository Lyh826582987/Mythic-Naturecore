/**
 * 基础设置 — 管理 couple_anniversary + 背景音乐
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SHEET = 'settings';
const MUSIC_DIR = path.join(__dirname, '..', 'public', 'music');

// 确保 music 目录存在
if (!fs.existsSync(MUSIC_DIR)) fs.mkdirSync(MUSIC_DIR, { recursive: true });

// multer 配置 — 音乐文件上传
const musicStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MUSIC_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp3';
    cb(null, 'bgm' + ext);
  }
});
const musicUpload = multer({
  storage: musicStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/^audio\/(mpeg|ogg|wav|webm|aac|flac|mp4)$/)) cb(null, true);
    else cb(new Error('仅支持 MP3/OGG/WAV/WebM/AAC/FLAC'), false);
  }
});

function filePath() { return path.join(DATA_DIR, SHEET + '.xlsx'); }

function defaultSettings() {
  return { anniversary: '2024-01-01', musicUrl: '', musicVolume: 30 };
}

function readSettings() {
  const fp = filePath();
  const def = defaultSettings();
  if (!fs.existsSync(fp)) return def;
  const wb = XLSX.readFile(fp);
  const ws = wb.Sheets[SHEET];
  if (!ws) return def;
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  if (rows.length === 0) return def;
  // 合并默认值，兼容旧数据（可能没有 musicUrl / musicVolume）
  return Object.assign({}, def, rows[0]);
}

function writeSettings(obj) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const fp = filePath();
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([obj]);
  XLSX.utils.book_append_sheet(wb, ws, SHEET);
  XLSX.writeFile(wb, fp);
}

// GET — 获取当前设置
router.get('/', (req, res) => {
  try {
    const s = readSettings();
    res.json({ ok: true, data: s });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PUT — 更新设置（纪念日、音量等文本字段）
router.put('/', (req, res) => {
  try {
    const current = readSettings();
    const { anniversary, musicUrl, musicVolume } = req.body;
    if (anniversary !== undefined) current.anniversary = anniversary;
    if (musicUrl !== undefined) current.musicUrl = musicUrl;
    if (musicVolume !== undefined) {
      const vol = parseInt(musicVolume, 10);
      if (isNaN(vol) || vol < 0 || vol > 100) return res.status(400).json({ ok: false, error: '音量范围 0-100' });
      current.musicVolume = vol;
    }
    writeSettings(current);
    res.json({ ok: true, data: current });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST /upload-music — 上传背景音乐文件
router.post('/upload-music', musicUpload.single('music'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: '请上传音乐文件' });
    const current = readSettings();
    const musicUrl = '/music/' + req.file.filename;
    current.musicUrl = musicUrl;
    writeSettings(current);
    res.json({ ok: true, data: { musicUrl, musicVolume: current.musicVolume } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
