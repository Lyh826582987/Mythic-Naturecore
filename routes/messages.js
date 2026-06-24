/**
 * 留言板 — 管理 couple_messages
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/excel');

const TABLE = 'messages';
const HEADERS = ['sender', 'content', 'time'];

const DEFAULT_MESSAGES = [
  { sender: 'me', content: '这是我们私密空间的第一条留言 💕 以后想说的话都留在这里吧。', time: new Date().toISOString() }
];

db.ensureTable(TABLE, HEADERS, DEFAULT_MESSAGES);

// GET / — 获取所有留言
router.get('/', (req, res) => {
  try {
    const msgs = db.readAll(TABLE);
    res.json({ ok: true, data: msgs });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST / — 新增留言
router.post('/', (req, res) => {
  try {
    const { sender, content } = req.body;
    if (!sender || !content) return res.status(400).json({ ok: false, error: '缺少 sender 或 content' });
    if (!['me', 'ta'].includes(sender)) return res.status(400).json({ ok: false, error: 'sender 只能是 me 或 ta' });

    const row = { sender, content, time: new Date().toISOString() };
    db.appendRow(TABLE, row);
    res.json({ ok: true, data: row });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// DELETE /:index — 按时间索引删除
router.delete('/:index', (req, res) => {
  try {
    const msgs = db.readAll(TABLE);
    const sorted = msgs.slice().sort((a, b) => b.time.localeCompare(a.time));
    const target = sorted[parseInt(req.params.index)];
    if (!target) return res.status(400).json({ ok: false, error: '索引超出范围' });
    const deleted = db.deleteWhere(TABLE, m => m.time === target.time && m.content === target.content);
    if (deleted === 0) return res.status(404).json({ ok: false, error: '未找到该留言' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
