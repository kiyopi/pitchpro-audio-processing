// Node.js環境でのPitchProライブラリ基本検証
const fs = require('fs');
const path = require('path');

console.log('🧪 PitchPro Validation Test');
console.log('================================');

// 1. ファイル存在チェック
const filesToCheck = [
    'dist-umd/pitchpro.umd.js',
    'demos/audio-basic/index.html',
    'demos/audio-basic/script.js',
    'demos/audio-basic/styles.css',
    'demos/advanced-features-test.html',
    'demos/core-features-test.html',
    'demos/utils-features-test.html'
];

console.log('\n📁 File Existence Check:');
filesToCheck.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// 2. UMDファイル基本チェック
console.log('\n📦 UMD Bundle Check:');
try {
    const umdContent = fs.readFileSync('dist-umd/pitchpro.umd.js', 'utf8');
    
    // 基本的な内容チェック
    const checks = [
        { name: 'PitchPro export', pattern: /PitchPro\s*=/ },
        { name: 'AudioManager class', pattern: /class AudioManager/ },
        { name: 'PitchDetector class', pattern: /class PitchDetector/ },
        { name: 'FrequencyUtils class', pattern: /class FrequencyUtils/ },
        { name: 'MusicTheory class', pattern: /class MusicTheory/ }
    ];
    
    checks.forEach(check => {
        const found = check.pattern.test(umdContent);
        console.log(`  ${found ? '✅' : '❌'} ${check.name}`);
    });
    
    console.log(`  📊 Bundle size: ${(umdContent.length / 1024).toFixed(1)}KB`);
    
} catch (error) {
    console.log(`  ❌ UMD file read error: ${error.message}`);
}

// 3. HTMLファイルの基本構造チェック  
console.log('\n🌐 HTML Structure Check:');
const htmlFiles = [
    'demos/audio-basic/index.html',
    'demos/advanced-features-test.html', 
    'demos/core-features-test.html',
    'demos/utils-features-test.html'
];

htmlFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        
        const hasScript = content.includes('pitchpro.umd.js');
        const hasTitle = content.includes('<title>');
        const hasBody = content.includes('<body>');
        
        console.log(`  ${file}:`);
        console.log(`    ${hasScript ? '✅' : '❌'} UMD script reference`);
        console.log(`    ${hasTitle ? '✅' : '❌'} Title tag`);
        console.log(`    ${hasBody ? '✅' : '❌'} Body tag`);
        
    } catch (error) {
        console.log(`    ❌ Read error: ${error.message}`);
    }
});

// 4. スクリプト参照パスチェック
console.log('\n🔗 Script Path Validation:');
htmlFiles.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const scriptMatches = content.match(/src="([^"]*pitchpro[^"]*\.js)"/g);
        
        if (scriptMatches) {
            scriptMatches.forEach(match => {
                const pathMatch = match.match(/src="([^"]*)"/);
                if (pathMatch) {
                    const relativePath = pathMatch[1];
                    const fullPath = path.resolve(path.dirname(file), relativePath);
                    const exists = fs.existsSync(fullPath);
                    console.log(`  ${file}: ${exists ? '✅' : '❌'} ${relativePath}`);
                }
            });
        }
    } catch (error) {
        console.log(`  ❌ ${file}: ${error.message}`);
    }
});

console.log('\n🏁 Validation Complete');
console.log('\n💡 Next Steps:');
console.log('1. Open demos/quick-test.html in browser to test library loading');
console.log('2. Test demos/audio-basic/index.html with microphone permission');
console.log('3. Verify all interactive features in test pages');