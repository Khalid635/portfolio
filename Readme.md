# Khalid Bin Masud - Portfolio

Personal portfolio built with plain HTML, CSS and JavaScript on top of Bootstrap 5.
Live: https://khalidbinmasud-portfolio.netlify.app/

## What's inside

- Dark and light theme (saved in `localStorage`)
- Projects: Swift Logistics, CocktailHub, Expense Tracker API
- Skills, Codeforces and GitHub activity sections
- Contact form (Formspree) and resume download
- Installable PWA with an offline fallback (service worker)
- SEO basics: meta description, Open Graph / Twitter cards, JSON-LD

## Files

```
index.html            page markup
style.css             styles and theme variables
script.js             theme, navigation, form, resume download, animations
service_worker.js     offline cache
manifest.json          PWA manifest
admin_panel.png        Swift Logistics screenshot
CocktailHub.png        CocktailHub screenshot
phitron-certificate.webp   Phitron certificate image
og-image.png           social share preview (1200x630)
Profile_picture.jpg    profile photo
icon-*.png             app icons
Khalid_Bin_Masud_Resume.pdf   resume (must be in the same folder)
```

## Run locally

Service workers need HTTP, so don't open `index.html` by double-clicking:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy (Netlify)

Drag the folder into Netlify, or connect the GitHub repo. No build step is needed.

After changing any cached file, bump `CACHE_VERSION` in `service_worker.js`
so visitors get the new version.

## Before you publish - checklist

- [ ] `Khalid_Bin_Masud_Resume.pdf` is in the folder and up to date
- [ ] Send a test message through the contact form
- [ ] Open the site in a private window and click every link
- [ ] Test on a real phone

## Editing content

- Text and projects: `index.html`
- Colors: CSS variables in the `:root` block of `style.css`
- Contact links: search for `khalidmasud22@gmail.com` and the profile URLs in `index.html`
