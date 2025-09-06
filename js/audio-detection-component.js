/**
 * AudioDetectionComponent v2.0.0
 * PitchProライブラリをラップした統一音声検出コンポーネント
 * 自動UI更新機能とデバイス最適化を提供
 */

class AudioDetectionComponent {
    constructor(options = {}) {
        // UI要素のセレクター
        this.selectors = {
            frequency: options.frequencySelector || null,
            note: options.noteSelector || null,
            octave: options.octaveSelector || null,
            clarity: options.claritySelector || null,
            volumeBar: options.volumeBarSelector || null,
            volumePercent: options.volumePercentSelector || null,
            rawVolume: options.rawVolumeSelector || null,
            deviceType: options.deviceTypeSelector || null
        };
        
        // 音響設定
        this.config = {
            fftSize: options.fftSize || 4096,
            smoothing: options.smoothing || 0.1,
            clarityThreshold: options.clarityThreshold || 0.6,
            volumeScale: options.volumeScale || 1.0,
            enableAutoUpdate: options.enableAutoUpdate !== false // デフォルトtrue
        };
        
        // コールバック
        this.callbacks = {
            onPitchUpdate: options.onPitchUpdate || null,
            onError: options.onError || null,
            onDeviceReady: options.onDeviceReady || null
        };
        
        // 内部状態
        this.pitchDetector = null;
        this.isDetecting = false;
        this.deviceInfo = null;
    }
    
    /**
     * 初期化
     */
    async initialize() {
        try {
            // PitchProライブラリが存在するか確認
            if (typeof PitchPro === 'undefined') {
                throw new Error('PitchProライブラリが読み込まれていません');
            }
            
            // デバイス検出
            this.deviceInfo = PitchPro.DeviceDetection.getDeviceSpecs();
            console.log('デバイス検出:', this.deviceInfo);
            
            // UI要素の初期化
            this.initializeUI();
            
            // デバイス準備完了コールバック
            if (this.callbacks.onDeviceReady) {
                this.callbacks.onDeviceReady(this.deviceInfo);
            }
            
            return true;
        } catch (error) {
            console.error('AudioDetectionComponent初期化エラー:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
            return false;
        }
    }
    
    /**
     * UI要素の初期化
     */
    initializeUI() {
        // デバイス情報の表示
        if (this.selectors.deviceType) {
            const element = document.querySelector(this.selectors.deviceType);
            if (element) {
                element.textContent = this.deviceInfo.deviceType || 'Unknown';
            }
        }
    }
    
    /**
     * 検出開始
     */
    async startDetection() {
        if (this.isDetecting) {
            console.warn('既に検出中です');
            return false;
        }
        
        try {
            // AudioManager作成
            const audioManager = new PitchPro.AudioManager();
            
            // PitchDetector初期化（AudioManagerを渡す）
            this.pitchDetector = new PitchPro.PitchDetector(audioManager, {
                fftSize: this.config.fftSize,
                smoothing: this.config.smoothing,
                clarityThreshold: this.config.clarityThreshold
            });
            
            // コールバック設定
            this.pitchDetector.setCallbacks({
                onPitchUpdate: (result) => this.handlePitchUpdate(result),
                onError: (error) => this.handleError(error)
            });
            
            // 初期化と検出開始
            await this.pitchDetector.initialize();
            const started = this.pitchDetector.startDetection();
            this.isDetecting = started;
            
            console.log('音程検出開始結果:', started);
            console.log('PitchDetector状態:', this.pitchDetector);
            return started;
            
        } catch (error) {
            console.error('検出開始エラー:', error);
            this.handleError(error);
            return false;
        }
    }
    
    /**
     * 検出停止
     */
    stopDetection() {
        if (!this.isDetecting) {
            return;
        }
        
        if (this.pitchDetector) {
            this.pitchDetector.stopDetection();
            this.pitchDetector = null;
        }
        
        this.isDetecting = false;
        console.log('音程検出停止');
    }
    
    /**
     * ピッチ更新ハンドラー
     */
    handlePitchUpdate(result) {
        console.log('ピッチ更新:', result);
        
        // 自動UI更新
        if (this.config.enableAutoUpdate) {
            this.updateUI(result);
        }
        
        // カスタムコールバック
        if (this.callbacks.onPitchUpdate) {
            this.callbacks.onPitchUpdate(result);
        }
    }
    
    /**
     * UI更新
     */
    updateUI(result) {
        // 周波数
        if (this.selectors.frequency) {
            const element = document.querySelector(this.selectors.frequency);
            if (element) {
                element.textContent = result.frequency ? `${result.frequency.toFixed(1)} Hz` : '-- Hz';
            }
        }
        
        // 音名
        if (this.selectors.note) {
            const element = document.querySelector(this.selectors.note);
            if (element) {
                element.textContent = result.note || '--';
            }
        }
        
        // オクターブ
        if (this.selectors.octave) {
            const element = document.querySelector(this.selectors.octave);
            if (element) {
                element.textContent = result.octave !== null ? result.octave : '--';
            }
        }
        
        // 明瞭度
        if (this.selectors.clarity) {
            const element = document.querySelector(this.selectors.clarity);
            if (element) {
                const clarityPercent = result.clarity ? (result.clarity * 100).toFixed(1) : '0.0';
                element.textContent = `${clarityPercent} %`;
            }
        }
        
        // 音量バー
        if (this.selectors.volumeBar) {
            const element = document.querySelector(this.selectors.volumeBar);
            if (element) {
                const volumePercent = Math.min(100, Math.max(0, result.volume * 100 * this.config.volumeScale));
                element.style.width = `${volumePercent}%`;
            }
        }
        
        // 音量パーセント
        if (this.selectors.volumePercent) {
            const element = document.querySelector(this.selectors.volumePercent);
            if (element) {
                const volumePercent = (result.volume * 100).toFixed(1);
                element.textContent = `${volumePercent}%`;
            }
        }
        
        // Raw音量
        if (this.selectors.rawVolume) {
            const element = document.querySelector(this.selectors.rawVolume);
            if (element) {
                element.textContent = result.volume.toFixed(3);
            }
        }
    }
    
    /**
     * エラーハンドラー
     */
    handleError(error) {
        console.error('AudioDetectionComponentエラー:', error);
        
        if (this.callbacks.onError) {
            this.callbacks.onError(error);
        }
    }
    
    /**
     * コールバック設定
     */
    setCallbacks(callbacks) {
        if (callbacks.onPitchUpdate) {
            this.callbacks.onPitchUpdate = callbacks.onPitchUpdate;
        }
        if (callbacks.onError) {
            this.callbacks.onError = callbacks.onError;
        }
        if (callbacks.onDeviceReady) {
            this.callbacks.onDeviceReady = callbacks.onDeviceReady;
        }
        
        // PitchDetectorが存在する場合は更新
        if (this.pitchDetector) {
            this.pitchDetector.setCallbacks({
                onPitchUpdate: (result) => this.handlePitchUpdate(result),
                onError: (error) => this.handleError(error)
            });
        }
    }
    
    /**
     * 設定更新
     */
    updateConfig(config) {
        Object.assign(this.config, config);
        
        // PitchDetectorが存在する場合は再初期化が必要
        if (this.pitchDetector && this.isDetecting) {
            console.log('設定変更のため再初期化が必要です');
        }
    }
    
    /**
     * ステータス取得
     */
    getStatus() {
        return {
            deviceType: this.deviceInfo?.deviceType || 'Unknown',
            sensitivityMultiplier: this.deviceInfo?.sensitivity || 1.0,
            volumeBarScale: this.deviceInfo?.volumeBarScale || 1.0,
            isDetecting: this.isDetecting
        };
    }
    
    /**
     * デバイス情報取得
     */
    getDeviceInfo() {
        return this.deviceInfo;
    }
    
    /**
     * クリーンアップ
     */
    dispose() {
        this.stopDetection();
        this.selectors = null;
        this.callbacks = null;
        this.config = null;
    }
}

// グローバルに公開
window.AudioDetectionComponent = AudioDetectionComponent;