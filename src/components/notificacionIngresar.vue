<template>
  <Transition name="fade-scale" appear>
    <div v-if="activar" class="overlay" @click.self="$emit('cerrar')">
      <div class="glass-card">
        <header class="card-header">
            
          <h2 v-if="datos">Desea guardar los datos no registrados de las columnas: {{ Object.keys(datos).join(", ") }}</h2>
        </header>

        <div class="action-grid">
            
          <button class="action-card" @click="visualizar(datos)" >
            <div class="icon-wrapper view-bg" >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <div class="action-content" >
              <span class="action-title" >Visualizar Datos</span>
            </div>
          </button>

          <button class="action-card" @click="guardarDatos(datos)">
            <div class="icon-wrapper send-bg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </div>
            <div class="action-content" >
              <span class="action-title">Guardar Datos</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { api } from '../stores/apis';
import { aleatorio } from '../stores/aleatorio';
import { controlNotificaciones } from '../stores/clase';

defineProps(["activar", "datos"])
const emit = defineEmits(["cerrar", "respuesta"]);
const ruta = useRouter();
const random = aleatorio();
const manejar = controlNotificaciones().manejoNotificacion;
const store = api();

function visualizar(datos){
    //se abre una pestaña nueva donde se veran los datos
  const key = random.generarString(10); //se genera la clave unica
  localStorage.setItem(key+"-datos", JSON.stringify(datos));

  const routeData = ruta.resolve({ name: 'ver-datos', params: {parametro: key} });
  //Abrimos la URL en una nueva ventana/pestaña
  window.open(routeData.href, '_blank');
}

async function guardarDatos(datos){
    try{
      await store.mandarJson({datos: datos}, "ingresar/guardar-datos")

      emit("cerrar");
      manejar.datosIngresar = false;

      if(!store.respuesta.mensaje){
        emit("respuesta", "error");
        return;
      }
     
      emit("respuesta", true);
    }catch(e){
      emit("cerrar");
      console.log(e);
      emit("respuesta", "error");
    }

   
}
</script>

<style scoped>
/* --- NUEVAS REGLAS DE ANIMACIÓN --- */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* El fondo (overlay) también se anima */
.fade-scale-enter-active.overlay {
  transition: opacity 0.3s ease;
}

/* --- TU CÓDIGO ORIGINAL --- */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 15, 25, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 999;
}

.glass-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  padding: 40px;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.card-header {
  text-align: center;
  margin-bottom: 40px;
  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
}

.card-header h2 {
  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.action-grid {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.action-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
  border-color: rgba(59, 130, 246, 0.5);
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.view-bg { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.send-bg { background: rgba(16, 185, 129, 0.15); color: #34d399; }

.action-content {
  display: flex;
  flex-direction: column;
}

.action-title {
  color: #f8fafc;
  font-weight: 600;
  font-size: 1.1rem;
}

@media (max-width: 600px) {
  .action-grid {
    flex-direction: column;
  }
}
</style>