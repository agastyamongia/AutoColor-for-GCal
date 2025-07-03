# Google Calendar Colorizer Chrome Extension

This Chrome extension automatically colors your Google Calendar events based on keywords in the event title.

## Features

- **Automatic Color-Coding:** Set rules to automatically color events as you type.
- **Customizable Rules:** Define your own keywords and associated colors.
- **Real-time Feedback:** See the color change instantly in the event creation pop-up.
- **Manual Override:** Easily select a different color if needed.

## How it Works

This extension automatically colors your Google Calendar events in real-time as you type the event title in the creation pop-up.

1.  **Create Event:** Open Google Calendar and click to create a new event.
2.  **Type Title:** As you type a title that includes one of your keywords, the extension will automatically:
    *   Open the color selection menu.
    *   Select the predefined color.
    *   Close the menu.
3.  **Color Applied:** The event's color in the pop-up will change instantly.

## For Developers

### DOM Selectors

The extension relies on specific DOM selectors to identify the event creation pop-up and its elements. If Google updates its interface, these selectors may need to be updated in `content.js`.

- **Event Title Input:** `[aria-label="Add title"]`
- **Color Buttons:** `[aria-label="Color Name"]` (e.g., `[aria-label="Tomato"]`)

### Reporting Issues

If you encounter any bugs or have suggestions for improvement, please open an issue on the project's GitHub repository.
