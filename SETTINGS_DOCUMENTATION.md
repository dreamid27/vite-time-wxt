# Settings Page Documentation

## Overview
The settings page allows users to customize their extension experience with theme preferences and custom redirection URLs.

## Features

### 🎨 Theme Settings
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on the eyes for low-light environments  
- **System Mode**: Automatically matches your system's theme preference
- Theme preference is persisted across browser sessions

### 🔗 Custom Redirection
- Set a custom URL where blocked sites will redirect
- Default: `https://www.goodreads.com/quotes/tag/positive-affirmations`
- URL validation ensures only valid URLs are accepted
- Test button allows you to preview the redirection URL
- Changes are applied immediately to the background script

### 🔄 Reset Functionality
- Reset all settings to their default values
- Includes both theme and redirection URL
- Confirmation through toast notifications

## Technical Implementation

### Database Schema
```typescript
interface Settings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  customRedirectionUrl: string;
  createdAt: string;
  updatedAt: string;
}
```

### Files Added/Modified
- `src/db/settings-db.ts` - Settings database with Dexie
- `src/store/settings-store.ts` - Zustand store for settings state
- `src/components/settings/settings.tsx` - Main settings UI component
- `src/store/navigation-store.ts` - Added 'settings' page type
- `src/components/app-sidebar.tsx` - Added Settings navigation item
- `src/entrypoints/options/App.tsx` - Added Settings page rendering
- `src/entrypoints/background.ts` - Updated to use custom redirection URL
- `src/components/theme-provider.tsx` - Fixed theme setter naming conflict

### Error Handling
- Graceful error handling with user-friendly toast messages
- Loading states during async operations
- Form validation for URL inputs
- Fallback to default settings if database operations fail

## Usage

1. **Access Settings**: Click "Settings" in the options page sidebar
2. **Change Theme**: Click Light, Dark, or System buttons
3. **Update Redirection URL**: Enter URL and click "Save Changes"
4. **Test URL**: Use "Test" button to open URL in new tab
5. **Reset Settings**: Click "Reset to Defaults" to restore original settings

## Integration with Background Script

The background script now dynamically loads the custom redirection URL from the settings database when blocking sites, replacing the previously hardcoded URL.

```typescript
// Get custom redirection URL from settings
const settings = await getSettings();
const redirectionUrl = settings.customRedirectionUrl;

// Redirect to the custom redirection URL
await browser.tabs.update(details.tabId, {
  url: redirectionUrl,
});
```
