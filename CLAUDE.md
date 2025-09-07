# PitchPro Audio Processing - Claude Code ガイド

## プロジェクト概要
PitchPro Audio Processingは、リアルタイム音響処理とピッチ検出に特化したTypeScriptライブラリです。McLeod Pitch Methodを使用し、iPhone/Android/PC向けに最適化されています。

## 現在のバージョン
**v1.1.0** - 2025年9月7日リリース

## 主要コンポーネント

### コアシステム
- `PitchDetector`: メインのピッチ検出エンジン
- `AudioManager`: AudioContext管理とリソース制御
- `DeviceDetection`: デバイス固有の最適化設定

### ユーティリティ
- `AdaptiveFrameRateLimiter`: 適応フレームレート制御
- `PerformanceMonitor`: CircularBufferによるメトリクス監視
- 構造化エラーハンドリングシステム

## 改善完了項目（v1.1.0）

### ✅ メモリ最適化
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

## 次期課題（v1.2.0対応予定）

### 🔴 高優先度課題

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

**期待される成果物**:
```typescript
// 期待される解決後のコード
describe('Integration Tests', () => {
  // 適切なモック実装
  beforeEach(() => {
    // 安定したモック設定
  });
});
```

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

## 重要な実装原則

### メモリ効率
- 必ずCircularBufferを使用してメモリリークを防止
- 大きな配列操作は遅延評価を検討
- WeakMapを適切に使用してガベージコレクションを促進

### パフォーマンス
- フレームレート制御は必須（30-60FPS範囲）
- デバイス固有の最適化を忘れずに実装
- パフォーマンス指標の継続的な監視

### エラーハンドリング
- 必ず構造化エラー（PitchProError系）を使用
- 回復可能エラーと致命的エラーを適切に分類
- エラーコンテキストに診断情報を含める

### テスト
- デバイス固有テストを必ず追加
- CI環境と開発環境の差を考慮
- 統合テストは適切なモック戦略で実装

## 次のマイルストーン

**v1.2.0 リリース予定**: 2025年10月  
**主要目標**: 高優先度課題の解決とシステム安定性向上

このガイドに基づいて、継続的な改善と高品質なコードの維持を目指してください。