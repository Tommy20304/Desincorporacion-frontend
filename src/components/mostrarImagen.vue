<template>
  <transition name="fade">
    <div v-if="activar" class="overlay-visor" @click.self="$emit('cerrar')">
      <button class="boton-cerrar" @click="$emit('cerrar')" title="Cerrar">
        &times;
      </button>

      <div class="contenedor-imagen">
        <img :src="url" alt="Vista ampliada" class="imagen-centrada">
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps(['activar', 'url']);

defineEmits(['cerrar']);
</script>

<style scoped>
.overlay-visor {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9); /* Fondo oscuro profundo */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.contenedor-imagen {
  max-width: 90%;
  max-height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.imagen-centrada {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  object-fit: contain; /* Mantiene la proporción original */
}

.boton-cerrar {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, background-color 0.2s ease;
  color: #333;
}

.boton-cerrar:hover {
  transform: scale(1.1);
  background-color: #ff4d4d;
  color: white;
}

/* Animación de entrada/salida */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>