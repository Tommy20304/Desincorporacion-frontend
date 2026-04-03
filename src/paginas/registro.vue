<template>
  <div class="pantalla-completa">
    <div class="registro-card">
      <div class="header">
        <h2>Crear Cuenta</h2>
        <p>Ingresa tus datos para registrarte en el sistema</p>
      </div>

      <form @submit.prevent="manejarRegistro" class="formulario">
        <div class="form-group">
          <label for="nombre" >Nombre de Usuario</label>
          <div class="input-wrapper">
            <span class="icon">👤</span>
            <input 
              type="text" 
              id="nombre" 
              v-model="formulario.username" 
              placeholder="Nombre de usuario"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="cedula">Número de Identidad</label>
          <div class="input-wrapper">
            <span class="icon">🆔</span>
            <input 
              type="text" 
              id="cedula" 
              v-model="formulario.documento" 
              placeholder="Número de ID"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="cargo">Cargo</label>
          <div class="input-wrapper">
            <span class="icon">🏅</span>
            <select name="" id="cargo" v-model="formulario.cargo" required>
              <option value="trabajador">Trabajador</option>
              <option value="pasante">Pasante</option>
            </select>

          </div>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="input-wrapper">
            <span class="icon">🔒</span>
            <input 
              :type="mostrarPassword ? 'text' : 'password'"
              id="password" 
              v-model="formulario.password" 
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

        <button type="submit" class="btn-enviar" :disabled="registrando.value">
         {{ registrando.value ? 'Registrando...' : 'Registrar Usuario' }} 
        </button>
      </form>

    </div>
        <notificacionAdv :activar="notificar.activarAdvertencia" :columnas="notificar.columnasAdvertencia" @cerrar="notificar.activarAdvertencia = false" 
     :texto="notificar.texto" :clase="'notification-box'"/>

    <notificacionError :activar="notificar.activarError" :texto="notificar.texto" :errores="notificar.columnasError" @cerrar="notificar.activarError = false;"
   />

    <notificacionExito :activar="notificar.activarExito" :texto="notificar.texto"  @cerrar="notificar.activarExito = false"/>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import notificacionAdv from '../components/notificacionAdv.vue';
import notificacionError from '../components/notificacionError.vue';
import { controlNotificaciones } from '../stores/clase.js';
import notificacionExito from '../components/notificacionExito.vue';
import { api } from '../stores/apis.js';

// Estado del formulario
const formulario = reactive({
  username: '',
  documento: '',
  password: '',
  cargo: ''
});

//se instancia la clase notificar
const local = controlNotificaciones();
const notificar = local.manejoNotificacion;
const store = api(); 
const registrando = ref(false);

//mostrar contraseña
const mostrarPassword = ref(false);

const manejarRegistro = async () => {
  // Validación simple
  if (formulario.password.length < 6) {
    notificar.activarNotificacionError("la contraseña debe ser mayor a 6 digitos")
    return;
  }

  //se determina si todos los elementos de la cedula son numericos
  if(formulario.documento.match(/\d+/g) != formulario.documento){
    notificar.activarNotificacionError("Los Datos de la Cedula Deben ser Unicamente Numéricas");
    return;
  }
  registrando.value = true;

  await store.mandarJson(formulario, "usuario/registrar");

  //si la cedula ya existe
  if(store.respuesta.mensaje == "cedula ya existente"){
      registrando.value = false;
      notificar.activarNotificacionError("La Cedula ya Existe");
      return;
    }

  //si el nombre ya existe
  if(store.respuesta.mensaje == "nombre ya existente"){
    registrando.value = false;
    notificar.activarNotificacionError("el nombre de usuario ya existe");
    return;
  }

  //si hubo errores
  if(store.respuesta.mensaje == "hubo errores en el registro"){
    registrando.value = false;
    notificar.activarNotificacionError("hubo errores en el registro");
    return;
  }

  notificar.activarNotificacionExito("Se creo la Sesion");
  registrando.value = false;

  // Limpiar formulario
  Object.assign(formulario, { username: '', documento: '', password: '' , cargo: ''});
};
</script>

<style scoped>
/* Contenedor principal que ocupa toda la pantalla */
.pantalla-completa {
  display: flex;
  justify-content: center; /* Centrado horizontal */
  align-items: center;     /* Centrado vertical */
  min-height: 100vh;       /* 100% de la altura de la ventana */
  width: 100%;
  background-color: #f0f2f5; /* Color de fondo suave */
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
}

/* Tarjeta de registro */
.registro-card {
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
  font-family: Arial, Helvetica, sans-serif
}

.header p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

/* Estilos de los inputs */
.form-group {
  margin-bottom: 1.2rem;
  text-align: left;
}

label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 0.5rem;
  font-family: Helvetica, Arial , sans-serif
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icon {
  position: absolute;
  left: 12px;
  font-size: 1rem;
}

input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus {
  outline: none;
  border-color: #cd1c29;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

/* Botón */
.btn-enviar {
  width: 100%;
  padding: 14px;
  margin-top: 1rem;
  background-color: #cd1c29;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-enviar:hover {
  background-color: #a10b12;
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
  color: #a10b12;
}

/* Mensajes de estado */
.status-msg {
  margin-top: 1.5rem;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
}

select {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

select:focus {
  outline: none;
  border-color: #cd1c29;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}
</style>
