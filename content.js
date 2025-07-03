// === MAIN INITIALIZATION ===
let observer = null;
let isProcessing = false;  // Add a flag to prevent double processing
let debounceTimeout = null; // For debouncing input events

// Utility to wait for an element to appear and be visible
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkElement = () => {
            const element = document.querySelector(selector);
            // Check if element exists and is visible (has width and height)
            if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Element ${selector} not found or not visible within ${timeout}ms`));
            } else {
                requestAnimationFrame(checkElement); // Use requestAnimationFrame for non-blocking checks
            }
        };

        checkElement();
    });
}

// Function to simulate a click more robustly
function simulateClick(element) {
    if (!element) return;
    // Try native click first
    element.click();

    // Fallback to more robust event dispatching if native click doesn't work
    setTimeout(() => {
        // Check if element is still in DOM and visible before dispatching fallback click
        if (element.offsetParent) {
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        }
    }, 50); // Small delay before fallback
}

function initializeListeners() {
    // Clean up existing observer if it exists
    if (observer) {
        observer.disconnect();
    }

    try {
        observer = new MutationObserver(mutations => {
            // Look for both new event creation and event editing
            const inputs = document.querySelectorAll('input[aria-label="Title"], input[aria-label="Add title"], input[jsname="YPqjbf"]');
            console.log("[Smart Colorizer] Found input fields:", inputs.length);
            
            inputs.forEach(input => {
                if (!input.dataset.listenerAttached) {
                    console.log("[Smart Colorizer] Attaching listener to input:", input.value);
                    input.dataset.listenerAttached = "true";

                    const inputHandler = async () => {
                        // Debounce the input event
                        clearTimeout(debounceTimeout);
                        debounceTimeout = setTimeout(async () => {
                            // Prevent double processing
                            if (isProcessing) {
                                console.log("[Smart Colorizer] Already processing an event, skipping");
                                return;
                            }
                            
                            const value = input.value.trim();
                            if (!value) return; // Skip if empty
                            
                            console.log("[Smart Colorizer] Input event triggered for:", value);
                            
                            try {
                                isProcessing = true;  // Set processing flag
                                
                                chrome.storage.sync.get({ rules: [] }, async data => {
                                    console.log("[Smart Colorizer] Retrieved rules:", data.rules);
                                    try {
                                        const matched = data.rules.find(rule =>
                                            value.toLowerCase().includes(rule.keyword.toLowerCase()) ||
                                            value.toLowerCase().includes(rule.keyword.toLowerCase() + ' ') // Match whole word
                                        );
                                
                                        if (matched) {
                                            console.log(`[Smart Colorizer] Matched keyword: "${matched.keyword}" → Color: "${matched.color}"`);
                                            await setColor(matched.color);
                                        } else {
                                            console.log("[Smart Colorizer] No matching rule found for:", value);
                                        }
                                    } catch (err) {
                                        console.warn("[Smart Colorizer] Error inside storage callback:", err);
                                    } finally {
                                        // Reset processing flag after a short delay
                                        setTimeout(() => {
                                            isProcessing = false;
                                        }, 1000);
                                    }
                                });
                            } catch (err) {
                                console.warn("[Smart Colorizer] Error accessing chrome storage:", err);
                                isProcessing = false;  // Reset processing flag on error
                                // Remove the invalidated listener
                                input.removeEventListener('input', inputHandler);
                                input.dataset.listenerAttached = "false";
                            }
                        }, 300); // Debounce for 300ms
                    };

                    // Attach the input event listener for real-time updates
                    input.addEventListener('input', inputHandler);
                }
            });
        });

        // Observe both DOM changes and subtree modifications
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-label']
        });
        console.log("[Smart Colorizer] Listeners initialized.");
    } catch (err) {
        console.warn("[Smart Colorizer] Error initializing observer:", err);
    }
}

// Function to close all open menus
async function closeAllMenus() {
    // Press Escape key multiple times to ensure all menus are closed
    for (let i = 0; i < 2; i++) {
        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true
        }));
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

// === COLOR SELECTION LOGIC ===
async function setColor(colorName) {
    try {
        console.log("[Smart Colorizer] Attempting to set color:", colorName);

        // First, close any open menus
        await closeAllMenus();
        await new Promise(resolve => setTimeout(resolve, 100));

        // Step 1: Click the main calendar/color section button
        let calendarButtonSpan;
        try {
            // Target the span within .YKPJ0b that has the jsaction
            calendarButtonSpan = await waitForElement('.YKPJ0b span.JyrDof', 3000); 
            console.log('[Smart Colorizer] Step 1: Found calendar button span. Clicking it.');
            simulateClick(calendarButtonSpan); // Use simulateClick
            await new Promise(resolve => setTimeout(resolve, 200)); // Short delay after click
        } catch (error) {
            console.warn(`[Smart Colorizer] ${error.message}`);
            console.warn('[Smart Colorizer] Could not find the main calendar button span or it was not visible.');
            return false;
        }

        // Step 2: Click the button that opens the color grid
        let colorGridButton;
        try {
            colorGridButton = await waitForElement('.Z7vkvc', 3000); // Wait up to 3 seconds
            console.log('[Smart Colorizer] Step 2: Found color grid button. Clicking it.');
            simulateClick(colorGridButton);
            await new Promise(resolve => setTimeout(resolve, 300)); // Longer delay for palette to render
        } catch (error) {
            console.warn(`[Smart Colorizer] ${error.message}`);
            console.warn('[Smart Colorizer] Could not find the color grid button or it was not visible.');
            return false;
        }

        // Find the color options
        const colorOptions = document.querySelectorAll('div[role="menuitemradio"], div[role="radio"]');
        console.log("[Smart Colorizer] Found color options:", {
            count: colorOptions.length,
            options: Array.from(colorOptions).map(opt => ({
                label: opt.getAttribute('aria-label'),
                checked: opt.getAttribute('aria-checked')
            }))
        });

        let matched = false;
        for (const option of colorOptions) {
            const label = option.getAttribute('aria-label')?.toLowerCase() || '';
            if (label.includes(colorName.toLowerCase())) {
                console.log("[Smart Colorizer] About to click color option:", label);
                simulateClick(option); // Use simulateClick for color option as well
                matched = true;
                console.log("[Smart Colorizer] Clicked color option");
                break;
            }
        }

        if (!matched) {
            console.warn("[Smart Colorizer] Could not find matching color option");
            return false;
        }

        // Wait a moment for any animations
        await new Promise(resolve => setTimeout(resolve, 100));

        // Close all menus after setting the color
        await new Promise(resolve => setTimeout(resolve, 100));
        await closeAllMenus();

        console.log(`[Smart Colorizer] Successfully set color to ${colorName}`);
        return true;
    } catch (err) {
        console.warn("[Smart Colorizer] Error in setColor:", err);
        isProcessing = false;  // Reset processing flag on error
        return false;
    }
}


// === SPA ROUTE WATCHER ===
let lastUrl = location.href;
const urlCheckInterval = setInterval(() => {
    try {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            console.log("[Smart Colorizer] URL changed. Re-initializing listeners.");
            initializeListeners();
        }
    } catch (err) {
        console.warn("[Smart Colorizer] Error in URL watcher:", err);
        clearInterval(urlCheckInterval);
    }
}, 1000);


// === INITIAL STARTUP ===
console.log("[Smart Colorizer] Extension starting up");
initializeListeners();

// Run initialization again after a short delay to catch any dynamic content
setTimeout(initializeListeners, 1000);

// === CLEANUP ON UNLOAD ===
window.addEventListener('unload', () => {
    try {
        if (observer) {
            observer.disconnect();
        }
        clearInterval(urlCheckInterval);
    } catch (err) {
        console.warn("[Smart Colorizer] Error during cleanup:", err);
    }
});
