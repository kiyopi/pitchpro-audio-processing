# PitchPro 停止・リセットパターンガイド

## 📋 概要

このガイドでは、PitchPro Audio Processingライブラリにおける停止・リセット処理の正しい実装パターンを説明します。

---

## 🎯 設計思想

### 4ボタンシンプルUI設計（v1.1.8以降）

```
initialize() → start() → reset() → destroy()
```

各メソッドには明確な責任があり、それぞれが独立した役割を持ちます。

---

## 🔧 メソッドの役割と責任

| メソッド | 責任 | UI状態 | 音声処理 | 使用場面 |
|----------|------|--------|----------|----------|
| `start()` | 検出開始 | 更新開始 | 処理開始 | 測定開始時 |
| `stopDetection()` | 検出停止のみ | **最後の値を保持** ⚠️ | 処理停止 | 一時停止時 |
| `resetDisplayElements()` | UI初期化のみ | 0にリセット | 変更なし | UI クリア時 |
| `reset()` | 完全な初期化 | 0にリセット | 処理停止 | 完全停止時 |
| `destroy()` | リソース解放 | 要素削除 | 完全破棄 | 終了時 |

---

## ❌ よくある間違いパターン

### 間違い1: stopDetection()だけでUIがリセットされると期待

```typescript
// ❌ 間違い：UIの値が残ってしまう
stopButton.onclick = () => {
  audioDetector.stopDetection();
  // UIには最後の測定値が表示され続ける！
};
```

**問題**: `stopDetection()`は検出処理を停止するだけで、UIの値は意図的に保持されます。

### 間違い2: 毎回destroy()を呼ぶ

```typescript
// ❌ 間違い：リソースの無駄な再作成
stopButton.onclick = () => {
  audioDetector.destroy();  // 完全破棄
  // 次回使用時に再初期化が必要になる
};
```

**問題**: `destroy()`は完全な終了時のみ使用すべきです。

---

## ✅ 正しい実装パターン

### パターン1: AudioDetectionComponent単体使用

```typescript
// 初期化
const audioDetector = new AudioDetectionComponent({
  volumeBarSelector: '#volume-bar',
  volumeTextSelector: '#volume-text',
  frequencySelector: '#frequency',
  noteSelector: '#note'
});

await audioDetector.initialize();

// 開始ボタン
startButton.onclick = () => {
  audioDetector.startDetection();
};

// 停止ボタン（UIもリセット）
stopButton.onclick = () => {
  audioDetector.stopDetection();        // 検出停止
  audioDetector.resetDisplayElements();  // UIリセット
};

// 一時停止ボタン（値を保持）
pauseButton.onclick = () => {
  audioDetector.stopDetection();  // UIの値は保持される
};

// 終了時
window.onbeforeunload = () => {
  audioDetector.destroy();  // リソース完全解放
};
```

### パターン2: MicrophoneController統合使用（推奨）

```typescript
// 初期化
const micController = new MicrophoneController();
const audioDetector = new AudioDetectionComponent(config);
const pitchDetector = new PitchDetector();

micController.registerComponents(audioDetector, pitchDetector);
await micController.initialize();

// 開始ボタン
startButton.onclick = () => {
  micController.start();  // 統合開始
};

// 停止ボタン（完全リセット）
stopButton.onclick = () => {
  micController.reset();  // 停止 + UIリセット + 状態クリア
};

// 終了時
window.onbeforeunload = () => {
  micController.destroy();  // 統合破棄
};
```

---

## 🎨 UIパターン別実装例

### 1. 音楽プレイヤー型（再生/一時停止/停止）

```typescript
class MusicPlayerUI {
  private audioDetector: AudioDetectionComponent;

  // 再生
  play() {
    this.audioDetector.startDetection();
  }

  // 一時停止（値を保持）
  pause() {
    this.audioDetector.stopDetection();
    // UIの値はそのまま表示
  }

  // 停止（完全リセット）
  stop() {
    this.audioDetector.stopDetection();
    this.audioDetector.resetDisplayElements();
  }
}
```

### 2. 測定器型（開始/停止）

```typescript
class MeasurementUI {
  private micController: MicrophoneController;

  // 測定開始
  startMeasurement() {
    this.micController.start();
  }

  // 測定終了（値をリセット）
  stopMeasurement() {
    this.micController.reset();  // 包括的リセット
  }
}
```

### 3. リアルタイムモニター型（常時動作）

```typescript
class MonitorUI {
  private audioDetector: AudioDetectionComponent;
  private isMonitoring = false;

  // モニター切り替え
  toggleMonitor() {
    if (this.isMonitoring) {
      // 停止時は値をクリア
      this.audioDetector.stopDetection();
      this.audioDetector.resetDisplayElements();
    } else {
      // 開始
      this.audioDetector.startDetection();
    }
    this.isMonitoring = !this.isMonitoring;
  }
}
```

---

## 🔍 デバッグのヒント

### コンソール警告の活用

開発環境では、`stopDetection()`呼び出し時に警告が表示されます：

```
⚠️ [AudioDetectionComponent] stopDetection() called - UI values will be preserved.
   To clear UI: call resetDisplayElements() after this method
   For complete reset: use MicrophoneController.reset() instead
```

この警告が表示された場合、UIリセットが必要かどうか確認してください。

### 状態確認

```typescript
// 現在の状態を確認
const status = audioDetector.getStatus();
console.log('State:', status.state);  // 'ready', 'running', 'stopped', etc.
console.log('UI preserved:', status.state === 'stopped');  // true if UI values are preserved
```

---

## 📝 まとめ

### 重要なポイント

1. **`stopDetection()`はUIをリセットしません** - これは意図的な設計です
2. **UIリセットが必要な場合は明示的に`resetDisplayElements()`を呼ぶ**
3. **完全なリセットには`MicrophoneController.reset()`を使用**
4. **用途に応じて適切なパターンを選択**

### クイックリファレンス

```typescript
// 検出停止のみ（UI保持）
audioDetector.stopDetection();

// 検出停止 + UIリセット
audioDetector.stopDetection();
audioDetector.resetDisplayElements();

// 完全リセット（推奨）
micController.reset();
```

---

## 🔗 関連ドキュメント

- [AudioDetectionComponent API](./API_REFERENCE.md#audiodetectioncomponent)
- [MicrophoneController API](./API_REFERENCE.md#microphonecontroller)
- [設計思想](../CLAUDE.md#統合管理システム)

---

*最終更新: 2025年9月15日*