# PitchPro 音量値範囲問題調査レポート

## 📊 問題の概要

**報告された問題**: PitchProから出力される音量値が`6.139596009254456`のような大きな値となり、READMEに記載された0-1の正規化範囲を超えている。

**影響**: 音量バーに直接設定すると`width: 613.9%`のような異常値となり、ブラウザが`width: 100%`として表示してしまう。

## 🔍 調査結果

### 1. 音量値の出力箇所（PitchDetector.ts）

```typescript
// src/core/PitchDetector.ts:815
const result: PitchDetectionResult = {
  frequency: this.currentFrequency,
  note: this.detectedNote,
  octave: this.detectedOctave || undefined,
  clarity: this.pitchClarity,
  volume: displayVolume,  // ← ここが問題の値
  cents: this.currentFrequency > 0 ? this.frequencyToCents(this.currentFrequency) : undefined
};
```

### 2. displayVolumeの計算過程

```typescript
// src/core/PitchDetector.ts:804
const displayVolume = isSignalBelowNoiseGate ? 0 : this.stableVolume;
```

`this.stableVolume`は以下で計算される：

```typescript
// src/core/PitchDetector.ts:683-685
const currentVolumeForHistory = Math.min(100, volumePercent);
this.addVolumeToHistory(currentVolumeForHistory);
this.stableVolume = this.calculateStabilizedVolume();
```

### 3. volumePercentの計算（0-100範囲で正しく制限）

```typescript
// src/core/PitchDetector.ts:655-656
const rawVolumeValue = adjustedRms * SCALING_FACTOR; // SCALING_FACTOR = 400
const volumePercent = Math.min(100, Math.max(0, rawVolumeValue));
```

**ここでは正しく0-100範囲に制限されている。**

### 4. calculateStabilizedVolume()の問題

```typescript
// src/core/PitchDetector.ts:1493
return this.volumeHistory.reduce((sum, v) => sum + v, 0) / this.volumeHistory.length;
```

**問題発見**: この計算結果は0-100範囲の平均値なので、最大100になるはずだが、実際には6.13のような値が出力されている。

### 5. AudioDetectionComponentでの処理

```typescript
// src/components/AudioDetectionComponent.ts:494, 508
const volumePercent = Math.min(100, result.volume * (this.deviceSettings?.volumeMultiplier ?? 1.0));
```

**ここで問題が発生**: `result.volume`が既に6.13のような値の場合、`volumeMultiplier`が1.0でも6.13となり、`Math.min(100, 6.13)`で6.13が返される。

## 📈 ドキュメント vs 実装の不整合

### READMEでの記載

- `PROPERTY_LIST.md:10`: `volume | number | 音量レベル(0-1)`
- `docs/AudioDetectionComponent-Documentation.md:144`: `volume: 0.1234, // 音量 (0.0-1.0)`

### 実際の実装

- **PitchDetector内部**: 0-100範囲で計算・保存
- **出力時**: そのまま0-100範囲の値を返す（6.13%など）
- **AudioDetectionComponent**: 受け取った値に100を掛けて%表示にしようとする

## 🎯 根本原因の推定

### 仮説1: 音量履歴の初期化問題

`volumeHistory`の初期値が適切に設定されていない可能性：

```typescript
// src/core/PitchDetector.ts:1453-1455
if (typeof Float32Array !== 'undefined') {
  this.volumeHistory = new Float32Array(length); // 初期値は0
} else {
  this.volumeHistory = new Array(length).fill(0); // 初期値は0
}
```

### 仮説2: デバイス固有の計算問題

デバイス別の`volumeMultiplier`やゲイン補正が累積的に適用されている可能性。

### 仮説3: ドキュメントと実装の設計ミス

- **設計意図**: 0-1の正規化範囲
- **実際の実装**: 0-100のパーセンテージ範囲

## 📋 確認すべき項目

### 1. 実際の出力値の範囲確認

```javascript
// テスト用コード例
pitchDetector.setCallback((result) => {
  console.log('Volume range check:', {
    volume: result.volume,
    type: typeof result.volume,
    isNormalized: result.volume >= 0 && result.volume <= 1,
    isPercentage: result.volume >= 0 && result.volume <= 100
  });
});
```

### 2. volumeHistoryの状態確認

```javascript
// デバッグ用（PitchDetector内部に追加）
console.log('VolumeHistory debug:', {
  history: this.volumeHistory,
  average: this.calculateStabilizedVolume(),
  current: volumePercent
});
```

### 3. デバイス別テスト

- PC
- iPhone
- iPad

での音量値出力を確認。

## 🛠️ 推奨解決策（修正前の検討事項）

### オプション1: PitchDetector出力を0-1に正規化

```typescript
// PitchDetectorの出力時に正規化
const result: PitchDetectionResult = {
  // ...
  volume: displayVolume / 100, // 0-100を0-1に変換
  // ...
};
```

### オプション2: AudioDetectionComponentでの適切な処理

```typescript
// AudioDetectionComponentで適切にスケーリング
const volumePercent = Math.min(100, Math.max(0, 
  result.volume <= 1 ? result.volume * 100 : result.volume
));
```

### オプション3: ドキュメントの修正

READMEとドキュメントを実装に合わせて0-100範囲に更新。

## 🎯 次のアクション

1. **実環境での値確認**: 実際に6.13のような値が出力される条件を特定
2. **履歴データの検証**: volumeHistoryの内容と計算過程を詳細に確認
3. **設計意図の明確化**: 0-1と0-100のどちらが正しい仕様かを決定
4. **修正方針の決定**: 上記3つのオプションから最適解を選択

## 📝 補足情報

### 関連ファイル

- `src/core/PitchDetector.ts` (音量計算の実装)
- `src/components/AudioDetectionComponent.ts` (UI更新処理)
- `README.md` (API仕様書)
- `PROPERTY_LIST.md` (型定義一覧)

### テスト実行コマンド

```bash
# 音量関連のテストを実行
npm run test test/PitchDetector.test.ts
npm run test test/performance.test.ts
```

---

**作成日**: 2025年9月12日  
**調査者**: Claude Code  
**ステータス**: 調査完了 - 修正待ち