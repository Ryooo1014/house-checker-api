/**
 * 
 * 
 */
const SPREADSHEET_ID = '1HztjXKiH-nPuQnBw0-u5iZs7Y7n-pXdngimhv1DaNWg'; // データを保存したいスプレッドシートのID
const ALL_DATA_SHEET_NAMES =["木造シート","S構造シート","R構造シート"];
const USER_SHEET_NAME = 'user';
const DEBUG_LOG_SHEET_NAME = "jsonログ";
const STRUCTURE_MAP = {
  "W": { sheetName: "木造シート", prefix: "W_" },
  "S": { sheetName: "S構造シート", prefix: "S_" },
  "R": { sheetName: "R構造シート", prefix: "R_" }
};

//ログイン機能関連
// 管理者専用コード (POSTリクエストで送られてくるべきコード)
const ADMIN_CODE = "12345";
// 認証トークンの有効期限 (秒) - 推奨: 300秒 (5分)
const TOKEN_EXPIRY_SECONDS = 300; 