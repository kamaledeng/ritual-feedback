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

function doGet() {
  return jsonResponse({ ok: true, message: "Ritual Feedback endpoint is running" });
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
