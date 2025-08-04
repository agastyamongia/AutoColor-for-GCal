// Default rules for new installations
const DEFAULT_RULES = [
    { keyword: 'meeting', color: 'Tomato' },
    { keyword: 'work', color: 'Grape' },
    { keyword: 'personal', color: 'Sage' },
    { keyword: 'gym', color: 'Blueberry' },
];

// Initialize default rules for new installations
async function initializeDefaultRules() {
    try {
        const data = await chrome.storage.sync.get({ rules: [] });
        
        // Only set default rules if no rules exist
        if (data.rules.length === 0) {
            await chrome.storage.sync.set({ rules: DEFAULT_RULES });
        }
    } catch (error) {
        // Silent error handling for production
    }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        await initializeDefaultRules();
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(async () => {
    await initializeDefaultRules();
});
