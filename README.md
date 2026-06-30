# Obsidian Game Search

Obsidian Game Search is a plugin that allows you to easily pull video game metadata from the IGDB (Internet Game Database) API and automatically generate beautifully formatted markdown notes in your vault based on your own custom templates.

## Features
- **Single Import:** Quickly search for a game and instantly generate a note for it.
- **Bulk Import:** Search and add multiple games to a staging queue, then import them all at once.
- **Conflict Resolution:** If a game note already exists, the plugin will pause and allow you to rename the new note.
- **Custom Templates:** Fully customize how your game notes look using simple `{{variable}}` tags in a markdown template.
- **Rich Metadata:** Pulls in titles, release dates, developers, publishers, genres, platforms, ratings, cover images, and more.

## Setup & Configuration

To use this plugin, you will need to provide it with your own IGDB API credentials (provided by Twitch). 

### 1. Get your IGDB API Credentials
1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console).
2. Log in with your Twitch account.
3. Navigate to **Applications** and click **Register Your Application**.
4. Give it a name (e.g., `ObsidianGameSearch`), set the OAuth Redirect URL to `http://localhost`, and select a category (e.g., `Application Integration`).
5. Click **Create**.
6. Click **Manage** next to your new application to view your **Client ID**.
7. Click **New Secret** to generate your **Client Secret**.

### 2. Configure the Plugin
1. Open your Obsidian Settings and go to the **Game Search** plugin options.
2. Paste your **Client ID** and **Client Secret** into the respective fields.
3. Select your **Template File Path** (the markdown file you want to use as a blueprint).
4. Select your **Destination Folder** (where you want the new game notes to be saved).

## Using Templates

Create a markdown file in your vault to act as your template. You can format it however you like. Insert the following variables into your template, and the plugin will automatically replace them with the actual game data when a note is generated:

- `{{title}}` - The name of the game
- `{{summary}}` - Game description/summary
- `{{release_date}}` - Initial release date (YYYY-MM-DD)
- `{{developer}}` - Developer company name
- `{{publisher}}` - Publisher company name
- `{{genres}}` - Comma-separated list of genres
- `{{platforms}}` - Comma-separated list of platforms
- `{{cover_image}}` - URL to the cover image
- `{{rating}}` - Average user rating (e.g. 85)
- `{{aggregated_rating}}` - Average critic rating (e.g. 90)
- `{{storyline}}` - Brief plot description
- `{{game_modes}}` - Comma-separated list of game modes
- `{{themes}}` - Comma-separated list of themes
- `{{franchise}}` - The franchise or collection the game belongs to
- `{{url}}` - IGDB URL for the game
- `{{screenshots}}` - Comma-separated list of high-quality screenshot URLs
- `{{similar_games}}` - Comma-separated list of similar games

**Example Template:**
```markdown
# {{title}}
**Developer:** {{developer}}
**Publisher:** {{publisher}}
**Release Date:** {{release_date}}
**Genres:** {{genres}}
**Platforms:** {{platforms}}
**Rating:** {{rating}}/100

![Cover Image]({{cover_image}})

## Summary
{{summary}}
```

## How to Use
- **Single Import:** Click the Gamepad icon in your left ribbon, or use the Command Palette to run `Game Search: Single Import`. Search for a game, click it, and the note is immediately created.
- **Bulk Import:** Open the Command Palette and run `Game Search: Bulk Import`. Search for games and click "Add" to queue them up. When you are ready, click "Import All Staged Games" to generate all the notes in sequence.
