<template>
  <div class="page-container">
    <div class="form-card">
      <header class="form-header">
        <div class="header-actions">
    <button 
      type="button" 
      class="tab-btn" 
      :class="{ 'active': gestionarPlantilla.modo.value === 'guardar' }"
    >
      <span class="icon">💾</span> Guardar Plantilla
    </button>
    
    <button 
      type="button" 
      class="tab-btn delete" 
      :class="{ 'active': gestionarPlantilla.modo.value === 'eliminar' }"
    >
    <router-link class="tab-btn" to="/eliminar-plantilla">
      <span class="icon">🗑️</span> Eliminar Plantilla
      </router-link>
    </button>
   
  </div>
      </header>

      <form @submit.prevent="" class="equipment-form">
        <div class="grid-layout">
          
          <div class="form-group full-width">
            <label>Descripcion</label>
            <textarea v-model="gestionarPlantilla.equipo.descripcion" rows="2"></textarea>
          </div>

          <div class="form-group">
            <label>Limite Inicio</label>
            <input type="text" placeholder="Inico" v-model.trim="gestionarPlantilla.equipo.limiteInicio"/>
          </div>

          <div class="form-group">
            <label>Limite Final</label>
            <input type="text" placeholder="Final" v-model.trim="gestionarPlantilla.equipo.limiteFinal"/>
          </div>

          <div class="full-width components-section">
            <h3 class="section-title">Archivos Relacionados</h3>
            <div class="components-grid">
                <div class="file-upload-wrapper" :class="{ 'has-file': gestionarPlantilla.equipo.archivoExcel }">
                    <label class="file-label">
                        <div class="file-icon">📊</div>
                        <div class="file-info">
                            <span class="file-title">Reporte Excel</span>
                            <span class="file-name">
                              {{ gestionarPlantilla.equipo.archivoExcel ? gestionarPlantilla.equipo.archivoExcel.name : 'Seleccionar archivo .xlsx' }}
                            </span>
                        </div>
                        <input type="file" required @change="gestionarPlantilla.handleFileUpload($event, 'archivoExcel')" 
                               accept=".xlsx" :ref="el => gestionarPlantilla.fileInput.value = el" hidden>
                        <div class="file-boton">
                          <button type="button" class="remove-btn" @click.stop="gestionarPlantilla.removeFile('excel')">✕</button>
                        </div>
                    </label>
                </div>

                <div class="file-upload-wrapper" :class="{ 'has-file': gestionarPlantilla.equipo.archivoImagen }">
                    <label class="file-label">
                        <div class="file-icon">🖼️</div>
                        <div class="file-info">
                            <span class="file-title">Imagen/Evidencia</span>
                            <span class="file-name">
                              {{ gestionarPlantilla.equipo.archivoImagen ? gestionarPlantilla.equipo.archivoImagen.name : 'Seleccionar imagen' }}
                            </span>
                        </div>
                        <input type="file" @change="gestionarPlantilla.handleFileUpload($event, 'archivoImagen')" 
                               accept="image/*" hidden required :ref="el => gestionarPlantilla.fileInputImagen.value = el">
                         <div class="file-boton">
                           <button type="button" class="remove-btn" @click.stop="gestionarPlantilla.removeFile('imagen')">✕</button>
                         </div>
                    </label>
                </div>
            </div>
          </div>

          <div v-if="gestionarPlantilla.equipo.columnasOriginales" class="full-width components-section scroll" >
            <h3 class="section-title">Define el valor de las columnas</h3>
            <div class="components-grid">
                <div class="grupo-columnas" v-for="columna in gestionarPlantilla.equipo.columnasOriginales" :key="columna">
                    <label>{{ columna }}</label>
                    <select v-model="gestionarPlantilla.equipo.columnasDisponibles[columna]"> 
                        <option value="">Seleccione un Valor</option>
                        <option v-for="valor of gestionarPlantilla.columnasDisponibles" :key="valor" :value="valor">
                          {{ valor }}
                        </option>
                    </select>
                </div>
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="gestionarPlantilla.enviando.value" @click="gestionarPlantilla.enviar">
          {{ gestionarPlantilla.enviando.value ? 'Guardando...' : 'Guardar Planilla' }}
        </button>
      </form>
    </div>
  </div>

  <notificacionAdv 
      :activar="gestionarPlantilla.control.activarAdvertencia" 
      :columnas="gestionarPlantilla.control.columnasAdvertencia" 
      @cerrar="gestionarPlantilla.control.activarAdvertencia = false" 
      :texto="gestionarPlantilla.control.texto"
  />
  <notificacionError 
      :activar="gestionarPlantilla.control.activarError" 
      @cerrar="gestionarPlantilla.control.activarError = false" 
      :texto="gestionarPlantilla.control.texto"
  />
  <notificacionExito 
      :activar="gestionarPlantilla.control.activarExito" 
      :texto="gestionarPlantilla.control.texto"  
      @cerrar="gestionarPlantilla.control.activarExito = false"
  />
</template>

<script setup>
import { reactive, ref, computed, onMounted, resolveDirective} from 'vue';
import { api } from '../stores/apis';
import { controlNotificaciones } from '../stores/clase.js';
import notificacionAdv from '../components/notificacionAdv.vue';
import notificacionError from '../components/notificacionError.vue';
import notificacionExito from '../components/notificacionExito.vue';

class EquipoService {
  constructor() {
    this.store = api();
    this.control = controlNotificaciones().manejoNotificacion;
    
    // Estado reactivo
    this.enviando = ref(false);
    this.fileInput = ref(null);
    this.fileInputImagen = ref(null);
    
    this.equipo = reactive({
      archivoExcel: null,
      archivoImagen: null,
      descripcion: '',
      columnasOriginales: null,
      columnasDisponibles: {},
      limiteInicio: null,
      limiteFinal: null,
      itemMaximo: null
    });

    this.columnasDisponibles = [
      'categoria', 'marca', 'modelo', 'serial', 'etiqueta', 'mac_addre', 'usuario',
      'condicion', 'ubicacion actual', 'notas', 'fecha registro',
      'componentes buenos', 'componentes malos'
    ];
    this.modo = ref('guardar'); // 'guardar' o 'eliminar'
  }

  async retornarColumnas(file) {
    const formData = new FormData();
    formData.append("fileExcel", file);
    formData.append("inicio", this.equipo.limiteInicio);
    
    await this.store.mandarArchivo(formData, "plantilla/retornar-columnas");
    
    if (!this.store.respuesta.mensaje) {
      this.control.activarNotificacionError("no hay columnas disponibles. Verifique el limite inicial");
    }
    
    this.equipo.columnasOriginales = this.store.respuesta.columnas;
    
    // se crea el objeto de las columnas disponibles
    for (let valor of this.equipo.columnasOriginales) {
      this.equipo.columnasDisponibles[valor] = "";
    }
  }

  //se accede al archivo
  handleFileUpload = (event, tipo) => {
    const file = event.target.files[0];
    if (file) {
      this.equipo[tipo] = file;
      if (tipo == "archivoExcel") this.retornarColumnas(file);
    }
  };

  // elimina el archivo seleccionado
  removeFile = (tipo) => {
    if (tipo == 'excel') {
      this.equipo.archivoExcel = null;
      this.equipo.columnasOriginales = null;
      this.equipo.columnasDisponibles = {};
      if (this.fileInput.value) this.fileInput.value.value = '';
    } 
    else if (tipo == 'imagen') {
      this.equipo.archivoImagen = null;
      if (this.fileInputImagen.value) this.fileInputImagen.value.value = '';
    }
  };

  //se determina el item maximo
  determinarItemMaximo(){
    if(this.equipo.limiteFinal){
      return (this.equipo.limiteInicio) ? Number(this.equipo.limiteFinal) - Number(this.equipo.limiteInicio) : Number(this.equipo.limiteFinal) - 2;
    }
    return null;
  }

  // se arregla el objeto para ser enviado
  arreglarObjeto() {
    let copia = { ...this.equipo }; 
    let nombreImagen = this.equipo.archivoImagen.name;
    let nombreExcel = this.equipo.archivoExcel.name;
    
    copia['nombreExcel'] = nombreExcel;
    copia["nombreImagen"] = nombreImagen;
    copia.itemMaximo = this.determinarItemMaximo();
    return copia;
  }

  // se verifica que esos archivos ya existen 
  async verificarArchivos() {

    await this.store.mandarJson(
      { nombreExcel: this.equipo.archivoExcel.name, nombreImagen: this.equipo.archivoImagen.name },
      "plantilla/verificar-archivo"
    );

    if (this.store.respuesta.repetido) {
      if (this.store.respuesta.repetido == "excel") {
        this.control.activarNotificacionError("el nombre del archivo excel ya existe");
      } else if (this.store.respuesta.repetido == "imagen") {
        this.control.activarNotificacionError("el nombre de la imagen ya existe");
      }
      return true;
    }
    return false;
  }

  async verificarColumnaRepetidas() {
    // se verifica que los valores de las columnas no se repitan
    let datos = [];
    for (let i of Object.values(this.equipo.columnasDisponibles)) {
      if (datos.includes(i)) return true;
      if (i) datos.push(i);
    }
    return false;
  }

  // se determina si los limites estan bien colocados
  verificarLimites() {

    // si los limites estan nulos, no se manda una excepcion
    if (!this.equipo.limiteInicio && !this.equipo.limiteFinal) return false;

    //se revisa si los limites no son numericos, siempre y cuando no sean nulos
    const revision = [this.equipo.limiteInicio, this.equipo.limiteFinal].find(item => !/^\d+$/.test(item) && item);

    //si los limites no son numericos
    if (revision) {
      this.control.activarNotificacionError("Los limites deben ser numericos");
      return true;
    }

    //si el limite de inicio es mayor al limite final
    if(this.equipo.limiteFinal){
      const InicioMayor = (this.equipo.limiteInicio) ? Number(this.equipo.limiteInicio) >= Number(this.equipo.limiteFinal) : 2 >= Number(this.equipo.limiteFinal);
      if(InicioMayor){
        this.control.activarNotificacionError("El limite de inicio debe ser menor al limite final");
        return true;
      }
    }

    return false;
  }

  //se guarda los archivos
  async guardarArchivo() {

    //se manda el archivo excel
    const formData = new FormData();
    formData.append("fileExcel", this.equipo.archivoExcel);
    await this.store.mandarArchivo(formData, "plantilla/guardar-archivo");

    if (!this.store.respuesta.mensaje) {
      this.control.activarNotificacionError("No se pudo enviar los archivos");
      return false;
    }

    //se manda el archivo de imagen
    const formDataImagen = new FormData();
    formDataImagen.append('imagen', this.equipo.archivoImagen);
    await this.store.mandarArchivo(formDataImagen, "plantilla/guardar-imagen");

    if (!this.store.respuesta.mensaje) {
      this.control.activarNotificacionError("No se pudo enviar los archivos");
      return false;
    }
    return true;
  }

  async enviar() {
    if (!this.equipo.archivoExcel) {
      return this.control.activarNotificacionError("mande un archivo excel");
    } 
    else if (!this.equipo.archivoImagen) {
      return this.control.activarNotificacionError("mande una imagen");
    }

    // determina si se determino el valor de por lo menos una columna
    let revision = Object.values(this.equipo.columnasDisponibles).find(element => element); 
    if (!revision) {
      return this.control.activarNotificacionError("Asigne el valor a una columna");
    }

    if (await this.verificarArchivos()) return;

    if (await this.verificarColumnaRepetidas()) {
      return this.control.activarNotificacionError("existen valores repetidos en la columnas");
    }

    if (this.verificarLimites()) return;
    
    //se guarda los datos de la plantilla
    await this.store.mandarJson({ planilla: this.arreglarObjeto() }, "plantilla/guardar-plantilla");

    if (!this.store.respuesta.mensaje) {
      return this.control.activarNotificacionError("hubo errores en el guardado");
    }

    //se guarda el archivo
    if (await this.guardarArchivo()) {
      this.control.activarNotificacionExito("Se guardo la plantilla");
      //se reinicia todo
      this.removeFile("excel");
      this.removeFile("imagen");
      this.equipo = reactive({
        archivoExcel: null,
        archivoImagen: null,
        descripcion: '',
        columnasOriginales: null,
        columnasDisponibles: {},
        limiteInicio: null,
        limiteFinal: null,
        itemMaximo: null
      });
    }
  }
}

const gestionarPlantilla = new EquipoService;

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
  border: 2px solid #2563eb;
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%; /* Asegura que el header use todo el ancho del card */
}

.header-actions {
 display: flex;
  width: 100%; /* Ocupa el 100% del contenedor padre */
  gap: 0; /* O puedes dejar un pequeño gap si prefieres separación */
  border-radius: 12px;
  overflow: hidden; /* Para que los bordes redondeados se apliquen a los botones de las esquinas */
  border: 1px solid #e2e8f0;;
}

.tab-btn {
  flex: 1; /* ESTO HACE QUE OCUPEN TODO EL ESPACIO DISPONIBLE POR IGUAL */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  font-weight: 600;
  border: none; /* Quitamos bordes individuales para usar el del contenedor */
  background-color: #f8fafc;
  color: #64748b;
  transition: all 0.2s ease;
  font-size: 1rem;
  text-decoration: none;
}

/* Línea divisoria entre botones */
.tab-btn:first-child {
  border-right: 1px solid #e2e8f0;
}

.tab-btn.active {
  background-color: #4f46e5; /* Color primario */
  color: white;
  border-color: #4f46e5;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

.tab-btn.delete.active {
  background-color: #ef4444; /* Rojo para eliminar */
  border-color: #ef4444;
}

.tab-btn:hover:not(.active) {
  background-color: #f9fafb;
  border-color: #ccc;
}

.tab-btn:hover{
  scale: calc(1.08);
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

.grupo-columnas{
    display: flex; flex-direction: column;
}

.grupo-columnas label{
    font-size: 13px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
  text-transform: uppercase;
}



.scroll{
    max-height: 193px;
    overflow-y: auto;
}
select{
    outline: none;
    font-size: 13px;
    transition: all 0.2s ease;
}
select:focus{
border-color: #2563eb;
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
  border-color: #2563eb;
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
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
  background: #2563eb;
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

.submit-btn:hover { background: #1d4ed8; }
.submit-btn:active { transform: scale(0.98); }

@media (max-width: 600px) {
  .grid-layout, .components-grid { grid-template-columns: 1fr; }
  .full-width { grid-column: span 1; }
}

/* Contenedores de Archivos */
.file-upload-wrapper {
  grid-column: span 1; /* Ajusta según prefieras el ancho */
  background: white;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  width: 320px;
  overflow: hidden;
}

.file-upload-wrapper:hover {
  border-color: #2563eb;
  background: #f0f7ff;
  transform: translateY(-2px);
}

.file-label {
  display: flex;
  align-items: center;
  padding: 15px;
  cursor: pointer;
  gap: 12px;
}

.file-icon {
  font-size: 1.5rem;
  background: #f1f5f9;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.file-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.file-title {
  font-weight: 700;
  font-size: 0.8rem;
  color: #1e293b;
}

.file-name {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

/* Animación cuando se selecciona un archivo */
.has-file {
  border: 2px solid #2563eb;
  background: #eff6ff;
  animation: bounceIn 0.5s ease;
}

.has-file .file-icon {
  background: #2563eb;
  transform: scale(1.1);
  animation: rotateIcon 0.5s ease;
}

.has-file .file-title {
  color: #2563eb;
}

.remove-btn {
  background: none;
  border: none;
  color: #B0BEC5;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #ef5350;
}

@keyframes bounceIn {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes rotateIcon {
  from { transform: rotate(-20deg) scale(1.2); }
  to { transform: rotate(0) scale(1.1); }
}

/* Ajuste responsivo para los inputs de archivos */
@media (max-width: 768px) {
  .components-grid {
    grid-template-columns: 1fr;
  }
}
</style>