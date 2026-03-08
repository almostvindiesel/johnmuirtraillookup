# JMT Permit Autofill — Chrome Extension

A Chrome extension that streamlines checking availability on Recreation.gov for John Muir Trail overnight permits. It injects a floating control panel into the permit page, autofills your entry date and group size, and filters the availability table to show only the two routes of interest, saving you a few seconds when permits become available.

<img width="3424" height="1328" alt="CleanShot 2026-03-07 at 16 51 58@2x" src="https://github.com/user-attachments/assets/d47100e6-c346-4ac7-a43f-9d0ff49c2d15" />


## Filtered Routes

The extension hides all permit entry points except:

- **703** — Happy Isles->Past LYV (Donohue Pass Eligible)
- **884** — Lyell Canyon (Donohue Pass Eligible)

## Installation (Developer / Unpacked Mode)

Chrome does not require a Web Store listing to run a local extension.

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the folder containing `manifest.json`, `content.js`, and `popup.html`
5. The **JMT Autofill** extension will appear in your extensions list

Pin it to the toolbar via the puzzle-piece icon if you want quick access to the popup.

## Usage

1. Click the **JMT Autofill** icon in your toolbar (or use the link inside the popup) to open the Recreation.gov JMT permit page:
   `https://www.recreation.gov/permits/445859/registration/detailed-availability`

2. A floating **⛰️ JMT Autofill** panel appears automatically in the top-right corner of the page. You can drag it by the header if it overlaps content.

3. Set your **Entry Date** and **Group Members** (1–8) in the panel.

4. Click **▶ Autofill Now**. The extension will:
   - Open the calendar picker and navigate to the target month/day
   - Set the group size using the site's guest counter
   - Filter the availability table to show only routes ids=703 and 884, which are the most popular SOBO routest start in Yosemite Valley

5. The status line below the button shows progress (`⏳ Filling…`, `📅 Date set!`) and confirms completion (`✅ 2026-06-28 · 1 person(s)`).

## Notes

- The extension only activates on `https://www.recreation.gov/permits/445859/*` — it has no effect on any other site.
- If the page changes significantly (React re-render, navigation), the panel re-injects itself automatically and the table filter re-runs.
- The default date pre-filled in the panel is `2026-06-28`; change it each session as needed.
