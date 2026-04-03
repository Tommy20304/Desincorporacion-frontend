<template>
  <div class="app-container">
    <div class="card">
      <nav class="tabs">
        <button @click="manipular.tab.value = 'add'" :class="['tab-btn', { active: manipular.tab.value === 'add' }]"> Añadir Dato</button>
        <button @click="manipular.tab.value = 'remove'" :class="['tab-btn', { active: manipular.tab.value === 'remove', danger: true }]"> Eliminar Dato</button>
        <button @click="manipular.tab.value = 'update'" :class="['tab-btn', { active: manipular.tab.value === 'update', update: true }]"> Actulizar Dato</button>
        <button @click="manipular.tab.value = 'updateEspecial'" :class="['tab-btn', { active: manipular.tab.value === 'updateEspecial', update: true }]"> Actulizar Varios Datos</button>
      </nav>

      <div class="content-">
        <section v-if="manipular.tab.value === 'add'" class="view fade-in">
          <header class="view-header">
            <h2>Manipular Datos</h2>
            <div class="toggle-container">
              <label class="switch">
                <input type="checkbox" v-model="manipular.editMode.value">
                <span class="slider"></span>
              </label>
              <span class="toggle-label">Modo: {{ manipular.editMode.value ? 'Agregar nuevo valor' : 'Vista' }}</span>
            </div>
          </header>

          <div class="grid-form">
            <div v-for="(valor, clave) in datosRecibidos.datos" :key="clave" class="form-group">

              <label class="field-label">{{ clave }}</label>
              
              <select  class="custom-input" :size="Math.min(Math.max(valor.length, 2), 6)">

                <option value="">Seleccionar {{ clave }}</option>
                <option v-for="fila of valor" :key="fila" :value="Object.values(fila)[0]">{{ Object.values(fila)[1] }}</option>
                
              </select>

              <div v-if="manipular.editMode.value" class="add-input-group">
                <input 
                  type="text" 
                  v-model="manipular.input[clave]" 
                  placeholder="Ingrese un Valor"
                  class="custom-input highlight"
                />
                <button @click="guardar(clave)" class="inline-add-btn">+</button>
              </div>
            </div>
          </div>

        </section>

        <section v-else-if="manipular.tab.value === 'remove'" class="view fade-in">
          <h2>Eliminar Atributos</h2>
          <p class="subtitle">Selecciona el dato específico que deseas borrar del sistema.</p>
          
          <div class="grid-form">
            <div v-for="(valor, clave) in datosRecibidos.datos" :key="clave" class="form-group">
              <label class="field-label">{{ clave }}</label>

              <select v-model="manipular.seleccionEliminar[clave]" class="custom-input delete-focus" :size="Math.min(Math.max(valor.length, 2), 6)">
                <option value="" >Seleccionar para borrar...</option>
                <option v-for="file in valor" :key="file" :value="Object.values(file)[0]">{{ Object.values(file)[1] }}</option>
              </select>

              <button 
                @click="eliminar(clave)" 
                :disabled="!manipular.seleccionEliminar[clave]"
                class="btn-text-danger"
              >
                Eliminar de {{ clave }}
              </button>
            </div>
          </div>
        </section>

        <section v-else-if="manipular.tab.value === 'update'" class="view fade-in">

           <h2>Actualizar Atributos</h2>
          <p class="subtitle">Selecciona el dato específico que deseas actualizar en el sistema.</p>
          
          <div class="grid-form">
            <div v-for="(valor, clave) in datosRecibidos.datos" :key="clave" class="form-group">
              <label class="field-label">{{ clave }}</label>

              <select v-model="manipular.seleccionActualizar[clave]" class="custom-input delete-focus" :size="Math.min(Math.max(valor.length, 2), 6)"
              @change="manipular.asignarValor(manipular.seleccionActualizar[clave], clave, valor)">
                <option value="" >Seleccionar para Actualizar...</option>
                <option v-for="file in valor" :key="file" :value="Object.values(file)[0]">{{ Object.values(file)[1] }}</option>
              </select>

              <input 
                  v-if="manipular.seleccionActualizar[clave]"
                  type="text" 
                  v-model="manipular.valorActualizar[clave]" 
                  placeholder="Ingrese un Valor"
                  class='input-update'
                />

              <button 
                @click="actualizar(clave)" 
                :disabled="!manipular.seleccionActualizar[clave]"
                class="btn-text-update"
              >
                Actualizar {{ clave }}
              </button>
            </div>
          </div>
        </section>

        <section v-else class="view fade-in">

          <h2>Actualizar Varios Atributos</h2>
          <p class="subtitle">Selecciona los datos que quieres cambiar y se actualizan en un unico dato</p>
          
          <div class="grid-form">
            <div v-for="(valor, clave) in datosRecibidos.datos" :key="clave" class="form-group">
              <label class="field-label">{{ clave }}</label>

              <select v-model="manipular.seleccionActualizarVarios[clave]" class="custom-input delete-focus" :size="Math.min(Math.max(valor.length, 2), 6)"
               multiple>
                <option v-for="file in valor" :key="file" :value="Object.values(file)[0]">{{ Object.values(file)[1] }}</option>
              </select>

              <input 
                  v-if="manipular.seleccionActualizarVarios[clave].length"
                  type="text" 
                  v-model="manipular.valorActualizarVarios[clave]" 
                  placeholder="Ingrese un Valor"
                  class='input-update'
                />

              <button 
                @click="actualizarVarios(clave)" 
                :disabled="!manipular.seleccionActualizarVarios[clave].length"
                class="btn-text-update"
              >
                Actualizar {{ clave }}
              </button>
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
const store = api();
const notificar = controlNotificaciones().manejoNotificacion;
let datosRecibidos = ref({});

onMounted(async () => {
    //se busca los datos del servidor
    await store.leer('manipular/retornar-datos');
    datosRecibidos.value = store.respuesta;
})

//se reinicia toda la informacion cuando se completa una operacion
async function reiniciarInformacion(){
  await store.leer('manipular/retornar-datos');
  datosRecibidos.value = store.respuesta;
}

class ManipularPagina{
  constructor(){
    this.tab = ref('add');
    this.editMode = ref(false);
    this.input = reactive({categoria: null, marca: null, modelo: null, ubicaciones: null});
    this.seleccionEliminar = reactive({categoria: "", marca: "", modelo: "", ubicaciones: ""});
    this.seleccionActualizar = reactive({categoria: "", marca: "", modelo: "", ubicaciones: ""});
    this.valorActualizar = reactive({categoria: "", marca: "", modelo: "", ubicaciones: ""});
    this.seleccionActualizarVarios =  reactive({categoria: [], marca: [], modelo: [], ubicaciones: []});
    this.valorActualizarVarios = reactive({categoria: "", marca: "", modelo: "", ubicaciones: ""});
  }

  //se verifica si el dato que se va a ingresar ya existe
  verificarDatoExistente(dato, clave){
    for(let fila of datosRecibidos.value.datos[clave]){
      //se determina si el dato ya esta en la bd
      if(Object.values(fila)[1] == dato.toUpperCase()){
        return true;
      }
    }
    return false;
  }

  //se asigna el valor al valorActualizar
  asignarValor(id, clave, valor){

    let revision = valor.find(row => Object.values(row)[0] === id);

    this.valorActualizar[clave] = (revision) ? Object.values(revision)[1] : null;
    return true;
  }

  //se asigna valores al valorActualizarVarios
  asignarVariosValores(id, clave, valor){

  }

  async guardarDato(clave){
    //se verifica si se ingreso un dato
    if(!this.input[clave]){
      return notificar.activarNotificacionError("ingrese un dato");
    }

    //se verifica si ya existe un dato
    if(this.verificarDatoExistente(this.input[clave].trim(), clave)){
      return notificar.activarNotificacionError("El Dato ya Existe");
    }

    //se guarda el dato
    await store.mandarJson({clave: clave, dato: this.input[clave].trim().toUpperCase()}, "manipular/guardar-datos")

    if(!store.respuesta.mensaje){
      return notificar.activarNotificacionError("Hubo errores en el guardado de los datos");
    }
    notificar.activarNotificacionExito("Se guardo Correctamente");
    this.editMode.value = false;
    this.input[clave] = "";
    reiniciarInformacion()
  }

  async EliminarDato(clave){
    //se verifica si el dato esta en uso
    const verificarDato = await this.verificarDatoUsado(clave);
    if (verificarDato){
      return notificar.activarNotificacionError("El dato ya esta en uso y no se puede eliminar");
    }

    if (confirm(`¿Estás seguro de eliminar el elemento de la lista de ${clave}?`)){

      await store.mandarJson({clave: clave, dato: this.seleccionEliminar[clave]}, "manipular/eliminar-datos")
      if(!store.respuesta.mensaje){
        notificar.activarNotificacionError("Hubo errores en la eliminacion");
        return;
      }
      notificar.activarNotificacionExito("Se elimino Correctamente");
      this.seleccionEliminar[clave] = "";
      reiniciarInformacion()
    }
  }

  async actualizarDato(clave){
    //se revisa si se tiene datos en el input
    if(this.valorActualizar[clave].trim().length == 0){
      notificar.activarNotificacionError("Ingrese datos en el input");
      return;
    }

    //se pregunta si se quiere actualizar el Dato
    if (!confirm(`¿Estás seguro en actualizar el elemento de la lista de ${clave}?`)) return

    //se hace la peticion
    await store.mandarJson({
      clave: clave, 
      dato: this.seleccionActualizar[clave],
      reemplazo: this.valorActualizar[clave]}, 
      "manipular/actualizar-datos")
     
    if(!store.respuesta.mensaje){
      notificar.activarNotificacionError("Hubo errores en la actualizacion");
      return;
      }

    notificar.activarNotificacionExito("Se actualizo Correctamente");
    this.seleccionActualizar[clave] = '';
    this.valorActualizar[clave] = "";
    reiniciarInformacion()
  }

  async actualizarVarios(clave){
    //se revisa si se tiene datos en el input
    if(this.valorActualizarVarios[clave].trim().length == 0){
      notificar.activarNotificacionError("Ingrese datos en el input");
      return;
    }

    
    //se pregunta si se quiere actualizar los Datos
    if (!confirm(`¿Estás seguro en actualizar los elementos de la lista de ${clave}?`)) return
  
    //se hace la peticion
    await store.mandarJson({
      ids: this.seleccionActualizarVarios[clave],
      reemplazo: this.valorActualizarVarios[clave], 
      clave: clave},
      "manipular/actualizar-varios")
     
    if(!store.respuesta.mensaje){
      notificar.activarNotificacionError("Hubo errores en la actualizacion");
      return;
      }

    notificar.activarNotificacionExito("Se actualizaron Correctamente");
    this.seleccionActualizarVarios[clave] = [];
    this.valorActualizarVarios[clave] = "";
    reiniciarInformacion()
  }

  //se verifica si el dato ya se ha usado, por lo que no puede ser eliminado
  async verificarDatoUsado(clave){
    await store.mandarJson({clave: clave, dato: this.seleccionEliminar[clave]}, "manipular/verificar-uso")
    
    if (store.respuesta.datoUsado)
      return true;

    return false;
  }
}

const manipular = new ManipularPagina();

async function guardar(clave){
    await manipular.guardarDato(clave);
}

async function eliminar(clave){
    await manipular.EliminarDato(clave);
}

async function actualizar(clave){
    await manipular.actualizarDato(clave);
}

async function actualizarVarios(clave){
    await manipular.actualizarVarios(clave);
}

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
  color: #2563eb;
  background: white;
  box-shadow: inset 0 -2px 0 #2563eb;
}

.tab-btn.active.danger {
  color: #dc2626;
  box-shadow: inset 0 -2px 0 #dc2626;
}

.tab-btn.active.update {
  color: #dca226ff;
  box-shadow: inset 0 -2px 0 #dca226ff;
}

.content- { padding: 40px; }

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.grid-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.form-group { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  font-size: 0.7rem;
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
.custom-input.highlight { border-color: #34d399; background: #f0fdf4; }

.add-input-group { display: flex;  }

.inline-add-btn {
  background: #059669;
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

input:checked + .slider { background-color: #10b981; }
input:checked + .slider:before { transform: translateX(20px); }

.toggle-label { font-size: 0.85rem; margin-left: 10px; font-weight: 500; color: #475569; }

.btn-text-danger {
  background: transparent;
  color: #dc2626;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  padding: 5px 0;
}

.input-update{

  outline: none;
}

.btn-text-danger:disabled { color: #cbd5e1; cursor: not-allowed; }

.btn-text-update:disabled { color: #cbd5e1; cursor: not-allowed; }

.btn-text-update {
   background: transparent;
  color: #dca226ff;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  padding: 5px 0;
}

.info-box {
  margin-top: 30px;
  background: #f8fafc;
  padding: 15px;
  border-radius: 12px;
  border-left: 4px solid #cd1c29;
}

.fade-in { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>