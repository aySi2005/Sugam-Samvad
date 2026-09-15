function SessionControls({
  listening,
  startListening,
  stopListening,
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-400" />

          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Live Session
          </span>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white">
          Diplomatic Interpretation
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Speaker language:{" "}
          <span className="font-medium text-slate-200">
            English
          </span>
        </p>
      </div>

      <button
        onClick={
          listening
            ? stopListening
            : startListening
        }
        className={`flex items-center justify-center gap-3 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-lg transition-all duration-200 ${
          listening
            ? "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600"
            : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500"
        }`}
      >
        <span className="text-lg">
          {listening ? "⏹" : "🎙️"}
        </span>

        {listening
          ? "Stop Interpretation"
          : "Start Interpretation"}
      </button>

    </div>
  );
}

export default SessionControls;