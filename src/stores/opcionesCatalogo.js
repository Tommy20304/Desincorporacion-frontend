import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
//en las recomendaciones del manual, colocar que cuando se quiera mandar archivos, se deben de hacer con un formato simple
export const opciones = defineStore("opciones", () => {
    class ManejoOpciones{
        constructor(){
            this.datosServidor = ref({});

            //un objeto con los datos seleccionados de cada campo
            this.seleccionados = reactive({categoria: '', marca: '', modelo: '', ubicaciones: ''});

            //activa los bloques de opciones de categoria, marca y modelo
            this.showSug = reactive({ categoria: false, marca: false, modelo: false , ubicaciones: ''}); 

            // Lógica de filtrado (Computed Properties)
            //para filtrar los items mediante el ingreso de letras en lo inputs
            this.filteredCats = computed(() =>
            this.extraerValores('categoria').filter(c => c.toLowerCase().includes(this.seleccionados.categoria.toLowerCase()))
            );

            this.filteredMarcas = computed(() =>
            this.extraerValores('marca').filter(m => m.toLowerCase().includes(this.seleccionados.marca.toLowerCase()))
            );

            this.modelosFiltrados = computed(() =>
            this.extraerValores('modelo').filter(mo => mo.toLowerCase().includes(this.seleccionados.modelo.toLowerCase()))
            );

            this.ubicacionesFiltrados = computed(() =>
            this.extraerValores('ubicaciones').filter(mo => mo.toLowerCase().includes(this.seleccionados.ubicaciones.toLowerCase()))
            );
        }

        extraerValores(campo) {
            /**
             * campo: el campo del cual se quieren extraer los valores, puede ser categoria, marca, modelo o ubicaciones
             */

            // se extrae los datos de los campos
            let valores = [];
            if (!this.datosServidor.value[campo]) return [];
            
            for (let i of this.datosServidor.value[campo].rows) {
            valores.push(Object.values(i)[1]);
            }
            return valores;
        }

         seleccionar(campo, valor) {
            /**
             * campo: el campo del cual se quieren extraer los valores, puede ser categoria, marca, modelo o ubicaciones
             * valor: el valor que se selecciono, es el que se va a mostrar en el input
             */

            // selecciona los valores que se ingresaron, ademas de quitar el bloque
            this.seleccionados[campo] = valor;
            this.showSug[campo] = false;
        }

        close(campo) {
            /**
             * campo: el campo por el cual se quiere cerrar el bloque
             */

            // quita el bloque
            this.showSug[campo] = false;
        }

        retornarIdCampo(campo){
            /**
             * campo: el campo por el cual se quiere retornar las id de su valor seleccionado
             */

            //retorna la id del dato proveniente del campo especificado, si el valor no tiene id, se coloca como 'no valido'
            if(!this.seleccionados[campo]) return '';
            const rowCorrespondiente = this.datosServidor[campo].rows.find(row => Object.values(row)[1] === this.seleccionados[campo].trim().toUpperCase());
            return rowCorrespondiente ? Object.values(rowCorrespondiente)[0] : 'no valido';
        }

        reiniciarValores(){
            //reinicia los valores seleccionados
            this.seleccionados.categoria = '';
            this.seleccionados.marca = '';
            this.seleccionados.modelo = '';
            this.seleccionados.ubicaciones = '';
        }
    }

    const manejoOpciones = new ManejoOpciones();

    return {
        manejoOpciones
    }
})