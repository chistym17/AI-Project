/*  Sunrise Café – playback worklet  */
class PlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue  = [];   // array of Float32Array blocks
    this.offset = 0;    // read index in head block
    this.port.onmessage = e => this.queue.push(e.data);
  }

  process(_, outputs) {
    const out = outputs[0][0];   // mono output buffer
    let idx   = 0;

    while (idx < out.length) {
      if (!this.queue.length) {        // underrun → silence
        out.fill(0, idx);
        break;
      }
      const buf  = this.queue[0];
      const copy = Math.min(buf.length - this.offset, out.length - idx);
      out.set(buf.subarray(this.offset, this.offset + copy), idx);

      idx        += copy;
      this.offset += copy;

      if (this.offset >= buf.length) { // buffer exhausted
        this.queue.shift();
        this.offset = 0;
      }
    }
    return true;                       // keep processor alive
  }
}

registerProcessor('player-processor', PlayerProcessor);
