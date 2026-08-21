class SpeechCoach {
  private synth: SpeechSynthesis | null = null;
  private isMuted: boolean = false;
  private language: string = "en-US";
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.attachAutoplayUnlock();
    }
  }

  private attachAutoplayUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      if (this.synth) {
        try {
          if (this.synth.paused) {
            this.synth.resume();
          }
          this.isUnlocked = true;
        } catch (e) {}
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setLanguage(lang: string) {
    this.language = lang;
  }

  public speak(text: string) {
    if (this.isMuted || !this.synth || !text) return;
    try {
      // Resume synth if engine was suspended by browser policy
      if (this.synth.paused) {
        this.synth.resume();
      }
      
      this.synth.cancel(); // Stop ongoing speech before new zone prompt

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Clear, calm pacing
      utterance.pitch = 1.0;
      if (this.language) {
        utterance.lang = this.language;
      }

      utterance.onerror = (event) => {
        console.warn("SpeechSynthesis utterance error (graceful fallback):", event);
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn("SpeechCoach utterance invocation failed (graceful fallback):", e);
    }
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn("SpeechCoach stop error:", e);
      }
    }
  }
}

export const speechCoach = new SpeechCoach();
