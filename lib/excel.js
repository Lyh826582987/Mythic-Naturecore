/**
 * Excel 数据驱动层 — 通用读写封装
 * 使用 xlsx 库将 sheet 作为数据库表使用
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * 获取 xlsx 文件完整路径
 */
function filePath(name) {
  return path.join(DATA_DIR, name + '.xlsx');
}

/**
 * 读取一个 sheet 的所有行（返回对象数组，以表头为 key）
 * 如果文件或 sheet 不存在，返回空数组
 */
function readAll(tableName) {
  const fp = filePath(tableName);
  if (!fs.existsSync(fp)) return [];
  const wb = XLSX.readFile(fp);
  const ws = wb.Sheets[tableName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { defval: '' });
}

/**
 * 写入整个 sheet（会覆盖原有数据）
 * 自动创建目录和文件
 */
function writeAll(tableName, rows, headers) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const fp = filePath(tableName);

  // 将 rows 转为二维数组以便插入表头
  const aoa = [headers];
  for (const row of rows) {
    const line = headers.map(h => (row[h] !== undefined ? row[h] : ''));
    aoa.push(line);
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  let wb;
  if (fs.existsSync(fp)) {
    wb = XLSX.readFile(fp);
    // Replace existing sheet or add new one
    if (wb.SheetNames.indexOf(tableName) === -1) {
      XLSX.utils.book_append_sheet(wb, ws, tableName);
    } else {
      wb.Sheets[tableName] = ws;
    }
  } else {
    wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tableName);
  }

  XLSX.writeFile(wb, fp);
}

/**
 * 追加一行
 */
function appendRow(tableName, rowObj) {
  const rows = readAll(tableName);
  rows.push(rowObj);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : Object.keys(rowObj);
  writeAll(tableName, rows, headers);
}

/**
 * 按条件更新行（简单实现：先删除匹配行，再插入新行）
 */
function updateWhere(tableName, matchFn, newRow) {
  const rows = readAll(tableName);
  const idx = rows.findIndex(matchFn);
  if (idx === -1) return false;
  rows[idx] = Object.assign(rows[idx], newRow);
  const headers = Object.keys(rows[0]);
  writeAll(tableName, rows, headers);
  return true;
}

/**
 * 按条件删除行
 */
function deleteWhere(tableName, matchFn) {
  const rows = readAll(tableName);
  const before = rows.length;
  const filtered = rows.filter((r, i) => !matchFn(r, i));
  if (filtered.length === before) return 0;
  const headers = filtered.length > 0 ? Object.keys(filtered[0]) : ['_id'];
  writeAll(tableName, filtered, headers);
  return before - filtered.length;
}

/**
 * 确保表存在（如果文件为空或不存在则初始化默认数据）
 */
function ensureTable(tableName, headers, defaultRows) {
  const rows = readAll(tableName);
  if (rows.length === 0 && defaultRows && defaultRows.length > 0) {
    writeAll(tableName, defaultRows, headers);
    return defaultRows;
  }
  return rows;
}

module.exports = { readAll, writeAll, appendRow, updateWhere, deleteWhere, ensureTable, filePath };
