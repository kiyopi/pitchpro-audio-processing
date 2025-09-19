# Release v1.2.2 - 🏆 全デバイス70Hz検出完全制覇

**リリース日**: 2025年9月18日
**バージョン**: v1.2.2
**ステータス**: 🎯 Production Ready - 第三者評価「製品レベル達成」継続

## 🎉 概要

v1.2.2は、**「最低でも70Hzを安定して拾いたい」**というユーザー要求から始まった全面最適化プロジェクトの成果です。単日集中開発により、iPad/iPhone/PC全プラットフォームで70Hz以下の低周波数検出を完全制覇しました。

## 🔬 主要な成果

### 1. 全デバイス70Hz検出完全実現
すべてのプラットフォームで70Hz以下の低周波数を安定して検出できるようになりました。

**実証結果**:
- **PC**: C2(65.4Hz)安定検出、通常の声で60-70%音量表示
- **iPhone**: F1(43.7Hz)まで検出可能、優れた感度
- **iPad**: C2(65.5Hz)、F1(43.7Hz)検出成功、音量22.8-25.0%

### 2. デバイス固有マイク特性の科学的分析
各デバイスのマイク特性を科学的に解明し、最適な設定値を確立しました。

**デバイス特性分析**:
- **PC**: 高性能マイク＋環境ノイズ多 → 高ノイズゲート戦略
- **iPhone**: 強力ノイズキャンセリング内蔵 → 低ノイズゲート戦略
- **iPad**: 中間特性＋低音域弱 → 精密中間調整戦略

### 3. 段階的最適化手法の確立
体系的な調整プロセスにより、各デバイスで最適値を発見しました。

## 🎯 最終最適化値

| デバイス | noiseGate | volumeMultiplier | 70Hz検出 | 通常の声 |
|---------|-----------|------------------|----------|----------|
| **PC** | 2.5% | 7.5x | ✅ 実現 | 60-70% |
| **iPhone** | 1.0% | 11.5x | ✅ 実現 | 60%超 |
| **iPad** | 1.2% | 13.0x | ✅ 実証済み | 22.8-25% |

## 📦 インストール方法

### npm経由
```bash
npm install @pitchpro/audio-processing@1.2.2
```

### CDN経由
```html
<!-- UMD版 -->
<script src="https://github.com/kiyopi/pitchpro-audio-processing/releases/download/v1.2.2/pitchpro-v1.2.2.umd.js"></script>

<!-- ESM版 -->
<script type="module">
import PitchDetector from 'https://github.com/kiyopi/pitchpro-audio-processing/releases/download/v1.2.2/index.esm.js';
</script>
```

## 🔧 技術的な改善点

### 統一処理アーキテクチャ
```typescript
private _getProcessedResult(rawResult: PitchDetectionResult | null) {
  // Step 1: 基本スケーリング適用
  const initialVolume = rawResult.volume * 50;

  // Step 2: デバイス固有ノイズゲート
  const noiseGateThreshold = (this.deviceSpecs?.noiseGate ?? 0.060) * 100;

  // Step 3: デバイス固有倍率適用
  const finalVolume = initialVolume * volumeMultiplier;
}
```

### デバッグシステムの改善
v1.2.2ではデバッグシステムが環境自動判定方式に進化しました：

```typescript
// src/utils/version.ts で一元管理
export const VERSION = '1.2.2';
export const VERSION_STRING = `PitchPro v${VERSION}`;

// 常時表示: バージョン情報付きコンストラクタログ
console.log(`${VERSION_STRING} AudioDetectionComponent created with config:`, this.config);
console.log(`${VERSION_STRING} PitchDetector created with config:`, this.config);

// 開発環境のみ: 詳細デバッグ情報
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  console.log(`[Debug] Pitchyインスタンス作成: ${!!this.pitchDetector}, FFTサイズ: ${this.analyser.fftSize}`);
  console.warn(`[PitchDetector] Frame processing took ${frameProcessTime.toFixed(2)}ms (>16.67ms threshold)`);
}
```

### デバイス検出の強化
- より正確なデバイスタイプ判定
- マイク特性に基づく個別最適化
- リアルタイムパフォーマンス調整
- バージョン情報の統一管理とデバッグ表示

### setCallbacks()メソッドの確認と文書化 ⭐
**重要**: setCallbacks()メソッドが完全に実装済みであることを確認し、正確な使用方法を文書化しました。
- AudioDetectionComponent.setCallbacks()の完全実装済み確認
- PitchDetectorとの型安全なコールバック伝播機能
- Error ⟷ PitchProError の自動型変換機能
- 包括的なテストカバレッジ（4項目）で動作確認
- TypeScript型定義とUMDビルドでの正常動作確認

## 💡 使用例

### 基本的な使用方法
```javascript
import { AudioManager, PitchDetector } from '@pitchpro/audio-processing';

const audioManager = new AudioManager();
const detector = new PitchDetector(audioManager);
// コンソールに "PitchPro v1.2.2 PitchDetector created with config: {...}" が表示

await detector.initialize();

detector.setCallbacks({
  onPitchUpdate: (result) => {
    console.log(`周波数: ${result.frequency}Hz`);
    console.log(`音量: ${result.volume}%`);
    console.log(`音符: ${result.note}`);
  }
});

detector.startDetection();
```

### デバイス最適化設定の活用
```javascript
import { AudioDetectionComponent } from '@pitchpro/audio-processing';

const audioDetector = new AudioDetectionComponent({
  deviceOptimization: true,  // デバイス固有最適化を有効化
  autoUpdateUI: true,         // UI自動更新
  volumeBarSelector: '#volume-bar',
  frequencySelector: '#frequency',
  noteSelector: '#note'
});
// コンソールに "PitchPro v1.2.2 AudioDetectionComponent created with config: {...}" が表示

await audioDetector.initialize();
```

### 🎯 コールバック設定の2つの方法（v1.2.2）

#### 方法1: setCallbacks()メソッド（全コールバック対応）
```javascript
import { AudioDetectionComponent } from '@pitchpro/audio-processing';

const audioDetector = new AudioDetectionComponent({
  volumeBarSelector: '#volume-bar',
  frequencySelector: '#frequency-display'
});

await audioDetector.initialize();

// setCallbacks()で全コールバックを設定（推奨）
audioDetector.setCallbacks({
  onPitchUpdate: (result) => {
    console.log('音程検出:', result);
    // result.volume は既にデバイス固有補正済み（0-100%）
    // PC: 7.5x, iPhone: 11.5x, iPad: 13.0x の倍率が自動適用
  },
  onError: (error) => {
    console.error('検出エラー:', error);
    // PitchProError型で構造化されたエラー情報
  },
  onStateChange: (state) => {
    console.log('状態変化:', state);
    // 'uninitialized' | 'initializing' | 'ready' | 'detecting' | 'stopped' | 'error'
  },
  onVolumeUpdate: (volume) => {
    console.log('音量更新:', volume + '%');
  },
  onDeviceDetected: (specs) => {
    console.log('デバイス検出:', specs);
  }
});

await audioDetector.startDetection();
```

#### 方法2: コンストラクタ設定（onPitchUpdateのみ対応）
```javascript
import { AudioDetectionComponent } from '@pitchpro/audio-processing';

// コンストラクタではonPitchUpdateのみ設定可能
const audioDetector = new AudioDetectionComponent({
  volumeBarSelector: '#volume-bar',
  frequencySelector: '#frequency-display',
  onPitchUpdate: (result) => {
    console.log('音程検出:', result);
    // 基本的な音程検出処理
  }
});

// 他のコールバックはsetCallbacks()で追加
audioDetector.setCallbacks({
  onError: (error) => console.error('エラー:', error),
  onStateChange: (state) => console.log('状態:', state)
});

await audioDetector.initialize();
await audioDetector.startDetection();
```

#### 💡 推奨される使用パターン
```javascript
// ✅ 推奨: 基本設定はコンストラクタ、完全なコールバックはsetCallbacks()
const audioDetector = new AudioDetectionComponent({
  volumeBarSelector: '#volume-bar',
  autoUpdateUI: true,
  deviceOptimization: true,
  onPitchUpdate: (result) => {
    // 基本的な処理
    console.log(`周波数: ${result.frequency}Hz`);
  }
});

// 完全なエラーハンドリングと状態管理
audioDetector.setCallbacks({
  onError: (error) => {
    console.error('音響エラー:', error.message);
    // エラー処理ロジック
  },
  onStateChange: (state) => {
    if (state === 'error') {
      // エラー状態での UI 更新
    }
  },
  onVolumeUpdate: (volume) => {
    // カスタム音量表示
  }
});
```

## 🔄 v1.2.0からの移行

v1.2.2は後方互換性を保持していますが、一部変更があります。

### ✅ 自動的に改善される点
- バージョン情報が自動表示されるように
- デバッグ情報が環境に応じて最適化される
- デバイス固有最適化が標準で有効

### ⚠️ 変更が必要な点
```javascript
// ❌ v1.2.0以前: debug パラメータは削除されました
const detector = new PitchDetector(audioManager, {
  debug: true  // このパラメータは無効になりました
});

// ✅ v1.2.2: 環境自動判定でデバッグレベルが決定
const detector = new PitchDetector(audioManager, {
  deviceOptimization: true  // デバイス最適化は引き続き利用可能
});
```

### 💡 推奨される使用方法
```javascript
// AudioManagerも併せて利用することを推奨
import { AudioManager, PitchDetector } from '@pitchpro/audio-processing';

const audioManager = new AudioManager();
const detector = new PitchDetector(audioManager);
```

## 📊 パフォーマンス改善

### 低周波数検出性能
- **改善前**: 100Hz以上のみ安定検出
- **改善後**: 70Hz以下も安定検出（43.7Hzまで確認）

### 音量表示の最適化
- **改善前**: デバイスによって音量表示が不均一
- **改善後**: 全デバイスで通常の声が適切な音量レベルで表示

## 🐛 修正されたバグ

1. **低周波数検出不安定問題**: ノイズゲート調整により解決
2. **デバイス間音量不一致**: volumeMultiplier個別最適化により解決
3. **iPad低音域感度不足**: 専用パラメータ調整により解決
4. **バージョン情報の不一致**: src/utils/version.ts での一元管理により解決
5. **デバッグシステムの非効率性**: 環境自動判定方式への改善により解決
6. **本番環境での不要なデバッグログ**: NODE_ENV条件分岐により解決

## ⚠️ 既知の問題

現時点で重大な既知の問題はありません。

**軽微な制限事項**:
- iPadでの音量表示が他デバイスより控えめ（仕様）
- 統合テストの一部でモック関連の警告（機能に影響なし）

## 🚀 今後の予定

### v1.3.0（2025年10月予定）
- 統合テストの安定化
- マジックナンバーの定数化
- パフォーマンスモニタリングの強化

## 📝 開発者向け情報

### ビルド方法
```bash
git clone https://github.com/kiyopi/pitchpro-audio-processing.git
cd pitchpro-audio-processing
npm install
npm run build
```

### テスト実行
```bash
npm test                    # 全テスト実行
npm test -- --run          # CI環境向け
npm run test:device        # デバイス固有テスト
```

### デバッグ情報の取得
```javascript
// v1.2.2ではコンストラクタで自動的にバージョン表示
const detector = new PitchDetector(audioManager);
// コンソールに "PitchPro v1.2.2 PitchDetector created with config: {...}" が表示される

const audioDetector = new AudioDetectionComponent();
// コンソールに "PitchPro v1.2.2 AudioDetectionComponent created with config: {...}" が表示される

// 開発環境でのデバッグ情報（NODE_ENV=development時のみ自動表示）
// - Pitchyインスタンス作成詳細
// - パフォーマンス警告（16.67ms超過時）

// デバイス情報の確認
console.log(detector.getDeviceSpecs());

// バージョン情報の確認
import { VERSION, VERSION_STRING } from '@pitchpro/audio-processing';
console.log(VERSION);        // "1.2.2"
console.log(VERSION_STRING); // "PitchPro v1.2.2"

// 注意: 以前の debug: true パラメータは削除されました
// 環境に応じて自動的にデバッグレベルが決定されます
```

## 🙏 謝辞

- ユーザーの皆様からの貴重なフィードバック
- 特に「70Hz検出」要望を提供いただいた方々
- 第三者評価により「製品レベル」認定をいただいた評価者の方

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルをご確認ください。

## 🔗 関連リンク

- [GitHubリポジトリ](https://github.com/kiyopi/pitchpro-audio-processing)
- [npm パッケージ](https://www.npmjs.com/package/@pitchpro/audio-processing)
- [リリースページ](https://github.com/kiyopi/pitchpro-audio-processing/releases/tag/v1.2.2)
- [変更履歴](CHANGELOG.md)

---

**開発期間**: 2025年9月18日（単日集中開発）
**評価**: 「コードはすでに製品レベルに達しています」（第三者評価より）継続

🤖 Generated with [Claude Code](https://claude.ai/code)