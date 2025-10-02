# PitchPro v1.3.1 リリースファイル更新案内

## 🔄 更新内容

**v1.3.1既存リリースの軽微な修正**として、以下のファイルを最新版に更新しました：

### 🔧 **修正された問題**
- **ノイズゲート計算ロジック**: スケール不整合による音声ブロック問題の完全解決
- **音量レベル最適化**: 100%飽和問題の解決と適正60%レベルの実現
- **GitHub Pages対応**: HTTPS環境での検証ページ完全対応

### 📦 **更新ファイル一覧**

#### **メインディストリビューション**
- **`pitchpro.umd.js`** (135KB) - UMDモジュール版（推奨）
- **`index.esm.js`** (251KB) - ES Module版
- **`pitchpro.cjs.js`** (135KB) - CommonJS版
- **`index.d.ts`** (2.5KB) - TypeScript型定義

### 🎯 **技術的改善**

#### **ノイズゲート修正**
```typescript
// 修正前: スケール不整合
const initialVolume = rawResult.volume * 50;           // ×50スケール
const noiseGateThreshold = deviceSpecs.noiseGate * 100; // ×100スケール

// 修正後: 統一スケーリング
const RMS_TO_PERCENT_FACTOR = 200;                     // 統一スケール
const volumeAsPercent = rawResult.volume * RMS_TO_PERCENT_FACTOR;
const noiseGateThresholdPercent = baseNoiseGate * 100 * 10; // 環境ノイズ対応
```

#### **音量レベル最適化**
| デバイス | volumeMultiplier変更 | 効果 |
|---------|-------------------|------|
| PC | 7.5 → 2.5 (67%削減) | 100%飽和 → 60%適正 |
| iPhone | 9.0 → 3.0 (67%削減) | 即座100% → 60%適正 |
| iPad | 13.0 → 4.0 (69%削減) | 過度反応 → 60%適正 |

### 🌐 **検証環境**

#### **GitHub Pages検証URL**
```
https://kiyopi.github.io/pitchpro-audio-processing/test-volume-bar-nocache.html
https://kiyopi.github.io/pitchpro-audio-processing/test-volume-bar-fix.html
https://kiyopi.github.io/pitchpro-audio-processing/test-readme-methods-verification.html
```

#### **期待される動作**
- 🔇 **無音時**: `❌ BLOCK: RMS=0.0475, 9.5% < 23%` (環境ノイズ除去)
- 🎤 **発声時**: `✅ PASS: RMS=0.1195, 23.9% > 23%, Final=59.7%` (適正音量)
- 📱 **マルチデバイス**: PC/iPhone/iPad固有設定の自動適用

### 📋 **使用方法**

#### **CDN利用（推奨）**
```html
<script src="https://cdn.jsdelivr.net/npm/@pitchpro/audio-processing@1.3.1/dist/pitchpro.umd.js"></script>
```

#### **直接ダウンロード**
```bash
# 最新版ファイルをGitHubリリースページからダウンロード
curl -L -O https://github.com/kiyopi/pitchpro-audio-processing/releases/download/v1.3.1/pitchpro.umd.js
```

### ✅ **動作確認済み環境**
- **PC**: Chrome 80+, Firefox 75+, Safari 14+, Edge 80+
- **iPhone**: iOS Safari 14+
- **iPad**: iPadOS Safari 14+
- **Android**: Chrome Mobile 80+

---

**重要**: これは**v1.3.1の軽微な修正**であり、APIや基本機能に変更はありません。既存の実装をそのまま利用できます。

**更新日**: 2025年10月1日
**対象バージョン**: v1.3.1（既存リリース）