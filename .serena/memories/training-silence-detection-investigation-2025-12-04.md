# トレーニング無音検出問題の調査履歴（2025-12-04）

## 問題の経緯

### 元々の状態（安定していた）
- 音量バーが100%に張り付く問題があった（見た目の問題のみ）
- **無音検出はほぼ発生しなかった** ← 音程検出は正常に動作

### 問題が発生した流れ
1. 音量バー100%問題を直そうとしてPitchProパラメーターを調整開始
2. 調整を重ねるうちに、無音検出が多発するようになった
3. 音量バーの見た目は改善されたが、音程検出の正確性が犠牲になった

---

## Git履歴分析

### 安定していたコミット
**`af7fd88` - feat(audio): PitchPro v1.3.22 ダッキング対策override機能追加**

**アプリ側設定値（trainingController.js）:**
```javascript
// iPhoneのみoverrideを適用（iPadはPitchProデフォルトを使用）
overrideNoiseGate: 0.15,       // 15%
overrideVolumeMultiplier: 2.5
displayMultiplier: 1.0
autoUpdateUI: true
// overrideSensitivityは無し
// clarityThreshold変更も無し
```

**PitchPro v1.3.22 デフォルト設定（DeviceDetection.ts）:**
| デバイス | noiseGate | volumeMultiplier | sensitivity |
|---------|-----------|------------------|-------------|
| **iPad** | 5% | 3.0 | 2.5 |
| **iPhone** | 25% | 1.2 | 2.0 |
| **PC** | 3% | 3.5 | 1.7 |

**重要**: 安定していた時、**iPadはPitchProデフォルト（noiseGate 5%）を使用**していた。アプリ側のoverrideは適用されていなかった。

### その後の変更履歴（音量バー調整）

| コミット | バージョン | 内容 | iPad設定 | 影響 |
|---------|-----------|------|---------|------|
| `af7fd88` | v4.12.0 | override機能導入（iPhoneのみ） | デフォルト(5%) | **安定** |
| `3073076` | v4.12.1 | Android対応追加 | デフォルト(5%) | 安定? |
| `171b15f` | v4.12.2 | iPadにoverride追加 | **3%** | ← 問題開始? |
| `d51f005` | v4.12.3 | iPad noiseGate調整 | **8%** | さらに調整 |
| `bafce8b` | v4.12.x | overrideSensitivity追加 | - | 複雑化 |
| `a333e23` | v4.12.x | overrideSensitivity調整 | - | さらに複雑化 |

---

## 重要な発見

### 1. iPadの問題の原因特定

**安定していた時（af7fd88）:**
- iPad: PitchProデフォルト（noiseGate **5%**）を使用
- アプリ側のoverrideはiPhoneのみ適用

**問題が始まった時（171b15f）:**
- iPad: アプリ側overrideを追加（noiseGate **3%**）
- デフォルトの5%より**低く**設定した

**仮説**: iPadでnoiseGateを5%→3%に下げたことで、ノイズが声として誤検出され、結果的にpitchy（ピッチ検出エンジン）が混乱して無音（frequency=0）を返すようになった可能性。

### 2. override設定を全削除したら悪化した
- v5.0.0で7/8が無音検出（最悪の結果）
- 仮説「override設定が問題の原因」は間違いだった
- **iPhoneのoverride設定（noiseGate 15%）は実際に助けていた**
- 問題はiPadに追加したoverride設定（noiseGate 3%）だった可能性

### 3. 段階的に変更を戻す必要がある
- 一度に全てを削除したのは急すぎた
- どの設定変更が問題を引き起こしたか特定が必要

---

## テスト結果（v4.12.x〜v5.0.0）

| バージョン | 変更内容 | 無音検出数 |
|-----------|---------|----------|
| v4.12.15 | clarityThreshold=0.1 | 1-2/8 |
| v4.12.16 | MIN_CLARITY=0.05 | 5/8 |
| v4.12.17 | clarityThreshold=0 | 5/8 |
| v4.12.18 | fftSize=8192, sensitivity=16x | 5/8 |
| **v5.0.0** | **全override削除（PitchProデフォルト）** | **7/8（悪化）** |

---

## 次のステップ案

### 案1: af7fd88の状態に完全に戻す
- iPhoneのみoverride適用（noiseGate 15%, volumeMultiplier 2.5）
- iPadはPitchProデフォルト（noiseGate 5%）を使用
- overrideSensitivity、clarityThreshold変更は無し

### 案2: iPadのoverride設定を調整
- iPadのoverrideNoiseGateを3%/8%から**15%**（iPhoneと同じ）に変更
- または、iPadのoverride設定を完全削除してデフォルト（5%）に戻す

### 案3: 段階的テスト
1. まずiPhoneのoverride（15%）を復活
2. iPadはデフォルト（5%）で様子見
3. 問題があればiPadも15%に調整

---

## 作業ブランチ
- `fix/training-simple-detection`（PitchPro-SPA）
