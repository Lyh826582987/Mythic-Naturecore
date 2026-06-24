/**
 * 日常记录 — 管理 couple_records
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/excel');

const TABLE = 'records';
const HEADERS = ['date', 'content'];

const DEFAULT_RECORDS = [
  { date: new Date().toISOString().slice(0, 10), content: '今天是我们在一起的第一天，以此为记 💕' }
];

db.ensureTable(TABLE, HEADERS, DEFAULT_RECORDS);

// GET / — 获取所有记录
router.get('/', (req, res) => {
  try {
    const records = db.readAll(TABLE);
    res.json({ ok: true, data: records });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST / — 新增或更新当日记录 (upsert by date)
router.post('/', (req, res) => {
  try {
    const { date, content } = req.body;
    if (!date || !content) return res.status(400).json({ ok: false, error: '缺少 date 或 content' });

    const records = db.readAll(TABLE);
    const existing = records.find(r => r.date === date);
    if (existing) {
      existing.content = content;
    } else {
      records.push({ date, content });
    }
    db.writeAll(TABLE, records, HEADERS);
    res.json({ ok: true, data: { date, content } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// DELETE /:date — 按日期删除
router.delete('/:date', (req, res) => {
  try {
    const date = req.params.date;
    const deleted = db.deleteWhere(TABLE, r => r.date === date);
    if (deleted === 0) return res.status(404).json({ ok: false, error: '未找到该记录' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PUT /:date — 更新指定日期的记录
router.put('/:date', (req, res) => {
  try {
    const date = req.params.date;
    const { content } = req.body;
    if (!content) return res.status(400).json({ ok: false, error: '缺少 content' });
    const ok = db.updateWhere(TABLE, r => r.date === date, { content });
    if (!ok) return res.status(404).json({ ok: false, error: '未找到该记录' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
