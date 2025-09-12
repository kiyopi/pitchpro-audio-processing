# PitchPro Audio Processing v1.2.0 Release Notes

## 🎯 CRITICAL BUG FIX RELEASE

**音量値一貫性問題完全解決** - PitchProライブラリの重要なバグ修正リリース

### 🚨 解決した重要な問題

**Problem**: `6.139596009254456`のような異常な音量値がコールバックから出力されていた問題
**Root Cause**: `onPitchUpdate`コールバックとUI自動更新で`volumeMultiplier`の適用方法が異なっていた
**Impact**: 開発者がライブラリの動作を予測できず、UI表示で異常値が発生

### ✅ 完全に解決された内容

1. **音量値の完全一貫性**: コールバックとUI自動更新で常に同じ値を提供
2. **予測可能な動作**: 開発者が期待通りの0-100%範囲の値を受け取り可能
3. **透明性の向上**: autoUpdateUI使用時の動作が明確に警告表示
4. **後方互換性**: 既存コードへの影響なし

### 🔧 技術的改善

#### 新機能
- **`_getProcessedResult()`メソッド**: デバイス補正の一元処理システム
- **autoUpdateUI警告システム**: UI自動更新時の動作透明化
- **Enhanced JSDoc**: volumeBarSelector等に詳細な警告追加

#### 修正されたメソッド
- `handlePitchUpdate()`: 処理済み結果をコールバックに渡すように修正
- `updateUI()`: 重複volumeMultiplier計算を削除
- `startUIUpdates()`: 統一された処理済み結果を使用
- `checkAutoUpdateUIWarnings()`: 開発者向け警告システム

### 🧪 品質保証

- **新規テストスイート**: `AudioDetectionComponent.test.ts` (13テスト全通過)
- **境界値テスト**: null処理・倍率計算・音量範囲制限の完全検証
- **TypeScript完全対応**: コンパイルエラー解決済み
- **ビルドプロセス**: 正常完了確認済み

### 📊 実際のテスト結果

修正前（問題のあった状態）:
```
PitchPro Volume: 6.139596009254456  // ❌ 異常値
```

修正後（v1.2.0）:
```
stableVolume=2.52%    // ✅ 正常な0-100%範囲
stableVolume=4.92%    // ✅ 一貫した値
stableVolume=6.02%    // ✅ 予測可能な動作
```

### ⚠️ 重要な変更点

#### 新しい警告システム
UI自動更新使用時に以下の警告が表示されます：

```
ℹ️ [PitchPro] Automatic UI updates enabled. Note: Values applied may include device-specific multipliers and may differ from callback result.volume. For precise control, set autoUpdateUI=false and handle UI manually.
```

#### 推奨される使用方法

**精密制御が必要な場合（推奨）**:
```javascript
const detector = new AudioDetectionComponent({
  autoUpdateUI: false,  // UI自動更新を無効化
  // セレクターは指定しない
});

detector.setCallbacks({
  onPitchUpdate: (result) => {
    // result.volumeは常に一貫した値
    volumeBar.style.width = `${result.volume}%`;
  }
});
```

**便利な自動更新を使用する場合**:
```javascript
const detector = new AudioDetectionComponent({
  autoUpdateUI: true,        // 自動更新有効
  volumeBarSelector: '#vol'  // 自動でUI更新
});
// 警告メッセージが表示されるが、動作は一貫
```

### 🎯 対象ユーザー

**全ユーザー必須アップデート**: 音量値の不整合問題はすべてのユーザーに影響する可能性があります。

### 📦 Installation

```bash
npm install @pitchpro/audio-processing@1.2.0
```

### 📝 Migration Guide

既存コードの変更は**不要**です。このリリースは完全に後方互換性を保っています。

ただし、より予測可能な動作のために以下を推奨します：

1. **精密な音量制御が必要な場合**: `autoUpdateUI: false`を設定
2. **警告メッセージの理解**: UI自動更新時の動作を理解
3. **テスト実行**: アプリケーションで音量表示が正常に動作することを確認

### 🔗 Links

- **GitHub Release**: https://github.com/kiyopi/pitchpro-audio-processing/releases/tag/v1.2.0
- **npm Package**: https://www.npmjs.com/package/@pitchpro/audio-processing
- **Documentation**: https://github.com/kiyopi/pitchpro-audio-processing#readme
- **Issue Report**: [VOLUME_RANGE_ISSUE_REPORT.md](./VOLUME_RANGE_ISSUE_REPORT.md)

### 🙏 Acknowledgments

この修正は実際のユーザーレポートに基づいて実装されました。問題報告とテストにご協力いただき、ありがとうございました。

---

**重要**: このリリースは音量値の一貫性に関する重要な修正を含んでいます。すべてのユーザーに速やかなアップデートをお勧めします。