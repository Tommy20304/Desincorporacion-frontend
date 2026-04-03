<template>
  <div v-if="sinonimos" class="app-wrapper">
    <header class="hero-section">
      <span class="badge">Nombres Registrados</span>
      <h1>Nombres de Campos</h1>
      <p>Todos los nombres de los campos que son validos</p>
    </header>

    <main class="container">
      <div class="synonym-grid">
        <div v-for="[clave, valor] of Object.entries(sinonimos)" :key="clave" class="glass-card">
          <div class="card-header">
            <span class="icon-circle">{{ objetos[clave] }}</span>
            <h3>{{ clave }}</h3>
          </div>
          <div class="tags-container" >
            <span v-for="sinonimo in valor" :key="sinonimo" class="tag" @click="copiarAlPortapapeles(sinonimo)">
              {{ sinonimo }}
            </span>
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
import { controlNotificaciones } from '../stores/clase';
import { api } from '../stores/apis';

const manejar = controlNotificaciones().manejoNotificacion;
const sinonimos = ref(null);
const store = api();

//se hace la peticion para leer los sinonimos
async function leerSinonimos(){
    await store.leer('ingresar/leer-sinonimos');

    if(!store.respuesta.mensaje){
      manejar.activarNotificacionError("hubo errores en la busquedad de los sinonimos");
      return;
    }

    sinonimos.value = store.respuesta.sinonimos;
}

leerSinonimos();

//los emojis de todos los sinonimos
const objetos =
  { categoria: '💻',
   marca: '📱',
   modelo: '🚗',
    serial: '🔢',
    etiqueta: '🏷️',
    mac_addre: '📶',
    ubicaciones: '📍',
    condicion: '📊',
    notas: '📝',
    bueno: '✔️',
    malo: '❌'
   
  }

//funcion para copiar el sinonimo en el portapapeles
const copiarAlPortapapeles = async (valor) => {
  try {
    //se copia eso al portapapeles
    await navigator.clipboard.writeText(valor);
    
  } catch (err) {
    console.error('Error al copiar: ', err);
  }
};

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

/* Grid System */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.synonym-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

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

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

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

/* Responsive */
@media (max-width: 600px) {
  .hero-section h1 { font-size: 2rem; }
  .synonym-grid { grid-template-columns: 1fr; }
}
</style>