/**
 * PitchPro オーディオ基本デモ
 * 正しいライブラリ使用方法の実装例
 */

// グローバル変数
let audioManager = null;
let pitchDetector = null;
let deviceSpecs = null;

// DOM要素参照
const elements = {
    // ステータス
    libraryStatus: document.getElementById('library-status'),
    audioManagerStatus: document.getElementById('audiomanager-status'),
    pitchDetectorStatus: document.getElementById('pitchdetector-status'),
    detectionStatus: document.getElementById('detection-status'),
    
    // ボタン
    btnCheckLibrary: document.getElementById('btn-check-library'),
    btnInitAudio: document.getElementById('btn-init-audio'),
    btnInitPitch: document.getElementById('btn-init-pitch'),
    btnStart: document.getElementById('btn-start'),
    btnStop: document.getElementById('btn-stop'),
    
    // 音程表示
    frequency: document.getElementById('frequency'),
    note: document.getElementById('note'),
    octave: document.getElementById('octave'),
    cents: document.getElementById('cents'),
    
    // 詳細情報
    volumeFill: document.getElementById('volume-fill'),
    volumePercent: document.getElementById('volume-percent'),
    clarity: document.getElementById('clarity'),
    clarityFill: document.getElementById('clarity-fill'),
    deviceType: document.getElementById('device-type'),
    sensitivity: document.getElementById('sensitivity'),
    
    // ログ
    logContent: document.getElementById('log-content')
};

// ログ機能
function addLog(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `[${time}] ${message}`;
    
    elements.logContent.appendChild(logEntry);
    elements.logContent.scrollTop = elements.logContent.scrollHeight;
    
    // コンソールにも出力
    const logMethod = type === 'error' ? console.error : type === 'success' ? console.log : console.log;
    logMethod(`[PitchPro Demo] ${message}`);
}

// ステータス更新
function updateStatus(element, text, success = true) {
    element.textContent = text;
    element.style.color = success ? '#86efac' : '#fca5a5';
}

// ボタン制御
function updateButtonState(checkLib, initAudio, initPitch, start, stop) {
    elements.btnCheckLibrary.disabled = !checkLib;
    elements.btnInitAudio.disabled = !initAudio;
    elements.btnInitPitch.disabled = !initPitch;
    elements.btnStart.disabled = !start;
    elements.btnStop.disabled = !stop;
}

// 1. ライブラリ確認
async function checkLibrary() {
    try {
        addLog('PitchProライブラリを確認中...');
        
        if (typeof PitchPro === 'undefined') {
            throw new Error('PitchProライブラリが読み込まれていません');
        }
        
        // 利用可能なクラスを確認
        const availableClasses = {
            AudioManager: !!PitchPro.AudioManager,
            PitchDetector: !!PitchPro.PitchDetector,
            DeviceDetection: !!PitchPro.DeviceDetection,
            MicrophoneController: !!PitchPro.MicrophoneController
        };
        
        addLog('✅ PitchProライブラリ読み込み成功', 'success');
        addLog(`利用可能なクラス: ${Object.entries(availableClasses).filter(([k, v]) => v).map(([k]) => k).join(', ')}`);
        
        // デバイス検出
        deviceSpecs = PitchPro.DeviceDetection.getDeviceSpecs();
        elements.deviceType.textContent = deviceSpecs.deviceType;
        elements.sensitivity.textContent = deviceSpecs.sensitivity.toFixed(1);
        
        addLog(`デバイス検出: ${deviceSpecs.deviceType}, 感度: ${deviceSpecs.sensitivity}x`);
        
        updateStatus(elements.libraryStatus, 'OK', true);
        updateButtonState(false, true, false, false, false);
        
    } catch (error) {
        addLog(`❌ ライブラリエラー: ${error.message}`, 'error');
        updateStatus(elements.libraryStatus, 'エラー', false);
    }
}

// 2. AudioManager初期化
async function initializeAudioManager() {
    try {
        addLog('AudioManagerを初期化中...');
        
        // AudioManager作成
        audioManager = new PitchPro.AudioManager();
        addLog('AudioManagerインスタンス作成完了');
        
        // 初期化実行
        const resources = await audioManager.initialize();
        
        addLog('✅ AudioManager初期化成功', 'success');
        addLog(`AudioContext: ${resources.audioContext.state}`);
        addLog(`サンプルレート: ${resources.audioContext.sampleRate}Hz`);
        addLog(`MediaStream: ${resources.mediaStream.active ? 'アクティブ' : '非アクティブ'}`);
        
        // マイクテスト: MediaStreamから直接テスト
        try {
            const audioContext = resources.audioContext;
            const sourceNode = resources.sourceNode;
            
            // テスト用Analyser作成
            const testAnalyser = audioContext.createAnalyser();
            testAnalyser.fftSize = 2048;
            sourceNode.connect(testAnalyser);
            
            const testBuffer = new Float32Array(testAnalyser.fftSize);
            
            addLog('🎤 マイクテスト開始 - 声を出してください...');
            
            const micTest = () => {
                testAnalyser.getFloatTimeDomainData(testBuffer);
                let sum = 0;
                for (let i = 0; i < testBuffer.length; i++) {
                    sum += Math.abs(testBuffer[i]);
                }
                const rms = Math.sqrt(sum / testBuffer.length);
                const volumePercent = rms * 1000; // スケール調整
                
                if (volumePercent > 0.1) {
                    addLog(`🎤 マイク音声検出: RMS=${rms.toFixed(6)}, Vol=${volumePercent.toFixed(2)}%`);
                }
            };
            
            const micTestInterval = setInterval(micTest, 200);
            setTimeout(() => {
                clearInterval(micTestInterval);
                testAnalyser.disconnect();
                addLog('マイクテスト終了');
            }, 5000);
            
        } catch (testError) {
            addLog(`マイクテストエラー: ${testError.message}`, 'error');
        }
        
        updateStatus(elements.audioManagerStatus, 'OK', true);
        updateButtonState(false, false, true, false, false);
        
    } catch (error) {
        addLog(`❌ AudioManagerエラー: ${error.message}`, 'error');
        updateStatus(elements.audioManagerStatus, 'エラー', false);
        
        // よくあるエラーの説明
        if (error.message.includes('Permission denied') || error.message.includes('NotAllowedError')) {
            addLog('マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。', 'error');
        }
    }
}

// 3. PitchDetector作成・初期化
async function initializePitchDetector() {
    try {
        addLog('PitchDetectorを作成中...');
        
        if (!audioManager) {
            throw new Error('AudioManagerが初期化されていません');
        }
        
        // PitchDetector作成（現実的なデフォルト値）
        pitchDetector = new PitchPro.PitchDetector(audioManager, {
            fftSize: 4096,
            smoothing: 0.1,
            clarityThreshold: 0.4,    // 現実的な値
            minVolumeAbsolute: 0.003  // 現実的な値
        });
        
        addLog('PitchDetectorインスタンス作成完了');
        
        // コールバック設定
        pitchDetector.setCallbacks({
            onPitchUpdate: handlePitchUpdate,
            onError: handlePitchError,
            onStateChange: handleStateChange
        });
        
        addLog('コールバック設定完了');
        
        // 初期化実行
        await pitchDetector.initialize();
        
        addLog('✅ PitchDetector初期化成功', 'success');
        updateStatus(elements.pitchDetectorStatus, 'OK', true);
        updateButtonState(false, false, false, true, false);
        
    } catch (error) {
        addLog(`❌ PitchDetectorエラー: ${error.message}`, 'error');
        updateStatus(elements.pitchDetectorStatus, 'エラー', false);
    }
}

// 4. 検出開始
function startDetection() {
    try {
        if (!pitchDetector) {
            throw new Error('PitchDetectorが初期化されていません');
        }
        
        addLog('音程検出を開始中...');
        
        const success = pitchDetector.startDetection();
        
        if (success) {
            addLog('✅ 音程検出開始成功', 'success');
            updateStatus(elements.detectionStatus, '検出中', true);
            updateButtonState(false, false, false, false, true);
        } else {
            throw new Error('検出開始に失敗しました');
        }
        
    } catch (error) {
        addLog(`❌ 検出開始エラー: ${error.message}`, 'error');
    }
}

// 5. 検出停止
function stopDetection() {
    try {
        if (!pitchDetector) {
            return;
        }
        
        pitchDetector.stopDetection();
        
        addLog('音程検出を停止しました');
        updateStatus(elements.detectionStatus, '停止中', false);
        updateButtonState(false, false, false, true, false);
        
        // 表示をリセット
        resetDisplay();
        
    } catch (error) {
        addLog(`❌ 検出停止エラー: ${error.message}`, 'error');
    }
}

// 表示リセット
function resetDisplay() {
    elements.frequency.textContent = '--';
    elements.note.textContent = '--';
    elements.octave.textContent = '--';
    elements.cents.textContent = '--';
    elements.volumeFill.style.width = '0%';
    elements.volumePercent.textContent = '0';
    elements.clarity.textContent = '0.00';
    elements.clarityFill.style.width = '0%';
}

// ピッチ更新ハンドラ
function handlePitchUpdate(result) {
    // デバッグ: 全てのコールバックをログ出力
    console.log('Raw pitch result:', result);
    addLog(`ピッチ更新: freq=${result.frequency}, vol=${result.volume.toFixed(1)}%, clarity=${result.clarity.toFixed(2)}`);
    
    // 周波数表示
    if (result.frequency > 0) {
        elements.frequency.textContent = result.frequency.toFixed(1);
        elements.note.textContent = result.note || '--';
        elements.octave.textContent = result.octave || '--';
        elements.cents.textContent = result.cents !== undefined ? 
            (result.cents > 0 ? '+' : '') + result.cents : '--';
    } else {
        elements.frequency.textContent = '--';
        elements.note.textContent = '--';
        elements.octave.textContent = '--';
        elements.cents.textContent = '--';
    }
    
    // 音量表示（0-20%の実際の値を0-100%にスケーリング）
    const volumePercent = Math.min(100, Math.max(0, result.volume * 5));
    elements.volumeFill.style.width = `${volumePercent}%`;
    elements.volumePercent.textContent = Math.round(volumePercent);
    
    // 明瞭度表示
    const clarityPercent = result.clarity * 100;
    elements.clarity.textContent = result.clarity.toFixed(2);
    elements.clarityFill.style.width = `${clarityPercent}%`;
}

// エラーハンドラ
function handlePitchError(error) {
    addLog(`PitchDetectorエラー: ${error.message}`, 'error');
}

// 状態変更ハンドラ
function handleStateChange(state) {
    addLog(`状態変更: ${state}`);
    updateStatus(elements.detectionStatus, state, state !== 'error');
}

// イベントリスナー設定
elements.btnCheckLibrary.addEventListener('click', checkLibrary);
elements.btnInitAudio.addEventListener('click', initializeAudioManager);
elements.btnInitPitch.addEventListener('click', initializePitchDetector);
elements.btnStart.addEventListener('click', startDetection);
elements.btnStop.addEventListener('click', stopDetection);

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // Lucideアイコン初期化
    lucide.createIcons();
    
    // 初期状態設定
    updateButtonState(true, false, false, false, false);
    
    addLog('PitchPro オーディオ基本デモ準備完了');
    addLog('「ライブラリ確認」ボタンから開始してください');
});