// Estado de la aplicación
const state = {
    personajes: [],
    filtros: {
        nombre: '',
        elemento: '',
        rareza: null
    }
};

/**
 * Inicializa la aplicación al cargar la página
 */
function inicializarAplicacion() {
    cargarPersonajes();
    configurarEventListeners();
}

/**
 * Carga los datos de personajes desde el JSON
 */
function cargarPersonajes() {
    fetch('/data/gensupp.json')
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar datos');
            return response.json();
        })
        .then(data => {
            state.personajes = data.Personajes;
            mostrarPersonajes(state.personajes);
        })
        .catch(error => {
            console.error('Error al cargar los personajes:', error);
            mostrarError('No se pudieron cargar los personajes. Intente nuevamente.');
        });
}

/**
 * Configura todos los manejadores de eventos
 */
function configurarEventListeners() {
    // Filtros de texto y selección
    document.getElementById('buscador-nombre')?.addEventListener('input', buscarPorNombre);
    document.getElementById('filtro-elemento')?.addEventListener('change', filtrarPorElemento);
    
    // Botones de rareza
    const btnRareza5 = document.querySelector('button[onclick="filtrarPorRareza(5)"]');
    if (btnRareza5) {
        btnRareza5.onclick = null;
        btnRareza5.addEventListener('click', () => filtrarPorRareza(5));
    }
    
    const btnRareza4 = document.querySelector('button[onclick="filtrarPorRareza(4)"]');
    if (btnRareza4) {
        btnRareza4.onclick = null;
        btnRareza4.addEventListener('click', () => filtrarPorRareza(4));
    }
    
    // Botones de ordenamiento
    const btnRarezaDesc = document.querySelector('button[onclick="ordenarPorRareza(\'desc\')"]');
    if (btnRarezaDesc) {
        btnRarezaDesc.onclick = null;
        btnRarezaDesc.addEventListener('click', () => ordenarPorRareza('desc'));
    }
    
    const btnRarezaAsc = document.querySelector('button[onclick="ordenarPorRareza(\'asc\')"]');
    if (btnRarezaAsc) {
        btnRarezaAsc.onclick = null;
        btnRarezaAsc.addEventListener('click', () => ordenarPorRareza('asc'));
    }
    
    // Botón para resetear filtros
    const btnReset = document.querySelector('button[onclick="resetearFiltros()"]');
    if (btnReset) {
        btnReset.onclick = null;
        btnReset.addEventListener('click', resetearFiltros);
    }
}

/**
 * Muestra un mensaje de error en el contenedor de personajes
 * @param {string} mensaje - Texto de error a mostrar
 */
function mostrarError(mensaje) {
    const container = document.getElementById('personajes-container');
    if (container) {
        container.innerHTML = `<div class="error-mensaje">${mensaje}</div>`;
    }
}

/**
 * Aplica todos los filtros activos a los personajes
 */
function aplicarFiltros() {
    let resultado = [...state.personajes];
    
    // Filtrar por nombre
    if (state.filtros.nombre) {
        resultado = resultado.filter(p => 
            p.nombre.toLowerCase().includes(state.filtros.nombre.toLowerCase())
        );
    }
    
    // Filtrar por elemento
    if (state.filtros.elemento) {
        resultado = resultado.filter(p => p.elemento === state.filtros.elemento);
    }
    
    // Filtrar por rareza
    if (state.filtros.rareza !== null) {
        resultado = resultado.filter(p => p.rareza === state.filtros.rareza);
    }
    
    mostrarPersonajes(resultado);
}

/**
 * Muestra los personajes en el contenedor principal
 * @param {Array} listaPersonajes - Lista de personajes a mostrar
 */
function mostrarPersonajes(listaPersonajes) {
    const container = document.getElementById('personajes-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Mostrar mensaje si no hay resultados
    if (listaPersonajes.length === 0) {
        container.innerHTML = '<div class="no-resultados">No se encontraron personajes con esos criterios</div>';
        return;
    }
    
    // Crear y añadir elementos para cada personaje
    listaPersonajes.forEach(personaje => {
        const personajeElement = crearElementoPersonaje(personaje);
        container.appendChild(personajeElement);
    });
}

/**
 * Crea un elemento DOM para un personaje
 * @param {Object} personaje - Datos del personaje
 * @returns {HTMLElement} Elemento con la tarjeta del personaje
 */
function crearElementoPersonaje(personaje) {
    // Crear contenedor principal
    const personajeDiv = document.createElement('div');
    personajeDiv.className = 'personaje';
    
    // Añadir clases específicas por elemento
    if (personaje.elemento) {
        personajeDiv.classList.add(personaje.elemento.toLowerCase());
    }
    
    // Configurar eventos de clic
    configurarEventosDeClick(personajeDiv, personaje);
    
    // Generar contenido HTML
    personajeDiv.innerHTML = generarContenidoPersonaje(personaje);
    
    // Estilo de cursor para indicar que es clickeable
    personajeDiv.style.cursor = 'pointer';
    
    return personajeDiv;
}

/**
 * Configura eventos de clic para el elemento
 * @param {HTMLElement} elemento - Elemento DOM del personaje
 * @param {Object} personaje - Datos del personaje
 */
function configurarEventosDeClick(elemento, personaje) {
    // CAMBIO IMPORTANTE: Navegación a página dinámica usando ID
    elemento.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(`Navegando a personaje con ID: ${personaje.id}`);
        window.location.href = `/personaje.html?id=${personaje.id}`;
    });
    
    // Doble clic para añadir al equipo
    elemento.addEventListener('dblclick', () => {
        // Añadir clase para efecto visual
        elemento.classList.add('dblclick-effect');
        
        // Quitar la clase después de la animación
        setTimeout(() => {
            elemento.classList.remove('dblclick-effect');
        }, 400);
        
        // Intentar añadir al primer slot vacío
        if (typeof agregarPersonajeAlPrimerSlotVacio === 'function') {
            agregarPersonajeAlPrimerSlotVacio(personaje);
        }
    });
}

/**
 * Genera el HTML interior de la tarjeta de personaje
 * @param {Object} personaje - Datos del personaje
 * @returns {string} HTML para el interior de la tarjeta
 */
function generarContenidoPersonaje(personaje) {
    // Determinar rutas de imágenes
    const rarezaImagen = personaje.rareza === 4 ? '/img/rareza4.png' : 
                         personaje.rareza === 5 ? '/img/rareza5.png' : '';
    
    const elementoImagen = personaje.elemento ? 
        `/img/Elemento_${personaje.elemento.charAt(0).toUpperCase() + personaje.elemento.slice(1)}.webp` : '';
    
    // Construir el HTML
    return `
        ${elementoImagen ? `<img class="elemento-icono" src="${elementoImagen}" alt="Elemento ${personaje.elemento}">` : ''}
        <img class="imagen-personaje" src="${personaje.imagen}" alt="${personaje.nombre}">
        <h2>${personaje.nombre}</h2>
        <p>${personaje.descripcion || ''}</p>
        ${rarezaImagen ? `<img class="rareza-icono" src="${rarezaImagen}" alt="Rareza ${personaje.rareza}">` : ''}
    `;
}

/**
 * Filtra los personajes por rareza
 * @param {number} rareza - Valor de rareza a filtrar
 */
function filtrarPorRareza(rareza) {
    // Toggle: si hacemos clic en el mismo botón, desactivamos el filtro
    if (state.filtros.rareza === rareza) {
        state.filtros.rareza = null;
    } else {
        state.filtros.rareza = rareza;
    }
    
    aplicarFiltros();
    actualizarBotonesRareza();
}

/**
 * Filtra los personajes por elemento
 */
function filtrarPorElemento() {
    const elementoSeleccionado = document.getElementById('filtro-elemento').value;
    state.filtros.elemento = elementoSeleccionado;
    aplicarFiltros();
}

/**
 * Filtra los personajes por nombre según el texto ingresado
 */
function buscarPorNombre() {
    const textoBusqueda = document.getElementById('buscador-nombre').value;
    state.filtros.nombre = textoBusqueda;
    aplicarFiltros();
}

/**
 * Ordena los personajes filtrados por rareza
 * @param {string} orden - Dirección: 'asc' o 'desc'
 */
function ordenarPorRareza(orden) {
    // Primero obtenemos los personajes ya filtrados
    let resultado = [...state.personajes];
    
    if (state.filtros.nombre) {
        resultado = resultado.filter(p => 
            p.nombre.toLowerCase().includes(state.filtros.nombre.toLowerCase())
        );
    }
    
    if (state.filtros.elemento) {
        resultado = resultado.filter(p => p.elemento === state.filtros.elemento);
    }
    
    if (state.filtros.rareza !== null) {
        resultado = resultado.filter(p => p.rareza === state.filtros.rareza);
    }
    
    // Ordenamos según el parámetro
    resultado.sort((a, b) => orden === 'asc' ? a.rareza - b.rareza : b.rareza - a.rareza);
    
    mostrarPersonajes(resultado);
}

/**
 * Actualiza el estado visual de los botones de rareza
 */
function actualizarBotonesRareza() {
    const btnRareza4 = document.querySelector('button[onclick="filtrarPorRareza(4)"]');
    const btnRareza5 = document.querySelector('button[onclick="filtrarPorRareza(5)"]');
    
    if (btnRareza4) {
        if (state.filtros.rareza === 4) {
            btnRareza4.classList.add('activo');
        } else {
            btnRareza4.classList.remove('activo');
        }
    }
    
    if (btnRareza5) {
        if (state.filtros.rareza === 5) {
            btnRareza5.classList.add('activo');
        } else {
            btnRareza5.classList.remove('activo');
        }
    }
}

/**
 * Resetea todos los filtros aplicados
 */
function resetearFiltros() {
    // Limpiar inputs
    document.getElementById('buscador-nombre').value = '';
    document.getElementById('filtro-elemento').value = '';
    
    // Resetear estado de filtros
    state.filtros = {
        nombre: '',
        elemento: '',
        rareza: null
    };
    
    // Actualizar UI
    actualizarBotonesRareza();
    mostrarPersonajes(state.personajes);
}

// Exponer funciones para su uso desde HTML
window.filtrarPorRareza = filtrarPorRareza;
window.ordenarPorRareza = ordenarPorRareza;
window.filtrarPorElemento = filtrarPorElemento;
window.resetearFiltros = resetearFiltros;
window.buscarPorNombre = buscarPorNombre;

// Iniciar aplicación cuando el documento esté cargado
window.onload = inicializarAplicacion;