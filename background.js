chrome.runtime.onInstalled.addListener(() => {
  // These colors are from the official Google Calendar color palette.
  const defaultRules = [
    { keyword: 'meeting', color: 'Tomato' },
    { keyword: 'focus', color: 'Mandarin' },
    { keyword: 'work', color: 'Grape' },
    { keyword: 'email', color: 'Peacock' },
    { keyword: 'gym', color: 'Blueberry' },
    { keyword: 'run', color: 'Sage' },
    { keyword: 'swim', color: 'Basil' },
    { keyword: 'walk', color: 'Tangerine' },
    { keyword: 'lunch', color: 'Banana' },
    { keyword: 'break', color: 'Lavender' },
    { keyword: 'coffee', color: 'Graphite' },
    { keyword: 'errand', color: 'Mandarin' },
  ];

  chrome.storage.sync.get({ rules: [] }, (data) => {
    // Only set default rules if no rules exist.
    if (data.rules.length === 0) {
      chrome.storage.sync.set({ rules: defaultRules });
    }
  });
});
