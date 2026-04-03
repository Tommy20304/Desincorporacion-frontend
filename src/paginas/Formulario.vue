<script setup>

import { reactive, onUpdated } from 'vue';
import { Store } from '../stores/datosFormulario';
import router from "../rutas/indes";
const store = Store(); //se conecta el store

let objeto = reactive({ //reactive es lo mismo que ref, solo que en esta si se puede poner objetos
    nombre: "",
    apellido: "",
    edad: 0
});
//se usa el modelo para cambiar los atributos de reactive

let funcion = () => { //cada vez que se envia un dato al formulario, se ejecuta esta funcion
    if(!objeto.nombre || !objeto.apellido || !objeto.edad){
        alert("rellene todos los campos"); 
        return
    }
    store.añadirDatos({...objeto}); //se manda los datos recolectados a la store, para que se puedan mostrar en otra pagina
    //se pone los tres puntos para mandar una copia de la variable, esto debido a que si se envia la variable como tal, si se envia otro elemento
    //sin cambiar de ruta, los datos que se envian con esta variable cambiarian, ya que se esta pasando como tal la referencia de la variable, por lo cual si cambia
    //las demas cambiarias
   router.push({ name: "datos formulario"}) //esto hace que se mueva el cliente a la ruta con el nombre establecido 
}
//el prevent desactiva el comportamiento por defecto, que es recargar la pagina

onUpdated(() => { //se ejecuta cuando se actualiza el componente
    console.log("se actualizo el componente")
})
</script>

<template>

    <div class="principal-formulario">
    <form @submit.prevent="funcion">
        <h1>Bienvenido a formulario</h1>
        <label for="nombre">nombre</label>
        <input v-model="objeto.nombre" type="text" id="nombre">

        <label for="apellido">Apellido</label>
        <input v-model="objeto.apellido" type="text" id="apellido">

        <label for="edad">Edad</label>
        <input v-model="objeto.edad" type="number" id="edad">

        <input type="submit" value="enviar">
    </form>
    </div>
    
</template>

<style>
.principal-formulario{
    display: flex;
    justify-content: center;
    align-items: center;
}
form{
    width: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}
input{
    margin-bottom: 20px;
}
label{
    font-size: 20px;
    font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}
input{
    font-size: 18px;
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande'
}
</style>