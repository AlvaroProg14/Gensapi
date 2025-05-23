// ui/teamInfo.js - Visualización de información del equipo

import * as calculations from '../utils/calculations.js';
import { REACCIONES_INFO } from '../models/data.js';

// Muestra la sinergia elemental en la interfaz
export function showElementalSynergy(sinergiaData) {
    const { puntuacion, reacciones, elementoUnico, equipoCompleto } = sinergiaData;
    const sinergiaContainer = document.getElementById('sinergia-info');
    
    if (!sinergiaContainer) {
        console.error("No se encontró el contenedor de sinergia con ID 'sinergia-info'");
        return;
    }
    
    // Determinar calidad de sinergia
    const { calidadMensaje, claseCalidad } = calculations.getSynergyQuality(
        puntuacion, elementoUnico, equipoCompleto
    );
    
    // Aplicar clase de calidad
    updateSynergyClass(sinergiaContainer, claseCalidad);
    
    // Actualizar contenido
    document.getElementById('sinergia-titulo').textContent = "Sinergia Elemental";
    document.getElementById('sinergia-puntuacion').textContent = puntuacion;
    document.getElementById('sinergia-mensaje').textContent = calidadMensaje;
    
    // Actualizar lista de reacciones
    updateReactionsList(reacciones, elementoUnico, equipoCompleto);
    
    // Mostrar/ocultar el contenedor
    const mostrarContenedor = (puntuacion > 0) || (elementoUnico && equipoCompleto);
    sinergiaContainer.style.display = mostrarContenedor ? 'flex' : 'none';
}

// Actualiza las clases CSS para la sinergia
function updateSynergyClass(container, nuevaClase) {
    container.classList.remove('sinergia-baja', 'sinergia-decente', 'sinergia-buena', 'sinergia-excelente');
    container.classList.add(nuevaClase);
}

// Actualiza la lista de reacciones en la interfaz
function updateReactionsList(reacciones, elementoUnico, equipoCompleto) {
    const listaReacciones = document.getElementById('lista-reacciones');
    if (!listaReacciones) return;
    
    listaReacciones.innerHTML = ''; // Limpiar lista previa
    
    if (reacciones && reacciones.length > 0) {
        // Mostrar cada reacción con su descripción
        reacciones.forEach(reaccion => {
            const datosReaccion = calculations.getReactionData(reaccion);
            const li = document.createElement('li');
            li.innerHTML = `<span class="reaccion-nombre">${datosReaccion.nombre}</span>: ${datosReaccion.descripcion}`;
            listaReacciones.appendChild(li);
        });
    } else if (elementoUnico && equipoCompleto) {
        // Mensaje para equipo de un solo elemento
        const li = document.createElement('li');
        li.textContent = `Todos los personajes son de elemento ${elementoUnico.charAt(0).toUpperCase() + elementoUnico.slice(1).toLowerCase()}, no hay reacciones elementales posibles.`;
        listaReacciones.appendChild(li);
    } else {
        // Mensaje genérico para falta de reacciones
        const li = document.createElement('li');
        li.textContent = "No se encontraron reacciones elementales";
        listaReacciones.appendChild(li);
    }
}

// Muestra la calidad general del equipo en la interfaz
export function showTeamQuality(puntuacion, mensaje) {
    const calidadContainer = document.getElementById('calidad-equipo');
    
    if (!calidadContainer) {
        console.error("No se encontró el contenedor de calidad con ID 'calidad-equipo'");
        return;
    }
    
    // Determinar clase según puntuación
    let claseCalidad = 'calidad-baja';
    
    if (puntuacion >= 30 && puntuacion < 60) {
        claseCalidad = 'calidad-media';
    } else if (puntuacion >= 60) {
        claseCalidad = 'calidad-alta';
    }
    
    // Actualizar clases CSS
    calidadContainer.classList.remove('calidad-baja', 'calidad-media', 'calidad-alta');
    calidadContainer.classList.add(claseCalidad);
    
    // Actualizar contenido
    document.getElementById('calidad-titulo').textContent = "Calidad del Equipo";
    document.getElementById('calidad-puntuacion').textContent = puntuacion;
    document.getElementById('calidad-mensaje').textContent = mensaje;
    
    // Mostrar u ocultar según puntuación
    calidadContainer.style.display = puntuacion > 0 ? 'flex' : 'none';
}

// Crea una representación visual de las reacciones para usar en modales o detalles
export function createReactionsVisualization(reacciones) {
    if (!reacciones || reacciones.length === 0) {
        return '<div class="no-reactions">No hay reacciones elementales</div>';
    }
    
    const reaccionesHTML = reacciones.map(reaccion => {
        const info = REACCIONES_INFO[reaccion] || { nombre: reaccion, descripcion: '' };
        return `
            <div class="reaction-item">
                <div class="reaction-name">${info.nombre}</div>
                <div class="reaction-description">${info.descripcion}</div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="reactions-visualization">
            ${reaccionesHTML}
        </div>
    `;
}

// Crea una visualización completa del equipo para compartir o exportar
export function createTeamVisualization(teamData, includeDetails = true) {
    const charactersHtml = teamData.characters
        .sort((a, b) => a.slot - b.slot)
        .map(char => `
            <div class="team-viz-character ${char.characterElement}">
                <img src="${char.characterIcon}" alt="${char.characterName}">
                <div class="character-info">
                    <div class="character-name">${char.characterName}</div>
                    <div class="character-element">${char.characterElement.charAt(0).toUpperCase() + char.characterElement.slice(1)}</div>
                    ${char.characterRole ? `<div class="character-role">${char.characterRole}</div>` : ''}
                </div>
            </div>
        `).join('');
    
    const synergyHtml = includeDetails && teamData.synergy ? `
        <div class="team-viz-synergy">
            <div class="synergy-score">
                <span class="score-label">Puntuación:</span>
                <span class="score-value">${teamData.synergy.totalScore}</span>
            </div>
            <div class="synergy-quality">${teamData.synergy.quality}</div>
            ${teamData.synergy.reactions && teamData.synergy.reactions.length > 0 ? 
                `<div class="synergy-reactions">
                    <div class="reactions-label">Reacciones:</div>
                    <div class="reactions-list">
                        ${teamData.synergy.reactions.map(r => `
                            <span class="reaction-tag">${REACCIONES_INFO[r]?.nombre || r}</span>
                        `).join('')}
                    </div>
                </div>` : ''
            }
        </div>
    ` : '';
    
    const teamVizHTML = `
        <div class="team-visualization">
            <div class="team-viz-header">
                <h3 class="team-viz-name">${teamData.name}</h3>
                ${teamData.description ? `<p class="team-viz-description">${teamData.description}</p>` : ''}
            </div>
            
            <div class="team-viz-characters">
                ${charactersHtml}
            </div>
            
            ${synergyHtml}
        </div>
    `;
    
    return teamVizHTML;
}

// Añade estilos para las visualizaciones
export function addVisualizationStyles() {
    if (document.getElementById('team-viz-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'team-viz-styles';
    style.textContent = `
        .team-visualization {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .team-viz-header {
            background: linear-gradient(135deg, #1a2a3a, #2a3a4a);
            color: white;
            padding: 20px;
        }
        
        .team-viz-name {
            margin: 0 0 5px;
            font-size: 24px;
        }
        
        .team-viz-description {
            margin: 5px 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
        
        .team-viz-characters {
            display: flex;
            flex-wrap: wrap;
            padding: 15px;
            gap: 15px;
        }
        
        .team-viz-character {
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            width: calc(50% - 15px);
            display: flex;
            align-items: center;
            background: #f8f9fa;
        }
        
        .team-viz-character img {
            width: 70px;
            height: 70px;
            object-fit: cover;
        }
        
        .team-viz-character .character-info {
            padding: 10px;
        }
        
        .team-viz-character .character-name {
            font-weight: 600;
            margin-bottom: 3px;
        }
        
        .team-viz-character .character-element,
        .team-viz-character .character-role {
            font-size: 12px;
            color: #666;
        }
        
        .team-viz-synergy {
            background: #f0f2f5;
            padding: 15px;
            border-top: 1px solid #e5e7eb;
        }
        
        .synergy-score {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 5px;
        }
        
        .score-label {
            font-weight: 500;
        }
        
        .score-value {
            font-size: 18px;
            font-weight: 700;
            color: #1a2a3a;
        }
        
        .synergy-quality {
            font-size: 14px;
            color: #495057;
            margin-bottom: 10px;
        }
        
        .reactions-label {
            font-weight: 500;
            margin-bottom: 5px;
        }
        
        .reactions-list {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        
        .reaction-tag {
            background: rgba(26, 42, 58, 0.1);
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        
        /* Colores para elementos */
        .team-viz-character.pyro { border-left: 4px solid #ff6b35; }
        .team-viz-character.hydro { border-left: 4px solid #4fc3f7; }
        .team-viz-character.cryo { border-left: 4px solid #81d4fa; }
        .team-viz-character.electro { border-left: 4px solid #9c27b0; }
        .team-viz-character.anemo { border-left: 4px solid #4caf50; }
        .team-viz-character.geo { border-left: 4px solid #ff9800; }
        .team-viz-character.dendro { border-left: 4px solid #8bc34a; }
        
        /* Visualización de reacciones */
        .reactions-visualization {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .reaction-item {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .reaction-name {
            font-weight: 600;
            margin-bottom: 3px;
        }
        
        .reaction-description {
            font-size: 13px;
            color: #666;
        }
        
        .no-reactions {
            padding: 20px;
            text-align: center;
            color: #666;
            font-style: italic;
        }
    `;
    
    document.head.appendChild(style);
}

// Inicializar estilos
addVisualizationStyles();