/**
 * 每日一问 — 管理问题库 + 每日回答
 */
const express = require('express');
const router = express.Router();
const db = require('../lib/excel');

const TABLE_Q = 'questions';
const TABLE_A = 'answers';
const HEADERS_Q = ['text'];
const HEADERS_A = ['date', 'me', 'ta'];

const DEFAULT_QUESTIONS = [
  { text: '你第一次见到 TA 时，心里在想什么？' },
  { text: '如果我们可以去任何地方旅行，你最想去哪里？' },
  { text: '你最喜欢 TA 的哪一个习惯？' },
  { text: '说一件 TA 为你做过让你特别感动的事。' },
  { text: '你觉得两个人在一起最重要的是什么？' },
  { text: '如果可以回到过去，你想一起重温哪一个瞬间？' },
  { text: '你最期待我们一起完成的一件事是什么？' },
  { text: '你最喜欢 TA 笑的时候是什么样子？' },
  { text: '有没有哪一首歌让你想到 TA？' },
  { text: '你觉得五年后的我们会是什么样子？' },
  { text: '两个人之间发生分歧时，你觉得最好的解决方式是什么？' },
  { text: '说一个你还没有告诉 TA 的小秘密。' },
  { text: '你最喜欢和 TA 一起做的日常小事是什么？' },
  { text: '如果可以给 TA 写一封信，你会写什么？' },
  { text: '你觉得爱是什么？' }
];

db.ensureTable(TABLE_Q, HEADERS_Q, DEFAULT_QUESTIONS);
db.ensureTable(TABLE_A, HEADERS_A, []);

// ── 问题库 ──

// GET / — 获取所有问题
router.get('/', (req, res) => {
  try {
    const questions = db.readAll(TABLE_Q);
    res.json({ ok: true, data: questions });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /today — 获取今日问题（deterministic by date）
router.get('/today', (req, res) => {
  try {
    const questions = db.readAll(TABLE_Q);
    if (questions.length === 0) return res.status(404).json({ ok: false, error: '问题库为空' });
    const today = new Date().toISOString().slice(0, 10);
    const d = new Date(today + 'T00:00:00');
    const idx = Math.floor(d.getTime() / (1000 * 60 * 60 * 24)) % questions.length;
    res.json({ ok: true, data: { date: today, question: questions[idx].text } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// POST / — 新增问题
router.post('/', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ ok: false, error: '缺少 text' });
    db.appendRow(TABLE_Q, { text });
    res.json({ ok: true, data: { text } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PUT /:index — 修改问题
router.put('/:index', (req, res) => {
  try {
    const idx = parseInt(req.params.index);
    const { text } = req.body;
    if (!text) return res.status(400).json({ ok: false, error: '缺少 text' });
    const ok = db.updateWhere(TABLE_Q, (r, i) => i === idx, { text });
    if (!ok) return res.status(404).json({ ok: false, error: '索引超出范围' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// DELETE /:index — 删除问题
router.delete('/:index', (req, res) => {
  try {
    const idx = parseInt(req.params.index);
    const questions = db.readAll(TABLE_Q);
    if (idx < 0 || idx >= questions.length) return res.status(400).json({ ok: false, error: '索引超出范围' });
    questions.splice(idx, 1);
    db.writeAll(TABLE_Q, questions, HEADERS_Q);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ── 每日回答 ──

// GET /answers — 获取所有回答
router.get('/answers', (req, res) => {
  try {
    const answers = db.readAll(TABLE_A);
    res.json({ ok: true, data: answers });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// GET /answers/today — 获取今日回答
router.get('/answers/today', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const answers = db.readAll(TABLE_A);
    const todayAnswers = answers.find(a => a.date === today) || { date: today, me: '', ta: '' };
    res.json({ ok: true, data: todayAnswers });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PUT /answers/today — 保存今日回答
router.put('/answers/today', (req, res) => {
  try {
    const { who, answer } = req.body; // who: 'me' | 'ta'
    if (!who || !['me', 'ta'].includes(who)) return res.status(400).json({ ok: false, error: 'who 必须是 me 或 ta' });

    const today = new Date().toISOString().slice(0, 10);
    const answers = db.readAll(TABLE_A);
    let row = answers.find(a => a.date === today);
    if (!row) {
      row = { date: today, me: '', ta: '' };
      answers.push(row);
    }
    row[who] = answer || '';
    db.writeAll(TABLE_A, answers, HEADERS_A);
    res.json({ ok: true, data: row });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
