<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../stores/apis';
import { aleatorio } from '../stores/aleatorio';

//constantes fundamentales
const apis = api();
const router = useRouter();//se intancia el router
const random = aleatorio();
let parametro = ref();

//se genera el parametro
onMounted(() => {
  parametro.value = random.generarString(10);
})

//se definen los props y los emits
defineProps(["activar", "texto", "errores"]);
let emit = defineEmits(["cerrar", "mandarDatos"]);

//se mandan los datos
let mandarDatos = (boo) => {
  emit("mandarDatos", boo)
}

//se habre la pestaña con los errores
const pasarDato = async (element, file) => {  
  if(localStorage.getItem(parametro.value)){
    alert("la pagina ya esta abierta");
    return;
  }

  //se añade al almacenamiento local,pasandolo como json
  localStorage.setItem(parametro.value, JSON.stringify(element))
  
  //se obtiene la url
  const routeData = router.resolve({ name: 'errores', params: {parametro: parametro.value} }); 
  
  //Abrimos la URL en una nueva ventana/pestaña
  window.open(routeData.href, '_blank');

};

</script>

<template>

    <Transition name="modal">
      <div v-if="activar" class="modal-overlay" @click="$emit('cerrar')">
        
        <div class="notification-box" @click.stop>
        <table>
            <tr>
                <td width="50%"></td>

                <td>
            <div class="icon-container">
            <svg class="error-svg" viewBox="0 0 50 50">
              <circle class="circle" cx="25" cy="25" r="20"/>
              <path class="cross d1" d="M16 16 34 34" />
              <path class="cross d2" d="M34 16 16 34" />
              
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
            <h3>¡Error Crítico!</h3>
            <p>{{ texto }}</p>
            <ul v-if="errores" class="contenedor-acciones">
            <li>
              <button 
                class="btn btn-error" 
                @click="pasarDato(errores, archivo)"
              >
                Ver Errores
              </button>
            </li>
            <li>
              <button 
                class="btn btn-exito" 
                @click="mandarDatos(true)"
              >
                Mandar datos
              </button>
            </li>
          </ul>
            
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
  /* Importante: Evita que el scroll de la página principal interfiera */
  overflow: hidden; 
}

.content {
  text-align: center;
}

.contenedor-acciones {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;           /* Espacio exacto entre botones */
  list-style: none;
  padding: 0;
  margin-top: 15px;    /* Sustituye al div de 10px que tenías */
  width: 100%;
}

/* Base del botón */
.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Variante: Ver Errores (Rojo estilizado) */
.btn-error {
  background-color: #e63946; /* Rojo suave/moderno */
  color: #ffffff;
}

.btn-error:hover {
  background-color: #d62828;
  box-shadow: 0 4px 8px rgba(230, 57, 70, 0.3);
  transform: translateY(-1px);
}

/* Variante: Mandar Datos (Verde estilizado) */
.btn-exito {
  background-color: #2a9d8f; /* Verde azulado/esmeralda */
  color: #ffffff;
}

.btn-exito:hover {
  background-color: #21867a;
  box-shadow: 0 4px 8px rgba(42, 157, 143, 0.3);
  transform: translateY(-1px);
}

/* Efecto de pulsación */
.btn:active {
  transform: translateY(0);
}

/* --- Estilos del Modal y Overlay --- */

/* El fondo oscuro que cubre toda la pantalla */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6); /* Negro semitransparente */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centrado horizontal */
  align-items: center; /* Centrado vertical */
  z-index: 9999; /* Asegura que esté encima de todo */
  backdrop-filter: blur(2px); /* Opcional: un ligero desenfoque al fondo */
}

/* La caja de notificación en sí */
.notification-box {
  background: white;
  padding: 25px 30px;
  border-radius: 12px;
  /* Sombra más pronunciada para dar profundidad */
  box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
  display: flex;
  align-items: center;
  font-family: sans-serif;
  flex-direction: column;
  text-align: center;
  gap: 20px;
  max-width: 450px;
  width: 90%; /* Responsive en móviles */
  border-top: 5px solid #ff4757; /* Acento de color arriba en lugar de al lado */
}

.text-content h3 {
  margin: 0;
  color: #ff4757;
  font-size: 20px;
}

.text-content p {
  margin: 8px 0 0;
  color: #666;
  line-height: 1.4;
}

.close-btn {
  background: #f1f1f1;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
   /* Empuja el botón a la derecha */
  color: #666;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #e4e4e4;
  color: #333;
}

/* --- Vue Transition: "modal" --- */

/* 1. Transición para el fondo oscuro (fade in/out) */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 2. Animación específica para la caja interna al entrar */
.modal-enter-active .notification-box {
  /* Usamos la misma animación de rebote de antes */
  animation: bounce-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

/* 3. Transición específica para la caja interna al salir */
.modal-leave-active .notification-box {
  transition: transform 0.3s ease-in, opacity 0.3s ease-in;
  transform: scale(0.9); /* Se hace un poco más pequeña al salir */
  opacity: 0;
}


/* --- Animaciones SVG y Keyframes (Igual que antes) --- */
.icon-container { width: 45px; height: 45px; flex-shrink: 0; }
.error-svg { width: 100%; height: 100%; }

.circle {
  fill: none; stroke: #ff4757; stroke-width: 2.5;
  stroke-dasharray: 126; stroke-dashoffset: 126;
  animation: drawCircle 0.6s ease forwards;
}

.cross {
  fill: none; stroke: #ff4757; stroke-width: 3; stroke-linecap: round;
  stroke-dasharray: 30; stroke-dashoffset: 30;
}
.d1 { animation: drawCross 0.3s ease 0.5s forwards; }
.d2 { animation: drawCross 0.3s ease 0.7s forwards; }

@keyframes drawCircle { to { stroke-dashoffset: 0; } }
@keyframes drawCross { to { stroke-dashoffset: 0; } }

@keyframes bounce-in {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}
</style>