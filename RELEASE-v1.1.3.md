# Release Notes: PitchPro v1.1.3

## 🚨 Critical Hotfix Release

**Release Date**: September 7, 2025  
**Version**: 1.1.3  
**Type**: Emergency Hotfix

---

## 🎯 Overview

This is a **critical hotfix** addressing a severe microphone level drop bug affecting users on v1.1.1 and earlier. The issue caused microphone levels to gradually decrease starting around 5 seconds after initialization, eventually reaching zero.

## 🚨 Critical Fixes

### Microphone Level Drop Bug Resolution
- **Problem**: Microphone levels dropping to zero after 5+ seconds
- **Root Cause**: Browser AutoGainControl (AGC) interference and GainNode drift
- **Solution**: Automatic gain monitoring and recovery system

#### Technical Implementation:
```javascript
// New: 2-second interval gain monitoring
setInterval(() => {
  if (Math.abs(currentGain - expectedGain) > threshold) {
    console.warn('🚨 Gain drift detected!');
    gainNode.gain.setValueAtTime(expectedGain, audioContext.currentTime);
  }
}, 2000);
```

### Enhanced Browser Compatibility
- **Chrome**: Complete Google AGC disabling
- **Firefox**: Mozilla-specific constraints 
- **Safari**: WebKit compatibility improvements
- **All Browsers**: Platform-specific MediaStream constraints

## ⚡ Quick Fix

**For users experiencing microphone level drops:**

```bash
# Update to latest version
npm install @pitchpro/audio-processing@1.1.3
```

**No code changes required** - the fix is automatic!

## 🔧 Technical Details

### New Features Added:
1. **`startGainMonitoring()`** - Automatic gain drift detection
2. **Enhanced MediaStream Constraints** - Platform-specific AGC disabling  
3. **Precision Gain Control** - Using `setValueAtTime()` for accuracy
4. **Automatic Recovery** - 10%+ drift triggers immediate correction

### Code Changes:
- `src/core/AudioManager.ts`: Added gain monitoring system
- MediaStream constraints enhanced for all browsers
- Cleanup functions updated to stop monitoring intervals

## 📊 Performance Impact

- **Memory**: +minimal (single interval timer)
- **CPU**: +negligible (2-second checks)
- **Battery**: Improved (prevents continuous processing at zero volume)
- **Stability**: Significantly enhanced

## ✅ Testing

### Verification Steps:
1. Update to v1.1.3
2. Initialize microphone
3. Observe console logs for gain monitoring
4. Verify sustained audio levels after 5+ seconds

### Expected Console Output:
```
✅ [AudioManager] GainNode creation complete (sensitivity: 3.0x)
🔧 [AudioManager] Gain reset to: 3.0  // (if drift detected)
```

## 🏃‍♂️ Migration

### From v1.1.1 or Earlier:
- **Required Action**: Update package version only
- **Code Changes**: None required
- **Configuration**: Existing settings preserved

### From v1.1.2:
- **Required Action**: Update package version only
- **Breaking Changes**: None (builds upon v1.1.2 filename standardization)

## 🐛 Known Issues

### Still Under Investigation:
- Some iOS Safari environments may show intermittent gain warnings (non-critical)
- Very old browser versions may not support all AGC constraints

### Workarounds:
```javascript
// Optional: Higher initial sensitivity for problematic environments
microphoneController.setSensitivity(8.0); // default: device-dependent
```

## 📈 What's Next

### v1.1.4 Planning:
- Further iOS Safari optimizations
- Enhanced debug logging options
- Performance monitoring dashboard

## 🙏 Acknowledgments

Thanks to users who reported the microphone level drop issue. This critical feedback helped identify and resolve a significant stability problem.

---

## 🔗 Resources

- **GitHub Repository**: https://github.com/kiyopi/pitchpro-audio-processing
- **Documentation**: [README.md](./README.md)
- **Migration Guide**: [MIGRATION-v1.1.2.md](./MIGRATION-v1.1.2.md)
- **Emergency Guide**: [HOTFIX-microphone-level-drop.md](./HOTFIX-microphone-level-drop.md)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/kiyopi/pitchpro-audio-processing/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kiyopi/pitchpro-audio-processing/discussions)

---

**⚡ This hotfix is recommended for all users experiencing microphone-related issues.**