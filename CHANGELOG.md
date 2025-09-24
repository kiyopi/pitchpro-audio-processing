# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.1] - 2025-09-24

### 🔧 PC低周波数検出回復・音量バー更新最適化

### 🎯 Major Fixes

#### PC低周波数検出の完全回復
- **noiseGate**: 5.0% → 2.3% (100Hz以下検出復旧)
- **根本原因**: commit 670f25eでの環境ノイズ対策が低周波数を過度にブロック
- **段階的調整**: 5.0% → 3.5% → 2.3%による科学的最適化
- **結果**: 100Hz以下の音響検出完全回復

#### 音量バー更新処理の統一
- **resetAllUIElements()**: DOM再クエリからキャッシュ要素優先へ変更
- **処理一貫性**: updateUI()とreset処理の統合
- **クロスモード対応**: 要素一致検証システムによる干渉防止
- **結果**: モード切り替え時の表示残留問題解決

### 📊 Final Optimized Values (v1.3.1)

| デバイス | noiseGate | volumeMultiplier | 変更内容 | 状態 |
|---------|-----------|------------------|----------|------|
| PC | **2.3%** | 7.5x | 低周波数検出回復 | ✅ 完了 |
| iPhone | 2.8% | 9.0x | 変更なし | ✅ 維持 |
| iPad | 2.3% | 13.0x | 変更なし | ✅ 維持 |

### 🔍 Technical Improvements
- **段階的最適化手法**: 科学的根拠に基づく設定値調整プロセス確立
- **Git履歴調査**: 設定変更の根本原因特定手法確立
- **キャッシュ要素優先**: DOM操作の効率化と一貫性向上

### 🎉 Results
- ✅ **PC低周波数検出**: 100Hz以下の音響検出完全回復
- ✅ **統一更新ロジック**: キャッシュ要素中心の一貫した処理
- ✅ **全プラットフォーム検証**: PC・iPhone・iPad全環境で正常動作確認

## [1.3.0] - 2025-09-20

### 🎯 iPhone・iPad 音響検出最適化

### 🔧 Device-Specific Optimizations

#### iPhone音響特性の最適化
- **noiseGate**: 2.0% → 2.8% (環境ノイズ対策強化)
- **volumeMultiplier**: 3.0x → 9.0x (音量表示レベル向上)
- **30Hz低周波数ノイズ**: 検出問題完全解決
- **音量バー上昇率**: 過度な上昇を適切なレベルに調整

#### iPad音響特性の精密調整
- **noiseGate**: 2.5% → 2.3% (低周波数検出感度向上)
- **volumeMultiplier**: 13.0x維持 (最適レベル継続)
- **70Hz検出**: 継続的な高精度検出を確保

### 🏆 Major Achievements
- **iPhone低周波数検出問題解決**: 30Hz帯域のノイズ検出異常を根本的に修正
- **デバイス間音量表示統一**: iPhone/iPad/PC間での一貫した音量表示レベル実現
- **音響特性分析**: 各デバイスのマイク特性に基づく科学的最適化

### 📊 Final Optimized Values (v1.3.0)

| デバイス | noiseGate | volumeMultiplier | 特徴 | 状態 |
|---------|-----------|------------------|------|------|
| PC | 2.5% | 7.5x | 環境ノイズ対策 | ✅ 維持 |
| iPhone | **2.8%** | **9.0x** | 低周波数最適化 | ✅ 完了 |
| iPad | **2.3%** | 13.0x | 感度向上 | ✅ 完了 |

### 🔍 Technical Improvements
- **DeviceDetection.ts最適化**: 実測データに基づくiPhone/iPad設定の精密調整
- **統合処理システム**: デバイス固有最適化の一元管理継続
- **音響解析改善**: 30Hz帯域ノイズの効果的な除去システム

### 📝 Documentation & Analysis
- **修正プロセス文書化**: 今後の混乱防止のための詳細な修正手順記録
- **ノイズゲート最適化ロジック**: デバイスごとの調整根拠と経緯の体系化
- **NOISE_DETECTION_ISSUE_ANALYSIS.md**: 根本原因分析と解決策の包括的文書化

### 🎉 Results
- ✅ **iPhone音響検出正常化**: 30Hz低周波数ノイズ問題の完全解決
- ✅ **音量表示最適化**: 過度な音量バー上昇の適切なレベル調整
- ✅ **デバイス間一貫性**: 全プラットフォームでの統一された検出精度維持
- ✅ **知見体系化**: 今後の開発効率向上のための技術文書完備