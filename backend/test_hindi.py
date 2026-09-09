import os
from faster_whisper import WhisperModel


MODEL_NAME = "Systran/faster-whisper-medium"


if os.getenv("DIPLOMAI_DEVICE") == "cpu":
    device = "cpu"
    compute_type = "int8"
else:
    try:
        import ctranslate2

        if ctranslate2.get_cuda_device_count() > 0:
            device = "cuda"
            compute_type = "float16"
        else:
            device = "cpu"
            compute_type = "int8"

    except Exception:
        device = "cpu"
        compute_type = "int8"


print("Device:", device)
print("Compute type:", compute_type)
print("Loading Whisper...")


model = WhisperModel(
    MODEL_NAME,
    device=device,
    compute_type=compute_type,
)


print("Model loaded.")
print()


audio_file = "audio/test_hindi.wav"

if not os.path.exists(audio_file):
    print("ERROR: test_hindi.wav not found.")
    print("Put test_hindi.wav in the backend folder.")
    raise SystemExit


segments, info = model.transcribe(
    audio_file,
    language="hi",
    task="transcribe",
    beam_size=5,
    temperature=0.0,
    condition_on_previous_text=False,
    vad_filter=False,
)


print("=" * 60)
print("HINDI WHISPER TEST")
print("=" * 60)

print("Detected language:", info.language)
print(
    "Language probability:",
    info.language_probability
)

print()
print("TRANSCRIPT:")
print("-" * 60)

for segment in segments:
    text = segment.text.strip()

    if text:
        print(text)

print("=" * 60)