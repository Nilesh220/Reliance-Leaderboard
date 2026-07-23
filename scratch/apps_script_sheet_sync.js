/**
 * ═══════════════════════════════════════════════════════════════
 *  Bootup India — Valorant Registrations → Google Sheets Sync
 *  Google Apps Script Web App
 *  ═══════════════════════════════════════════════════════════════
 *
 *  DEPLOYMENT STEPS (do this once):
 *  1. Open your Google Sheet
 *  2. Go to Extensions → Apps Script
 *  3. Paste ALL of this code into Code.gs (replace any existing code)
 *  4. Save (Ctrl+S)
 *  5. Click "Deploy" → "New deployment"
 *  6. Type: Web App
 *  7. Execute as: Me
 *  8. Who has access: Anyone
 *  9. Click Deploy → Authorise → copy the Web App URL
 *  10. Paste that URL into APPS_SCRIPT_URL in js/admin.js
 *
 *  SHEET SETUP:
 *  - The script auto-creates a sheet tab named "Valorant Registrations"
 *  - Headers are written automatically on first run
 *  - Duplicate mobile numbers are skipped (idempotent sync)
 * ═══════════════════════════════════════════════════════════════
 */

const SHEET_NAME   = 'Valorant Registrations';
const HEADER_ROW   = [
  'Full Name', 'Mobile', 'Email', 'College Name', 'College City',
  'Preferred Store', 'Valorant Username', 'Current Rank',
  'POC Name', 'Registered At', 'Synced At'
];

// ── doGet: simple health-check ─────────────────────────────────
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', message: 'Bootup India Sheet Sync is live 🚀' })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ── doPost: receive registration rows from admin.js ────────────
function doPost(e) {
  try {
    let data;
    const raw     = e.postData ? e.postData.contents  : '';
    const ctype   = e.postData ? e.postData.type      : '';

    // ── Parse: try every known format ──────────────────────────
    if (ctype.indexOf('application/x-www-form-urlencoded') !== -1) {
      // URLSearchParams sent by browser no-cors fetch
      // Body looks like: data=%7B%22action%22...%7D
      const match = raw.match(/(?:^|&)data=([^&]*)/);
      if (match) {
        data = JSON.parse(decodeURIComponent(match[1]));
      } else {
        // Fallback: whole body might be the JSON percent-encoded
        data = JSON.parse(decodeURIComponent(raw));
      }
    } else {
      // plain JSON body (future-proof)
      data = JSON.parse(raw);
    }

    if (!data || !data.action) {
      return ok({ status: 'error', message: 'Missing action field' });
    }

    if (data.action === 'append') {
      // Single row (legacy / new registration hook)
      const result = appendRow(data);
      return ok({ status: 'ok', inserted: result.inserted, reason: result.reason });
    }

    if (data.action === 'batch_append') {
      // Bulk insert — all rows in one shot (used by Sync All button)
      if (!Array.isArray(data.rows) || !data.rows.length) {
        return ok({ status: 'error', message: 'No rows provided for batch_append' });
      }
      const result = appendBatch(data.rows);
      return ok({ status: 'ok', inserted: result.inserted, skipped: result.skipped, total: data.rows.length });
    }

    return ok({ status: 'error', message: 'Unknown action: ' + data.action });

  } catch (err) {
    // Log to Apps Script execution log for debugging
    console.error('doPost error:', err.toString(), '| raw:', e.postData ? e.postData.contents : 'N/A');
    return ok({ status: 'error', message: err.toString() });
  }
}

function ok(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── appendRow: idempotent insert (skip duplicates by mobile) ───
function appendRow(data) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet and headers if they don't exist
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADER_ROW.length)
         .setValues([HEADER_ROW])
         .setFontWeight('bold')
         .setBackground('#003087')
         .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, HEADER_ROW.length, 160);
  }

  // Check for existing row with same mobile (avoid duplicates)
  const mobileCol = 2; // "Mobile" is column B (1-indexed)
  const lastRow   = sheet.getLastRow();

  if (lastRow > 1) {
    const mobileValues = sheet.getRange(2, mobileCol, lastRow - 1, 1).getValues();
    for (const [mob] of mobileValues) {
      if (String(mob).trim() === String(data.mobile || '').trim()) {
        return { inserted: false, reason: 'duplicate_mobile' };
      }
    }
  }

  // Append new row
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  sheet.appendRow([
    data.full_name         || '',
    data.mobile            || '',
    data.email             || '',
    data.college_name      || '',
    data.college_city      || '',
    data.preferred_store   || '',
    data.valorant_username || '',
    data.current_rank      || '',
    data.poc_name          || '',
    data.registered_at     || '',
    now,
  ]);

  // Auto-format the new row
  const newRow = sheet.getLastRow();
  sheet.getRange(newRow, 1, 1, HEADER_ROW.length)
       .setBackground(newRow % 2 === 0 ? '#F3F7FF' : '#FFFFFF');

  return { inserted: true, reason: 'ok' };
}

// ── appendBatch: bulk insert, one setValues() call ─────────────
function appendBatch(rows) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  // Create sheet + headers if missing
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const hdr = sheet.getRange(1, 1, 1, HEADER_ROW.length);
    hdr.setValues([HEADER_ROW])
       .setFontWeight('bold')
       .setBackground('#003087')
       .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, HEADER_ROW.length, 160);
  }

  // Build a Set of existing mobile numbers for deduplication
  const lastRow     = sheet.getLastRow();
  const existingSet = new Set();
  if (lastRow > 1) {
    const mobileValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    mobileValues.forEach(([mob]) => existingSet.add(String(mob).trim()));
  }

  // Filter and map only new rows
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const newRows = [];
  rows.forEach(row => {
    const mob = String(row.mobile || '').trim();
    if (!existingSet.has(mob)) {
      existingSet.add(mob); // prevent duplicates within the batch itself
      newRows.push([
        row.full_name         || '',
        row.mobile            || '',
        row.email             || '',
        row.college_name      || '',
        row.college_city      || '',
        row.preferred_store   || '',
        row.valorant_username || '',
        row.current_rank      || '',
        row.poc_name          || '',
        row.registered_at     || '',
        now,
      ]);
    }
  });

  const skipped = rows.length - newRows.length;

  if (newRows.length === 0) {
    return { inserted: 0, skipped };
  }

  // Write all new rows in ONE API call
  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, newRows.length, HEADER_ROW.length)
       .setValues(newRows);

  // Alternating row colours (batch)
  newRows.forEach((_, i) => {
    const r = startRow + i;
    sheet.getRange(r, 1, 1, HEADER_ROW.length)
         .setBackground(r % 2 === 0 ? '#F3F7FF' : '#FFFFFF');
  });

  return { inserted: newRows.length, skipped };
}
