import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import Toast, { type PluginOptions } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const options: PluginOptions = {
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  // showCloseButtonOnHover: false,
  // hideProgressBar: false,
  // closeButton: 'button',
  icon: true,
  // rtl: false
}

createApp(App).use(Toast, options).mount('#app')
