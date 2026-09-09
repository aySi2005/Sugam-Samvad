class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.buffer = [];
    this.bufferSize = 2048;

    this.noiseGateThreshold = 0.006;

    const cutoffHz = 80;
    const rc = 1 / (2 * Math.PI * cutoffHz);
    const dt = 1 / sampleRate;

    this.highPassAlpha = rc / (rc + dt);
    this.previousInput = 0;
    this.previousOutput = 0;
  }

  process(inputs) {
    const input = inputs[0];

    if (!input || !input[0]) {
      return true;
    }

    const channel = input[0];

    for (let i = 0; i < channel.length; i++) {
      const inputSample = channel[i];

      const filteredSample =
        this.highPassAlpha *
        (
          this.previousOutput +
          inputSample -
          this.previousInput
        );

      this.previousInput = inputSample;
      this.previousOutput = filteredSample;

      this.buffer.push(filteredSample);
    }

    while (this.buffer.length >= this.bufferSize) {
      const samples = new Float32Array(
        this.buffer.splice(0, this.bufferSize)
      );

      let sum = 0;

      for (let i = 0; i < samples.length; i++) {
        sum += samples[i] * samples[i];
      }

      const rawRms = Math.sqrt(
        sum / samples.length
      );

      const containsVoice =
        rawRms >= this.noiseGateThreshold;

      const pcm = new Int16Array(samples.length);

      for (let i = 0; i < samples.length; i++) {
        const sample = containsVoice
          ? Math.max(-1, Math.min(1, samples[i]))
          : 0;

        pcm[i] =
          sample < 0
            ? sample * 32768
            : sample * 32767;
      }

      this.port.postMessage(
        {
          type: "audio",
          pcm: pcm.buffer,
          rms: containsVoice ? rawRms : 0,
        },
        [pcm.buffer]
      );
    }

    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);