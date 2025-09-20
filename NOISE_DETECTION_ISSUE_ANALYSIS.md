# ノイズ検出問題の調査結果と解決策

## 📋 問題の概要

**発生日**: 2025年9月20日
**バージョン**: v1.2.2
**現象**: 音程が検出されていない（frequency: 0, note: "--"）にも関わらず、音量が20%程度表示される異常

## 🔍 調査プロセス

### 1. 当初の仮説（不正確）
- **仮説**: PC環境のnoiseGate設定（2.5%）が低すぎる
- **検証結果**: 設定値自体は適切

### 2. リファクタリング影響の検証
- **調査内容**: v1.2.1→v1.2.2のリファクタリング影響
- **発見**: アーキテクチャ変更により、APIの使用方法が複雑化

### 3. 初期化タイミング問題の検証
- **調査内容**: 非同期初期化とデバイス設定読み込みタイミング
- **発見**: volume-bar-test.htmlでは正しい順序で実装済み

### 4. 真の根本原因の発見
- **最終調査**: 設定のフォールバックと上書きの競合
- **根本原因**: デフォルト値（0.020 = 2%）が意図せず使用される

## 🚨 根本原因の詳細

### 問題の連鎖

```javascript
// 1. volume-bar-test.html: minVolumeAbsolute未指定
audioDetection = new PitchProLib.AudioDetectionComponent({
    volumeBarSelector: '#volumeBar',
    // minVolumeAbsolute: 未指定 ❌
});

// 2. AudioDetectionComponent constructor: デフォルト値設定
this.config = {
    minVolumeAbsolute: config.minVolumeAbsolute ?? 0.020, // ❌ 2%使用
};

// 3. initialize()メソッド: deviceSpecs null時にデフォルト値使用
const pitchDetectorConfig = {
    minVolumeAbsolute: this.deviceSpecs?.noiseGate ?? this.config.minVolumeAbsolute, // ❌ 0.020使用
};
```

### 結果
- **意図された設定**: PC noiseGate 0.025 (2.5%)
- **実際の設定**: minVolumeAbsolute 0.020 (2.0%)
- **影響**: 環境ノイズ（5.5%程度）がノイズゲートを素通り

## 💡 解決策

### 修正対象ファイル

#### 1. `/src/components/AudioDetectionComponent.ts`

**修正箇所1: constructor（410行目付近）**
```typescript
// 修正前
this.config = {
  // ...
  minVolumeAbsolute: config.minVolumeAbsolute ?? 0.020,
  // ...
};

// 修正後
this.config = {
  // ...
  minVolumeAbsolute: config.minVolumeAbsolute, // undefinedを許可
  // ...
};
```

**修正箇所2: initialize()メソッド（475行目付近）**
```typescript
// 修正前
const pitchDetectorConfig = {
  // ...
  minVolumeAbsolute: this.deviceSpecs?.noiseGate ?? this.config.minVolumeAbsolute,
  // ...
};

// 修正後
// DeviceDetectionからPC向けのデフォルト値を取得
const pcDefaults = DeviceDetection.getDeviceOptimizations('PC', false);

const pitchDetectorConfig = {
  // ...
  minVolumeAbsolute: this.deviceSpecs?.noiseGate ?? pcDefaults.noiseGate,
  // ...
};
```

#### 2. `/volume-bar-test.html`

**修正箇所: コールバック設定（519行目）**
```javascript
// 修正前
audioDetection.config.onPitchUpdate = updateAdditionalData;

// 修正後
audioDetection.setCallbacks({
    onPitchUpdate: updateAdditionalData
});
```

## 🎯 修正による効果

### 技術的効果
- ✅ **ノイズ問題解決**: 適切な2.5%ノイズゲートが確実に適用
- ✅ **設定一貫性**: DeviceDetection.tsが唯一の情報源に
- ✅ **堅牢性向上**: 初期化タイミングに依存しない安定動作

### 保持される最適化
- ✅ **音量調整**: BASE_SCALING_FACTOR=50, volumeMultiplier等完全保持
- ✅ **70Hz検出**: 全デバイス対応の最適化維持
- ✅ **パフォーマンス**: リファクタリングの性能向上維持

## 📊 学習ポイント

### 設計原則
1. **Single Source of Truth**: DeviceDetection.tsの完全信頼
2. **防御的プログラミング**: デフォルト値の適切な管理
3. **API一貫性**: シンプルな使用方法の維持

### 開発プロセス
1. **段階的調査**: 仮説→検証→修正のサイクル
2. **ログ分析**: 実際の動作データによる検証
3. **影響範囲評価**: 最小限の変更で最大効果

## 🔄 今後の予防策

### コード品質
- constructorでの安易なデフォルト値設定を避ける
- 設定の優先順位を明確に文書化
- 初期化プロセスの堅牢性テスト

### テスト戦略
- デバイス固有設定の適用確認テスト
- 初期化タイミング異常ケースのテスト
- 実環境でのノイズレベル検証

---

**作成日**: 2025年9月20日
**作成者**: Claude Code調査チーム
**バージョン**: v1.2.2対応