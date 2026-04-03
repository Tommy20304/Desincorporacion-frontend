<script setup>

</script>

<template>
  <nav class="navbar">
    <div class="navbar-header">
      <!-- Tu comentario aquí -->
      <img src="../assets/logo.png" alt="Logo Izquierdo" class="nav-logo side-left" />

      <h1 class="navbar-title">Desincorporación</h1>

      <!--<img src="../assets/AIT.svg" alt="Logo Derecho" class="nav-logo side-right" />-->
    </div>

    <div class="navbar-menu">
      <ul class="nav-links">
        
        <li class="nav-item">
        <router-link class = "nav-button" to="/">Inicio</router-link>
        </li>

        <li class="nav-item dropdown">
          <a href="#" class="nav-button">
            Ingresar <span class="arrow">▼</span>
          </a>
          <ul class="dropdown-menu">
            
            <li><router-link to="/ingresar-excel">Ingresar por Excel</router-link></li>
            <li><router-link to="/ingresar-manualmente">Ingresar Manualmente</router-link></li>
          </ul>
        </li>

        <li class="nav-item dropdown">
          <a href="#" class="nav-button">
            Buscar <span class="arrow">▼</span>
          </a>
          <ul class="dropdown-menu">
            
            <li><router-link to="/buscar-datos">Por Desincorporar</router-link></li>
            <li><router-link to="/buscar-deshabilitado">Desincorporado</router-link></li>
          </ul>
        </li>

        <li class="nav-item dropdown">
          <a href="#" class="nav-button">
            Eliminar <span class="arrow">▼</span>
          </a>
          <ul class="dropdown-menu">
            
            <li><router-link to="/eliminar">Eliminar</router-link></li>
            <li><router-link to="/desincorporar">Desincorporar</router-link></li>
            <li><router-link to="/quitar-desincorporacion">Deshacer Desincorporación</router-link></li>
          </ul>
        </li>

        <li class="nav-item">
          <router-link class = "nav-button" to="/actualizar">Actualizar</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style>
/* Configuración de Colores y Variables - Paleta Rojiza */
:root {
  --primary-red: #cd1c29;    /* El rojo exacto de la imagen */
  --dark-red: #a10b12;       /* Un tono más oscuro para profundidad */
  --light-red: #f44336;      /* Rojo acento para detalles */
  --hover-red-bg: #fff5f5;   /* Fondo muy sutil para los menús */
  --white: #ffffff;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.navbar {
  background-color: var(--primary-red); 
  font-family: 'Segoe UI', Roboto, sans-serif;
  box-shadow: var(--shadow);
  width: 100%;
  margin: 0;
}

/* Título Superior */
.navbar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 0 0.5rem 0;
}

.nav-logo {
  height: 100px;
  width: auto;
  object-fit: contain;
}

.navbar-title {
  color: var(--white);
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Contenedor de Enlaces */
.navbar-menu {
  display: flex;
  justify-content: center;
  padding-bottom: 1rem;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
  margin: 0 10px;
}

/* Botones Principales */
.nav-button {
 color: rgba(255, 255, 255, 0.85); /* Blanco con ligera transparencia */
  text-decoration: none;
  padding: 10px 20px;
  display: block;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.nav-button:hover {
 color: var(--white);
  background-color: rgba(0, 0, 0, 0.1); /* Oscurece un poco el rojo al pasar el mouse */
}

.arrow {
  font-size: 0.7rem;
  margin-left: 5px;
  vertical-align: middle;
}

/* Menú Desplegable (Dropdown) */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background-color: var(--white);
  min-width: 180px;
  list-style: none;
  padding: 10px 0;
  margin: 0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  
  /* Animación */
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: 1000;
}

.dropdown-menu li a {
  color: #333;
  text-decoration: none;
  padding: 10px 20px;
  display: block;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.dropdown-menu li a:hover {
  background-color: var(--hover-red-bg);
  color: var(--primary-red);
}

/* Lógica de Hover */
.nav-item:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* Línea decorativa inferior en hover */
.nav-button::after {
  content: '';
  display: block;
  width: 0;
  height: 2px;
 background: var(--white); /* Línea blanca para resaltar sobre el rojo */
  transition: width .3s;
}

.nav-button:hover::after {
  width: 100%;
}

body {
  margin: 0;
}

@media (max-width: 600px) {
  .nav-logo { height: 35px; }
  .navbar-title { font-size: 1.2rem; }
}

.side-left { position: absolute; left: 10px; }
.side-right { position: absolute; right: 20px; }
</style>