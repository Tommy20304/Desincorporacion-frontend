<template>
  <Teleport to="body">
    <Transition name="fade-bounce">
      <div v-if="activar" class="overlay" @click.self="$emit('cerrar')">
        <div class="card">
          <button class="boton-cerrar" @click="emit('cerrar')">&times;</button>
          
          <div class="step">
            <h2>Ingresa la Ubicación</h2>
            
            <div class="form-group relative space-bottom">
                <input 
                  v-model="ubicacion" 
                  type="text" 
                  placeholder="Escribe aquí..." 
                  @focus="activarUbicacion = true"
                  @blur="handleBlur"
                  class="input-field"
                />
                
                <Transition name="slide-down">
                  <ul v-if="activarUbicacion && filteredCats.length" class="custom-datalist">
                      <li v-for="item in filteredCats" :key="item" @mousedown="seleccionarOpcion(item)">
                          {{ item }}
                      </li>
                  </ul>
                </Transition>
            </div>

            <div class="actions">
              <button @click="enviarUbicacion(metodo)" class="btn btn-success" :disabled="procesando">
                {{ procesando ? 'Procesando...' : 'Procesar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { clasesBusqueda } from '../stores/clasesBusquedad';

//se define los props y los emits
const emit = defineEmits(['respuesta', 'cerrar', 'pasarUbicacion']);
const props = defineProps(['activar', 'metodo']);

//constantes fundamentales
const ubicacion = ref('');
const activarUbicacion = ref(false);
const datosUbicacion = ref([]);
const gestor = clasesBusqueda().gestor;
const procesando = ref(false);

//se hace la peticion http para obtener las ubicaciones y se almacenan en datosUbicacion
onMounted(async () => { 
  await gestor.store.leer('eliminar/obtener-ubicaciones');

  if(gestor.store.respuesta.mensaje)
    datosUbicacion.value = gestor.store.respuesta.ubicaciones;

});


// funciones para el funcionamiento del bloque donde se visualizan las ubicaciones
function extraerValores() {
    return datosUbicacion.value.map(item => item.ubicacion_actual);
}   

const filteredCats = computed(() =>
    extraerValores().filter(c => c.toLowerCase().includes(ubicacion.value.toLowerCase()))
);

function seleccionarOpcion(opcion) {
    ubicacion.value = opcion;
    activarUbicacion.value = false;
}

// Para evitar que el blur cierre la lista antes del click
function handleBlur() {
    setTimeout(() => { activarUbicacion.value = false; }, 200);
}

//se envia la ubicaciones
const enviarUbicacion = async (metodo) => {

  //se determina que no se envio ningun texto
  if (ubicacion.value.trim() === '') {
    alert("Por favor, ingresa una Ubicacion.");
    return;
  }

  //se comprueba que la ubicacion ingresada existe en datosUbicacion
  if (!extraerValores().includes(ubicacion.value.toUpperCase())) {

    if (!confirm("La ubicación ingresada no existe. ¿Deseas ingresarla?")) return

    //se hace la peticion para guardar la ubicacion
    await gestor.store.mandarJson({datos: {ubicaciones: ubicacion.value.toUpperCase()}}, "ingresar/guardar-datos");

    //si hay un error, se manda en el emit
    if (!gestor.store.respuesta.mensaje) {
        emit('pasarUbicacion', 'error');
        return;
    }
    
  }

  //se pasa la ubicacion
  emit('pasarUbicacion', {ubicacion: ubicacion.value.toUpperCase(), metodo: metodo});

  procesando.value = true; // Activamos el estado de procesamiento
};

watch(() => props.activar, (nuevoValor) => {
  if (!nuevoValor) {
    // Reiniciamos el estado cuando se cierra el bloque
    ubicacion.value = '';
    activarUbicacion.value = false;
    procesando.value = false;
  }
});
</script>

<style scoped>

.space-bottom {
  margin-bottom: 2.5rem; /* Genera el espacio para que la lista respire */
}

.custom-datalist {
  position: absolute;
  top: 42px; /* Altura aproximada del input */
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #cd1c29;
  border-radius: 0 0 8px 8px;
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 100;
  /* Aumentamos la altura máxima para que se vea más de un item */
  max-height: 100px; 
  overflow-y: auto;
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

/* --- TUS ESTILOS BASE --- */
.overlay {
 position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75); /* Un poco más oscuro para resaltar */
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999; /* Por encima de todo */
  font-family: sans-serif;
}

.card {
    position: relative; /* Para el botón cerrar */
  background-color: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.input-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  outline: none;
}

.input-field:focus {
  border-color: #cd1c29;
}

.relative { position: relative; }

.custom-datalist li {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.custom-datalist li:hover {
  background-color: #f0f7ff;
}

.btn-success {
  background-color: #cd1c29;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: 100%; /* Botón ancho para mejor UI */
  transition: opacity 0.3s ease;
}

.btn-success:hover {

  opacity: 0.8;
}
h2 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}
p {
  color: #5b6270;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.boton-cerrar{
    position: absolute;
  top: 10px;
  right: 15px;
  border: none;
  background: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.boton-cerrar:hover{
  transform: scale(1.1);
  background-color: #ff4d4d;
  color: white;
}

/* --- ANIMACIÓN DE ENTRADA/SALIDA (MODAL) --- */
.fade-bounce-enter-active {
  transition: all 0.3s ease-out;
}
.fade-bounce-leave-active {
  transition: all 0.2s ease-in;
}
.fade-bounce-enter-from,
.fade-bounce-leave-to {
  opacity: 0;
  /*transform: scale(0.9) translateY(-20px);*/
}

/* --- ANIMACIÓN DE LA LISTA (DROPDOWN) --- */
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>