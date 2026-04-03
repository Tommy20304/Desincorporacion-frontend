<template>
  <barraNavegacion></barraNavegacion>
  <div class="page-container">
    <div class="form-card">
      <header class="form-header">
        <h2>Ingresar Datos</h2>
        <p>Ingreso de datos por desincorporar</p>
      </header>

      <form @submit.prevent="gestion.enviarDatos()" class="equipment-form">
        <div class="grid-layout">
          
          <div class="form-group relative">
            <label>Categoría</label>
            <input 
              v-model="gestionOpciones.seleccionados.categoria" 
              @focus="gestionOpciones.showSug.categoria = true"
              @blur="gestionOpciones.close('categoria')"
              placeholder="Escriba categoría..." 
              required 
            />
            <ul v-if="gestionOpciones.showSug.categoria && gestionOpciones.filteredCats.length" class="custom-datalist">
              <li v-for="cat in gestionOpciones.filteredCats" :key="cat" @mousedown="gestionOpciones.seleccionar('categoria', cat)">
                {{ cat }}
              </li>
            </ul>
          </div>

          <div class="form-group relative">
            <label>Marca</label>
            <input 
              v-model="gestionOpciones.seleccionados.marca" 
              @focus="gestionOpciones.showSug.marca = true"
              @blur="gestionOpciones.close('marca')"
              placeholder="Ej: Dell, Lenovo..." 
            />
            <ul v-if="gestionOpciones.showSug.marca && gestionOpciones.filteredMarcas.length" class="custom-datalist">
              <li v-for="m in gestionOpciones.filteredMarcas" :key="m" @mousedown="gestionOpciones.seleccionar('marca', m)">
                {{ m }}
              </li>
            </ul>
          </div>

          <div class="form-group relative">
            <label>Modelo</label>
            <input 
              v-model="gestionOpciones.seleccionados.modelo" 
              @focus="gestionOpciones.showSug.modelo = true"
              @blur="gestionOpciones.close('modelo')"
              placeholder="Ej: E20, 2034-01..." 
            />
            <ul v-if="gestionOpciones.showSug.modelo && gestionOpciones.modelosFiltrados.length && gestionOpciones.seleccionados.modelo.length" class="custom-datalist">
              <li v-for="mo in gestionOpciones.modelosFiltrados" :key="mo" @mousedown="gestionOpciones.seleccionar('modelo', mo)">
                {{ mo }}
              </li>
            </ul>
          </div>

          <div class="form-group"> 
            <label>Número de Serial</label>
            <input type="text" v-model.trim="gestion.equipo.serial" placeholder="N/S: ABC12345"/>
          </div>

          <div class="form-group">
            <label>Dirección MAC</label>
            <input type="text" v-model.trim="gestion.equipo.mac_addre" placeholder="Ej: 00-11-22-33-44-55"/>
          </div>

          <div class="form-group">
            <label>Etiqueta</label>
            <input type="text" v-model.trim="gestion.equipo.etiqueta" placeholder="etiqueta" />
          </div>

          <div class="form-group">
            <label>Ubicación</label>
             <select v-model="gestion.equipo.ubicacion"> 
                <option value="">Seleccione la Ubicación</option>
                <option v-for="object of gestion.datosServidor.ubicaciones.rows" :key="Object.values(object)[0]" :value="Object.values(object)[0]">
                  {{ Object.values(object)[1] }}
                </option>
              </select>
          </div>

          <div class="full-width components-section">
            <h3 class="section-title">Estado de Componentes</h3>
            <div class="components-grid">
              <div class="form-group">
                <label class="label-success">Buenos {{ gestion.equipo.bueno.length }}</label>
                <select v-model="gestion.equipo.bueno" multiple> 
                  <option v-for="object of gestion.datosServidor.componente" :key="Object.values(object)[0]" :value="object">
                    {{ object }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="label-danger">Malos {{ gestion.equipo.malo.length }}</label>
                <select v-model="gestion.equipo.malo" multiple> 
                  <option v-for="object of gestion.datosServidor.componente" :key="Object.values(object)[0]" :value="object">
                    {{ object }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group full-width">
            <label>Notas</label>
            <textarea v-model="gestion.equipo.notas" rows="2"></textarea>
          </div>

        </div>

        <button type="submit" class="submit-btn" :disabled="gestion.enviando">
          {{ gestion.enviando ? 'Guardando...' : 'Ingresar Datos' }}
        </button>
      </form>
    </div>
  </div>

  <notificacionAdv 
      :activar="gestion.control.activarAdvertencia" 
      :columnas="gestion.control.columnasAdvertencia" 
      @cerrar="gestion.control.activarAdvertencia = false" 
      :texto="gestion.control.texto"
    />
   <notificacionError 
      :activar="gestion.control.activarError" 
      @cerrar="gestion.control.activarError = false" 
      :texto="gestion.control.texto"
    />
    <notificacionExito 
      :activar="gestion.control.activarExito" 
      :texto="gestion.control.texto"  
      @cerrar="gestion.control.activarExito = false"
    />

    <notificacionIngresar 
      :activar="gestion.control.activarIngresar"  
      :datos="gestion.control.datosIngresar" 
      @cerrar="gestion.control.activarIngresar = false;"
      @respuesta="gestion.respuesta" 
    />
</template>

<script setup>
import {  onMounted, ref, watch} from 'vue';
import notificacionAdv from '../components/notificacionAdv.vue';
import notificacionError from '../components/notificacionError.vue';
import barraNavegacion from '../components/barraNavegacion.vue';
import notificacionExito from '../components/notificacionExito.vue';
import notificacionIngresar from '../components/notificacionIngresar.vue';
import { clasesManuales } from '../stores/clasesManuales';
import { opciones } from '../stores/opcionesCatalogo';

const gestion = clasesManuales().manualmente;
const gestionOpciones = opciones().manejoOpciones;

onMounted(async () => {
    await gestion.store.leer('buscar/bloque-busqueda');
    gestion.datosServidor = {...gestion.store.respuesta.datos};
    gestionOpciones.datosServidor = {...gestion.store.respuesta.datos};
    
})

//si se selecciona una opcion, automaticamente se añade el valor a gestion.equipo
watch(gestionOpciones.seleccionados, () => {

  gestion.equipo.categoria = gestionOpciones.seleccionados.categoria.trim().toUpperCase();

  gestion.equipo.marca = gestionOpciones.seleccionados.marca.trim().toUpperCase();

  gestion.equipo.modelo = gestionOpciones.seleccionados.modelo.trim().toUpperCase();
});

</script>

<style scoped>
/* Estilos anteriores se mantienen, agregamos los nuevos: */
.relative { position: relative; }

.custom-datalist {
  position: absolute;
  top: 100%; /* Justo debajo del input */
  left: 0;
  width: 100%; /* Mismo tamaño que el input */
  background: white;
  border: 2px solid #f44336;
  border-top: none;
  border-radius: 0 0 8px 8px;
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 10;
  max-height: 150px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.custom-datalist li {
  padding: 10px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
}

.custom-datalist li:hover {
  background-color: #eff6ff;
  color: #2563eb;
}

.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  font-family: 'Inter', system-ui, sans-serif;
  padding: 40px 20px;
}

.form-card {
  background: white;
  width: 100%;
  max-width: 800px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  background: #cd1c29;
  color: white;
  padding: 40px;
  text-align: left;
}

.form-header h2 { margin: 0; font-size: 1.8rem; }
.form-header p { margin: 5px 0 0; opacity: 0.9; }

.equipment-form { padding: 40px; }

.grid-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.full-width { grid-column: span 2; }

.form-group { display: flex; flex-direction: column; }

.form-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
  text-transform: uppercase;
}

select{
    outline: none;
    transition: all 0.2s ease;
}
select:focus{
border-color: #cd1c29;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

input, select, textarea {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

input:focus, textarea:focus{
  outline: none;
  border-color: #f44336;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

/* Estilos Componentes */
.components-section {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.section-title {
  font-size: 1rem;
  color: #1e293b;
  margin-bottom: 15px;
  margin-top: 0;
}

.components-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.components-grid .form-group{
  width: 220px;
}

.label-success { color: #059669 !important; }
.label-danger { color: #dc2626 !important; }
.label-warning { color: #d97706 !important; }

.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 5px;
}

.submit-btn {
  width: 100%;
  margin-top: 30px;
  padding: 16px;
  background: #cd1c29;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
}

/* Radio Buttons */
.radio-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  background: #f9fafb;
  padding: 12px;
  border-radius: 6px;
}

.radio-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  cursor: pointer;
}

.radio-label input {
  margin-right: 8px;
  cursor: pointer;
}

.submit-btn:hover { background: #ed1c29; }
.submit-btn:active { transform: scale(0.98); }

@media (max-width: 600px) {
  .grid-layout, .components-grid { grid-template-columns: 1fr; }
  .full-width { grid-column: span 1; }
}
</style>