<script setup>
import { ref } from 'vue';
import { aleatorio } from '../stores/aleatorio.js';
import { useRouter } from 'vue-router';

//se define los props y los emits
defineProps(['activar'])
const emit = defineEmits(['cerrar', 'mandarArchivo', 'conjunto']);

//constante que determina si se muestra la opcion de mandar archivo
const mandarArchivo = ref(false);

//constante contenedora del archivo
const selectedFile = ref(null);


const onFileChange = (e) => {
  selectedFile.value = e.target.files[0];
};


//se manda el promp con el archivo
function mandar(){
    const formData = new FormData();
    formData.append("actualizar", selectedFile.value);
    emit('mandarArchivo', selectedFile.value);
}

//se cierra el bloque
function limpiar(){
    emit('cerrar');
    selectedFile.value = false
}
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="activar" class="modal-overlay" @click.self="$emit('cerrar')">

      <div class="main-card">
        <Transition name="slide-fade" mode="out-in">

        <div v-if="!mandarArchivo" key="selection">
          <h1 class="title">¿Desea actualizar campos de manera conjunta o mediante un archivo?</h1>
          
          <div class="options-container">
          <div class="option-card" @click="$emit('conjunto')">
            <span class="icon">🔣</span>
            <h3 class="title">Conjunta</h3>
          </div>  
          <div class="option-card" @click="mandarArchivo = true">
            <span class="icon">☁️</span>
            <h3 class="title">Por Archivo</h3>
          </div>
          </div>
        </div>

        <div v-else key="upload" class="upload-view">
            <button class="volver" @click="mandarArchivo = false">volver -></button>

            <h2 class="title">Pase el Archivo</h2>
            
            <label class="drop-zone" for="file-input">
              <input type="file" id="file-input" @change="onFileChange" hidden />
              <div class="cloud-icon">☁️</div>
              <p>Haz clic para seleccionar un archivo</p>
              <p v-if="selectedFile" class="file-name">{{ selectedFile.name }}</p>
            </label>
            <div v-if="selectedFile" class="botones">

                <button  class="cancelar" @click="limpiar">
                Cancelar
                </button>

                <button  class="submit-btn" @click="mandar">
                Actualizar
                </button>
        </div>
            
          </div>

        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* --- Animaciones de Vue --- */

/* 1. Animación del Modal (Entrada General) */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .main-card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-fade-enter-from .main-card {
  transform: scale(0.9);
}

/* 2. Animación de Cambio de Contenido (Slide + Fade) */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* --- Estilos Base (Tus estilos originales con retoques) --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-family: sans-serif;
}

.main-card {
  background-color: #000000;
  color: white;
  padding: 3rem;
  border-radius: 20px;
  border: 1px solid #333;
  width: 90%;
  max-width: 650px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden; /* Evita scrolls raros durante la animación */
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.options-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.option-card {
  background-color: #111;
  border: 2px solid #333;
  padding: 2.5rem 1rem;
  border-radius: 15px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.option-card:hover {
  transform: scale(1.05);
  border-color: #4a90e2;
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-view {
  display: flex;
  flex-direction: column;
}

.back-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  align-self: flex-start;
  margin-bottom: 1rem;
  transition: color 0.2s;
}

.back-btn:hover { color: white; }

.drop-zone {
  border: 2px dashed #444;
  padding: 3rem;
  border-radius: 15px;
  text-align: center;
  background-color: #0a0a0a;
  cursor: pointer;
  transition: background-color 0.2s;
}

.drop-zone:hover { background-color: #151515; }

.cloud-icon { font-size: 2.5rem; margin-bottom: 1rem; }

.file-name {
  margin-top: 1rem;
  color: #4caf50;
  font-weight: bold;
}

.botones{
    display: flex;
}

.submit-btn {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.submit-btn:hover{
    background-color: #4c6;
}
.cancelar{
    margin-top: 2rem;
  padding: 1rem;
  background-color: #123;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 170px;
  margin-right: 80px;
}
.cancelar:hover{
    background-color: #245;
}

.volver{
  background-color: #000000;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode';
  color: #777;
  cursor: pointer;
  position: relative;
  border: none;
  left: 10;
  width: 100px;
}

@media (max-width: 480px) {
  .options-container { grid-template-columns: 1fr; }
}
</style>