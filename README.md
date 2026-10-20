# Until Our Worlds Meet ✦

A cinematic, interactive birthday website created for **Bot** (Birthday: **November 8**).

---

## 🌌 Overview

"Until Our Worlds Meet" is a full-screen, chapter-based digital experience celebrating a long-distance connection with emotional authenticity, intimate storytelling, and a deep midnight aesthetic.

### Six Chapters
1. **The Invitation**: Gentle introduction into the midnight universe.
2. **Two Worlds**: Two glowing interactive planets ("Your world" & "My world") connected by a light trail.
3. **The Little Things**: An interactive gallery of memory objects (photo, genuine message, inside joke, personal note).
4. **A Voice from My World**: A custom audio player with animated waveforms and graceful placeholder fallback.
5. **Not Yet, But Someday**: An interactive 4-star constellation discovering future hopes without pressure or fixed dates.
6. **The Birthday Letter**: A warm ivory editorial letter with post-letter actions ("Listen to my voice again", "Read my letter again", and optional call link).

---

## 🎨 Personalization & Customization

All personal notes, titles, memories, and asset paths are centralized in **one single file**:

👉 **[`src/data/siteContent.ts`](src/data/siteContent.ts)**

### 1. Adding Your Voice Message
Place your audio recording into:
```text
public/audio/birthday-voice.mp3
```
- If the file exists, the player automatically enables playback, scrubbing, waveforms, and time display.
- If the file is missing, the player displays a graceful, friendly message without crashing.

### 2. Adding Photos & Screenshots
Place your images into:
```text
public/images/memories/
```
Then reference them in `src/data/siteContent.ts`:
```typescript
{
  id: "mem-photo",
  imagePath: "/images/memories/your-photo.webp",
  snippet: "...",
  revealedNote: "..."
}
```

### 3. Personal Notes on the Planets
In `src/data/siteContent.ts`, you can update `planets.herWorld.personalNote` and `planets.myWorld.personalNote`.

### 4. Optional Call Button
In `src/data/siteContent.ts`:
```typescript
contact: {
  enableCallOption: true,
  callUrl: "tel:+1234567890", // or WhatsApp link: "https://wa.me/..."
  callButtonText: "Call me when you're ready"
}
```

---

## 🚀 Running Locally

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```
The optimized bundle will be compiled into `dist/`.

---

## 🌐 Deployment (Vercel / Netlify)

This project is a standard React + Vite + TypeScript application ready for instant deployment:

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root, or push to a private Git repository and import it on [vercel.com](https://vercel.com).
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`

### Deploy to Netlify
1. Drag and drop the `dist/` folder into Netlify Drop, or connect via Git.
2. Build Command: `npm run build`
3. Publish Directory: `dist`
