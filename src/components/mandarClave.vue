<template>
<Transition name="fade">
  <div v-if="activar" class="overlay" @click.self="cerrar">
    <Transition name="pop" border-mode="out-in" appear>
    <div class="card">
      
    <button v-if="mostrarInput"  @click="mostrarInput = false" class="btn btn-link">Volver</button>
    <button class="boton-cerrar" @click="cerrar">&times;</button>

      <Transition name="slide-fade" mode="out-in">
      <div v-if="!mostrarInput" class="step">
        <h2>¿Deseas personalizar la clave?</h2>
        <p>Si no lo haces, se utilizará el nombre del archivo por defecto.</p>
        <div class="actions">
          <button @click="mostrarInput = true" class="btn btn-primary">Sí, quiero</button>
          <button @click="enviarEmit(false)" class="btn btn-secondary">No, ahora no</button>
        </div>
      </div>

      <div v-else class="step">
        <h2>Ingresa tu clave</h2>
        <input 
          v-model="clave" 
          type="text" 
          placeholder="Escribe aquí..." 
          class="input-field"
        />
        <div class="actions">
          <button @click="enviarClave" class="btn btn-success"  :disabled="enviando">
          {{ enviando ? 'Enviando...' : 'Enviar' }}
          </button>
          
        </div>
      </div>
      </Transition>
    </div>
    </Transition>
  </div>
</Transition>
</template>

<script setup>
import { ref , watch} from 'vue';

//se define los props y los emits
const props = defineProps(['activar'])
const emit = defineEmits(['cerrar', 'respuesta']);

//constantes fundamentales
const mostrarInput = ref(false);
const clave = ref('');
let enviando = ref(false);

//se envia la clave
const enviarClave = () => {
  if (clave.value.trim() === '') {
    alert("Por favor, ingresa una clave válida.");
    return;
  }
  enviando.value = true;
  enviarEmit(clave.value);
 
};

//se evia el emit
function enviarEmit(desicion){
    emit('respuesta', desicion)
}

//se cierra el Bloque
function cerrar(){
  emit('cerrar')
}

//cuando el activar sea falso, se resetea todo
watch(() => props.activar, (nuevoValor) => {
  if (!nuevoValor) {
    mostrarInput.value = false;
    clave.value = '';
    enviando.value = false;
  }
});
</script>

<style scoped>
/* Fondo Negro que cubre toda la pantalla */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
    /* El fondo con opacidad 0.6 */
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px); /* Efecto de desenfoque profesional */
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: sans-serif;
}

/* Bloque Blanco centrado */
.card {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

h2 {
  color: #333;
  margin-bottom: 1.5rem;
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

/* Estilos de botones e inputs */
.input-field {
  width: 100%;
  padding: 10px;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box; /* Importante para el padding */
  outline: none;
}
.input-field:focus {
  border-color: #cd1c29;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.8;
}

.btn-primary { background-color: #cd1c29; color: white; }
.btn-secondary { background-color: #e5e7eb; color: #374151; }
.btn-success { background-color: #e42012; color: white; }
.btn-link { background: none; color: #666; text-decoration: underline; 
  position: absolute;
  top: 10px;
  left: 15px;}

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
/* --- ANIMACIONES VUE --- */

/* Fade para el overlay */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Pop para la card */
.pop-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active { transition: all 0.2s ease-in; }
.pop-enter-from { opacity: 0; transform: scale(0.9) translateY(20px); }
.pop-leave-to { opacity: 0; transform: scale(0.9); }

/* Slide-Fade para el cambio de contenido interno */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from { transform: translateX(20px); opacity: 0; }
.slide-fade-leave-to { transform: translateX(-20px); opacity: 0; }

</style>