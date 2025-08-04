// DOM elements
const ruleForm = document.getElementById('rule-form');
const keywordInput = document.getElementById('keyword');
const colorSelect = document.getElementById('color');
const rulesList = document.getElementById('rules-list');

// Official Google Calendar colors (Name -> Hex)
const GCAL_COLORS = {
    'Tomato': '#d50000',
    'Tangerine': '#e67c73',
    'Flamingo': '#f4511e',
    'Banana': '#f6bf26',
    'Sage': '#33b679',
    'Basil': '#0b8043',
    'Peacock': '#039be5',
    'Blueberry': '#3f51b5',
    'Lavender': '#7986cb',
    'Grape': '#8e24aa',
    'Graphite': '#616161',
};

// Validate DOM elements exist
function validateElements() {
    const requiredElements = [
        { element: ruleForm, name: 'rule-form' },
        { element: keywordInput, name: 'keyword' },
        { element: colorSelect, name: 'color' },
        { element: rulesList, name: 'rules-list' }
    ];

    const missingElements = requiredElements.filter(({ element }) => !element);
    
    if (missingElements.length > 0) {
        throw new Error(`Missing required DOM elements: ${missingElements.map(e => e.name).join(', ')}`);
    }
}

// Populate the color dropdown
function populateColorDropdown() {
    try {
        colorSelect.innerHTML = ''; // Clear existing options
        
        Object.entries(GCAL_COLORS).forEach(([name, hex]) => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            option.style.backgroundColor = hex;
            option.style.color = 'white';
            option.style.textShadow = '0 0 2px black';
            colorSelect.appendChild(option);
        });
    } catch (error) {
        // Silent error handling for production
    }
}

// Create a rule item element
function createRuleItem(rule, index) {
    const colorHex = GCAL_COLORS[rule.color] || '#cccccc';
    const ruleItem = document.createElement('li');
    
    ruleItem.innerHTML = `
        <div class="color-box" style="background-color: ${colorHex}"></div>
        <span class="keyword">${escapeHtml(rule.keyword)}</span>
        <span class="color-name">${escapeHtml(rule.color)}</span>
        <button class="delete-rule" data-index="${index}" type="button">Delete</button>
    `;
    
    return ruleItem;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load rules from storage and display them
async function loadRules() {
    try {
        // Check if chrome.storage is available
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
            rulesList.innerHTML = '<li class="error">Storage not available. Please refresh the page.</li>';
            return;
        }
        
        const data = await chrome.storage.sync.get({ rules: [] });
        const rules = data.rules;
        
        rulesList.innerHTML = '';
        
        if (rules.length === 0) {
            rulesList.innerHTML = '<li class="no-rules">No rules configured. Add your first rule above.</li>';
            return;
        }
        
        rules.forEach((rule, index) => {
            const ruleItem = createRuleItem(rule, index);
            rulesList.appendChild(ruleItem);
        });
    } catch (error) {
        rulesList.innerHTML = '<li class="error">Error loading rules. Please refresh the page.</li>';
    }
}

// Save a new rule
async function saveRule(keyword, colorName) {
    try {
        // Check if chrome.storage is available
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
            return false;
        }
        
        const data = await chrome.storage.sync.get({ rules: [] });
        const rules = data.rules;
        
        // Prevent duplicate keywords (case-insensitive)
        const existingRuleIndex = rules.findIndex(r => 
            r.keyword.toLowerCase() === keyword.toLowerCase()
        );
        
        if (existingRuleIndex > -1) {
            rules[existingRuleIndex].color = colorName; // Update existing rule
        } else {
            rules.push({ keyword: keyword.trim(), color: colorName });
        }
        
        await chrome.storage.sync.set({ rules });
        await loadRules();
        
        return true;
    } catch (error) {
        return false;
    }
}

// Delete a rule
async function deleteRule(indexToDelete) {
    try {
        // Check if chrome.storage is available
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
            return false;
        }
        
        const data = await chrome.storage.sync.get({ rules: [] });
        let rules = data.rules;
        
        if (indexToDelete >= 0 && indexToDelete < rules.length) {
            rules.splice(indexToDelete, 1);
            await chrome.storage.sync.set({ rules });
            await loadRules();
            return true;
        }
        
        return false;
    } catch (error) {
        return false;
    }
}

// Form submission handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const keyword = keywordInput.value.trim();
    const colorName = colorSelect.value;
    
    if (!keyword) {
        return;
    }
    
    if (!colorName) {
        return;
    }
    
    const success = await saveRule(keyword, colorName);
    
    if (success) {
        keywordInput.value = '';
        // Scroll to the newly created rule instead of focusing input
        setTimeout(() => {
            const rules = rulesList.querySelectorAll('li');
            if (rules.length > 0) {
                const lastRule = rules[rules.length - 1];
                lastRule.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                // Add a brief highlight effect
                lastRule.style.backgroundColor = '#e8f5e8';
                setTimeout(() => {
                    lastRule.style.backgroundColor = '';
                }, 1000);
            }
        }, 100);
    }
}

// Delete button click handler
async function handleDeleteClick(event) {
    if (!event.target.classList.contains('delete-rule')) {
        return;
    }
    
    const indexToDelete = parseInt(event.target.dataset.index, 10);
    
    if (isNaN(indexToDelete)) {
        return;
    }
    
    await deleteRule(indexToDelete);
}

// Initialize the settings page
async function initializeSettings() {
    try {
        validateElements();
        populateColorDropdown();
        await loadRules();
        
        // Attach event listeners
        ruleForm.addEventListener('submit', handleFormSubmit);
        rulesList.addEventListener('click', handleDeleteClick);
    } catch (error) {
        document.body.innerHTML = '<div class="error">Failed to initialize settings. Please refresh the page.</div>';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSettings);
} else {
    initializeSettings();
}
