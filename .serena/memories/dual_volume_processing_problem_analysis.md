# 2段階音量処理問題の分析と解決策

## 問題の根本原因

現在のアーキテクチャでは、音量計算が2段階に分かれており、iPadの微弱な低音域信号に対して意図しないフィルタリング効果を生み出している。

### 問題のあるアーキテクチャ

#### 第1段階：PitchDetector.ts
- 生信号（RMS値）にSCALING_FACTORを掛けてrawVolumeを算出
- rawVolumeがPC向けの高いノイズゲート閾値（6.0%）で評価される
- 閾値を下回ると音量が0になる

#### 第2段階：AudioDetectionComponent.ts
- rawVolumeにvolumeMultiplierを掛けて最終音量を算出
- しかし、第1段階で0になった値は何倍しても0のまま

### iPadでの悪循環
1. iPadのマイクは低音域の信号のRMS値が非常に小さい
2. SCALING_FACTORを掛けてもPC向けの高い閾値を下回る
3. PitchDetectorが「ノイズ」と判断し音量を0にする
4. AudioDetectionComponentで大きなvolumeMultiplierを掛けても結果は0

## 解決策：音量処理の一元化

### ステップ1：DeviceDetection.tsの一元化
```typescript
private static getDeviceOptimizations(deviceType: 'iPhone' | 'iPad' | 'PC', _isIOS: boolean) {
  switch (deviceType) {
    case 'iPad':
      return {
        sensitivity: 4.0,           // マイク感度
        noiseGate: 0.025,           // iPad専用の緩い閾値
        volumeMultiplier: 17.0,     // 表示音量補正
        smoothingFactor: 0.25       // 平滑化係数
      };
    // ...
  }
}
```

### ステップ2：PitchDetector.tsの純粋化
```typescript
// 音量スケーリングとノイズゲート処理を削除
const volumePercent = rms; // 生のRMS値を直接使用

// 常にピッチ検出を実行（ノイズゲート判定を除去）
const pitchResult = this.pitchDetector.findPitch(buffer, sampleRate);
```

### ステップ3：AudioDetectionComponent.tsでの一元管理
```typescript
private _getProcessedResult(rawResult: PitchDetectionResult | null): PitchDetectionResult | null {
  if (!rawResult) return null;

  const processedResult = { ...rawResult };
  
  // Step 1: 固定SCALING_FACTORで初期音量計算
  const BASE_SCALING_FACTOR = 1500;
  const initialVolume = rawResult.volume * BASE_SCALING_FACTOR;
  
  // Step 2: デバイス固有のノイズゲート閾値取得
  const noiseGateThreshold = (this.deviceSpecs?.noiseGate ?? 0.060) * 100;
  
  // Step 3: ノイズゲート適用
  if (initialVolume < noiseGateThreshold) {
    processedResult.volume = 0;
    processedResult.frequency = 0;
    processedResult.note = '--';
    return processedResult;
  }
  
  // Step 4: デバイス固有のvolumeMultiplierで最終音量計算
  const volumeMultiplier = this.deviceSpecs?.volumeMultiplier ?? 1.0;
  const finalVolume = initialVolume * volumeMultiplier;
  
  processedResult.volume = Math.min(100, Math.max(0, finalVolume));
  return processedResult;
}
```

## 期待される効果

1. **iPad低音問題解決**: iPad専用の緩やかなノイズゲート閾値により声がブロックされにくくなる
2. **メンテナンス性向上**: DeviceDetection.tsのパラメータ修正のみで調整可能
3. **ロジック明確化**: 「検出→デバイス別解釈」の自然なデータフロー実現

この一元化により、複雑に絡み合った音量処理が整理され、各デバイスの特性に適した音量処理が可能になる。