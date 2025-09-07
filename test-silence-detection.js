/**
 * 消音検出機能の簡単なテストスクリプト
 * Node.jsで実行可能な基本的な機能テスト
 */

import { PitchDetector } from './dist/index.esm.js';

// Mock AudioManager for testing
class MockAudioManager {
  getPlatformSpecs() {
    return {
      deviceType: 'PC',
      isIOS: false,
      sensitivity: 1.0,
      noiseGate: 0.02,
      divisor: 6.0,
      gainCompensation: 1.0,
      noiseThreshold: 5,
      smoothingFactor: 0.1
    };
  }

  initialize() {
    return Promise.resolve();
  }

  createAnalyser() {
    return {
      fftSize: 2048,
      getFloatTimeDomainData: () => {}
    };
  }

  release() {}
}

console.log('🔇 消音検出機能テスト開始');

try {
  // Mock AudioManager作成
  const mockAudioManager = new MockAudioManager();
  
  // PitchDetector作成（消音検出付き）
  const pitchDetector = new PitchDetector(mockAudioManager, {
    fftSize: 2048,
    clarityThreshold: 0.4,
    minVolumeAbsolute: 0.003,
    silenceDetection: {
      enabled: true,
      warningThreshold: 3000,   // 3秒で警告
      timeoutThreshold: 5000,   // 5秒でタイムアウト
      minVolumeThreshold: 0.01, // 1%以下で消音判定
      onSilenceWarning: (duration) => {
        console.log(`⚠️  消音警告: ${duration}ms間無音です`);
      },
      onSilenceTimeout: () => {
        console.log('⏰ 消音タイムアウト: 検出を自動停止します');
      },
      onSilenceRecovered: () => {
        console.log('🔊 音声回復: 消音状態が解除されました');
      }
    }
  });

  console.log('✅ PitchDetector作成成功');

  // 初期状態確認
  let status = pitchDetector.getSilenceStatus();
  console.log('📊 初期状態:', {
    enabled: status.isEnabled,
    isSilent: status.isSilent,
    duration: status.silenceDuration,
    hasWarned: status.hasWarned
  });

  // 設定変更テスト
  console.log('\n🔧 設定変更テスト');
  pitchDetector.setSilenceDetectionConfig({
    enabled: false
  });
  status = pitchDetector.getSilenceStatus();
  console.log('❌ 無効化後:', { enabled: status.isEnabled });

  pitchDetector.setSilenceDetectionConfig({
    enabled: true,
    warningThreshold: 2000,
    minVolumeThreshold: 0.005
  });
  status = pitchDetector.getSilenceStatus();
  console.log('✅ 再有効化後:', { enabled: status.isEnabled });

  // プライベートメソッドのテスト（リフレクション）
  console.log('\n🧪 消音検出ロジックテスト');
  const processSilenceDetection = pitchDetector.processSilenceDetection?.bind(pitchDetector);
  
  if (processSilenceDetection) {
    // 消音状態をシミュレート
    console.log('📉 低音量（消音状態）をシミュレート...');
    processSilenceDetection(0.005); // 閾値以下
    
    status = pitchDetector.getSilenceStatus();
    console.log('🔇 消音検出結果:', {
      isSilent: status.isSilent,
      duration: status.silenceDuration
    });
    
    // 音声回復をシミュレート
    console.log('📈 音声回復をシミュレート...');
    processSilenceDetection(0.05); // 閾値以上
    
    status = pitchDetector.getSilenceStatus();
    console.log('🔊 音声回復結果:', {
      isSilent: status.isSilent,
      duration: status.silenceDuration
    });
  }

  console.log('\n✅ 全ての基本テストが完了しました！');
  console.log('🌐 Webテスト用URL: http://localhost:3000/silence-detection-test.html');
  
} catch (error) {
  console.error('❌ テスト失敗:', error.message);
  process.exit(1);
}