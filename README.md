# Vanilla JS Interactive Project

An interactive web project built with pure JavaScript (Vanilla JS), HTML5, and SCSS. The application features a custom routing system, nested navigation, interactive forms, and an image gallery with a lightbox, all without the use of heavy frontend frameworks.

## Live Demo

You can view the project live here:
**[Live Demo on Vercel](https://vanilla-js-interactive-project.vercel.app)**

## Key Features

- **Custom Router (SPA)**: Dynamic view loading without page reloads, based on pure JavaScript (`router.js`).
- **Advanced Navigation**: Nested menus tailored for both mobile and desktop devices (`navLogic.js`).
- **Gallery & Lightbox**: Image browsing using an interactive, responsive gallery component (`lBoxLogic.js`).
- **Form Handling**: Client-side data validation and processing in a contact form (`formLogic.js`).
- **Modern Build System**: Utilizing `esbuild` for fast JavaScript module bundling and `sass` for compiling stylesheets.

## Technologies Used

- HTML5
- CSS3 (SCSS compiled via Dart Sass)
- JavaScript (ES6+, Vanilla, no frameworks)
- Node.js (environment scripts)
- esbuild (JS module bundler)
- browser-sync (development server with live-reloading)

## Local Setup

To run the project on your local machine, follow the instructions below. Node.js must be installed on your system.

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/rafiquee3/vanilla-js-interactive-project.git
   ```

2. Navigate to the project directory:
   ```bash
   cd vanilla-js-interactive-project
   ```

3. Install the required dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```
   The project will automatically open in your default browser, and any changes to the HTML, SCSS, or JS files will be refreshed in real-time.

## Building for Production

To build a production version of the application ready for deployment (e.g., to Vercel, Netlify, or standard hosting), run the following script:

```bash
npm run build
```

This command will bundle the JS scripts into a single file (`bundle.js`), compile and minify the SCSS stylesheets into CSS, and copy the necessary static assets (HTML files and images) to the `dist` output folder.
