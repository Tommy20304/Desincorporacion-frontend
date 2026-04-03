//configuracion de rutas
import { createRouter, createWebHistory} from "vue-router";
import Home from "../paginas/Home.vue";
import IngresarExcel from "../paginas/ingresarExcel.vue";
import errores from "../paginas/errores.vue";
import NotificacionError from "../components/notificacionError.vue";
import NotificacionExito from "../components/notificacionExito.vue";
import BuscarDatos from "../paginas/buscarDatos.vue";
import registro from "../paginas/registro.vue";
import acceder from "../paginas/acceder.vue";
import exportar from "../paginas/exportar.vue";
import eliminar from "../paginas/eliminar.vue";
import actualizar from "../paginas/actualizar.vue";
import ingresaDatos from "../paginas/ingresaDatos.vue";
import actualizarManual from "../paginas/actualizarManual.vue";
import visualizarDatos from "../paginas/visualizarDatos.vue";
import nombresCampos from "../paginas/nombresCampos.vue";
import infoPlantillas from "../components/infoPlantillas.vue";
import IngresarPlanilla from "../paginas/ingresarPlanilla.vue";
import manipularDatosPersistentes from "../paginas/manipularDatosPersistentes.vue";
import crearClaveCaja from "../paginas/crearClaveCaja.vue";
import historialMasiva from "../paginas/historialMasiva.vue";
import gestionarUsuario from "../paginas/gestionarUsuario.vue";
import verClavesCajas from "../paginas/verClavesCajas.vue";
import buscarDeshabilitado from "../paginas/buscarDeshabilitado.vue";
import desincorporar from "../paginas/desincorporar.vue";
import eliminarPlantilla from "../paginas/eliminarPlantilla.vue";
import quitarDesincorporacion from "../paginas/quitarDesincorporacion.vue";
import actualizarConjutamente from "../paginas/actualizarConjutamente.vue";
import procesarArchivo from "../paginas/procesarArchivo.vue";

const router = createRouter({
    history: createWebHistory(), //esto sirver para indicar que las rutas se van a mostrar con diagonales
    routes: [{ //aqui se van a definir todas las rutas de la aplicacion 
        path: "/", //esta es la ruta como tal
        name: "Home", //el nombre de la ruta
        component: Home, //el componente que queremos que aparezca
        meta: { autenticacion: true }
    }, {
        path: "/ingresar-excel", 
        name: "ingresar_excel", 
        component: IngresarExcel,
        meta: { autenticacion: true }
    
    },/*{
        path: "/datos_formulario/:parametro", //la ruta de la pagina detalles tendra un parametro, en la cual se puede poner cualquier cosa 
        name: "detalles", 
        component: Detalles
    }*/{
        path: "/prueba",
        name: "prueba",
        component: NotificacionError
    },{
        path: "/prueba-exito",
        name: "exito",
        component: NotificacionExito
    },{
        path: "/errores/:parametro",
        name: "errores",
        component: errores,
        meta: { autenticacion: true }
    },{
        path: "/buscar-datos",
        name: "buscar",
        component: BuscarDatos,
        meta: { autenticacion: true }
    },{
        path: "/registro",
        name: "registro",
        component: registro,
        meta: { autenticacion: true }
    },{
        path: "/acceder",
        name: "acceder",
        component: acceder
    },{
        path: "/exportar-excel/:parametro",
        name: "exportar",
        component: exportar,
        meta: { autenticacion: true }
    },{
        path: "/eliminar",
        name: "eliminar",
        component: eliminar,
        meta: { autenticacion: true }
    },{
        path: "/actualizar",
        name: "actualizar",
        component: actualizar,
        meta: { autenticacion: true }
    },{
        path: "/ingresar-manualmente",
        name: "ingresar-manualmente",
        component: ingresaDatos,
        meta: { autenticacion: true }
    },{
        path: "/actualizar-manualmente/:parametro",
        name: "actualizar-manualmente",
        component: actualizarManual,
        meta: { autenticacion: true }
    },{
        path: "/ver-datos/:parametro",
        name: "ver-datos",
        component: visualizarDatos,
        meta: { autenticacion: true }
    },{
        path: "/nombres-campos",
        name: "nombre-campos",
        component: nombresCampos,
        meta: { autenticacion: true }
    },{
        path: "/ingresar-planilla",
        name: "ingresar-planilla",
        component: IngresarPlanilla,
        meta: { autenticacion: true }
    },{
        path: "/manipular-datos",
        name: "manipular-datos",
        component: manipularDatosPersistentes,
        meta: { autenticacion: true }
    },{
        path: "/clave-caja",
        name: "clave-caja",
        component: crearClaveCaja,
        meta: { autenticacion: true }
    },{
        path: "/historial-claves",
        name: "historial-claves",
        component: historialMasiva,
        meta: { autenticacion: true }
    },{
        path: "/gestionar-usuario",
        name: "gestionar-usuario",
        component: gestionarUsuario,
        meta: { autenticacion: true }
    },{
        path: "/ver-claves",
        name: "ver-claves",
        component: verClavesCajas,
        meta: { autenticacion: true }
    },{
        path: "/buscar-deshabilitado",
        name: "buscar-deshabilitado",
        component: buscarDeshabilitado,
        meta: { autenticacion: true }
    },{
        path: "/desincorporar",
        name: "desincorporar",
        component: desincorporar,
        meta: { autenticacion: true }
    },{
        path: "/eliminar-plantilla",
        name: "eliminar-plantilla",
        component: eliminarPlantilla,
        meta: { autenticacion: true }
    },{
        path: "/quitar-desincorporacion",
        name: "quitar-desincorporacion",
        component: quitarDesincorporacion,
        meta: { autenticacion: true }
    },{
        path: "/actualizar-conjunto/:parametro",
        name: "actualizar-conjunto",
        component: actualizarConjutamente,
        meta: { autenticacion: true }
    },{
        path: "/procesar",
        name: "procesar-archivo",
        component: procesarArchivo,
        meta: { autenticacion: true }
    }]
})
//Este código se ejecutará cada vez que el usuario intente cambiar de página. lo que hace es que verifica si tiene el token en el store
router.beforeEach((to, from, next) => {
    //el cargo del usuario
    let cargo = null;

    if(localStorage.getItem('datosUsuario'))
        cargo = JSON.parse(localStorage.getItem('datosUsuario')).cargo;
    
    //las rutas que solo son permitidas para administradores
    const NombreRutas = ["gestionar-usuario", "manipular-datos", "ingresar-planilla", "actualizar-manualmente",
        "actualizar", "eliminar", "registro", "desincorporar", "quitar-desincorporacion", "actualizar-conjunto"
    ];


  // 1. Revisamos si el navegador tiene el token guardado
  const isAuthenticated = !!localStorage.getItem('token');

  // 2. Si la ruta requiere autenticación y el usuario NO está autenticado
  if (to.matched.some(respuesta => respuesta.meta.autenticacion) && !isAuthenticated) {
    // Lo redirigimos al login
    return next('/acceder');
  } 
  // 3. Si el usuario ya está logueado e intenta ir al login, lo mandamos al home
  else if (to.name === '/acceder' && isAuthenticated) {
    return next('/');
  }
  //si el usuario intenta acceder a una ruta solo para administradores, se pone una alerta
  else if(NombreRutas.includes(to.name) && cargo != 'administrador'){
    alert("Esa ruta solo esta disponible para administradores");
    return;
  }
  // 4. En cualquier otro caso, dejamos que pase
  else {
    next();
  }

});

export default router //se exporta el router