# LabZero: Online Lab Visualization

![LabZero Banner](https://img.shields.io/badge/LabZero-Virtual%20Laboratory-blue?style=for-the-badge)

LabZero is an interactive online platform designed to revolutionize science and mathematics education by visualizing complex laboratory experiments and concepts in a virtual, browser-based environment. It enables students to explore, interact with, and understand intricate scientific phenomena without the need for physical lab equipment.

## 🌟 Key Features

* **Interactive Simulations**: Live, dynamic simulations spanning Physics, Chemistry, Mathematics, and Biology.
* **Immersive 3D Library**: Explore dedicated 3D visualization windows with manual rotation, zooming, and interactive data labels (powered by Three.js).
* **Gesture-Based Interaction**: Integrated Gesture Controller using MediaPipe, allowing users to interact with 3D models and simulations using natural hand movements for an immersive, touchless experience.
* **Mathematical & Scientific Precision**: Real-time graphing, SVG-based vector visualizers, and complex calculations. Mathematical formulas are beautifully rendered using KaTeX.
* **User Authentication**: Secure Login & Signup system built with Supabase to provide a personalized learning experience and track student progress.
* **Offline Glossary & PWA Ready**: A local dictionary of scientific terminology available for offline study.
* **Knowledge Assessment**: Built-in quiz modules to test comprehension on various topics.

## 📚 Curriculum & Modules

LabZero currently supports 4 core disciplines with a continuously expanding library of interactive modules:

### ⚛️ Physics
* **Electromagnetism**: Interactive Faraday's Law simulation with real-time voltage graphing.
* **Optics**: Refraction of Light and Snell's Law visualizers.
* **Mechanics & Thermodynamics**: Conceptual visualizers for classical physics.

### 🧪 Chemistry (6+ Modules)
* **Atomic & Molecular Structure**: 3D visualizations of atoms and molecular bonding.
* **Periodic Trends**: Interactive periodic table analysis.
* **Quantum Numbers & Configuration**: Electron orbital filling simulators.

### 📐 Mathematics
* **Calculus**: Interactive Derivative and Definite Integral (Riemann Sums) simulators.
* **Linear Algebra**: Matrix transformation visualizer showing vector mapping and determinant scaling.
* **Geometry & Trigonometry**: Pythagoras theorem, Pi approximation, and Unit Circle / Sine Wave tracing.
* **Probability**: Law of Large Numbers visualizer via coin flips and die rolls.

### 🧬 Biology
* **Genetics**: Punnett Square lab simulating monohybrid and dihybrid crosses with real-time probability outputs.
* **Plant Physiology**: Transpiration and Photosynthesis chamber with interactive stomatal guard cells and oxygen output modeling.
* **Cell Biology & Microbiology**: 3D exploration of cellular anatomy.

## 🛠️ Technology Stack

### Frontend
* **Core**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS v4, Framer Motion (for UI micro-animations)
* **3D & Visualization**: Three.js, React Three Fiber, React Three Drei, D3.js, Recharts
* **Math Rendering**: KaTeX, react-katex
* **Machine Learning / Gestures**: MediaPipe Tasks Vision (`@mediapipe/tasks-vision`)

### Backend & Infrastructure
* **Backend Framework**: Django (Python)
* **Database & Auth**: Supabase (PostgreSQL, Supabase Auth)
* **API Integration**: Axios

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* Python (3.10+)
* A Supabase project for Authentication and Database.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the `Frontend` directory with your Supabase credentials and API URLs:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:8000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Apply migrations and run the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

## 🤝 Contributing
Contributions are welcome! If you'd like to add a new simulation module or improve an existing one, please fork the repository and submit a pull request.

## 📄 License
This project is licensed under the ISC License.