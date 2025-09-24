# PitchPro Audio Processing - Claude Code ガイド

## プロジェクト概要
PitchPro Audio Processingは、リアルタイム音響処理とピッチ検出に特化したTypeScriptライブラリです。McLeod Pitch Methodを使用し、iPhone/Android/PC向けに最適化されています。

## 現在のバージョン
**v1.3.1** - 2025年9月24日リリース（**🔧 PC低周波数検出回復・音量バー更新最適化**）

> 📊 **外部評価**: 「コードはすでに製品レベルに達しています」（第三者評価より）継続
> 🎯 **v1.3.0主要成果**: iPhone特有30Hz低周波数ノイズ問題完全解決・デバイス間音量表示統一・実測データ最適化
> 📱 **技術革新**: 各デバイスのマイク特性に基づく科学的調整による統一音響検出システム

## 主要コンポーネント

### 🎯 重要な設計原則（必読）

#### **音響検出最適化設定値（v1.3.1確定）**
| デバイス | noiseGate | volumeMultiplier | 最適化対象 | 状態 |
|---------|-----------|------------------|----------|------|
| PC | **2.3%** | **7.5x** | 低周波数検出回復 | ✅ 完了 |
| iPhone | **2.8%** | **9.0x** | 30Hz低周波数最適化 | ✅ 維持 |
| iPad | **2.3%** | **13.0x** | 感度向上 | ✅ 維持 |

**🎯 達成目標**: 全デバイスで70Hz以下の低周波数安定検出 + 通常の声で60%超音量表示

#### **4ボタンUI設計（v1.1.8製品レベル到達の核心）**
```
initialize() → start() → reset() → destroy()
```

**⚠️ 重要**: `stopDetection()`は**UIをリセットしません**（設計思想）
- `stopDetection()`: 検出停止のみ（UI値は保持）
- `resetDisplayElements()`: UI初期化のみ
- `reset()`: 完全初期化（推奨）

### コアシステム
- `PitchDetector`: メインのピッチ検出エンジン
- `AudioManager`: AudioContext管理とリソース制御
- `DeviceDetection`: デバイス固有の最適化設定
- **`MicrophoneController`** ⭐: 統合管理システム（v1.1.8新機能）

### ユーティリティ
- `AdaptiveFrameRateLimiter`: 適応フレームレート制御
- `PerformanceMonitor`: CircularBufferによるメトリクス監視
- 構造化エラーハンドリングシステム
- **`AudioDetectionComponent`**: 包括的UIリセット機能（v1.1.8拡張）

## 改善完了項目（v1.3.1）

### 🔧 PC低周波数検出回復・音量バー更新最適化（v1.3.1）

**開発期間**: 2025年9月24日
**開発動機**: PC環境での100Hz以下音響検出喪失問題と音量バー更新処理の一貫性確保

#### 🎯 PC低周波数検出回復
**問題解決**:
- **noiseGate**: 5.0% → 2.3%（低周波数検出復旧）
- **根本原因**: commit 670f25eでの環境ノイズ対策が低周波数を過度にブロック
- **最適値発見**: 段階的調整（5.0% → 3.5% → 2.3%）による理想バランス達成

#### 🔄 音量バー更新処理統一
**統一化成果**:
- **resetAllUIElements()**: キャッシュ要素優先へ変更
- **処理一貫性**: updateUI()とreset処理の統合による干渉防止
- **クロスモード対応**: 要素一致検証システムによる安全な更新

#### 📊 技術的達成
- ✅ **PC低周波数検出**: 100Hz以下の音響検出完全回復
- ✅ **統一処理システム**: キャッシュ要素中心の一貫した更新ロジック
- ✅ **段階的最適化**: 科学的根拠に基づく設定値調整手法確立
- ✅ **原因究明手法**: Git履歴調査による設定変更要因特定

## 改善完了項目（v1.3.0）

### 🎯 iPhone・iPad音響検出最適化（v1.3.0）

**開発期間**: 2025年9月20日
**開発動機**: iPhone特有の30Hz低周波数ノイズ検出問題と音量バー上昇率問題の解決

#### 🔧 デバイス固有最適化の実現
**iPhone音響特性の最適化**:
- **noiseGate**: 2.0% → 2.8%（環境ノイズ対策強化）
- **volumeMultiplier**: 3.0x → 9.0x（音量表示レベル向上）
- **30Hz低周波数ノイズ**: 検出問題完全解決

**iPad精密調整**:
- **noiseGate**: 2.5% → 2.3%（低周波数検出感度向上）
- **volumeMultiplier**: 13.0x維持（最適レベル継続）

#### 📊 技術的成果
- ✅ **iPhone音響検出正常化**: 30Hz低周波数ノイズの完全除去
- ✅ **音量表示最適化**: 過度な音量バー上昇の適切な調整
- ✅ **デバイス間一貫性**: 全プラットフォームでの統一された検出精度維持
- ✅ **知見体系化**: 今後の開発効率向上のための技術文書完備

#### 📝 ドキュメント強化
- **NOISE_DETECTION_ISSUE_ANALYSIS.md**: 根本原因分析と解決策の包括的文書化
- **修正プロセス文書化**: 今後の混乱防止のための詳細修正手順記録
- **段階的最適化手法**: デバイスごとの調整根拠と経緯の体系化

## 改善完了項目（v1.2.2）

### 🏆 全デバイス70Hz検出完全制覇（v1.2.2）
**開発期間**: 2025年9月18日（単日集中開発）
**開発動機**: 「最低でも70Hzを安定して拾いたい」のユーザー要求から始まった全面最適化

#### 🔬 科学的デバイス分析の確立
**革新的発見**: デバイス固有マイク特性の科学的解明
- **PC**: 高性能マイク+環境ノイズ多 → 高ノイズゲート(2.5%)戦略
- **iPhone**: 強力NC内蔵+環境ノイズ少 → 低ノイズゲート(1.0%)戦略
- **iPad**: 中間特性+低音域弱 → 精密中間調整(1.2%)戦略

#### 🎯 段階的最適化手法の確立
**iPadでの成功パターン**:
```
段階的調整: 0.020 → 0.015 → 0.010 → 0.012 (最適値発見)
実証結果: C2(65.5Hz), F1(43.7Hz)検出成功、音量22.8-25.0%
```

**他デバイスへの応用**:
- iPhone: 0.010設定でiPadより積極的最適化
- PC: 0.025設定で環境ノイズ配慮の現実的バランス

#### 🔧 統一処理アーキテクチャ実装
```typescript
// v1.2.2 統一処理システム
private _getProcessedResult(rawResult: PitchDetectionResult | null) {
  // Step 1: BASE_SCALING_FACTOR適用
  const initialVolume = rawResult.volume * 50;

  // Step 2: デバイス固有ノイズゲート判定
  const noiseGateThreshold = (this.deviceSpecs?.noiseGate ?? 0.060) * 100;

  // Step 3: デバイス固有volumeMultiplier適用
  const finalVolume = initialVolume * volumeMultiplier;
}
```

#### 📊 実証された成果
**技術的達成**:
- ✅ 全デバイスで70Hz以下低周波数安定検出
- ✅ 通常の声で60%超音量表示実現
- ✅ デバイス間表示一貫性確保

**品質向上**:
- ✅ 科学的根拠に基づく設定値
- ✅ 段階的最適化手法の体系化
- ✅ serenaメモリーシステムでの知見蓄積

### 🔍 重要な機能検証（v1.2.2）
#### 双方向機能の完全性確認
**autoUpdateUI + deviceOptimization機能**の詳細調査を実施
- ✅ 生データ取得モード: rawVolume完全保持
- ✅ 自動最適化モード: 処理済みデータ提供
- ✅ 柔軟な使い分け: ユーザー用途に応じた選択可能

#### setCallbacks()メソッド完全実装確認（v1.2.2）
**API一貫性の包括的検証**を実施し、完全動作を確認
- ✅ **メソッド存在**: `src/components/AudioDetectionComponent.ts:921`に完全実装
- ✅ **UMDビルド**: `dist/pitchpro.umd.js`に正常包含確認
- ✅ **TypeScript定義**: 型安全性とIntelliSense対応完了
- ✅ **テストカバレッジ**: 19/19テスト合格（setCallbacks専用4テスト含む）
- ✅ **実行時動作**: Node.js環境での実際動作確認完了

**対応コールバック**:
- `onPitchUpdate`: 音程検出結果の受信
- `onError`: PitchProError型での構造化エラー処理
- `onStateChange`: 初期化〜検出〜停止の状態変化監視
- `onVolumeUpdate`: リアルタイム音量更新
- `onDeviceDetected`: デバイス特性検出時の通知

**設計仕様**:
- **コンストラクタ**: `onPitchUpdate`のみサポート（基本設定用）
- **setCallbacks()**: 全5種類コールバック対応（完全機能用）
- **推奨パターン**: 基本設定はコンストラクタ、完全制御はsetCallbacks()を併用

## 改善完了項目（v1.1.8）

### 🛡️ 重要機能追加（v1.1.8）
- **クロスモード干渉完全防止**：UIキャッシュ要素と現在セレクターの一致検証システム
- **自動noteSelector管理**：未指定時の自動クリアによる開発者負担軽減
- **包括的UI保護**：volume bar, volume text, frequency, note全要素での干渉防止
- **async/await改善**：updateSelectorsメソッドの可読性向上とsetTimeoutネスト解消
- **タイミング定数化**：NOTE_RESET_DELAY_MS等のマジックナンバー解消

### 🎯 統合管理システム（v1.1.8 製品レベル到達の核心機能）
- **MicrophoneController統合管理**：PitchDetector + AudioDetectionComponent の完全統合
- **4ボタンシンプルUI**：initialize()→start()→reset()→destroy() の直感的操作
- **symmetric operations**: reset()（完全停止）⟷ start()（完全復帰）の対称設計
- **統合reset()機能**：PitchDetector停止 + UI初期化 + マイクミュート + リカバリーリセット
- **完全復帰start()機能**：ミュート解除 + 検出再開の一括実行

### 🔄 継続機能（v1.1.6）
- **モード切り替え時の周波数表示リセット機能**：非アクティブモードが0.0 Hzに正しくリセットされる機能を実装
- **isUpdatingSelectorsフラグ**：精密なUI更新制御による切り替え中の衝突防止
- **タイミング制御システム**：50ms, 200ms段階でのUI更新調整
- **動的セレクター検索**：freq-1, freq-2, freq-3等の自動検出・リセット
- **強制リフロー処理**：確実な視覚更新のための最適化

### ✨ 継続機能（v1.1.5）
- **updateSelectors()にUIリセット機能**：音量バー切り替え時の表示残留バグを完全解決
- **resetAllUIElements()メソッド実装**：全UI要素の自動初期化（音量バー/テキスト/周波数/音符）
- **包括的UI要素対応**：progress要素とdivスタイル両方に対応したリセット機能

### 🚨 緊急修正完了（v1.1.3）
- **マイクレベル低下バグ修正**：5秒後の音量低下問題を解決
- **ゲイン監視システム**：2秒間隔での自動ドリフト検出・修正機能
- **AGC完全無効化**：Chrome/Firefox/Safari全ブラウザ対応
- **自動復旧機能**：10%以上のゲイン変動を即座に補正

### ✅ ビルドシステム改善（v1.1.2）
- **ファイル名標準化**：`pitchpro.*.js` → `index.*.js`
- **後方互換性**：シンボリックリンクによる旧パス対応
- **CI/CD強化**：GitHub Actions自動検証パイプライン
- **テスト拡充**：インポートパス自動テスト追加

### ✅ メモリ最適化（v1.1.0）
- CircularBufferによるO(1)メモリ操作
- 無制限配列増大の防止
- パフォーマンス指標の効率的な保存

### ✅ パフォーマンス向上
- 絶対時刻スケジューリングによる累積誤差防止
- 適応FPS制御（30-60FPS）
- デバイス別パフォーマンス最適化

### ✅ エラーハンドリング統合
- PitchProError基底クラス
- AudioContextError, PitchDetectionError
- 回復可能エラーの自動分類

### ✅ 包括的テストスイート
- デバイス固有テスト（iPhone/Android/Desktop）
- パフォーマンステスト（フレームドロップ、省電力）
- 実世界シナリオテスト

## 解決済み課題（v1.1.8）

### ✅ 完全解決された重要課題

#### 1. ✅ クロスモード干渉問題（解決済み）
**解決した問題**: モード切り替え後にUI要素が意図しない更新を続ける
**実装した解決策**:
```typescript
// 要素とセレクターの一致検証
if (this.uiElements.note && this.config.noteSelector) {
  const currentElement = document.querySelector(this.config.noteSelector);
  if (currentElement && currentElement === this.uiElements.note) {
    // 一致する場合のみ更新
  }
}
```

#### 2. ✅ noteSelector手動管理の問題（解決済み）
**解決した問題**: 開発者がnoteSelector: ''を手動設定する必要性
**実装した解決策**:
```typescript
// 自動クリア機能
if (selectors.noteSelector !== undefined) {
  this.config.noteSelector = selectors.noteSelector;
} else {
  this.config.noteSelector = ''; // 自動クリア
}
```

#### 3. ✅ コード品質問題（解決済み）
**解決した問題**: updateSelectorsの複雑なsetTimeoutネストと可読性
**実装した解決策**: async/await化とタイミング定数化

#### 4. ✅ ミュート解除復帰問題（解決済み）
**解決した問題**: ミュート解除後に音響検出が自動復帰しない
**実装した解決策**: MicrophoneController.start()メソッドによる統合復帰機能
```typescript
start(): boolean {
  this.unmute();  // ミュート解除
  if (this.pitchDetector) {
    return this.pitchDetector.startDetection();  // 検出再開
  }
  return false;
}
```

#### 5. ✅ テストページUI複雑化問題（解決済み）
**解決した問題**: 7個のボタンによる操作の複雑化と重複機能
**実装した解決策**: 4ボタンへの大幅簡素化
- 削除: testMicrophone(), mute()/unmute(), startDetection()/stopDetection()
- 保持: initialize(), reset(), start(), destroy()
- 結果: 7ボタン → 4ボタン（42%削減）

## 📊 製品レベル到達の証明（v1.1.8）

### 🎯 外部評価による品質認定
**第三者評価結果**: 「コードはすでに製品レベルに達しています」

**評価された主要品質指標**:
1. **UI管理システムの集中化**: AudioDetectionComponentによる包括的リセット機能
2. **状態管理の一貫性**: updateSelectorsとreset機能の統合設計
3. **コード構造の堅牢性**: 現在実装で「十分に堅牢」と評価
4. **将来拡張性**: 軽微な改善提案のみ（機能追加時の考慮事項）

### 🏆 達成した製品レベル機能
- ✅ **完全なクロスモード干渉防止**（要素一致検証システム）
- ✅ **自動セレクター管理**（開発者負担ゼロ）
- ✅ **統合管理システム**（MicrophoneController中心設計）  
- ✅ **直感的4ボタンUI**（7ボタンから42%削減、操作性大幅改善）
- ✅ **対称的な操作設計**（reset ⇄ start の完全対応）
- ✅ **包括的テストカバレッジ**（デバイス別・パフォーマンス・統合テスト）

### 📈 継続的改善の方針
外部評価を受けて、v1.1.8で**基本品質は製品レベル到達済み**。今後の開発は：
1. **機能追加**よりも**保守性・拡張性**重視
2. **軽微な洗練**による更なる品質向上
3. **新機能追加時**の設計一貫性維持

---

## 🔥 v1.2.2 詳細開発履歴

### 📋 開発タイムライン（2025年9月18日）

#### v1.2.1.6: iPad最適化完了（基準確立）
**達成**: 70Hz検出実証とベンチマーク確立
```
noiseGate: 0.020 → 0.015 → 0.010 → 0.012 (段階的最適値発見)
実測結果: C2(65.5Hz), F1(43.7Hz), 音量22.8-25.0%
```

#### v1.2.1.7→v1.2.1.8: iPhone最適化
**戦略**: iPad成功パターンの積極的応用
```
noiseGate: 0.020 → 0.015 → 0.010 (強力NC活用で最激進設定)
volumeMultiplier: 9.5 → 11.5 (音量スケール改善)
```

#### v1.2.1.9→v1.2.2: PC最適化（複数回調整）
**アプローチ**: 環境ノイズ配慮の保守的最適化
```
段階的調整: 0.060 → 0.040 → 0.020 → 0.025 (現実的バランス発見)
volumeMultiplier: 3.0 → 4.5 → 7.0 → 8.0 → 7.5 (精密調整)
```

### 🎯 v1.2.2統合での学習成果

1. **デバイス特性重視**: 画一的設定から個別最適化への転換成功
2. **段階的調整の威力**: 大幅変更より小幅調整の効果を実証
3. **科学的根拠の重要性**: マイク特性分析による的確な方針決定
4. **知見の体系化**: serenaメモリーによる技術ノウハウ蓄積

---

## 🔥 過去バージョン履歴（参考）

### 📋 修正タイムライン（2025年9月14日）

#### v1.2.0 → v1.2.1: ゲイン検証エラー抑制
**問題**: ゲイン検証エラーがユーザーを混乱させる  
**解決**: エラー→警告に変更、機能継続を明示
```typescript
// Before: throw new PitchProError(...)
// After: console.warn('⚠️ [AudioManager] ゲイン検証失敗 (機能継続):')
```

#### v1.2.1 → v1.2.5: 動的SCALING_FACTOR実装
**問題**: 普通の声で100%になる（固定SCALING_FACTOR=400）  
**解決**: デバイス感度に基づく動的調整システム
```typescript
const currentSensitivity = this.audioManager.getSensitivity();
const SCALING_FACTOR = 400 / (platformSpecs.sensitivity * currentSensitivity);
```

**結果**: PC環境でSCALING_FACTOR=64（音量が低すぎる問題発生）

#### v1.2.5 → v1.2.6: PC sensitivity調整
**問題**: sensitivity=2.5で大きな声でも4.71%が限界  
**解決**: PC sensitivity 2.5 → 1.25 に調整  
**結果**: SCALING_FACTOR=256、普通の声で50%（高すぎる）

#### v1.2.6 → v1.2.7: 感度微調整
**問題**: すぐに100%到達の問題継続  
**解決**: PC sensitivity 1.25 → 1.6 に調整  
**結果**: SCALING_FACTOR=156、改善されたが依然として高い

#### v1.2.7 → v1.2.8: ノイズゲート問題発見・解決
**問題**: 音声がすべて「ノイズとしてブロック」される  
**解決**: NOISE_GATE_SCALING_FACTOR 1500 → 500 に調整
```typescript
// ノイズゲート閾値が13.13% → 1.5% に低下
const NOISE_GATE_THRESHOLD = this.config.minVolumeAbsolute * NOISE_GATE_SCALING_FACTOR;
```

#### v1.2.8 → v1.2.2: 最終調整（現行バージョン）
**問題**: 上昇速度をもう少し抑制したい
**解決**: PC sensitivity 1.6 → 1.8 に微調整
**結果**: SCALING_FACTOR=123.46、理想的なバランス達成

### 🎯 修正で学んだ教訓

1. **段階的調整の重要性**: 大幅な変更（2.5→1.25）より小幅調整（1.6→1.8）が効果的
2. **複合的な問題**: 音量調整とノイズゲートの相互作用を考慮する必要性
3. **実測値との乖離**: 理論値（1.5%）と実測値（4.38%）の差異への対応
4. **テストアプリ設定の影響**: `minVolumeAbsolute: 0.003` などの外部設定の重要性

### 📊 最終パフォーマンス比較

| バージョン | SCALING_FACTOR | ノイズゲート | 普通の声 | 評価 |
|-----------|--------------|------------|---------|------|
| v1.2.0 | 400 (固定) | 22.5% | 100% | ❌ 高すぎる |
| v1.2.5 | 64 (動的) | 1.5% | 4.71% | ❌ 低すぎる |
| v1.2.6 | 256 (動的) | 1.5% | 50% | ⚠️ やや高い |
| v1.2.7 | 156 (動的) | 1.5% | 30-40% | 🟡 改善 |
| v1.2.8 | 156 (動的) | 1.5% | ブロック解除 | ✅ 機能回復 |
| **v1.2.2** | **123** (動的) | **1.5%** | **15-25%** | **✅ 最適** |

---

## 次期課題（v1.3.0対応予定）

### ✅ v1.2.2で解決済み課題
- ✅ **全デバイス70Hz検出**: iPad/iPhone/PC環境での低周波数検出完全実現
- ✅ **モバイル環境音量調整**: iPhone/iPad最適化完了
- ✅ **デバイス固有最適化**: 科学的分析に基づく個別設定確立

### 🔴 新たな高優先度課題

#### 1. 統合テスト再有効化
**現在の状況**: 統合テストがCIで無効化されている
```typescript
// 現在の問題のあるコード
describe.skip('Integration Tests', () => {
```

**解決すべき課題**:
- AudioManager + PitchDetector連携テストの安定化
- 適切なモック戦略の実装
- CI環境での安定したテスト実行

#### 2. マジックナンバー定数化
**現在の問題**: パフォーマンス制御でハードコードされた値
```typescript
// 問題のあるコード
if (this.frameDrops > 5 && this.targetFPS > this.MIN_FPS) {
  this.targetFPS = Math.max(this.MIN_FPS, this.targetFPS - 5);
}
```

**解決策**:
```typescript
// 期待される解決後のコード
private static readonly FRAME_DROP_THRESHOLD = 5;
private static readonly FPS_ADJUSTMENT_STEP = 5;
private static readonly PERFORMANCE_CHECK_INTERVAL = 10;

if (this.frameDrops > this.FRAME_DROP_THRESHOLD && this.targetFPS > this.MIN_FPS) {
  this.targetFPS = Math.max(this.MIN_FPS, this.targetFPS - this.FPS_ADJUSTMENT_STEP);
}
```

#### 3. 環境別テスト閾値設定
**現在の問題**: CI環境でテスト失敗を避けるため許容値を緩和
```typescript
// 問題のあるコード
expect(Math.abs(cents)).toBeLessThan(50); // 20→50に緩和
```

**解決策**:
```typescript
// 期待される解決後のコード
interface TestConfig {
  pitchToleranceCents: number;
  performanceToleranceMs: number;
  noiseTestTolerance: number;
}

const TEST_CONFIG: TestConfig = {
  pitchToleranceCents: process.env.CI ? 30 : 20,
  performanceToleranceMs: process.env.CI ? 50 : 35,
  noiseTestTolerance: process.env.CI ? 40 : 25
};

expect(Math.abs(cents)).toBeLessThan(TEST_CONFIG.pitchToleranceCents);
```

### 🟡 中優先度課題

#### 4. パフォーマンス最適化
- `CircularBuffer.toArray()`の遅延評価実装
- `performance.now()`呼び出しのバッチ化
- 大規模データセット対応の最適化

#### 5. デバッグシステム強化
```typescript
// 実装予定のログシステム
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  constructor(private level: LogLevel) {}
  
  debug(message: string, context?: any) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }
}
```

#### 6. エラーコンテキスト拡充
- デバイス情報の詳細化
- パフォーマンス状態の診断情報追加
- ユーザーアクション履歴の記録

### 🟢 低優先度課題

#### 7. ドキュメント整備
- JSDoc APIドキュメント完備
- アーキテクチャ図の作成
- 使用例とベストプラクティス

#### 8. 監視システム連携
- パフォーマンス指標の外部出力
- リアルタイム監視ダッシュボード対応
- アラートシステム連携

## 📋 クイックリファレンス

### 音量調整設定値（即座に確認可能）

```typescript
// AudioDetectionComponent設定値（v1.2.2確定）
const deviceSettingsMap = {
  PC: {
    volumeMultiplier: 3.0,      // ✅ 完了
    sensitivityMultiplier: 2.5,
  },
  iPhone: {
    volumeMultiplier: 7.5,      // ✅ 完了
    sensitivityMultiplier: 3.5,
  },
  iPad: {
    volumeMultiplier: 20.0,     // ✅ 完了
    sensitivityMultiplier: 5.0,
  }
};
```

### 正しい停止・リセット処理

```typescript
// ❌ 間違い
audioDetector.stopDetection();  // UIがリセットされない！

// ✅ 正しい実装1
audioDetector.stopDetection();
audioDetector.resetDisplayElements();

// ✅ 正しい実装2（推奨）
micController.reset();  // 停止 + UIリセット + 状態クリア
```

### 4ボタンUI設計パターン

```typescript
// v1.1.8製品レベル設計
initialize() // 初期化
  ↓
start()     // 検出開始
  ↓
reset()     // 完全リセット（推奨）
  ↓
destroy()   // リソース破棄
```

## Claude Code使用時の推奨事項

### 開発フロー
1. 課題確認: `CODE_REVIEW_V1.1.0.md`で優先度確認
2. 実装前: 既存テストの実行 (`npm test`)
3. 実装: TypeScript strict mode準拠
4. テスト: デバイス固有テスト追加
5. 検証: 実機テスト（PC/iPhone/iPad）

### テスト戦略
```bash
# 全テスト実行
npm test

# 個別テスト実行
npm test test/PitchDetector.test.ts
npm test test/performance.test.ts
npm test test/device-performance.test.ts

# CI対応テスト
npm test -- --run
```

### ビルドとデプロイ
```bash
# 型チェック
npm run typecheck

# ビルド
npm run build

# デプロイ前確認
npm run build && npm test -- --run
```

## リリース後検証チェックリスト

**必須**: 各リリース後に必ず実行し、ファイルの取得可能性と完全性を確認する

### 1. ファイル取得可能性テスト

#### GitHub Raw URL検証
```bash
# v1.1.5の例
curl -I https://raw.githubusercontent.com/username/pitchpro-audio-processing/v1.1.5/dist/index.esm.js
curl -I https://raw.githubusercontent.com/username/pitchpro-audio-processing/v1.1.5/dist/index.js
curl -I https://raw.githubusercontent.com/username/pitchpro-audio-processing/v1.1.5/dist/pitchpro.umd.js
curl -I https://raw.githubusercontent.com/username/pitchpro-audio-processing/v1.1.5/dist/index.d.ts

# 期待結果: HTTP/2 200 OK
```

#### パッケージダウンロード検証
```bash
# ZIP形式
curl -L -o test-release.zip https://github.com/username/pitchpro-audio-processing/archive/refs/tags/v1.1.5.zip
unzip -t test-release.zip

# TAR.GZ形式
curl -L -o test-release.tar.gz https://github.com/username/pitchpro-audio-processing/archive/refs/tags/v1.1.5.tar.gz
tar -tzf test-release.tar.gz | head -20
```

#### GitHub Pages URL検証
```bash
# デモページの確認
curl -I https://username.github.io/pitchpro-audio-processing/
curl -I https://username.github.io/pitchpro-audio-processing/updateSelectors-demo.html
```

### 2. ファイル完全性チェック

#### ハッシュ値検証
```bash
# リリース時のハッシュ値を記録・比較
sha256sum dist/index.esm.js dist/index.js dist/pitchpro.umd.js dist/index.d.ts > release-checksums.txt

# ダウンロード後の検証
curl -s https://raw.githubusercontent.com/username/pitchpro-audio-processing/v1.1.5/dist/index.esm.js | sha256sum
```

#### ファイルサイズ検証
```bash
# 期待サイズ範囲の確認
ls -la dist/
# index.esm.js: 50KB-150KB想定
# index.js: 50KB-150KB想定  
# pitchpro.umd.js: 60KB-200KB想定
# index.d.ts: 5KB-20KB想定
```

#### 内容検証
```bash
# ファイル先頭と末尾の確認（破損チェック）
head -5 dist/index.esm.js  # ESMエクスポートの確認
tail -5 dist/index.esm.js  # 完結性の確認

# UMDビルドの構造確認
grep -o "typeof exports" dist/pitchpro.umd.js | wc -l  # UMD構造の確認
```

### 3. 機能テスト

#### インポートテスト
```javascript
// ESM
import PitchDetector from 'https://raw.githubusercontent.com/username/pitchpro-audio-processing/v1.1.5/dist/index.esm.js';
console.log(typeof PitchDetector); // 'function'

// UMD (HTML)
<script src="https://raw.githubusercontent.com/username/pitchpro-audio-processing/v1.1.5/dist/pitchpro.umd.js"></script>
<script>console.log(typeof window.PitchDetector);</script>
```

#### 基本機能テスト
```javascript
// PitchDetectorの基本動作確認
const detector = new PitchDetector();
console.log(detector.constructor.name); // 'PitchDetector'
console.log(typeof detector.detect); // 'function'
```

### 4. ドキュメント確認

- [ ] README.mdのインストール手順が最新版に対応
- [ ] CHANGELOG.mdに新バージョンが記載
- [ ] package.jsonのバージョンが正しい
- [ ] GitHubリリースページの作成とアセット添付

### 5. 問題発生時の対応

#### 404エラーの場合
1. GitHubのファイル履歴を確認
2. .gitignoreの設定確認
3. `git add -f dist/` でファイルを強制追加
4. 再プッシュとタグ作成

#### ファイル破損の場合
1. ローカルビルドの再実行
2. `npm run build` の出力確認
3. 破損ファイルの削除と再作成
4. ハッシュ値の再計算と記録

#### CI/CD失敗の場合
1. GitHub Actionsログの確認
2. ワークフロー設定の検証
3. 必要に応じて手動デプロイ実行

### 6. チェックリスト記録

```bash
# 検証ログの作成
echo "=== PitchPro v1.1.5 リリース検証 ===" > release-verification.log
echo "実行日時: $(date)" >> release-verification.log
echo "実行者: [担当者名]" >> release-verification.log
echo "" >> release-verification.log

# 各項目の結果を記録
echo "✅ GitHub Raw URL: OK" >> release-verification.log
echo "✅ パッケージダウンロード: OK" >> release-verification.log
echo "✅ ハッシュ値検証: OK" >> release-verification.log
echo "✅ 機能テスト: OK" >> release-verification.log
```

**重要**: このチェックリストは必須であり、すべての項目をクリアしたことを確認してからリリース完了とする。

## 🎯 製品レベル実装原則（v1.1.8確立）

### 統合管理システム（MicrophoneController中心）
- **必須**: MicrophoneControllerを中心とした統合管理
- **推奨**: 4ボタンUI（initialize→start→reset→destroy）の標準採用
- **重要**: reset()とstart()の対称的操作設計を維持
- **禁止**: 個別コンポーネントの直接操作（統合管理を経由）

### メモリ効率（製品レベル基準）
- **必須**: CircularBufferを使用してメモリリークを防止
- **推奨**: 大きな配列操作は遅延評価を検討
- **重要**: WeakMapを適切に使用してガベージコレクションを促進
- **監視**: パフォーマンス指標の継続的な監視

### UI管理（クロスモード干渉完全防止）
- **必須**: 要素一致検証システムの使用
- **自動**: noteSelector未指定時の自動クリア
- **包括**: volume bar, volume text, frequency, note全要素での保護
- **即時**: forceUIUpdate()による確実なDOM更新

### エラーハンドリング（堅牢性確保）
- **必須**: 構造化エラー（PitchProError系）を使用
- **分類**: 回復可能エラーと致命的エラーを適切に分類
- **診断**: エラーコンテキストに診断情報を含める
- **監視**: リカバリー試行の追跡と制限

### テスト戦略（製品品質保証）
- **必須**: デバイス固有テストを追加
- **考慮**: CI環境と開発環境の差を考慮した閾値設定
- **統合**: 適切なモック戦略で統合テスト実装
- **継続**: パフォーマンステストとリグレッションテスト

## 🚀 次のマイルストーン

**v1.2.0 リリース予定**: 2025年10月  
**開発方針変更**: 製品レベル到達により機能追加よりも**品質洗練**重視

**主要目標**:
1. **軽微な洗練**: 外部評価で提案された改善点の実装
2. **テスト安定化**: 統合テスト再有効化とCI環境最適化  
3. **保守性向上**: マジックナンバー定数化と環境別設定
4. **監視強化**: パフォーマンス指標とデバッグシステムの拡充

**🎉 v1.1.8達成状況**: 
- ✅ **外部評価**: 製品レベル到達認定
- ✅ **統合管理**: MicrophoneController中心設計完成
- ✅ **UI簡素化**: 7→4ボタン（42%削減）の直感的操作
- ✅ **干渉防止**: 完全なクロスモード保護システム

---

**🎯 開発の指針**: このガイドに基づいて、製品レベル品質を維持しながら継続的な改善を目指してください。新機能追加時は統合管理システムとの一貫性を最優先に設計してください。