import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './rutas/indes'
import { createPinia } from 'pinia';
import piniaPluginPresistedState from "pinia-plugin-persistedstate"; //esta dependencia sirve para que las variables de los stores persistan y no se reinicien cuando se reinicia la pagina

const pinia = createPinia() //se usa para poder utilizar pinia
//pinia permite crear store, que son elementos, como variables, funciones etc, que se cualquier pagina de la aplicacion puede acceder
pinia.use(piniaPluginPresistedState) //le estamos diciendo que use esta libreria
createApp(App).use(router).use(pinia).mount('#app') //se hace que se utilice el router
