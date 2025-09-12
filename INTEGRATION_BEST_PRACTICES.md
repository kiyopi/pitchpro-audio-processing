# PitchPro v1.1.9 統合ベストプラクティスガイド

## 🎯 このガイドの目的

PitchPro v1.1.9は製品レベルの完成度を持つライブラリですが、適切に統合するには**責任分担の理解**が不可欠です。このガイドでは、実際の統合で発生した問題と解決策を基に、ベストプラクティスを解説します。

## 📋 目次

1. [基本原則](#基本原則)
2. [よくある統合の落とし穴](#よくある統合の落とし穴)
3. [推奨実装パターン](#推奨実装パターン)
4. [トラブルシューティング](#トラブルシューティング)
5. [実装チェックリスト](#実装チェックリスト)

## 基本原則

### 1. 責任分担の明確化

**PitchProライブラリの責任範囲:**
- 音声処理とピッチ検出
- 基本的なUI更新（汎用的なセレクター使用）
- リソース管理とクリーンアップ

**アプリケーション側の責任範囲:**
- カスタムUI要素の管理
- 独自のID命名規則への対応
- 追加のビジネスロジック

### 2. ライブラリとアプリケーションの協調

```javascript
// ❌ 悪い例：ライブラリのみに依存
microphoneController.reset();  // UIが完全にリセットされることを期待

// ✅ 良い例：明示的な補完
microphoneController.reset();  // ライブラリのリセット
resetAllUIElements();          // アプリ固有のUI要素も確実にリセット
```

## よくある統合の落とし穴

### 🚨 問題1: CSS強制設定による干渉

**症状:** リセット後に音量バーが動かなくなる

**原因:**
```javascript
// ❌ 問題のあるコード
volumeBar.style.minWidth = '0%';
volumeBar.style.maxWidth = '0%';  // これが残り続ける！
```

**解決策:**
```javascript
// ✅ 正しいリセット
volumeBar.style.minWidth = '';  // 空文字列で初期値に戻す
volumeBar.style.maxWidth = '';
volumeBar.style.width = '0%';   // widthのみ設定
```

### 🚨 問題2: ID命名規則の不一致

**症状:** 特定のUI要素がリセットされない

**原因:**
```html
<!-- アプリ側のHTML -->
<div id="range-frequency-display">0 Hz</div>

<!-- PitchProが探すセレクター -->
#range-frequency  /* -displayサフィックスがない */
```

**解決策:**

**オプション1: 標準命名規則に合わせる**
```html
<div id="range-frequency">0 Hz</div>
```

**オプション2: カスタムリセット処理を追加**
```javascript
function resetAllUIElements() {
    // アプリ固有のID命名に対応
    const frequencyDisplay = document.getElementById('range-frequency-display');
    if (frequencyDisplay) frequencyDisplay.textContent = '0 Hz';
}
```

### 🚨 問題3: updateUIのカスタマイズによる副作用

**症状:** 音量表示が期待通りに動作しない

**原因:**
```javascript
// ❌ 問題のあるカスタマイズ
function updateUI(result) {
    // 独自の乗数を追加
    const adjustedVolume = result.volume * 2.0;  
    volumeBar.style.width = `${adjustedVolume}%`;
}
```

**解決策:**
```javascript
// ✅ ライブラリのデフォルト値を信頼
function updateUI(result) {
    volumeBar.style.width = `${result.volume}%`;
}
```

## 推奨実装パターン

### パターン1: 最小構成（推奨）

```javascript
// 1. 初期化はシンプルに
const microphoneController = new PitchPro.MicrophoneController();
await microphoneController.initialize();

const audioManager = microphoneController.audioManager;
const pitchDetector = new PitchPro.PitchDetector(audioManager);
// カスタム設定は必要最小限に
await pitchDetector.initialize();

// 2. 登録を忘れずに
microphoneController.registerDetector(pitchDetector);

// 3. コールバックはシンプルに
pitchDetector.setCallbacks({
    onPitchUpdate: (result) => {
        // ライブラリの値をそのまま使用
        updateUI(result);
    }
});
```

### パターン2: カスタムUI要素との統合

```javascript
// アプリ固有のリセット処理を定義
function resetCustomUIElements() {
    // カスタムID命名規則に対応
    const customElements = [
        'range-frequency-display',
        'mic-frequency-display',
        'practice-frequency-display'
    ];
    
    customElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '0 Hz';
    });
}

// 停止処理で両方を呼び出す
function handleStop() {
    microphoneController.reset();    // ライブラリのリセット
    resetCustomUIElements();          // カスタムUIのリセット
}
```

### パターン3: モード切り替えの実装

```javascript
// モード切り替え時の完全リセットパターン
async function switchMode(newMode) {
    const wasDetecting = isDetecting;
    
    // 1. 完全停止
    microphoneController.reset();
    resetAllUIElements();  // UI要素も確実にリセット
    
    // 2. モード更新
    currentMode = newMode;
    updateModeUI(newMode);
    
    // 3. 必要に応じて再開
    if (wasDetecting) {
        await delay(200);  // DOM更新を待つ
        microphoneController.start();
    }
}
```

## トラブルシューティング

### デバッグ手法

```javascript
// 1. 要素の存在確認
function debugUIElements() {
    const selectors = ['#range-frequency', '#range-frequency-display'];
    selectors.forEach(selector => {
        const element = document.querySelector(selector);
        console.log(`${selector}: ${element ? '✅ found' : '❌ not found'}`);
    });
}

// 2. CSS状態の確認
function debugVolumeBar() {
    const bar = document.getElementById('practice-volume-bar');
    if (bar) {
        console.log('Volume bar styles:', {
            width: bar.style.width,
            minWidth: bar.style.minWidth,
            maxWidth: bar.style.maxWidth,
            computed: getComputedStyle(bar).width
        });
    }
}

// 3. リセット動作の確認
function testReset() {
    console.log('Before reset:', getCurrentValues());
    microphoneController.reset();
    resetAllUIElements();
    console.log('After reset:', getCurrentValues());
}
```

### よくあるエラーと解決策

| エラー | 原因 | 解決策 |
|--------|------|--------|
| `setPitchDetector is not a function` | 間違ったメソッド名 | `registerDetector()`を使用 |
| 音量が40%までしか上がらない | カスタム設定の問題 | デフォルト設定を使用 |
| リセット後UIが0にならない | CSS強制設定の残留 | スタイルを空文字列でクリア |
| 特定モードだけリセットされない | ID命名規則の不一致 | カスタムリセット処理を追加 |

## 実装チェックリスト

### 初期実装時

- [ ] PitchPro v1.1.9のUMDファイルを正しく読み込んでいる
- [ ] `MicrophoneController`を初期化している
- [ ] `PitchDetector`をデフォルト設定で初期化している
- [ ] `registerDetector()`でPitchDetectorを登録している
- [ ] シンプルなコールバック設定をしている

### UI統合時

- [ ] ID命名規則を確認（標準: `mode-element`形式）
- [ ] updateUI関数はライブラリの値をそのまま使用
- [ ] CSS強制設定（minWidth, maxWidth）を避ける
- [ ] カスタムUI要素用のリセット処理を実装

### テスト時

- [ ] 初期化 → 開始 → 停止の基本フロー
- [ ] モード切り替え時のUI状態
- [ ] リセット後のUI要素が0になることを確認
- [ ] 再開時に正常動作することを確認

## まとめ

### 🎯 成功の鍵

1. **ライブラリを信頼する**: デフォルト設定で十分動作する
2. **責任を明確にする**: ライブラリとアプリの役割を理解
3. **シンプルに保つ**: 不要なカスタマイズを避ける
4. **明示的に補完する**: カスタムUI要素は明示的に管理

### ⚠️ 避けるべきこと

1. **ライブラリの内部を修正しない**
2. **過度なカスタム設定を避ける**
3. **CSS強制設定の乱用を避ける**
4. **暗黙的な動作に依存しない**

### 📚 参考リンク

- [PitchPro v1.1.9 リリースノート](./CHANGELOG.md)
- [APIドキュメント](./docs/API.md)
- [サンプル実装](./demos/)

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-10  
**Based on**: PitchPro v1.1.9 実装経験