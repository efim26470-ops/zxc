import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('quietpress: #root element was not found')
}

createRoot(rootElement).render(<App />)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.warn('quietpress service worker registration failed', error)
    })
  })
}
