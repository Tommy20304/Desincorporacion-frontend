<script setup>
import barraNavegacion from '../components/barraNavegacion.vue';
import {ref, watch} from "vue";
import { api } from '../stores/apis';
import { controlNotificaciones } from '../stores/clase.js';
import { useRouter } from 'vue-router';
import notificacionAdv from '../components/notificacionAdv.vue';
import notificacionError from '../components/notificacionError.vue';
import notificacionExito from '../components/notificacionExito.vue';
import notificacionIngresar from '../components/notificacionIngresar.vue';
import mandarClave from '../components/mandarClave.vue';

const store = api();
const local = controlNotificaciones();
const ruta = useRouter();
const datosUsuario = JSON.parse(localStorage.getItem('datosUsuario'));
const notificar = local.manejoNotificacion; //se instancia la clase notificar

class ExperienciaUsuario{
    //para la experiencia del usuario y para recolectar el archivo mandado
    constructor(){
      //variables de entorno
      this.file = ref(null);
      this.fileInput = ref(null);
      this.isDragging = ref(false);
      this.isUploading = ref(false);
      this.procesar = ref(false);
    }

    // --- funciones para la experiencia del usuario ---
    // Validación simple de extensión
    validateFile = (selectedFile) => {
      const fileName = selectedFile.name.toLowerCase();
      const isExcel = fileName.endsWith('.xlsx');
      
      if (!isExcel) {
        // se notifica
        notificar.activarNotificacionError("Solo se permiten archivos Excel (.xlsx)");
        return false;
      }
      return true;
    }

    handleDragOver = () => { this.isDragging.value = true; }

    handleDragLeave = () => { this.isDragging.value = false; }

    //determina si el archivo tiene la extension correcta, si la tiene se añade si no, no
    handleDrop = (e) => {
      this.isDragging.value = false;
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        if (this.validateFile(droppedFiles[0])) {
            this.file.value = droppedFiles[0];
          }
      }
    }

    //elimina el archivo seleccionado
    removeFile = () => {
      this.file.value = null;
      if (this.fileInput.value){
        this.fileInput.value = '';
        //se reinician los atributos para determinar advertencias en las notificaciones
        notificar.PosibleError = false;
        notificar.columnasNoContadas = false;
        notificar.posibleIngreso = false;
      } 
    }

    //se coloca el valor
    colocarValor = (event) => {
      this.file.value = event.target.files[0] //se accede al archivo que se selecciono
  }

}

class GestarIngreso extends ExperienciaUsuario{
  constructor(){
    //llamo al constructor de ExperienciaUsuario
    super();
  }
  determinarErrores = async () => {
    //se reinician los atributos para determinar advertencias en las notificaciones
    notificar.PosibleError = false;
    notificar.columnasNoContadas = false;
    notificar.posibleIngreso = false;

    if (!this.file.value)
      return;

    //se activa el modo del boton que indica que se esta procesando el archivo
    this.procesar.value = true;

    const formData = new FormData();
    formData.append("fileExcel", this.file.value); //esto empaqueta el archivo para que pueda ser enviado
    await store.mandarArchivo(formData, 'ingresar/determinar-error');

    if (!store.respuesta.mensaje){
        notificar.activarNotificacionError("Hubo problemas con el envio");
        this.procesar.value = false;
        return;
    }

    this.determinarPosibleIngreso()

    if (this._ExpcecionesGraves()) {
      this.procesar.value = false;
      return;
    };

    if (this._expcecionesEstructurales()) {
      this.procesar.value = false;
      return;
    };

    if (store.respuesta.mensaje == "ningun error"){
      
        //se determina si hay un posible ingreso para activar la notificacion
        if(Object.keys(store.respuesta.posibleIngreso).length)
          return notificar.activarNotificacionIngresar();
        
        notificar.activarNotificacionMandarClave();
    } 
  }


  //determina si hay un posible ingreso, para agregarlo a las notificaciones
  determinarPosibleIngreso(){
    if(Object.keys(store.respuesta.posibleIngreso).length){
        notificar.datosIngresar = store.respuesta.posibleIngreso;
    }
  }

  //comprueba las expceciones que detienen el ingreso en seco
  _ExpcecionesGraves(){
      //se determina si no se puede mandar ningun dato
      if(store.respuesta.mensaje == "ningun dato se puede mandar"){
        notificar.activarNotificacionError("ningun dato se puede mandar");
        return true
      }
      
      //se determina si estan las columnas fundamentales: categoria, condicion
      if(store.respuesta.columnaNoPresente){
          notificar.activarNotificacionError(`No se incluye la ${store.respuesta.columnaNoPresente} de los equipos`);
          return true;
      }

      return false;
  }

  // se comprueban las expcesiones en la estructura, como errores en el archivo o columnas innecesarias
  _expcecionesEstructurales(){

    if (store.respuesta.mensaje == "columnas innecesarias"){
        notificar.activarNotificacionAdvertencia("Estas columnas no se van a ingresar.¿desea mandar los datos?", store.respuesta.columnas, );
        return true;
    }

    if (store.respuesta.mensaje == "error"){
      if (store.respuesta.columnasNocontadas) notificar.columnasNoContadas = store.respuesta.columnasNocontadas;
           
      //se manda un notificacion indicando los errores
      notificar.activarNotificacionError("Hubo errores en el archivo mandado\n¿desea mandar los datos de todos modos?", store.respuesta.listaErrores, store.respuesta.columnasNocontadas);
            
      this._erroresCriticos() //se determina errores criticos   
      return true;
    }
  }
  //se determina los errores criticos
  _erroresCriticos(){
    if(store.respuesta.categoriaNula){
        notificar.errorCritico = "Existen errores en la columna de categorias";
    }

    //se determina si hay errores en los componentes
    else if(Object.keys(store.respuesta.listaErrores).find(element => element.includes("componente repetido"))){
      notificar.errorCritico = "Existen errores en las columnas de los componentes";
    }
  }

  //se ingresa ya los datos a la base de datos
  ingresar = async (desicion) => {

    let clave = this.file.value.name.replaceAll(".xlsx", "");
    if (desicion) clave = desicion //se cambia la clave, por el que pusimos

    await store.mandarJson({clave: clave}, "ingresar/determinar-clave-masiva");

    if (store.respuesta.mensaje){
        notificar.activarNotificacionError("la clave ya existe");
        this.procesar.value = false;
        return;
    }

    //enviamos los datos para ingresarlos
    let form = new FormData();
    form.append("fileExcel", this.file.value);
    form.append("clave", clave);
    form.append("id_usuario", datosUsuario.cedula);
    await store.mandarArchivo(form, "ingresar/mandar-excel");

    if(store.respuesta.mensaje){
        notificar.activarAdvertencia= false;
        notificar.activarError = false;
        notificar.activarMandarClave = false;
        notificar.activarNotificacionExito("el archivo se mando correctamente");
        this.removeFile(); //se remueve el archivo
    }else{
        notificar.activarAdvertencia = false;
        notificar.activarError = false;
        notificar.activarNotificacionError("no se pudo ingresar los datos");
        notificar.activarMandarClave = false;
    }

    //se desactiva el boton de que indica el procesamiento
    this.procesar.value = false;
}
}

const ingresar = new GestarIngreso();

//las respuestas de las notificaciones
let respuesta = (event) => {
    
    if(event == "error"){
      return notificar.activarNotificacionError("hubo errores en el proceso de guardar");
    }

    if(event){
        if(notificar.determinarAdvertencias()) return;
        notificar.activarError = false;
        notificar.activarAdvertencia = false;
        notificar.activarIngresar = false;
        notificar.activarNotificacionMandarClave();
    }else if(!event){
        notificar.activarAdvertencia = false;
    }
}


//se manda a la pestaña de campos disponibles
function visualizarCampos(){
  const routeData = ruta.resolve({ name: 'nombre-campos'});
  window.open(routeData.href, '_blank');
}

</script>

<template>
    <barraNavegacion>
       
    </barraNavegacion>
    <div class="page-container">
    

    <main class="content">
      <div class="upload-card">
        <div class="card-header">
          <h2>Cargar Archivo Excel</h2>
          <p>Sube tus reportes de Equipos Desincorporados Aquí.</p>
        </div>

        <div 
          class="drop-zone" 
          :class="{ 'is-dragging': ingresar.isDragging.value, 'has-file': ingresar.file.value }"
          @dragover.prevent="ingresar.handleDragOver" 
          @dragleave.prevent="ingresar.handleDragLeave" 
          @drop.prevent="ingresar.handleDrop"
          @click="ingresar.fileInput.click()"
        >
          <input 
            type="file" 
            :ref="(el) => { ingresar.fileInput = el }"
            class="hidden-input" 
            accept=".xlsx"
            @change="ingresar.colocarValor"
          />

          <div v-if="!ingresar.file.value" class="placeholder-content">
            <div class="icon-upload">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <p class="primary-text">Arrastra tu archivo Excel aquí</p>
            <p class="secondary-text">o haz clic para explorar (.xlsx)</p>
          </div>

          <div v-else class="file-preview">
            <div class="excel-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
            </div>
            <div class="file-info">
              <span class="file-name">{{ ingresar.file.value.name }}</span>

            </div>
            <button class="remove-btn" @click.stop="ingresar.removeFile">✕</button>
          </div>
        </div>

        <div class="actions">
          <button 
            class="btn-submit" 
            :disabled="!ingresar.file.value || ingresar.procesar.value"
            @click="ingresar.determinarErrores"
          >
            <span >{{ ingresar.procesar.value ? 'Procesando...' : 'Procesar Archivo' }}</span>
          </button>
        </div>
      <div class="opciones-adicionales" @click="visualizarCampos">
          <a href="#" class="link-olvido">Visualizar Campos Registrados</a>
      </div>
      </div>
    </main>
  </div>
    <notificacionAdv :activar="notificar.activarAdvertencia" :columnas="notificar.columnasAdvertencia" @cerrar="notificar.activarAdvertencia = false" 
    @respuesta="respuesta" :texto="notificar.texto"/>

    <notificacionError :activar="notificar.activarError" :texto="notificar.texto" :errores="notificar.columnasError" @cerrar="notificar.activarError = false;"
   @mandarDatos="respuesta" />

   <notificacionIngresar :activar="notificar.activarIngresar"  :datos="notificar.datosIngresar" @cerrar="notificar.activarIngresar = false;"
   @respuesta="respuesta"/>

    <notificacionExito :activar="notificar.activarExito" :texto="notificar.texto"  @cerrar="notificar.activarExito = false"/>

    <mandarClave :activar="notificar.activarMandarClave" @cerrar="notificar.activarMandarClave = false"
    @respuesta="ingresar.ingresar"/>
</template>

<style scoped>
/* Reset básico para el componente */
* {
  box-sizing: border-box;
}

/* Colores Profesionales */
:root {
  --primary-green: #2E7D32;      /* Verde Bosque */
  --light-green: #E8F5E9;        /* Fondo muy suave */
  --accent-green: #4CAF50;       /* Verde botón */
  --hover-green: #1B5E20;        /* Verde oscuro hover */
  --text-dark: #263238;
  --text-gray: #78909C;
  --border-color: #CFD8DC;
}

.page-container {
  min-height: 100vh;
  background-color: #f4f7f4; /* Fondo grisáceo verdoso muy sutil */
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
}


/* Contenido Principal */
.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.upload-card {
  background: white;
  width: 100%;
  max-width: 500px;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  text-align: center;
}

.card-header h2 {
  color: #263238;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.card-header p {
  color: #78909C;
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

/* Drop Zone */
.drop-zone {
  border: 2px dashed #CFD8DC;
  border-radius: 8px;
  padding: 2.5rem 1rem;
  background-color: #FAFAFA;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.drop-zone:hover, .drop-zone.is-dragging {
  border-color: #4CAF50;
  background-color: #E8F5E9;
  transform: translateY(-2px);
}

.drop-zone.has-file {
  border-style: solid;
  border-color: #2E7D32;
  background-color: #fff;
  padding: 1.5rem;
}

.hidden-input {
  display: none;
}

.icon-upload {
  color: #2E7D32;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.primary-text {
  font-weight: 600;
  color: #37474F;
  margin: 0 0 0.5rem 0;
}

.secondary-text {
  color: #90A4AE;
  font-size: 0.85rem;
  margin: 0;
}

/* Previsualización del archivo */
.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.excel-icon {
  background: #E8F5E9;
  padding: 10px;
  border-radius: 8px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 600;
  color: #2E7D32;
  font-size: 0.95rem;
  word-break: break-all;
}

.file-size {
  font-size: 0.8rem;
  color: #78909C;
}

.remove-btn {
  background: none;
  border: none;
  color: #B0BEC5;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #ef5350;
}

/* Mensajes y Botones */
.error-message {
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 1rem;
  background: #ffebee;
  padding: 0.5rem;
  border-radius: 4px;
}

.actions {
  margin-top: 2rem;
}

.btn-submit {
  width: 100%;
  background-color: #2E7D32;
  color: white;
  border: none;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}

.btn-submit:hover:not(:disabled) {
  background-color: #1B5E20;
}

.btn-submit:disabled {
  background-color: #B0BEC5;
  cursor: not-allowed;
}

.opciones-adicionales {
  text-align: left;
  margin-bottom: 1.5rem;
}

.link-olvido {
  font-size: 0.8rem;
  color: #42b883;
  text-decoration: none;
  font-family: Arial, Helvetica, sans-serif;
}

.link-olvido:hover {
  text-decoration: underline;
}

/* Barra de Progreso */
.progress-container {
  height: 4px;
  background-color: #E0E0E0;
  border-radius: 2px;
  margin-top: 1rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.2s ease;
}

/* Loader Spinner Simple */
.loader {
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top: 3px solid white;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>