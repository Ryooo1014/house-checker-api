/**
 * 木造シート・S構造シート・R構造シートの全データ行を削除します。
 * ヘッダー行（1行目）は保持されます。
 * GASスクリプトエディタからこの関数を直接実行してください。
 */
function clearAllSheetData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const targetSheets = ALL_DATA_SHEET_NAMES;

  targetSheets.forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log(`シート「${sheetName}」が見つかりません。スキップします。`);
      return;
    }
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log(`シート「${sheetName}」: データ行なし。スキップします。`);
      return;
    }
    sheet.deleteRows(2, lastRow - 1);
    Logger.log(`シート「${sheetName}」: ${lastRow - 1}行のデータを削除しました。`);
  });

  Logger.log('✅ 全シートのデータ削除が完了しました。');
}

/**
 * データの型を厳密に検証するデバッグ関数
 * Flutterの InvestigationUnit モデルの要求（String or List<String>）を満たしているかチェックします。
 */
function debugGetRecordResponse() {
  // --- テスト設定 ---
  const TEST_UUID = "W_72207ee1-6097-4dd9-b8d9-4e56ae544b97"; // 検証したい実データのUUID
  
  const e = {
    parameter: {
      mode: "getrecord",
      uuid: TEST_UUID
    }
  };

  try {
    // 実際にAPI(doGet)を実行してレスポンスを取得
    const output = doGet(e);
    const response = JSON.parse(output.getContent());

    if (response.status !== "success") {
      Logger.log("❌ エラーレスポンス: " + response.message);
      if (response.message.includes("見つかりません")) {
        Logger.log("💡 アドバイス: 指定した UUID がスプレッドシートに存在するか確認してください。");
      }
      return;
    }

    const data = response.data;
    
    // 検証ターゲットの設定（Flutterの型定義に準拠）
    // expected: 'string' (単一文字列), 'list' (文字列の配列)
const checkTargets = [
      // --- String型 (IDや管理番号) ---
      { key: 'number', parent: data.unit, name: 'unit.number', expected: 'string' },
      { key: 'buildingNumber', parent: data.overview, name: 'overview.buildingNumber', expected: 'string' },
      { key: 'mapNumber', parent: data.overview, name: 'overview.mapNumber', expected: 'string' },
      { key: 'scale', parent: data.overview, name: 'overview.scale', expected: 'string' },
      { key: 'overallExteriorScore', parent: data.content, name: 'content.overallExteriorScore', expected: 'string' },

      // --- Int型 (数値) ---
      { key: 'surveyCount', parent: data.unit, name: 'unit.surveyCount', expected: 'int' },
      { key: 'floors', parent: data.overview, name: 'overview.floors', expected: 'int' },
      { key: 'exteriorInspectionScore', parent: data.content, name: 'content.exteriorInspectionScore', expected: 'int' },

      // --- List型 (Stringの配列) ---
      { key: 'investigator', parent: data.unit, name: 'unit.investigator', expected: 'list' },
      { key: 'investigatorPrefecture', parent: data.unit, name: 'unit.investigatorPrefecture', expected: 'list' },
      { key: 'investigatorNumber', parent: data.unit, name: 'unit.investigatorNumber', expected: 'list' }
    ];

    Logger.log("========== 📋 Flutter互換性 型チェック開始 ==========");
    
    let allOk = true;

    checkTargets.forEach(target => {
      // 1. 親オブジェクトの存在確認
      if (!target.parent) {
        Logger.log(`⚠️  ${target.name}: 親オブジェクト(unit/overview)が取得データ内に存在しません`);
        allOk = false;
        return;
      }

      const val = target.parent[target.key];
      const typeLabel = typeof val;
      let isValid = false;
      let displayType = typeLabel;

      // 2. 型判定ロジック
      if (target.expected === 'string') {
        // String型であること
        isValid = (typeLabel === 'string');
      } else if (target.expected === 'list') {
        // 配列（List）であり、かつ中身がStringであること
        const isArray = Array.isArray(val);
        const contentIsString = isArray && (val.length === 0 || typeof val[0] === 'string');
        isValid = isArray && contentIsString;
        displayType = isArray ? `List<${typeof val[0]}>` : typeLabel;
      }

      // 3. 結果の出力
      const icon = isValid ? "✅" : "❌";
      Logger.log(`${icon} [${target.name}]`);
      Logger.log(`   期待される型: ${target.expected === 'list' ? 'List<String>' : 'String'}`);
      Logger.log(`   実際の値    : ${JSON.stringify(val)}`);
      Logger.log(`   実際の型    : ${displayType}`);

      if (!isValid) {
        allOk = false;
        Logger.log(`   🚨 問題: ${target.name} が Flutter側で型エラー（Type Mismatch）を起こす可能性があります。`);
      }
    });

    Logger.log("==================================================");
    
    if (allOk) {
      Logger.log("🎉 判定結果: 全ての対象項目が Flutter のモデル通りに構成されています。");
      Logger.log("このデータであればアプリはクラッシュせずにパースできるはずです。");
    } else {
      Logger.log("🚨 判定結果: 型が不一致です！");
      Logger.log("GASの保存処理、または getrecord のレスポンス整形処理を見直してください。");
    }

  } catch (err) {
    Logger.log("❌ 実行エラー: " + err.toString());
    Logger.log("スタックトレース: " + err.stack);
  }
}
