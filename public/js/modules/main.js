// main.js - Punto de entrada y coordinación de la aplicación

import * as store from './models/store.js';
import * as dataModel from './models/data.js';
import * as api from './services/api.js';
import * as auth from './services/auth.js';
import * as dragdrop from './components/dragdrop.js';
import * as team from './components/team.js';
import * as character from './components/character.js';
import * as filters from './utils/filters.js';
import * as calculations from './utils/calculations.js';
import * as messages from './ui/messages.js';
import * as teamInfo from './ui/teaminfo.js';
import * as saveForm from './components/saveform.js';

// Función de inicialización principal
async function init() {
    console.log('Inicializando aplicación de creador de equipos...');
    
    // Verificar si hay parámetros en la URL (para cargar equipo)
    checkUrlParameters();
    
    // Inicializar autenticación
    auth.initHeaderAuth();
    
    // Cargar datos de personajes
    await api.loadCharacters();
    
    // Inicializar componentes
    dragdrop.setupDragAndDrop();
    team.setupTeamSlots();
    
    // Inicializar eventos de filtrado
    setupFilterEvents();
    
    // Verificar si hay un equipo copiado para cargar
    checkCopiedTeam();
    
    // Añadir botones de guardado después de cargar personajes
    setTimeout(() => {
        // Usar directamente el nuevo módulo saveForm
        saveForm.addSaveForm();
    }, 1500);
    
    console.log('Aplicación inicializada correctamente');
}

// Verificar parámetros en la URL (por ejemplo, ?load=teamId)
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const teamToLoad = urlParams.get('load');
    
    if (teamToLoad) {
        console.log(`Se detectó un ID de equipo en la URL: ${teamToLoad}`);
        // Cargar el equipo cuando los datos estén disponibles
        api.loadTeamById(teamToLoad)
            .then(result => {
                if (result && result.team) {
                    team.loadTeamToSlots(result.team);
                    messages.showMessage(`Equipo "${result.team.name}" cargado correctamente`);
                }
            })
            .catch(error => {
                console.error('Error cargando equipo desde URL:', error);
                messages.showMessage('No se pudo cargar el equipo especificado', true);
            });
    }
}

// Verificar si hay un equipo copiado para cargar
function checkCopiedTeam() {
    const copiedTeam = localStorage.getItem('copyTeam');
    
    if (copiedTeam) {
        try {
            const teamData = JSON.parse(copiedTeam);
            
            // Mostrar confirmación
            if (confirm(`¿Quieres cargar el equipo "${teamData.name}" que copiaste?`)) {
                team.loadCopiedTeam(teamData);
            }
            
            // Limpiar localStorage
            localStorage.removeItem('copyTeam');
            
        } catch (error) {
            console.error('Error cargando equipo copiado:', error);
            localStorage.removeItem('copyTeam');
        }
    }
}

// Configurar eventos para filtros
function setupFilterEvents() {
    // Búsqueda por nombre
    document.getElementById('buscador-nombre').addEventListener('input', filters.searchByName);
    
    // Filtrado por elemento
    document.getElementById('filtro-elemento').addEventListener('change', filters.filterByElement);
    
    // Ordenación por rareza
    document.getElementById('rareza-desc-btn').addEventListener('click', () => filters.sortByRarity('desc'));
    document.getElementById('rareza-asc-btn').addEventListener('click', () => filters.sortByRarity('asc'));
    
    // Filtrado por rareza
    document.getElementById('rareza-5-btn').addEventListener('click', () => filters.filterByRarity(5));
    document.getElementById('rareza-4-btn').addEventListener('click', () => filters.filterByRarity(4));
    
    // Resetear filtros
    document.getElementById('reset-filters-btn').addEventListener('click', filters.resetFilters);
}

// Iniciar aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', init);

// Exportar funciones para uso global si es necesario
export {
    init
};