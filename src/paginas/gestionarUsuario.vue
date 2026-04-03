<template>
  <div class="app-container">
    <div class="card">
      <nav class="tabs">
        <button @click="tab = 'add'" :class="['tab-btn', { active: tab === 'add' }]"> Modo Administrador</button>
        <button @click="tab = 'remove'" :class="['tab-btn', { active: tab === 'remove', danger: true }]"> Activación de Usuario</button>
        <button @click="tab = 'cambiarContraseña'" :class="['tab-btn', { active: tab === 'cambiarContraseña', danger: true }]"> Cambiar Contraseña</button>
      </nav>

      <div class="content">
        <section v-if="tab === 'add'" class="view fade-in">

          <header class="view-header">

            <h2 v-if="!administrador.modo.value">Quitar Modo Administrador</h2>
            <h2 v-else>Agregar Modo Administrador</h2>

            <div class="toggle-container">
              <label class="switch">
                <input type="checkbox" v-model="administrador.modo.value">
                <span class="slider"></span>
              </label>
              <span class="toggle-label">Modo: {{ administrador.modo.value ? 'Agregar' : 'Quitar' }}</span>
            </div>

          </header>
            <div v-if="datosRecibidos.length > 0" class="seleccionar">
                <label class="fiel-label">Usuarios</label>
                <select class="custom-input" v-model="administrador.valorAdministrador.value" :size="Math.min(Math.max(administrador.usuariosNoAdministradores(datosRecibidos).length, 4), 6)">
                    <option value="">Seleccionar un Usuario</option>

                    <option v-if="administrador.modo.value" v-for="filas in administrador.usuariosNoAdministradores(datosRecibidos)"  :key="filas" :value="filas.cedula" >
                        {{ filas.nombre_usuario }}
                    </option>

                    <option v-else v-for="filas in administrador.usuariosAdministradores(datosRecibidos)" :value="filas.cedula" >
                        {{ filas.nombre_usuario }}
                    </option>

                </select>

                <button v-if="administrador.valorAdministrador.value && administrador.modo.value" class="boton-administrador" @click="administrador.agregarAdministrador(administrador.valorAdministrador.value)">Agregar Modo Administrador</button>

                <button v-else-if="administrador.valorAdministrador.value && !administrador.modo.value" class="boton-administrador" @click="administrador.quitarAdministrador(administrador.valorAdministrador.value)">Quitar Modo Administrador</button>
            
              </div>

          

        </section>

        <section v-else-if="tab === 'remove'" class="view fade-in">

          <header class="view-header">

            <h2 v-if="!activarDesactivar.modo.value" >Desactivar Usuarios</h2>
            <h2 v-else >Activar Usuarios</h2>

            <div class="toggle-container">
              <label class="switch">
                <input type="checkbox" v-model="activarDesactivar.modo.value">
                <span class="slider"></span>
              </label>
              <span class="toggle-label">Modo: {{ activarDesactivar.modo.value ? 'Activar' : 'Desactivar' }}</span>
            </div>
            </header>

           <div v-if="datosRecibidos.length > 0" class="seleccionar">
                <label class="fiel-label">Usuarios</label>
                <select class="custom-input" v-model="activarDesactivar.valorSeleccionado.value" :size="Math.min(Math.max(datosRecibidos.length, 4), 4)">

                    <option value="">Seleccionar un Usuario</option>

                    <option v-if="!activarDesactivar.modo.value" v-for="filas in datosRecibidos"  :key="filas" :value="filas.cedula" >
                        {{ filas.nombre_usuario }}
                    </option>

                    <option v-else v-for="filas in usuariosDesactivados" :value="filas.cedula" >
                        {{ filas.nombre_usuario }}
                    </option>
                </select>

               <button v-if="activarDesactivar.valorSeleccionado.value && activarDesactivar.modo.value" class="boton-administrador" @click="activarDesactivar.activarUsuario(activarDesactivar.valorSeleccionado.value)">Activar Usuario</button>

                <button v-else-if="activarDesactivar.valorSeleccionado.value && !activarDesactivar.modo.value" class="boton-administrador" @click="activarDesactivar.desactivarUsuario(activarDesactivar.valorSeleccionado.value)">Desactivar Usuario</button>
           
            </div>
        </section>

        <section v-else class="view fade-in">
          <h2 style="text-align: center;">Cambiar Contraseña</h2>
           <div v-if="datosRecibidos.length > 0" class="seleccionar">

                <label class="fiel-label">Usuarios</label>
                <select class="custom-input" v-model="password.idUsuario.value" :size="Math.min(Math.max(datosRecibidos.length, 4), 4)">

                    <option value="">Seleccionar un Usuario</option>
                    <option v-for="filas in datosRecibidos" :key="filas" :value="filas.cedula">{{ filas.nombre_usuario }}</option>
                
                  </select>

                <div v-if="password.idUsuario.value" class="cambiar-contraseña">
                  <label>Ingrese la nueva contraseña</label>
                  <input v-model="password.contraseña.value" id="cambiar" type="text" class="input-contraseña" placeholder="Contraseña">
                  <button class="boton-cambiar" :disabled="!password.contraseña.value" @click="password.cambiarPassword" >Cambiar</button>
                </div>

            </div>
        </section>

      </div>
    </div>
  </div>
  <notificacionError :activar="notificar.activarError" :texto="notificar.texto" :errores="notificar.columnasError" @cerrar="notificar.activarError = false;"/>
  
    <notificacionExito :activar="notificar.activarExito" :texto="notificar.texto"  @cerrar="notificar.activarExito = false"/>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import notificacionError from '../components/notificacionError.vue';
import notificacionExito from '../components/notificacionExito.vue';
import { api } from '../stores/apis';
import { controlNotificaciones } from '../stores/clase.js';

//variables fundamentales
const store = api();
const notificar = controlNotificaciones().manejoNotificacion;
let datosRecibidos = ref([]);
let usuariosDesactivados = ref([]);
const datosUsuario = JSON.parse(localStorage.getItem('datosUsuario'));

//el tab que se inicializa con 'add'
let tab = ref('add');

//para reiniciar la informacion cuando se complete una operacion
async function reiniciarInformacion(){
  await store.leer('usuario/ver-datos')
  datosRecibidos.value = store.respuesta.datos;

  await store.leer("usuario/ver-datos-desactivado");
  usuariosDesactivados.value = store.respuesta.datos;
}

class ModoAdministrador{
  constructor(){
    this.valorAdministrador = ref("");
    this.modo = ref("");
  }

  //se reinicia todo
  reiniciar(){
    this.valorAdministrador.value = "";
    reiniciarInformacion();
  }

  //funcion para filtrar los usuarios que no son administradores
  usuariosNoAdministradores(datos){
    if(!datos) return;
    let nuevosDatos = datos.filter(fila => fila.cargo != 'administrador');
    return nuevosDatos;
  }

  //se añade el administrador
  async agregarAdministrador(cedula){
    await store.mandarJson({cedula: cedula}, "usuario/agregar-administrador");
    if(!store.respuesta.mensaje){
        return notificar.activarNotificacionError("Hubo Problemas en la Asignacion");
    }
    notificar.activarNotificacionExito("Se Asigno el Cargo");
    this.reiniciar();
  } 

  //funcion para filtrar los usuarios que son administradores
  usuariosAdministradores(datos){
    if(!datos) return;
    let nuevosDatos = datos.filter(fila => fila.cargo === 'administrador');
    return nuevosDatos;
  }

  //quitar cargo de administrador
  async quitarAdministrador(cedula){
     await store.mandarJson({cedula: cedula}, "usuario/quitar-administrador");
    if(!store.respuesta.mensaje){
        return notificar.activarNotificacionError("Hubo Problemas en la Asignacion");
    }
    notificar.activarNotificacionExito("Se Quito el Cargo");
    this.reiniciar();
  }
}

class ActivarDesactivar{
  constructor(){
    this.valorSeleccionado = ref("");
    this.modo = ref("");
  }

  reiniciar(){
    this.valorSeleccionado.value = "";
    reiniciarInformacion();
  }

  //filtra solo los usuarios que estan activados
  activados(datos){
    if(!datos) return
    return datos.filter(fila => fila.estado === 'activado');
  }

  //filtra solo los usuarios que estan desactivados
  desactivados(datos){
    if(!datos) return
    return datos.filter(fila => fila.estado === 'desactivado');
  }

  //se desactiva el usuario
  async desactivarUsuario(){
    if(!confirm("estas seguro en desactivar a este usuario")) return;

    if(datosUsuario.cedula == this.valorSeleccionado.value){
        return notificar.activarNotificacionError("te estas intentando desactivar a ti mismo");
    }

    await store.mandarJson({cedula: this.valorSeleccionado.value}, "usuario/desactivar-usuario");
    if(!store.respuesta.mensaje){
        return notificar.activarNotificacionError("Hubo Problemas en la Operacion");
    }
    notificar.activarNotificacionExito("Se Desactivo el Usuario");
    this.reiniciar();
  }

  //se activa el usuario
  async activarUsuario(){
    if(!confirm("estas seguro en activar a este usuario")) return;

    await store.mandarJson({cedula: this.valorSeleccionado.value}, "usuario/activar-usuario");
    if(!store.respuesta.mensaje){
        return notificar.activarNotificacionError("Hubo Problemas en la Operacion");
    }
    notificar.activarNotificacionExito("Se Activo el Usuario");
    this.reiniciar();
  }
}

class CambiarContrasela{
  constructor(){
    this.idUsuario = ref("");
    this.contraseña = ref("");
  }
  
  reiniciar(){
    this.idUsuario.value = "";
    this.contraseña .value= "";
    reiniciarInformacion();
  }

  //se cambia la contraseña
  async cambiarPassword(){
  await store.mandarJson({id: this.idUsuario.value, contraseña: this.contraseña.value}, "usuario/cambiar-password");

  if(!store.respuesta.mensaje){
    notificar.activarNotificacionError("Hubo errores en la actualizacion");
    return;
  }

  notificar.activarNotificacionExito("Se actualizo la contraseña correctamente");
  this.reiniciar();
}
}

//constantes de entorno
const valorAdministrador = ref("");
const valorEliminar = ref("");
const valorCambiarContraseña = ref("");
const valorContraseña = ref("");

//se busca los datos del servidor
onMounted(async () => { 
    //usuarios activados
    await store.leer('usuario/ver-datos')
    datosRecibidos.value = store.respuesta.datos;

    //usuarios desactivados
    await store.leer("usuario/ver-datos-desactivado");
    usuariosDesactivados.value = store.respuesta.datos;
})

//se crean los objetos
const administrador = new ModoAdministrador;
const activarDesactivar = new ActivarDesactivar;
const password = new CambiarContrasela;

</script>

<style scoped>
/* --- ESTILOS PROFESIONALES (Vanilla CSS) --- */
.app-container {
  min-height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Inter', system-ui, sans-serif;
  padding: 20px;
}

.view{
  width: 90%;
}

.select{
  max-height: 50px;
}

.card {
  background: white;
  width: 100%;
  max-width: 800px;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 20px;
  border: none;
  background: none;
  font-weight: 600;
  cursor: pointer;
  color: #888;
  transition: 0.3s;
}

.tab-btn.active {
  color: #dc2626;
  background: white;
  box-shadow: inset 0 -2px 0 #dc2626;
}

.tab-btn.active.danger {
  color: #dc2626;
  box-shadow: inset 0 -2px 0 #dc2626;
}

.content { padding: 40px;}

.view-header {
  display: flex;
  justify-content: space-between; 
  align-items: center;
  margin-bottom: 30px;
  width: 100%; /* Asegura que use todo el espacio */
}


.form-group { display: flex; flex-direction: column; gap: 8px; }

.fiel-label {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 1px;
}

.custom-input {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: 0.2s;
  outline: none;
 
}

.custom-input:focus { border-color: #2563eb; }
.custom-input.highlight { border-color: #f44336; background: #f0fdf4; }

.add-input-group { display: flex;  }

.inline-add-btn {
  background: #cd1c29;
  color: white;
  border: none;
  width: 45px;
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
}

/* Switch Toggle Estilo iOS */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px; width: 18px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider { background-color: #f44336; }
input:checked + .slider:before { transform: translateX(20px); }

/* 2. Alineación interna del switch y su etiqueta */
.toggle-container {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Alinea el contenido a la derecha del contenedor */
  gap: 10px; /* Espacio entre el switch y el texto */
}



.toggle-label {
  font-size: 0.85rem;
  margin-left: 0; /* Quitamos el margin-left previo */
  font-weight: 500;
  color: #475569;
  white-space: nowrap; /* Evita que el texto se rompa en dos líneas */
}

.seleccionar{
    display: flex;
    flex-direction: column;
    text-align: center;
}
.boton-administrador{
    background-color: #cd1c29;
    color: #fff;
    margin-top: 20px;
    border: none;
    text-align: center;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    padding: 10px;
    animation: admi 0.4s ease;
    transition: background-color 0.3s ease;
    border-radius: 10px;
}
.boton-eliminar{
    background-color: #dc2626;;
    color: #fff;
    margin-top: 20px;
    border: none;
    text-align: center;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    padding: 10px;
    animation: admi 0.4s ease;
    transition: background-color 0.3s ease;
    border-radius: 10px;
}

.cambiar-contraseña{
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

}
.cambiar-contraseña label{
  margin-bottom: 8px;
  font-weight: 500;
}

.input-contraseña{
  width: 30vh;
  padding: 10px;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box; 
  outline: none;
}

.input-contraseña:focus{
  border-color: #f44336;
}

.boton-cambiar{
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;
  background-color: #cd1c29; 
  color: white;
}

.boton-cambiar:hover{
  opacity: 0.8;
}


.fade-in { animation: fadeIn 0.4s ease;}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes admi { from { opacity: 0; } to { opacity: 1; } }
</style>