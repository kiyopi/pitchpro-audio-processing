# 📋 v1.2.1 GitHubリリース作成手順

## 🚀 リリース作成ページへアクセス

1. 以下のURLにアクセス:
   https://github.com/kiyopi/pitchpro-audio-processing/releases/new

## 📝 リリース情報入力

### 1️⃣ Tag version
- **Choose a tag**: `v1.2.1` を選択（既に作成済み）

### 2️⃣ Release title
```
v1.2.1 - reset()機能完全修正版
```

### 3️⃣ Describe this release
v1.2.1のリリースノートを入力

### 4️⃣ Attach binaries (アセットファイル)

以下のファイルをドラッグ＆ドロップまたは選択してアップロード:

**必須ファイル**:
- `dist/pitchpro.umd.js` - メインUMDビルド (130.38 kB)
- `dist/pitchpro.umd.js.map` - ソースマップ
- `dist/index.esm.js` - ESモジュール版 (244.08 kB)
- `dist/index.js` - CommonJS版 (130.30 kB)
- `dist/index.d.ts` - TypeScript型定義

**✅ v1.2.1で実際にアップロード済み**:
- すべてのファイルがGitHub Actionsで自動アップロード完了

## ✅ リリース設定

### Pre-release設定
- [ ] **This is a pre-release** - チェックしない（正式リリースのため）

### Latest release設定
- [x] **Set as the latest release** - チェックする（最新版として設定）

## 🎯 公開

**Publish release** ボタンをクリックして公開

## 📊 公開後の確認

### リリースページ確認
✅ **v1.2.1 リリース完了**: <https://github.com/kiyopi/pitchpro-audio-processing/releases/tag/v1.2.1>

### ダウンロードリンクテスト
```bash
# UMDファイルのダウンロード確認
curl -I https://github.com/kiyopi/pitchpro-audio-processing/releases/download/v1.2.1/pitchpro.umd.js

# ESMファイルの確認
curl -I https://github.com/kiyopi/pitchpro-audio-processing/releases/download/v1.2.1/index.esm.js

# TypeScript型定義の確認
curl -I https://github.com/kiyopi/pitchpro-audio-processing/releases/download/v1.2.1/index.d.ts
```

## 📦 npm公開（オプション）

npmパッケージとして公開する場合:

```bash
# npmログイン確認
npm whoami

# ログインしていない場合
npm login

# パッケージ公開
npm publish

# 公開確認
npm view @pitchpro/audio-processing version
```

## 🎉 完了確認

- [ ] GitHubリリースページが正常に表示される
- [ ] アセットファイルがダウンロード可能
- [ ] リリースノートが正しく表示される
- [ ] Latest releaseタグが表示される
- [ ] npmパッケージが更新される（公開した場合）

---

## 📝 リリースノート要約

**v1.2.1 主要修正**:

- 🔧 reset()機能完全修正（MicrophoneController統合管理）
- 🎯 4ボタンUI設計原則完全準拠（initialize→start→reset→destroy）
- ✅ 包括的UIリセット（音量バー・テキスト・周波数・ノート）
- 🏗️ アーキテクチャ改善（統合管理システム強化）
- 🧪 テスト確認済み（デモページでの動作検証完了）

**対象**: reset()機能使用者・統合管理システム利用者（中程度の更新推奨）

**🔗 デモページ**: <https://kiyopi.github.io/pitchpro-audio-processing/demos/mobile-volume-test.html>