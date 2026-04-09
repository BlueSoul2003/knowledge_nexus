# Knowledge Nexus

**[🌍 Visit the Live Site Here](https://bluesoul2003.github.io/knowledge_nexus/)**

Welcome to **Knowledge Nexus**! This is an open-source, interactive repository of knowledge bridging various domains like Physics, Economics, Business, Management, Psychology, Metaphysics (玄學), 3D Printing, Electronics, and more. 

## Vision
The goal is to move beyond static textbooks. Knowledge Nexus serves as a *grand landing page* that hosts standalone, interactive HTML modules created by learners, educators, and researchers around the world.

## Repository Structure

The current structure of the repository is modular and easy to navigate:

```text
Knowledge_Nexus/
├── .project-docs/     # Project documentation, architecture plans, and SQL migration files
├── css/               # Core global stylesheets for the grand landing page
├── data/              # JSON databases containing the module registry and other site data
├── js/                # Global JavaScript logic (authentication, module loading, UI interactions)
├── modules/           # 📚 The core directory containing all learning modules (e.g., physics-nexus)
├── templates/         # Starter templates for developers to easily create new modules
├── index.html         # The grand landing page of Knowledge Nexus
├── CONTRIBUTING.md    # Detailed guidelines for contribution
└── README.md          # This file
```

## How to Add a Module

We enthusiastically welcome community contributions! Since the project architecture is purely static frontend web technology (HTML/CSS/JS), it's straightforward to add your own module.

Here is a quick guide to publishing your interactive module:

### Step 1: Create Your Module Folder
1. Copy the template folder located at `templates/module-template`.
2. Rename the folder to something descriptive (e.g., `orbital-mechanics`).
3. Move this folder into an appropriate category folder inside `modules/`. For example, `modules/physics/orbital-mechanics`.
   > *Note: If your category doesn't exist yet, simply create the folder (e.g., `modules/biology/`)!*

### Step 2: Write Your Interactive Code
Open `index.html` inside your new module folder.
- You can build your module using Vanilla JS, HTML Canvas, WebGL, or any library that runs on the frontend.
- Utilize the provided `.module-container` styling to seamlessly integrate with the Knowledge Nexus theme.
- Ensure your module doesn't rely on complex backend requirements. It should function completely standalone inside its directory.

> 🤖 **Not a programmer?** You can easily use AI to write this code for you! Check out the [Contribution Guide](CONTRIBUTING.md) for a copy-paste AI prompt you can use to generate your module instantly.

### Step 3: Register Your Module
Once your module is functional, you must register it so the main landing page can index and display it.
Open `data/modules.json` and add a new entry to the `modules` array:

```json
{
  "id": "my-awesome-module",
  "title": "My Awesome Module",
  "category": "physics",
  "author": "Your Name",
  "description": "A short, engaging description of what your module teaches.",
  "link": "modules/physics/my-awesome-module/index.html",
  "thumbnailUrl": "URL to a thumbnail image",
  "tags": ["Simulation", "Physics"]
}
```

### Step 4: Test Locally & Open a PR
1. Serve the project locally to verify everything works:
   ```bash
   npx serve .
   # or
   python -m http.server
   ```
2. Visit `http://localhost:3000` (or `8000`) and ensure your module card appears properly on the main page.
3. Commit your changes, push to your fork, and open a **Pull Request (PR)** against this repository!

*For more advanced details on styling rules or the project architecture, please see the [CONTRIBUTING.md](CONTRIBUTING.md).*
