/* ------------------------------------------------------------ *
 *  Sunrise Café – microphone worklet                           *
 *  • Captures at the AudioContext’s native rate (usually 48 k)  *
 *  • Down-samples to 16 kHz                                     *
 *  • Emits fixed 20-ms Int16Array packets over the port         *
 * ------------------------------------------------------------ */

class MicProcessor extends AudioWorkletProcessor {
  constructor () {
    super();

    /* ----- CONFIG ------------------------------------------------ */
    this.dstRate   = 16_000;      // backend expects 16-kHz PCM
    this.frameMs   = 20;          // size of each packet
    /* ------------------------------------------------------------- */

    this.srcRate   = sampleRate;                 // context rate
    this.ratio     = this.srcRate / this.dstRate;
    this.samplesPerPacket = Math.round(this.dstRate * this.frameMs / 1_000);
    this.packet    = new Int16Array(this.samplesPerPacket);
    this.pIndex    = 0;
    this.acc       = 0;                           // resample accumulator
    this.seq       = 0;
  }

  process (inputs) {
    const input = inputs[0];
    if (!input || !input[0]?.length) return true;

    const ch = input[0];
    for (let i = 0; i < ch.length; i++) {
      this.acc += 1;
      if (this.acc >= this.ratio) {               // time to pick a sample
        const s = Math.max(-1, Math.min(1, ch[i]));
        this.packet[this.pIndex++] = s < 0 ? s * 32768 : s * 32767;
        this.acc -= this.ratio;

        if (this.pIndex === this.packet.length) { // packet full: send
          this.port.postMessage(this.packet.buffer, [this.packet.buffer]);
          this.packet = new Int16Array(this.samplesPerPacket);
          this.pIndex = 0;
          this.seq++;
        }
      }
    }
    return true;
  }
}

registerProcessor("mic-processor", MicProcessor);
