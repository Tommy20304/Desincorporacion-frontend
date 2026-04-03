<script setup>
import { useRoute } from 'vue-router';
import { onMounted, ref , onUnmounted, watch} from 'vue';
import infoPlantillas from '../components/infoPlantillas.vue';
import { api } from '../stores/apis';

//constantes de entorno
const store = api();
const activarPagina = ref(true);
const listaPlanillas = ref([]);
const ruta = useRoute();
const datos = acomodarDatos(JSON.parse(localStorage.getItem(ruta.params.parametro+"-export"))); 
const planillaSeleccionada = ref(null);

//se pide la informacion de las plantillas
onMounted(async () => {
  await store.leer('plantilla/info');
  listaPlanillas.value  = store.respuesta.datos;

  //en los atributos imagen, se agrega la url del backend para que se pueda mostrar la imagen
  for(const [nombre, valores] of Object.entries(listaPlanillas.value)){
    listaPlanillas.value[nombre].imagen = `${store.urlBackend}/imagenes/${valores.imagen}`;
  }
  
})

//funciones de entorno
const abrirModal = (p) => planillaSeleccionada.value = p;
const cerrarModal = () => planillaSeleccionada.value = null;

//elimina el elemento
function eliminarlocalStore(){
    localStorage.removeItem(ruta.params.parametro+"-export");  
}

//acomoda los datos quitando el cargo de los datos del localStore
function acomodarDatos(date){
  if(!date) return [];

  const nuevoDato = date.map(row => {
    delete row.cargo;

    //si ambos estados de componentes son 0 se elimina
    if(row.bueno === '0' && row.malo === '0'){
      delete row.bueno;
      delete row.malo;
    }

    return row
  });

  return nuevoDato;
}


onMounted(() => {
      window.addEventListener('beforeunload', eliminarlocalStore); //esto hace que cuando se cierre la pagina, se ejecute esta funcion
    });

    //si se elimina el store, se cierra la pagina principal
    if(!localStorage.getItem(ruta.params.parametro+"-export")){
      activarPagina.value = false;
    }


onUnmounted(() => {
      // Limpiamos el evento si el componente se destruye pero la app sigue abierta
      window.removeEventListener('beforeunload', eliminarlocalStore);
    });

</script>

<template>
  <div v-if="activarPagina" class="app-container">
    <header class="header">
      <h1>Galería de Planillas</h1>
      <p>Selecciona una plantilla para ver sus especificaciones</p>
    </header>

    <transition-group name="grid-fade" tag="div" class="galeria-grid">
      <div 
        v-for="[nombre, valores] in Object.entries(listaPlanillas)" 
        class="tarjeta"
        @click="abrirModal(valores)"
      >
        <div class="imagen-wrapper">
          <img :src="valores.imagen" :alt="nombre">
          <div class="overlay-simple">Ver detalles</div>
        </div>
        <div class="info-basica">
          <h3>{{ nombre}}</h3>
        </div>
      </div>
    </transition-group>

    <infoPlantillas :activar="planillaSeleccionada" :infoPlantilla="planillaSeleccionada"
    :datosBuscados="datos"  @cerrar="cerrarModal" />
   
  </div>
  <div v-else>
    <h1>Se perdio los datos buscados. Por favor, cierre la pagina y vuelve a abrirla :(</h1>
  </div>
</template>

<style scoped>
/* Variables de color */
:root {
  --primario: #2c3e50;
  --acento: #3498db;
  --fondo: #f4f7f6;
  --blanco: #ffffff;
}

.app-container {
  background-color: #f4f7f6;
  min-height: 100vh;
  padding: 40px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 50px;
}

/* --- GRID DE GALERÍA --- */
.galeria-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.tarjeta {
  background: var(--blanco);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.tarjeta:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.imagen-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.imagen-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.tarjeta:hover .imagen-wrapper img {
  transform: scale(1.1);
}

.info-basica {
  padding: 20px;
  text-align: center;
}

/* --- MODAL --- */

</style>
