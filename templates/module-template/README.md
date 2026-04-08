# Module Template

Welcome! Use this template as a starting point for your new Knowledge Nexus module. 

## How to use this template

1. **Copy this folder**
   Copy the `module-template` folder and rename it to your module's name (e.g., `my-awesome-sim`).

2. **Move to the correct category**
   Move your new folder into the `modules/` directory under the appropriate category.
   If the category folder doesn't exist yet (e.g., `modules/biology/`), feel free to create it!
   
   *Example path:* `modules/physics/my-awesome-sim/index.html`

3. **Customize the content**
   Open `index.html` and customize the title, description, and the interactive portion of your code.
   - The template includes a link to `../../css/module-shared.css`. Ensure the relative path `../../` points back appropriately to the root `css` folder depending on your folder depth.

4. **Add to the Nexus Registry**
   Don't forget to register your module in `data/modules.json` at the root of the repository so it appears on the live website.

Happy coding!
