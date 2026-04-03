<script setup>
import barraNavegacion from '../components/barraNavegacion.vue';
import bloqueBusqueda from '../components/bloqueBusqueda.vue';
import mostrarBusqueda from '../components/mostrarBusqueda.vue';
import notificacionAdv from '../components/notificacionAdv.vue';
import notificacionError from '../components/notificacionError.vue';
import bloqueArchivo from '../components/bloqueArchivo.vue';
import mostrarTexto from '../components/mostrarTexto.vue';
import { clasesBusqueda } from '../stores/clasesBusquedad.js';
import { onUnmounted , onMounted} from 'vue';

const gestor = clasesBusqueda().gestor;

async function ejecutarBusqueda(){
  await gestor.buscar(true);
}

onUnmounted(() => {
    gestor.reiniciar()

})
</script>

<template>
  <div class="layout-container">
    <barraNavegacion>
       
    </barraNavegacion>

    <main class="principal-buscar">
        <div class="alerta-busqueda">
        <i class="icon-info"></i> 
        <span>Estás en la búsqueda de activos desincorporados</span>
      </div>

      <div class="header-grid">
        <h2 class="section-title">Buscar</h2>
        <h2 class="section-title">Resultado</h2>
      </div>

      <div class="content-grid">
        <section class="search-panel">
          <bloqueBusqueda @datosSeleccionados="gestor.recopilarDatos"
          :reiniciar="gestor.resetiarBusqueda"
          :activarDeshabilitado="true">
          </bloqueBusqueda>
        </section>

        <section class="result>s-panel">
          <mostrarBusqueda 
            :datosBuscados="gestor.resultadoConsulta"
            :activarDeshabilitado="true" 
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
        <button class="btn btn-primary" @click="ejecutarBusqueda" :disabled="gestor.buscando">
          <i class="icon-search"></i> {{ gestor.buscando ? 'Buscando...' : 'Buscar Datos' }} 
        </button>
        <button :class="gestor.botonExportar[0]" :disabled="gestor.botonExportar[1]" @click="gestor.mandarPaginaExportar">
          <i class="icon-excel"></i> Exportar a Excel
        </button>
      </div>
    </main>

    <notificacionAdv 
      :activar="gestor.notificaciones.activarAdvertencia" 
      :columnas="gestor.notificaciones.columnasAdvertencia" 
      @cerrar="gestor.notificaciones.activarAdvertencia = false" 
      :texto="gestor.notificaciones.texto"
      :preguntar="gestor.notificaciones.preguntarAdv"
      @respuesta="gestor.respuesta"
    />
    <bloqueArchivo :activar="gestor.notificaciones.activarArchivo" 
    @cerrar="gestor.notificaciones.activarArchivo = false"
    @datosBuscados="gestor.mostrarResultadoArchivo"
    :activarDeshabilitado="true"/>

    <mostrarTexto 
      :activar="gestor.notificaciones.activarCajaTexto" 
      :texto="gestor.notificaciones.texto"
      @cerrar="gestor.notificaciones.activarCajaTexto = false"
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
    background-color: #28a745; 
    color: white; 
    padding: 10px 25px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-size: 0.9rem;
}
.btn-success:hover { background-color: #218838; transform: translateY(-1px); }

.desactivado{
    background-color: #354; 
    color: white; 
    padding: 10px 25px;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    font-size: 0.9rem;
}
/* Nuevo estilo para el mensaje superior */
.alerta-busqueda {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #fff3cd; /* Amarillo suave de alerta */
  color: #856404; /* Texto café/dorado oscuro */
  padding: 12px 20px;
  border-radius: 6px;
  border-left: 5px solid #ffeeba;
  margin-bottom: 20px;
  font-weight: 500;
  font-size: 0.95rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.alerta-busqueda i {
  font-size: 1.2rem;
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