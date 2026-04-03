<script setup>
import { onMounted, computed, ref} from 'vue'
import { api } from '../stores/apis';
const props = defineProps(["datosBuscados", "botonAccion", 'activarDeshabilitado']);
let emit = defineEmits(["mostrarCajaTexto", "accion"]);
const store = api();
class ManejoBotonAccion{
    //para manejar las opciones el boton de accion
    constructor(){
      this.clase = ref(null);
      this.texto = ref(null);
    }
    determinarAccion(accion){
      //determina cual accion se solicito
      if(!accion) return false;

      if (accion == "actualizar"){ 
        this.activarBotonAccionActualizar();
        return true
      }
      if (accion == "eliminar"){
        this.activarBotonAccionEliminar();
        return true
      }
      if (accion == "deshabilitar"){
        this.activarBotonAccionDeshabilitar();
        return true
      }

      if (accion == "quitarDesincorporacion"){
        this.activarQuitarDesincorporacion();
        return true;
      }

      return false;
    }

    activarQuitarDesincorporacion(){
      this.clase = "deshabilitar"
      this.texto = "Deshacer"
    }

    activarBotonAccionDeshabilitar(){
      this.clase = "deshabilitar"
      this.texto = "Desincorporar";
    }

    activarBotonAccionActualizar(){
      this.clase = "actualizar"
      this.texto = "Actualizar";
    }
    activarBotonAccionEliminar(){
      this.clase = "eliminar"
      this.texto = "Eliminar";
    }

    mandarEmitAccion(registro){
      emit('accion', registro);
    }
}

const manejarAccion = new ManejoBotonAccion();

class MostrarDatos {
  constructor(datos, activarDesincorporacion) {
    this.datos = datos;
    // indica si esta en la busqueda de activos a desincorporar o desincorporados
    this.activarDesincorporacion = activarDesincorporacion;

    // Configuración centralizada para evitar "magic numbers" y mejorar mantenimiento
    this.COLUMNAS_COMPONENTES = ["cpu", "ram", "pantalla", "carcasa", "disco_duro", "tarjeta_madre", "fan_cooler", "fuente_poder"];
    this.LIMITES_CARACTERES = {
      nombre_categoria: 20, nombre_marca: 8, nombre_modelo: 13, etiqueta: 10,
      serial: 15, mac_addre: 15, ubicacion_actual: 13, nombre_condicion: 17,
      nombre_usuario: 16, notas: 20, clave_masiva: 14, clave_caja: 14, id_equipo: 14
    };
  }

  // se determina la condicion dependiendo si es desincorporado o no
  determinarCondicion() {
    return this.activarDesincorporacion ? 'DESINCORPORADO' : 'POR DESINCORPORAR';
  }

  acomodarDatos() {
    return this.datos.map((fila, indice) => {
      let nuevoRegistro = {};

      // 1. Procesar columnas base y componentes
      for (let [clave, valor] of Object.entries(fila)) {
        if (clave === 'indicador') continue; // para que no se cuenten
        
        if(['bueno', 'malo'].includes(clave)){
          nuevoRegistro[clave] = Array.isArray(valor) ? [valor, 'puntos'] : valor;
          continue;
        }

        /*
        if (this.COLUMNAS_COMPONENTES.includes(clave)) {
          this._procesarComponente(nuevoRegistro, clave, valor);
          continue;
        }*/

        nuevoRegistro[clave] = valor;
      }
    
      // 2. Comprobar estados "bueno" y "malo"
      //this._validarEstados(nuevoRegistro, fila);

      // 3. Agregar condición y aplicar formato de saltos de línea
      nuevoRegistro['nombre_condicion'] = this.determinarCondicion();
      
  
      // bucle que registra los saltos de linea, y si aparece los tres puntos, se pone un estilo especial
      for (let clave in nuevoRegistro) {
        if (!["bueno", "malo"].includes(clave)) {
          nuevoRegistro[clave] = this.saltoLinea(nuevoRegistro[clave], clave, indice);
        }
      }

      return nuevoRegistro;
    });
  }

  _procesarComponente(registro, clave, valor) {
    const claveLimpia = clave.replace("_", " ").toUpperCase(); // se remplaza el _;

    //si el valor no tiene una lista designada se coloca, si no, se añade a esa lista
    if (registro[valor]) {
      registro[valor][0].push(claveLimpia);
    } else {
      registro[valor] = [[claveLimpia], "puntos"];
    }
  }

  _validarEstados(nuevoRegistro, filaOriginal) {
    // se comprueba si no se añadieron esas claves y si no, se añaden
    ["bueno", "malo"].forEach(estado => {
      if (!(estado in nuevoRegistro)) {
        // se comprueba si todas las columnas de componentes se rellenaron
        const tieneDesconocidos = Object.entries(filaOriginal)
          .some(([k, v]) => v === "desconocido" && k !== "notas");
        nuevoRegistro[estado] = tieneDesconocidos ? "desconocido" : "0";
      
      }
    });
  }

  saltoLinea(text, columna, indice) {
    const limite = this.LIMITES_CARACTERES[columna];
    if (!limite || !text) return [text, "", text];

    let str = String(text);
    let resultado = "";
    
    // Lógica de truncado y saltos más limpia
    for (let i = 0; i < str.length; i++) {
      if (i > 0 && i % limite === 0) {
        if (i === limite * 3) {
          resultado = resultado.slice(0, -2) + "...";
          break;
        }
        resultado += "\n";
      }
      resultado += str[i];
    }

    // se crea un objeto, que almacena el nuevo string y el nombre de una clase, si hay tres puntos
    const tienePuntos = resultado.endsWith("...");
    const objeto = [resultado, tienePuntos ? "puntos" : "", text];

    // se comprueba si la columna es el indicador que se tomo
    if (columna === this.datos[indice].indicador) {
      objeto.push('indicador');
    }

    return objeto;
  }

  // se determina que fecha arreglar si de registro o desincorporacion
  determinarFecha() {
    if (this.datos.length === 0) return;
    
    if (this.datos[0].fecha_desincorporacion) {
      this.arreglarFecha('fecha_desincorporacion');
    }
    this.arreglarFecha('fecha_registro');
  }

  arreglarFecha(campo) {
    // arreglamos la fecha
    this.datos.forEach(fila => {
      if (!fila[campo]) return;
      
      const d = new Date(fila[campo]);
      const f = (n) => String(n).padStart(2, '0');

      // Formato: YYYY-MM-DD HH:mm:ss
      fila[campo] = `${d.getFullYear()}-${f(d.getMonth() + 1)}-${f(d.getDate())} ` +
                    `${f(d.getHours())}:${f(d.getMinutes())}:${f(d.getSeconds())}`;
    });
  }

  //funcion que muestra el cargo del usuario
  static mostrarCargoUsuario(index, datosBuscados){
    let cargo = datosBuscados[index].cargo;
    emit("mostrarCajaTexto", cargo);
  }
}


function ejecutarMostrarDatos(datos, activarDeshabilitado){
  //se llama cuando se pasa los datos de la busqueda
  if(Object.keys(datos).length > 0){
    const mostrar = new MostrarDatos(datos, activarDeshabilitado);
    mostrar.determinarFecha();
    //localStorage.setItem('export', JSON.stringify(mostrar.acomodarDatos()));
    return mostrar.acomodarDatos();
  }
  return [];
}

function juntarClase(clase1, clase2){
  //se juntan dos clases, si existen las dos, en las columnas de serial, etiqueta, fecha_registro y direccion mac
  //para poner la clase que pone un estilo caracteristico cuando se busca por archivo
 
  if(clase2)
    return `${clase1} ${clase2}`
  
  return clase1;

}

function mandarEmit(clase, texto){
  if(clase == "puntos"){
    emit("mostrarCajaTexto", texto);
  }
}

//se ejecuta de nuevo cuando una de las propiedades cambien, en este caso, cuando se mande los datos buscados
const datosProcesados = computed(() => {
  return ejecutarMostrarDatos(props.datosBuscados, props.activarDeshabilitado);
});
</script>

<template>
  <div class="bloque-busqueda"> 
    <div class="bloque-header"> 
      <h3 style="font-family: Arial, Helvetica, sans-serif">Resultados de Inventario</h3>  
    </div>

    <div class="viewport-tabla">
      <table class="tabla-datos">
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Serial</th>
            <th>Etiqueta</th>
            <th>Dirección Mac</th>
            <th>Ubicación</th>
            <th>Condición</th>
            <th>Usuario</th>
            <th>Notas</th>
            <th>Fecha de <br> Registro</th>
            <th v-if="activarDeshabilitado">Fecha de <br> Desincorporación</th>
            <th>Clave <br> Masiva</th>
            <th v-if="!activarDeshabilitado">Clave <br> Caja</th>
            <th v-if="!activarDeshabilitado">Componentes <br> Buenos</th>
            <th v-if="!activarDeshabilitado">Componentes <br> Malos</th>
            <th class="sticky-col-right">Id Equipo</th>
            <th v-if="manejarAccion.determinarAccion(botonAccion)" class="sticky-col-right">{{ manejarAccion.texto }}</th>
             
          </tr>
        </thead> 
        <tbody>
          <tr  v-for="(item, index) in datosProcesados" :key="index">
            <td>  <span class="tag" :class="item.nombre_categoria[1]" @click="mandarEmit(item.nombre_categoria[1], item.nombre_categoria[2])" style="white-space: pre-wrap">
              {{ item.nombre_categoria[0] }}
              </span></td>

            <td>{{ item.nombre_marca[0] }}</td>

            <td class="bold" style="white-space: pre-wrap" :class="item.nombre_modelo[1]" @click="mandarEmit(item.nombre_modelo[1], item.nombre_modelo[2])">
              {{ item.nombre_modelo[0]}}</td>

            <td style="white-space: pre-wrap;" class="mono" :class="juntarClase(item.serial[1], item.serial[3])" @click="mandarEmit(item.serial[1], item.serial[2])">{{ item.serial[0] }}</td>

            <td style="white-space: pre-wrap;" :class="juntarClase(item.etiqueta[1], item.etiqueta[3])" @click="mandarEmit(item.etiqueta[1], item.etiqueta[2])">{{ item.etiqueta[0] }}</td>

              <td style="white-space: pre-wrap;" class="mono" :class="juntarClase(item.mac_addre[1], item.mac_addre[3])" @click="mandarEmit(item.mac_addre[1], item.mac_addre[2])">{{ item.mac_addre[0] }}</td>

            <td style="white-space: pre-wrap;" :class="item.ubicacion_actual[1]" @click="mandarEmit(item.ubicacion_actual[1], item.ubicacion_actual[2])">
              {{ item.ubicacion_actual[0] }}</td>

            <td><span :class="['status', item.nombre_condicion[0].toLowerCase()]"style="white-space: pre-wrap;" >{{ item.nombre_condicion[0] }}</span></td>

            <td style="white-space: pre-wrap" class="puntos" @click="MostrarDatos.mostrarCargoUsuario(index, datosBuscados)">
              {{ item.nombre_usuario[0]}}</td>
            
            <td class="celda-notas" :title="item.notas" style="white-space: pre-wrap" :class="item.notas[1]" @click="mandarEmit(item.notas[1], item.notas[2])">
              {{ item.notas[0]}}</td>

            <td class="fechas" :class="(item.fecha_registro[3]) ? item.fecha_registro[3]:''">
              {{ item.fecha_registro[0]}}</td>

            <td v-if="activarDeshabilitado" class="fechas" :class="(item.fecha_desincorporacion[3]) ? item.fecha_desincorporacion[3]:''">
              {{ item.fecha_desincorporacion[0]}}</td>

             <td style="white-space: pre-wrap" :class="item.clave_masiva[1]" @click="mandarEmit(item.clave_masiva[1], item.clave_masiva[2])">
              {{ item.clave_masiva[0]}}</td>

          
          
            <td v-if="!activarDeshabilitado" style="white-space: pre-wrap" :class="item.clave_caja[1]" @click="mandarEmit(item.clave_caja[1], item.clave_caja[2])">
              {{ item.clave_caja[0]}}</td>

            <td  class="num text-green" v-if="['desconocido', '0'].includes(item.bueno) && !activarDeshabilitado">{{ item.bueno }}</td>
            <td v-else-if="!activarDeshabilitado" class="num text-green" :class="item.bueno[1]" @click="mandarEmit(item.bueno[1], item.bueno[0])">{{ item.bueno[0].length }}</td>

            <td class="num text-red" v-if="['desconocido', '0'].includes(item.malo) && !activarDeshabilitado">{{ item.malo }}</td>
            <td v-else-if="!activarDeshabilitado" class="num text-red" :class="item.malo[1]" @click="mandarEmit(item.malo[1],item.malo[0])">{{ item.malo[0].length }}</td>
            
            <td  class="bold" style="white-space: pre-wrap" :class="juntarClase(item.id_equipo[1], item.id_equipo[3])">
              {{ item.id_equipo[0]}}</td>

            <td v-if="manejarAccion.determinarAccion(botonAccion)" class="sticky-col-right">
              <button  :class="manejarAccion.clase" @click="manejarAccion.mandarEmitAccion(index)">{{ manejarAccion.texto }}</button>
            </td>
          </tr>
        
        </tbody>
      </table>
    </div>

    <div class="bloque-footer">
      <span v-if="datosBuscados">{{ datosProcesados.length }} registros</span>
      <span v-else>0 registros</span>
    </div>
  </div>

</template>

<style scoped>
/* 1. Contenedor del Bloque (Ancho controlado) */
.bloque-busqueda {
  max-width: 55vw; /* Aquí controlas qué tan ancho quieres el bloque */
  margin: 10px auto;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.bloque-header {
  padding: 10px 15px;
  background: #f9fafb;
  border-bottom: 1px solid #d1d5db;
}

.bloque-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #111827;
}

/* 2. El Viewport con Scroll Doble */
.viewport-tabla {
  overflow: auto;      /* Habilita scroll horizontal y vertical */
  max-height: 250px;   /* Altura fija para forzar scroll vertical */
  position: relative;
}

.tabla-datos {
  width: max-content;  /* Importante: obliga a la tabla a mantener su ancho real */
  min-width: 100%;     
  border-collapse: collapse;
  font-family: sans-serif;
}

/* 3. Cabecera Fija (Sticky) */
.tabla-datos thead th {
  position: sticky;
  top: 0;              /* Se queda arriba al bajar */
  background: #f3f4f6;
  padding: 10px;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #4b5563;
  border-bottom: 1px solid #d1d5db;
  z-index: 10;
}

/* 4. Estilos de Celdas */
.tabla-datos td {
  padding: 8px 12px;
  font-size: 0.8rem;
  border-bottom: 1px solid #f3f4f6;
  white-space: nowrap; /* Evita que el texto salte de línea */
}

.tabla-datos tbody tr:hover {
  background-color: #f9fafb;
}

/* Columnas especiales */
.bold { font-weight: 600; }
.mono { font-family: monospace; color: #6b7280; white-space: pre-wrap;}
.num { text-align: center; font-weight: bold; white-space: pre-wrap;}
.text-green { color: #059669;}
.text-red { color: #dc2626; }
.text-orange { color: #d97706;}

.tag {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  white-space: pre-wrap;
}

.status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
}
.excelente { background: #dcfce7; color: #166534; }
.bueno { background: #fef9c3; color: #854d0e; }

.celda-notas {
  /*max-width: 120px;
  /*overflow: hidden;
  text-overflow: ellipsis;*/
  white-space: pre-wrap;
}

.btn-accion {
  padding: 3px 8px;
  background: white;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  border-radius: 4px;
  cursor: pointer;
}
.actualizar{
  padding: 3px 8px;
  background: white;
  border: 1px solid #f80;
  color: #f80;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.actualizar:hover{
  background-color: #f80;
  color: white;;
}
.eliminar{
  padding: 3px 8px;
  background: white;
  border: 1px solid #e00;
  color: #e00;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.eliminar:hover{
  background-color: #e00;
  color: white;;
}
.deshabilitar{
  padding: 3px 8px;
  background: white;
  border: 1px solid #900;
  color: #900;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.deshabilitar:hover{
  background-color: #c00;
  color: white;;
}

.puntos{
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.puntos:hover{
  background-color: #d9dadb;
}
.indicador{
  background-color: #d7ded9;
}

.bloque-footer {
  padding: 6px 12px;
  font-size: 0.75rem;
  color: #6b7280;
  border-top: 1px solid #d1d5db;
  font-family: sans-serif;
  text-align: right;
}
</style>
