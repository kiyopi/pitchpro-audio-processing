# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.5] - 2025-11-18

### 🐛 Bug Fixes

#### startDetection()に冪等性を追加

**問題**:
- `AudioDetectionComponent.startDetection()`を既に検出中の状態で呼ぶと `"Cannot start detection: component state is detecting"` エラーが発生
- アプリケーション側が毎回 `getStatus()` で状態確認してから `startDetection()` を呼ぶ必要があった
- 同じ状態チェックコードが複数箇所に重複実装される設計上の問題
- `stopDetection()` は冪等性を持つが `startDetection()` は持たない非対称性

**修正内容**:
- `startDetection()` メソッドに冪等性を追加（src/components/AudioDetectionComponent.ts:1152-1156）
- 既に `detecting` 状態の場合は安全にスキップして `true` を返却
- `stopDetection()` と同じ設計パターンに統一

**影響**:
- ✅ `startDetection()` を何度呼んでも安全（冪等性保証）
- ✅ アプリケーション側の状態チェックコード削減可能
- ✅ エラーハンドリング不要（ライブラリ側で安全性保証）
- ✅ `stopDetection()` との設計一貫性確保

**アップグレードガイド**:
```typescript
// 修正前（状態チェックが必要だった）
const status = audioDetector.getStatus();
if (status.state !== 'detecting') {
    await audioDetector.startDetection();
}

// 修正後（状態チェック不要）
await audioDetector.startDetection();  // 既に検出中なら安全にスキップ
```

**関連ファイル**:
- `/src/components/AudioDetectionComponent.ts`: 冪等性チェック追加（Line 1152-1156）

## [1.3.4] - 2025-11-10

### 🐛 Bug Fixes

#### result.noteにオクターブ番号を含めるように修正

**問題**:
- `PitchDetector`が返す`result.note`プロパティが音名のみ（例: `"E"`, `"C#"`）を返し、オクターブ番号が含まれていなかった
- アプリケーション側で独自の音名変換処理を実装する必要があった
- 音域範囲表示が不完全（例: `"E2 - E"`）になっていた

**修正内容**:
- `FrequencyUtils.frequencyToNote()`を活用し、完全な音名（例: `"E4"`, `"C#2"`）を返すように変更
- `PitchDetector.ts`の音名変換処理を`FrequencyUtils`に統一
- 重複していた`frequencyToNoteAndOctave()`メソッドを削除

**影響**:
- ✅ `result.note`が常に完全な音名（音名+オクターブ番号）を返すようになりました
- ✅ `result.octave`プロパティは引き続き利用可能（後方互換性維持）
- ✅ アプリケーション側のフォールバック処理が不要になりました

**アップグレードガイド**:
```typescript
// 修正前（フォールバック処理が必要だった）
const note = result.note && /\d/.test(result.note)
    ? result.note
    : MusicTheory.frequencyToNote(result.frequency);

// 修正後（シンプルに使用可能）
const note = result.note;  // 常に "E4" のような完全な音名
```

**関連ファイル**:
- `/src/core/PitchDetector.ts`: FrequencyUtils使用に統一
- `/ISSUE_RESULT_NOTE_OCTAVE.md`: 詳細な問題分析ドキュメント

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