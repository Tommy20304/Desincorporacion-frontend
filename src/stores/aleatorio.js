import { defineStore } from "pinia";

export const aleatorio = defineStore('aleatorio', () => {
    const generarString = (longitud) => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789?¡|';
    let resultado = '';
    for (let i = 0; i < longitud; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
   return resultado;

};
    return{
        generarString
    }
})