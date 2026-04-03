<template>
    <barraNavegacion>
       
    </barraNavegacion>
  <div class="dashboard-container">
    <button class="logout-btn" @click="cerrarSesion">
      <span>Cerrar Sesión</span>
    </button>
    
    <header class="welcome-header">
      <h1 class="welcome-title">
        Bienvenid@, <span class="user-name">{{ datosUsuario.nombre }}</span>
      </h1>
      <p class="welcome-subtitle">{{ datosUsuario.cargo }}</p>
    </header>

    <main class="content-wrapper">
      
      <section class="action-section">
        <h2 class="section-title user-title">Acciones de Usuario</h2>
        <div class="grid-layout">
          <div class="card user-card" @click="pestañaHistorial">
            <div class="card-icon">👤</div>
            <h3>Historial de Ingresos Masivos</h3>
            <p>Visualizar el historial</p>
          </div>
          <div class="card user-card" @click="pestañaverClaves">
            <div class="card-icon">📩</div>
            <h3>Visualizar Claves de Cajas</h3>
            <p>Visualizar las claves</p>
          </div>
          <div class="card user-card" @click="pestañaClaveCajas">
            <div class="card-icon">⚙️</div>
            <h3>Agregar Claves de Cajas</h3>
            <p>Agregar Claves</p>
          </div>
        </div>
      </section>

      <section v-if="datosUsuario.cargo == 'Administrador'" class="action-section admin-zone">
        <h2 class="section-title admin-title">Panel de Administración</h2>
        <div class="grid-layout admin-grid">
          <div class="card admin-card" @click="pestañaPlantilla">
            <span class="admin-badge">⚡</span>
            <div class="admin-info">
              <h4>Gestionar Plantillas</h4>
              <small>Acceso Exclusivo</small>
            </div>
          </div>
          <div class="card admin-card" @click="pestañaDatosPersistentes">
            <span class="admin-badge">⚡</span>
            <div class="admin-info">
              <h4>Gestionar Datos Persistentes</h4>
              <small>Acceso Exclusivo</small>
            </div>
          </div>
          <div class="card admin-card" @click="pestañaRegistro">
            <span class="admin-badge">⚡</span>
            <div class="admin-info">
              <h4>Agregar Usuarios</h4>
              <small>Acceso Exclusivo</small>
            </div>
          </div>
          <div class="card admin-card" @click="pestañagestionarUsuario">
            <span class="admin-badge">⚡</span>
            <div class="admin-info">
              <h4>Gestionar Usuarios</h4>
              <small>Acceso Exclusivo</small>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import barraNavegacion from '../components/barraNavegacion.vue';
import { useRouter } from 'vue-router';

//variables de entorno
let datosUsuario = JSON.parse(localStorage.getItem('datosUsuario'))
const ruta = useRouter();

//se convierte el cargo con la primera letra mayuscula y el resto minuscula
datosUsuario.cargo = datosUsuario.cargo.charAt(0).toUpperCase() + datosUsuario.cargo.slice(1).toLowerCase();

//se cierra sesion
function cerrarSesion(){
    localStorage.removeItem("token");
    localStorage.removeItem("datosUsuario");
    window.location.href = '/acceder';
}

//funciones para abrir pestañas
function pestañaHistorial(){
  const routeData = ruta.resolve({ name: 'historial-claves'});
  window.open(routeData.href, '_blank');
}

function pestañaClaveCajas(){
  const routeData = ruta.resolve({ name: 'clave-caja'});
  window.open(routeData.href, '_blank');
}

function pestañaPlantilla(){
  const routeData = ruta.resolve({ name: 'ingresar-planilla'});
  window.open(routeData.href, '_blank');
} 
function pestañaDatosPersistentes(){
  const routeData = ruta.resolve({ name: 'manipular-datos'});
  window.open(routeData.href, '_blank');
}
function pestañagestionarUsuario(){
  const routeData = ruta.resolve({ name: 'gestionar-usuario'});
  window.open(routeData.href, '_blank');
}
function pestañaRegistro(){
  const routeData = ruta.resolve({ name: 'registro'});
  window.open(routeData.href, '_blank');
}
function pestañaverClaves(){
  const routeData = ruta.resolve({ name: 'ver-claves'});
  window.open(routeData.href, '_blank');
}
</script>

<style scoped>
/* 1. Variables de Color (Paleta Basada en Rojo Institucional) */
.dashboard-container {
  --bg-light: #fefafa;       /* Fondo con un toque cálido */
  --bg-white: #ffffff;
  --primary: #C80E16;        /* El rojo de la imagen */
  --primary-hover: #a10b12;
  --secondary: #ef4444;      /* Rojo acento */
  --admin-color: #b91c1c;
  --text-main: #1e293b;
  --text-dim: #64748b;
  --border-light: #f1f5f9;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  min-height: 100vh;
  background-color: var(--bg-light);
  /* Gradiente radial sutil hacia el rojo de la marca */
  background-image: radial-gradient(circle at top right, #fff1f2, #fefafa);
  color: var(--text-main);
  font-family: 'Inter', 'Segoe UI', sans-serif;
  padding: 2rem;
}

/* 2. Botón de Cerrar Sesión */
.logout-btn {
  position: absolute;
  top: 10rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: var(--text-dim);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.logout-btn:hover {
  background-color: #fff1f2;
  color: var(--primary);
  border-color: #fecdd3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(200, 14, 22, 0.1);
}

/* 3. Animación de Bienvenida */
.welcome-header {
  text-align: center;
  padding: 3rem 1rem;
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-title {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  font-weight: 800;
  color: #0f172a;
}

.user-name {
  /* Gradiente usando el rojo de la imagen */
  background: linear-gradient(90deg, #C80E16, #ef4444);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-subtitle {
  color: var(--text-dim);
  font-size: 1.3rem;
}

/* 4. Estructura de Secciones */
.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.section-title::before {
  content: "";
  width: 5px;
  height: 20px;
  border-radius: 10px;
}

.user-title::before { background-color: var(--primary); }
.admin-title::before { background-color: var(--admin-color); }

/* 5. Grid y Tarjetas Blancas */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.5rem;
  transition: var(--transition);
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.user-card:hover {
  transform: translateY(-6px);
  border-color: #fecdd3; /* Borde rosa suave al hover */
  box-shadow: 0 20px 25px -5px rgba(200, 14, 22, 0.1);
}

.card-icon {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.card h3 { 
  margin-bottom: 0.4rem; 
  font-size: 1.15rem; 
  color: var(--text-main);
}

.card p { 
  color: var(--text-dim); 
  font-size: 0.9rem; 
  line-height: 1.6; 
}

/* 6. Estilo Admin (Zona Clara) */
.admin-zone {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.admin-grid {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.admin-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fffafa;
}

.admin-card:hover {
  background: white;
  border-color: #fda4af;
  box-shadow: 0 10px 15px -3px rgba(185, 28, 28, 0.1);
}

.admin-badge {
  background: #fee2e2;
  color: var(--admin-color);
  padding: 0.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
}

.admin-info h4 { margin: 0; font-size: 0.95rem; color: var(--text-main); }
.admin-info small { color: #94a3b8; font-size: 0.75rem; }

/* Responsive */
@media (max-width: 768px) {
  .welcome-title { font-size: 2.2rem; }
  .logout-btn { 
    position: static; 
    margin: 0 auto 2rem auto;
    width: fit-content;
  }
}
</style>