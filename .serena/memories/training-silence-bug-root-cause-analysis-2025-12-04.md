# トレーニングページ無音バグ 根本原因分析

## 発生日時
2025年12月4日

## 問題の症状
- iPhoneトレーニングページで8/8無音（音程検出ゼロ）
- 音量バーは動いている（volumeAsPercent: 30-45%）
- clarity: 0.00（McLeod Pitch Methodが全てゼロを返す）
- 準備ページは正常動作（clarity: 0.97-0.99）

## 重要な発見

### 1. PitchProの2つの「sensitivity」経路

| 経路 | メソッド | 影響範囲 | 用途 |
|------|----------|----------|------|
| GainNode | `setSensitivity()` | 物理的なマイク増幅 | 実際の音声信号を増幅 |
| 計算用 | `config.overrideSensitivity` | `_getProcessedResult()`の計算 | ログ表示・音量計算 |

**重要**: この2つは**別物**であり、`setSensitivity(8)`を呼んでも`_getProcessedResult()`のログでは`sensitivity:2.0x`のままになる。

### 2. `_getProcessedResult()`の処理フロー（AudioDetectionComponent.ts:1646）

```typescript
const sensitivity = this.config.overrideSensitivity ?? this.deviceSpecs?.sensitivity ?? 1.0;
const sensitizedVolume = rawResult.volume * sensitivity;
```

- `overrideSensitivity`が設定されていれば優先
- なければ`deviceSpecs.sensitivity`（PitchProのDeviceDetection.tsから取得 = iPhone: 2.0x）
- どちらもなければ1.0

### 3. 準備ページ vs トレーニングページの違い

| 項目 | 準備ページ | トレーニングページ |
|------|-----------|-------------------|
| setSensitivity() | 8x呼び出し | 8x呼び出し（v5.6.0で追加） |
| overrideSensitivity | 未設定（PitchPro任せ） | 未設定 |
| volumeAsPercent | **100%前後** | **30-45%** |
| clarity | 0.97-0.99 | 0.00 |
| 結果 | ✅ 検出成功 | ❌ 検出失敗 |

### 4. 矛盾点

**準備ページもoverrideSensitivityを設定していないのに、なぜ100%の音量が出るのか？**

→ 準備ページは`setSensitivity(8x)`によるGainNode増幅が効いており、
  PitchDetectorに入る**生の音声信号**自体が増幅されている。
  そのため、`rawResult.volume`自体が高い値になる。

**トレーニングページで同じことをしても動かない理由**:
- 準備ページからの「再利用」時に何か状態が引き継がれていない可能性
- または、トレーニングページ固有の設定が干渉している

## バージョン履歴と問題の変遷

| バージョン | 変更内容 | 結果 |
|-----------|---------|------|
| v5.0.0 | 全override削除、PitchProデフォルト | 無音継続 |
| v5.3.0 | `setSensitivity(8)` 追加 | 無音継続 |
| v5.4.0 | `overrideSensitivity: 8` 追加 | 音量100%+、だがclarity:0.00 |
| v5.5.0 | 全override削除（iPad同等化） | 無音継続 |
| v5.6.0 | `setSensitivity(deviceSensitivity)` 追加 | GainNode 8x確認、だがclarity:0.00 |

## 根本原因の仮説

### 仮説1: Audio Ducking後のPitchDetector状態異常
iOSのAudio Ducking（BGM再生後にマイク音量が下がる現象）により、
PitchDetector内部の何らかの状態が壊れている可能性。
→ GainNodeで増幅しても、PitchDetector自体が正常に動作していない

### 仮説2: AudioContext/AnalyserNodeの状態問題
準備ページとトレーニングページで同じAudioDetectionComponentを「再利用」しているが、
AnalyserNodeやAudioContextの接続状態が正しくない可能性。

### 仮説3: 初期化タイミングの問題
準備ページでは特定のタイミングで初期化されているが、
トレーニングページでは異なるタイミングで再利用・再初期化が行われている。

### 仮説4: PitchProのclarityThresholdまたはfftSize設定
v5.0.0で削除した設定の中に、clarity検出に必要な設定があった可能性。
特に`fftSize`や`clarityThreshold`が影響している可能性。

## 次のステップ

1. **準備ページのPitchDetector状態確認**: 準備ページで正常動作時のPitchDetectorの状態をログ出力
2. **トレーニングページでの新規作成テスト**: 再利用ではなく新規作成で動作するか確認
3. **fftSize/clarityThreshold復元テスト**: 削除した設定を戻して効果を確認
4. **PitchDetector.detect()の生データ確認**: clarity:0.00になる前の生データを調査

## 重要な教訓

1. `setSensitivity()`と`overrideSensitivity`は**別経路**
2. ログの`sensitivity:X.Xx`は`_getProcessedResult()`の計算用であり、GainNodeの状態を反映していない
3. PitchProの設定は複雑に絡み合っており、一部を変更すると予期せぬ影響が出る
4. 「動いていたバージョン」の設定を完全に把握することが重要
