<script setup>
import { onMounted, ref, watch} from 'vue';
import { api } from '../stores/apis';
import { clasesManuales } from '../stores/clasesManuales';
import { opciones } from '../stores/opcionesCatalogo';

//se define los promps y los emits
const props = defineProps(['reiniciar', 'activarDeshabilitado']);
let emit = defineEmits(["datosSeleccionados"])

//se instancia el objeto de gestion de las opciones
const gestion = opciones().manejoOpciones;

//variables de los cargos
let tipoCargo = ref('Cargo');
let cargos = ["administrador", "trabajador", 'pasante'];

//constantes fundamentales
const store = api();
const datos = ref(null);

//objeto que permite que aparezca el selection
let visibilizar = ref({
    categoria: null,
    marca: null,
    modelo: null,
    serial: null,
    etiqueta: null,
    mac_addre: null,
    ubicacion: null,
    usuario: null,
    clave_masiva: null,
    clave_caja: null,
    fecha_registro: null,
    fecha_desincorporacion: null,
    componenteBueno: null,
    componenteMalo: null,
    id_equipo: null

}); 

//objeto que accede a todos los datos que se seleccionaron
let datosOpciones = ref({
    categoria: null,
    marca: null,
    modelo: null,
    serial: null,
    etiqueta: null,
    mac_addre: null,
    ubicacion: null,
    usuario: null,
    cargo: null,
    clave_masiva:null,
    clave_caja:null,
    fecha_registroAntes: null,
    fecha_registroDespues: null,
    fecha_desincorporacionAntes: null,
    fecha_desincorporacionDespues: null,
    componenteBueno: [],
    componenteMalo: [],
    id_equipo: null
});

//se realiza la peticion que extrae los datos necesarios para la busqueda
onMounted(async () => {
  await store.leer('buscar/bloque-busqueda');
  datos.value = store.respuesta.datos;
  gestion.datosServidor = {...datos.value};
})

//si se selecciona una opcion, automaticamente se añade el valor a datosSeleccionados
watch(gestion.seleccionados, () => {
  //se asigna el id de los campos seleccionados a datosOpciones 
  datosOpciones.value.categoria = gestion.retornarIdCampo('categoria');
  datosOpciones.value.marca = gestion.retornarIdCampo('marca');
  datosOpciones.value.modelo = gestion.retornarIdCampo('modelo');
  datosOpciones.value.ubicacion = gestion.retornarIdCampo('ubicaciones');
})


//si se selecciona una opcion, se manda los datos seleccionados directamente
watch(datosOpciones.value, () => {
    emit("datosSeleccionados", datosOpciones.value);
})

//se resetea todo
function resetiar(){
  visibilizar.value = {
    categoria: null,
    marca: null,
    modelo: null,
    serial: null,
    etiqueta: null,
    mac_addre: null,
    ubicacion: null,
    usuario: null,
    clave_masiva: null,
    clave_caja:null,
    fecha_registro: null,
    fecha_desincorporacion: null,
    componenteBueno: null,
    componenteMalo: null,
    id_equipo: null
};
 
Object.assign(datosOpciones.value, {
    categoria: null,
    marca: null,
    modelo: null,
    serial: null,
    etiqueta: null,
    mac_addre: null,
    ubicacion: null,
    usuario: null,
    cargo:null,
    clave_masiva: null,
    clave_caja: null,
    fecha_registroAntes: null,
    fecha_registroDespues: null,
    fecha_desincorporacionAntes: null,
    fecha_desincorporacionDespues: null,
    componenteBueno: [],
    componenteMalo: [],
    id_equipo: null
})
gestion.reiniciarValores();

}

//cada vez que cambie el props, se activa
watch(() => props.reiniciar, (nuevoValor) => {
  if (nuevoValor) {
    resetiar();
  }});
  
</script>

<template>
  <div class="principal-busqueda">
    <table width="100%" class="tabla-interactiva">
      
      <tr>
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.categoria">
            <span class="checkmark"></span>
            Categoría
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.categoria" class="contenedor-opciones">
              <input 
              v-model="gestion.seleccionados.categoria" 
              @focus="gestion.showSug.categoria = true"
              @blur="gestion.close('categoria')"
              placeholder="Categoría" 
              class="input-texto"
            />
             <ul v-if="gestion.showSug.categoria && gestion.filteredCats.length" class="custom-datalist">
              <li v-for="mo in gestion.filteredCats" :key="mo" @mousedown="gestion.seleccionar('categoria', mo)">
                {{ mo }}
              </li>
            </ul>
            </div>
          </Transition>
        </td>
      </tr>

      <tr>
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.marca">
            <span class="checkmark"></span>
            Marca
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.marca" class="contenedor-opciones">
              <input 
              v-model="gestion.seleccionados.marca" 
              @focus="gestion.showSug.marca = true"
              @blur="gestion.close('marca')"
              placeholder="Marca" 
              class="input-texto"
            />
             <ul v-if="gestion.showSug.marca && gestion.filteredMarcas.length" class="custom-datalist">
              <li v-for="mo in gestion.filteredMarcas" :key="mo" @mousedown="gestion.seleccionar('marca', mo)">
                {{ mo }}
              </li>
            </ul>
            </div>
          </Transition>
        </td>
      </tr>
      <tr>
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.serial">
            <span class="checkmark"></span>
            Serial
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.serial" class="contenedor-select">
              <input type="text" class="input-texto" v-model.trim="datosOpciones.serial">
            </div>
          </Transition>
        </td>
      </tr>
       <tr>
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.modelo">
            <span class="checkmark"></span>
            Modelo
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.modelo" class="contenedor-opciones">
              <input 
              v-model="gestion.seleccionados.modelo" 
              @focus="gestion.showSug.modelo = true"
              @blur="gestion.close('modelo')"
              placeholder="Modelo" 
              class="input-texto"
            />
             <ul v-if="gestion.showSug.modelo && gestion.modelosFiltrados.length && gestion.seleccionados.modelo.length" class="custom-datalist">
              <li v-for="mo in gestion.modelosFiltrados" :key="mo" @mousedown="gestion.seleccionar('modelo', mo)">
                {{ mo }}
              </li>
            </ul>
            </div>
          </Transition>
        </td>
      </tr>
      <tr>
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.etiqueta">
            <span class="checkmark"></span>
            Etiqueta
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.etiqueta" class="contenedor-select">
              <input type="text" class="input-texto" v-model.trim="datosOpciones.etiqueta">
            </div>
          </Transition>
        </td>
      </tr>
      <tr>
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.mac_addre">
            <span class="checkmark"></span>
            Dirección Mac
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.mac_addre" class="contenedor-select">
              <input type="text" class="input-texto" v-model.trim="datosOpciones.mac_addre">
            </div>
          </Transition>
        </td>
      </tr>
      <tr>
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.ubicacion">
            <span class="checkmark"></span>
            Ubicación
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.ubicacion" class="contenedor-opciones">
              <input 
              v-model="gestion.seleccionados.ubicaciones" 
              @focus="gestion.showSug.ubicaciones = true"
              @blur="gestion.close('ubicaciones')"
              placeholder="Ubicación" 
              class="input-texto"
            />
             <ul v-if="gestion.showSug.ubicaciones && gestion.ubicacionesFiltrados.length" class="custom-datalist">
              <li v-for="mo in gestion.ubicacionesFiltrados" :key="mo" @mousedown="gestion.seleccionar('ubicaciones', mo)">
                {{ mo }}
              </li>
            </ul>
            </div>
          </Transition>
        </td>
      </tr>
      <tr>
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.usuario">
            <span class="checkmark"></span>
            Usuario
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.usuario" class="contenedor-dinamico">
              <div class="radio-group">
                <label class="radio-item">
                  <input type="radio" v-model="tipoCargo" value="Cargo"> 
                  Cargo
                </label>
                <label class="radio-item">
                  <input type="radio" v-model="tipoCargo" value="Nombre"> 
                  Nombre
                </label>
              </div>
              <div class="contenedor-select" >

                <select v-if="tipoCargo == 'Cargo'" v-model="datosOpciones.cargo"
                  class="select-moderno"
                  :size="Math.min(Math.max(datos.usuario.rows.length, 2), 6)"
                style="max-height: 150px;">
                <option value="">Seleccione un cargo</option>
                <option v-for="object of cargos" :key="cargos" :value="object">
                  {{ object }}
                </option>
                </select>

                <select v-if="tipoCargo == 'Nombre'" v-model="datosOpciones.usuario"
                  class="select-moderno"
                  style="max-height: 130px;"
                  :size="Math.min(Math.max(datos.usuario.rows.length, 2), 6)"
                >
                  <option value="">Seleccione un Usuario</option>
                  <option v-for="object of datos.usuario.rows" :key="Object.values(object)[0]" :value="Object.values(object)[0]">
                  {{ Object.values(object)[1] }}
                </option>
                </select>
              </div>
            </div>
          </Transition>
        </td>
      </tr>
      <tr>
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.clave_masiva">
            <span class="checkmark"></span>
            Clave Masiva
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.clave_masiva" class="contenedor-select">
              <input type="text" class="input-texto" v-model.trim="datosOpciones.clave_masiva">
            </div>
          </Transition>
        </td>
      </tr>
      <tr v-if="!activarDeshabilitado">
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.clave_caja">
            <span class="checkmark"></span>
            Clave Caja
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.clave_caja" class="contenedor-select">
              <input type="text" class="input-texto" v-model.trim="datosOpciones.clave_caja">
            </div>
          </Transition>
        </td>
      </tr>
      <tr>
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.fecha_registro">
            <span class="checkmark"></span>
            Fecha Registro
          </label>
        </td>
      </tr>
      <tr>
        <Transition name="fade-slide">
        <div v-if="visibilizar.fecha_registro" class="contenedor-select">
        <td>
            <label for="fecha_registroAntes">Antes</label>
            <input type="date" id="fecha_registroAntes" class="fechas" v-model="datosOpciones.fecha_registroAntes">
        </td>
        <td>
          <label for="fecha_registroDespues">Despues</label>
          <input type="date"  id="fecha_registroDespues" class="fechas" v-model="datosOpciones.fecha_registroDespues">
        </td>
        </div>
        </Transition>
      </tr>
      <tr v-if="activarDeshabilitado">
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.fecha_desincorporacion">
            <span class="checkmark"></span>
            Fecha Desincorporación
          </label>
        </td>
      </tr>
      <tr>
        <Transition name="fade-slide">
        <div v-if="visibilizar.fecha_desincorporacion" class="contenedor-select">
        <td>
            <label for="fecha_desincorporacionAntes">Antes</label>
            <input type="date" id="fecha_desincorporacionAntes" class="fechas" v-model="datosOpciones.fecha_desincorporacionAntes">
        </td>
        <td>
          <label for="fecha_desincorporacionDespues">Despues</label>
          <input type="date"  id="fecha_desincorporacionDespues" class="fechas" v-model="datosOpciones.fecha_desincorporacionDespues">
        </td>
        </div>
        </Transition>
      </tr>
      <tr v-if="!activarDeshabilitado">
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.componenteBueno">
            <span class="checkmark"></span>
            Componentes Buenos
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.componenteBueno" class="contenedor-select">
              <select v-model="datosOpciones.componenteBueno" multiple
                class="select-moderno" 
                :size="Math.min(Math.max(datos.componente.length, 2), 6)"
              >
                <option value="">Seleccione un componente</option>
                <option v-for="object of datos.componente" :key="Object.values(object)[0]" :value="object">
                  {{ object }}
                </option>
              </select>
            </div>
          </Transition>
        </td>
      </tr>
      <tr v-if="!activarDeshabilitado">
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.componenteMalo">
            <span class="checkmark"></span>
            Componentes Malos
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.componenteMalo" class="contenedor-select">
              <select v-model="datosOpciones.componenteMalo" multiple
                class="select-moderno" 
                :size="Math.min(Math.max(datos.componente.length, 2), 6)"
              > 
                <option value="">Seleccione un componente</option>
                <option v-for="object of datos.componente" :key="Object.values(object)[0]" :value="object">
                  {{ object }}
                </option>
              </select>
            </div>
          </Transition>
        </td>
      </tr>
      <tr>
        <td class="opciones">
          <label class="checkbox-container">
            <input type="checkbox" v-model="visibilizar.id_equipo">
            <span class="checkmark"></span>
            Id del Equipo
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <Transition name="fade-slide">
            <div v-if="visibilizar.id_equipo" class="contenedor-select">
              <input type="text" class="input-texto" v-model.trim="datosOpciones.id_equipo">
            </div>
          </Transition>
        </td>
      </tr>
      
    </table>
  </div>
  
</template>

<style scoped>
/* Contenedor Principal */
.principal-busqueda {
  width: 260px;
  height: 350px;
  border: solid #cd1c29 2px;
  border-radius: 8px;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #fcfcfc;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.fechas{
  font-size: 15px;
  width: 100px;
}
.input-texto{
  width: 80%;
  font-size: 18px;
  outline: none;
}

.input-texto:focus{
  border-color: #cd1c29;
  
}

.tabla-interactiva {
  border-collapse: collapse;
}

/* Estilo de los Checkboxes */
.opciones {
  padding: 10px;
  background: #fff;
}

.checkbox-container {
  display: flex;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
  user-select: none;

}

.checkbox-container input {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Estilo del Select */
.contenedor-select {
  padding: 0 10px 15px 10px;
  overflow: hidden; /* Necesario para la animación */
}

.contenedor-opciones{
  padding: 0 10px 15px 10px;
  position: relative;
}

.select-moderno {
  width: 100%;
  border: 1px solid #cd1c29;
  border-radius: 6px;
  padding: 5px;
  background-color: #fff;
  color: #333;
  outline: none;
  font-family: sans-serif;
  transition: all 0.3s ease;
}

.select-moderno:focus {
  box-shadow: 0 0 5px #f44336;
}

.select-moderno option {
  padding: 8px;
}

/*estilos bloque de modelo*/
.custom-datalist {
  position: absolute;
  top: calc(100% - 15px); /* Ajustado por el padding-bottom del contenedor */
  left: 10px; /* Alineado con el padding del contenedor */
  right: 56px; /* Para que mantenga el ancho coherente con el input */
  width: auto; /* Deja que left/right definan el ancho */
  background: white;
  border: 2px solid #f44336;
  border-top: none;
  border-radius: 0 0 8px 8px;
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 10;
  max-height: 150px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.custom-datalist li {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
}

.custom-datalist li:hover {
  background-color: #eff6ff;
  color: #2563eb;
}


/* Clases de Animación (Vue Transition) */
.fade-slide-enter-active, 
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from, 
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.fade-slide-enter-to, 
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px; /* Un valor lo suficientemente alto */
}

/* Scrollbar Personalizado */
.principal-busqueda::-webkit-scrollbar {
  width: 6px;
}
.principal-busqueda::-webkit-scrollbar-thumb {
  background: #cd1c29;
  border-radius: 10px;
}

/* Nuevos estilos para los radios */
.contenedor-dinamico {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.radio-group {
  display: flex;
  justify-content: space-around;
  padding: 5px 10px;
  background: #f0f7ff;
  margin: 0 10px;
  border-radius: 4px;
  
}

.radio-item {
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #333;
}

.radio-item input {
  margin-right: 5px;
  accent-color: #cd1c29; /* Color corporativo para el radio */
}

/* Ajuste para que la transición no salte */
.fade-slide-enter-to {
  max-height: 300px; /* Incrementado para dar espacio al radio + select */
}
</style>