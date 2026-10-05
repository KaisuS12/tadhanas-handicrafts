import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The public address of the site, used for the Facebook link preview.
// Netlify sets URL and Vercel sets VERCEL_PROJECT_PRODUCTION_URL automatically;
// set SITE_URL yourself if you use your own domain.
function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL
  if (process.env.URL) return process.env.URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return ''
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl().replace(/\/$/, '')),
    },
  ],
  base: './',
})
