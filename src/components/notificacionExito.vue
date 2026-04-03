<script setup>
defineProps(["activar", "texto"]);
let emit = defineEmits(["cerrar"]);

</script>

<template>

    <Transition name="modal">
      <div v-if="activar" class="modal-overlay" @click="$emit('cerrar')">
        <div class="notification-box success-theme" @click.stop>
        <table>
            <tr>
                <td width="50%"></td>
                <td>
                   <div class="icon-container">
                    <svg class="success-svg" viewBox="0 0 50 50">
                    <circle class="circle" cx="25" cy="25" r="20"/>
                    <path class="check" d="M14 26 L 22 34 L 36 16" />
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
            <h3>¡Operacion Exitosa!</h3>
            <p>{{ texto }}</p>
          </div>
        </div>

      </div>
    </Transition>

</template>

<style scoped>
/* --- Variables de Color --- */
/* Definimos el color verde principal aquí para usarlo fácilmente */
:root {
  --success-color: #2ecc71; 
}

/* --- Estilos Generales --- */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #ffffff;
  font-family: 'Arial', sans-serif;
  overflow: hidden; 
}

.content { text-align: center; }

/* Botón Verde */
.btn-success {
  padding: 12px 24px;
  background-color: #2ecc71; /* Verde */
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.btn-success:hover { background-color: #27ae60; }
.btn-success:active { transform: scale(0.95); }

/* --- Modal y Overlay (Estructuralmente igual al anterior) --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  z-index: 9999;
  /*backdrop-filter: blur(2px);*/
}

.notification-box {
  background: white;
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: center;
  gap: 20px;
  max-width: 450px;
  width: 90%;
}

/* Tema específico de éxito para la caja */
.notification-box.success-theme {
  border-top: 5px solid #2ecc71; /* Borde superior verde */
}

.text-content h3 {
  margin: 0;
  color: #2ecc71; /* Título verde */
  font-size: 20px;
}

.text-content p {
  margin: 8px 0 0;
  color: #666;
  line-height: 1.4;
}

.close-btn {
  background: #f1f1f1; border: none; width: 30px; height: 30px;
  border-radius: 50%; font-size: 18px; cursor: pointer;
 color: #666; display: flex;
  justify-content: center; align-items: center; transition: background 0.2s;
}
.close-btn:hover { background: #e4e4e4; color: #333; }

/* --- Vue Transitions (Igual que el anterior) --- */
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.modal-enter-active .notification-box {
  animation: bounce-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
.modal-leave-active .notification-box {
  transition: transform 0.3s ease-in, opacity 0.3s ease-in;
  transform: scale(0.9); opacity: 0;
}

/* --- Animaciones SVG de Éxito --- */
.icon-container { width: 45px; height: 45px; flex-shrink: 0; }
.success-svg { width: 100%; height: 100%; }

/* Círculo Verde */
.circle {
  fill: none;
  stroke: #2ecc71; /* Color verde */
  stroke-width: 2.5;
  stroke-dasharray: 126;
  stroke-dashoffset: 126;
  /* La animación del círculo es un poco más rápida ahora */
  animation: drawCircle 0.5s ease forwards;
}

/* El Checkmark (✔) */
.check {
  fill: none;
  stroke: #2ecc71; /* Color verde */
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  /* Definimos el largo del trazo para el truco de animación */
  stroke-dasharray: 40; 
  stroke-dashoffset: 40;
  /* Empieza después de que el círculo casi termina */
  animation: drawCheck 0.4s ease 0.4s forwards; 
}


/* Keyframes */
@keyframes drawCircle { to { stroke-dashoffset: 0; } }

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}

@keyframes bounce-in {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}
</style>