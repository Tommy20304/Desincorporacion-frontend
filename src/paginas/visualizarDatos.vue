<template>
  <div class="dashboard" v-if="visualizarPagina">
    <header class="dashboard-header">
      <h1>Datos a Ingresar</h1>
      <p>{{datos ? Object.keys(datos).join(", ") : ''}}</p>
    </header>

    <main class="content-container">

    <section v-if="datos" v-for="column in Object.keys(datos)" :key="column" class="lane">
        <div class="lane-header">
          <h2>{{column}}</h2>
          <span v-if="Array.isArray(datos[column])" class="badge">{{ datos[column].length }}</span>
          <span v-else class="badge">{{ 1 }}</span>
        </div>
        <div class="scroll-area">
          <div v-if="Array.isArray(datos[column])" v-for="item of datos[column]" :key="item" class="card">
            <div class="card-icon">{{camposIconos[column]}}</div>
            <div class="card-info">
              <h3>{{item}}</h3>
            </div>
          </div>
          <div v-else class="card">
            <div class="card-icon">{{camposIconos[column]}}</div>
            <div class="card-info">
              <h3>{{datos[column]}}</h3>
            </div>
          </div>
        </div>
      </section>

     
    </main>
  </div>
 
  <h1 v-else>Se perdieron los datos de la pagina :(</h1>
  
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { onUnmounted , onMounted, onUpdated} from 'vue';

//constantes fundamentales
const visualizarPagina = ref(true);
const ruta = useRoute();
const datos = JSON.parse(localStorage.getItem(ruta.params.parametro+"-datos")); //se accede al elemento
const camposIconos = {categoria: "📁", marca: '🏷️', modelo: '🚗'}

//se elimina el dato en el localStorage
function eliminarlocalStore(){
    localStorage.removeItem(ruta.params.parametro+"-datos");
    
}

onMounted(() => {
      window.addEventListener('beforeunload', eliminarlocalStore);
      
      //si se elimina el store, se cierra la pagina principal
      if(!localStorage.getItem(ruta.params.parametro+"-datos")){
        visualizarPagina.value = false;
      }
    });

onUnmounted(() => {
      // Limpiamos el evento si el componente se destruye pero la app sigue abierta
      window.removeEventListener('beforeunload', eliminarlocalStore);
    });

</script>

<style scoped>
/* Variables de color para un look profesional */
:root {
  --bg-color: #f4f7f6;
  --card-bg: #ffffff;
  --primary-text: #2d3436;
  --secondary-text: #636e72;
  --accent-color: #0984e3;
  --border-color: #dfe6e9;
}

.dashboard {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f4f7f6;
  min-height: 100vh;
  padding: 2rem;
  color: #2d3436;
}

.dashboard-header {
  margin-bottom: 2rem;
  text-align: center;
}

.dashboard-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.content-container {
  display: flex;
  gap: 1.5rem;
  height: 70vh; /* Altura fija para permitir scroll interno */
  max-width: 1200px;
  margin: 0 auto;
}

.lane {
  flex: 1;
  background: #ebf0f1;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  border: 1px solid #dfe6e9;
  overflow: hidden;
}

.lane-header {
  padding: 1rem 1.5rem;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #dfe6e9;
}

.lane-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.badge {
  background: #0984e3;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.scroll-area {
  padding: 1rem;
  overflow-y: auto; /* Aquí sucede la magia del scroll */
  flex-grow: 1;
}

/* Personalización del scrollbar */
.scroll-area::-webkit-scrollbar {
  width: 6px;
}
.scroll-area::-webkit-scrollbar-thumb {
  background-color: #b2bec3;
  border-radius: 10px;
}

.card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card-icon {
  font-size: 1.5rem;
  background: #f0f3f5;
  padding: 0.5rem;
  border-radius: 8px;
}

.card-info h3 {
  font-size: 1rem;
  margin: 0;
  font-weight: 600;
}

.card-info p {
  font-size: 0.85rem;
  color: #636e72;
  margin: 0.2rem 0 0;
}

/* Responsividad simple */
@media (max-width: 768px) {
  .content-container {
    flex-direction: column;
    height: auto;
  }
  .lane {
    height: 400px;
  }
}
</style>