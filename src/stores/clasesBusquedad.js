import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from './apis';
import { aleatorio } from './aleatorio.js';
import { controlNotificaciones } from './clase.js';
import { useRouter } from 'vue-router';

export const clasesBusqueda = defineStore("clasesBusqueda", () => {
    //se instancias las constantes globales
    let store = api();
    const router = useRouter();//se intancia el router
    let random = aleatorio(); //se instancia el store
    let control = controlNotificaciones().manejoNotificacion;

    //se procesa los componentes
    class ProcesarComponentes{
        procesarComponente(datos){
            const listaComponentes = ["cpu", "ram", "pantalla", "carcasa", "disco_duro", "tarjeta_madre", "fan_cooler", "fuente_poder"];
           
            //se comprueba si es un array
            datos = Array.isArray(datos) ? datos : [datos];
            
            return datos.map((fila) => {
                let row = {};

                for (const [clave, valor] of Object.entries(fila)) {

                    if(listaComponentes.includes(clave)){
                        if(valor == 'desconocido') continue;
                        
                        if(!row[valor]) row[valor] = [];

                        const claveLimpia = (clave == 'fuente_poder') ? clave.replace("_", " de ").toUpperCase() : clave.replace("_", " ").toUpperCase();

                        row[valor].push(claveLimpia);
                        continue;
                    }
                    row[clave] = valor;
                }

                row = this.validarEstados(row, fila);
                return row;
            }); 
        }

        // se comprueba si no se añadieron esas claves y si no, se añaden
        validarEstados(nuevoRegistro, filaOriginal){
            const rowAcomodado = nuevoRegistro; 
            ["bueno", "malo"].forEach(estado => {
            if (!(estado in nuevoRegistro)) {
                // se comprueba si todas las columnas de componentes se rellenaron
                const tieneDesconocidos = Object.entries(filaOriginal)
                .some(([k, v]) => v === "desconocido" && k !== "notas");
                rowAcomodado[estado] = tieneDesconocidos ? "desconocido" : "0";
            
            }
            });

            return rowAcomodado;
        }
    }


    class GestorBusqueda extends ProcesarComponentes{
    constructor(store, router, random, servicioNotificaciones) {
        super();

        // Dependencias externas
        this.store = store;
        this.router = router;
        this.random = random;
        this.notificaciones = servicioNotificaciones;
        this.resultadoBusqueda = null;

        // Estado (Equivalente a tus refs)
        this.datosSeleccionados = ref({});
        this.resultadoConsulta = ref([]);
        this.botonExportar = ref(['desactivado', true]);
        this.buscando = ref(false); //para mostrar la carga de busqueda
        this.resetiarBusqueda = ref(null); //para resetiar el bloque para buscar
    }

    // --- Métodos de Acción ---

    //se coloca funciones flechas para que puedan ser utilizadas en el html de vue
    recopilarDatos = (event) => {
        this.datosSeleccionados.value = event;
    }

    buscar = async (buscarDeshabilitado = null) => {
        //se determinan las expceciones 
        if (!this._validarFiltros()) return;
        if (!this._validarFechas()) return;
        if (!this._validarDuplicados()) return;

        //se arregla la mac_addre
        this._arreglarMacAddre();

        //se indica la carga
        this.buscando.value = true;
        try {

            if (!buscarDeshabilitado)
                await this.store.buscarDatos(this.datosSeleccionados.value);
            else
                await this.store.mandarJson({datos: this.datosSeleccionados.value}, "buscar/buscar-deshabilitado");

            const respuesta = this.store.respuesta.consulta;

            if (!respuesta) {
                this.notificaciones.activarNotificacionAdvertencia("Hubo errores en el envío");
            } else if (respuesta.rows.length === 0) {
                this.notificaciones.activarNotificacionAdvertencia("No se encontraron datos");
            } else {
                this.resultadoBusqueda = this.procesarComponente(respuesta.rows);
                this._configurarMostrarBusqueda(this.resultadoBusqueda);
            }
            //se quita la carga
            this.buscando.value = false;

        } catch (error) {
            console.error("Error en la búsqueda:", error);
            this.notificaciones.activarNotificacionAdvertencia("Error crítico en el servidor");
        }
    }

    reiniciar = () => {
        //se resetea todo
        this.resetiarBusqueda.value = String(Math.random()); //se hace asi, para activar el watch del bloqueBusqueda
        this.resultadoConsulta.value = [];
        this.datosSeleccionados.value = {};
        this.botonExportar.value = ['desactivado', true]; //se desactiva el boton de exportar
    }

    mandarPaginaExportar = () => {
          //se crea el localstore, con los datos buscados, con una clave unica que se mandara como parametro a la pagina
        const datos = JSON.parse(localStorage.getItem('export'));
        const key = this.random.generarString(10);
        
        localStorage.setItem(`${key}-export`, JSON.stringify(this.resultadoBusqueda));

        const routeData = this.router.resolve({ 
            name: 'exportar', 
            params: { parametro: key } 
        });
        
        window.open(routeData.href, '_blank');
    }

    mostrarCajaTexto = (event) => {
        this.notificaciones.activarNotificacionCajaTexto(event);
    }

    // --- Métodos Privados (Lógica interna) ---

    _arreglarMacAddre(){
        //se le coloca los guiones a la mac_addre
        if(!this.datosSeleccionados.value.mac_addre) return;

        let datoSinGuiones = this.datosSeleccionados.value.mac_addre.replace(/-/g, ''); //el dato sin los guiones

        const macConGuiones = datoSinGuiones.split('').reduce((acc, letter, index) => {
            acc.push(letter.toUpperCase());

            if(((Number(index)+1) % 2) == 0 && datoSinGuiones.split('')[Number(index)+1])
                acc.push('-');
            
            return acc;
        }, [])

        this.datosSeleccionados.value.mac_addre = macConGuiones.join('');
    }

    _configurarMostrarBusqueda(datos) {
        //se hacen los cambios para que se pueda mostrar la busqueda
        this.resultadoConsulta.value = datos;
        this.notificaciones.activarArchivo = false; //se desactiva el bloque 
        this.notificaciones.activarAdvertencia = false; //se desactiva la notificacion
        
        // Activar botón exportar
        this.botonExportar.value = ['btn-success', false];
    }

    _validarFiltros() {
        let tieneFiltros = false;
        let opcionesInValidas = []; //almacena los campos que tienen opciones invalidas (categoria,marca,modelo,ubicacion)
        const componentes = ["componenteBueno", "componenteMalo", "componenteExtraviado"];

        //se revisa si se ingreso algun filtro, para evitar que se ejecute una busqueda sin filtros
        for (let [clave, valor] of Object.entries(this.datosSeleccionados.value)) {
            if (componentes.includes(clave)) {
                if (valor.find(element => element)) { //devuelve un valor si el element es positivo, sino un null
                    tieneFiltros = true;
                    break; //si la revision es positiva se termina
                }
            } else if (valor) {
                tieneFiltros = true;
                break;
            }

        }

        //se comprueba si las opciones de categoria, marca, modelo y ubicacion son validas, es decir, que el usuario no escribio algo que no esta en las opciones
        Object.entries(this.datosSeleccionados.value).forEach(([clave, valor]) => {
            if (['categoria', 'marca', 'modelo', 'ubicacion'].includes(clave) && valor){
                if(valor === 'no valido') opcionesInValidas.push(clave);
            }
        });


        if (!tieneFiltros) {
            this.notificaciones.activarNotificacionAdvertencia("No ingresó ningún filtro. Ingrese alguno");
        }

        if (opcionesInValidas.length) {
            this.notificaciones.activarNotificacionAdvertencia(`Los siguientes campos tienen opciones no válidas: ${opcionesInValidas.join(', ')}. Por favor, seleccione una opción válida.`);
            return false;
        }

        return tieneFiltros;
    }

    _validarFechas() {
        //se verifica si se ejecuto el fecha_registroDespues pero no el fecha_registroAntes

        const { fecha_registroAntes, fecha_registroDespues } = this.datosSeleccionados.value;
        const { fecha_desincorporacionAntes, fecha_desincorporacionDespues } = this.datosSeleccionados.value;
        
        if (!fecha_registroAntes && fecha_registroDespues) {
            this.notificaciones.activarNotificacionAdvertencia("Le faltó ingresar la otra fecha de registro");
            return false;
        }

        if (!fecha_desincorporacionAntes && fecha_desincorporacionDespues) {
            this.notificaciones.activarNotificacionAdvertencia("Le faltó ingresar la otra fecha de desincorporacion");
            return false;
        }

        return true;
    }

    _validarDuplicados() {
        //se verifica si hay componentes repetidos en los arrays, los elementos negativos no cuentan

        const { componenteBueno, componenteMalo } = this.datosSeleccionados.value;
        const repetido = componenteBueno.find(i => componenteMalo.includes(i) && i);
        
        if (repetido) {
            this.notificaciones.activarNotificacionAdvertencia("Hay componentes repetidos en bueno y malo");
            return false;
        }
        return true;
    }

}
    class GestorArchivo extends GestorBusqueda{
        constructor(store, router, random, servicioNotificaciones){
            // Llamamos al constructor de la clase padre
            super(store, router, random, servicioNotificaciones)
            this.datosArchivo = ref(null); //los datos de la busqueda, cuando se manda un archivo
        }
        // --- Métodos Específicos de Archivo ---

    pasarArchivo = () => {
        this.notificaciones.activarNotificacionArchivo();
    }

    mostrarResultadoArchivo = (datos) => {
        // Almacenamos los datos en el ref heredado
        this.datosArchivo.value = datos;

        // 1. Validaciones de error y existencia
        if (!datos.mensaje) {
            return this.notificaciones.activarNotificacionError("Hubo problemas con el envio");
        }

        if (datos.mensaje === 'no se encontro ningun dato') {
            return this.notificaciones.activarNotificacionAdvertencia("no se encontro ningun dato. Revise los nombres de los campos");
        }

        // 2. Manejo de flujos con advertencia (confirmación del usuario)
        if (datos.mensaje === 'registros repetidos') {
            return this.notificaciones.activarNotificacionAdvertencia(
                "se encontraron identificadores iguales en el archivo. Desea buscar de todos modos?", 
                null, 
                true
            );
        }

        if (datos.mensaje === 'filas no encontradas') {
            return this.notificaciones.activarNotificacionAdvertencia(
                "Estas filas no se encontraron. Desea ver los datos de todos modos", 
                datos.resultado.filasNoObtenidas
            );
        }

        // Si pasa todas las excepciones, usamos los métodos de la clase padre
        this.resultadoBusqueda = this.procesarComponente(datos.resultado.datosObtenidos);

        this._configurarMostrarBusqueda(this.resultadoBusqueda);
    }

    respuesta = (event) => {
        // Si el usuario acepta (event es true)
        if (event) {
            const data = this.datosArchivo.value;

            if (data.mensaje === 'registros repetidos') {
                // Si además hay filas no encontradas, redirigimos el flujo
                //si hay filas no encontradas, se cambia el nombre del mensaje, y se ejecuta la funcion para que pase por ese flujo
                if (data.resultado.filasNoObtenidas && data.resultado.filasNoObtenidas.length > 0) {
                    data.mensaje = 'filas no encontradas';
                    return this.mostrarResultadoArchivo(data);
                }
            }
            
            // En cualquier caso positivo, mostramos los datos obtenidos
            this.resultadoBusqueda = this.procesarComponente(data.resultado.datosObtenidos);

            this._configurarMostrarBusqueda(this.resultadoBusqueda);
        } else {
            this.notificaciones.activarAdvertencia = false;
        }
    }

}

const gestor = new GestorArchivo(store, router, random, control);
return {
    gestor
}

})