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
    // Browser sends as URLSearchParams with no-cors (no preflight).
    // The payload JSON is stored in the 'data' form field.
    let data;
    if (e.postData.type === 'application/x-www-form-urlencoded') {
      const raw = e.postData.contents;               // "data=%7B%22action%22..."
      const decoded = decodeURIComponent(raw.replace(/^data=/, ''));
      data = JSON.parse(decoded);
    } else {
      // Fallback: plain JSON body
      data = JSON.parse(e.postData.contents);
    }

    if (data.action === 'append') {
      const result = appendRow(data);
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'ok', inserted: result.inserted, reason: result.reason })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: 'Unknown action: ' + data.action })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
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
