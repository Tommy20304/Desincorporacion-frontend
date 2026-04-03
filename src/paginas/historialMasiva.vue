<template>
  <div class="app-viewport">
    <div class="main-card">
      <header class="main-header">
        <div class="title-section">
          <div class="brand-dot"></div>
          <div>
            <h1>Centro de Actividad</h1>
            <p>Historial de Claves Excel</p>
          </div>
        </div>

        <div class="controls">
          <div class="select-wrapper">
            <select v-model="sortOrder" class="modern-select">
              <option value="desc">Más reciente</option>
              <option value="asc">Más antiguo</option>
            </select>
          </div>
        </div>
      </header>

      <div class="scroll-area">
        <div v-if="fechas.length" class="history-content">
          <div v-for="(valores, date) in groupedHistory" :key="date" class="date-group">
            <div class="date-sticky-header">
              <span class="calendar-icon">📅</span>
              {{ date }}
            </div>

            <TransitionGroup name="list-anim">
              <div 
                class="history-card-item"
                v-for="fila in valores"
              >
                <div class="card-info">
                  <div class="site-avatar">
                    ⚡
                  </div>
                  <div class="site-texts">
                    <span class="site-title">{{ fila.clave_masiva }}</span>
                  </div>
                </div>
                <div class="card-meta">
                  <span class="time-badge">{{ formatTime (fila.fecha_registro) }}</span>
                </div>
              </div>
            </TransitionGroup>
          </div>

          <div v-if="fechas.length === 0" class="empty-state">
            No se encontraron registros de navegación.
          </div>
        </div>
      </div>

      <footer class="main-footer">
        <span>{{ fechas.length }} registros totales</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted} from 'vue';
import { api } from '../stores/apis';

//constantes fundamentales
const fechas = ref([]);
const store = api();
const datosUsuario = JSON.parse(localStorage.getItem('datosUsuario'))

//se accede a los datos del servidor
onMounted(async () => {
  await store.mandarJson({cedula: datosUsuario.cedula}, "usuario/ver-historial");
  if(store.respuesta.mensaje) fechas.value = store.respuesta.datos;
})

//el orden de como aparecen las claves
const sortOrder = ref('desc');

//funciones para formatear la fecha y la hora
const formatDateFull = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });
};

const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

// Lógica para agrupar por fecha y ordenar
const groupedHistory = computed(() => {
  
  //ordena las fechas de ascendente o descendente
  const sorted = [...fechas.value].sort((a, b) => {
    const diff = new Date(a.fecha_registro) - new Date(b.fecha_registro);
    return sortOrder.value === 'desc' ? -diff : diff;
  });

  const groups = {};
  //los transforma en un objeto donde las fechas son las claves y las claves con los valores
  sorted.forEach(entry => {
    const dateLabel = formatDateFull(entry.fecha_registro);
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(entry);
  });
  return groups;
});
</script>

<style scoped>
/* Variables de diseño profesional */
:host {
  --primary: #2563eb;
  --bg-app: #f8fafc;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
}

.app-viewport {
  min-height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.main-card {
  width: 100%;
  max-width: 700px;
  height: 650px; /* Altura fija para forzar el scroll */
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.main-header {
  padding: 24px 30px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-dot {
  width: 12px;
  height: 12px;
  background: #2563eb;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
}

.main-header h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.main-header p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 2px 0 0;
}

/* Scroll Area */
.scroll-area {
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
  padding: 0 30px;
  /* Personalización de la barra de scroll */
}

.scroll-area::-webkit-scrollbar {
  width: 6px;
}
.scroll-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

/* Date Groups & Sticky Headers */
.date-group {
  margin-bottom: 25px;
}

.date-sticky-header {
  position: sticky;
  top: 0;
  background: white;
  padding: 20px 0 10px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #2563eb;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* List Items */
.history-card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.history-card-item:hover {
  padding-left: 8px;
}

.card-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.site-avatar {
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
}

.site-texts {
  display: flex;
  flex-direction: column;
}

.site-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
}

.site-link {
  font-size: 0.8rem;
  color: #94a3b8;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-badge {
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* Select Moderno */
.modern-select {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #475569;
  background: #fff;
  cursor: pointer;
  outline: none;
}

.modern-select:focus {
  border-color: #2563eb;
}

/* Footer */
.main-footer {
  padding: 15px 30px;
  background: #f8fafc;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.clear-btn {
  background: transparent;
  border: 1px solid #fca5a5;
  color: #ef4444;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #fef2f2;
}

/* Animaciones */
.list-anim-move {
  transition: transform 0.4s ease;
}
</style>