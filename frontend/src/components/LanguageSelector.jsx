function LanguageSelector({
  languages,
  selectedLanguages,
  toggleLanguage,
}) {
  return (
    <section>

      <div className="mb-4">
        <h3 className="font-semibold text-white">
          Target Languages
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Select the languages for simultaneous translation.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">

        {languages.map((language) => {

          const selected =
            selectedLanguages.includes(language);

          return (
            <button
              key={language}
              onClick={() =>
                toggleLanguage(language)
              }
              className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-all ${
                selected
                  ? "border-blue-500/50 bg-blue-500/15 text-blue-300 shadow-sm shadow-blue-500/10"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              <span className="mr-2">
                {selected ? "✓" : "+"}
              </span>

              {language}
            </button>
          );

        })}

      </div>

    </section>
  );
}

export default LanguageSelector;