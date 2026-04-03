<script setup>
import barraNavegacion from '../components/barraNavegacion.vue';
import bloqueBusqueda from '../components/bloqueBusqueda.vue';
import mostrarBusqueda from '../components/mostrarBusqueda.vue';
import notificacionAdv from '../components/notificacionAdv.vue';
import notificacionExito from '../components/notificacionExito.vue';
import bloqueArchivo from '../components/bloqueArchivo.vue';
import mostrarTexto from '../components/mostrarTexto.vue';
import notificacionError from '../components/notificacionError.vue';
import bloqueActualizar from '../components/bloqueActualizar.vue';
import { clasesBusqueda } from '../stores/clasesBusquedad.js';
import { ref, onUnmounted} from 'vue';

const gestor = clasesBusqueda().gestor;

class GestorActualizacion{
    constructor(gestorBusqueda) {
        this.gestor = gestorBusqueda;

        // Estado específico de actualización
        this.aceptarFilasDiferentes = ref(false);
        this.aceptarIDNoCompatibles = ref(false);
        this.fileActualizar = ref(null);
        this.filasSinId = ref(null);
        this.ids_excel = ref(null);
    }

    // --- Métodos de Acción (Usando flechas para evitar problemas de 'this') ---

    activarBloqueOpciones = () => {
        this.gestor.notificaciones.activarNotificacionOpcionesActualizar();
    }

    actualizarDatosArchivo = async (file) => {
        try {
            if (!file) return;

            // 1. Configuración inicial
            this.aceptarFilasDiferentes.value = false; //para cuando se pregunte si se quiere actualizar los datos, aun teniando filas diferentes
            this.aceptarIDNoCompatibles.value = false; //para cuando se quiera aceptar ids no compatibles
            this.fileActualizar.value = file;
            const formData = new FormData();
            formData.append("actualizar", file);
            formData.append("datosBuscados", JSON.stringify(this.gestor.resultadoBusqueda));

            // 2. Envío para pre-validación
            await this.gestor.store.mandarArchivo(formData, "actualizar/leer-archivo");

            if (!this.gestor.store.respuesta.mensaje) {
                return this.gestor.notificaciones.activarNotificacionError("Hubo problemas con el envio");
            }

            // 3. Procesar errores del servidor
            if (this._hayErroresCriticosActualizacion()) return;

            // Guardar datos fundamentales
            this.filasSinId.value = this.gestor.store.respuesta.filasNoCompatibles;
            this.ids_excel.value = this.gestor.store.respuesta.ids_excel;

            // 4. Validar advertencias de estructura
            if (this._procesarAdvertenciasEstructura()) return;

            // 5. Validar lógica de negocio (Filas diferentes o IDs incompatibles)
            if (this._validarConsistenciaDatos()) return;

            // 6. Ejecución final si todo está perfecto
            await this._ejecutarPeticionFinal();

        } catch (e) {
            console.error("Error en actualizarDatosArchivo:", e);
            this.gestor.notificaciones.activarNotificacionError("hubo problemas con el envio");
        }
    }

    actualizarPostExcepcion = async () => {
        //se realiza la actualizacion despues de resolver las excepciones

        if(this._erroresPostAdvertencias()) return;

        if (!this.fileActualizar.value) return;

        this.gestor.notificaciones.activarAdvertencia = false;
        this.gestor.notificaciones.activarError = false;

        const formData = new FormData();
        formData.append("actualizar", this.fileActualizar.value);

        await this.gestor.store.mandarArchivo(formData, "actualizar/leer-archivo-nuevo");

        const datosLocales = this.gestor.resultadoBusqueda || [];

        // Re-validación de filas diferentes
        if (this.gestor.store.respuesta.datos.length !== datosLocales.length) {
            if (!this.aceptarFilasDiferentes.value) {
                this.gestor.notificaciones.activarNotificacionAdvertencia(
                    "Existen diferencias entre la cantidad de registro que se van a reemplazar, quiere seguir con la operacion?",
                    null, true
                );
                this.aceptarFilasDiferentes.value = true;
                return;
            }
        }

        // Re-validación de IDs incompatibles
        if (this.filasSinId.value && this.filasSinId.value.length) {
            if (!this.aceptarIDNoCompatibles.value) {
                this.gestor.notificaciones.activarNotificacionAdvertencia(
                    "El id de estas filas, no coincide con los de los datos buscados. Desea actualizar de todos modos?",
                    this.filasSinId.value
                );
                this.aceptarIDNoCompatibles.value = true;
                return;
            }
        }

        await this._ejecutarPeticionFinal();
    }

    respuesta = (event) => {
        if (event) {
            if (this.gestor.notificaciones.determinarAdvertencias()) return;
            this.actualizarPostExcepcion();
        } else {
            this.gestor.notificaciones.activarAdvertencia = false;
        }
    }

    actualizarManualmente = (indexRegistro) => {
        const key = this.gestor.random.generarString(10);
        const registro = this.gestor.resultadoBusqueda[indexRegistro];
        localStorage.setItem(`${key}-actualizar`, JSON.stringify(registro));

        const routeData = this.gestor.router.resolve({ 
            name: 'actualizar-manualmente', 
            params: { parametro: key } 
        });
        window.open(routeData.href, '_blank');
    }

    actualizarConjuntamente = () => {
        const key = this.gestor.random.generarString(10);
        const datosBuscados = JSON.parse(localStorage.getItem('export'))
        localStorage.setItem(`${key}-conjunto`, JSON.stringify(this.gestor.resultadoBusqueda));

        const routeData = this.gestor.router.resolve({ 
            name: 'actualizar-conjunto', 
            params: { parametro: key } 
        });
        window.open(routeData.href, '_blank');
    }

    // --- Métodos Privados de Soporte ---

    _hayErroresCriticosActualizacion() {
        const resp = this.gestor.store.respuesta;
        if (resp.mensaje === "ningun dato se puede mandar") {
            this.gestor.notificaciones.activarNotificacionError("ningun dato se puede mandar");
            return true;
        }
        if (resp.columnaNoPresente) {
            this.gestor.notificaciones.activarNotificacionError(`No se incluye la ${resp.columnaNoPresente} de los equipos`);
            return true;
        }
        if (!resp.ids_excel || !Object.keys(resp.ids_excel).length) {
            this.gestor.notificaciones.activarNotificacionError("No se encontro ningun id que coincida");
            return true;
        }
        return false;
    }

    _procesarAdvertenciasEstructura() {
        const resp = this.gestor.store.respuesta;
        if (resp.mensaje === "columnas innecesarias") {
            this.gestor.notificaciones.activarNotificacionAdvertencia("Estas columnas no se van a ingresar. Desea actualizar los datos de todos modos", resp.columnas);
            return true;
        }
        if (resp.mensaje === "error") {
            if (resp.columnasNocontadas) this.gestor.notificaciones.columnasNoContadas = resp.columnasNocontadas;
            
            this.gestor.notificaciones.activarNotificacionError("Hubo errores en el archivo. Desea actualizar los datos de todos modos?", resp.listaErrores, resp.columnasNocontadas);
            return true;
        }
        return false;
    }

    _erroresPostAdvertencias(){
        //se determina si hay errores en los componentes
        const listaErrores = this.gestor.store.respuesta.listaErrores ? this.gestor.store.respuesta.listaErrores : {};

        if(Object.keys(listaErrores).find(element => element.includes("componente repetido"))){
            this.gestor.notificaciones.activarNotificacionError("Existen errores en las columnas de los componentes");
            return true;
        }

        return false;
    }

    _validarConsistenciaDatos() {
        const resp = this.gestor.store.respuesta;
        const datosLocales = this.gestor.resultadoBusqueda || [];

        if (resp.datos.length !== datosLocales.length) {
            this.gestor.notificaciones.activarNotificacionAdvertencia("Diferencias en cantidad de registros. Desea actualizar los datos de todos modos?", null, true);
            this.aceptarFilasDiferentes.value = true;
            return true;
        }

        if (resp.filasNoCompatibles && resp.filasNoCompatibles.length) {
            this.gestor.notificaciones.activarNotificacionAdvertencia(
                "El id de estas filas, no coincide con los de los datos buscados. Desea actualizar de todos modos?",
                resp.filasNoCompatibles
            );
            this.aceptarIDNoCompatibles.value = true;
            return true;
        }
        return false;
    }

    _ejecutarPeticionFinal = async () => {
        const datosLocales = this.gestor.resultadoBusqueda || [];
        await this.gestor.store.mandarJson({
            datosReemplazar: this.gestor.store.respuesta.datos,
            datosBuscados: datosLocales,
            ids_excel: this.ids_excel.value
        }, "actualizar/actualizar-datos");

        if (this.gestor.store.respuesta.mensaje) {
            this.gestor.notificaciones.activarNotificacionExito("Se actualizaron los datos");
            this.gestor.notificaciones.activarError = false;
            this.fileActualizar.value = null;
        } else {
            this.gestor.notificaciones.activarNotificacionError("Hubo problemas con la actualización");
        }
    }
}
const gestorActualizacion = new GestorActualizacion(gestor);

function determinarRespuestas(event){
    //se determina cual respuesta se pasa
    if(gestor.notificaciones.activarArchivo){
        gestor.respuesta(event);
        return
    }
    gestorActualizacion.respuesta(event);
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
          <bloqueBusqueda @datosSeleccionados="gestor.recopilarDatos"
          :reiniciar="gestor.resetiarBusqueda">
          </bloqueBusqueda>
        </section>

        <section class="result>s-panel">
          <mostrarBusqueda 
            :datosBuscados="gestor.resultadoConsulta"
            :botonAccion="'actualizar'"
            @mostrarCajaTexto="gestor.mostrarCajaTexto"
            @accion="gestorActualizacion.actualizarManualmente">
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
        <button :class="gestor.botonExportar[0]" :disabled="gestor.botonExportar[1]" @click="gestorActualizacion.activarBloqueOpciones">
          <i class="icon-excel"></i> Actualizar Masivamente
        </button>
      </div>
    </main>
    <notificacionError 
    :activar="gestor.notificaciones.activarError" 
    :texto="gestor.notificaciones.texto" 
    :errores="gestor.notificaciones.columnasError" 
    @cerrar="gestor.notificaciones.activarError = false" 
    @mandarDatos="determinarRespuestas" 
    :archivo="gestorActualizacion.fileActualizar.value"
/>

<notificacionAdv 
    :activar="gestor.notificaciones.activarAdvertencia" 
    :columnas="gestor.notificaciones.columnasAdvertencia" 
    @cerrar="gestor.notificaciones.activarAdvertencia = false" 
    :texto="gestor.notificaciones.texto"
    :preguntar="gestor.notificaciones.preguntarAdv"
    @respuesta="determinarRespuestas"
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

<bloqueActualizar 
    :activar="gestor.notificaciones.activarOpcionesActualizar" 
    @cerrar="gestor.notificaciones.activarOpcionesActualizar = false"
    @mandarArchivo="gestorActualizacion.actualizarDatosArchivo"
    @conjunto="gestorActualizacion.actualizarConjuntamente"
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
    background-color: #f90; 
    color: white; 
    padding: 10px 25px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    font-size: 0.9rem;
}
.btn-success:hover { background-color: #fa0; transform: translateY(-1px); }

.desactivado{
    background-color: #f90a; 
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