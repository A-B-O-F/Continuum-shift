## 🚀 Game Overview

In a distant future where digital consciousness travels through sub-atomic "Continuums," you are a Shift-Pilot. Your mission is to navigate the void. The environment is unstable; to pass through the **Frequency Portals**, you must synchronize your vessel's shape to match the gate. Fail to shift, and your integrity will crumble.

### Core Mechanics
- **Shape Shifting**: Toggle between **Cube**, **Pyramid**, and **Sphere**.
- **Combat**: Discharge neural pulses to clear breakable obstacles.
- **Diagnostic Phase**: Before every mission, you can personalizer differents parameters and save it as json then you can import json to configurate.
- **Integrity Management**: Collect cyan energy orbs to repair your hull.

---

## 🎮 Controls

| Action | Input |
| :--- | :--- |
| **Movement** | `W` `A` `S` `D` or `Arrow Keys` |
| **Neural Pulse (Shoot)** | `Space` `Mouse`|
| **Manual Shift (Cube)** | `1` |
| **Manual Shift (Pyramid)** | `2` |
| **Manual Shift (Sphere)** | `3` |
| **Camera: Follow** | `i` |
| **Camera: Cinematic High** | `o` |
| **Camera: Tactical Side** | `p` |

---

## 🛠 Technical Architecture

The project leverages a modern React-Three-Fiber stack with a focus on high-performance procedural generation.

- **Frontend Framework**: React 19
- **3D Engine**: Three.js via `@react-three/fiber`
- **State Management**: `Zustand` (Centralized game loop and mission status)
- **Styling**: Tailwind CSS (Futuristic HUD and Menu systems)
- **Scene Management**: 
    - **Procedural Generation**: Real-time sine-wave path calculation for infinite variation.
    - **Object Culling**: Distance-based rendering to maintain 60FPS.
    - **Lerp Animations**: Smooth camera transitions and vessel morphing logic.

---

## 📂 Project Structure

- `core/`: Game logic, type definitions, and Zustand state store.
- `config/`: Constant definitions for speeds, weapon stats, and level parameters.
- `world/`: Three.js components (Player, SceneManager, Obstacles, Bullets).
- `ui/`: React-based HUD and high-tech Menu overlays.
- `three/`: Renderer setup and global scene environment.

---

## 🔧 Installation & Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  **Build for Production**:
    ```bash
    npm run build
    ```

---
