/**
 * 照片墙 — multer 上传 + Excel 路径存储
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../lib/excel');

const TABLE = 'photos';
const HEADERS = ['url', 'date', 'desc'];

// multer 配置：存储到 public/uploads/
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'photo_' + Date.now() + '_' + Math.round(Math.random() * 1000) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/^image\/(jpeg|png|gif|webp|bmp)$/)) cb(null, true);
    else cb(new Error('仅支持 JPEG/PNG/GIF/WebP/BMP'), false);
  }
});

// 默认示例照片 (使用 picsum 占位)
const DEFAULT_PHOTOS = [
  { url: 'https://picsum.photos/seed/love1/600/600', date: '2024-02-14', desc: '第一个情人节' },
  { url: 'https://picsum.photos/seed/love2/600/600', date: '2024-05-20', desc: '初夏的海边' },
  { url: 'https://picsum.photos/seed/love3/600/600', date: '2024-08-07', desc: '生日那天' },
  { url: 'https://picsum.photos/seed/love4/600/600', date: '2024-10-01', desc: '秋天的旅行' },
  { url: 'https://picsum.photos/seed/love5/600/600', date: '2025-01-01', desc: '跨年之夜' }
];

// 初始化
db.ensureTable(TABLE, HEADERS, DEFAULT_PHOTOS);

// GET / — 获取所有照片
router.get('/', (req, res) => {
  try {
    const photos = db.readAll(TABLE);
    res.json({ ok: true, data: photos });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST / — 上传新照片 (form-data: photo + date + desc)
router.post('/', upload.single('photo'), (req, res) => {
  try {
    const desc = req.body.desc || '美好的瞬间';
    const date = req.body.date || new Date().toISOString().slice(0, 10);

    let url;
    if (req.file) {
      url = '/uploads/' + req.file.filename;
    } else if (req.body.url) {
      url = req.body.url; // 允许直接传 URL
    } else {
      return res.status(400).json({ ok: false, error: '请上传照片文件或提供 URL' });
    }

    const row = { url, date, desc };
    db.appendRow(TABLE, row);
    res.json({ ok: true, data: row });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// DELETE /:index — 按索引删除照片
router.delete('/:index', (req, res) => {
  try {
    const idx = parseInt(req.params.index);
    const photos = db.readAll(TABLE);
    if (idx < 0 || idx >= photos.length) {
      return res.status(400).json({ ok: false, error: '索引超出范围' });
    }
    photos.splice(idx, 1);
    db.writeAll(TABLE, photos, HEADERS);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
