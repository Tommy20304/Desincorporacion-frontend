import { defineStore } from "pinia";
import { ref } from "vue";
export const api = defineStore("api", () => {

    const token = localStorage.getItem("token");
    const datos = ref();
    const respuesta = ref();
    const urlBackend = "https://desincorporacion-back.onrender.com";
    
    //se realiza una peticion sin token
    const mandarSinToken = async (body, ruta) => {
        //body: el cuerpo de la peticion
        //ruta: la ruta del servidor
        try{ 
            let respuestaPeticion = await fetch(`${urlBackend}/${ruta}`, {
                headers: { 'Content-Type': 'application/json'},
                method: "POST",
                body: JSON.stringify(body) 
            });
            respuesta.value = await respuestaPeticion.json();
        }catch(e){
            respuesta.value = {mensaje: false, error: e};
        }
    }

    //se mandan archivos
    const mandarArchivo = async (body, ruta) => {  
        //body: el cuerpo de la peticion
        //ruta: la ruta del servidor
        try{
            let respuestaPeticion = await fetch(`${urlBackend}/${ruta}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                method: "POST",
                body: body
            });
            respuesta.value = await respuestaPeticion.json();
        }catch(e){
            respuesta.value = {mensaje: false, error: e};
            
        }
    };

    //se mandan json
    const mandarJson = async (body, ruta) => {
        //body: el cuerpo de la peticion
        //ruta: la ruta del servidor
        try{
            let respuestaPeticion = await fetch(`${urlBackend}/${ruta}`, {
                headers: { 'Content-Type': 'application/json' , 'Authorization': `Bearer ${token}` },
                method: "POST",
                body: JSON.stringify(body) 
            });
            respuesta.value = await respuestaPeticion.json();
        }catch(e){
            respuesta.value = {mensaje: false, error: e};
        }
    }

    //se mandan datos y se recibe un archivo
    const recibirArchivo = async (body, ruta) => {  
        //body: el cuerpo de la peticion
        //dominio: la ruta del servidor
        try{
            let respuestaPeticion = await fetch(`${urlBackend}/${ruta}`, {
                headers: { 'Content-Type': 'application/json' , 'Authorization': `Bearer ${token}` },
                method: "POST",
                body: JSON.stringify(body) 
            });
            respuesta.value = await respuestaPeticion.blob();
        }catch(e){
            respuesta.value = {mensaje: false, error: e};
            
        }
    };
    
    //se retornan datos
    const leer = async (ruta) => {
        //ruta: la ruta del servidor
        try{
            let respuestaPeticion = await fetch(`${urlBackend}/${ruta}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                method: "GET"
            });
            respuesta.value = await respuestaPeticion.json();
        }catch(e){
            respuesta.value = {mensaje: false, error: e};
        }
    }

    /*llamadas a la api para busquedas*/

    //se reciben las tablas con datos persistentes, para mostrarlos en el bloque de busqueda
    const recibirTablas = async () => {
        try{
            let respuestaPeticion = await fetch(`${urlBackend}/buscar/bloque-busqueda`, {
                headers: { 'Authorization': `Bearer ${token}` },
                method: "GET"
            });
            respuesta.value = await respuestaPeticion.json();
        }catch(e){
            respuesta.value = {mensaje: false, error: e};
        }
    }

    const buscarDatos = async (body) => {
        //body: el cuerpo de la peticion
        try{
            let respuestaPeticion = await fetch(`${urlBackend}/buscar/buscar-datos`, {
                headers: { 'Content-Type': 'application/json' , 'Authorization': `Bearer ${token}`},
                method: "POST",
                body: JSON.stringify(body) 
            });
            respuesta.value = await respuestaPeticion.json();
        }catch(e){
            respuesta.value = {consulta: false, error:e};
        }
    }

    return {
        datos,
        urlBackend,
        mandarArchivo,
        mandarJson,
        recibirArchivo,
        respuesta,
        leer,
        recibirTablas,
        buscarDatos,
        mandarSinToken
    }
})
