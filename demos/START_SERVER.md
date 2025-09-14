# 🚀 PitchPro テストページへのアクセス方法

## クイックスタート

### 1. サーバー起動（ターミナルで実行）
```bash
cd /Users/isao/Documents/pitchpro-audio-processing
python3 -m http.server 3000
```

### 2. ブラウザでアクセス

#### PC（このMac）から:
- http://localhost:3000/demos/

#### iPhone/iPadから:
1. MacのIPアドレスを確認:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. モバイルSafariでアクセス:
   - http://[MacのIP]:3000/demos/mobile-volume-test.html
   - 例: http://192.168.1.5:3000/demos/mobile-volume-test.html

## テストページ一覧

| ページ | 用途 | デバイス |
|--------|------|----------|
| mobile-volume-test.html | モバイル向け音量調整 | iPhone/iPad |
| custom-config-test.html | 詳細設定テスト | PC |
| test-audio-detection-component.html | 基本動作確認 | All |

## トラブルシューティング

### ポートが使用中の場合
別のポート番号を使用:
```bash
python3 -m http.server 4000  # または 5000, 8080など
```

### モバイルから接続できない場合
- [ ] PCとモバイルが同じWi-Fiに接続されているか確認
- [ ] ファイアウォール設定を確認
- [ ] IPアドレスが正しいか確認

## 推奨設定値

| デバイス | Sensitivity | Noise Gate |
|----------|------------|------------|
| PC | 1.8 | 500 |
| iPhone | 3.5 | 500 |
| iPad | 5.0 | 500 |

## 使い方

1. **モバイルテストページ**で:
   - Sensitivityスライダーで音量感度を調整
   - Noise Gateスライダーでノイズ除去レベルを調整
   - 「設定を適用」→「テスト開始」

2. **調整のコツ**:
   - 普通の声で20-40%になるように調整
   - 大きな声で60-80%になるように調整
   - 無音時に0%になることを確認