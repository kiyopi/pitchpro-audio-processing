# 🚨 ホットフィックス: マイクレベル低下バグ

## 問題の説明
v1.1.1で5秒後にマイクレベルが徐々に下がり、最終的に0になる現象が報告されています。

## 🔍 原因の特定

### 主要原因
1. **Safari AutoGainControl**: ブラウザの自動ゲイン調整
2. **GainNode値の動的変更**: フレームレート適応時の意図しないゲイン調整
3. **MediaStream Track Constraints**: 動的制約変更による音量低下

## 🛠️ 即座に実施できる対策

### ⚡ 緊急回避方法（コード変更なし）

```javascript
// 1. より高い初期感度設定
microphoneController.setSensitivity(8.0);  // デフォルト3.0→8.0

// 2. 定期的な感度リセット
setInterval(() => {
  const currentSensitivity = microphoneController.getSensitivity();
  if (currentSensitivity < 5.0) {
    console.log('🔧 Sensitivity reset triggered');
    microphoneController.setSensitivity(8.0);
  }
}, 3000); // 3秒ごとにチェック

// 3. MediaStream健全性監視
setInterval(() => {
  const health = microphoneController.checkHealth();
  if (!health.healthy) {
    console.log('⚠️ Unhealthy microphone detected, reinitializing...');
    microphoneController.forceCleanup();
    microphoneController.initialize();
  }
}, 5000);
```

### 🔧 ブラウザ設定での対策

#### Chrome/Chromium系
1. `chrome://flags/#automatic-gain-control` → **Disabled**
2. サイト設定 → マイク → 「自動調整を無効化」

#### Safari
1. 環境設定 → Webサイト → マイクロフォン
2. 該当サイト → 「手動制御」に設定

## 📋 デバッグ用コード

```javascript
// マイクレベル監視デバッグ
let volumeLog = [];
pitchDetector.setCallbacks({
  onPitchUpdate: (result) => {
    volumeLog.push({
      time: Date.now(),
      volume: result.volume,
      rawVolume: result.rawVolume
    });
    
    // 10秒分のログを保持
    if (volumeLog.length > 300) {
      volumeLog.shift();
    }
    
    // レベル低下検出
    if (volumeLog.length > 150) { // 5秒分
      const recent = volumeLog.slice(-30); // 直近1秒
      const earlier = volumeLog.slice(-150, -120); // 4-5秒前
      
      const recentAvg = recent.reduce((sum, item) => sum + item.volume, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, item) => sum + item.volume, 0) / earlier.length;
      
      if (recentAvg < earlierAvg * 0.5 && earlierAvg > 10) {
        console.warn('🚨 Volume drop detected!', {
          recentAvg: recentAvg.toFixed(2),
          earlierAvg: earlierAvg.toFixed(2),
          dropRatio: (recentAvg / earlierAvg).toFixed(2)
        });
      }
    }
  }
});
```

## 🔍 詳細調査用コード

```javascript
// AudioContext状態監視
setInterval(() => {
  const audioManager = microphoneController.audioManager;
  const status = audioManager.getStatus();
  
  console.log('📊 AudioManager Status:', {
    audioContextState: status.audioContextState,
    mediaStreamActive: status.mediaStreamActive,
    currentSensitivity: status.currentSensitivity,
    refCount: status.refCount
  });
  
  // GainNode値の確認
  if (audioManager.gainNode) {
    console.log('🔊 GainNode value:', audioManager.gainNode.gain.value);
  }
  
  // MediaStreamトラック詳細
  if (audioManager.mediaStream) {
    const tracks = audioManager.mediaStream.getAudioTracks();
    tracks.forEach((track, index) => {
      console.log(`🎤 Track ${index}:`, {
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
        constraints: track.getConstraints(),
        settings: track.getSettings()
      });
    });
  }
}, 2000);
```

## ⚠️ 既知の問題

### Safari固有
- AutoGainControlの完全無効化が困難
- MediaStreamConstraintsの動的変更制限

### Chrome固有  
- フレーム制限時のGainNode値変更
- バックグラウンドタブでの音声処理制限

### 一般的な問題
- デバイス固有のマイクドライバー問題
- OS レベルの音声処理干渉

## 🚀 根本修正（v1.1.3で対応予定）

### AudioManager.ts修正内容
1. GainNode値の定期監視・復旧機能
2. MediaStream制約の固定化
3. ブラウザ別対策の強化

### 実装予定機能
- 自動感度復旧システム
- より詳細なデバッグログ
- デバイス固有の対策強化

## 📞 緊急サポート

この問題が critical な場合：
1. 上記の緊急回避方法を実装
2. デバッグコードで詳細ログを取得  
3. 使用環境の詳細を報告
   - ブラウザ・バージョン
   - OS・デバイス
   - マイクの種類

---

**Status**: 🔥 Critical Bug - Hotfix Required  
**ETA**: v1.1.3で根本修正予定