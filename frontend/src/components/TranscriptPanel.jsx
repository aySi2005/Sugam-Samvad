function TranscriptPanel({
  finalizedSegments,
  liveTranscript,
  sourceLanguage,
}) {
  const hasTranscript =
    finalizedSegments.length > 0 ||
    Boolean(liveTranscript);

  const code =
    sourceLanguage?.code === "auto"
      ? "..."
      : (sourceLanguage?.code || "??").toUpperCase();

  const name =
    sourceLanguage?.name || "Detecting...";

  const confidence =
    Number.isFinite(sourceLanguage?.confidence)
      ? `${Math.round(
          sourceLanguage.confidence * 100
        )}%`
      : "";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0b1220]">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <span className="absolute h-2.5 w-2.5 animate-pulse rounded-full bg-blue-400" />
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-slate-200">
              SOURCE SPEECH
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Full session transcript
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-800/50 px-3 py-2">
          <span className="text-xs font-bold text-blue-400">
            {code}
          </span>

          <span className="text-xs text-slate-400">
            {name} {confidence && `• ${confidence}`}
          </span>
        </div>
      </div>

      <div className="max-h-[360px] min-h-[180px] overflow-y-auto px-8 py-7">
        {hasTranscript ? (
          <div className="max-w-4xl space-y-4">
            {finalizedSegments.map(
              (segment, index) => (
                <p
                  key={`${index}-${segment}`}
                  className="text-lg leading-relaxed text-slate-200"
                >
                  {segment}
                </p>
              )
            )}

            {liveTranscript && (
              <p className="border-l-2 border-blue-400 pl-4 text-lg leading-relaxed text-slate-100">
                {liveTranscript}

                <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-blue-400" />
              </p>
            )}
          </div>
        ) : (
          <div className="flex min-h-[130px] items-center">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-700 bg-slate-800/60">
                <span className="text-xl opacity-60">
                  🎙
                </span>
              </div>

              <div>
                <p className="text-base font-medium text-slate-400">
                  Waiting for speech
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Start the microphone to begin live transcription
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/30 px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

          <span className="text-xs text-slate-500">
            {liveTranscript
              ? "Live transcription active"
              : finalizedSegments.length > 0
                ? `${finalizedSegments.length} finalized sentence(s)`
                : "Ready"}
          </span>
        </div>

        <span className="text-xs text-slate-600">
          Source • {name}
        </span>
      </div>
    </section>
  );
}


export default TranscriptPanel;