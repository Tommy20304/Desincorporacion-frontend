<template>
  <div class="page-container">
    <div class="form-card">
      <header class="form-header">
        <div class="header-actions">
          <button 
            type="button" 
            class="tab-btn" 
            :class="{ 'active': gestionarEliminar.modo.value === 'guardar' }"
          >
            <router-link class="tab-btn" to="/ingresar-planilla">
            <span class="icon">💾</span> Guardar Plantilla
            </router-link>
          </button>
          
          <button 
            type="button" 
            class="tab-btn delete" 
            :class="{ 'active': gestionarEliminar.modo.value === 'eliminar' }"
          >
            
            <span class="icon">🗑️</span> Eliminar Plantilla
          </button>
      
        </div>
      </header>

      <div class="templates-content">
        <TransitionGroup name="list" tag="div" class="templates-grid">
          <div 
            v-for="planilla in gestionarEliminar.planillas.value" 
            :key="planilla.id"
            class="planilla-card"
            :class="{ 'is-selected': gestionarEliminar.seleccionado.value === planilla.id }"
            @click="gestionarEliminar.seleccionarPlanilla(planilla.id)"
          >
            <div class="image-wrapper">
              <img :src="planilla.imagen" :alt="planilla.nombre">
              <div v-if="gestionarEliminar.seleccionado.value === planilla.id" class="delete-overlay">
                <button class="confirm-delete-btn" @click.stop="gestionarEliminar.eliminarPlanilla(planilla.id)">
                  Confirmar Eliminar
                </button>
              </div>
            </div>
            <div class="planilla-info">
              <span class="planilla-name">{{ planilla.nombre }}</span>
            </div>
          </div>
        </TransitionGroup>

        <div v-if="gestionarEliminar.planillas.length === 0" class="empty-state">
          <p>No hay plantillas disponibles.</p>
        </div>
      </div>
    </div>
  </div>

  <notificacionAdv :activar="control.activarAdvertencia" :texto="control.texto" @cerrar="control.activarAdvertencia = false" />
  <notificacionError :activar="control.activarError" :texto="control.texto" @cerrar="control.activarError = false" />
  <notificacionExito :activar="control.activarExito" :texto="control.texto" @cerrar="control.activarExito = false" />
</template>

<script setup>
import { reactive, ref, computed, onMounted} from 'vue';
import { api } from '../stores/apis';
import { controlNotificaciones } from '../stores/clase.js';
import notificacionAdv from '../components/notificacionAdv.vue';
import notificacionError from '../components/notificacionError.vue';
import notificacionExito from '../components/notificacionExito.vue';

const store = api();
const control = controlNotificaciones().manejoNotificacion;
const datosPlantillas = ref({});

//se buscan los datos de las planillas
onMounted(async () => {
    await store.leer('plantilla/info-eliminar');
    datosPlantillas.value = store.respuesta.datos;

    //en los atributos imagen, se agrega la url del backend para que se pueda mostrar la imagen
    for(const [nombre, valores] of Object.entries(listaPlanillas.value)){
      listaPlanillas.value[nombre].imagen = `${store.urlBackend}/imagenes/${valores.imagen}`;
    }
})

class GestionarEliminarPlantillas{
    constructor(planillas){
        this.modo = ref('eliminar'); //el modo
        this.seleccionado = ref(null);
        this.planillas = planillas;
    }

    //se selecciona la plantilla
    seleccionarPlanilla(id){
        this.seleccionado.value = this.seleccionado.value === id ? null : id;
    }

    eliminarPlanilla = async (id) => {
        //se pregunta si esta seguro en eliminar la plantilla
        if(!confirm("Esta seguro en eliminar la plantilla"))
            return

        //se hace la peticion para eliminar la plantilla
        await store.mandarJson({id: id}, "plantilla/eliminar-plantilla");

        if(!store.respuesta.mensaje){
            control.activarNotificacionError("Hubo errores en la eliminacion de la plantilla");
            return;
        }
        control.activarNotificacionExito("Plantilla eliminada correctamente");
        
        //se elimina la planilla eliminada de las planillas
        this.planillas.value = this.planillas.value.filter(p => p.id !== id);
        this.seleccionado.value = null;
    };
}

const gestionarEliminar = new GestionarEliminarPlantillas(datosPlantillas);

</script>

<style scoped>
/* Estilos anteriores se mantienen, agregamos los nuevos: */
.relative { position: relative; }

.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Inter', system-ui, sans-serif;
  padding: 40px 20px;
}

.form-card {
  background: white;
  width: 100%;
  max-width: 800px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%; /* Asegura que el header use todo el ancho del card */
}

.header-actions {
 display: flex;
  width: 100%; /* Ocupa el 100% del contenedor padre */
  gap: 0; /* O puedes dejar un pequeño gap si prefieres separación */
  border-radius: 12px;
  overflow: hidden; /* Para que los bordes redondeados se apliquen a los botones de las esquinas */
  border: 1px solid #e2e8f0;;
}

.tab-btn {
  flex: 1; /* ESTO HACE QUE OCUPEN TODO EL ESPACIO DISPONIBLE POR IGUAL */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  font-weight: 600;
  border: none; /* Quitamos bordes individuales para usar el del contenedor */
  background-color: #f8fafc;
  color: #64748b;
  transition: all 0.2s ease;
  font-size: 1rem;
  text-decoration: none;
}

/* Línea divisoria entre botones */
.tab-btn:first-child {
  border-right: 1px solid #e2e8f0;
}

.tab-btn.active {
  background-color: #4f46e5; /* Color primario */
  color: white;
  border-color: #4f46e5;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

.tab-btn.delete.active {
  background-color: #ef4444; /* Rojo para eliminar */
  border-color: #ef4444;
}

.tab-btn:hover:not(.active) {
  background-color: #f9fafb;
  border-color: #ccc;
}

.tab-btn:hover{
  scale: calc(1.08);
}

.form-header h2 { margin: 0; font-size: 1.8rem; }
.form-header p { margin: 5px 0 0; opacity: 0.9; }

/* --- Contenedor de Grilla --- */
.templates-content {
  padding: 0 2rem 2rem 2rem;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

/* --- Card de Planilla --- */
.planilla-card {
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid #f1f5f9;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.planilla-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #e2e8f0;
}

.planilla-card.is-selected {
  border-color: #ef4444;
  ring: 2px solid #ef4444;
}

/* --- Imagen y Overlay --- */
.image-wrapper {
  position: relative;
  height: 120px;
  background: #f8fafc;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(239, 68, 68, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease;
}

.confirm-delete-btn {
  background: white;
  color: #ef4444;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.planilla-info {
  padding: 12px;
  text-align: center;
}

.planilla-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
}

/* --- Animaciones de Lista --- */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}



</style>
