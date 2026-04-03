<template>
  <div v-if="activar" class="modal-overlay" @click.self="$emit('cerrar')">
    <transition name="pop" appear>
      <div class="principal-archivo">
        <div class="icono-contenedor">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>

        <h2 class="title">Subir archivo</h2>
        <p class="subtitle">Formatos permitidos: .xlsx</p>

        <label class="dropzone" :class="{ 'has-file': fileName }">
          <input type="file" @change="handleFileUpload" class="hidden-input" ref="fileInput" accept=".xlsx"/>
          <div class="dropzone-text">
            <span v-if="!fileName">Selecciona un archivo o arrástralo</span>
            <span v-else class="file-name">{{ fileName }}</span>
          </div>
        </label>

        <div class="actions">
          <button class="btn btn-secondary" @click="quitarArchivo">Cancelar</button>
          <button class="btn btn-primary" :disabled="!file || procesando" @click="mandar(activarDeshabilitado)">
           {{ procesando ? 'Procensado...' : 'Procesar Archivo' }} 
          </button>
        </div>
      </div>
    </transition>
  </div>
  <notificacionError :activar="bloque.activarError" :texto="bloque.texto" :errores="bloque.columnasError" @cerrar="bloque.activarError = false;"/>
 
</template>

<script setup>
import { ref} from 'vue';
import { api } from '../stores/apis';
import { controlNotificaciones } from '../stores/clase';
import notificacionAdv from '../components/notificacionAdv.vue';
import notificacionError from './notificacionError.vue';
import { clasesBusqueda } from '../stores/clasesBusquedad.js';

//se define los promps y los emits
const props = defineProps(['activar', 'activarDeshabilitado']);
const emit = defineEmits(['cerrar', 'datosBuscados']);

//variables fundamentales
const gestor = clasesBusqueda().gestor;
const store = api();
const manejoBloque = controlNotificaciones();
const bloque = manejoBloque.manejoNotificacion;
const procesando = ref(false);
const fileName = ref('');
const file = ref(null); //para mandar al backend
let fileInput = ref(null); //para borrarlo

//se comprueba que se haya mandado un archivo
const handleFileUpload = (event) => {
  const fileComprobar = event.target.files[0];
  if(fileComprobar){ 
    fileName.value = fileComprobar.name;
    file.value = fileComprobar
}
};

//se manda el archivo
const mandar = async (activarDesabilitado) => {
    if(!file) return;

    //se determina el activarDesabilitado
    const formData = new FormData();
    const activarDesabilitadoString = activarDesabilitado ? 'true' : 'false';

    //se forma el formData
    formData.append("fileExcel", file.value);
    formData.append("activarDeshabilitado", activarDesabilitadoString);

    //se activa el procesando
    procesando.value = true; 

    //se hace la peticion
    await store.mandarArchivo(formData, 'buscar/archivo');
   
    procesando.value = false; //se desactiva el procesando

    //se manda la respuesta
    emit('datosBuscados', store.respuesta)

};

//se quita el archivo
function quitarArchivo(){
    emit('cerrar');
    fileInput.value.value = '' //se limpia el file
    fileName.value = null;
    file.value = null;
}

</script>

<style scoped>
/* Contenedor principal (Overlay) */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* Tarjeta Central */
.principal-archivo {
  background: #18181b; /* Zinc 900 */
  width: 100%;
  max-width: 450px;
  border-radius: 24px;
  padding: 40px;
  border: 1px solid #27272a;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  text-align: center;
}

/* Icono */
.icono-contenedor {
  width: 64px;
  height: 64px;
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

/* Textos */
.title {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 8px;
}
.subtitle {
  color: #a1a1aa;
  font-size: 0.9rem;
  margin-bottom: 30px;
}

/* Area de Carga */
.dropzone {
  display: block;
  border: 2px dashed #3f3f46;
  border-radius: 16px;
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(39, 39, 42, 0.3);
}
.dropzone:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}
.dropzone.has-file {
  border-style: solid;
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}
.hidden-input {
  display: none;
}
.dropzone-text {
  color: #d4d4d8;
  font-size: 0.95rem;
}
.file-name {
  color: #818cf8;
  font-weight: 500;
}

/* Botones */
.actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}
.btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}
.btn-secondary {
  background: transparent;
  color: #a1a1aa;
}
.btn-secondary:hover {
  background: #27272a;
  color: #ffffff;
}
.btn-primary {
  background: #4f46e5;
  color: white;
}
.btn-primary:hover {
  background: #4338ca;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- ANIMACIONES VUE --- */
.pop-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>