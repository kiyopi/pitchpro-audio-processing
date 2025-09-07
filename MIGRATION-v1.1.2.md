# PitchPro v1.1.2 移行ガイド

## 📋 概要

v1.1.2では、ビルド出力ファイル名の標準化が実装されました。この変更により、404エラーが解決され、より一貫性のあるインポート体験が提供されます。

## ⚠️ 破壊的変更

### ビルド出力ファイル名の変更

| 項目 | v1.1.1以前 | v1.1.2以降 | 変更理由 |
|------|------------|------------|----------|
| ESM | `pitchpro.esm.js` | `index.esm.js` | package.json exports との一貫性 |
| CJS | `pitchpro.cjs.js` | `index.js` | Node.js標準命名規則に準拠 |
| UMD | `pitchpro.umd.js` | `pitchpro.umd.js` | **変更なし** |
| Types | `index.d.ts` | `index.d.ts` | **変更なし** |

## 🛠️ 移行が必要なケース

### ❌ 影響を受ける使用パターン

直接ファイルパスを指定している場合のみ影響があります：

```javascript
// 🚫 v1.1.1以前（動作しなくなります）
import PitchPro from './node_modules/@pitchpro/audio-processing/dist/pitchpro.esm.js';

// 🚫 CDNで直接ファイル指定（動作しなくなります）
import PitchPro from 'https://cdn.jsdelivr.net/npm/@pitchpro/audio-processing@1.1.1/dist/pitchpro.esm.js';
```

### ✅ 影響を受けない使用パターン

以下の推奨パターンは変更不要です：

```javascript
// ✅ NPMインストール（推奨・変更不要）
import { PitchDetector, AudioManager } from '@pitchpro/audio-processing';

// ✅ CDNパッケージ指定（推奨・変更不要）
import { PitchDetector } from 'https://cdn.skypack.dev/@pitchpro/audio-processing@latest';

// ✅ UMD版（変更不要）
<script src="https://cdn.jsdelivr.net/npm/@pitchpro/audio-processing@latest/dist/pitchpro.umd.js"></script>
```

## 🔄 移行手順

### Step 1: 現在の使用パターンの確認

プロジェクト全体で直接ファイルパスを検索：

```bash
# 影響を受けるインポートを検索
grep -r "pitchpro\.esm\.js" .
grep -r "pitchpro\.cjs\.js" .
```

### Step 2: 推奨パターンへの移行

**最も推奨される移行パス**：

```javascript
// 変更前
import PitchPro from './dist/pitchpro.esm.js';

// 変更後（推奨）
import { PitchDetector, AudioManager, MicrophoneController } 
  from '@pitchpro/audio-processing';
```

**直接パス指定を継続する場合**：

```javascript
// 変更前
import PitchPro from './dist/pitchpro.esm.js';

// 変更後
import PitchPro from './dist/index.esm.js';
```

### Step 3: 動作確認

```bash
# ビルドとテストの実行
npm run build
npm run test:imports  # 新しいインポートテスト
npm test              # 全体のテスト
```

## 🔧 トラブルシューティング

### 問題1: モジュールが見つからない

```
Error: Cannot resolve module './dist/pitchpro.esm.js'
```

**解決方法**：
1. パッケージの再インストール：`npm install @pitchpro/audio-processing@latest`
2. インポートパスを推奨パターンに変更
3. キャッシュクリア：`npm run build`

### 問題2: 型定義エラー

```
TS2307: Cannot find module '@pitchpro/audio-processing'
```

**解決方法**：
1. `@types`定義の確認：`npm ls @types`
2. TypeScript設定の確認：`tsconfig.json`の`moduleResolution`
3. IDE再起動

### 問題3: 404エラー（デモページ）

デモページで404エラーが発生する場合：

```html
<!-- 修正前 -->
<script src="./dist/pitchpro.esm.js"></script>

<!-- 修正後 -->
<script src="./dist/index.esm.js"></script>
```

## 🎯 テスト手順

### 1. 自動テストの実行

```bash
# インポートパステスト（新機能）
npm run test:imports

# 全体のテストスイート
npm test

# パフォーマンステスト
npm run test:performance
```

### 2. 手動検証

1. **統合テストデモ**：`integration-test-demo.html`を開く
2. **音程検出デモ**：各種デモページの動作確認
3. **ブラウザ互換性**：Chrome, Firefox, Safariでのテスト

### 3. Node.js環境での確認

```javascript
// test-migration.js
const { PitchDetector, AudioManager } = require('@pitchpro/audio-processing');
console.log('✅ CJS import successful:', !!PitchDetector);

import('@pitchpro/audio-processing').then(module => {
  console.log('✅ ESM import successful:', !!module.PitchDetector);
});
```

## 📈 パフォーマンスの改善

v1.1.2では以下の改善も含まれています：

### ビルド最適化
- ファイル名の一貫性により、バンドラーの解決時間短縮
- シンボリックリンクによる後方互換性の実現
- 不要なファイルの除去

### 開発者体験の向上
- エラーメッセージの改善
- デバッグ情報の拡充
- IDE support の強化

## 🚀 v1.1.2の新機能

移行と同時に利用可能になる機能：

### 改善されたエラーハンドリング
```javascript
// より具体的なエラーメッセージ
try {
  await pitchDetector.initialize();
} catch (error) {
  // 改善されたエラー情報
  console.log('Error type:', error.name);
  console.log('Suggestion:', error.suggestion);
}
```

### 強化されたテストスイート
```bash
# 新しいテストコマンド
npm run test:imports    # インポートパステスト
npm run test:performance # パフォーマンステスト  
npm run test:coverage   # カバレッジレポート
```

## 📞 サポート

移行に関する問題やご質問は以下までお問い合わせください：

- **GitHub Issues**: [https://github.com/kiyopi/pitchpro-audio-processing/issues](https://github.com/kiyopi/pitchpro-audio-processing/issues)
- **ドキュメント**: [README.md](./README.md)
- **変更ログ**: [CHANGELOG.md](./CHANGELOG.md)

## 🔄 移行チェックリスト

- [ ] 直接ファイルパス参照の検索と特定
- [ ] 推奨インポートパターンへの変更
- [ ] テストスイートの実行と通過確認
- [ ] デモページの動作確認
- [ ] 本番環境での検証
- [ ] チーム内での移行情報共有

---

**注意**: この移行ガイドはv1.1.1からv1.1.2への移行を対象としています。他のバージョンからの移行については、該当するCHANGELOG.mdをご確認ください。