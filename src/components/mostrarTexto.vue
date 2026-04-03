<script setup>
defineProps(["activar", "texto"]);
let emit = defineEmits(["cerrar"]);
</script>

<template>
  <transition name="fade">
    <div v-if="activar" class="todo" @click.self="$emit('cerrar')">
      
      <transition name="pop" appear>
        <div class="modal-content">
          <button class="close" @click="$emit('cerrar')">
            &times;
          </button>
          
          <div class="scroll-area">
            <slot v-if="typeof texto == 'string'">
              <p style="font-family: Arial, Helvetica, sans-serif;">{{ texto }}</p>
            </slot>
            <div v-else>
              <p v-for="i in texto">-{{ i }}</p>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </transition>
</template>

<style scoped>
.todo {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* El fondo con opacidad 0.6 */
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* --- ANIMACIÓN FADE (Para el fondo) --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- ANIMACIÓN POP (Para la caja blanca) --- */
.pop-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  /* Un pequeño delay para que el fondo se vea primero */
  transition-delay: 0.1s;
}

.pop-leave-active {
  transition: all 0.2s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

/* Estilos de estructura (se mantienen igual) */
.modal-content {
  background: white;
  border-radius: 12px;
  position: relative;
  max-width: 500px;
  width: 90%;
  max-height: 50vh; 
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  
}

.scroll-area {
  padding: 2.5rem 2rem 2rem 2rem;
  overflow-y: auto;
  font-family: Arial, Helvetica, sans-serif;
  flex-grow: 1;
}
/* Estética del scrollbar (opcional, para que se vea más moderno) */
.scroll-area::-webkit-scrollbar {
  width: 8px;
}
.scroll-area::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
.scroll-area::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

.close {
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
}
</style>