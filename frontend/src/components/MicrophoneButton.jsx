function MicrophoneButton({
  listening,
  startListening,
  stopListening,
}) {
  return (
    <button
      onClick={
        listening
          ? stopListening
          : startListening
      }
      className={`rounded-lg px-6 py-3 font-semibold transition ${
        listening
          ? "bg-red-600 hover:bg-red-700"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {listening
        ? "⏹ Stop Microphone"
        : "🎤 Start Microphone"}
    </button>
  );
}

export default MicrophoneButton;