# DeviceOverrides機能 仕様書 v2（確定版）

## 作成日: 2025-12-13
## ブランチ: feature/device-overrides
## 対象バージョン: v1.6.0（予定）

---

## 調査結果を反映した修正点

| 項目 | 当初の仕様 | 修正後 |
|------|------------|--------|
| clarityThreshold | DeviceOverridesに含める | 除外（AudioDetectionConfig既存） |
| minVolumeAbsolute | DeviceOverridesに含める | 除外（AudioDetectionConfig既存） |
| harmonicCorrectionEnabled | overridesで設定 | 初期値のみ（ランタイムは既存API使用） |
| minVolumeAbsoluteデフォルト | 0.020 → 0.005 | 0.015 → 0.005（現在値を正しく認識） |

---

## 修正ファイル一覧（確定版）

| ファイル | 修正内容 | 優先度 |
|----------|----------|--------|
| src/types/index.ts | DeviceOverrides型追加 | 🔴 必須 |
| src/utils/DeviceDetection.ts | getDeviceSpecsWithOverrides()追加 | 🔴 必須 |
| src/core/PitchDetector.ts:671 | minFrequency/maxFrequency設定化 | 🔴 必須 |
| src/core/PitchDetector.ts:302 | minVolumeAbsolute 0.015→0.005 | 🟡 推奨 |
| src/components/AudioDetectionComponent.ts | overrides受け渡し、harmonicCorrection初期化 | 🔴 必須 |

---

## 1. types/index.ts - DeviceOverrides型定義

```typescript
/**
 * アプリ側からのオーバーライド設定
 * DeviceDetectionの自動検出値を上書きする
 */
export interface DeviceOverrides {
  /** マイク感度倍率 (0.5〜5.0) */
  sensitivity?: number;

  /** ノイズゲート閾値 (0.01〜0.20) */
  noiseGate?: number;

  /** 音量表示倍率 (1.0〜10.0) */
  volumeMultiplier?: number;

  /** 検出対象の最低周波数 Hz (30〜100) */
  minFrequency?: number;

  /** 検出対象の最高周波数 Hz (800〜2000) */
  maxFrequency?: number;

  /** 倍音補正の初期状態 (default: true) 
   *  ランタイム変更はsetHarmonicCorrectionEnabled()を使用 */
  harmonicCorrectionEnabled?: boolean;

  // ⚠️ 以下は除外（AudioDetectionConfigに既存）
  // clarityThreshold → AudioDetectionConfig.clarityThreshold を使用
  // minVolumeAbsolute → AudioDetectionConfig.minVolumeAbsolute を使用
}
```

---

## 2. DeviceDetection.ts - getDeviceSpecsWithOverrides()

```typescript
static getDeviceSpecsWithOverrides(overrides?: DeviceOverrides): DeviceSpecs & {
  minFrequency: number;
  maxFrequency: number;
  harmonicCorrectionEnabled: boolean;
} {
  const baseSpecs = DeviceDetection.getDeviceSpecs();
  const defaultMinFreq = 30;
  const defaultMaxFreq = 1200;

  return {
    ...baseSpecs,
    sensitivity: overrides?.sensitivity !== undefined
      ? Math.max(0.5, Math.min(5.0, overrides.sensitivity))
      : baseSpecs.sensitivity,
    noiseGate: overrides?.noiseGate !== undefined
      ? Math.max(0.01, Math.min(0.20, overrides.noiseGate))
      : baseSpecs.noiseGate,
    volumeMultiplier: overrides?.volumeMultiplier !== undefined
      ? Math.max(1.0, Math.min(10.0, overrides.volumeMultiplier))
      : baseSpecs.volumeMultiplier,
    minFrequency: overrides?.minFrequency !== undefined
      ? Math.max(30, Math.min(100, overrides.minFrequency))
      : defaultMinFreq,
    maxFrequency: overrides?.maxFrequency !== undefined
      ? Math.max(800, Math.min(2000, overrides.maxFrequency))
      : defaultMaxFreq,
    harmonicCorrectionEnabled: overrides?.harmonicCorrectionEnabled ?? true,
  };
}
```

---

## 3. PitchDetectorConfig拡張

```typescript
export interface PitchDetectorConfig {
  // 既存...
  minFrequency?: number;      // default: 30
  maxFrequency?: number;      // default: 1200
  // ⚠️ harmonicCorrectionEnabledは追加しない（既存harmonicConfig.enabledを使用）
}
```

---

## 4. PitchDetector.ts修正箇所

### 4.1 detectPitch() 671行目
```typescript
// 修正前
const isValidVocalRange = pitch >= 30 && pitch <= 1200;

// 修正後
const isValidVocalRange = pitch >= this.config.minFrequency &&
                          pitch <= this.config.maxFrequency;
```

### 4.2 minVolumeAbsoluteデフォルト値 302行目
```typescript
// 修正前
minVolumeAbsolute: config.minVolumeAbsolute ?? 0.015

// 修正後
minVolumeAbsolute: config.minVolumeAbsolute ?? 0.005
```

---

## 5. AudioDetectionComponent.ts修正

### 5.1 AudioDetectionConfig型拡張
```typescript
export interface AudioDetectionConfig {
  // 既存...
  overrides?: DeviceOverrides;
}
```

### 5.2 initialize()でオーバーライド適用
```typescript
// DeviceSpecsをオーバーライド付きで取得
this.deviceSpecs = DeviceDetection.getDeviceSpecsWithOverrides(this.config.overrides);

// harmonicCorrectionEnabledを初期値として設定
const harmonicEnabled = this.config.overrides?.harmonicCorrectionEnabled ?? true;

// PitchDetector初期化
this.pitchDetector = new PitchDetector(this.audioManager, {
  // 既存設定...
  minFrequency: this.deviceSpecs.minFrequency,
  maxFrequency: this.deviceSpecs.maxFrequency,
  harmonicCorrection: {
    enabled: harmonicEnabled,
  }
});
```

---

## 設定優先順位

1. **AudioDetectionConfig直接指定** - clarityThreshold, minVolumeAbsolute
2. **DeviceOverrides** - sensitivity, noiseGate, volumeMultiplier, minFrequency/maxFrequency, harmonicCorrectionEnabled（初期値）
3. **DeviceDetection自動検出値** - デバイス種別に基づく標準値
4. **デフォルト値** - minVolumeAbsolute: 0.005, minFrequency: 30, maxFrequency: 1200

---

## アプリ側使用例

```javascript
const config = {
  clarityThreshold: 0.4,
  minVolumeAbsolute: 0.005,
  
  overrides: {
    sensitivity: userCalibration.sensitivity,
    noiseGate: userCalibration.noiseGate,
    minFrequency: 50,
    maxFrequency: 1500,
    harmonicCorrectionEnabled: !isVoiceRangeTest,
  },
};

const audioDetector = new AudioDetectionComponent(config);
await audioDetector.initialize();

// ランタイムで倍音補正を切り替え
audioDetector.setHarmonicCorrectionEnabled(false);
```
