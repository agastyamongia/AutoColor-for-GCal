// === MAIN INITIALIZATION ===
let observer = null;
let isProcessing = false;
let debounceTimeout = null;
let urlCheckInterval = null;

// Constants
const DEBOUNCE_DELAY = 300;
const PROCESSING_TIMEOUT = 1000;
const ELEMENT_TIMEOUT = 5000;
const CLICK_DELAY = 50;
const ANIMATION_DELAY = 100;
const URL_CHECK_INTERVAL = 1000;

// Input selectors - centralized for easier maintenance
const INPUT_SELECTORS = [
    'input[aria-label="Title"]',
    'input[aria-label="Add title"]', 
    'input[jsname="YPqjbf"]'
];

// Utility to wait for an element to appear and be visible
function waitForElement(selector, timeout = ELEMENT_TIMEOUT) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElement = () => {
            const element = document.querySelector(selector);
            
            if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Element ${selector} not found or not visible within ${timeout}ms`));
            } else {
                requestAnimationFrame(checkElement);
            }
        };

        checkElement();
    });
}

// Function to simulate a click more robustly
function simulateClick(element) {
    if (!element || !element.offsetParent) return false;
    
    try {
        // Try native click first
        element.click();
        
        // Fallback to more robust event dispatching
        setTimeout(() => {
            if (element.offsetParent) {
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                element.dispatchEvent(event);
            }
        }, CLICK_DELAY);
        
        return true;
    } catch (error) {
        return false;
    }
}

// Debounced function to prevent excessive calls
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Check if a keyword matches the input value
function matchesKeyword(inputValue, keyword) {
    const normalizedInput = inputValue.toLowerCase();
    const normalizedKeyword = keyword.toLowerCase();
    
    return normalizedInput.includes(normalizedKeyword) || 
           normalizedInput.includes(normalizedKeyword + ' ');
}

// Process input and apply color if matched
async function processInput(input) {
    if (isProcessing) {
        return;
    }
    
    const value = input.value.trim();
    if (!value) return;
    
    try {
        isProcessing = true;
        
        // Check if extension context is still valid
        if (typeof chrome === 'undefined' || !chrome.storage) {
            // Fallback to default rules if extension context is invalid
            const fallbackRules = [
                { keyword: 'meeting', color: 'Tomato' },
                { keyword: 'work', color: 'Grape' },
                { keyword: 'personal', color: 'Sage' },
                { keyword: 'gym', color: 'Blueberry' }
            ];
            const matched = fallbackRules.find(rule => matchesKeyword(value, rule.keyword));
            
            if (matched) {
                await setColor(matched.color);
            }
            return;
        }
        
        // Check if chrome.storage is available
        if (!chrome.storage.sync) {
            // Fallback to default rules if storage is not available
            const fallbackRules = [
                { keyword: 'meeting', color: 'Tomato' },
                { keyword: 'work', color: 'Grape' },
                { keyword: 'personal', color: 'Sage' },
                { keyword: 'gym', color: 'Blueberry' }
            ];
            const matched = fallbackRules.find(rule => matchesKeyword(value, rule.keyword));
            
            if (matched) {
                await setColor(matched.color);
            }
            return;
        }
        
        const data = await chrome.storage.sync.get({ rules: [] });
        const matched = data.rules.find(rule => matchesKeyword(value, rule.keyword));
        
        if (matched) {
            await setColor(matched.color);
        }
    } catch (error) {
        // If it's an extension context error, clean up and reinitialize
        if (error.message && error.message.includes('Extension context invalidated')) {
            cleanup();
        }
    } finally {
        // Reset processing flag after a delay
        setTimeout(() => {
            isProcessing = false;
        }, PROCESSING_TIMEOUT);
    }
}

// Debounced version of processInput
const debouncedProcessInput = debounce(processInput, DEBOUNCE_DELAY);

// Attach listener to input element
function attachInputListener(input) {
    if (input.dataset.listenerAttached) return;
    
    input.dataset.listenerAttached = 'true';
    
    const inputHandler = () => {
        debouncedProcessInput(input);
    };
    
    input.addEventListener('input', inputHandler);
    
    // Store reference for potential cleanup
    input._inputHandler = inputHandler;
}

// Find and process all input fields
function processInputFields() {
    const selector = INPUT_SELECTORS.join(', ');
    const inputs = document.querySelectorAll(selector);
    
    inputs.forEach(attachInputListener);
}

function initializeListeners() {
    // Clean up existing observer
    if (observer) {
        observer.disconnect();
        observer = null;
    }

    try {
        observer = new MutationObserver((mutations) => {
            // Check if any mutations are relevant to our inputs
            const hasRelevantChanges = mutations.some(mutation => {
                return mutation.type === 'childList' || 
                       (mutation.type === 'attributes' && 
                        mutation.attributeName === 'aria-label');
            });
            
            if (hasRelevantChanges) {
                processInputFields();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-label']
        });
        
        // Process existing inputs
        processInputFields();
    } catch (error) {
        // Silent error handling for production
    }
}

// Function to close all open menus
async function closeAllMenus() {
    try {
        // Press Escape key multiple times to ensure all menus are closed
        for (let i = 0; i < 2; i++) {
            document.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Escape',
                code: 'Escape',
                keyCode: 27,
                which: 27,
                bubbles: true
            }));
            await new Promise(resolve => setTimeout(resolve, CLICK_DELAY));
        }
    } catch (error) {
        // Silent error handling for production
    }
}

// === COLOR SELECTION LOGIC ===
async function setColor(colorName) {
    try {
        // Close any open menus first
        await closeAllMenus();
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));

        // Additional step: Close any open dropdowns by clicking outside
        try {
            // Click on the event title to close any open dropdowns
            const titleInput = document.querySelector('input[aria-label="Add title"], input[aria-label="Title"], input[jsname="YPqjbf"]');
            if (titleInput) {
                titleInput.focus();
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (e) {
            // Silent error handling
        }

        // Step 1: Try multiple selectors for the calendar button
        let calendarButtonSpan = null;
        const calendarSelectors = [
            '.YKPJ0b span.JyrDof',
            '[data-tooltip="Event color"]',
            '[aria-label*="color"]',
            '.VfPpkd-LgbsSe[aria-label*="color"]'
        ];
        
        for (const selector of calendarSelectors) {
            try {
                calendarButtonSpan = await waitForElement(selector, 2000);
                if (calendarButtonSpan) {
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (!calendarButtonSpan) {
            throw new Error('Could not find calendar color button with any selector');
        }
        
        if (!simulateClick(calendarButtonSpan)) {
            throw new Error('Failed to click calendar button');
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));

        // Step 2: Try multiple selectors for the color grid button
        let colorGridButton = null;
        const colorGridSelectors = [
            '.Z7vkvc',
            '[data-tooltip="More colors"]',
            '[aria-label*="More colors"]',
            '.VfPpkd-LgbsSe[aria-label*="More"]'
        ];
        
        for (const selector of colorGridSelectors) {
            try {
                colorGridButton = await waitForElement(selector, 2000);
                if (colorGridButton) {
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (!colorGridButton) {
            throw new Error('Could not find color grid button with any selector');
        }
        
        if (!simulateClick(colorGridButton)) {
            throw new Error('Failed to click color grid button');
        }
        
        await new Promise(resolve => setTimeout(resolve, 400));

        // Find and click the color option with retry logic
        let matchedOption = null;
        let attempts = 0;
        const maxAttempts = 5;
        
        while (!matchedOption && attempts < maxAttempts) {
            const colorOptions = document.querySelectorAll('div[role="menuitemradio"], div[role="radio"], [data-color-name]');

            matchedOption = Array.from(colorOptions).find(option => {
                const label = option.getAttribute('aria-label')?.toLowerCase() || '';
                const colorNameAttr = option.getAttribute('data-color-name')?.toLowerCase() || '';
                const title = option.getAttribute('title')?.toLowerCase() || '';
                
                // More flexible matching
                const searchTerm = colorName.toLowerCase();
                return label.includes(searchTerm) || 
                       colorNameAttr.includes(searchTerm) ||
                       title.includes(searchTerm);
            });

            if (!matchedOption && attempts < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
                attempts++;
            } else {
                break;
            }
        }

        if (!matchedOption) {
            throw new Error(`Could not find matching color option for: ${colorName}`);
        }
        
        // Try multiple click methods
        let clickSuccess = false;
        
        // Method 1: Direct click
        if (simulateClick(matchedOption)) {
            clickSuccess = true;
        } else {
            // Method 2: Try clicking parent element
            const parent = matchedOption.parentElement;
            if (parent && simulateClick(parent)) {
                clickSuccess = true;
            } else {
                // Method 3: Try programmatic selection
                try {
                    matchedOption.setAttribute('aria-checked', 'true');
                    matchedOption.click();
                    clickSuccess = true;
                } catch (e) {
                    // Silent error handling
                }
            }
        }
        
        if (!clickSuccess) {
            throw new Error('Failed to click color option');
        }

        // Wait for animations and close menus
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));
        await closeAllMenus();

        // Focus back on the event title input so user can continue editing
        // Add a longer delay to ensure menus are fully closed
        setTimeout(async () => {
            try {
                // Try multiple selectors to find the title input
                const titleSelectors = [
                    'input[aria-label="Add title"]',
                    'input[aria-label="Title"]', 
                    'input[jsname="YPqjbf"]',
                    'input[placeholder*="title"]',
                    'input[placeholder*="Add title"]'
                ];
                
                let titleInput = null;
                for (const selector of titleSelectors) {
                    titleInput = document.querySelector(selector);
                    if (titleInput) {
                        break;
                    }
                }
                
                if (titleInput) {
                    // Focus the input
                    titleInput.focus();
                    
                    // Wait a bit then position cursor at the end
                    setTimeout(() => {
                        try {
                            const length = titleInput.value.length;
                            titleInput.setSelectionRange(length, length);
                        } catch (e) {
                            // Silent error handling
                        }
                    }, 50);
                }
            } catch (e) {
                // Silent error handling
            }
        }, 200); // Longer delay to ensure menus are closed

        return true;
        
    } catch (error) {
        isProcessing = false;
        return false;
    }
}

// === SPA ROUTE WATCHER ===
function initializeUrlWatcher() {
    let lastUrl = location.href;
    
    urlCheckInterval = setInterval(() => {
        try {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                initializeListeners();
            }
        } catch (error) {
            cleanup();
        }
    }, URL_CHECK_INTERVAL);
}

// === CLEANUP FUNCTION ===
function cleanup() {
    try {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        
        if (urlCheckInterval) {
            clearInterval(urlCheckInterval);
            urlCheckInterval = null;
        }
        
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
            debounceTimeout = null;
        }
        
        // Clean up input listeners
        const inputs = document.querySelectorAll(INPUT_SELECTORS.join(', '));
        inputs.forEach(input => {
            if (input._inputHandler) {
                input.removeEventListener('input', input._inputHandler);
                delete input._inputHandler;
                delete input.dataset.listenerAttached;
            }
        });
        
    } catch (error) {
        // Silent error handling for production
    }
}

// === INITIAL STARTUP ===

// Check if extension context is valid
function isExtensionContextValid() {
    return typeof chrome !== 'undefined' && 
           chrome.runtime && 
           chrome.runtime.id;
}

// Initialize everything with retry logic
async function initializeExtension() {
    try {
        // Check if extension context is valid
        if (!isExtensionContextValid()) {
            return;
        }
        
        // Wait a bit for the page to be fully loaded
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                window.addEventListener('load', resolve, { once: true });
            });
        }
        
        // Clean up any existing listeners first
        cleanup();
        
        // Initialize listeners
        initializeListeners();
        initializeUrlWatcher();
    } catch (error) {
        // Only retry if extension context is still valid
        if (isExtensionContextValid()) {
            setTimeout(initializeExtension, 1000);
        }
    }
}

// Start initialization
initializeExtension();

// Run initialization again after a short delay to catch any dynamic content
setTimeout(() => {
    try {
        if (isExtensionContextValid()) {
            initializeListeners();
        }
    } catch (error) {
        // Silent error handling
    }
}, 1000);

// === CLEANUP ON UNLOAD ===
window.addEventListener('unload', cleanup);
window.addEventListener('beforeunload', cleanup);
