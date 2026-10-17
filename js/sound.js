/**
 * Sound Manager ด้วย Web Audio API
 * สร้างเอฟเฟกต์เสียงสังเคราะห์ทั้งหมดโดยไม่ต้องพึ่งพาไฟล์เสียงภายนอก
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem("davinci_sound_muted") === "true";
  }

  // เริ่มต้น AudioContext เมื่อมีการโต้ตอบครั้งแรก (ตามนโยบาย Autoplay ของเบราว์เซอร์)
  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // สลับสถานะเปิด/ปิดเสียง
  toggleSound() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("davinci_sound_muted", this.isMuted);
    if (!this.isMuted) {
      this.playPop();
    }
    return !this.isMuted;
  }

  // 1. เสียงคลิกปุ่ม / เลือกพยางค์ (Pop Sound)
  playPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn("Sound error:", e);
    }
  }

  // 2. เสียงขอคำใบ้ (Ding / Chime)
  playHint() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const freqs = [880, 1320, 1760];
      const now = this.ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = now + idx * 0.07;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch (e) {
      console.warn("Sound error:", e);
    }
  }

  // 3. เสียงตอบถูก (Victory Fanfare)
  playCorrect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Arpeggio เมเจอร์: C5, E5, G5, C6 (523Hz, 659Hz, 784Hz, 1046Hz)
      const notes = [
        { f: 523.25, d: 0.12, t: 0 },
        { f: 659.25, d: 0.12, t: 0.12 },
        { f: 783.99, d: 0.12, t: 0.24 },
        { f: 1046.50, d: 0.5,  t: 0.36 }
      ];

      const now = this.ctx.currentTime;

      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const st = now + n.t;
        osc.type = "sine";
        osc.frequency.setValueAtTime(n.f, st);

        gain.gain.setValueAtTime(0.35, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + n.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(st);
        osc.stop(st + n.d);
      });
    } catch (e) {
      console.warn("Sound error:", e);
    }
  }

  // 4. เสียงตอบผิด (Wrong Buzzer)
  playWrong() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "sawtooth";

      // ความถี่คอร์ดขัดหู (Dissonance)
      osc1.frequency.setValueAtTime(160, now);
      osc2.frequency.setValueAtTime(152, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn("Sound error:", e);
    }
  }

  // 5. เสียงนาฬิกานับถอยหลังเตือนเวลาใกล้หมด (Tick-Tock)
  playTick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn("Sound error:", e);
    }
  }
}

// สร้าง Instance หลักสำหรับเรียกใช้งานทั้งเกม
const soundManager = new SoundController();
