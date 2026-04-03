<script setup>
import { Toaster } from 'vue-sonner'
import { RouterView } from 'vue-router'; //Para que las rutas se ejecuten
//los props son mensajes que se envian desde un componente padre, al hijo, el hijo es el compornente que se importa y se introduce
//se manda dato al atributo mensaje
let text = "hola como andas";
let objeto = {r:2,t:4}

</script>

<template>
 
  <RouterView /> 
 
</template>

<style scoped>

</style>
