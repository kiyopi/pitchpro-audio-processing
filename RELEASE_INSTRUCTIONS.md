# 📋 v1.2.0 GitHubリリース作成手順

## 🚀 リリース作成ページへアクセス

1. 以下のURLにアクセス:
   https://github.com/kiyopi/pitchpro-audio-processing/releases/new

## 📝 リリース情報入力

### 1️⃣ Tag version
- **Choose a tag**: `v1.2.0` を選択（既に作成済み）

### 2️⃣ Release title  
```
v1.2.0 - 音量値一貫性問題完全解決
```

### 3️⃣ Describe this release
`GITHUB_RELEASE_v1.2.0.md` の内容を全てコピー＆ペースト

### 4️⃣ Attach binaries (アセットファイル)

以下のファイルをドラッグ＆ドロップまたは選択してアップロード:

**必須ファイル**:
- `dist/pitchpro.umd.js` - メインUMDビルド
- `dist/pitchpro.umd.js.map` - ソースマップ
- `dist/pitchpro-v1.2.0.umd.js` - バージョン付きUMD（重要）

**オプションファイル**:
- `dist/index.esm.js` - ESモジュール版
- `dist/index.js` - CommonJS版
- `dist/index.d.ts` - TypeScript型定義

## ✅ リリース設定

### Pre-release設定
- [ ] **This is a pre-release** - チェックしない（正式リリースのため）

### Latest release設定
- [x] **Set as the latest release** - チェックする（最新版として設定）

## 🎯 公開

**Publish release** ボタンをクリックして公開

## 📊 公開後の確認

### リリースページ確認
https://github.com/kiyopi/pitchpro-audio-processing/releases/tag/v1.2.0

### ダウンロードリンクテスト
```bash
# UMDファイルのダウンロード確認
curl -I https://github.com/kiyopi/pitchpro-audio-processing/releases/download/v1.2.0/pitchpro.umd.js

# バージョン付きファイルの確認
curl -I https://github.com/kiyopi/pitchpro-audio-processing/releases/download/v1.2.0/pitchpro-v1.2.0.umd.js
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

**v1.2.0 主要修正**:
- 🎯 音量値一貫性問題完全解決（6.139のような異常値を修正）
- ⚠️ autoUpdateUI警告システム実装
- 🔧 `_getProcessedResult()`による統合処理
- 🧪 13テスト全通過・TypeScript完全対応

**対象**: 全ユーザー（重要なバグ修正のため即座の更新推奨）