# iPhone トレーニング無音検出問題 - 2025-12-03

## 問題の本質
**基音再生後、iPhoneのマイク音量が約1/4に低下（ダッキング）**
- 準備ページ音域テスト: volume 50-70% → 周波数検出成功
- トレーニングページ（基音再生後）: volume 12-18% → 周波数検出失敗

## バージョン履歴

| バージョン | setSensitivity | noiseGate | volumeMultiplier | 結果 |
|-----------|---------------|-----------|------------------|------|
| v4.12.10 | 20x | 15% | 1.0 | 4/8無音（波形クリッピング→pitchy検出失敗） |
| v4.12.11 | 8x | 15% | 1.0 | 8/8無音（音量14-17%がnoiseGate 15%未満） |
| v4.12.12 | 8x | **10%** | 1.0 | 7/8無音（noiseGateは通過、だがpitchy検出失敗） |
| v4.12.13 | 8x | 10% | **3.0** | テスト待ち |

## v4.12.12の分析結果
```
volumeAsPercent: 12-18%（noiseGate 10%を超えている）
handlePitchUpdate: frequency=0, clarity=0.00
→ noiseGateは通過しているが、pitchy自体が周波数を検出できていない
```

## 根本原因の仮説
1. **ダッキングによる音量低下**: 基音再生後、マイク音量が1/4に
2. **8x感度でも不十分**: 音域テストと同じ8xでも、ダッキング後は音量不足
3. **pitchyの最低音量閾値**: clarityThreshold=0.4を満たせない信号レベル

## 重要な発見
- `setSensitivity`はGainNode（実際の音声信号）に影響
- `volumeMultiplier`は表示用の音量計算のみに使用
- pitchyはGainNode後の信号を使用
- v1.3.25では`overrideSensitivity`は未実装（v1.3.26以降）

## v4.12.13の変更
- `overrideVolumeMultiplier`: 1.0 → 3.0
- **注意**: volumeMultiplierは表示用のみ。pitchyへの入力信号は変わらない
- **予想**: 音量バー表示は改善するが、周波数検出問題は解決しない可能性

## 次のステップ候補（v4.12.13で無音続く場合）

### 1. setSensitivityを上げる: 8x → 12x or 15x
- 20xでは波形クリッピング、8xでは不足
- 中間値を試す

### 2. PitchProライブラリ側の調整
- clarityThreshold: 0.4 → 0.3 or 0.2
- minVolumeAbsolute: 0.25 → 0.1

### 3. v1.3.26へのアップグレード
- overrideSensitivityが使用可能になる
- より細かい制御が可能

## 関連ログ分析

### 準備ページ成功時
```
🎤 PitchPro検出: freq:112.5Hz vol:75.5% clarity:1.00
✅ [AudioManager] Gain setting verified: 8.0x
```

### トレーニングページ失敗時
```
volumeAsPercent:16.46% noiseGate:10.00% (OVERRIDE)
handlePitchUpdate: frequency: "0.0", clarity: "0.00", volume: "0.0%"
✅ [AudioManager] Gain setting verified: 8.0x
```

両方とも8x感度だが、トレーニングページではダッキング後のため音量が大幅に低下。

## ファイル状態（2025-12-03時点）
- trainingController.js: v4.12.13
- router.js キャッシュ: v=1764767013
- index.html router.js キャッシュ: v=1764767013
- PitchProライブラリ: v1.3.25
