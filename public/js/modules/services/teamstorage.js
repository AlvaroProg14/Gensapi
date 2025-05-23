// services/teamstorage.js - Gestión completa de equipos con MongoDB

import * as api from './api.js';
import * as store from '../models/store.js';
import * as auth from './auth.js';
import * as messages from '../ui/messages.js';
import * as calculations from '../utils/calculations.js';

/**
 * Guarda el equipo actual en MongoDB y en el perfil del usuario
 * @param {Object} formData Datos del formulario (nombre, descripción, público)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function saveTeamToMongoDB(formData) {
    console.log('Iniciando guardado de equipo con datos:', formData);
    try {
        // Validar que hay una sesión activa
        if (!auth.isUserLoggedIn()) {
            messages.showMessage('Inicia sesión para guardar equipos', true);
            return null;
        }
        
        // Validar que hay un nombre de equipo
        if (!formData.name || formData.name.trim() === '') {
            messages.showMessage('El nombre del equipo es obligatorio', true);
            return null;
        }
        
        // Obtener equipo actual
        const equipoActual = store.getEquipoActual();
        console.log('Equipo actual:', equipoActual);
        
        // Verificar que hay al menos un personaje
        const charactersInTeam = [];
        for (let i = 1; i <= 4; i++) {
            if (equipoActual[`slot${i}`]) {
                const character = equipoActual[`slot${i}`];
                charactersInTeam.push({
                    characterId: character.id.toString(),
                    characterName: character.nombre,
                    characterElement: character.elemento,
                    characterRarity: character.rareza,
                    characterIcon: character.icono,
                    characterRole: character.funcion || '',
                    slot: i
                });
            }
        }
        
        if (charactersInTeam.length === 0) {
            messages.showMessage('Añade al menos un personaje al equipo', true);
            return null;
        }
        
        console.log('Personajes en el equipo:', charactersInTeam);
        
        // Calcular sinergia actual
        const synergyData = calculations.calculateElementalSynergy();
        const roleScore = calculations.calculateRoleDiversity();
        const resonanceScore = calculations.calculateResonanceScore();
        const totalScore = roleScore + resonanceScore + synergyData.puntuacion;
        
        // Preparar datos del equipo
        const teamData = {
            name: formData.name.trim(),
            description: formData.description ? formData.description.trim() : '',
            characters: charactersInTeam,
            synergy: {
                elementalScore: synergyData.puntuacion,
                roleScore: roleScore,
                resonanceScore: resonanceScore,
                totalScore: totalScore,
                quality: calculations.determineQualityMessage((totalScore / 140) * 100),
                reactions: synergyData.reacciones || []
            },
            isPublic: formData.isPublic
        };
        
        console.log('Datos del equipo a guardar:', teamData);
        
        // Mostrar indicador de carga
        const saveBtn = document.getElementById('save-team-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando...';
        }
        
        try {
            // Enviar directamente al endpoint de la API en lugar de usar api.makeRequest
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('No hay sesión activa');
            }
            
            console.log('Enviando solicitud a la API...');
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(teamData)
            });
            
            // Procesar la respuesta
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Error al guardar el equipo');
            }
            
            console.log('Equipo guardado con éxito:', result);
            
            // Mostrar mensaje de éxito
            messages.showMessage('¡Equipo guardado exitosamente!');
            
            // Limpiar formulario
            if (document.getElementById('team-name')) {
                document.getElementById('team-name').value = '';
            }
            
            if (document.getElementById('team-description')) {
                document.getElementById('team-description').value = '';
            }
            
            return result;
        } catch (error) {
            console.error('Error guardando equipo:', error);
            messages.showMessage(error.message || 'Error al guardar el equipo', true);
            return null;
        } finally {
            // Restaurar botón
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Guardar Equipo';
            }
        }
    } catch (error) {
        console.error('Error preparando datos del equipo:', error);
        messages.showMessage('Error al preparar los datos del equipo', true);
        return null;
    }
}

/**
 * Maneja el evento de guardar equipo desde el formulario
 */
export function handleSaveTeamFormSubmit() {
    console.log('Función handleSaveTeamFormSubmit ejecutada');
    // Obtener datos del formulario
    const teamName = document.getElementById('team-name').value.trim();
    const teamDescription = document.getElementById('team-description').value.trim();
    const isPublic = document.getElementById('team-public').checked;
    
    console.log('Datos del formulario:', { teamName, teamDescription, isPublic });
    
    // Guardar equipo
    saveTeamToMongoDB({
        name: teamName,
        description: teamDescription,
        isPublic: isPublic
    });
}

/**
 * Configura los eventos del formulario de guardado
 */
export function setupSaveTeamFormEvents() {
    console.log('Configurando eventos del formulario de guardado');
    const saveBtn = document.getElementById('save-team-btn');
    if (saveBtn) {
        console.log('Botón de guardar encontrado');
        // Eliminar cualquier event listener previo
        saveBtn.replaceWith(saveBtn.cloneNode(true));
        
        // Obtener referencia al nuevo botón
        const newSaveBtn = document.getElementById('save-team-btn');
        
        // Añadir nuevo event listener
        newSaveBtn.addEventListener('click', function(e) {
            console.log('Botón de guardar clickeado');
            e.preventDefault();
            handleSaveTeamFormSubmit();
        });
        
        console.log('Event listener configurado para el botón de guardar');
    } else {
        console.warn('Botón de guardar no encontrado');
    }
    
    // Configurar también evento de tecla Enter en el nombre
    const teamNameInput = document.getElementById('team-name');
    if (teamNameInput) {
        console.log('Input de nombre de equipo encontrado');
        // Eliminar cualquier event listener previo
        teamNameInput.replaceWith(teamNameInput.cloneNode(true));
        
        // Obtener referencia al nuevo input
        const newTeamNameInput = document.getElementById('team-name');
        
        // Añadir nuevo event listener
        newTeamNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Tecla Enter presionada en input de nombre');
                e.preventDefault();
                handleSaveTeamFormSubmit();
            }
        });
        
        console.log('Event listener configurado para el input de nombre');
    } else {
        console.warn('Input de nombre de equipo no encontrado');
    }
}

// Añadir un listener que se ejecute cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado - verificando formulario de guardado');
    // Verificar si ya existe el formulario
    setTimeout(() => {
        setupSaveTeamFormEvents();
    }, 2000); // Esperar 2 segundos para asegurar que todo está cargado
});

// Exportar otras funciones para la gestión de equipos
export async function loadUserTeamsFromMongoDB(page = 1, limit = 10) {
    // Implementación actual
    return api.getUserTeams(page, limit);
}

export async function loadPublicTeamsFromMongoDB(filters = {}) {
    // Implementación actual
    const { page = 1, limit = 12, sort = 'likes', search = '', minScore = 0 } = filters;
    return api.getPublicTeams(page, limit, sort, search, minScore);
}

export async function deleteTeamFromMongoDB(teamId) {
    // Implementación actual
    return api.deleteTeamById(teamId);
}

export async function getTeamDetailsFromMongoDB(teamId) {
    // Implementación actual
    return api.loadTeamById(teamId);
}

export async function toggleTeamLike(teamId, likeButton) {
    // Implementación actual
    return api.toggleLikeTeam(teamId, likeButton);
}