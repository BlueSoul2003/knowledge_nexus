# Contributing to Knowledge Nexus

First off, thank you for your interest in contributing to **Knowledge Nexus**! This platform is designed to be an open sandbox for interactive educational modules. We want learning to be playful, visual, and engaging.

Our core philosophy is **simplicity**. There are no complex build steps, no webpack, no React, and no `npm install`. The entire repository is built on static HTML, CSS, and vanilla JavaScript. If you know the basics of web development, you are ready to contribute!

---

## 🏗️ Repository Architecture

Knowledge Nexus maintains a very clean, straightforward architecture meant entirely to host isolated HTML modules.

- **`index.html`**: The Grand Landing Page where users navigate our content.
- **`data/modules.json`**: The central registry file. When you add a new module to the platform, you register its metadata here so that the main landing page dynamically shows it.
- **`modules/`**: This is where all the actual module files live, categorized into subjects (e.g., `modules/physics/`, `modules/economics/`).
- **`templates/module-template/`**: A boilerplate folder giving you a massive head start on styling and structuring new modules.
- **`css/module-shared.css`**: Provided global styles you can link inside your module so that it automatically matches the beautiful dark-mode aesthetic of Knowledge Nexus.

---

## 👩‍💻 Step-by-Step Submission Guide

Ready to build something? Here's exactly how.

### Step 1: Fork the Repository

1. Navigate to [BlueSoul2003/knowledge_nexus](https://github.com/BlueSoul2003/knowledge_nexus).
2. Click the **Fork** button at the top right to create a copy in your own GitHub account.
3. Clone your fork to your local machine:

```bash
git clone https://github.com/YOUR-USERNAME/knowledge_nexus.git
cd knowledge_nexus
```

### Step 2: Create Your Module Folder

We do not want you to start from scratch. 

1. Duplicate the `templates/module-template/` directory.
2. Rename this new directory to uniquely describe your module (e.g., `orbital-mechanics`).
3. Move your folder into the relevant category under `modules/` (e.g., `modules/physics/orbital-mechanics/`).
   > *Note: If you are the first to build a module for a new category like chemistry, simply create the `modules/chemistry/` folder yourself.*

### Step 3: Write Your Code

Open the `index.html` file inside your new module folder and let your creativity loose.

- You can use Vanilla JS, HTML `<canvas>`, WebGL, or any tool that runs strictly in the browser.
- **IMPORTANT**: Link `../../css/module-shared.css` (or adapt the relative path based on your folder depth) in your module's HTML to automatically inherit the global Knowledge Nexus theme (buttons, typography, colors).
- Ensure your module doesn't rely on server-side logic (`Node`, `Python` backend, etc.). It must run statically.

### Step 4: Register in the Database

Once your module works in isolation, you need to tell the Grand Landing Page that it exists! 

Open `data/modules.json` and add a new object to the `modules` array. Below is the required schema:

```json
{
  "id": "orbital-mechanics",                      // A unique string identifier
  "title": "Orbital Mechanics Simulator",         // The title shown on the card
  "category": "physics",                          // Which subject folder this belongs to
  "author": "Your Name/Handle",                   // Give yourself credit!
  "description": "Learn how satellites orbit.",   // 1-2 sentence description
  "link": "modules/physics/orbital-mechanics/index.html", // Relative path to your module base
  "thumbnailUrl": "path/to/your/thumbnail.png",   // Provide an image so the card looks nice
  "tags": ["space", "gravity", "physics"]         // Searchable tags
}
```

*Tip: Store your thumbnail image directly inside your module's folder (`modules/physics/orbital-mechanics/thumbnail.png`) and link it accordingly.*

### Step 5: Test Locally

Test your integration locally through any simple HTTP server:

```bash
# Example using Python 3
python -m http.server 8000

# Example using Node x npx serving
npx serve .
```

- Open `http://localhost:8000` in your web browser.
- Ensure your new module appears on the main page.
- Click on it and ensure the link successfully routes to your module.

### Step 6: Submit a Pull Request

Once everything is working perfectly, it's time to share it with the world!

1. Format your code and clean up any unused dummy files.
2. Commit your changes:
   ```bash
   git add .
   git commit -m "feat(physics): Add new Orbital Mechanics module"
   ```
3. Push to your forked repository:
   ```bash
   git push origin main
   ```
4. Go back to the original repository on GitHub, and open a **Pull Request (PR)**!

---

## 🤖 Not a Developer? Let AI Build it For You!

If you have a great idea for an interactive module but aren't comfortable with coding, you can easily use AI (like ChatGPT, Claude, or Gemini) to write the code for you! 

Simply copy and paste this prompt into your favorite AI, replacing the bracketed text with your idea:

> **Prompt for AI:**
> "I want to build an educational interactive HTML module for a platform called Knowledge Nexus. The topic is: **[Insert your topic, e.g., Supply and Demand economics, or How Pulleys Work]**.
> 
> Please write a single, self-contained `index.html` file that includes all the HTML, CSS, and Vanilla JavaScript needed to make this interactive.
> 
> Requirements:
> 1. Use a dark mode aesthetic (dark gray/black background, vibrant accents).
> 2. Include a container with the class `module-container` wrapping the main content.
> 3. Make sure the simulation/interaction is highly visual and user-friendly (e.g., using sliders, drag-and-drop, clickable buttons, or HTML Canvas).
> 4. Ensure it can run completely statically in the browser without any build tools, React, or server/backend.
> 5. Add a link tag to `../../css/module-shared.css` in the `<head>`."

Once the AI generates the code, simply paste it into your `index.html` file described in Step 3, tweak it to your liking, and you're good to go!

---

## 🎨 Design & UI Guidelines

To keep the platform's user experience incredibly premium, try to adhere to these UX/UI goals:

1. **Dark Mode First**: Knowledge Nexus is defined by a sleek, neon-on-dark aesthetic. Utilize the provided variables in `css/module-shared.css`.
2. **Make it Interactive**: Avoid walls of text. If something can be shown through an interactive slider, dragging, or a button, do that.
3. **Responsiveness**: Many users will be on their phones. Ensure your layouts flex well, avoiding rigidly fixed widths.
4. **Self-Containment**: Save all your `images`, `scripts`, and specific `styles` inside your module's own folder. Do not pollute the root directories unless it explicitly benefits the broader project.

We can't wait to see what you create. Happy coding!
