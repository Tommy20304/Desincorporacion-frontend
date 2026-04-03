<script setup>
import barraNavegacion from '../components/barraNavegacion.vue';
import bloqueBusqueda from '../components/bloqueBusqueda.vue';
import mostrarBusqueda from '../components/mostrarBusqueda.vue';
import notificacionAdv from '../components/notificacionAdv.vue';
import notificacionExito from '../components/notificacionExito.vue';
import bloqueArchivo from '../components/bloqueArchivo.vue';
import mostrarTexto from '../components/mostrarTexto.vue';
import { clasesBusqueda } from '../stores/clasesBusquedad.js';
import { onUnmounted , onMounted, ref} from 'vue';
import { api } from '../stores/apis.js';

const store = api();
const gestor = clasesBusqueda().gestor;
const eliminando = ref(false);

async function eliminarDatos(){
    if(!confirm("Esta seguro en eliminar los datos")) return;

    //se activa el boton de eliminando
    eliminando.value = true;

    //const datos = JSON.parse(localStorage.getItem('export'));
    const datos = gestor.resultadoBusqueda;


    //se hace la peticion http
    await store.mandarJson({datos:datos}, 'eliminar/eliminar-datos');

    //se determina si hubo errores en la eliminacion
    if(!store.respuesta.mensaje){
      eliminando.value = false;
      gestor.notificaciones.activarNotificacionError("hubo errores en la eliminacion")
      return;
    }

    //se quita
    eliminando.value = false;

    //se quitan los datos
    gestor.reiniciar();

    gestor.notificaciones.activarNotificacionExito('se eliminaron todos los datos');
}

onUnmounted(() => {
    gestor.reiniciar();
})


</script>

<template>
  <div class="layout-container">
    <barraNavegacion>
      </barraNavegacion>

    <main class="principal-buscar">
      <div class="header-grid">
        <h2 class="section-title">Buscar</h2>
        <h2 class="section-title">Resultado</h2>
      </div>

      <div class="content-grid">
        <section class="search-panel">
          <bloqueBusqueda 
            @datosSeleccionados="gestor.recopilarDatos"
            :reiniciar="gestor.resetiarBusqueda">
          </bloqueBusqueda>
        </section>

        <section class="results-panel">
          <mostrarBusqueda 
            :datosBuscados="gestor.resultadoConsulta" 
            @mostrarCajaTexto="gestor.mostrarCajaTexto">
          </mostrarBusqueda>
        </section>
      </div>

      <div class="actions-container">
        <button class="btn btn-secondary" @click="gestor.reiniciar">
          <i class="icon-reset"></i> Reiniciar
        </button>
        <button class="btn btn-archivo" @click="gestor.pasarArchivo">
          <i class="icon-archivo"></i> Buscar por Archivo
        </button>
        <button class="btn btn-primary" @click="gestor.buscar()" :disabled="gestor.buscando">
          <i class="icon-search"></i> {{ gestor.buscando ? 'Buscando...' : 'Buscar Datos' }} 
        </button>
        <button 
          :class="gestor.botonExportar[0]" 
          :disabled="gestor.botonExportar[1] || eliminando" 
          @click="eliminarDatos">
          <i class="icon-excel"></i>{{ eliminando ? 'Eliminando...' : 'Eliminar' }} 
        </button>
      </div>
    </main>

    <notificacionAdv 
      :activar="gestor.notificaciones.activarAdvertencia" 
      :columnas="gestor.notificaciones.columnasAdvertencia" 
      @cerrar="gestor.notificaciones.activarAdvertencia = false" 
      :texto="gestor.notificaciones.texto"
      @respuesta="gestor.respuesta"
    />

    <bloqueArchivo 
      :activar="gestor.notificaciones.activarArchivo" 
      @cerrar="gestor.notificaciones.activarArchivo = false"
      @datosBuscados="gestor.mostrarResultadoArchivo"
    />

    <mostrarTexto 
      :activar="gestor.notificaciones.activarCajaTexto" 
      :texto="gestor.notificaciones.texto"
      @cerrar="gestor.notificaciones.activarCajaTexto = false"
    />

    <notificacionExito 
      :activar="gestor.notificaciones.activarExito" 
      :texto="gestor.notificaciones.texto"  
      @cerrar="gestor.notificaciones.activarExito = false"
    />
  </div>
</template>

<style scoped>
/* Contenedor Principal */
.layout-container {
  font-family: 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.principal-buscar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Grilla de Títulos */
.header-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.section-title {
  font-size: 1.1rem;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Grilla de Contenido */
.content-grid {
  display: grid;
  grid-template-columns: 350px 1fr; /* Columna fija para búsqueda, flexible para resultados */
  gap: 30px;
  align-items: start;
}

/* Estilo de Botones */
.actions-container {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #dee2e6;
}

.btn {
  padding: 10px 25px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
}

.btn-primary { background-color: #cd1c29; color: white; }
.btn-primary:hover { background-color: #a10b12; transform: translateY(-1px); }

.btn-secondary { background-color: #6c757d; color: white; }
.btn-secondary:hover { background-color: #5a6268; transform: translateY(-1px); }

.btn-archivo { background-color: #f80; color: white; }
.btn-archivo:hover {background-color: #f50; color: white; transform: translateY(-1px);}

.btn-success { 
    background-color: #f00; 
    color: white; 
    padding: 10px 25px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-size: 0.9rem;
}
.btn-success:hover { background-color: #f20; transform: translateY(-1px); }

.desactivado{
    background-color: #900; 
    color: white; 
    padding: 10px 25px;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    font-size: 0.9rem;
}


/* Responsivo */
@media (max-width: 768px) {
  .content-grid, .header-grid {
    grid-template-columns: 1fr;
  }
  .actions-container {
    flex-direction: column;
  }
}
</style>