<template>
  <div v-if="claves" class="app-wrapper">
    <header class="hero-section">
      <span class="badge">Claves de Cajas</span>
      <h1>Todas las claves de cajas</h1>
    </header>

    <main class="container">
      <div class="synonym-grid">

        <div v-if="objetoDesplegables"
        v-for="[clave, valor] in Object.entries(objetoDesplegables)" 
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
             <ul class="specs">
              <li v-for="key of valor">
                <span>{{ key }}</span>
            </li>
            </ul>
          </div>
         </div>
        </div>
      </div>
    </main>
  </div>
  <notificacionError :activar="manejar.activarError" :texto="manejar.texto" @cerrar="manejar.activarError = false;"
   />
</template>

<script setup>
import { onMounted, ref } from 'vue';
import notificacionError from '../components/notificacionError.vue';
import { controlNotificaciones } from '../stores/clase.js';
import { api } from '../stores/apis.js';

//constantes de entorno
const manejar = controlNotificaciones().manejoNotificacion;
const claves = ref(null);
const objetoDesplegables = ref(null);
const activeIndex = ref(null);
const store = api();

//activa el despegable para index que se indico
const toggle = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

//se leen todas las claves
async function leerClaves(){
    await store.leer('crear-clave/leer-claves');

    if(!store.respuesta.mensaje){
        manejar.activarNotificacionError("hubo errores en la busquedad de las claves");
        return
    }

    claves.value = store.respuesta.datos;
    
    crearObjetoDezplegables();
}

//se crea el objeto que retorna todas las claves
function crearObjetoDezplegables(){
  objetoDesplegables.value = claves.value.reduce((acc, row) => {
    
    if(!acc[row.ubicacion_actual])
      acc[row.ubicacion_actual] = [row.clave_caja]

    else
      acc[row.ubicacion_actual].push(row.clave_caja);

    return acc;
  }, {})
  console.log(objetoDesplegables.value);
}

leerClaves();


</script>

<style scoped>
/* Configuración Global */


.app-wrapper {
  margin: 0;
  padding-bottom: 60px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell
}

/* Header Estilo Apple/Moderno */
.hero-section {
  text-align: center;
  padding: 80px 20px 40px;
}

.badge {
  background: #e8e8ed;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #515154;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-section h1 {
  font-size: 3rem;
  margin: 20px 0 10px;
  letter-spacing: -1px;
}

.hero-section p {
  font-size: 1.2rem;
  color: #86868b;
  max-width: 600px;
  margin: 0 auto;
}
.ubicaciones{
    font-size: 0.8rem;
    color: #86868b;
    max-width: 600px;
    margin: 0 auto;
}

/* Grid System */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.synonym-grid {
  display: flex;
  align-items: flex-start; /* Evita que las tarjetas hermanas se estiren a la altura de la activa */
  justify-content: center;
  /*grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));*/
  gap: 20px;

}

/* Tarjetas Profesionales */
.glass-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 24px;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.glass-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  border-color: #d1d5db;
}
/*
.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}*/

.icon-circle {
  background: #f4f4f7;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
}
/*
.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}*/

/* Tags de Sinónimos */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #4b5563;
  transition: all 0.2s;
}

.tag:hover {
  background: #1d1d1f;
  color: white;
  border-color: #1d1d1f;
  cursor: default;
}

.card {
  border: 1px solid #a64;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card.active {
  border-color: #964;
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
  color: #754;
  transition: background-color 0.2s;
}

.card-header:hover {
  background: #fff5f5;
}

.icon {
  font-size: 1.5rem;
  color: #964;
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
  background-color: #964;
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
  font-size: 1.5rem;
  color: #777;
}

.specs li::before {
  content: "•";
  color: #964;
  margin-right: 10px;
}

/* Responsive */
@media (max-width: 600px) {
  .hero-section h1 { font-size: 2rem; }
  .synonym-grid { grid-template-columns: 1fr; }
}
</style>