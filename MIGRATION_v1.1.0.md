# PitchPro Audio Processing v1.1.0 移行ガイド

> **⚠️ 注意**: このファイルは実装中のアプリのClaudeに変更点を伝達後に削除してください

## 概要

PitchPro Audio Processing v1.1.0への移行ガイドです。実装中のアプリケーションでスムーズにアップグレードできるよう、重要な変更点と実装例をまとめています。

**アップグレード影響度**: 🟢 軽微（後方互換性あり）  
**推奨度**: 🔴 強く推奨（パフォーマンス・安定性大幅向上）  
**作業時間**: 30分-1時間（オプション機能追加含む）

## 🔴 必須対応事項

### なし（後方互換性維持）
v1.1.0は既存コードとの完全な後方互換性を維持しています。既存のコードはそのまま動作します。

## 🟡 推奨アップグレード作業

### 1. パッケージ更新

```bash
# 最新版へのアップグレード
npm install @pitchpro/audio-processing@1.1.0

# 確認
npm list @pitchpro/audio-processing
```

### 2. 最適化されたデフォルト値への変更

```typescript
// ❌ 旧設定（動作するが最適ではない）
const pitchDetector = new PitchDetector({
  clarityThreshold: 0.8,        // 厳しすぎる
  minVolumeAbsolute: 0.01,      // 感度が低い
});

// ✅ 新推奨設定（v1.1.0最適化済み）
const pitchDetector = new PitchDetector({
  clarityThreshold: 0.4,        // 実用的な信頼性閾値
  minVolumeAbsolute: 0.003,     // 適切な感度
  volumeDetectionThreshold: 0.4 // 新しい音量検出閾値
});
```

### 3. エラーハンドリングの強化（オプション）

```typescript
// ✅ 構造化エラーハンドリングの追加
import { 
  PitchProError, 
  AudioContextError, 
  PitchDetectionError,
  isRecoverableError 
} from '@pitchpro/audio-processing/utils';

try {
  await pitchDetector.initialize();
} catch (error) {
  // 構造化エラーに変換
  const pitchError = error instanceof PitchProError 
    ? error 
    : new PitchDetectionError('初期化失敗', {
        originalError: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
        context: 'pitchDetector.initialize'
      });
      
  // 回復可能性を判定
  if (isRecoverableError(pitchError)) {
    console.log('回復可能なエラー - リトライします:', pitchError.code);
    // 自動復旧ロジック
    setTimeout(() => retryInitialization(), 1000);
  } else {
    console.error('致命的エラー - ユーザーに通知:', pitchError.toJSON());
    // ユーザーへのエラー表示
    showErrorToUser(pitchError.message);
  }
}
```

### 4. パフォーマンス監視の追加（オプション）

```typescript
// ✅ パフォーマンスメトリクスの活用
import { performanceMonitor } from '@pitchpro/audio-processing/utils';

// 音程検出処理の監視
pitchDetector.setCallback((result) => {
  const measure = performanceMonitor.startMeasure('pitch-processing');
  
  if (result.frequency > 0 && result.clarity > 0.4) {
    // UI更新処理
    updateFrequencyDisplay(result.frequency);
    updateNoteDisplay(`${result.note}${result.octave}`);
    updateCentsDisplay(result.cents);
  }
  
  measure(); // 処理時間を自動記録
});

// 定期的なパフォーマンス確認
setInterval(() => {
  const stats = performanceMonitor.getStats('pitch-processing');
  if (stats) {
    console.log(`平均処理時間: ${stats.mean.toFixed(1)}ms`);
    
    // 処理が重い場合の警告
    if (stats.mean > 30) {
      console.warn('音程検出処理が重くなっています');
      // 必要に応じて設定調整
    }
  }
}, 15000); // 15秒ごと
```

## 🔧 実装時の改善点

### より厳密な音程検出判定

```typescript
// ✅ より厳密な検出条件（推奨）
pitchDetector.setCallback((result) => {
  // 複数条件での厳密な判定
  const isValidDetection = 
    result.frequency > 0 && 
    result.clarity > 0.4 && 
    result.volume > 0.3 &&
    result.frequency >= 65 && result.frequency <= 1200; // 人声範囲
    
  if (isValidDetection) {
    // 信頼できる検出結果の処理
    updateDisplay(result);
  } else {
    // 無音時やノイズ時の適切な表示
    clearDisplay();
  }
});
```

### デバイス固有設定の活用

```typescript
// ✅ デバイス別最適化の確認
import { DeviceDetection } from '@pitchpro/audio-processing/utils';

const deviceSpecs = DeviceDetection.getDeviceSpecs();
console.log('検出デバイス:', {
  type: deviceSpecs.deviceType,
  sensitivity: deviceSpecs.sensitivity,
  noiseGate: deviceSpecs.noiseGate
});

// iPhone用に感度が2.0に最適化されています（v1.1.0）
if (deviceSpecs.deviceType === 'iPhone') {
  console.log('iPhone最適化設定が適用されました');
}
```

## 🚀 新機能の活用

### 1. メモリ効率の向上

```typescript
// ✅ 自動的に適用される改善（コード変更不要）
// - CircularBufferによる無制限メモリ増大防止
// - O(1)操作によるパフォーマンス向上
// - 長時間実行でのメモリリーク解消

// 確認用（オプション）
const checkMemoryUsage = () => {
  if (performance.memory) {
    console.log(`メモリ使用量: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`);
  }
};

// 定期的なメモリ使用量確認
setInterval(checkMemoryUsage, 60000); // 1分ごと
```

### 2. 適応フレームレート制御

```typescript
// ✅ 自動的に適用される改善（コード変更不要）
// - 30-60FPS間での自動調整
// - CPU負荷に応じた動的最適化
// - 音楽演奏に最適な45FPS推奨

// パフォーマンス統計の確認（オプション）
const stats = pitchDetector.getPerformanceStats();
console.log(`現在のFPS: ${stats.currentFPS}`);
console.log(`レイテンシー: ${stats.latency}ms`);
console.log(`フレームドロップ: ${stats.frameDrops}`);
```

## ⚠️ 注意事項

### iPhone設定の変更
```typescript
// iPhone感度設定が変更されました
// 旧: sensitivity: 3.0
// 新: sensitivity: 2.0 (より安定した検出)

// 特別な調整は不要（自動適用）
```

### clarityThresholdのデフォルト値変更
```typescript
// デフォルト値が変更されました
// 旧: clarityThreshold: 0.8 (厳しすぎた)
// 新: clarityThreshold: 0.4 (実用的)

// 明示的に0.8を指定していた場合は見直しを推奨
const pitchDetector = new PitchDetector({
  clarityThreshold: 0.4 // より多くの音程を検出可能
});
```

## 🧪 テスト手順

### 1. 基本動作確認
```bash
# アップグレード後の動作確認
npm test

# 特定のテストのみ実行
npm test -- --grep "PitchDetector"
```

### 2. ブラウザでの動作確認
```typescript
// コンソールでの確認用コード
console.log('PitchPro v1.1.0 動作確認');

// デバイス検出確認
const specs = DeviceDetection.getDeviceSpecs();
console.log('デバイス:', specs.deviceType, '感度:', specs.sensitivity);

// パフォーマンス確認
setTimeout(() => {
  const stats = performanceMonitor.getStats('pitch-detection');
  if (stats) {
    console.log('平均処理時間:', stats.mean.toFixed(1) + 'ms');
  }
}, 10000);
```

### 3. 長時間実行テスト
```typescript
// メモリリーク確認（v1.1.0で解決済み）
let startMemory = 0;
if (performance.memory) {
  startMemory = performance.memory.usedJSHeapSize;
}

setTimeout(() => {
  if (performance.memory) {
    const endMemory = performance.memory.usedJSHeapSize;
    const increase = (endMemory - startMemory) / 1024 / 1024;
    console.log(`10分後のメモリ増加: ${increase.toFixed(1)}MB`);
    // v1.1.0では大幅に改善されているはず
  }
}, 600000); // 10分後
```

## 🔍 トラブルシューティング

### 音程検出が効かない場合
```typescript
// デバッグ用：検出条件を確認
pitchDetector.setCallback((result) => {
  console.log('デバッグ:', {
    frequency: result.frequency,
    clarity: result.clarity,
    volume: result.volume,
    clarityOK: result.clarity > 0.4,
    volumeOK: result.volume > 0.3
  });
});
```

### エラーが多発する場合
```typescript
// エラー詳細の確認
pitchDetector.setCallbacks({
  onError: (error) => {
    if (error instanceof PitchProError) {
      console.log('構造化エラー:', error.toJSON());
    } else {
      console.log('従来エラー:', error.message);
    }
  }
});
```

## 📋 チェックリスト

アップグレード完了後に確認してください：

- [ ] パッケージが1.1.0に更新されている
- [ ] 基本的な音程検出が動作している
- [ ] エラーハンドリングが適切に機能している
- [ ] パフォーマンスが改善している（特にメモリ使用量）
- [ ] デバイス固有設定が正しく適用されている
- [ ] 長時間実行でも安定している

## 🗑️ このファイルについて

**このMIGRATION_v1.1.0.mdファイルは以下の手順で削除してください：**

1. 実装中のアプリのClaudeにこの内容を伝達
2. アップグレード作業が完了
3. 動作確認が完了
4. 以下のコマンドで削除：

```bash
# 移行ガイドファイルを削除
rm MIGRATION_v1.1.0.md

# コミットして削除を記録
git add -A
git commit -m "chore: Remove migration guide after successful v1.1.0 upgrade"
git push
```

## 📞 サポート

問題が発生した場合は：

1. [Issues](https://github.com/kiyopi/pitchpro-audio-processing/issues)で報告
2. `CLAUDE.md`の開発ガイドを参照
3. `CODE_REVIEW_V1.1.0.md`で既知の課題を確認

---

**移行作業お疲れ様でした！v1.1.0で大幅に改善されたパフォーマンスをお楽しみください。**