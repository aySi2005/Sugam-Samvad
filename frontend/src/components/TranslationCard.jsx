function TranslationCard({ item }) {
  const code = getLanguageCode(item.language);

  return (
    <div className="flex min-h-[260px] flex-col rounded-2xl border border-slate-800 bg-[#0b1220] p-6">

      {/* Header */}
      <div className="flex items-start justify-between">

        <div className="flex items-center gap-3">

          {/* Language Code */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-400">
            {code}
          </div>

          {/* Language Name */}
          <div>
            <h4 className="font-semibold text-white">
              {item.language}
            </h4>

            <p className="mt-0.5 text-xs text-slate-500">
              Translation
            </p>
          </div>

        </div>

        {/* Status */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            item.text
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          <span className="text-[9px]">
            ●
          </span>

          {item.text ? "Ready" : "Waiting"}
        </div>

      </div>

      {/* Translation */}
      <div className="flex flex-1 items-center py-8">

        {item.text ? (

          <p className="w-full text-lg leading-8 text-slate-100">
            {item.text}
          </p>

        ) : (

          <p className="text-sm leading-6 text-slate-600">
            Translation will appear here after speech is processed.
          </p>

        )}

      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 pt-4">

        <p className="text-xs text-slate-600">
          AI translation output
        </p>

      </div>

    </div>
  );
}


/* ================================= */
/* LANGUAGE CODE */
/* ================================= */

function getLanguageCode(language) {
  const codes = {
    Hindi: "HI",
    French: "FR",
    Arabic: "AR",
    Spanish: "ES",
  };

  return codes[language] || "XX";
}


export default TranslationCard;