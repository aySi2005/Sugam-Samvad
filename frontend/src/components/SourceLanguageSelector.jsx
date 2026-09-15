const inputLanguages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "fr", name: "French" },
  { code: "ar", name: "Arabic" },
  { code: "es", name: "Spanish" },
];

function SourceLanguageSelector({
  selectedLanguage,
  onChange,
}) {
  return (
    <section>
      <h3 className="text-lg font-semibold">
        Speaker Language
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Select the language spoken by the diplomat.
      </p>

      <select
        value={selectedLanguage}
        onChange={event =>
          onChange(event.target.value)
        }
        className="mt-3 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
      >
        {inputLanguages.map(language => (
          <option
            key={language.code}
            value={language.code}
          >
            {language.name}
          </option>
        ))}
      </select>
    </section>
  );
}

export default SourceLanguageSelector;