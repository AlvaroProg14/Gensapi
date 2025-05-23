// services/api.js - Comunicación con el backend

import * as store from '../models/store.js';
import * as team from '../components/team.js';
import * as messages from '../ui/messages.js';
import { CONFIG } from '../models/data.js';

// Carga los personajes del JSON e inicializa la aplicación
export async function loadCharacters() {
    try {
        const response = await fetch(CONFIG.dataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        store.setPersonajes(data.Personajes);
        
        // Inicializar renderizado de personajes
        const character = await import('../components/character.js');
        character.showCharacters(data.Personajes);
        
        return data.Personajes;
    } catch (error) {
        console.error('Error al cargar los personajes:', error);
        messages.showMessage('Error al cargar los datos. Intenta recargar la página.', true);
        return [];
    }
}

// Función para hacer peticiones HTTP
export async function makeRequest(url, method, data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    // Añadir token si existe
    const token = localStorage.getItem('authToken');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Error en la petición');
    }

    return result;
}

// Guardar equipo actual
export async function saveCurrentTeam(teamData) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        const response = await makeRequest('/api/teams', 'POST', teamData);
        
        messages.showMessage('¡Equipo guardado exitosamente!', false);
        return response;
    } catch (error) {
        console.error('Error guardando equipo:', error);
        messages.showMessage(error.message || 'Error guardando equipo', true);
        throw error;
    }
}

// Cargar un equipo por ID
export async function loadTeamById(teamId) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            messages.showMessage('Inicia sesión para cargar equipos', true);
            return null;
        }
        
        const result = await makeRequest(`/api/teams/${teamId}`, 'GET');
        return result;
    } catch (error) {
        console.error('Error cargando equipo:', error);
        messages.showMessage(error.message || 'Error cargando equipo', true);
        return null;
    }
}

// Eliminar equipo por ID
export async function deleteTeamById(teamId) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        const result = await makeRequest(`/api/teams/${teamId}`, 'DELETE');
        messages.showMessage('Equipo eliminado exitosamente', false);
        return result;
    } catch (error) {
        console.error('Error eliminando equipo:', error);
        messages.showMessage(error.message || 'Error eliminando equipo', true);
        throw error;
    }
}

// Dar like o quitar like a un equipo
export async function toggleLikeTeam(teamId) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('Inicia sesión para dar like');
        }
        
        const result = await makeRequest(`/api/teams/${teamId}/like`, 'POST');
        return result;
    } catch (error) {
        console.error('Error con like:', error);
        messages.showMessage(error.message || 'Error al dar like', true);
        throw error;
    }
}

// Obtener equipos públicos
export async function getPublicTeams(page = 1, limit = 12, sortBy = 'likes', search = '', minScore = 0) {
    try {
        let url = `/api/teams/public?page=${page}&limit=${limit}&sort=${sortBy}`;
        
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        
        if (minScore) {
            url += `&minScore=${minScore}`;
        }
        
        const result = await makeRequest(url, 'GET');
        return result;
    } catch (error) {
        console.error('Error obteniendo equipos públicos:', error);
        messages.showMessage(error.message || 'Error cargando equipos públicos', true);
        throw error;
    }
}

// Obtener equipos del usuario actual
export async function getUserTeams(page = 1, limit = 10) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No hay sesión activa');
        }
        
        const result = await makeRequest(`/api/teams/my?page=${page}&limit=${limit}`, 'GET');
        return result;
    } catch (error) {
        console.error('Error obteniendo equipos del usuario:', error);
        messages.showMessage(error.message || 'Error cargando tus equipos', true);
        throw error;
    }
}