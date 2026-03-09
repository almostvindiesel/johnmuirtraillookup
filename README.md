# JMT Permit Autofill — Chrome Extension

A Chrome extension that streamlines checking availability on Recreation.gov for John Muir Trail permits. It injects a floating control panel into supported permit pages, autofills your entry date and group size, and filters the availability table to show only the entry points of interest so you can see availability and snag a permit as soon as they become available.

<img width="3424" height="1328" alt="CleanShot 2026-03-07 at 16 51 58@2x" src="https://github.com/user-attachments/assets/d47100e6-c346-4ac7-a43f-9d0ff49c2d15" />

## Supported Permit Pages

The extension activates on three Recreation.gov permit pages, each with its own filtered routes:

### SOBO: Yosemite (permit 445859)
Start in Yosemite Valley, hike south (the most popular route)
- **703** — Happy Isles->Past LYV (Donohue Pass Eligible) <-- the one most people go after
- **884** — Lyell Canyon (Donohue Pass Eligible) <-- you'll miss roughly 20 miles of yosemite, but often easier to get

### NOBO: Mt. Whitney (permit 445860)
Start at Whitney Portal, hike north.
- **JM35** — Mt. Whitney Trail (Overnight)

### NOBO: Inyo National Forest (permit 233262)
Alternative southern entry points into the JMT/Golden Trout Wilderness. This adds distance, but these permits eas easier to get
- **JM39** — Cottonwood Lakes
- **GT60** — Cottonwood Pass

On the Inyo page, the extension also auto-answers the commercial guided trip question (No) and selects the Overnight permit type before filling the date and group size.

## Installation (Developer / Unpacked Mode)

Chrome does not require a Web Store listing to run a local extension.

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the folder containing `manifest.json` and the content scripts
5. The **JMT Autofill** extension will appear in your extensions list

Pin it to the toolbar via the puzzle-piece icon if you want quick access to the popup.

## Usage

1. Navigate to any of the supported permit pages (links above).

2. A floating **⛰️ JMT Autofill** panel appears automatically in the top-right corner. You can drag it by the header if it overlaps content.

3. Set your **Entry Date** and **Group Members** (1–8) in the panel. Both default to `2026-06-28` and `1`.

4. Click **▶ Autofill Now**. The extension will:
   - *(Inyo page only)* Select "No" for the commercial guided trip question and choose "Overnight" as the permit type
   - Open the calendar picker and navigate to the target month/day
   - Set the group size using the site's guest counter
   - Filter the availability table to show only the relevant entry points for that page

5. The status line below the button shows progress (`⏳ Filling…`, `📅 Date set!`) and confirms completion (`✅ 2026-06-28 · 1 person(s)`).

## Notes

- The extension only activates on the three Recreation.gov permit URLs listed above — it has no effect on any other page.
- If the page re-renders (React update, navigation), the panel re-injects itself automatically and the table filter re-runs.
- The default date pre-filled in the panel is `2026-06-28`; change it each session as needed.
