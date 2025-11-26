# iOS Safari getUserMedia音量低下問題

## 問題の概要

**発見日**: 2025年11月26日
**影響範囲**: iOS Safari 15以降の全ユーザー
**WebKitバグID**: [Bug 230902](https://bugs.webkit.org/show_bug.cgi?id=230902)

## 問題の詳細

iOS Safari 15以降で`getUserMedia()`を複数回呼び出すと、以前のMediaStreamTrackが自動的にミュートされ、音量が低下する既知のWebKitバグ。

### 症状
- 音量が大幅に低下する
- 最悪の場合、完全に無音になる
- ブラウザをリフレッシュするまで復旧しない

### 参考リンク
- [WebKit Bug 230902](https://bugs.webkit.org/show_bug.cgi?id=230902) - Safari 15 / iOS 15以降のリグレッションバグ
- [WebRTC Hacks: Guide to Safari WebRTC](https://webrtchacks.com/guide-to-safari-webrtc/) - 複数のgetUserMedia呼び出しによるトラックミュート問題
- [Stack Overflow: Audio from mic in Safari unexpectedly diminishes](https://stackoverflow.com/questions/77241929/audio-from-mic-in-safari-mac-unexpectedly-diminishes-in-volume-after-several-s)

## PitchProでの影響箇所

### getUserMedia呼び出し箇所

| ファイル | 行番号 | 用途 | 頻度 |
|---------|--------|------|------|
| `src/core/AudioManager.ts` | 289 | メイン初期化 | 毎回initialize時 |
| `src/core/MicrophoneController.ts` | 383 | パーミッション確認 | フォールバック時のみ |

### 現在の動作フロー（問題発生パターン）

```
destroy() 呼び出し時:
  AudioDetectionComponent.destroy()
  → MicrophoneController.destroy()
  → MicrophoneLifecycleManager.destroy()
  → MicrophoneLifecycleManager.forceRelease()
  → AudioManager.forceCleanup()
  → AudioManager._cleanup()
  → track.stop()         ← ストリーム完全停止
  → mediaStream = null   ← 参照削除

initialize() 呼び出し時:
  AudioDetectionComponent.initialize()
  → MicrophoneController.initialize()
  → AudioManager.initialize()
  → AudioManager._doInitialize()
  → getUserMedia()       ← 新規ストリーム取得（iOS問題発生点）
```

### 影響を受けるシナリオ

1. **ページ遷移で戻った時**: `destroy()`→`initialize()`で新規getUserMedia呼び出し
2. **モード切替時**: `destroy()`後に再`initialize()`する実装パターン
3. **エラーリカバリー時**: 自動復旧でストリーム再取得する場合

## 現在の対策状況

- ✅ Safari WebKit互換性のためのAudioContext設定
- ✅ iOS固有のMediaConstraints設定（AGC/NC無効化）
- ✅ `track.muted`の健康チェック検出
- ❌ **MediaStream再利用の仕組みがない**
- ❌ **destroy()時のストリーム保持オプションがない**

## 推奨対策

### アプリ側での対策（即時適用可能）

**推奨**: PitchProライブラリを変更せず、アプリ側の実装パターンを変更

```typescript
// ❌ 問題が発生するパターン
function onPageLeave() {
  audioDetector.destroy();  // ストリーム破棄
}
function onPageReturn() {
  audioDetector.initialize();  // 新規getUserMedia（iOS問題発生）
}

// ✅ 推奨パターン
function onPageLeave() {
  audioDetector.stopDetection();  // 検出停止のみ
  // destroy()しない - ストリームは保持される
}
function onPageReturn() {
  audioDetector.startDetection();  // 検出再開
  // initialize()不要
}
```

### ライブラリ側での将来対策案

#### 対策案1: MediaStreamプール
```typescript
class MediaStreamPool {
  private static instance: MediaStream | null = null;

  static async getStream(): Promise<MediaStream> {
    if (!this.instance || !this.instance.active) {
      this.instance = await navigator.mediaDevices.getUserMedia({...});
    }
    return this.instance;
  }

  // destroy時にストリームを保持、ページ離脱時のみ解放
}
```

#### 対策案2: 軽量リセット機能（suspend/resume）
`destroy()`の代わりに`suspend()`メソッドを追加：
- AudioContextをsuspend（停止せず一時停止）
- MediaStreamを保持したまま
- 再開時は`resume()`のみで復帰

#### 対策案3: iOS判定による条件分岐
```typescript
// iOS Safariの場合のみストリーム再利用
if (DeviceDetection.getDeviceSpecs().isIOS) {
  // ストリームを保持して再利用
} else {
  // 通常のdestroy/initialize
}
```

## 実装優先度の判断ポイント

| 判断基準 | 内容 |
|---------|------|
| destroy/initializeの頻度 | 頻繁 → 対策必要、まれ → 優先度低 |
| 対象ユーザー層 | iOSユーザーが多い → 優先度高 |
| 既存実装の変更容易性 | アプリ側で対応可能 → ライブラリ変更不要 |

## 関連ファイル

- `src/core/AudioManager.ts` - MediaStream管理
- `src/core/MicrophoneController.ts` - マイク制御
- `src/core/MicrophoneLifecycleManager.ts` - ライフサイクル管理
- `src/components/AudioDetectionComponent.ts` - 統合コンポーネント
- `src/utils/DeviceDetection.ts` - iOS検出

---

**作成日**: 2025年11月26日
**ステータス**: 調査完了・対策検討中
**関連バージョン**: v1.3.5以降で対策検討
