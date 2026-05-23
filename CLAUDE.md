# Chelsea & Derek Wedding Site — Project Context

## What this is
A wedding website for Chelsea Chrystal and Derek Rajah.
Built with separate HTML / CSS / JS files (no framework).

## Key details
- **Couple:** Chelsea Chrystal & Derek Rajah
- **Date:** Saturday, July 31, 2027
- **Venue:** Rosehill Community Center, Mukilteo, Washington
- **Ceremony time:** 4:00 PM Pacific
- **RSVP deadline:** June 18, 2027

## Color palette
Sunset beach theme pulled from the couple's engagement photo (CD1.JPG — Mt. Baker shot):
soft beach blue → lavender → blush → peach → orange → coral → mauve → lilac → warm gold → cream

Hex values:
- Navy: #1c2e5e
- Coral: #e85c6a
- Yellow: #ffd84a
- Peach: #f4a54a
- Lilac: #d4a8d4
- Cream: #fdf6ee

## Fonts
- Display/headings: Cormorant Garamond (Google Fonts)
- Italic accents: Cormorant Infant
- Body/UI: Jost (light 200–300 weight)

## File structure
- index.html — Home page (hero, Our Story, Wedding Party, closing CTA)
- rsvp.html — RSVP form page
- style.css — Shared styles for all pages
- script.js — Nav scroll, mobile menu, countdown, RSVP form submit
- details.html — NOT BUILT YET (Travel, Registry, FAQs)
- CD1.JPG — Hero background photo (Mt. Baker engagement shot)
- CLAUDE.md — This file

## Pages built so far

### index.html
- Sticky frosted-glass nav with dropdowns:
  - Home → Our Story, Wedding Party (anchor links on index)
  - Details → Travel, Registry, FAQs (links to details.html)
  - RSVP pill button → rsvp.html
- Full-bleed hero: CD1.JPG background with parallax scroll effect
- Couple's names in Cormorant Garamond, date + location, live countdown timer
- Seamless gradient river below hero (one continuous .gradient-river div wrapping all sections)
- Our Story section — coming soon state only, no body text
- Wedding Party section — coming soon state only, placeholder silhouette icons
- Closing CTA: "With love & sunshine, we can't wait to celebrate with you." + big RSVP button
- Footer: "Designed with love by Danielle"

### rsvp.html
- Same nav as index
- Full gradient background (same sunset palette)
- Frosted glass card with full RSVP form:
  first name, last name, email, attendance radio (joyfully accepts / regretfully declines),
  guest count dropdown, dietary restrictions, song request, note for the couple
- Success state shown after submit
- Form does NOT send data anywhere yet — needs Formspree or similar wired up

## Design rules — always keep these consistent
- The gradient never resets between sections — it's one long seamless flow inside .gradient-river
- Countdown timer uses Jost sans-serif (NOT Cormorant) so numbers read cleanly
- Countdown bar is centered using full-width flex + inner pill wrapper (.countdown-inner)
- "Coming soon" pill buttons have NO bullet dot or any prefix character
- Nav label is "Details" — NOT "The Details"
- Footer credit: "Designed with love by Danielle" — no copyright symbol, no fake claim
- RSVP button always shows full date: "RSVP BY JUNE 18, 2027"
- The & ampersand is always styled in coral (#e85c6a) as a design accent
- Section titles use Cormorant Garamond italic, navy color
- No body text in Our Story or Wedding Party sections — just title + coming soon button

## Still to build
- details.html — long-form page with Travel, Registry, and FAQs sections
- Wire RSVP form to Formspree (free, no backend needed)
- Our Story full content (Chelsea & Derek to provide copy + photos)
- Wedding Party full content (names, roles, photos to come)
- Photo gallery (TBD)

## How to preview
No build tools needed. Open any .html file directly in a browser,
or use VS Code Live Server extension.