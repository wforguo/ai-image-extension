import { createApp } from 'vue'
import App from './App.vue'
;(() => {
    const __DEV__ = process.env.CRX_ENV === 'development'
    console.log(__DEV__)
    const rootIdName = 'vite_crx_content_script'
    const beforeRoot = document.querySelector(`#${rootIdName}`)
    if (beforeRoot && __DEV__) {
        document.body.removeChild(beforeRoot)
    }
    const container = document.createElement('div')
    container.id = rootIdName
    const root = document.createElement('div')
    const styleEl = document.createElement('link')
    const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
    styleEl.setAttribute('rel', 'stylesheet')
    styleEl.setAttribute('href', chrome.runtime.getURL('contentScript/style.css'))
    shadowDOM.appendChild(styleEl)
    shadowDOM.appendChild(root)
    document.body.appendChild(container)

    const app = createApp(App)
    app.mount(root)
})()
