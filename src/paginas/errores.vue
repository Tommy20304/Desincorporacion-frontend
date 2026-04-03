<script setup>
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import { onUnmounted , onMounted, onUpdated, ref} from 'vue';
import { api } from '../stores/apis';
import { controlNotificaciones } from '../stores/clase.js';
import notificacionAdv from '../components/notificacionAdv.vue';

//constantes fundamentales
const manejar = controlNotificaciones().manejoNotificacion;
const apis = api();
const ruta = useRoute();

//constantes de entorno
const activarPagina = ref(true);
const activeIndex = ref(null);
const activeSubIndex = ref(null); // Controla el sub-desplegable
const erroresExpeciales = ["columna repetida", 'valor repetido en serial', 'valor repetido en etiqueta'] //errores que se visualizan de manera especial

//funciones de entorno
const toggleSub = (key) => {
  activeSubIndex.value = activeSubIndex.value === key ? null : key;
};

const toggle = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

//se acceden a los datos en el localStorage
let dato = localStorage.getItem(ruta.params.parametro) 

if(dato){
    //se parsea a Json
    dato = JSON.parse(dato) 
   
    //si existe el posible error en la serial
    let comprobarPosible = Object.keys(dato).find(element => element.includes("posible")); 
    if(comprobarPosible)
        delete dato[comprobarPosible];
    
    //elimina el error de una columna que se repite, es decir, si hay un error en la columna E pero esa columna esta repetida, ese error se anula
    let erroresNoPermitidos = ["columna repetida", 'valor repetido en serial', 'valor repetido en etiqueta'];
    
    if(dato["columna repetida"]){
        for(let [clave,valor] of Object.entries(dato)){
            
            //si la clave indica un error no permitido se pasa
            if(erroresNoPermitidos.includes(clave)) continue

            //se extrae la letra
            let letra = Object.keys(valor)[0].substring(0,1); 

            //si la letra coincide con una columna repetida, se elimina ese error
            Object.values(dato["columna repetida"]).forEach(coor => {
                if(coor.includes(letra)){
                    delete dato[clave] 
                }
            })
        }
    }
}

let eliminar =  () => {
    //se eliminan los stores
    localStorage.removeItem(ruta.params.parametro);
}

for(let [clave, valor] of Object.entries(dato)){
    if(clave.includes("componente repetido en")){
        console.log(valor);
    }
}

onMounted(() => {
      window.addEventListener('beforeunload', eliminar); //esto hace que cuando se cierre la pagina, se ejecute esta funcion
      
      //cuando se elimina el localStore, se cierra la pagina principal y se muestra una advertencia
      if(!localStorage.getItem(ruta.params.parametro)){
        activarPagina.value = false;
        manejar.activarNotificacionAdvertencia("Se perdieron los datos. Por favor, cierre la pagina y vuelve a abrirla");
      }
    });


onUnmounted(() => {
      // Limpiamos el evento si el componente se destruye pero la app sigue abierta
      window.removeEventListener('beforeunload', eliminar);
    });

</script>
<template>
<div v-if="activarPagina" class="container-errores">
    <h1 class="title">Errores del Archivo</h1>
    
    <div class="accordion">
            
        <div v-if="dato" 
        v-for="[clave, valor] in Object.entries(dato)" 
        :key="clave"
        class="card"
        :class="{ active: activeIndex === clave }"
        >

        <div class="card-header" @click="toggle(clave)">
          <span>{{  clave }}</span>
          <span class="icon">{{ activeIndex === clave ? '−' : '+' }}</span>
        </div>

        <div 
          class="card-body-wrapper" 
          :style="{ maxHeight: activeIndex === clave ? '300px' : '0' }"
        >
          <div class="card-body">

            <div v-if="erroresExpeciales.includes(clave) || clave.includes('componente repetido en')" class="sub-accordion">
              <div  v-for="[columna, letras] in Object.entries(valor)" :key="columna" class="sub-card">
                <div class="sub-header" @click="toggleSub(columna)">
                  <span>{{ columna }}</span>
                  <span class="sub-icon">{{ activeSubIndex === columna ? '▾' : '▸' }}</span>
                </div>
                <div 
                  class="sub-body-wrapper"
                  :style="{ maxHeight: activeSubIndex === columna ? '200px' : '0' }"
                >
                  <ul class="specs sub-specs">
                    <li v-for="coor in letras" :key="coor">{{ coor }}</li>
                  </ul>
                </div>
              </div>
            </div>

         

            <ul v-else class="specs">
              <li v-for="[coor, date] in Object.entries(valor)">
                <span v-if="date">{{ coor }} : {{ date }}</span>
                <span v-else>{{ coor }}</span>
            </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <h1>Se completo el objetivo de la pagina. Puedes Cerrarla :)</h1>
  </div>
  <notificacionAdv 
      :activar="manejar.activarAdvertencia" 
      :columnas="manejar.columnasAdvertencia" 
      :texto="manejar.texto"
  />
</template>
<style scoped>
/* Contenedor Principal */
.container-errores {
  max-width: 600px;
  margin: 2rem auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.title {
  text-align: center;
  color: #b30000;
  margin-bottom: 2rem;
}

/* Acordeón / Cards */
.accordion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  border: 1px solid #ffcccc;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card.active {
  border-color: #e60000;
  box-shadow: 0 4px 12px rgba(230, 0, 0, 0.15);
}

/* Encabezado */
.card-header {
  padding: 1.2rem;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  color: #800000;
  transition: background 0.2s;
}

.card-header:hover {
  background: #fff5f5;
}

.icon {
  font-size: 1.5rem;
  color: #e60000;
}

/* Cuerpo desplegable con Scroll */
.card-body-wrapper {
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; /* Oculta el contenido cuando está cerrado */
}

.card-body {
  padding: 1.2rem;
  border-top: 1px solid #ffe6e6;
  max-height: 250px; /* Altura máxima interna */
  overflow-y: auto; /* Habilita el scroll si el contenido es largo */
}

/* Estilo del Scrollbar (Opcional, para que se vea más pro) */
.card-body::-webkit-scrollbar {
  width: 6px;
}
.card-body::-webkit-scrollbar-thumb {
  background-color: #ffb3b3;
  border-radius: 10px;
}

.description {
  line-height: 1.6;
  color: #555;
  margin-bottom: 1rem;
}

.specs {
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
}

.specs li {
  padding: 0.3rem 0;
  font-size: 1.2rem;
  color: #777;
}

.specs li::before {
  content: "•";
  color: #e60000;
  margin-right: 10px;
}

/* Pie de página y Botón */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.price {
  font-size: 1.4rem;
  font-weight: bold;
  color: #e60000;
}

.buy-button {
  background: #e60000;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.buy-button:hover {
  background: #b30000;
}

/* --- ESTILOS DEL SUB-DESPLEGABLE --- */
.sub-accordion {
  margin: 1rem 0;
  border-left: 2px solid #ffb3b3;
  padding-left: 10px;
}
.sub-card {
  margin-bottom: 0.5rem;
  background: #fffafa;
  border-radius: 4px;
}
.sub-header {
  padding: 0.6rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #b30000;
  background: #ffe6e6;
  border-radius: 4px;
}
.sub-header:hover { background: #ffd6d6; }
.sub-icon { font-size: 0.8rem; }

.sub-body-wrapper {
  transition: max-height 0.3s ease;
  overflow-y: auto; /* Scroll interno si es necesario */
}
.sub-specs { padding: 0.5rem 1rem !important; margin: 0 !important; }
</style>