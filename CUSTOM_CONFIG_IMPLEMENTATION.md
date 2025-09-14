# カスタムデバイス設定機能の実装完了

## 概要
PitchProライブラリにモバイルテスト用のカスタムデバイス設定機能を追加しました。これにより、開発者は実機でリアルタイムに音量感度やノイズゲート設定を調整できるようになりました。

## 実装された機能

### 1. AudioDetectionComponent の拡張
- `customDeviceConfig` パラメータを追加
- デフォルトのDeviceDetection設定をカスタム値でオーバーライド可能

### 2. PitchDetector の拡張  
- `setCustomDeviceSpecs()` メソッドを追加
- `getDeviceSpecs()` メソッドを追加
- カスタムノイズゲートスケーリング係数のサポート

### 3. 設定可能パラメータ
```typescript
customDeviceConfig: {
  sensitivity?: number;                  // 音量感度 (1.0-6.0)
  noiseGateScalingFactor?: number;      // ノイズゲート係数 (200-1000)
  noiseGate?: number;                   // ノイズゲート閾値
  divisor?: number;                     // 音量分割係数
  gainCompensation?: number;            // ゲイン補正
  noiseThreshold?: number;              // ノイズ閾値
  smoothingFactor?: number;             // 平滑化係数
}
```

## 使用方法

### 基本的な使用例
```typescript
const audioDetector = new PitchPro.AudioDetectionComponent({
  deviceOptimization: false, // 自動最適化を無効化
  customDeviceConfig: {
    sensitivity: 2.5,
    noiseGateScalingFactor: 300
  }
});

await audioDetector.initialize();
```

### リアルタイム調整
```typescript
// 設定変更時
const newConfig = {
  sensitivity: 3.0,
  noiseGateScalingFactor: 400
};

// 新しい設定でコンポーネントを再初期化
audioDetector.destroy();
audioDetector = new PitchPro.AudioDetectionComponent({
  deviceOptimization: false,
  customDeviceConfig: newConfig
});
await audioDetector.initialize();
```

## テストページ

### 1. モバイル音量調整テスト
- ファイル: `demos/mobile-volume-test.html`
- 機能: iPhone/iPad向けのタッチ最適化UI
- リアルタイムスライダー調整
- デバッグログ表示

### 2. カスタム設定テスト  
- ファイル: `demos/custom-config-test.html`  
- 機能: デスクトップ向けの詳細テストUI
- 設定変更の即時反映
- SCALING_FACTOR計算表示

## 技術実装詳細

### AudioDetectionComponent での処理
```typescript
private applyCustomDeviceConfig(): void {
  // デフォルトDeviceSpecsをカスタム値でオーバーライド
  const customSpecs: DeviceSpecs = {
    ...this.deviceSpecs,
    sensitivity: this.config.customDeviceConfig.sensitivity ?? this.deviceSpecs.sensitivity,
    // 他のプロパティも同様にオーバーライド
  };
  
  // PitchDetectorに渡すためのカスタムプロパティ設定
  if (this.config.customDeviceConfig.noiseGateScalingFactor) {
    (customSpecs as any).customNoiseGateScaling = this.config.customDeviceConfig.noiseGateScalingFactor;
  }
  
  this.deviceSpecs = customSpecs;
}
```

### PitchDetector での処理
```typescript
// SCALING_FACTOR計算でカスタム感度を使用
const SCALING_FACTOR = 400 / (platformSpecs.sensitivity * currentSensitivity);

// ノイズゲートでカスタム係数を使用
const customNoiseGateScaling = (platformSpecs as any).customNoiseGateScaling;
const NOISE_GATE_SCALING_FACTOR = customNoiseGateScaling || 500;
```

## デバッグ情報

### ログ出力例
```
🎛️ [PitchDetector] Custom device specs applied: {
  deviceType: "PC",
  sensitivity: 2.5,
  noiseGate: 0.035,
  customProperties: ["customNoiseGateScaling"]
}

🔍 [AudioDetectionComponent] Volume conversion: {
  original: "15.23%",
  multiplier: "2.5x", 
  beforeClamp: "38.08%",
  afterClamp: "38.08%",
  device: "PC"
}
```

## 今後の拡張

1. **設定プリセット機能**
   - よく使う設定の保存・読み込み
   - デバイス別推奨設定の提供

2. **自動調整支援**  
   - 音声サンプルによる自動キャリブレーション
   - 環境ノイズレベル分析

3. **設定エクスポート**
   - 調整済み設定の JSON エクスポート/インポート
   - 他の開発者との設定共有

## 関連ファイル

- `src/components/AudioDetectionComponent.ts`: メインの実装
- `src/core/PitchDetector.ts`: カスタムデバイス仕様サポート
- `demos/mobile-volume-test.html`: モバイル向けテストページ
- `demos/custom-config-test.html`: デスクトップ向けテストページ

実装完了日: 2025年9月14日