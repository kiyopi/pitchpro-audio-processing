# PitchPro v1.3.14 → v1.3.15 修正内容

## 背景：iOSダッキング問題

**問題**: iPhoneのトレーニングページで、BGM再生中に音量バーが30%程度しか上がらない

**原因**: iOS のオーディオダッキング機能
- マイク入力（PitchPro）と音声出力（Tone.js/基音再生）が同時動作すると、iOSがハウリング防止のためマイク音量を自動的に下げる
- 測定結果：準備ページ80% → トレーニング30%（約2.7倍の減衰）

---

## PitchPro v1.3.14 の変更

### 1. `updateSelectors()`に`autoUpdateUI`オプション追加

**目的**: 準備ページで`autoUpdateUI: true`で作成したAudioDetectorを、トレーニングページで`autoUpdateUI: false`に切り替えられるようにする

**変更ファイル**: `src/components/AudioDetectionComponent.ts`

```typescript
// 変更前
async updateSelectors(selectors: Partial<Pick<AudioDetectionConfig,
    'volumeBarSelector' | 'volumeTextSelector' | 'frequencySelector' | 'noteSelector'>>)

// 変更後
async updateSelectors(selectors: Partial<Pick<AudioDetectionConfig,
    'volumeBarSelector' | 'volumeTextSelector' | 'frequencySelector' | 'noteSelector' | 'autoUpdateUI'>>)
```

### 2. `sensitivity`上限を10.0→20.0に拡張

**目的**: iOSダッキング補正で`setSensitivity(12)`などの値を設定できるようにする

**変更ファイル**: `src/core/AudioManager.ts`

```typescript
// 変更前
const clampedSensitivity = Math.max(0.1, Math.min(10.0, sensitivity));

// 変更後
const clampedSensitivity = Math.max(0.1, Math.min(20.0, sensitivity));
```

### 3. `displayMultiplier`オプション新規追加

**目的**: UI表示のみに倍率を適用し、検出精度に影響を与えずにダッキング補正を実現

**変更ファイル**: `src/components/AudioDetectionComponent.ts`

```typescript
// インターフェースに追加
displayMultiplier?: number;  // デフォルト: 1.0

// updateSelectors()でも変更可能
await audioDetector.updateSelectors({
    volumeBarSelector: '#training-volume-bar',
    displayMultiplier: 3.0  // iOSダッキング補正（約2.7倍の音量低下を補正）
});
```

---

## PitchPro v1.3.15 の変更

### iPhoneの静寂時ノイズ表示問題の修正

**問題**: iPhoneで声を出していないのに音量バーが常に10%表示される

**原因**: 
- 生ノイズ（約5%）× volumeMultiplier(2.0) = 10%
- noiseGate(8%)を超えてしまう

**変更ファイル**: `src/utils/DeviceDetection.ts`

```typescript
// 変更前 (v1.3.14)
case 'iPhone':
  return {
    sensitivity: 2.0,
    noiseGate: 0.08,        // 8%
    volumeMultiplier: 2.0,
    smoothingFactor: 0.1
  };

// 変更後 (v1.3.15)
case 'iPhone':
  return {
    sensitivity: 2.0,
    noiseGate: 0.12,        // 12% (10%ノイズをブロック)
    volumeMultiplier: 2.5,  // 2.5 (ノイズゲート上昇分を補填)
    smoothingFactor: 0.1
  };
```

---

## アプリ側の変更

### trainingController.js (v4.10.5 → v4.11.0)

**目的**: トレーニングページでiOSダッキング補正を適用

**変更箇所**: 2箇所の`updateSelectors()`呼び出し

```javascript
// 変更前
await audioDetector.updateSelectors({
    volumeBarSelector: '#training-volume-progress',
    autoUpdateUI: true
});

// 変更後
await audioDetector.updateSelectors({
    volumeBarSelector: '#training-volume-progress',
    autoUpdateUI: true,
    displayMultiplier: 3.0  // iOSダッキング補正（約2.7倍の音量低下を補正）
});
```

### index.html

```html
<!-- 変更前 -->
<script src="js/core/pitchpro-v1.3.14.umd.js?v=1.3.14"></script>

<!-- 変更後 -->
<script src="js/core/pitchpro-v1.3.15.umd.js?v=1.3.15"></script>
```

---

## 期待される動作

| ページ | BGM | displayMultiplier | 期待動作 |
|-------|-----|-------------------|---------|
| 準備ページ（マイクテスト） | なし | 1.0（デフォルト） | 静寂時0%、声で80%程度 |
| 準備ページ（音域テスト） | なし | 1.0（デフォルト） | 静寂時0%、声で80%程度 |
| トレーニングページ | あり | **3.0** | ダッキング後30%→90%に補正 |

---

## ファイル一覧

### PitchProリポジトリ
- `src/components/AudioDetectionComponent.ts` - autoUpdateUI, displayMultiplier追加
- `src/core/AudioManager.ts` - sensitivity上限拡張
- `src/utils/DeviceDetection.ts` - iPhone noiseGate/volumeMultiplier調整

### アプリリポジトリ (Relative-pitch-app)
- `PitchPro-SPA/js/core/pitchpro-v1.3.15.umd.js` - 新ライブラリ
- `PitchPro-SPA/index.html` - スクリプト参照更新
- `PitchPro-SPA/js/controllers/trainingController.js` - displayMultiplier: 3.0追加

---

## リリース状態

- [ ] 動作確認待ち
- [ ] PitchPro v1.3.15 リリース
- [ ] アプリ側デプロイ

## 更新履歴
- 2025-12-02: 初版作成（動作確認前）
