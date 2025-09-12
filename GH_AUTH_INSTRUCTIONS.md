# 🔐 GitHub CLI 認証手順

## 1. 認証コマンドを実行

ターミナルで以下のコマンドを実行してください：

```bash
gh auth login
```

## 2. 認証オプションの選択

以下の質問が表示されます：

### Q1: What account do you want to log into?
```
> GitHub.com
  GitHub Enterprise Server
```
→ **GitHub.com** を選択（Enterキー）

### Q2: What is your preferred protocol for Git operations?
```
> HTTPS
  SSH
```
→ お好みのプロトコルを選択（通常は **HTTPS** を推奨）

### Q3: Authenticate Git with your GitHub credentials?
```
> Yes
  No
```
→ **Yes** を選択

### Q4: How would you like to authenticate GitHub CLI?
```
> Login with a web browser
  Paste an authentication token
```

#### オプション1: ブラウザで認証（推奨）
→ **Login with a web browser** を選択
1. ワンタイムコード（8文字）が表示されます
2. Enterキーを押すとブラウザが開きます
3. コードを入力して認証を承認

#### オプション2: Personal Access Token
→ **Paste an authentication token** を選択
1. GitHubで Personal Access Token を作成
   - https://github.com/settings/tokens
   - Scopes: `repo`, `workflow`, `write:packages`
2. トークンをペースト

## 3. 認証確認

認証が成功したら、以下のコマンドで確認：

```bash
gh auth status
```

成功時の表示:
```
✓ Logged in to github.com as [your-username]
✓ Git operations for github.com configured to use https protocol.
✓ Token: gho_****
```

## 4. リリース作成コマンド

認証完了後、以下のコマンドでリリースを作成できます：

```bash
gh release create v1.2.0 \
  --title "v1.2.0 - 音量値一貫性問題完全解決" \
  --notes-file GITHUB_RELEASE_v1.2.0.md \
  dist/pitchpro.umd.js \
  dist/pitchpro.umd.js.map \
  dist/pitchpro-v1.2.0.umd.js \
  dist/index.esm.js \
  dist/index.js
```

## 🎯 認証のメリット

- **コマンドラインから直接リリース作成**
- **自動化されたワークフロー**
- **Pull Request管理**
- **Issue管理**
- **GitHub Actions連携**

---

認証が完了したら、`gh release create` コマンドでv1.2.0をリリースできます！