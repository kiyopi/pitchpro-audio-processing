# PitchPro Audio Processing - 全プロパティ一覧

## 1. ピッチ検出関連

### PitchDetectionResult (src/types/pitch.types.ts)
| プロパティ | 型 | 説明 |
|----------|---|------|
| pitch | number | 検出された周波数(Hz) |
| clarity | number | ピッチの明瞭度(0-1) |
| volume | number | 音量レベル(0-1) |
| timestamp | number | タイムスタンプ |
| note | NoteInfo (optional) | 音符情報 |

### PitchDetectionResult (src/types/index.ts - 別定義)
| プロパティ | 型 | 説明 |
|----------|---|------|
| frequency | number | 検出された周波数(Hz) |
| note | string | 音名(C4など) |
| octave | number (optional) | オクターブ番号 |
| clarity | number | ピッチの明瞭度 |
| volume | number | 音量レベル |
| rawVolume | number (optional) | 生の音量値 |
| cents | number (optional) | セント値 |
| timestamp | number (optional) | タイムスタンプ |

### NoteInfo
| プロパティ | 型 | 説明 |
|----------|---|------|
| name | string | 音名(C, D, E等) |
| octave | number | オクターブ番号 |
| frequency | number | 基準周波数 |
| cents | number | セント値(音程のずれ) |

## 2. 音声設定

### AudioConfig
| プロパティ | 型 | 説明 |
|----------|---|------|
| sampleRate | number | サンプルレート |
| bufferSize | number | バッファサイズ |
| fftSize | number | FFTサイズ |
| smoothingTimeConstant | number | スムージング定数 |
| minDecibels | number | 最小デシベル |
| maxDecibels | number | 最大デシベル |

### AudioManagerConfig
| プロパティ | 型 | 説明 |
|----------|---|------|
| sampleRate | number (optional) | サンプルレート |
| channelCount | number (optional) | チャンネル数 |
| echoCancellation | boolean (optional) | エコーキャンセル |
| noiseSuppression | boolean (optional) | ノイズ抑制 |
| autoGainControl | boolean (optional) | 自動ゲイン制御 |
| latency | number (optional) | レイテンシ |

### PitchDetectorConfig
| プロパティ | 型 | 説明 |
|----------|---|------|
| fftSize | number (optional) | FFTサイズ |
| smoothing | number (optional) | スムージング係数 |
| clarityThreshold | number (optional) | 明瞭度閾値 |
| minVolumeAbsolute | number (optional) | 最小絶対音量 |
| noiseGate | number (optional) | ノイズゲート閾値 |
| deviceOptimization | boolean (optional) | デバイス最適化 |
| silenceDetection | SilenceDetectionConfig (optional) | 消音検出設定 |

### PitchDetectorOptions
| プロパティ | 型 | 説明 |
|----------|---|------|
| targetFPS | number (optional) | 目標FPS |
| enableSmoothing | boolean (optional) | スムージング有効化 |
| smoothingFactor | number (optional) | スムージング係数 |
| pitchRange | PitchRange (optional) | ピッチ範囲 |
| deviceOverrides | Partial<DeviceSettings> (optional) | デバイス設定上書き |

## 3. デバイス関連

### DeviceSettings
| プロパティ | 型 | 説明 |
|----------|---|------|
| sensitivity | number | 感度 |
| noiseGate | number | ノイズゲート |
| clarityThreshold | number | 明瞭度閾値 |
| minVolume | number | 最小音量 |
| bufferMultiplier | number | バッファ倍率 |

### DeviceSpecs
| プロパティ | 型 | 説明 |
|----------|---|------|
| deviceType | 'iPhone' \| 'iPad' \| 'PC' | デバイスタイプ |
| isIOS | boolean | iOS判定 |
| sensitivity | number | 感度設定 |
| noiseGate | number | ノイズゲート値 |
| divisor | number | 除数 |
| gainCompensation | number | ゲイン補正 |
| noiseThreshold | number | ノイズ閾値 |
| smoothingFactor | number | スムージング係数 |

### DeviceInfo
| プロパティ | 型 | 説明 |
|----------|---|------|
| type | 'iPhone' \| 'iPad' \| 'Android' \| 'Desktop' \| 'Unknown' | デバイスタイプ |
| userAgent | string | ユーザーエージェント |
| hasTouch | boolean | タッチ対応 |
| screenSize | { width: number; height: number } | 画面サイズ |

## 4. UI/コンポーネント設定

### AudioDetectionConfig
| プロパティ | 型 | 説明 |
|----------|---|------|
| volumeBarSelector | string (optional) | 音量バーセレクター |
| volumeTextSelector | string (optional) | 音量テキストセレクター |
| frequencySelector | string (optional) | 周波数表示セレクター |
| noteSelector | string (optional) | 音符表示セレクター |
| clarityThreshold | number (optional) | 明瞭度閾値 |
| minVolumeAbsolute | number (optional) | 最小絶対音量 |
| fftSize | number (optional) | FFTサイズ |
| smoothing | number (optional) | スムージング |
| deviceOptimization | boolean (optional) | デバイス最適化 |
| uiUpdateInterval | number (optional) | UI更新間隔 |
| autoUpdateUI | boolean (optional) | 自動UI更新 |
| debug | boolean (optional) | デバッグモード |
| logPrefix | string (optional) | ログプレフィックス |

### AudioDetectionCallbacks
| プロパティ | 型 | 説明 |
|----------|---|------|
| onPitchUpdate | function (optional) | ピッチ更新コールバック |
| onVolumeUpdate | function (optional) | 音量更新コールバック |
| onStateChange | function (optional) | 状態変更コールバック |
| onError | function (optional) | エラーコールバック |
| onDeviceDetected | function (optional) | デバイス検出コールバック |

## 5. 高度な分析

### HarmonicAnalysis
| プロパティ | 型 | 説明 |
|----------|---|------|
| fundamentalFrequency | number | 基本周波数 |
| harmonics | Harmonic[] | 倍音配列 |
| inharmonicity | number | 非調和性 |
| spectralCentroid | number | スペクトル重心 |

### Harmonic
| プロパティ | 型 | 説明 |
|----------|---|------|
| frequency | number | 周波数 |
| amplitude | number | 振幅 |
| phase | number | 位相 |
| order | number | 次数 |

### SpectralFeatures
| プロパティ | 型 | 説明 |
|----------|---|------|
| centroid | number | 重心 |
| spread | number | 広がり |
| flux | number | フラックス |
| rolloff | number | ロールオフ |
| flatness | number | 平坦性 |
| entropy | number | エントロピー |

### HarmonicCorrectionResult
| プロパティ | 型 | 説明 |
|----------|---|------|
| correctedFreq | number | 補正後周波数 |
| confidence | number | 信頼度 |
| correctionApplied | boolean | 補正適用有無 |

## 6. 音楽理論

### MusicalNote
| プロパティ | 型 | 説明 |
|----------|---|------|
| name | string | 音名 |
| octave | number | オクターブ |
| midi | number | MIDIノート番号 |
| frequency | number | 周波数 |

### MusicalInterval
| プロパティ | 型 | 説明 |
|----------|---|------|
| name | string | インターバル名 |
| semitones | number | 半音数 |
| cents | number | セント値 |
| ratio | number | 周波数比 |

### AccuracyResult
| プロパティ | 型 | 説明 |
|----------|---|------|
| accuracy | AccuracyLevel | 精度レベル |
| centsOff | number | セントずれ |
| score | number | スコア |

## 7. 音声分析

### VoiceAnalysis
| プロパティ | 型 | 説明 |
|----------|---|------|
| quality | VoiceQuality | 音質 |
| stability | number | 安定性 |
| recommendations | string[] | 推奨事項 |

## 8. フィルター設定

### NoiseFilterConfig
| プロパティ | 型 | 説明 |
|----------|---|------|
| highpassFreq | number (optional) | ハイパス周波数 |
| lowpassFreq | number (optional) | ローパス周波数 |
| notchFreq | number (optional) | ノッチ周波数 |
| highpassQ | number (optional) | ハイパスQ値 |
| lowpassQ | number (optional) | ローパスQ値 |
| notchQ | number (optional) | ノッチQ値 |
| useFilters | boolean (optional) | フィルター使用 |

### FilterConfig
| プロパティ | 型 | 説明 |
|----------|---|------|
| type | 'lowpass' \| 'highpass' \| 'bandpass' \| 'notch' | フィルタータイプ |
| frequency | number | 周波数 |
| Q | number (optional) | Q値 |
| gain | number (optional) | ゲイン |

## 9. 消音検出

### SilenceDetectionConfig
| プロパティ | 型 | 説明 |
|----------|---|------|
| enabled | boolean (optional) | 有効化 |
| warningThreshold | number (optional) | 警告閾値(ms) |
| timeoutThreshold | number (optional) | タイムアウト閾値(ms) |
| minVolumeThreshold | number (optional) | 最小音量閾値 |
| onSilenceWarning | function (optional) | 警告コールバック |
| onSilenceTimeout | function (optional) | タイムアウトコールバック |
| onSilenceRecovered | function (optional) | 復帰コールバック |

## 10. パフォーマンス

### PerformanceMetrics
| プロパティ | 型 | 説明 |
|----------|---|------|
| fps | number | フレームレート |
| latency | number | レイテンシ |
| cpuUsage | number | CPU使用率 |
| memoryUsage | number | メモリ使用量 |
| droppedFrames | number | ドロップフレーム数 |

### PitchRange
| プロパティ | 型 | 説明 |
|----------|---|------|
| min | number | 最小周波数(Hz) |
| max | number | 最大周波数(Hz) |

## 11. 通知

### NotificationConfig
| プロパティ | 型 | 説明 |
|----------|---|------|
| type | 'error' \| 'warning' \| 'success' \| 'info' | 通知タイプ |
| title | string | タイトル |
| message | string | メッセージ |
| details | string[] (optional) | 詳細 |
| solution | string (optional) | 解決策 |
| autoHide | boolean (optional) | 自動非表示 |
| duration | number (optional) | 表示時間 |
| priority | 'low' \| 'medium' \| 'high' (optional) | 優先度 |

## 12. リソース管理

### MediaStreamResources
| プロパティ | 型 | 説明 |
|----------|---|------|
| audioContext | AudioContext | オーディオコンテキスト |
| mediaStream | MediaStream | メディアストリーム |
| sourceNode | MediaStreamAudioSourceNode | ソースノード |

### HealthStatus
| プロパティ | 型 | 説明 |
|----------|---|------|
| mediaStreamActive | boolean | ストリーム有効 |
| audioContextState | string | コンテキスト状態 |
| trackStates | TrackState[] | トラック状態配列 |
| healthy | boolean | 健全性 |
| refCount | number (optional) | 参照カウント |

### TrackState
| プロパティ | 型 | 説明 |
|----------|---|------|
| kind | string | トラック種別 |
| enabled | boolean | 有効化状態 |
| readyState | MediaStreamTrackState | 準備状態 |
| muted | boolean | ミュート状態 |

## 13. バッファ

### AudioBuffer (カスタム定義)
| プロパティ | 型 | 説明 |
|----------|---|------|
| data | Float32Array | 音声データ |
| sampleRate | number | サンプルレート |
| timestamp | number | タイムスタンプ |
| channelCount | number | チャンネル数 |

## 14. キャリブレーション

### CalibrationData
| プロパティ | 型 | 説明 |
|----------|---|------|
| referenceFrequency | number | 基準周波数 |
| calibrationOffset | number | キャリブレーションオフセット |
| temperatureCompensation | number | 温度補正 |
| timestamp | number | タイムスタンプ |

## 15. イベント型

### MicrophoneControllerEvents
| イベント名 | データ型 | 説明 |
|----------|---------|------|
| pitchpro:microphoneGranted | { stream: MediaStream } | マイク許可 |
| pitchpro:microphoneDenied | { error: Error } | マイク拒否 |
| pitchpro:microphoneStopped | なし | マイク停止 |
| pitchpro:microphoneMuted | { timestamp: number; controllerState: string } | ミュート |
| pitchpro:microphoneUnmuted | { timestamp: number; controllerState: string } | ミュート解除 |
| pitchpro:sensitivityChanged | { sensitivity: number } | 感度変更 |
| pitchpro:noiseGateChanged | { threshold: number } | ノイズゲート変更 |
| pitchpro:deviceDetected | { specs: DeviceSpecs } | デバイス検出 |

### LifecycleEvents
| イベント名 | データ型 | 説明 |
|----------|---------|------|
| pitchpro:lifecycle:trackEnded | { track: MediaStreamTrack } | トラック終了 |
| pitchpro:lifecycle:trackMuted | { track: MediaStreamTrack } | トラックミュート |
| pitchpro:lifecycle:trackUnmuted | { track: MediaStreamTrack } | トラックミュート解除 |
| pitchpro:lifecycle:autoRecoverySuccess | なし | 自動復旧成功 |
| pitchpro:lifecycle:autoRecoveryFailed | { error: Error } | 自動復旧失敗 |
| pitchpro:lifecycle:maxRecoveryAttemptsReached | { attempts: number; lastHealthStatus: any } | 最大復旧試行 |
| pitchpro:lifecycle:monitoringRestarted | { reason: string; refCount: number } | 監視再開 |

## 16. 列挙型

### DetectorState
- IDLE = 'idle'
- INITIALIZING = 'initializing'
- RUNNING = 'running'
- PAUSED = 'paused'
- ERROR = 'error'
- STOPPED = 'stopped'

### VoiceQuality
- EXCELLENT = 'excellent'
- GOOD = 'good'
- FAIR = 'fair'
- POOR = 'poor'

### AccuracyLevel
- PERFECT = 'perfect'
- EXCELLENT = 'excellent'
- GOOD = 'good'
- FAIR = 'fair'
- POOR = 'poor'

## 17. コールバック型

### 型定義
- **PitchCallback**: (result: PitchDetectionResult) => void
- **ErrorCallback**: (error: Error) => void
- **StateChangeCallback**: (state: string | DetectorState) => void