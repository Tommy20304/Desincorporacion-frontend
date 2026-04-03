<script setup>
import { ref } from 'vue';

//se define los props y los emits
defineProps(["activar", "texto", "columnas", "preguntar", 'mandar']);
let emit = defineEmits(["cerrar", "respuesta"]);

//se manda la respuesta
let mandarRespuesta = (boo) => {
  emit("respuesta", boo)
}

</script>

<template>

    <Transition name="modal">
      <div v-if="activar" class="modal-overlay" @click.self="$emit('cerrar')">
        
        <div class="notification-box">
        <table>
            <tr>
                <td width="50%"></td>

                <td>
            <div class="icon-container">
            <svg class="warning-svg" viewBox="0 0 50 50">
              <circle class="circle" cx="25" cy="25" r="20"/>
              <line class="exclamation line" x1="25" y1="13" x2="25" y2="30" />
              <circle class="exclamation dot" cx="25" cy="38" r="2.5" />
            </svg>
            
          </div>
                </td>
                <td width="40%"></td>
                <td>
                    <button class="close-btn" @click="$emit('cerrar')">×</button>
                </td>
          </tr>
          </table>
          <div class="text-content">
            <h3>¡Advertencia!</h3>
            <p>{{ texto }}</p>
            <div class="table">
            <ul v-if="columnas" class="custom-list">
              <div v-if="!/\d/.test(Object.keys(columnas)[0].substring(0,1))">
                <li v-for="[coor, dato] in Object.entries(columnas)" :key="coor" class="list-item">
                  <span class="item-content">
                    <strong>{{ coor }}:</strong> {{ dato }}
                  </span>
                </li>
              </div>

              <div v-else>
                <li v-for="(value, index) in columnas" :key="index" class="list-item">
                  <span class="item-content">{{ value }}</span>
                </li>
              </div>
            </ul>

            </div>
            <ul v-if="columnas || preguntar" class="contenedor-botones">
              <li>
                <input 
                  class="boton-naranja" 
                  type="button" 
                  value="Si" 
                  @click="mandarRespuesta(true)"
                >
              </li>
              <li>
                <input 
                  class="boton-naranja" 
                  type="button" 
                  value="No" 
                  @click="mandarRespuesta(false)"
                >
              </li>
            </ul>
            <div v-if="mandar">
              <ul class="contenedor-botones">
              <li>
                <input 
                  class="boton-naranja" 
                  type="button" 
                  value="Unica" 
                  @click="mandarRespuesta('unica')"
                >
              </li>
              <li>
                <input 
                  class="boton-naranja" 
                  type="button" 
                  value="Multiple" 
                  @click="mandarRespuesta('multiple')"
                >
              </li>
            </ul>
            </div>
            
          </div>
          
          
        </div>

      </div>
    </Transition>

</template>

<style scoped>
/* --- Estilos Generales de la Página --- */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #ffffff;
  font-family: 'Arial', sans-serif;
  overflow: hidden; 
}

.content {
  text-align: center;
}
.table{
  max-height: 100px;
  margin: 10px 10px;
  overflow-y: auto;
}

/* --- Estilos del Modal y Overlay --- */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.notification-box {
  background: white;
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
  display: flex;
  align-items: center;
  font-family: sans-serif;
  flex-direction: column;
  text-align: center;
  gap: 20px;
  max-width: 450px;
  width: 90%;
  /* CAMBIO: Color del borde superior a Naranja */
  border-top: 5px solid #ffa502; 
}

.text-content h3 {
  margin: 0;
  /* CAMBIO: Color del texto a Naranja */
  color: #ffa502;
  font-size: 20px;
}

.text-content p {
  margin: 8px 0 0;
  color: #666;
  line-height: 1.4;
}

.custom-list {
  list-style: none; /* Quitamos los puntos de la lista */
  padding: 0;
  margin: 0;
  width: 100%;
}

.list-item {
  display: flex;
  justify-content: center; /* Centra el contenido horizontalmente */
  padding: 8px 0;
  border-bottom: 1px solid #eee; /* Opcional: una línea divisoria suave */
}

.item-content {
  text-align: center;
  /* Esto asegura que el texto se comporte de forma similar a tu celda central */
  max-width: 600px; 
  word-break: break-word;
}

.item-content strong {
  color: #2c3e50; /* Un color un poco más fuerte para las llaves/coordenadas */
  margin-right: 5px;
}

.close-btn {
  background: #f1f1f1;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s;
}

/* CAMBIO: Estilos para el botón de advertencia */
.boton-warning {
  font-size: 16px;
  padding: 5px;
  background-color: #ffa502; /* Naranja Advertencia */
  color: #ffffff;
  font-weight: bold;
  border: none;
  cursor: pointer;
  border-radius: 7px;
  transition: background-color 0.2s;
}

.boton-warning:hover {
  background-color: #e67e22; /* Un naranja un poco más oscuro al pasar el mouse */
}


.close-btn:hover {
  background: #e4e4e4;
  color: #333;
}

.contenedor-botones {
  display: flex;
  justify-content: center; /* Centra los botones horizontalmente */
  align-items: center;
  gap: 20px;               /* Espacio de separación entre botones */
  list-style: none;        /* Quita los puntos de la lista */
  padding: 20px 0;
  margin: 0;
  width: 100%;
}

.boton-naranja {
  background-color: #ff8c00; /* Naranja principal (DarkOrange) */
  color: white;
  border: none;
  padding: 10px 30px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px;      /* Bordes redondeados */
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  min-width: 80px;         /* Tamaño mínimo para que se vean uniformes */
}

/* Efecto al pasar el mouse */
.boton-naranja:hover {
  background-color: #e67e00; /* Un naranja un poco más oscuro */
  transform: scale(1.05);    /* Crece ligeramente */
}

/* Efecto al hacer clic */
.boton-naranja:active {
  background-color: #cc7000;
  transform: scale(0.95);
}

/* --- Vue Transition: "modal" --- */

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .notification-box {
  animation: bounce-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.modal-leave-active .notification-box {
  transition: transform 0.3s ease-in, opacity 0.3s ease-in;
  transform: scale(0.9);
  opacity: 0;
}


/* --- Animaciones SVG y Keyframes (MODIFICADOS PARA ADVERTENCIA) --- */
.icon-container { width: 45px; height: 45px; flex-shrink: 0; }
.warning-svg { width: 100%; height: 100%; }

/* El círculo exterior */
.circle {
  fill: none; 
  stroke: #ffa502; /* Color Naranja */
  stroke-width: 2.5;
  stroke-dasharray: 126; 
  stroke-dashoffset: 126;
  animation: drawCircle 0.6s ease forwards;
}

/* Estilos comunes para el signo de exclamación */
.exclamation {
  fill: none; 
  stroke: #ffa502; /* Color Naranja */
  stroke-width: 3; 
  stroke-linecap: round;
}

/* Animación de la línea vertical */
.line {
  stroke-dasharray: 20; 
  stroke-dashoffset: 20;
  animation: drawLine 0.3s ease 0.5s forwards;
}

/* Animación del punto (fade in simple o pop) */
.dot {
  fill: #ffa502; /* Relleno sólido para el punto */
  stroke: none; /* Sin borde */
  opacity: 0;
  transform-origin: 50% 50%;
  animation: popDot 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.7s forwards;
}

@keyframes drawCircle { to { stroke-dashoffset: 0; } }
@keyframes drawLine { to { stroke-dashoffset: 0; } }

@keyframes popDot { 
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes bounce-in {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}
</style>