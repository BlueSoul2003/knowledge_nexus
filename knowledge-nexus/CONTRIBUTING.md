# Contributing to Knowledge Nexus

Thank you for your interest in contributing to **Knowledge Nexus**! This platform is designed to be an open sandbox for interactive educational modules, and your contributions are what make a difference.

## Repository Overview

Knowledge Nexus maintains a very clean and simple architecture. You will primarily interact with the following areas:

- `modules/` : This is where all community-contributed modules live. Modules are grouped into category folders (e.g., `modules/physics/`, `modules/economics/`).
- `data/modules.json` : The database file. After creating your module, you must add its metadata here so the website can display it.
- `templates/module-template/` : A starting template to help you develop your module easily while maintaining the platform's look and feel.
- `css/module-shared.css` : Pre-made shared styles that you can link to in your module so it automatically looks beautiful and consistent.

## Step-by-Step Submission Guide

### Step 1: Fork the Repository
Click the **Fork** button at the top right of this repository to create a copy in your own GitHub account. Clone your fork to your local machine.

```bash
git clone https://github.com/YOUR-USERNAME/knowledge-nexus.git
cd knowledge-nexus
```

### Step 2: Create Your Module Folder
1. Copy the folder `templates/module-template`.
2. Rename it to a descriptive name for your module (e.g., `orbital-mechanics`).
3. Move this folder into the appropriate category folder inside `modules/` (e.g., `modules/physics/orbital-mechanics`).
   - *Note: We intentionally keep category folders dynamic. If you are the first person to build a module for a category like `/biology/`, simply create the `modules/biology/` folder yourself!*

### Step 3: Write Your Code
Open `index.html` inside your new module folder. 
- You can use Vanilla Javascript, HTML Canvas, WebGL, or anything else, as long as it works within a simple frontend folder structure.
- Use the included `.module-container` styling to make your layout fit naturally within the Knowledge Nexus theme.

### Step 4: Add to the Nexus Registry
Once your module works locally, you need to register it. Open `data/modules.json` and append your module object to the `modules` array.

```json
{
  "id": "my-unique-module-id",
  "title": "Module Title",
  "category": "physics",
  "author": "Your Name or Handle",
  "description": "A very short description.",
  "link": "modules/physics/your-module/index.html",
  "thumbnailUrl": "URL to a thumbnail image to represent the module",
  "tags": ["Tag1", "Tag2"]
}
```

### Step 5: Test Locally
Ensure the grand landing page correctly displays and links to your new module.
```bash
python -m http.server 8000
# open http://localhost:8000 in your browser
```

### Step 6: Submit a Pull Request
Commit your changes, push to your fork, and open a Pull Request (PR) against the main repository.

## Design & UI Guidelines
- **Make it Beautiful**: The platform is built around dark mode and sleek visuals. Provide a clean UI for your simulation.
- **Responsiveness**: Ensure your module layout doesn't break on mobile devices.
- **Self-Contained**: Your module folder should contain all specific assets (images, additional scripts) it needs, so that it doesn't clutter the main repository structure.

We look forward to seeing what you build! Let's make learning intuitively understandable through play.
