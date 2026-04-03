<template>
  <div class="container">
    <h1 class="title">Catálogo de Artículos</h1>
    
    <div class="accordion">
      <div 
        v-for="(articulo, index) in articulos" 
        :key="articulo.id" 
        class="card"
        :class="{ active: activeIndex === index }"
      >
        <div class="card-header" @click="toggle(index)">
          <span>{{ articulo.nombre }}</span>
          <span class="icon">{{ activeIndex === index ? '−' : '+' }}</span>
        </div>

        <div 
          class="card-body-wrapper" 
          :style="{ maxHeight: activeIndex === index ? '300px' : '0' }"
        >
          <div class="card-body">

            <div v-if="erroresExpeciales.includes(index)" class="sub-accordion">
              <div v-for="(subItems, key) in articulo.detalles" :key="key" class="sub-card">
                <div class="sub-header" @click="toggleSub(key)">
                  <span>{{ key }}</span>
                  <span class="sub-icon">{{ activeSubIndex === key ? '▾' : '▸' }}</span>
                </div>
                <div 
                  class="sub-body-wrapper"
                  :style="{ maxHeight: activeSubIndex === key ? '200px' : '0' }"
                >
                  <ul class="specs sub-specs">
                    <li v-for="item in subItems" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div v-else-if="index.includes('componente repetido en')" class="sub-accordion">
              <div v-for="(subItems, key) in articulo.detalles" :key="key" class="sub-card">
                <div class="sub-header" @click="toggleSub(key)">
                  <span>{{ key }}</span>
                  <span class="sub-icon">{{ activeSubIndex === key ? '▾' : '▸' }}</span>
                </div>
                <div 
                  class="sub-body-wrapper"
                  :style="{ maxHeight: activeSubIndex === key ? '200px' : '0' }"
                >
                  <ul class="specs sub-specs">
                    <li v-for="item in subItems[0]" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <ul v-else class="specs">
              <li v-for="spec in articulo.detalles" :key="spec">{{ spec }}</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
    <div class="download-section">
        <button class="download-btn">
            <svg 
            viewBox="0 0 24 24" 
            width="20" 
            height="20" 
            stroke="currentColor" 
            stroke-width="2" 
            fill="none" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Descargar Archivo con los Errores
        </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeIndex = ref(null);
const activeSubIndex = ref(null); // Controla el sub-desplegable
const articulos = ref([
  {
    id: 1,
    nombre: "Cámara Réflex Pro-Red",
    precio: 850,
    descripcion: "Una cámara de alto rendimiento con acabado carmesí metálico. Ideal para fotografía nocturna y retratos detallados.",
    detalles: ["Sensor 24.2MP", "Video 4K", "ISO 100-25600", "Lente 18-55mm"]
  },
  {
    id: 2,
    nombre: "Audífonos Studio Scarlet",
    precio: 120,
    descripcion: "Cancelación de ruido activa y una respuesta de bajos profunda en un diseño ergonómico de cuero rojo.",
    detalles: {Bluetho: ["1212", "1212", "12"], Audifonos: ["asada", "nuevo", "algo"]}
  },
  {
    id: 3,
    nombre: "Reloj Inteligente Crimson-Fit",
    precio: 199,
    descripcion: "Monitorea tu salud con estilo. Resistente al agua y con una pantalla AMOLED vibrante.",
    detalles: ["GPS integrado", "Sensor ritmo cardíaco", "Resistencia 5ATM", "Modos deportivos"]
  }
]);
const erroresExpeciales = ["columna repetida", 'valor repetido en serial', 'valor repetido en etiqueta'] 
const toggle = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

const toggleSub = (key) => {
  activeSubIndex.value = activeSubIndex.value === key ? null : key;
};
//determina si es un objeto
const esObjeto = (val) => val && typeof val === 'object' && !Array.isArray(val);
</script>

<style scoped>
/* Contenedor Principal */
.container {
  max-width: 600px;
  margin: 2rem auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.title {
  text-align: center;
  color: #b30000;
  margin-bottom: 2rem;
}

/* Acordeón / Cards */
.accordion {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  border: 1px solid #ffcccc;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.card.active {
  border-color: #e60000;
  box-shadow: 0 4px 12px rgba(230, 0, 0, 0.15);
}

/* Encabezado */
.card-header {
  padding: 1.2rem;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: bold;
  color: #800000;
  transition: background 0.2s;
}

.card-header:hover {
  background: #fff5f5;
}

.icon {
  font-size: 1.5rem;
  color: #e60000;
}

/* Cuerpo desplegable con Scroll */
.card-body-wrapper {
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden; /* Oculta el contenido cuando está cerrado */
}

.card-body {
  padding: 1.2rem;
  border-top: 1px solid #ffe6e6;
  max-height: 250px; /* Altura máxima interna */
  overflow-y: auto; /* Habilita el scroll si el contenido es largo */
}

/* Estilo del Scrollbar (Opcional, para que se vea más pro) */
.card-body::-webkit-scrollbar {
  width: 6px;
}
.card-body::-webkit-scrollbar-thumb {
  background-color: #ffb3b3;
  border-radius: 10px;
}

.description {
  line-height: 1.6;
  color: #555;
  margin-bottom: 1rem;
}

.specs {
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
}

.specs li {
  padding: 0.3rem 0;
  font-size: 0.9rem;
  color: #777;
}

.specs li::before {
  content: "•";
  color: #e60000;
  margin-right: 10px;
}

/* Pie de página y Botón */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.price {
  font-size: 1.4rem;
  font-weight: bold;
  color: #e60000;
}

.buy-button {
  background: #e60000;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.buy-button:hover {
  background: #b30000;
}
.download-section {
  margin-top: 3rem;
  padding: 2rem 0;
  text-align: center;
  border-top: 2px dashed #ffcccc;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: #800000; /* Rojo vino oscuro */
  color: white;
  border: 2px solid #b30000;
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(128, 0, 0, 0.2);
}

.download-btn:hover {
  background-color: #e60000; /* Rojo más brillante al pasar el mouse */
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 0, 0, 0.3);
}

.download-btn svg {
  transition: transform 0.3s ease;
}

.download-btn:hover svg {
  transform: translateY(3px); /* Efecto de rebote en el icono */
}
/* --- ESTILOS DEL SUB-DESPLEGABLE --- */
.sub-accordion {
  margin: 1rem 0;
  border-left: 2px solid #ffb3b3;
  padding-left: 10px;
}
.sub-card {
  margin-bottom: 0.5rem;
  background: #fffafa;
  border-radius: 4px;
}
.sub-header {
  padding: 0.6rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #b30000;
  background: #ffe6e6;
  border-radius: 4px;
}
.sub-header:hover { background: #ffd6d6; }
.sub-icon { font-size: 0.8rem; }

.sub-body-wrapper {
  transition: max-height 0.3s ease;
  overflow-y: auto; /* Scroll interno si es necesario */
}
.sub-specs { padding: 0.5rem 1rem !important; margin: 0 !important; }
</style>