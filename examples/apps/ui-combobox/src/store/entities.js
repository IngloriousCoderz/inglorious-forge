export const entities = {
  countrySelect: {
    type: "Combobox",
    placeholder: "Select a country...",
    options: [
      { value: "br", label: "Brazil" },
      { value: "it", label: "Italy" },
      { value: "ca", label: "Canada" },
      { value: "us", label: "United States" },
      { value: "uk", label: "United Kingdom" },
      { value: "fr", label: "France" },
    ],
    isSearchable: true,
    isClearable: true,
  },

  multiSelect: {
    type: "Combobox",
    placeholder: "Select languages...",
    options: [
      { value: "js", label: "JavaScript" },
      { value: "ts", label: "TypeScript" },
      { value: "java", label: "Java" },
      { value: "csharp", label: "C#" },
      { value: "py", label: "Python" },
      { value: "go", label: "Go", isDisabled: true },
      { value: "php", label: "PHP" },
    ],
    isMulti: true,
    isSearchable: true,
    isClearable: true,
  },

  remoteSelect: {
    type: "RemoteCombobox",
    placeholder: "Select your favorite animal...",
  },
}
