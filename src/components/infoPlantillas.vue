<script setup>
import {ref} from 'vue'
import mostrarImagen from './mostrarImagen.vue';
import notificacionAdv from '../components/notificacionAdv.vue';
import { controlNotificaciones } from '../stores/clase.js';
import { api } from '../stores/apis.js';

const notificar = controlNotificaciones().manejoNotificacion
const store = api();

//se definen los prips y los emits
defineProps(["activar", "infoPlantilla", "datosBuscados"]);
let emit = defineEmits(["cerrar", "mandarDatos", ]);

/* SE DEFINEN LAS VARIABLES DE COLUMNAS */

//columnas unicamente disponibles en busquedas de activos desincorporados
let columnasDesincorporadas = ['nombre_categoria', 'nombre_marca', 'nombre_modelo', 'serial', 'etiqueta', 'mac_addre', 'notas', 'fecha_registro', 'fecha_desincorporacion',
  'id_equipo', 'cargo', 'nombre_usuario', 'ubicacion_actual', 'clave_masiva', 'nombre_condicion'];

//columnas normales
let columnasNormales = ['categoria', 'marca', 'modelo', 'serial', 'etiqueta', 'direccion mac', 'usuario', 'condicion', 'ubicacion actual', 'notas', 'fecha registro', 'clave masiva', 'clave caja',
'componentes buenos', 'componentes malos', 'id del equipo'
];

//se asigna dependiendo de la informacion que se manda que se elij
let columnasSimples = ref(null); 

//se almacena las columnas que se eliminaron
let columnasEliminadas = ref({}) 

//para activar el mostrar imagen
const activacion = ref(); 
const url = ref();

//se determina las columnas simples que se van a mostrar dependiendo de la informacion que se mande
function determinarColumnas(datos){
  
  //si ya se asigno, se devuelve
  if (columnasSimples.value) return columnasSimples.value; 
 
  //se determina si hay claves de los datos mandados que no estan en las columnasDesincorporadas
  let datosActivosDesincorporados = Object.keys(datos[0]).filter(key => !columnasDesincorporadas.includes(key));
  
  if(datosActivosDesincorporados.length)
    columnasSimples.value = columnasNormales;
  else{
    columnasSimples.value = ['categoria', 'marca', 'modelo', 'serial', 'etiqueta', 'condicion', 'usuario','ubicacion actual', 'notas', 'fecha registro', 'fecha desincorporacion', 'clave masiva', 'id del equipo'];
  
  }
  return columnasSimples.value;
  }

//transforma los valores de componentes de 0 en arrays, para poder ser procesados en el back-end 
function transformarDatos(datos){
  const datosTransformados = datos.map(row => {
    if(row.bueno === '0') row.bueno = [['0']];
    if(row.malo === '0') row.malo = [['0']];
    return row;
  })

  return datosTransformados;
}

async function descargar(info, datosBuscados, paseObligatorio = null){
    //si el paseObligatorio se aplica, quiere decir que el cliente acepto que se pase los datos que faltan en otra plantilla
    //ya que el numero de registros sobrepaso el limite de la planilla

    //se determina si se paso el limite de la plantill
    if(datosBuscados.length > info.itemMaximo && !paseObligatorio && info.itemMaximo){
      notificar.activarNotificacionAdvertencia('la cantidad de registros supera el maximo que permite la plantilla. Desea descargar los datos que faltan en una unica hoja con estilo diferente en el excel o en multiples hojas con el estilo original', null, true);
      return;
    }
    //se transforma los datos para que los valores 0 de componentes sean arrays
    datosBuscados = transformarDatos(datosBuscados);

    //se crea el cuerpo de la peticion
    const body = {
      clave: info.nombre, 
      datos: datosBuscados, 
      otraHoja: paseObligatorio,
      columnasPedidas: columnasSimples.value
      }

    //se hace la peticion
    await store.recibirArchivo(body, "plantilla/crear");

    const url = window.URL.createObjectURL(store.respuesta);
      
    //se descarga el archivo
    const a = document.createElement('a');
    a.href = url;
    a.download = info.nombre; // Nombre del archivo en el cliente
    let principal = document.querySelector(".modal-backdrop");
    principal.appendChild(a);
    a.click();
}

//se muestra la imagen
function MostrarImagen(ruta){
  activacion.value = true;
  url.value = ruta;
}

//se elimina la columna
function eliminarColumna(index){
  columnasEliminadas.value[columnasSimples.value[index]] = index; //se almacena
  columnasSimples.value.splice(index, 1); //se elimina
}

//se devuelve la columnas
function devolverColumna(){
  let valorDevolver = Object.keys(columnasEliminadas.value)[Object.keys(columnasEliminadas.value).length - 1];
  //se ingresa en el array en su posicion original
  columnasSimples.value.splice(columnasEliminadas.value[valorDevolver],0, valorDevolver)

  delete columnasEliminadas.value[valorDevolver] //se elimina
}
</script>

<template>
<transition name="modal-anim">
      <div v-if="activar" class="modal-backdrop" @click.self="$emit('cerrar')">
        <div class="card">
          <button class="abrir-imagen" @click="MostrarImagen(infoPlantilla.imagen)">🪟</button>
          <button class="boton-cerrar" @click="$emit('cerrar')">&times;</button>
          
          <div class="modal-cuerpo">
            <div class="modal-imagen">
              <img :src="infoPlantilla.imagen" alt="Preview">
            </div>
            
            <div class="modal-info">
              
              <h2>{{ infoPlantilla.nombre }}</h2>
              <p class="descripcion">{{ infoPlantilla.descripcion }}</p>
              <p><span style="font-weight: bold;">Item Maximo:</span> {{ infoPlantilla.itemMaximo ? infoPlantilla.itemMaximo : 'No especificado' }}</p>

              <div class="caracteristicas">
                <h4>Columnas que Posee:</h4>
                <ul class="lista-horizontal">
                  <li v-if="infoPlantilla.nombre != 'simple'" v-for="item of infoPlantilla.columnasOriginales">
                    <span class="check">✓</span> {{ item}}
                  </li>

                  <li v-else v-for="(item, index) in determinarColumnas(datosBuscados)" class="item-columna">
                    <span class="check"></span> {{ item }}
                    <button class="btn-delete" @click="eliminarColumna(index)">×</button>
                  </li>
                  <div v-if="Object.keys(columnasEliminadas).length > 0 && infoPlantilla.nombre == 'simple'" class="devolver" @click="devolverColumna"> >
                    Devolver Columna
                  </div>
                </ul>
              </div>
              
              <button class="boton-descarga" @click="descargar(infoPlantilla, datosBuscados)">Descargar ahora</button>
            </div>
          </div>
        </div>
      </div>
</transition>
<mostrarImagen :activar="activacion" :url="url" @cerrar="activacion = false" />
<notificacionAdv :activar="notificar.activarAdvertencia" :columnas="notificar.columnasAdvertencia" @cerrar="notificar.activarAdvertencia = false" 
    @respuesta="descargar(infoPlantilla, datosBuscados, $event)" :texto="notificar.texto" :mandar="true"/>

</template>

<style>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.card {
  background: white;
  width: 90%;
  max-width: 800px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.modal-cuerpo {
  display: flex;
  flex-direction: column; /* Cambiado de row a column para que la imagen suba */
}

.modal-imagen {
  width: 100%;
  height: 200px; /* Definimos una altura fija para la parte superior */
}

.modal-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .modal-cuerpo { flex-direction: column; }
}

/*.modal-imagen { flex: 1; }*/
.modal-imagen img { width: 100%; height: 100%; object-fit: cover; }

.modal-info {
  padding: 0px 20px 20px 20px;
}
/* Estilos para la iteración horizontal */
.lista-horizontal {
  display: flex;
  flex-wrap: wrap; /* Permite que si son muchos items, bajen a la siguiente línea */
  list-style: none;
  padding: 0;
  gap: 15px; /* Espacio entre elementos */
  margin-top: 10px;
}

.lista-horizontal li {
  background: #f0f7f0; /* Un fondo sutil para que parezcan etiquetas */
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  white-space: nowrap;
}

.check {
  color: #4a4;
  font-weight: bold;
  margin-right: 5px;
}

.boton-descarga {
  background-color: #4a4;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}
.boton-descarga:hover{
    background-color: #4b4;
}
.boton-cerrar{
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
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.boton-cerrar:hover{
  transform: scale(1.1);
  background-color: #ff4d4d;
  color: white;
}
.abrir-imagen{
  position: absolute;
  top: 10px;
  left: 15px;
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
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.abrir-imagen:hover{
  transform: scale(1.1);
  background-color: #09f;
  color: white;
}

.item-columna {
  position: relative; /* Esencial para posicionar la X */
  list-style: none;
  padding: 10px;
  border: 1px solid #ddd;
  margin-bottom: 5px;
}

.btn-delete {
  position: absolute;
  top: 2px;
  right: 5px;
  background: transparent;
  border: none;
  color: #777;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  padding: 0;
  line-height: 1;
}

.devolver {
  background: white;
  /*border-bottom: 2px solid #99f;*/
  color: #99f;
  cursor: pointer;
}
.devolver:hover{
  color: #99a;
}

/* --- ANIMACIONES VUE --- */
/* Entrada de la galería */
.grid-fade-enter-active {
  transition: all 0.6s ease;
}
.grid-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* Modal: Zoom + Fade */
.modal-anim-enter-active, .modal-anim-leave-active {
  transition: all 0.3s ease;
}
.modal-anim-enter-from, .modal-anim-leave-to {
  opacity: 0;
  /*transform: scale(0.9);*/
}
</style>
