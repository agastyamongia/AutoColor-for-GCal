# GCal Colorizer - Chrome Extension

🎨 **Automatically color-code your Google Calendar events as you type!** No more manual color selection - just type keywords and watch your events get colored instantly.

## ✨ Features

- **🚀 Real-time Color Coding:** Events are colored instantly as you type keywords in the title
- **⚙️ Customizable Rules:** Create your own keyword-to-color mappings
- **🎯 Smart Matching:** Supports partial keyword matching and case-insensitive detection
- **🔄 Persistent Settings:** Your rules are saved and synced across devices
- **🎨 Google Calendar Colors:** Uses official Google Calendar color palette
- **⚡ Performance Optimized:** Efficient DOM monitoring with debounced input processing

## 🚀 How It Works

1. **Install the Extension** - Add to Chrome and navigate to Google Calendar
2. **Configure Rules** - Click the extension icon to set up keyword-color pairs
3. **Create Events** - Type keywords in event titles and watch colors apply automatically
4. **Enjoy Efficiency** - No more manual color selection for repetitive event types!

### Example Rules
- `meeting` → 🍅 Tomato (red)
- `work` → 🍇 Grape (purple) 
- `personal` → 🌿 Sage (green)
- `gym` → 🫐 Blueberry (blue)

## 📦 Installation

### From Chrome Web Store
1. Visit the Chrome Web Store (link coming soon)
2. Click "Add to Chrome"
3. Navigate to [Google Calendar](https://calendar.google.com)
4. Start creating events with your keywords!

### Manual Installation (Development)
1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. Navigate to Google Calendar and start using!

## 🛠️ Technical Details

### Architecture
- **Manifest V3** - Modern Chrome extension architecture
- **Content Scripts** - Real-time DOM monitoring and interaction
- **Background Service Worker** - Extension lifecycle management
- **Chrome Storage API** - Cross-device rule synchronization

### Key Components

#### `content.js` - Main Logic
- Real-time input monitoring with debouncing
- Smart DOM element detection and interaction
- Robust error handling and fallback mechanisms
- SPA route change detection for dynamic content

#### `settings.js` - User Interface
- Rule management interface
- Color selection with visual previews
- Input validation and XSS protection
- Responsive design with Material Design principles

#### `background.js` - Extension Management
- Default rule initialization for new installations
- Extension lifecycle event handling
- Storage management and synchronization

### Supported Google Calendar Colors
- 🍅 Tomato, 🍊 Tangerine, 🔥 Flamingo, 🍌 Banana
- 🌿 Sage, 🌱 Basil, 🦚 Peacock, 🫐 Blueberry
- 💜 Lavender, 🍇 Grape, ⚫ Graphite

## 🔧 Configuration

### Adding Custom Rules
1. Click the extension icon in your browser toolbar
2. Enter a keyword (e.g., "client meeting")
3. Select a color from the dropdown
4. Click "Add Rule"
5. Your rule is now active!

### Rule Management
- **Edit:** Add the same keyword with a new color to update
- **Delete:** Click the "Delete" button next to any rule
- **Sync:** Rules automatically sync across all your devices

## 🐛 Troubleshooting

### Common Issues

**Extension not working on Google Calendar:**
- Ensure you're on `https://calendar.google.com`
- Refresh the page and try again
- Check that the extension is enabled

**Colors not applying:**
- Verify your keyword is spelled correctly
- Check that the rule is active in settings
- Try refreshing the page

**Settings not saving:**
- Check Chrome storage permissions
- Try refreshing the extension
- Clear browser cache if needed

## 🛡️ Privacy & Security

- **No Data Collection:** The extension doesn't collect or transmit any personal data
- **Local Processing:** All keyword matching happens locally in your browser
- **Secure Storage:** Rules are stored securely using Chrome's storage API
- **Open Source:** Full transparency with publicly available source code

## 🤝 Contributing

We welcome contributions! Please feel free to:
- Report bugs or suggest features
- Submit pull requests for improvements
- Help improve documentation

### Development Setup
1. Fork the repository
2. Make your changes
3. Test thoroughly on Google Calendar
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Google Calendar team for the excellent API
- Chrome Extensions team for the powerful platform
- All contributors and users who provide feedback

---

**Made with ❤️ for productivity enthusiasts everywhere**
