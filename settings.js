const ruleForm = document.getElementById('rule-form');
const keywordInput = document.getElementById('keyword');
const colorSelect = document.getElementById('color');
const rulesList = document.getElementById('rules-list');

// Official Google Calendar colors (Name -> Hex)
const gcalColors = {
    'Tomato': '#d50000',
    'Tangerine': '#e67c73',
    'Mandarin': '#f4511e',
    'Banana': '#f6bf26',
    'Sage': '#33b679',
    'Basil': '#0b8043',
    'Peacock': '#039be5',
    'Blueberry': '#3f51b5',
    'Lavender': '#7986cb',
    'Grape': '#8e24aa',
    'Graphite': '#616161',
};

// Populate the color dropdown
for (const name in gcalColors) {
    const option = document.createElement('option');
    option.value = name; // Use the name as the value
    option.textContent = name;
    option.style.backgroundColor = gcalColors[name];
    option.style.color = 'white';
    option.style.textShadow = '0 0 2px black';
    colorSelect.appendChild(option);
}

// Load rules from storage and display them
function loadRules() {
  // Rules are stored as an array of objects: [{keyword: 'str', color: 'str'}]
  chrome.storage.sync.get({ rules: [] }, (data) => {
    const rules = data.rules;
    rulesList.innerHTML = '';
    rules.forEach((rule, index) => {
      const colorHex = gcalColors[rule.color] || '#cccccc';
      const ruleItem = document.createElement('li');
      ruleItem.innerHTML = `
        <div class="color-box" style="background-color: ${colorHex}"></div>
        <span class="keyword">${rule.keyword}</span>
        <span class="color-name">${rule.color}</span>
        <button class="delete-rule" data-index="${index}">Delete</button>
      `;
      rulesList.appendChild(ruleItem);
    });
  });
}

// Save a new rule
ruleForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const keyword = keywordInput.value.trim();
  const colorName = colorSelect.value;
  if (keyword) {
    chrome.storage.sync.get({ rules: [] }, (data) => {
      const rules = data.rules;
      // Prevent duplicate keywords
      const existingRuleIndex = rules.findIndex(r => r.keyword.toLowerCase() === keyword.toLowerCase());
      if (existingRuleIndex > -1) {
        rules[existingRuleIndex].color = colorName; // Update existing rule
      } else {
        rules.push({ keyword: keyword, color: colorName });
      }
      chrome.storage.sync.set({ rules }, () => {
        loadRules();
        keywordInput.value = '';
      });
    });
  }
});

// Delete a rule
rulesList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-rule')) {
    const indexToDelete = parseInt(e.target.dataset.index, 10);
    chrome.storage.sync.get({ rules: [] }, (data) => {
      let rules = data.rules;
      rules.splice(indexToDelete, 1);
      chrome.storage.sync.set({ rules }, loadRules);
    });
  }
});

// Initial load
loadRules();
