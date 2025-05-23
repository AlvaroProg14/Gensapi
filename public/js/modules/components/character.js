// components/character.js - Renderizado y manejo de personajes

import * as store from '../models/store.js';
import * as dragdrop from './dragdrop.js';
import * as team from './team.js';
import { IMAGES } from '../models/data.js';

// Muestra los personajes en la interfaz y configura sus eventos
export function showCharacters(characterList) {
    const container = document.getElementById('personajes-container');
    
    if (!container) {
        console.error("Contenedor de personajes no encontrado");
        return;
    }
    
    container.innerHTML = '';
    
    // Mostrar mensaje si no hay resultados
    if (characterList.length === 0) {
        container.innerHTML = '<div class="no-resultados">No se encontraron personajes con esos criterios</div>';
        return;
    }
    
    // Generar tarjetas para cada personaje
    characterList.forEach(personaje => { 
        const personajeDiv = document.createElement('div');
        personajeDiv.className = 'personaje';
        
        // Guardar datos del personaje en el elemento para facilitar el drag and drop
        personajeDiv.dataset.personaje = JSON.stringify(personaje);
        personajeDiv.dataset.id = personaje.id;
        
        // Rutas a imágenes
        const rarezaImagen = personaje.rareza == 5 ? IMAGES.rareza5 : IMAGES.rareza4;
        const elementoImagen = getElementImagePath(personaje.elemento);
        
        // Crear HTML de la tarjeta
        personajeDiv.innerHTML = `
            ${elementoImagen ? `<img class="elemento-icono" src="${elementoImagen}" alt="Elemento ${personaje.elemento}">` : ''}
            <img class="imagen-personaje" src="${personaje.icono}" alt="${personaje.nombre}">
            <h2>${personaje.nombre}</h2>
            <p>Rol: ${personaje.funcion || 'No especificado'}</p>
            ${rarezaImagen ? `<img class="rareza-icono" src="${rarezaImagen}" alt="Rareza ${personaje.rareza}">` : ''}
        `;
        
        // Añadir clase de elemento para estilos
        if (personaje.elemento) {
            personajeDiv.classList.add(personaje.elemento.toLowerCase());
        }
        
        container.appendChild(personajeDiv);
    });
    
    // Configurar drag and drop para los nuevos elementos
    dragdrop.setupCharactersDrag();
}

// Obtiene la ruta de la imagen del elemento
function getElementImagePath(element) {
    if (!element) return '';
    return `/img/Elemento_${element.charAt(0).toUpperCase() + element.slice(1)}.webp`;
}

// Crea una tarjeta de personaje para el modal
export function createCharacterCard(character) {
    const rarezaImagen = character.rareza == 5 ? IMAGES.rareza5 : IMAGES.rareza4;
    const elementoImagen = getElementImagePath(character.elemento);
    
    return `
        <div class="character-card ${character.elemento || ''}">
            <div class="character-image">
                <img src="${character.icono}" alt="${character.nombre}">
                ${elementoImagen ? `<div class="character-element"><img src="${elementoImagen}" alt="${character.elemento}"></div>` : ''}
            </div>
            <div class="character-info">
                <h3>${character.nombre}</h3>
                <div class="character-details">
                    <span class="character-role">${character.funcion || 'Sin rol'}</span>
                    ${rarezaImagen ? `<img class="character-rarity" src="${rarezaImagen}" alt="Rareza ${character.rareza}">` : ''}
                </div>
            </div>
        </div>
    `;
}

// Crea una tarjeta de equipo para mostrar en vistas de equipos
export function createTeamCard(team) {
    const charactersHtml = team.characters
        .sort((a, b) => a.slot - b.slot)
        .map(char => `
            <div class="team-character">
                <img src="${char.characterIcon}" alt="${char.characterName}" title="${char.characterName}">
                <div class="character-element ${char.characterElement}"></div>
            </div>
        `).join('');

    return `
        <div class="team-card">
            <div class="team-info">
                <h4>${team.name}</h4>
                ${team.description ? `<p class="team-description">${team.description}</p>` : ''}
                <div class="team-stats">
                    <span class="team-score">Puntuación: ${team.synergy?.totalScore || 0}</span>
                    <span class="team-quality">${team.synergy?.quality || 'Sin evaluar'}</span>
                    <span class="team-visibility">${team.isPublic ? '🌐 Público' : '🔒 Privado'}</span>
                </div>
            </div>
            <div class="team-characters">
                ${charactersHtml}
            </div>
            <div class="team-actions">
                <button class="load-team-btn" data-team-id="${team._id}">Cargar</button>
                <button class="delete-team-btn" data-team-id="${team._id}">Eliminar</button>
            </div>
        </div>
    `;
}

// Crea una tarjeta para equipos públicos
export function createPublicTeamCard(team, currentUserId = null) {
    const isOwner = currentUserId && team.userId === currentUserId;
    const userLiked = team.userLiked || false;
    const likeIcon = userLiked ? '❤️' : '🤍';
    
    const charactersHtml = team.characters
        .sort((a, b) => a.slot - b.slot)
        .map(char => `
            <div class="team-character">
                <img src="${char.characterIcon}" alt="${char.characterName}" title="${char.characterName}">
                <div class="character-element ${char.characterElement}"></div>
            </div>
        `).join('');

    const reactionsHtml = team.synergy?.reactions?.length > 0 
        ? `<div class="team-reactions">
             <strong>Reacciones:</strong> ${team.synergy.reactions.join(', ')}
           </div>`
        : '';

    const scoreClass = getScoreClass(team.synergy?.totalScore || 0);

    return `
        <article class="public-team-card">
            <header class="team-header">
                <div class="team-title-section">
                    <h3 class="team-name">${team.name}</h3>
                    <span class="team-author">por ${team.author?.username || team.author?.name || team.authorName || 'Usuario Anónimo'}</span>
                </div>
                <div class="team-stats-section">
                    <div class="team-score-badge ${scoreClass}">
                        <span class="score-number">${team.synergy?.totalScore || 0}</span>
                        <span class="score-label">pts</span>
                    </div>
                </div>
            </header>

            <div class="team-content">
                ${team.description ? `<p class="team-description">${team.description}</p>` : ''}
                
                <div class="team-characters-showcase">
                    ${charactersHtml}
                </div>

                <div class="team-analysis">
                    <div class="synergy-info">
                        <span class="synergy-quality">${team.synergy?.quality || 'Sin análisis'}</span>
                        ${reactionsHtml}
                    </div>
                </div>
            </div>

            <footer class="team-actions">
                <button class="like-btn ${userLiked ? 'liked' : ''}" 
                        data-team-id="${team._id}" 
                        data-liked="${userLiked}"
                        ${!currentUserId ? 'disabled title="Inicia sesión para dar like"' : ''}>
                    ${likeIcon} ${team.likeCount || 0}
                </button>
                
                <button class="copy-team-btn" data-team-id="${team._id}">
                    📋 Copiar Equipo
                </button>
                
                ${isOwner ? `
                    <button class="delete-public-team-btn" data-team-id="${team._id}">
                        🗑️ Eliminar
                    </button>
                ` : ''}
                
                <span class="team-date">
                    ${new Date(team.createdAt).toLocaleDateString('es-ES')}
                </span>
            </footer>
        </article>
    `;
}

// Obtiene la clase CSS según la puntuación
function getScoreClass(score) {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-decent';
    return 'score-low';
}