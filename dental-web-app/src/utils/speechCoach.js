class WebSpeechCoach {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isMuted = false;
  }

  speak(text) {
    if (!this.synth || this.isMuted || !text) return;

    try {
      this.synth.cancel(); // Stop current speech before new speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Clear natural speech rate
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select preferred voice if available (English female/male natural voice)
      const voices = this.synth.getVoices();
      const englishVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      this.synth.speak(utterance);
    } catch (err) {
      console.warn("Speech Synthesis error:", err);
    }
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (err) {
        console.warn("Speech stop error:", err);
      }
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }
}

export const speechCoach = new WebSpeechCoach();
