/**
 * Google Apps Script code mẫu để nhận lead từ landing page.
 * Tách ra file riêng để dễ bảo trì + dễ copy sang tài liệu.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `
// ================================================================
// GOOGLE APPS SCRIPT LƯU THÔNG TIN KHÁCH HÀNG TỪ LANDING PAGE VÀO GOOGLE SHEET
// ================================================================
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Nếu sheet chưa có tiêu đề, tạo hàng tiêu đề đầu tiên
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời Gian",
        "Họ Tên",
        "Số Điện Thoại",
        "Dự Án",
        "Mã Căn",
        "Loại Căn",
        "Hành Động / Yêu Cầu",
        "Ghi Chú",
        "Nguồn"
      ]);
      sheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#4285F4").setFontColor("#FFFFFF");
    }

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date(),
      data.fullName || "Khách hàng",
      "'" + (data.phoneNumber || ""), // Giữ số 0 ở đầu SĐT
      data.projectName || "",
      data.unitCode || "",
      data.unitType || "",
      data.action || "",
      data.note || "",
      data.source || "Landing Page Căn Hộ"
    ]);

    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Lead saved successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
