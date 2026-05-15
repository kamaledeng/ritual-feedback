const SHEET_NAME = "Responses";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreateSheet(spreadsheet);
    const data = JSON.parse(e.postData.contents || "{}");

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Discord Username",
        "Wallet Address",
        "Short Wallet",
        "Stage",
        "Category",
        "Priority Topic",
        "Community Need",
        "Interest Reason",
        "Clarity Score",
        "Content Format",
        "Community Activity",
        "Use Case",
        "Blocker",
        "Urgency",
        "Community Role",
        "Title",
        "Message",
        "Signature"
      ]);
    }

    sheet.appendRow([
      new Date(),
      data.discordName || "",
      data.walletAddress || "",
      data.address || "",
      data.stage || "",
      data.category || "",
      data.priorityTopic || "",
      data.communityNeed || "",
      data.interestReason || "",
      data.clarityScore || "",
      data.contentFormat || "",
      data.communityActivity || "",
      data.useCase || "",
      data.blocker || "",
      data.urgency || "",
      data.builderType || "",
      data.title || "",
      data.message || "",
      data.signature || ""
    ]);

    return jsonResponse({ ok: true, message: "Feedback saved" });
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(spreadsheet);
  const callback = e && e.parameter && e.parameter.callback;
  const payload = {
    ok: true,
    message: "Ritual Feedback endpoint is running",
    feedback: readLatestFeedback(sheet)
  };

  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(payload)})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return jsonResponse(payload);
}

function readLatestFeedback(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  const rows = values.slice(1).reverse().slice(0, 12);

  return rows.map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[normalizeHeader(header)] = row[index] instanceof Date
        ? Utilities.formatDate(row[index], Session.getScriptTimeZone(), "MMM d")
        : row[index];
    });

    return {
      discordName: item.discordUsername || "",
      walletAddress: item.walletAddress || "",
      address: item.shortWallet || "",
      stage: item.stage || "",
      category: item.category || "",
      priorityTopic: item.priorityTopic || "",
      communityNeed: item.communityNeed || "",
      interestReason: item.interestReason || "",
      clarityScore: item.clarityScore || "",
      contentFormat: item.contentFormat || "",
      communityActivity: item.communityActivity || "",
      useCase: item.useCase || "",
      blocker: item.blocker || "",
      urgency: item.urgency || "",
      builderType: item.communityRole || "",
      title: item.title || "",
      message: item.message || "",
      signaturePreview: item.signature ? `${String(item.signature).slice(0, 10)}...${String(item.signature).slice(-8)}` : "",
      createdAt: item.timestamp || ""
    };
  });
}

function normalizeHeader(header) {
  return String(header)
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

function getOrCreateSheet(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
