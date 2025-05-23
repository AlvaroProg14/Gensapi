// utils/filters.js - Funciones de filtrado y búsqueda

import * as store from '../models/store.js';
import * as character from '../components/character.js';

// Aplica todos los filtros activos a la lista de personajes
export function applyFilters() {
    const resultado = store.aplicarFiltros();
    
    // Mostrar resultados filtrados
    character.showCharacters(resultado);
    
    return resultado;
}

// Ordena personajes por rareza
export function sortByRarity(orden) {
    // Obtener personajes filtrados actuales
    const personajes = store.getPersonajes();
    const filtrosActuales = store.getFiltros();
    
    // Aplicar filtros actuales
    let resultado = [...personajes];
    
    if (filtrosActuales.nombre) {
        resultado = resultado.filter(p => 
            p.nombre.toLowerCase().includes(filtrosActuales.nombre.toLowerCase())
        );
    }
    
    if (filtrosActuales.elemento) {
        resultado = resultado.filter(p => p.elemento === filtrosActuales.elemento);
    }
    
    if (filtrosActuales.rareza !== null) {
        resultado = resultado.filter(p => p.rareza === filtrosActuales.rareza);
    }
    
    // Ordenar por rareza (ascendente o descendente)
    resultado.sort((a, b) => orden === 'asc' ? a.rareza - b.rareza : b.rareza - a.rareza);
    
    character.showCharacters(resultado);
    
    return resultado;
}

// Filtra personajes por rareza
export function filterByRarity(rareza) {
    // Activar/desactivar filtro
    const filtrosActuales = store.getFiltros();
    
    if (filtrosActuales.rareza === rareza) {
        // Si ya está seleccionado, quitar filtro
        store.setFiltro('rareza', null);
    } else {
        // Si no, activar filtro
        store.setFiltro('rareza', rareza);
    }
    
    applyFilters();
    updateRarityButtons();
}

// Actualiza el estado visual de los botones de rareza
function updateRarityButtons() {
    const filtrosActuales = store.getFiltros();
    
    // Obtener botones
    const rareza4Btn = document.getElementById('rareza-4-btn');
    const rareza5Btn = document.getElementById('rareza-5-btn');
    
    if (rareza4Btn) {
        if (filtrosActuales.rareza === 4) {
            rareza4Btn.classList.add('active-filter');
        } else {
            rareza4Btn.classList.remove('active-filter');
        }
    }
    
    if (rareza5Btn) {
        if (filtrosActuales.rareza === 5) {
            rareza5Btn.classList.add('active-filter');
        } else {
            rareza5Btn.classList.remove('active-filter');
        }
    }
}

// Filtra personajes por elemento
export function filterByElement() {
    const elementoSeleccionado = document.getElementById('filtro-elemento').value;
    store.setFiltro('elemento', elementoSeleccionado);
    applyFilters();
}

// Busca personajes por nombre
export function searchByName() {
    const textoBusqueda = document.getElementById('buscador-nombre').value;
    store.setFiltro('nombre', textoBusqueda);
    applyFilters();
}

// Resetea todos los filtros aplicados
export function resetFilters() {
    document.getElementById('buscador-nombre').value = '';
    document.getElementById('filtro-elemento').value = '';
    
    store.resetFiltros();
    character.showCharacters(store.getPersonajes());
    updateRarityButtons();
}

// Añade estilos para los filtros
export function addFilterStyles() {
    if (document.getElementById('filter-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'filter-styles';
    style.textContent = `
        .active-filter {
            background-color: var(--color-oro-rosa, #e0a9a9);
            color: white;
            font-weight: bold;
        }
        
        .no-resultados {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }
    `;
    
    document.head.appendChild(style);
}

// Inicializa los estilos de filtros
addFilterStyles();