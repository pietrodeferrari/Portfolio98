# Portfolio 98

Small and fun project I made during my spare time.

Made with [98.css](https://jdan.github.io/98.css/), plain HTML and vanilla JavaScript. Open `index.html` in a browser and it just works.

Every website section lives inside a draggable, resizable window.
You can open many windows at once, minimize them to the taskbar, stack them on top of each other and navigate between them exactly like you would on Windows.

The starter template is built around the idea of a personal portfolio, but you can customize it for your needs.

## Features

**Desktop**

- Drag windows by their title bar and resize them from any edge/corner
- Double-click a title bar to maximize or restore a window
- Minimize windows to the taskbar and restore them with a click
- Open multiple windows at once
- Desktop icons are freely draggable
- Each new window opens centred and cascades diagonally from the previous one
- Rubber-band selection on empty desktop
- Right-click context menu
- Win98 style SVG cursors

**Windows (replacing website pages)**

- **About:** three-tab layout for Bio, Skills (interactive table), and Interests
- **Projects:** expandable sidebar for category filtering. Double-clicking a project folder opens its detail view inside the same window, like Windows Explorer.
- **Contact:** form with client-side validation that you can use with Formspree, Netlify etc.
- **Blog:** articles list with date, title, and excerpt. Clicking a title opens the full post in-window and you can go back to the list.
- **Recycle Bin:** purely decorative (for now)
- **Privacy and Cookie Policy:** generic template text (open from the Start menu)

**Taskbar**

- Start menu with name, copyright and policy links
- Window buttons show what is open
- Address bar shows the path of the active window and an icon
- Dropdown lists all available windows
- Clock with date

**Mobile version**

- Single click opens windows and folders instead of double-click
- Only one window visible at a time (opening a new one closes the previous)
- Windows stack vertically

## Getting started

**1.** Click the green **Code** button and choose **Download ZIP**, then unzip the folder wherever you like. You can also clone the repository.

**2.** Open `index.html` in the browser.

**3.** If you want to make any changes look for the comments inside the code

**Basic and important things you should change:**

- Your name in the `<title>` tag and the `<meta name="description">`
- The welcome message and bio text
- Your projects (look for `<div class="project-folder">` with `data-*` attributes for title, description, tech stack and links)
- Your blog posts (look for `<article class="blog-post">`)
- The contact form endpoint if you plan to use it (see below)
- The Start menu (name, copyright year, VAT ID and policy links)
- The resume file (rename your PDF file and update the `href` of the desktop icon)

**About the Contact form**

The form has `action="#"` which means validation works but nothing gets delivered. To receive messages you can:

- create a free form at [formspree.io](https://formspree.io) and set `action="https://formspree.io/f/YOUR_ID"` on the `<form>` tag
- add `data-netlify="true"` to the `<form>` tag and deploy on Netlify
- any other option you prefer

**Deploy**

This is a static website so you can host it in any way you want.

## File structure

```
cursors/                SVG cursor files
fonts/                  MS Sans Serif web font used by 98.css
icons/                  PNG icons
98.css                  98.css Win98 UI bundled locally
CREDITS.md              Third-party licenses and asset notices
index.html              Windows and content live here
LICENSE                 Project's license
preview.png             Social sharing image for Open Graph and Twitter Cards
script.js               JS code
style.css               Custom styles
Your Name - Resume.pdf  Placeholder PDF (replace with yours)
```

## Some notes

- I used AI to generate some placeholder (fake) text used for windows, projects details and so on.
- I'm considering to add a "docs" file to the project for a full and detailed customization guide
- Mobile version still needs some adjustments and I will add some global improvements/features
- Feel free to let me know if you find bugs and/or want to suggest improvements


## Credits and license

This project uses [98.css](https://github.com/jdan/98.css) by Jordan Scales (MIT license), bundled locally as `98.css`.

The icons in the `icons/` folder and the MS Sans Serif font in `fonts/` are original Windows 98 assets that remain the intellectual property of Microsoft Corporation. They are included for personal and educational use only. See [CREDITS.md](CREDITS.md) for the full notice.

This template is released under the MIT license (Pietro De Ferrari, 2026). You are free to use, modify, and redistribute it for any non-commercial purpose.
