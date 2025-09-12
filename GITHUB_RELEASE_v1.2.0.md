# 🎯 v1.2.0 - 音量値一貫性問題完全解決

## ⚡ Critical Bug Fix Release

このリリースは、PitchProライブラリの**音量値に関する重要なバグ修正**を含みます。

### 🚨 解決した問題

**Before (v1.1.9)**:
```javascript
// コールバックから異常な値が出力される問題
onPitchUpdate: (result) => {
  console.log(result.volume); // 6.139596009254456 ❌ 異常値
}
```

**After (v1.2.0)**:
```javascript
// 正常な0-100%範囲の値が返される
onPitchUpdate: (result) => {
  console.log(result.volume); // 25.19 ✅ 正常値
}
```

### ✨ 主な改善点

#### 🔧 音量値の完全一貫性
- `onPitchUpdate`コールバックとUI自動更新で**完全に同じ値**を保証
- `volumeMultiplier`の重複適用問題を修正
- 0-100%の予測可能な範囲で値を提供

#### ⚠️ 新しい警告システム
```javascript
// autoUpdateUI使用時に透明性を提供
ℹ️ [PitchPro] Automatic UI updates enabled. 
Note: Values applied may include device-specific multipliers...
```

#### 🧪 品質保証
- 新規テストスイート追加（13テスト全通過）
- TypeScript型安全性の完全対応
- 実環境でのログテストで動作確認済み

### 📦 インストール

```bash
npm install @pitchpro/audio-processing@1.2.0
```

CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/@pitchpro/audio-processing@1.2.0/dist/pitchpro.umd.js"></script>
```

Direct Download:
- [pitchpro.umd.js](https://github.com/kiyopi/pitchpro-audio-processing/releases/download/v1.2.0/pitchpro.umd.js)
- [pitchpro-v1.2.0.umd.js](https://github.com/kiyopi/pitchpro-audio-processing/releases/download/v1.2.0/pitchpro-v1.2.0.umd.js)

### 💡 推奨される使用方法

**精密な音量制御が必要な場合**:
```javascript
const detector = new AudioDetectionComponent({
  autoUpdateUI: false,  // 手動でUI制御
});

detector.setCallbacks({
  onPitchUpdate: (result) => {
    // result.volumeは常に一貫した値（0-100%）
    volumeBar.style.width = `${result.volume}%`;
  }
});
```

**便利な自動更新を使用する場合**:
```javascript
const detector = new AudioDetectionComponent({
  autoUpdateUI: true,
  volumeBarSelector: '#volume-bar'  // 自動でUI更新
});
// 透明性のための警告が表示されますが、値は一貫しています
```

### 🔄 マイグレーション

**後方互換性完全維持** - 既存コードの変更は不要です。

### 📊 実証済みの改善

実際のテストログで確認された改善:
- ❌ Before: `6.139596009254456`のような異常値
- ✅ After: `25.19%`, `23.98%`, `11.05%`のような正常値

### 🙏 謝辞

この修正は実際のユーザーレポートに基づいて実装されました。  
問題報告とテストにご協力いただいた皆様に感謝いたします。

---

## 📝 What's Changed

### Bug Fixes
- fix: 音量値一貫性問題を解決 - callback/UI値の統合処理実装 (#fe81537)

### Features
- feat: `_getProcessedResult()`メソッドによる一元的音量処理システム
- feat: autoUpdateUI警告システムで開発者への透明性向上
- feat: Enhanced JSDoc with detailed warnings for UI selectors

### Tests
- test: AudioDetectionComponent.test.ts追加 (13テスト)
- test: 境界値・null処理・倍率計算の包括的検証

### Documentation
- docs: VOLUME_RANGE_ISSUE_REPORT.md詳細調査レポート追加
- docs: CHANGELOG.md v1.2.0エントリー追加
- docs: README.md バージョン表記更新

---

**⚠️ 重要**: このリリースは音量値の一貫性に関する重要な修正を含みます。  
すべてのユーザーに速やかなアップデートをお勧めします。

**Full Changelog**: https://github.com/kiyopi/pitchpro-audio-processing/compare/v1.1.9...v1.2.0