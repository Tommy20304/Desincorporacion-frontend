import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import { api } from './apis';
import { aleatorio } from './aleatorio.js';
import { controlNotificaciones } from './clase.js';
import { useRouter } from 'vue-router';
import { opciones } from './opcionesCatalogo.js';

export const clasesManuales = defineStore("clasesManuales", () => { 

const store = api();
const control = controlNotificaciones().manejoNotificacion;
const storeOpciones = opciones().manejoOpciones; //para poder reiniciar sus valores

class GestionEquipo {
  constructor(apiStore, controlNotificaciones ) {
    // Dependencias externas (inyectadas para mayor flexibilidad)
    this.store = apiStore;
    this.control = controlNotificaciones;
    
    // Estados reactivos
    this.enviando = ref(false);
    this.datosUsuario = JSON.parse(localStorage.getItem('datosUsuario'));
    this.datosServidor = { ubicaciones: '', condicion: '' }; // el valor inicial es para que no genere error

    //el objeto reactivo donde estan todos los campos que se muestran
    this.equipo = reactive({ 
      categoria: '', marca: '', modelo: '', serial: '', etiqueta: '',  mac_addre: '', ubicacion: '',
      bueno: [], malo: [], notas: '', usuario: this.datosUsuario.cedula
    });

  }

  /**metodos de comprobacions de los datos**/
  comprobarComponentesRepetidos() {
    //se comprueba los componentes repetidos
    let observacion = this.equipo.bueno.find((i) => this.equipo.malo.includes(i) && i);
    if (observacion) {
      return "hay componentes repetidos en componentes bueno y componentes malos";
    }
    return false;
  }

  comprobarEtiqueta(){
    //se comprueba que la etiqueta sea totalmente numerica
    if(!this.equipo.etiqueta)
      return true;
    
    return /^\d+$/.test(this.equipo.etiqueta) && this.equipo.etiqueta.length > 3;

  }

  comprobarMac(){
    //comprueba que la mac no sea impar, y se coloca los guiones
    let datoSinGuiones = this.equipo.mac_addre.replace(/-/g, ''); //el dato sin los guiones

    //si el dato sin guiones es impar, no es valido
    if (datoSinGuiones.length % 2 != 0 && this.equipo.mac_addre)
        return false;

    //si es par, se pone los guiones cada dos caracteres
    const macConGuiones = datoSinGuiones.split('').reduce((acc, letter, index) => {
      acc.push(letter.toUpperCase());

      if(((Number(index)+1) % 2) == 0 && datoSinGuiones.split('')[Number(index)+1])
        acc.push('-');
      
      return acc;
    }, [])

    this.equipo.mac_addre = macConGuiones.join('');
    return true;
  }

  determinarIngreso() {
    // se verificar que los datos de categoria, marca,modelo existen en la bd, ademas de colocar el id

    let camposErroneos = {};

    //se comprueba que los valores estan en la bd
    for(let campo of ['categoria', 'marca', 'modelo']){

      if (!this.equipo[campo]) continue;

      let estaEnBD = this.datosServidor[campo].rows.find(row => Object.values(row)[1] === this.equipo[campo]);
      if (!estaEnBD){
        camposErroneos[campo] = this.equipo[campo];
      }
    }

    // si no hay ningun campo erroreno, se saca el valor de id de estos campos
    if (!Object.keys(camposErroneos).length){

      for(let campo of ['categoria', 'marca', 'modelo']){

        if (!this.equipo[campo]) continue;
  
        const rowId = this.datosServidor[campo].rows.find(row => Object.values(row)[1] === this.equipo[campo]);
        this.equipo[campo] = Object.values(rowId)[0];
      }

      return false;
    }
    
    return camposErroneos;
  }
  //fin de los metodos de comprobacion de los datos

  ingresarDatos = async () => {
    // se ingresan los datos definitivamente

    await this.store.mandarJson({ datosIngresados: this.equipo }, "ingresar/ingresar-manual");
    
    if (!this.store.respuesta.mensaje) {
      this.control.activarNotificacionError("hubo errores en el envio");
      return;
    }

    this.control.activarNotificacionExito("Se ingresaron los datos correctamente");

    this.enviando = false;
    // se reinicia los valores
    Object.assign(this.equipo, {
      categoria: '', marca: '', modelo: '', serial: '', etiqueta: '',  mac_addre: '', ubicacion: '',
      bueno: [], malo: [], extraviado: [], notas: '', usuario: this.datosUsuario.cedula
    });

    storeOpciones.reiniciarValores(); //reinicia los valores de las opciones del catalogo
  }

  enviarDatos = async () => {
    //se envian los datos, comprobando los posibles errores
    this.enviando = true;
    
    // se determina si hay componentes repetidos
    const errorRepetidos = this.comprobarComponentesRepetidos();
    if (errorRepetidos) {
      this.enviando = false;
      this.control.activarNotificacionAdvertencia(errorRepetidos);
      return;
    }

    // se determina si la etiqueta es valida
    if (!this.comprobarEtiqueta()){
      this.enviando = false;
      this.control.activarNotificacionError("La etiqueta no es valida");
      return;
    }

    // se determina si la mac_addre es valida
    if (!this.comprobarMac()){
      this.enviando = false;
      this.control.activarNotificacionError("La dirección mac no es valida");
      return;
    }

    // se determina si los datos unicos de etiqueta y serial ya existen
    await this.store.mandarJson({ datosIngresados: this.equipo }, "ingresar/verificar-campos");
    
    if (this.store.respuesta.mensaje) {
      this.enviando = false;
      this.control.activarNotificacionAdvertencia(`Los datos de estos campos unicos ya existen: ${this.store.respuesta.campos.join(", ")}`);
      return;
    }

    const resultadoIngreso = this.determinarIngreso();
    if (resultadoIngreso) {
      this.enviando = false;
      this.control.datosIngresar = resultadoIngreso;
      this.control.activarNotificacionIngresar();
      return;
    }

    await this.ingresarDatos();
  }

  respuesta = async (res) => {
    //comprueba la respuesta de la notificacion de ingresar, si todo salio correcto o si hubo un error
    if (res == "error"){
        this.control.activarNotificacionError("hubo errores en el proceso de guardar");
        return;
    }
    if (res){
        //se hace la consulta nuevamente para sacar el id de los nuevos valores
        await this.store.recibirTablas();
        this.datosServidor = {...this.store.respuesta.datos};

        storeOpciones.datosServidor = {...this.store.respuesta.datos};

        this.determinarIngreso(); //se pone el id de los nuevos valores
        this.ingresarDatos();
        }
 }
}

class GestionActualizacion extends GestionEquipo{
    constructor(apiStore, controlNotificaciones, datosActulizar){
      //se llama al constructur padre
      super(apiStore, controlNotificaciones);

      this.activarPagina = ref(true); //para activar la pagina de actualizacion
      this.convertorColumnas = {categoria: 'nombre_categoria', marca: 'nombre_marca', modelo: 'nombre_modelo', serial: 'serial', etiqueta: 'etiqueta',  mac_addre: 'mac_addre', ubicacion: 'ubicacion_actual',
        bueno: 'bueno', malo: 'malo', extraviado: 'extraviado', notas: 'notas', usuario: 'nombre_usuario'};
      this.datosActulizar = datosActulizar;
    
      //se intancia de nuevo el equipo, pero quitar el usuario
      this.equipo = reactive({ 
        categoria: '', marca: '', modelo: '', serial: '', etiqueta: '',  mac_addre: '', ubicacion: '',
        bueno: [], malo: [], notas: ''});
      };

    
    mostrarRegistrosActuales(){ 
    //se muestran los registros que estan actualmente, esperando que se cambien

      for (let [clave, valor] of Object.entries(this.equipo)){
          //se cambia el valor
          let campo = this.convertorColumnas[clave];
          
          if (['bueno', 'malo'].includes(clave)){
              if (this.datosActulizar[campo] == 'desconocido' || this.datosActulizar[campo] == '0') continue;
              
              this.equipo[clave] = this.datosActulizar[campo].map(element => element.toLowerCase());
              continue
          }

          if (clave == "ubicacion"){
            //se saca el id de la ubicacion
            //si el nombre de la ubicacion coincide con una fila de los datos del servidor, se saca la id de esa fila
            let revision = this.datosServidor.ubicaciones.rows.find(ele => ele.ubicacion_actual == this.datosActulizar[campo])
            if (revision){
              this.equipo[clave] = revision.id_ubicacion;
              continue;
            }
          }

          //si el campo es valido
          if (campo){
            //se el valor es un s/c, se anula
            if (this.datosActulizar[campo].includes("/") && clave != 'notas') continue;

            this.equipo[clave] = this.datosActulizar[campo];
          
          };
      }
  }

  actualizarDatos = async () => {
  //similar al metodo enviarDatos del padre, pero ahora actualizando
  this.enviando = true;

  const errorRepetidos = this.comprobarComponentesRepetidos()
  if (errorRepetidos){
    //se determina si hay componentes repetidos
    this.enviando = false;
    this.control.activarNotificacionAdvertencia(errorRepetidos);
    return;
  }

  // se determina si la etiqueta es valida
  if (!this.comprobarEtiqueta()){
    this.enviando = false;
    this.control.activarNotificacionError("La etiqueta no es valida");
    return;
  }
  
  // se determina si la mac_addre es valida
  if (!this.comprobarMac()){
    this.enviando = false;
    this.control.activarNotificacionError("La dirección mac no es valida");
    return;
  }

  //se determina si los datos unicos de etiqueta y serial ya existen
  await this.store.mandarJson({datosIngresados: this.equipo}, "ingresar/verificar-campos")

  if (this.store.respuesta.mensaje){
      //se filtra los campos los cuales no sufrieron cambios
      let campos = this.store.respuesta.campos.filter(campo => this.datosActulizar[campo] != this.equipo[campo])
      //si tiene datos se muestra la notificacion
      if(campos.length){
        this.enviando = false;
        this.control.activarNotificacionAdvertencia(`Los datos de estos campos unicos ya existen: ${campos.join(", ")}`);
        return;
      }  
  }

  const determinar = this.determinarIngreso()
  if (determinar){
    //se señala que los datos no estan registrados
    this.enviando = false;
    this.control.activarNotificacionAdvertencia(`Los datos de estos campos no estas registrados: ${Object.keys(determinar).join(", ")}`);
    return;
  }

  //se actualiza los datos
  await this.store.mandarJson({datosIngresados: this.equipo, id: this.datosActulizar.id_equipo}, "actualizar/actualizar-manual")
  
  if (!this.store.respuesta.mensaje){
    this.enviando = false;
    this.control.activarNotificacionError("hubo errores en la actualizacion");
    return;
  }

  this.control.activarNotificacionExito("Se actualizaron los datos correctamente");

  this.activarPagina.value = false
  this.enviando = false;

};

}
const manualmente = new GestionEquipo(store, control);

const actualizar = new GestionActualizacion(store, control, null);
return {
    manualmente,
    actualizar
}

})