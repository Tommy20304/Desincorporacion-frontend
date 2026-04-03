import readline from 'readline'

function crearJerarquia(datos){
    let datosId = {};
    let datosRaiz = []
    datos.forEach(row => {
        row['children'] = []

        if(!row.parent){
            datosRaiz.push(row);
            return;
        }
         
        datosId[row.id] = row;
        
    });

    return datosRaiz.map(row => {
        Object.values(datosId).forEach(item => {
          if(datosId[item.parent]){
            datosId[item.parent].children.push(item);
          }
        })

        let rowChildren = Object.values(datosId).filter(element => element.parent === row.id);

        if(rowChildren){
            row['children'] = rowChildren;
        }

        return row;
    })
}

const entradas = [
  { id: 1, name: "Sistemas", parent: null },
  { id: 2, name: "Contabilidad", parent: null },
  { id: 3, name: "Desarrollo", parent: 1 },
  { id: 4, name: "Soporte", parent: 1 },
  { id: 5, name: "Frontend", parent: 3 },
  { id: 6, name: "Backend", parent: 3 },
  { id: 7, name: "Auditoría", parent: 2 }
];

function crearJerarqui(datos) {
  const mapeo = {};
  const raices = [];

  // 1. Primero, creamos un mapa con todos los nodos y su propiedad children.
  // Esto asegura que no importe el orden en el que vengan en el array.
  datos.forEach(item => {
    mapeo[item.id] = { ...item, children: [] };
  });

  // 2. Segunda pasada: conectamos hijos con padres usando las referencias.
  datos.forEach(item => {
    const nodoConHijos = mapeo[item.id];
    
    if (item.parent === null) {
      // Si no tiene padre, va directo a la raíz
      console.log(nodoConHijos);
      raices.push(nodoConHijos);
    } else {
      // Si tiene padre, lo buscamos en el mapa y lo empujamos a SUS children
      // Gracias a la referencia de memoria, esto construye el árbol automáticamente
      if (mapeo[item.parent]) {
        mapeo[item.parent].children.push(nodoConHijos);
      }
    }
  });

  return raices;
}

console.log(crearJerarquia(entradas));
/*
const rl = readline.createInterface({
    input: process.stdin,
  output: process.stdout
})

rl.question('Introduzca el texto: ', (respuesta) => {
  console.log(analizarTexto(respuesta));
  rl.close(); // Cerrar la interfaz
});*/