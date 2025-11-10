# Issue: result.noteにオクターブ番号が含まれない問題

**報告日**: 2025-11-10
**優先度**: Medium
**影響範囲**: PitchDetectionResult型のnoteプロパティ
**バージョン**: v1.3.3以前

---

## 📋 問題の概要

`PitchDetector`が返す`result.note`プロパティが音名のみ（例: `"E"`, `"C#"`）を返し、オクターブ番号が含まれていない。これにより、アプリケーション側でオクターブ番号を別途計算する必要があり、以下の問題が発生していた：

1. **表示の不完全性**: 音域範囲表示が `"E2 - E"` のように不完全になる
2. **コードの重複**: アプリケーション側で独自の`frequencyToNote()`実装が必要
3. **API不一致**: `FrequencyUtils.frequencyToNote()`は完全な音名を返すのに、`result.note`は音名のみ

---

## 🔍 根本原因

### **現在の実装（v1.3.3）**

`/src/core/PitchDetector.ts` の `frequencyToNoteAndOctave()` メソッド:

```typescript
// 685行目: noteプロパティに音名のみを設定
const noteInfo = this.frequencyToNoteAndOctave(this.currentFrequency);
this.detectedNote = noteInfo.note;  // ← "E", "C#" のみ
this.detectedOctave = noteInfo.octave;

// 829-840行目: frequencyToNoteAndOctave実装
private frequencyToNoteAndOctave(frequency: number): { note: string; octave: number | null } {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // ...
  return { note: noteNames[noteIndex], octave };  // ← noteはオクターブ番号なし
}
```

### **期待される動作**

`result.note`は`"E4"`, `"C#2"`のように**音名+オクターブ番号**を含むべき

---

## ✅ 解決策

### **推奨アプローチ: FrequencyUtils.frequencyToNote()の活用**

既存の`FrequencyUtils`クラスを活用することで：
- ✅ コードの重複を排除
- ✅ 一貫性のあるAPI設計
- ✅ 既存の型定義（`MusicalNote`）を活用

### **修正内容**

#### **1. PitchDetector.tsの修正**

```typescript
// FrequencyUtilsをインポート
import { FrequencyUtils } from '../utils/FrequencyUtils';

// 修正前（684-686行目）
const noteInfo = this.frequencyToNoteAndOctave(this.currentFrequency);
this.detectedNote = noteInfo.note;
this.detectedOctave = noteInfo.octave;

// 修正後
const noteInfo = FrequencyUtils.frequencyToNote(this.currentFrequency);
this.detectedNote = noteInfo.name;  // "E4", "C#2" のように完全な音名
this.detectedOctave = noteInfo.octave;
```

#### **2. 不要なメソッドの削除（オプション）**

`frequencyToNoteAndOctave()`メソッドは`FrequencyUtils.frequencyToNote()`で代替可能なため削除可能：

```typescript
// 削除対象: 829-840行目
// private frequencyToNoteAndOctave() { ... }
```

---

## 🧪 テストケース

### **修正前の動作**

```typescript
const pitchDetector = new PitchDetector(audioManager);
pitchDetector.setCallbacks({
  onPitchUpdate: (result) => {
    console.log(result.note);  // "E" ← オクターブ番号なし
    console.log(result.octave); // 4
  }
});
```

### **修正後の期待動作**

```typescript
const pitchDetector = new PitchDetector(audioManager);
pitchDetector.setCallbacks({
  onPitchUpdate: (result) => {
    console.log(result.note);  // "E4" ← オクターブ番号あり
    console.log(result.octave); // 4
  }
});
```

### **音域範囲表示の改善**

```javascript
// 修正前（アプリ側）
const range = `${lowNote} - ${highNote}`;  // "E2 - E" ← 不完全

// 修正後（アプリ側）
const range = `${result.lowNote} - ${result.highNote}`;  // "E2 - E4" ← 完全
```

---

## 📊 影響範囲

### **PitchPro側**
- ✅ `PitchDetector.ts`: 3箇所の修正（684-686行目、829-840行目削除）
- ✅ 後方互換性: `result.octave`プロパティは引き続き提供されるため互換性維持
- ✅ 型定義: `PitchDetectionResult`型は変更不要

### **アプリケーション側**
- ✅ **メリット**: `MusicTheory.frequencyToNote()`フォールバック処理が不要に
- ✅ **簡略化**: 音域表示がシンプルになる
- ✅ **一貫性**: PitchProの他のAPIと一貫性が向上

---

## 📝 リリースノート（v1.3.4）

### **修正内容**

**Bug Fix**: `result.note`にオクターブ番号を含めるように修正

- **修正**: `PitchDetector`が返す`result.note`が音名のみ（例: `"E"`）を返していた問題を修正
- **改善**: `FrequencyUtils.frequencyToNote()`を活用し、完全な音名（例: `"E4"`）を返すように変更
- **削除**: 重複していた`frequencyToNoteAndOctave()`メソッドを削除
- **影響**: アプリケーション側でのフォールバック処理が不要になり、コードがシンプルに

### **アップグレードガイド**

**既存のアプリケーション**:
- `result.note`が完全な音名を返すようになりました
- `result.octave`プロパティは引き続き利用可能です
- フォールバック処理（例: `result.note || MusicTheory.frequencyToNote(...)`）は削除可能です

**例**:
```typescript
// 修正前
const note = result.note && /\d/.test(result.note)
    ? result.note
    : MusicTheory.frequencyToNote(result.frequency);

// 修正後（シンプル化）
const note = result.note;  // 常に "E4" のような完全な音名
```

---

## 🎯 期待される効果

1. **API一貫性の向上**: `FrequencyUtils.frequencyToNote()`と同じ形式
2. **コード簡略化**: アプリケーション側のフォールバック処理が不要
3. **保守性向上**: コードの重複を削減
4. **ユーザー体験改善**: 音域表示が常に正確に

---

## ✅ チェックリスト

### **実装**
- [ ] `PitchDetector.ts`の修正（FrequencyUtils使用）
- [ ] `frequencyToNoteAndOctave()`メソッドの削除
- [ ] インポート文の追加

### **テスト**
- [ ] 単体テスト: `result.note`が完全な音名を返すことを確認
- [ ] 統合テスト: 音域範囲表示が正しく動作することを確認
- [ ] リグレッションテスト: 既存の機能に影響がないことを確認

### **ドキュメント**
- [ ] `CHANGELOG.md`の更新
- [ ] `README.md`の例文更新（必要に応じて）
- [ ] `package.json`のバージョン更新（1.3.3 → 1.3.4）

### **リリース**
- [ ] ビルド実行（`npm run build`）
- [ ] テスト実行（`npm test`）
- [ ] dist/ファイル確認
- [ ] GitHubリリース作成
- [ ] NPMパッケージ公開

---

**作成者**: Claude Code
**レビュー**: 必要
**承認**: 必要
