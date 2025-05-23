// models/store.js - Estado global de la aplicación

// Estado de la aplicación
let state = {
    // Almacena los personajes disponibles para el equipo
    personajes: [],
    
    // Almacena los filtros seleccionados para la búsqueda de personajes
    filtrosActuales: {
        nombre: '',
        elemento: '',
        rareza: null
    },
    
    // Almacena el equipo actual con 4 slots para personajes
    equipoActual: {
        slot1: null,
        slot2: null,
        slot3: null,
        slot4: null
    },
    
    // Estado de la UI
    ui: {
        dragActive: false,
        loadingState: false,
        mensajeActual: null
    }
};

// Getters - Funciones para acceder al estado
export function getPersonajes() {
    return state.personajes;
}

export function getFiltros() {
    return { ...state.filtrosActuales };
}

export function getEquipoActual() {
    return { ...state.equipoActual };
}

export function getPersonajeEnSlot(slotNum) {
    return state.equipoActual[`slot${slotNum}`];
}

export function getUIState() {
    return { ...state.ui };
}

// Setters - Funciones para modificar el estado
export function setPersonajes(personajesNuevos) {
    state.personajes = personajesNuevos;
}

export function setFiltro(tipo, valor) {
    state.filtrosActuales[tipo] = valor;
}

export function resetFiltros() {
    state.filtrosActuales = {
        nombre: '',
        elemento: '',
        rareza: null
    };
}

export function setPersonajeEnSlot(slotNum, personaje) {
    state.equipoActual[`slot${slotNum}`] = personaje;
}

export function removePersonajeDeSlot(slotNum) {
    state.equipoActual[`slot${slotNum}`] = null;
}

export function limpiarEquipo() {
    state.equipoActual = {
        slot1: null,
        slot2: null,
        slot3: null,
        slot4: null
    };
}

export function setUIState(propiedad, valor) {
    state.ui[propiedad] = valor;
}

// Funciones de ayuda
export function contarPersonajesEnEquipo() {
    let contador = 0;
    for (let i = 1; i <= 4; i++) {
        if (state.equipoActual[`slot${i}`]) contador++;
    }
    return contador;
}

export function isPersonajeEnEquipo(personajeId) {
    for (let i = 1; i <= 4; i++) {
        const personaje = state.equipoActual[`slot${i}`];
        if (personaje && personaje.id == personajeId) {
            return i;
        }
    }
    return false;
}

export function obtenerSlotLibre() {
    for (let i = 1; i <= 4; i++) {
        if (!state.equipoActual[`slot${i}`]) {
            return i;
        }
    }
    return null;
}

export function aplicarFiltros() {
    const { nombre, elemento, rareza } = state.filtrosActuales;
    
    return state.personajes.filter(personaje => {
        // Filtrar por nombre
        if (nombre && !personaje.nombre.toLowerCase().includes(nombre.toLowerCase())) {
            return false;
        }
        
        // Filtrar por elemento
        if (elemento && personaje.elemento !== elemento) {
            return false;
        }
        
        // Filtrar por rareza
        if (rareza !== null && personaje.rareza !== rareza) {
            return false;
        }
        
        return true;
    });
}

// Exportamos el estado completo para casos específicos (usar con cuidado)
export function getFullState() {
    return { ...state };
}

export function setState(newState) {
    state = { ...state, ...newState };
}