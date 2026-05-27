/**
 * MaxDriveDetail - Google Apps Script Backend
 *
 * SETUP:
 * 1. Go to script.google.com, create a new project named "MaxDriveDetail Backend"
 * 2. Paste this entire file, replacing the default code
 * 3. Fill in OWNER_EMAIL, SHEET_ID, DEPOSIT_LINK, REVIEW_LINK below
 * 4. Click Deploy > New deployment > Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Authorize when prompted, then copy the Web App URL
 * 6. Paste the URL into book.html and contact.html where APPS_SCRIPT_URL = ''
 * 7. Run setupDailyTrigger() ONCE (manually, from the Apps Script editor) to
 *    enable the day-before reminder and 2-day follow-up emails
 *
 * To find SHEET_ID: open your Google Sheet, copy the long ID from the URL
 *   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
 * To find REVIEW_LINK: Google Business Profile > Ask for reviews > copy the link
 *
 * To update after edits: Deploy > Manage deployments > pencil icon > New version > Deploy
 */

// CONFIG
var OWNER_EMAIL    = 'Zacharysonnenberg@gmail.com';
var CALENDAR_ID    = 'primary';
var DEPOSIT_LINK   = '';
var REVIEW_LINK    = '';           // <- your Google Business review link
var SHEET_ID       = '';           // <- paste your Google Sheet ID here
var DASHBOARD_KEY  = '3sdetailing2026';  // password for dashboard access


// ─────────────────────────────────────────────────────────────
// ENTRY POINTS
// ─────────────────────────────────────────────────────────────

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.type === 'booking') {
      handleBooking(data);
    } else if (data.type === 'contact') {
      handleContact(data);
    }
    output.setContent(JSON.stringify({ ok: true }));
  } catch (err) {
    output.setContent(JSON.stringify({ ok: false, error: err.message }));
  }
  return output;
}

function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};

  // ── Availability endpoint ────────────────────────────────────
  if (params.action === 'availability') {
    try {
      var cal = CalendarApp.getCalendarById(CALENDAR_ID) || CalendarApp.getDefaultCalendar();
      var dp = (params.date || '').split('-');
      if (dp.length < 3) throw new Error('Invalid date');
      var dayStart = new Date(parseInt(dp[0]), parseInt(dp[1])-1, parseInt(dp[2]), 0, 0, 0);
      var dayEnd   = new Date(parseInt(dp[0]), parseInt(dp[1])-1, parseInt(dp[2]), 23, 59, 59);
      var evs = cal.getEvents(dayStart, dayEnd).filter(function(ev) {
        var t = ev.getTitle();
        return t.indexOf('MaxDriveDetail - ') === 0 || t.indexOf('3S Detailing - ') === 0;
      });
      var busy = evs.map(function(ev) {
        var s = ev.getStartTime(), end = ev.getEndTime();
        return { startH: s.getHours(), startM: s.getMinutes(), endH: end.getHours(), endM: end.getMinutes() };
      });
      return ContentService.createTextOutput(JSON.stringify({ ok: true, busy: busy }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, busy: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // ── Dashboard bookings endpoint ──────────────────────────────
  if (params.key === DASHBOARD_KEY) {
    try {
      var sheet = getSheet();
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'No sheet found' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var data = sheet.getDataRange().getValues();
      if (data.length < 2) {
        return ContentService.createTextOutput(JSON.stringify({ ok: true, bookings: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var headers = data[0];
      var bookings = data.slice(1).map(function(row) {
        var obj = {};
        headers.forEach(function(h, i) { obj[h] = row[i] !== undefined ? String(row[i]) : ''; });
        return obj;
      }).reverse(); // newest first
      return ContentService.createTextOutput(JSON.stringify({ ok: true, bookings: bookings }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}


// ─────────────────────────────────────────────────────────────
// BOOKING HANDLER
// ─────────────────────────────────────────────────────────────

function handleBooking(d) {
  var cal = CalendarApp.getCalendarById(CALENDAR_ID) || CalendarApp.getDefaultCalendar();

  var parts = d.date.split('-');
  var year  = parseInt(parts[0]);
  var month = parseInt(parts[1]);
  var day   = parseInt(parts[2]);
  var timeParts = d.time.split(':');
  var hour  = parseInt(timeParts[0]);
  var min   = parseInt(timeParts[1]);

  var start       = new Date(year, month - 1, day, hour, min, 0);
  var end         = new Date(start.getTime() + d.duration * 60 * 1000);
  var bufferedEnd = new Date(end.getTime() + 35 * 60 * 1000); // 35-min buffer after service

  // ── Conflict check — reject if any MaxDriveDetail booking overlaps this slot ──
  var conflicts = cal.getEvents(start, bufferedEnd).filter(function(ev) {
    var t = ev.getTitle();
    return t.indexOf('MaxDriveDetail - ') === 0 || t.indexOf('3S Detailing - ') === 0;
  });
  if (conflicts.length > 0) {
    throw new Error('That time slot is already booked. Please go back and choose a different time.');
  }

  var addonsStr = (d.addons && d.addons.length) ? d.addons.join(', ') : 'None';

  var desc = 'CUSTOMER\n'
    + 'Name:    ' + d.name + '\n'
    + 'Phone:   ' + d.phone + '\n'
    + 'Email:   ' + d.email + '\n'
    + 'Address: ' + d.address + '\n\n'
    + 'SERVICE\n'
    + 'Service:   ' + d.service + '\n'
    + 'Vehicle:   ' + d.vehicle + '\n'
    + 'Size:      ' + d.size + '\n'
    + 'Condition: ' + d.cond + '\n'
    + 'Add-ons:   ' + addonsStr + '\n\n'
    + 'PRICING\n'
    + 'Total:   $' + d.total + '\n'
    + 'Deposit: $' + d.deposit + ' (15%)\n'
    + (d.notes ? '\nNOTES\n' + d.notes : '');

  cal.createEvent(
    'MaxDriveDetail - ' + d.service + ' - ' + d.name,
    start,
    bufferedEnd,
    {
      location:    d.address,
      description: desc
    }
  );

  sendOwnerBookingEmail(d, start, end);
  sendCustomerBookingEmail(d, start, end);
  logToSheet(d, start, end);
}


// ─────────────────────────────────────────────────────────────
// GOOGLE SHEETS LOGGING
// ─────────────────────────────────────────────────────────────

function getSheet() {
  if (SHEET_ID) {
    return SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  }
  // Auto-find or auto-create sheet
  var files = DriveApp.getFilesByName('MaxDriveDetail Bookings');
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next()).getSheets()[0];
  }
  var ss = SpreadsheetApp.create('MaxDriveDetail Bookings');
  var sheet = ss.getSheets()[0];
  sheet.appendRow([
    'Timestamp', 'Name', 'Phone', 'Email', 'Address',
    'Service', 'Vehicle', 'Size', 'Condition', 'Add-ons',
    'Date', 'Time', 'Duration (min)', 'Total', 'Deposit', 'Notes', 'Source',
    'Date Raw', 'Reminder Sent', 'Followup Sent'
  ]);
  sheet.setFrozenRows(1);
  return sheet;
}

function logToSheet(d, start, end) {
  try {
    var sheet    = getSheet();
    var addonsStr = (d.addons && d.addons.length) ? d.addons.join(', ') : 'None';
    var totalStr  = d.total  ? '$' + d.total  : '—';
    var depStr    = d.deposit ? '$' + d.deposit : '—';
    var source    = d.source || 'website';
    sheet.appendRow([
      new Date().toLocaleString(),
      d.name     || '',
      d.phone    || '',
      d.email    || '',
      d.address  || '',
      d.service  || '',
      d.vehicle  || '',
      d.size     || '',
      d.cond     || '',
      addonsStr,
      formatDate(start),
      formatTime(start) + ' - ' + formatTime(end),
      d.duration || '',
      totalStr,
      depStr,
      d.notes    || '',
      source,
      d.date     || '',   // ISO date for automated email checks
      '',                  // Reminder Sent (filled by runDailyEmailChecks)
      ''                   // Followup Sent (filled by runDailyEmailChecks)
    ]);
  } catch(err) {
    // Fail silently — sheet logging shouldn't break the booking
  }
}

// Manual test: run this in Apps Script to verify sheet logging works
function testSheetLog() {
  var start = new Date(2026, 4, 23, 14, 0, 0);
  var end   = new Date(2026, 4, 23, 16, 0, 0);
  logToSheet({
    name:'Test Customer', phone:'5712787350', email:'test@test.com',
    address:'123 Main St, Vienna VA', service:'Deep Clean',
    vehicle:'2022 Toyota Camry (Black)', size:'Sedan', cond:'Normal',
    addons:[], duration:120, total:175, deposit:26, notes:''
  }, start, end);
  Logger.log('Row logged successfully');
}


// ─────────────────────────────────────────────────────────────
// EMAIL HANDLERS
// ─────────────────────────────────────────────────────────────

function sendOwnerBookingEmail(d, start, end) {
  var timeStr = formatTime(start) + ' - ' + formatTime(end);
  var dateStr = formatDate(start);
  var addonsStr = (d.addons && d.addons.length) ? d.addons.join(', ') : 'None';

  var html = '<div style="font-family:Arial,sans-serif;max-width:560px;color:#111;">'
    + '<div style="background:#8B1A1A;padding:20px 28px;">'
    + '<h1 style="color:#fff;margin:0;font-size:20px;">New Booking — MaxDriveDetail</h1>'
    + '</div>'
    + '<div style="padding:28px;background:#f9f9f9;border:1px solid #e5e5e5;">'
    + '<table style="width:100%;border-collapse:collapse;font-size:14px;">'
    + '<tr><td style="padding:8px 0;color:#888;width:110px;">Customer</td><td style="padding:8px 0;font-weight:700;">' + d.name + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;">' + d.phone + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;">' + d.email + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Address</td><td style="padding:8px 0;">' + d.address + '</td></tr>'
    + '<tr><td colspan="2"><hr style="border:none;border-top:1px solid #e5e5e5;margin:8px 0;"></td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Service</td><td style="padding:8px 0;font-weight:700;">' + d.service + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Vehicle</td><td style="padding:8px 0;">' + d.vehicle + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Size</td><td style="padding:8px 0;">' + d.size + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Condition</td><td style="padding:8px 0;">' + d.cond + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Add-ons</td><td style="padding:8px 0;">' + addonsStr + '</td></tr>'
    + '<tr><td colspan="2"><hr style="border:none;border-top:1px solid #e5e5e5;margin:8px 0;"></td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Date</td><td style="padding:8px 0;font-weight:700;">' + dateStr + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Time</td><td style="padding:8px 0;">' + timeStr + '</td></tr>'
    + '<tr><td colspan="2"><hr style="border:none;border-top:1px solid #e5e5e5;margin:8px 0;"></td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Total</td><td style="padding:8px 0;font-size:18px;font-weight:700;">$' + d.total + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Deposit</td><td style="padding:8px 0;">$' + d.deposit + ' (15%)</td></tr>'
    + (d.notes ? '<tr><td style="padding:8px 0;color:#888;vertical-align:top;">Notes</td><td style="padding:8px 0;">' + d.notes + '</td></tr>' : '')
    + '</table>'
    + '</div>'
    + '<div style="padding:16px 28px;background:#fff;border:1px solid #e5e5e5;border-top:none;font-size:12px;color:#888;">Event added to your Google Calendar · MaxDriveDetail, Vienna VA</div>'
    + '</div>';

  GmailApp.sendEmail(
    OWNER_EMAIL,
    'New Booking: ' + d.name + ' — ' + d.service + ' · ' + dateStr,
    'New booking from ' + d.name + ' for ' + d.service + ' on ' + dateStr,
    { htmlBody: html }
  );
}

function sendCustomerBookingEmail(d, start, end) {
  var timeStr = formatTime(start) + ' - ' + formatTime(end);
  var dateStr = formatDate(start);
  var firstName = d.name.split(' ')[0];

  var depositNote = DEPOSIT_LINK
    ? '<p>Please send the $' + d.deposit + ' deposit to confirm your spot: <a href="' + DEPOSIT_LINK + '">' + DEPOSIT_LINK + '</a></p>'
    : '<p>A $' + d.deposit + ' deposit is due to confirm your appointment. Zach will reach out to collect it.</p>';

  var html = '<div style="font-family:Arial,sans-serif;max-width:560px;color:#111;">'
    + '<div style="background:#8B1A1A;padding:24px 28px;">'
    + '<h1 style="color:#fff;margin:0;font-size:22px;">You\'re Booked.</h1>'
    + '<p style="color:rgba(255,255,255,.75);margin:6px 0 0;font-size:14px;">MaxDriveDetail · Vienna, VA</p>'
    + '</div>'
    + '<div style="padding:28px;background:#f9f9f9;border:1px solid #e5e5e5;">'
    + '<p style="font-size:15px;margin:0 0 24px;">Hey ' + firstName + ', your detail is confirmed. Here\'s your summary:</p>'
    + '<table style="width:100%;border-collapse:collapse;font-size:14px;">'
    + '<tr><td style="padding:8px 0;color:#888;width:110px;">Service</td><td style="padding:8px 0;font-weight:700;">' + d.service + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Vehicle</td><td style="padding:8px 0;">' + d.vehicle + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Date</td><td style="padding:8px 0;font-weight:700;">' + dateStr + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Time</td><td style="padding:8px 0;">' + timeStr + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Location</td><td style="padding:8px 0;">' + d.address + '</td></tr>'
    + '<tr><td colspan="2"><hr style="border:none;border-top:1px solid #e5e5e5;margin:8px 0;"></td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Total</td><td style="padding:8px 0;font-size:18px;font-weight:700;">$' + d.total + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Deposit due</td><td style="padding:8px 0;">$' + d.deposit + '</td></tr>'
    + '</table>'
    + '</div>'
    + '<div style="padding:24px 28px;background:#fff;border:1px solid #e5e5e5;border-top:none;font-size:13px;line-height:1.7;color:#444;">'
    + depositNote
    + '<p style="margin:16px 0 8px;font-weight:700;">Before your appointment:</p>'
    + '<ul style="margin:0;padding-left:20px;color:#555;font-size:13px;line-height:1.8;">'
    + '<li>Remove personal items (chargers, sunglasses, garage keys, etc.)</li>'
    + '<li>Make sure the car is accessible — no need to be home</li>'
    + '<li>Park in shade or a covered spot if possible</li>'
    + '<li>Avoid washing the car in the 24 hrs before the appointment</li>'
    + '<li>Let Zach know about any specific problem areas when he arrives</li>'
    + '</ul>'
    + '<p style="margin-top:16px;"><strong>Need to cancel or reschedule?</strong> Text Zach at (571) 278-7350 with at least 24 hrs notice.</p>'
    + '</div>'
    + '<div style="padding:16px 28px;background:#f5f5f5;border:1px solid #e5e5e5;border-top:none;font-size:11px;color:#aaa;">'
    + 'MaxDriveDetail · Vienna, VA · (571) 278-7350 · maxdrivedetail.com'
    + '</div>'
    + '</div>';

  GmailApp.sendEmail(
    d.email,
    'Booking Confirmed — ' + d.service + ' · ' + dateStr,
    'Your MaxDriveDetail appointment is confirmed for ' + dateStr + ' at ' + formatTime(start) + '. Total: $' + d.total + '. Questions? Text Zach at (571) 278-7350.',
    { htmlBody: html, replyTo: OWNER_EMAIL }
  );
}

function handleContact(d) {
  var html = '<div style="font-family:Arial,sans-serif;max-width:560px;color:#111;">'
    + '<div style="background:#8B1A1A;padding:20px 28px;">'
    + '<h1 style="color:#fff;margin:0;font-size:18px;">New Contact Message — MaxDriveDetail</h1>'
    + '</div>'
    + '<div style="padding:24px 28px;background:#f9f9f9;border:1px solid #e5e5e5;">'
    + '<table style="font-size:14px;width:100%;border-collapse:collapse;">'
    + '<tr><td style="padding:7px 0;color:#888;width:90px;">Name</td><td style="padding:7px 0;font-weight:700;">' + d.name + '</td></tr>'
    + '<tr><td style="padding:7px 0;color:#888;">Email</td><td style="padding:7px 0;">' + d.email + '</td></tr>'
    + '<tr><td style="padding:7px 0;color:#888;">Phone</td><td style="padding:7px 0;">' + (d.phone || '-') + '</td></tr>'
    + '<tr><td style="padding:7px 0;color:#888;">Subject</td><td style="padding:7px 0;">' + (d.subject || '-') + '</td></tr>'
    + '<tr><td style="padding:7px 0;color:#888;">Vehicle</td><td style="padding:7px 0;">' + (d.vehicle || '-') + '</td></tr>'
    + '<tr><td colspan="2"><hr style="border:none;border-top:1px solid #e5e5e5;margin:8px 0;"></td></tr>'
    + '<tr><td style="padding:7px 0;color:#888;vertical-align:top;">Message</td><td style="padding:7px 0;">' + d.message + '</td></tr>'
    + '</table>'
    + '</div>'
    + '</div>';

  GmailApp.sendEmail(
    OWNER_EMAIL,
    'Website Message: ' + (d.subject || 'General') + ' - ' + d.name,
    d.name + ' sent a message: ' + d.message,
    { htmlBody: html, replyTo: d.email }
  );
}


// ─────────────────────────────────────────────────────────────
// AUTOMATED EMAIL CHAIN
// ─────────────────────────────────────────────────────────────

/**
 * Sends a day-before reminder to the customer.
 * Called automatically by runDailyEmailChecks().
 * d = { name, email, service, timeStr, vehicle, total, address }
 */
function sendDayBeforeReminder(d, apptDate) {
  var firstName = d.name.split(' ')[0];
  var dateStr   = formatDate(apptDate);

  var html = '<div style="font-family:Arial,sans-serif;max-width:560px;color:#111;">'
    + '<div style="background:#8B1A1A;padding:24px 28px;">'
    + '<h1 style="color:#fff;margin:0;font-size:22px;">See you tomorrow, ' + firstName + '!</h1>'
    + '<p style="color:rgba(255,255,255,.75);margin:6px 0 0;font-size:14px;">MaxDriveDetail · Vienna, VA</p>'
    + '</div>'
    + '<div style="padding:28px;background:#f9f9f9;border:1px solid #e5e5e5;">'
    + '<p style="font-size:15px;margin:0 0 20px;">Just a quick reminder about your detail tomorrow:</p>'
    + '<table style="width:100%;border-collapse:collapse;font-size:14px;">'
    + '<tr><td style="padding:8px 0;color:#888;width:110px;">Service</td><td style="padding:8px 0;font-weight:700;">' + d.service + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Vehicle</td><td style="padding:8px 0;">' + d.vehicle + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Date</td><td style="padding:8px 0;font-weight:700;">' + dateStr + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Time</td><td style="padding:8px 0;">' + d.timeStr + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Location</td><td style="padding:8px 0;">' + d.address + '</td></tr>'
    + '<tr><td style="padding:8px 0;color:#888;">Total</td><td style="padding:8px 0;font-weight:700;">$' + d.total + '</td></tr>'
    + '</table>'
    + '</div>'
    + '<div style="padding:24px 28px;background:#fff;border:1px solid #e5e5e5;border-top:none;font-size:13px;line-height:1.8;color:#444;">'
    + '<p style="margin:0 0 8px;font-weight:700;">Quick prep checklist:</p>'
    + '<ul style="margin:0;padding-left:20px;color:#555;font-size:13px;line-height:1.9;">'
    + '<li>Remove personal items (chargers, sunglasses, garage keys, etc.)</li>'
    + '<li>Make sure the car is accessible — no need to be home</li>'
    + '<li>Park in shade or a covered spot if possible</li>'
    + '<li>Don\'t wash the car beforehand — leave it for Zach</li>'
    + '</ul>'
    + '<p style="margin-top:16px;">Need to cancel or reschedule? Text Zach at <strong>(571) 278-7350</strong> ASAP.</p>'
    + '</div>'
    + '<div style="padding:16px 28px;background:#f5f5f5;border:1px solid #e5e5e5;border-top:none;font-size:11px;color:#aaa;">'
    + 'MaxDriveDetail · Vienna, VA · (571) 278-7350 · maxdrivedetail.com'
    + '</div>'
    + '</div>';

  GmailApp.sendEmail(
    d.email,
    'Tomorrow: ' + d.service + ' at ' + d.timeStr.split(' - ')[0],
    'Reminder: your ' + d.service + ' is tomorrow at ' + d.timeStr + '. Questions? Text Zach at (571) 278-7350.',
    { htmlBody: html, replyTo: OWNER_EMAIL }
  );
}

/**
 * Sends a 2-day post-service follow-up asking for a Google review.
 * Called automatically by runDailyEmailChecks().
 * d = { name, email, service }
 */
function sendFollowupEmail(d, apptDate) {
  var firstName = d.name.split(' ')[0];
  var dateStr   = formatDate(apptDate);
  var reviewBtn = REVIEW_LINK
    ? '<p style="text-align:center;margin:24px 0;"><a href="' + REVIEW_LINK + '" style="background:#8B1A1A;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:700;display:inline-block;">Leave a Google Review ★</a></p>'
    : '<p>Leave us a review on Google — it helps other car owners find MaxDriveDetail!</p>';

  var html = '<div style="font-family:Arial,sans-serif;max-width:560px;color:#111;">'
    + '<div style="background:#8B1A1A;padding:24px 28px;">'
    + '<h1 style="color:#fff;margin:0;font-size:22px;">How did it go, ' + firstName + '?</h1>'
    + '<p style="color:rgba(255,255,255,.75);margin:6px 0 0;font-size:14px;">MaxDriveDetail · Vienna, VA</p>'
    + '</div>'
    + '<div style="padding:28px;background:#f9f9f9;border:1px solid #e5e5e5;">'
    + '<p style="font-size:15px;margin:0 0 12px;">Hope you\'re loving how your ' + d.service + ' turned out on ' + dateStr + '!</p>'
    + '<p style="font-size:14px;color:#555;margin:0;">If you had a great experience, it would mean a lot if you took 30 seconds to leave a quick review. It helps other people in the area find us.</p>'
    + reviewBtn
    + '</div>'
    + '<div style="padding:24px 28px;background:#fff;border:1px solid #e5e5e5;border-top:none;font-size:13px;line-height:1.7;color:#444;">'
    + '<p style="margin:0;">Due for another detail? <a href="https://maxdrivedetail.com/book.html" style="color:#8B1A1A;font-weight:700;">Book online</a> or text Zach at (571) 278-7350.</p>'
    + '<p style="margin-top:12px;font-size:12px;color:#888;">If something wasn\'t right, reply to this email — I\'ll make it right.</p>'
    + '</div>'
    + '<div style="padding:16px 28px;background:#f5f5f5;border:1px solid #e5e5e5;border-top:none;font-size:11px;color:#aaa;">'
    + 'MaxDriveDetail · Vienna, VA · (571) 278-7350 · maxdrivedetail.com'
    + '</div>'
    + '</div>';

  GmailApp.sendEmail(
    d.email,
    'How was your ' + d.service + ', ' + firstName + '?',
    'Hope everything looked great! If you have a minute, a Google review goes a long way. — Zach',
    { htmlBody: html, replyTo: OWNER_EMAIL }
  );
}

/**
 * Run by a daily time-based trigger (set up via setupDailyTrigger()).
 * Scans the bookings sheet for:
 *   - Appointments tomorrow  → sends day-before reminder
 *   - Appointments 2 days ago → sends follow-up / review request
 */
function runDailyEmailChecks() {
  try {
    var sheet = getSheet();
    if (!sheet) return;
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return;

    var headers      = data[0];
    var dateRawIdx   = headers.indexOf('Date Raw');
    var reminderIdx  = headers.indexOf('Reminder Sent');
    var followupIdx  = headers.indexOf('Followup Sent');
    var nameIdx      = headers.indexOf('Name');
    var emailIdx     = headers.indexOf('Email');
    var serviceIdx   = headers.indexOf('Service');
    var timeIdx      = headers.indexOf('Time');
    var vehicleIdx   = headers.indexOf('Vehicle');
    var totalIdx     = headers.indexOf('Total');
    var addressIdx   = headers.indexOf('Address');

    if (dateRawIdx === -1 || reminderIdx === -1 || followupIdx === -1) return; // old sheet format

    var today      = new Date(); today.setHours(0,0,0,0);
    var tomorrow   = new Date(today.getTime() + 24*60*60*1000);
    var twoDaysAgo = new Date(today.getTime() - 2*24*60*60*1000);

    for (var i = 1; i < data.length; i++) {
      var row     = data[i];
      var dateRaw = String(row[dateRawIdx] || '');
      if (!dateRaw || dateRaw.indexOf('-') === -1) continue;

      var parts    = dateRaw.split('-');
      var apptDate = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
      apptDate.setHours(0,0,0,0);

      var d = {
        name:    String(row[nameIdx]    || ''),
        email:   String(row[emailIdx]   || ''),
        service: String(row[serviceIdx] || ''),
        timeStr: String(row[timeIdx]    || ''),
        vehicle: String(row[vehicleIdx] || ''),
        total:   String(row[totalIdx]   || '').replace('$',''),
        address: String(row[addressIdx] || '')
      };
      if (!d.email) continue;

      // Day-before reminder
      if (!row[reminderIdx] && apptDate.getTime() === tomorrow.getTime()) {
        sendDayBeforeReminder(d, apptDate);
        sheet.getRange(i + 1, reminderIdx + 1).setValue(new Date().toLocaleString());
      }

      // 2-day follow-up
      if (!row[followupIdx] && apptDate.getTime() === twoDaysAgo.getTime()) {
        sendFollowupEmail(d, apptDate);
        sheet.getRange(i + 1, followupIdx + 1).setValue(new Date().toLocaleString());
      }
    }
  } catch(err) {
    Logger.log('runDailyEmailChecks error: ' + err.message);
  }
}

/**
 * Run ONCE manually from the Apps Script editor to register the daily trigger.
 * After running, you'll see a trigger in Triggers (clock icon) set for 8am daily.
 * Safe to re-run — it removes the old trigger first to prevent duplicates.
 */
function setupDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'runDailyEmailChecks') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('runDailyEmailChecks')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
  Logger.log('Daily trigger set: runDailyEmailChecks will run at 8am every day.');
}


// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatDate(date) {
  var days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return days[date.getDay()] + ', ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}

function formatTime(date) {
  var h = date.getHours();
  var m = date.getMinutes();
  var ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
}

// Run this manually in Apps Script to test calendar
function testCalendar() {
  var cal = CalendarApp.getDefaultCalendar();
  var start = new Date(2026, 4, 23, 14, 0, 0);
  var end   = new Date(2026, 4, 23, 16, 0, 0);
  cal.createEvent('TEST - 3S Detailing', start, end, { description: 'Test event' });
  Logger.log('Event created on: ' + cal.getName());
}
