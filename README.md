<div align="left">
  <h1>Harmonix</h1>
  <p>
    High-performance offline music player for Windows 11 with 60fps audio visualizers, synchronized LRC lyrics &amp; 10-band graphic equalizer.
  </p>
  <p>
    <a href="https://github.com/zinkopiyush/harmonix/stargazers"><img
        src="https://img.shields.io/github/stars/zinkopiyush/harmonix?color=ffcb47&labelColor=black&logo=github&label=Stars" /></a>
    <a href="https://github.com/zinkopiyush/harmonix/releases"><img
        src="https://img.shields.io/github/downloads/zinkopiyush/harmonix/total?color=22c55e&labelColor=black&logo=github&label=Downloads" /></a>
    <a href="https://github.com/zinkopiyush/harmonix/releases/latest"><img
        src="https://img.shields.io/github/v/release/zinkopiyush/harmonix?color=8b5cf6&labelColor=black&logo=github&label=Latest%20Release" /></a>
    <a href="https://github.com/zinkopiyush/harmonix/releases/latest"><img
        src="https://img.shields.io/badge/Windows-11%2B-369eff?labelColor=black&logo=windows11&logoColor=white" /></a>
    <a href="https://github.com/zinkopiyush/harmonix/blob/main/LICENSE"><img
        src="https://img.shields.io/badge/License-MIT-6366f1?labelColor=black&logo=opensourceinitiative&logoColor=white" /></a>
  </p>
</div>

### [🚀 Download Latest Release](https://github.com/zinkopiyush/harmonix/releases/latest)

---

## ✨ Key Features

- ⚡ **Instant Loading & Zero-Lag Virtualization**: Loads 1,000+ local tracks in milliseconds without UI freezes or frame drops.
- 🎨 **Windows 11 Glassmorphism**: Centered album artwork with dynamic background glow matching cover colors.
- 🎵 **60fps Audio Visualizers**: 4 real-time visualizer modes (Spectrum Bars, Waveform, Circular Ring, Glow Pulsar).
- 📜 **Synchronized Lyrics (.lrc)**: Auto-scrolling LRC lyrics with click-to-seek playback.
- 🎛️ **10-Band Graphic Equalizer**: Web Audio API EQ with 10 presets (Bass Boost, Rock, Pop, Jazz, EDM, Vocal).
- 📱 **Floating Small Cover Mini Player**: Toggleable 360x450 compact desktop mini player window.
- 🖱️ **Double-Click Play & Right-Click Context Menu**: Spotify-style double click to play with rich right-click context menus.
- 📂 **Folder Browser & Custom Playlists**: Scan local directories, set 1:1 cropped playlist artwork, and manage custom playlists.
- ✋ **Native Windows Media Integration**: Hooked into Windows 11 System Media Transport Controls for hardware media keys, Bluetooth buttons, and 4-finger sliding touchpad gestures.
- 🔄 **Drag-and-Drop Play Queue**: Smoothly reorder your "Up Next" songs with intelligent auto-scrolling.
- ♾️ **Robust Infinite Scroll**: Navigate massive library collections flawlessly without DOM bloating.
- 🎹 **Global Keyboard Shortcuts**: Instant hotkeys for playback, volume, shuffle, mute, and search.

---

## 📦 Downloads (`.exe`)

| Executable Package | Description | Download |
| :--- | :--- | :--- |
| **Harmonix Standard Installer** | Standard Windows setup installer. Adds Harmonix to your **Windows Start Menu** and **Desktop**. | [Download `.exe`](https://github.com/zinkopiyush/harmonix/releases/download/v1.0.1/Harmonix%20Setup%201.0.1.exe) |
| **Harmonix Standalone Portable** | Portable single-file executable. Runs instantly anywhere **without installation**. | [Download `.exe`](https://github.com/zinkopiyush/harmonix/releases/download/v1.0.1/Harmonix-Standalone.exe) |

---

## 🎹 Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Toggle Play / Pause |
| `Left Arrow` | Skip 10 Seconds Backward |
| `Right Arrow` | Skip 10 Seconds Forward |
| `Ctrl + Left Arrow` | Play Previous Track |
| `Ctrl + Right Arrow` | Skip to Next Track |
| `Up Arrow` | Increase Volume (+5%) |
| `Down Arrow` | Decrease Volume (-5%) |
| `Mouse Wheel on Volume Bar` | Adjust Volume Level |
| `M` | Toggle Mute |
| `S` | Toggle Shuffle Mode |
| `R` | Toggle Repeat Mode (Off → All → One) |
| `Ctrl + F` | Focus Search Input |

---

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary>Is Harmonix completely free and offline?</summary>

_Yes. Harmonix is 100% free and open-source. It operates completely offline on your local computer. No internet connection, account login, or subscription is required._

</details>

<details>
<summary>Which audio file formats are supported?</summary>

_Harmonix supports MP3, FLAC, WAV, AAC, M4A, OGG, and WebM audio formats._

</details>

<details>
<summary>How do I import my local music library?</summary>

_Click the **"+ Folder"** button in the top bar to scan any folder on your PC, or click **"+ Files"** to select individual audio files._

</details>

<details>
<summary>Why does Windows Defender show a SmartScreen popup when launching?</summary>

_This is normal for newly built community open-source executables that do not have a paid digital code-signing certificate. Click **"More Info"** and then click **"Run Anyway"**._

</details>

---

## 🛠️ Development & Building from Source

```bash
# 1. Clone the repository
git clone https://github.com/zinkopiyush/harmonix.git
cd harmonix

# 2. Install dependencies
npm install

# 3. Start development desktop app
npm start

# 4. Build Windows .exe installer binaries
npm run electron:build
```

---

> [!TIP]
> **Star Us** on GitHub to receive release updates and new feature notifications!
