// Node.js環境でPitchProのAPIを直接テスト
const fs = require('fs');

// より基本的な環境設定
global.window = {
  AudioContext: function() { return {}; },
  webkitAudioContext: function() { return {}; },
  screen: { width: 1024, height: 768 },
  devicePixelRatio: 1
};

global.document = {
  createElement: () => ({
    style: {},
    textContent: '',
    appendChild: () => {},
    setAttribute: () => {},
    addEventListener: () => {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    offsetHeight: 0
  }),
  querySelector: () => null,
  querySelectorAll: () => [],
  head: { appendChild: () => {} }
};

global.navigator = {
  userAgent: 'Mozilla/5.0 (Node.js Test)',
  language: 'en-US',
  platform: 'NodeJS',
  mediaDevices: null
};

global.HTMLProgressElement = class {};
global.CustomEvent = class {};
global.MediaRecorder = class {};
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.clearInterval = clearInterval;
global.setInterval = setInterval;
global.setTimeout = setTimeout;
global.clearTimeout = clearTimeout;

// UMDファイルを直接require（UMD形式なのでmodule.exportsに設定される）
try {
  const umdContent = fs.readFileSync('./dist/pitchpro.umd.js', 'utf8');
  eval(umdContent);
} catch (error) {
  console.error('UMD読み込みエラー:', error.message);
}

console.log('=== API テスト結果 ===');
console.log('window.PitchPro 存在:', !!global.window.PitchPro);

if (global.window.PitchPro) {
  const PitchPro = global.window.PitchPro;
  console.log('PitchPro keys:', Object.keys(PitchPro));
  
  if (PitchPro.AudioDetectionComponent) {
    console.log('AudioDetectionComponent 存在: YES');
    
    try {
      const component = new PitchPro.AudioDetectionComponent();
      console.log('インスタンス作成: SUCCESS');
      
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(component))
        .filter(name => typeof component[name] === 'function' && name !== 'constructor');
      
      console.log('利用可能メソッド:', methods);
      console.log('updateSelectors 存在:', methods.includes('updateSelectors'));
      
      if (typeof component.updateSelectors === 'function') {
        console.log('updateSelectors 呼び出し可能: YES');
      } else {
        console.log('updateSelectors 呼び出し可能: NO');
      }
      
    } catch (error) {
      console.log('インスタンス作成エラー:', error.message);
    }
    
  } else {
    console.log('AudioDetectionComponent 存在: NO');
  }
} else {
  console.log('PitchPro が利用できません');
}