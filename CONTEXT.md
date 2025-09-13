# Project PitchPro: CONTEXT

## 🎯 プロジェクトの目的
- Webブラウザ上で動作する、高精度で使いやすいピッチ検出ライブラリを開発する。
- 複雑なWeb Audio APIを抽象化し、UI開発者が数行のコードで利用できるAPIを提供する。
- PC、iPhone、iPadなど、デバイス間の差異を吸収し、安定した動作を実現する。

## 📍 現在のマイルストーン
- v1.2.0のリリースが完了（2025年9月12日）。
- 音量値の一貫性問題（コールバックとUI自動更新の値の不一致）は解決済み。
- 外部評価により「製品レベル」到達を認定。
- 次期v1.3.0では、保守性向上とテスト安定化を予定。

## 🛠️ 主要な技術スタック
- TypeScript
- Web Audio API
- McLeod Pitch Method (Pitchyライブラリ)

## ⚖️ 重要な決定事項

- `MicrophoneController`を統合管理システムの中心とする。
- `AudioDetectionComponent`を高レベルAPIとして提供（v1.2.0で一貫性問題解決）。
- UIの自動更新機能は`autoUpdateUI`フラグで制御（デフォルトtrue、後方互換性維持）。
- デバイス固有の最適化は自動適用、必要に応じて無効化可能。