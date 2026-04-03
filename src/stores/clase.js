import { defineStore } from "pinia";
import { ref } from "vue";


export const controlNotificaciones = defineStore("clase", () => {
    
    class Notificacion{
    constructor(){
        this.activarAdvertencia = ref(null);
        this.activarExito = ref(null);
        this.activarError = ref(null);
        this.activarIngresar = ref(null);
        this.datosIngresar = ref(null);
        this.columnasError = ref(null);
        this.columnasAdvertencia = ref(null);
        this.texto = ref(null);
        this.columnasNoContadas = ref(false);
        //this.PosibleError = ref(false);
        this.errorCritico = ref(false);
        this.activarCajaTexto = ref(false);
        this.activarArchivo = ref(false);
        this.activarOpcionesActualizar = ref(false);
        this.activarMandarClave = ref(false)
        this.preguntarAdv = ref(false);
     
    }
    activarNotificacionIngresar(){
        this.activarIngresar = true;
    }

    activarNotificacionMandarClave(){
        this.activarMandarClave = true;
    }

    activarNotificacionOpcionesActualizar(){
        this.activarOpcionesActualizar = true;
    }

    activarNotificacionArchivo(){
        this.activarArchivo = true;
    }

    activarNotificacionCajaTexto(texto){
        this.activarCajaTexto = true;
        this.texto = texto;
    }

    activarNotificacionExito(texto){
        this.activarExito = true;
        this.texto = texto;
    }

    activarNotificacionError(texto, columnas = null, columnasNoContadas = false){
        this.activarError = true;
        this.texto = texto;
        this.columnasError = columnas;
        if(columnasNoContadas){
            this.columnasNoContadas = columnasNoContadas;
        }
    }
  
     activarNotificacionAdvertencia(texto, columnas = null, preguntar = false){
        this.activarAdvertencia = true;
        this.texto = texto;
        this.columnasAdvertencia = columnas;
        this.preguntarAdv = preguntar;
    }
    
    determinarAdvertencias(){
        //se determina si hay un error critico
        if(this.errorCritico){
            this.activarAdvertencia = false;
            this.activarNotificacionError(this.errorCritico);
            this.errorCritico = false;
            return true;
        }
        //se determina si hay datos que se pueden ingresar
        if(this.datosIngresar){
            this.activarAdvertencia = false;
            this.activarError = false;
            this.activarNotificacionIngresar();
            return true;
        }

        if(this.PosibleError){
            this.activarNotificacionAdvertencia("Estos datos pueden no ser de esta columna. ¿Desea mandarlos de todos modos?", 
            this.PosibleError)
            this.activarError = false;
            this.PosibleError = null;
            return true
        }else if(this.columnasNoContadas){
            this.activarAdvertencia = false;
            
            this.activarNotificacionAdvertencia("Estas columnas no se van a ingresar.¿desea mandar los datos?", this.columnasNoContadas);
            this.activarError = false;
            this.columnasNoContadas = null;
            return true;
        }

        return false;
    }
    
};

let manejoNotificacion = new Notificacion();
    return {
       manejoNotificacion,
    }
})