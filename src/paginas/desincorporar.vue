<script setup>
import { ref, onUnmounted } from 'vue';
import barraNavegacion from '../components/barraNavegacion.vue';
import bloqueBusqueda from '../components/bloqueBusqueda.vue';
import mostrarBusqueda from '../components/mostrarBusqueda.vue';
import notificacionAdv from '../components/notificacionAdv.vue';
import notificacionExito from '../components/notificacionExito.vue';
import bloqueArchivo from '../components/bloqueArchivo.vue';
import mostrarTexto from '../components/mostrarTexto.vue';
import bloqueDeshabilitar from '../components/bloqueDeshabilitar.vue';
import { api } from '../stores/apis.js';
import { clasesBusqueda } from '../stores/clasesBusquedad.js';
//colocar en las recomendaciones que si se intenta ingresar una ubicacion y da un error que lo vuelvan a intentar varias veces
const store = api();
const gestor = clasesBusqueda().gestor;
const activarInputUbicacion = ref(false);
const metodo = ref('');
const registroManual = ref(false);

async function deshabilitar(ubicacion, datosBuscados = null){
    if(!confirm("Esta seguro en desincorporar los datos")) return;

    //esto se hace para determinar que dato se pasa de manera manual o masiva
    const datos = datosBuscados ? datosBuscados : gestor.resultadoBusqueda;

    //se revisa que alguno de los datos ya estan desincorporados
    await store.mandarJson({datos:datos, desincorporacion: true}, 'eliminar/verificar-datos');

    if(store.respuesta.mensaje == 'datos existentes'){
      activarInputUbicacion.value = false;
      gestor.notificaciones.activarNotificacionError("Hay equipos que ya estan desincorporados");
      return;
    }

    //se hace la peticion http
    await store.mandarJson({
      datos:datos, 
      ubicacion: ubicacion, 
      quitar: false
    }, 'eliminar/desincorporar-datos');

    //se cierra el bloque de ubicacion
    activarInputUbicacion.value = false;
      
    //se comprueba si hubo errores
    if(!store.respuesta.mensaje){
      gestor.notificaciones.activarNotificacionError("Hubo errores en la desincorporacion")
      return;
    }

    //se reinicia el registro manual para evitar que se quede activo
    registroManual.value = false;
    
    gestor.notificaciones.activarNotificacionExito('Se desincorporaron los datos correctamente');
  
}

function mostrarInputUbicacion(metodoSeleccionado = null){
    //si el metodo seleccionado es true, quiere decir que se envio desde el boton de accion, por lo cual es manual
    activarInputUbicacion.value = true;
    registroManual.value = metodoSeleccionado != null ? gestor.resultadoBusqueda[metodoSeleccionado] : false;
    metodo.value = metodoSeleccionado != null ? 'manual': 'masivo';
}

//se determina cual metodo se coloco
function definirMetodo(objeto){

    //si hubo algun error en el ingreso de alguna ubicacion, se coloca
    if (objeto == 'error') {
        gestor.notificaciones.activarNotificacionError("Hubo un error al ingresar la ubicación"); 
        return;
    }

    if (objeto.metodo === 'masivo')
        deshabilitar(objeto.ubicacion, null);

    else if (objeto.metodo === 'manual')
        deshabilitar(objeto.ubicacion, registroManual.value);
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
            :botonAccion="'deshabilitar'"
            @mostrarCajaTexto="gestor.mostrarCajaTexto"
            @accion="mostrarInputUbicacion">
            
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
          :disabled="gestor.botonExportar[1]" 
          @click="mostrarInputUbicacion()">
          <i class="icon-excel"></i> Desincorporar Masivamente
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

    <bloqueDeshabilitar
      :activar="activarInputUbicacion"  
      :metodo="metodo"
      @cerrar="activarInputUbicacion = false"
      @pasarUbicacion="definirMetodo"
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