<template>
  <div class="pantalla-completa">
    <div class="login-card">
      <div class="header">
        <h2>Bienvenido</h2>
        <p>Ingresa tus credenciales para acceder</p>
      </div>

      <form @submit.prevent="comprobar" class="formulario">
        <div class="grupoFormulario">
          <label for="nombreUsuario">Cedula</label>
          <div class="input-w">
            <span class="icono">👤</span>
            <input 
              type="text" 
              id="nombreUsuario" 
              v-model="credenciales.cedula" 
              placeholder="Cedula"
              required
            />
          </div>
        </div>

        <div class="grupoFormulario">
          <label for="password">Contraseña</label>
          <div class="input-w">
            <span class="icono">🔒</span>
            <input 
              :type="mostrarPassword ? 'text' : 'password'" 
              id="password" 
              v-model="credenciales.password" 
              placeholder="Contraseña"
              required
            />
            <button 
              type="button" 
              class="btn-visibilidad" 
              @click="mostrarPassword = !mostrarPassword"
              tabindex="-1"
            >
              {{ mostrarPassword ? '👁️‍🗨️' : '👁️' }}
            </button>
          </div>
        </div>

        <button type="submit" class="boton-enviar" :disabled="cargando">
          {{ cargando ? 'Iniciando sesión...' : 'Entrar' }}
        </button>
      </form>
    </div>
    <notificacionError :activar="notificar.activarError" :texto="notificar.texto" :errores="notificar.columnasError" @cerrar="notificar.activarError = false;"
     />

    <notificacionAdv :activar="notificar.activarAdvertencia" :columnas="notificar.columnasAdvertencia" @cerrar="notificar.activarAdvertencia = false" 
     :texto="notificar.texto" :clase="'notification-box'"/>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import notificacionAdv from '../components/notificacionAdv.vue';
import notificacionError from '../components/notificacionError.vue';
import { api } from '../stores/apis.js';
import { controlNotificaciones } from '../stores/clase.js';

const store = api();

//se instancia la clase notificar
const local = controlNotificaciones();
const notificar = local.manejoNotificacion; 

//los credenciales
const credenciales = reactive({
  cedula: '',
  password: ''
});

//variable para controlar el boton de cargar
const cargando = ref(false);

// Nueva variable para controlar el estado de la contraseña
const mostrarPassword = ref(false);

//se comprueba el ingreso
async function comprobar() {
  try {
    cargando.value = true;

    //se hace la consulta
    await store.mandarSinToken(credenciales, 'usuario/acceder');;

    //se revisa si se logro crear el token
    if (store.respuesta.mensaje == "se creo el token") {
      localStorage.setItem('token', store.respuesta.token);
      localStorage.setItem('datosUsuario', JSON.stringify(store.respuesta.informacion));
      window.location.href = '/';
      return;
    } 

    if (store.respuesta.mensaje == "contraseña no valida"){
      cargando.value = false;
      notificar.activarNotificacionError("Contraseña incorrecta");
      return
    }

    if (store.respuesta.mensaje == "cedula no valida"){
        cargando.value = false;
        notificar.activarNotificacionError("No existe un usuario con esa cedula");
        return;
      }

    if (store.respuesta.mensaje == "usuario desactivado"){
      cargando.value = false;
      notificar.activarNotificacionError("Su usuario esta desactivado");
      return
    }

    cargando.value = false;
    
  } catch (e) {
    notificar.activarNotificacionError("Hubo Problemas en el Envio");
    console.error(e);
    cargando.value = false;
  }
}
</script>

<style scoped>
/* --- Tus estilos originales se mantienen --- */
.pantalla-completa {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: #f0f2f5;
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
}

.login-card {
  background-color: #ffffff;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.header h2 {
  margin: 0;
  color: #1a1a1a;
  font-size: 1.8rem;
  font-family: Arial, Helvetica, sans-serif;
}

.header p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  font-family: Arial, Helvetica, sans-serif;
}

.grupoFormulario {
  margin-bottom: 1.2rem;
  text-align: left;
}

label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 0.5rem;
  font-family: Arial, Helvetica, sans-serif;
}

.input-w {
  position: relative;
  display: flex;
  align-items: center;
}

.icono {
  position: absolute;
  left: 12px;
  z-index: 1;
}

input {
  width: 100%;
  padding: 12px 45px 12px 40px; /* Aumentamos el padding derecho para el botón */
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

/* --- Nuevos estilos para el botón de visibilidad --- */
.btn-visibilidad {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.2s;
}

.btn-visibilidad:hover {
  color: #cd1c29;
}

input:focus {
  outline: none;
  border-color: #cd1c29;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.opciones-adicionales {
  text-align: right;
  margin-bottom: 1.5rem;
}

.boton-enviar {
  width: 100%;
  padding: 14px;
  background-color: #cd1c29;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.boton-enviar:hover {
  background-color: #a10b12;
}

.boton-enviar:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}
</style>