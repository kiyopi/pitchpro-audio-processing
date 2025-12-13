# iPhone無音検出問題修正 v5.4.0 (2025-12-04)

## 問題の概要
iPhoneでトレーニング中に音声が検出されるが（音量バーは動く）、音程検出がfrequency=0を返す（8/8無音）

## 根本原因の特定

### 原因1: sensitivity設定の欠落
- **準備ページ**: `setSensitivity(8)` を明示的に設定 → 動作OK
- **トレーニングページ (v5.0.0以降)**: v5.0.0の簡素化で`setSensitivity`を削除 → 無音発生
- **デフォルト値**: iPhoneのsensitivityはデフォルト2x（準備ページの8xと比較して1/4）

### 原因2: setSensitivity vs overrideSensitivity
- `setSensitivity(8)`: GainNodeのゲイン値を操作（物理的な増幅）
- `overrideSensitivity`: `_getProcessedResult()`内の計算で使用される乗数
- v5.3.0では`setSensitivity(8)`を追加したが効果なし → `_getProcessedResult`は別経路

### 原因3: PitchProバージョン
- アプリで使用: v1.3.25
- `overrideSensitivity`実装: v1.3.26
- v1.3.25では`overrideSensitivity`が処理されない

## 修正履歴

### v5.0.0（失敗）
- 全override設定を削除してPitchProデフォルトに戻す
- 結果: 7/8無音（最悪）

### v5.1.0（部分成功）
- af7fd88状態に戻す（iPhoneのみoverride: noiseGate 15%, volumeMultiplier 2.5）
- 結果: iPad ✅ 動作、iPhone ❌ 無音

### v5.2.0（失敗）
- iPhoneのoverrideNoiseGate: 15% → 10%
- 結果: iPhone ❌ 依然として無音

### v5.3.0（失敗）
- `setSensitivity(8)`を追加
- 結果: ログに`🎤 [v5.3.0] トレーニング用感度適用: 8x`が表示されるが、無音は解消せず
- 理由: `_getProcessedResult()`は`config.overrideSensitivity`を参照し、`setSensitivity()`のGainNode設定とは別

### v5.4.0（現在テスト中）
```javascript
// trainingController.js
await audioDetector.updateSelectors({
    volumeBarSelector: '#training-volume-progress',
    autoUpdateUI: true,
    displayMultiplier: 1.0,
    overrideNoiseGate: 0.10,       // noiseGate 10%
    overrideVolumeMultiplier: 2.5, // 音量バー表示用
    overrideSensitivity: 8         // 【v5.4.0】準備ページと同じ8x感度
});
```

### PitchProライブラリ更新
- index.html: `pitchpro-v1.3.25.umd.js` → `pitchpro-v1.3.26.umd.js`
- v1.3.26で`overrideSensitivity`がサポートされている

## 技術的詳細

### _getProcessedResult()の処理フロー（v1.3.26）
```typescript
// 行1646: sensitivity取得
const sensitivity = this.config.overrideSensitivity ?? this.deviceSpecs?.sensitivity ?? 1.0;

// 行1647: volume計算にsensitivityを適用
const sensitizedVolume = rawResult.volume * sensitivity;
const volumeAsPercent = sensitizedVolume * 100;
```

### ログで確認すべき項目
1. `📱 [v5.4.0] iPhone検出(再利用): ダッキング対策override適用 (noiseGate 10%, sensitivity 8x)`
2. `🎤 [v1.3.26] overrideSensitivity set to: 8`
3. `_getProcessedResult`ログに `sensitivity:8.0x (OVERRIDE)` が含まれる

## iPhone設定値まとめ（v5.4.0）
| 設定 | 値 | 目的 |
|------|-----|------|
| overrideNoiseGate | 0.10 (10%) | デフォルト25%→10%に下げてダッキング対策 |
| overrideVolumeMultiplier | 2.5 | 音量バー表示を60-70%目標 |
| overrideSensitivity | 8 | 準備ページと同じ感度で信号増幅 |

## iPad設定
- iPadはPitchProデフォルト設定で動作OK（noiseGate 12%, sensitivity 2.5）
- override不要

## 関連ファイル
- `/Users/isao/Documents/Relative-pitch-app/PitchPro-SPA/js/controllers/trainingController.js`
- `/Users/isao/Documents/Relative-pitch-app/PitchPro-SPA/index.html`（PitchProバージョン参照）
- `/Users/isao/Documents/pitchpro-audio-processing/src/components/AudioDetectionComponent.ts`（_getProcessedResult実装）
