# Newsletter Story Reorderer

A drag-and-drop web app for reordering newsletter stories from Make.com before sending via Mailchimp. Built for daily newsletter workflows.

**Live App:** https://newsletter-reorderer-de9qrgsyo-jay-pfeifer-s-projects.vercel.app/

---

## Features

✅ **Drag-and-drop reordering** — Reorder stories within categories (Davidson, Higher Ed, Trades)  
✅ **Auto-outlet detection** — Automatically adds outlet nicknames (NYT, WSJ, WaPo, etc.) before headlines  
✅ **Live preview** — See what your email will look like as you reorder  
✅ **Editable outlet settings** — Add, edit, or delete outlet mappings on the fly  
✅ **Persistent settings** — All customizations saved to your browser  
✅ **Clean JSON export** — Copy reordered stories back to Make in one click  

---

## Daily Workflow

### Step 1: Run Make Workflow
1. In Make, trigger your "Today's Clips" workflow manually
2. It fetches stories from Raindrop, aggregates them, and stops

### Step 2: Export JSON from Make
1. Look at the **Text Aggregator** module output in Make
2. Copy the entire JSON array
   - Should look like: `[{...}, {...}, ...]`
   - NOT wrapped in extra braces

### Step 3: Paste into Reorderer
1. Open the reorderer app
2. Paste the JSON into the text box
3. Click **"Load Stories"**
4. Stories appear grouped by category (Davidson, Higher Ed, Trades)

### Step 4: Reorder Stories
1. **Drag cards** within each category to reorder
2. Click **"Show Preview"** to see how the email will look
3. Outlet names are auto-inserted before headlines

### Step 5: Export & Paste Back
1. Click **"Export JSON"** (copies to clipboard)
2. Go back to Make
3. Paste the JSON into your **Set Variable** module (the one waiting for reordered data)
4. Click **"Resume"** in Make
5. Workflow continues → TextAggregator → Mailchimp → sends!

---

## Settings

Click the **Settings button** (gear icon) in the top right to customize outlets.

### Edit Outlet Nicknames
- Each outlet has a domain and a nickname
- **Nicknames appear before headlines** in your email
- Edit any nickname directly in the settings table
- Changes save automatically to your browser

### Add New Outlets
1. Enter the **domain** (e.g., `example.com`)
2. Enter the **nickname** (e.g., `Example`)
3. Click **"Add"**
4. New outlet appears in your list and is used immediately

### Delete Outlets
- Click **"Delete"** next to any outlet to remove it
- It will no longer be recognized when parsing URLs

### Reset to Defaults
- Click **"Reset to Defaults"** to restore all original outlet mappings
- This erases any custom changes

---

## Current Outlet Mappings

| Domain | Nickname |
|--------|----------|
| nytimes.com | NYT |
| wsj.com | WSJ |
| washingtonpost.com | WaPo |
| bloomberg.com | Bloomberg |
| charlotteobserver.com | Charlotte Observer |
| newsobserver.com | Raleigh N&O |
| theatlantic.com | The Atlantic |
| people.com | People |
| chronicle.com | Chronicle |
| www-chronicle-com.proxy048.nclive.org | Chronicle |
| theguardian.com | The Guardian |
| insidehighered.com | Inside Higher Ed |
| timeshighereducation.com | Times Higher Ed |
| nature.com | Nature |
| science.org | Science |
| sciencedaily.com | Science Daily |

---

## Make Workflow Integration

### Required Make Modules

After your **BasicAggregator (Module 12)**, you need:

1. **Text Aggregator** (optional but helpful)
   - Outputs the JSON for copying
   - Field: `[{{12.array}}]`

2. **Set Variable** (required)
   - Stores the reordered JSON
   - Name: `ReorderedStories`
   - Waits for you to paste the reordered JSON

3. **TextAggregator** (existing)
   - Update references from `12.array` → `26.ReorderedStories` (or whatever module number your Set Variable is)
   - This makes it use the reordered stories

### Make Aggregated Fields

Your **BasicAggregator** should include these fields:
- `SortKey` — The category (1. Davidson, 2. Higher Ed, 3. Trades)
- `title` — The article headline
- `link` — The article URL
- `excerpt` — The article summary
- `tags` — The Raindrop tags
- `_id` — The unique ID

**Do NOT include** `ArticleBlock` or other large fields in the aggregator—the reorderer creates those fresh.

---

## Troubleshooting

### JSON won't load
- Check that it starts with `[` (square bracket), not `{` (curly brace)
- In Make, make sure your Text Aggregator field is: `[{{12.array}}]`
- The JSON should contain `link`, `title`, `excerpt`, `SortKey`, and `_id` fields

### Outlet names not showing
- Check the domain is spelled correctly in settings
- Make sure the URL in your JSON matches a mapped domain
- Go to Settings and verify the outlet exists

### Changes not saving
- Settings are stored in your **browser's localStorage**
- They only persist in the browser you're using
- Clearing your browser cache will reset them (you can reset to defaults if needed)
- Different browsers/devices = different settings

### Preview looks wrong
- The preview shows simplified HTML—it should match what Mailchimp renders
- If it looks drastically different, check your outlet nicknames

---

## Tips & Tricks

💡 **Save time on daily runs:**
- Pin the app in your browser
- Most days you'll just paste → drag a few → export → done
- Settings stay the same, so outlet names are automatic

💡 **Adding new outlets:**
- You don't need to ask for code updates
- Just add them in Settings whenever you discover a new source
- They'll be recognized immediately

💡 **Preview while reordering:**
- Click "Show Preview" to see how changes affect the email layout
- Helps catch formatting issues before sending

---

## Data & Privacy

- **All data is local to your browser** — nothing is sent to servers
- Settings (outlet mappings) are saved to your browser's localStorage
- When you paste JSON, it's only processed in your browser—never transmitted
- Clear your browser cache to reset settings (or use "Reset to Defaults" in Settings)

---

## Technical Details

- **Built with:** React 18, Lucide Icons
- **Hosted on:** Vercel (auto-deploys from GitHub)
- **Storage:** Browser localStorage for outlet settings
- **No external API calls** — fully client-side

---

## Questions or Issues?

If the app isn't working as expected:
1. Check the browser console (F12) for error messages
2. Try refreshing the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Try an incognito/private window to rule out cache issues
4. Reset settings to defaults if something got corrupted

---

**Last Updated:** May 26, 2026

