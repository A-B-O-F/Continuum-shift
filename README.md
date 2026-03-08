# Continuum Shift

> A browser-based 3D arcade game built with React, Three.js, and Zustand.

---

## 🚀 Game Overview

In a distant future where digital consciousness travels through sub-atomic "Continuums," you are a Shift-Pilot. Your mission is to navigate the void. The environment is unstable; to pass through the **Frequency Portals**, you must synchronize your vessel's shape to match the gate. Fail to shift, and your integrity will crumble.

### Core Mechanics
- **Splash Screen**: An animated ASCII typewriter intro greets you on launch, complete with CRT scanline effects. Click **GAME START** to engage.
- **Shape Shifting**: Toggle between **Cube**, **Pyramid**, and **Sphere**.
- **Combat**: Discharge neural pulses to clear breakable obstacles.
- **Diagnostic Phase**: Before every mission, customize parameters and export/import them as JSON for persistent configuration.
- **Integrity Management**: Collect cyan energy orbs to repair your hull.

---

## 🎮 Controls

| Action | Input |
| :--- | :--- |
| **Movement** | `W` `A` `S` `D` or `Arrow Keys` |
| **Neural Pulse (Shoot)** | `Space` / `Mouse Click` |
| **Manual Shift (Cube)** | `1` |
| **Manual Shift (Pyramid)** | `2` |
| **Manual Shift (Sphere)** | `3` |
| **Camera: Follow** | `i` |
| **Camera: Cinematic High** | `o` |
| **Camera: Tactical Side** | `p` |

---

## 🎵 Music System

The game features a context-aware dynamic soundtrack managed by `useMusicManager`:

| Context | Track |
| :--- | :--- |
| Main Menu / Splash | `main-menu.mp3` |
| Level Mode | `level1.mp3` |
| Endless Mode | `endless-mode.mp3` |

- Tracks switch automatically based on game status and mode.
- Replays after a short delay (2.5 s) when a track ends.
- Handles browser autoplay restrictions: music unlocks on the first user interaction.

---

## 🛠 Technical Architecture

The project leverages a modern React-Three-Fiber stack with a focus on high-performance procedural generation.

- **Frontend Framework**: React 19
- **3D Engine**: Three.js `v0.182` via `@react-three/fiber`
- **State Management**: `Zustand` (centralized game loop and mission status)
- **Build Tool**: Vite 6
- **Scene Management**:
  - **Procedural Generation**: Real-time sine-wave path calculation for infinite variation.
  - **Object Culling**: Distance-based rendering to maintain 60 FPS.
  - **Lerp Animations**: Smooth camera transitions and vessel morphing logic.

---

## 📂 Project Structure

```
continuum-shift-v6/
├── core/           # Game logic, types, Zustand store, music manager
├── config/         # Constants (speeds, weapon stats, level parameters)
├── world/          # Three.js scene components (Player, SceneManager, Obstacles, Bullets)
├── ui/             # React HUD, Menu, and SplashScreen overlays
├── three/          # Renderer setup and global scene environment
├── music/          # Audio tracks (main-menu, level1, endless-mode)
└── docs/           # Production build for GitHub Pages deployment
```

---

## 🔧 Installation & Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run development server** (available at `http://localhost:3000`):
   ```bash
   npm run dev
   ```
4. **Build for production**:
   ```bash
   npm run build
   ```
5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 🌐 Deployment

The project is deployed to **GitHub Pages** via the `docs/` folder.
The Vite base path is configured to `/Continuum-shift/`.

---
