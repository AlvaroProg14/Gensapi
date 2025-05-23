// components/team.js - Gestión de slots del equipo

import * as store from '../models/store.js';
import * as api from '../services/api.js';
import * as auth from '../services/auth.js';
import * as calculations from '../utils/calculations.js';
import * as messages from '../ui/messages.js';
import * as teamInfo from '../ui/teaminfo.js';
import { IMAGES } from '../models/data.js';

// Configurar los slots del equipo
export function setupTeamSlots() {
    const slots = document.querySelectorAll('.team-slot');
    
    slots.forEach(slot => {
        const slotNumber = slot.dataset.slot;
        const removeBtn = slot.querySelector('.remove-character');
        
        // Configurar botón para eliminar personaje
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                removeCharacterFromSlot(slotNumber);
                calculations.verifyResonancesAndQuality();
            });
        }
    });
}

// Añade un personaje a un slot específico del equipo
export function addCharacterToSlot(character, slotNumber) {
    const slot = document.getElementById(`slot-${slotNumber}`);
    
    if (!slot) {
        console.error(`Slot ${slotNumber} no encontrado`);
        return;
    }
    
    // Determinar rutas de imágenes
    const rarezaImagen = character.rareza == 5 ? IMAGES.rareza5 : IMAGES.rareza4;
    const elementoImagen = getElementImagePath(character.elemento);
    
    // Actualizar el HTML del slot
    slot.innerHTML = `
        <div class="slot-number">${slotNumber}</div>
        ${elementoImagen ? `<img class="elemento-icono" src="${elementoImagen}" alt="Elemento ${character.elemento}">` : ''}
        <img class="imagen-personaje" src="${character.icono}" alt="${character.nombre}">
        <h2>${character.nombre}</h2>
        ${rarezaImagen ? `<img class="rareza-icono" src="${rarezaImagen}" alt="Rareza ${character.rareza}">` : ''}
        <div class="remove-character">×</div>
    `;
    
    // Aplicar estilos según el elemento
    applyElementStyles(slot, character.elemento);
    
    // Actualizar el equipo actual en el store
    store.setPersonajeEnSlot(slotNumber, character);
    
    // Reconfigurar botón de eliminar
    const removeBtn = slot.querySelector('.remove-character');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            removeCharacterFromSlot(slotNumber);
            calculations.verifyResonancesAndQuality();
        });
    }
}

// Elimina un personaje de un slot específico
export function removeCharacterFromSlot(slotNumber) {
    const slot = document.getElementById(`slot-${slotNumber}`);
    
    if (!slot) {
        console.error(`Slot ${slotNumber} no encontrado`);
        return;
    }
    
    clearSlot(slot, slotNumber);
    store.removePersonajeDeSlot(slotNumber);
    
    // Reconfigurar botón de eliminar
    const removeBtn = slot.querySelector('.remove-character');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            removeCharacterFromSlot(slotNumber);
            calculations.verifyResonancesAndQuality();
        });
    }
}

// Limpia el contenido de un slot
export function clearSlot(slot, slotNumber) {
    slot.innerHTML = `
        <div class="slot-number">${slotNumber}</div>
        <div class="empty-slot-icon">+</div>
        <div class="slot-placeholder">Arrastra un personaje aquí</div>
        <div class="remove-character">×</div>
    `;
    
    // Quitar clases de elementos
    removeElementClasses(slot);
}

// Verifica si un personaje está en otro slot y lo elimina
export function checkAndRemoveDuplicate(character, currentSlot) {
    const slotWithCharacter = store.isPersonajeEnEquipo(character.id);
    
    if (slotWithCharacter && slotWithCharacter != currentSlot) {
        const previousSlot = document.getElementById(`slot-${slotWithCharacter}`);
        clearSlot(previousSlot, slotWithCharacter);
        store.removePersonajeDeSlot(slotWithCharacter);
    }
}

// Obtiene la ruta de la imagen del elemento
function getElementImagePath(element) {
    if (!element) return '';
    return `/img/Elemento_${element.charAt(0).toUpperCase() + element.slice(1)}.webp`;
}

// Aplica estilos según el elemento al slot
function applyElementStyles(slot, element) {
    slot.classList.add('filled');
    if (element) {
        slot.classList.add(element.toLowerCase());
    }
}

// Quita las clases de elementos de un slot
function removeElementClasses(slot) {
    slot.classList.remove('filled');
    slot.classList.remove('pyro', 'hydro', 'cryo', 'geo', 'anemo', 'electro', 'dendro');
}

// Añade personaje al primer slot vacío disponible
export function addCharacterToFirstEmptySlot(character) {
    // Verificar si ya está en el equipo
    const slotWithCharacter = store.isPersonajeEnEquipo(character.id);
    
    if (slotWithCharacter) {
        messages.showMessage(`${character.nombre} ya está en tu equipo`);
        return;
    }
    
    // Buscar el primer slot vacío
    const emptySlot = store.obtenerSlotLibre();
    
    if (emptySlot) {
        addCharacterToSlot(character, emptySlot);
        calculations.verifyResonancesAndQuality();
        messages.showMessage(`${character.nombre} añadido al equipo`);
    } else {
        messages.showMessage("Equipo completo. Elimina un personaje primero.");
    }
}

// Carga un equipo completo en los slots
export function loadTeamToSlots(team) {
    // Limpiar slots actuales
    for (let i = 1; i <= 4; i++) {
        const slot = document.getElementById(`slot-${i}`);
        clearSlot(slot, i);
        store.removePersonajeDeSlot(i);
    }

    // Cargar personajes del equipo
    team.characters.forEach(char => {
        // Buscar el personaje en la lista cargada
        const personajes = store.getPersonajes();
        const personajeCompleto = personajes.find(p => p.id.toString() === char.characterId);
        
        if (personajeCompleto) {
            addCharacterToSlot(personajeCompleto, char.slot);
        } else {
            // Si no está en la lista, crear objeto básico
            const personajeBasico = {
                id: char.characterId,
                nombre: char.characterName,
                elemento: char.characterElement,
                rareza: char.characterRarity,
                icono: char.characterIcon,
                funcion: char.characterRole
            };
            addCharacterToSlot(personajeBasico, char.slot);
        }
    });

    // Actualizar análisis
    calculations.verifyResonancesAndQuality();
}

// Carga un equipo copiado en los slots
export function loadCopiedTeam(team) {
    loadTeamToSlots(team);
    messages.showMessage(`Equipo "${team.name}" cargado exitosamente`);
}

// Añade los botones de guardar equipo a la interfaz
export function addSaveTeamButtons() {
    // Verificar si ya existen los botones
    if (document.getElementById('save-team-container')) {
        return;
    }

    // Crear contenedor para los botones de guardado
    const saveContainer = document.createElement('div');
    saveContainer.id = 'save-team-container';
    saveContainer.className = 'save-team-container';
    
    if (auth.isUserLoggedIn()) {
        saveContainer.innerHTML = `
            <div class="save-team-section">
                <h3>💾 Guardar Equipo</h3>
                <div class="save-team-form">
                    <input type="text" id="team-name" placeholder="Nombre del equipo" maxlength="50">
                    <textarea id="team-description" placeholder="Descripción (opcional)" maxlength="200"></textarea>
                    <div class="save-options">
                        <label class="checkbox-container">
                            <input type="checkbox" id="team-public" checked>
                            <span class="checkmark"></span>
                            Hacer público
                        </label>
                    </div>
                    <div class="save-buttons">
                        <button id="save-team-btn" class="btn-save">Guardar Equipo</button>
                        <button id="load-teams-btn" class="btn-load">Mi Perfil</button>
                        <button id="public-teams-btn" class="btn-public">Ver Equipos Públicos</button>
                    </div>
                </div>
                <div id="save-message" class="save-message"></div>
            </div>
        `;
    } else {
        saveContainer.innerHTML = `
            <div class="save-team-section">
                <h3>💾 Guardar Equipo</h3>
                <div class="login-prompt">
                    <p>Inicia sesión para guardar tus equipos</p>
                    <a href="/sesion.html" class="btn-login">Iniciar Sesión</a>
                </div>
            </div>
        `;
    }

    // Insertar después de los slots del equipo
    const teamContainer = document.querySelector('.team-container');
    teamContainer.parentNode.insertBefore(saveContainer, teamContainer.nextSibling);

    // Añadir estilos
    addSaveTeamStyles();

    // Configurar event listeners si el usuario está logueado
    if (auth.isUserLoggedIn()) {
        setupSaveTeamEventListeners();
    }
}

// Configura los event listeners para la funcionalidad de guardado
function setupSaveTeamEventListeners() {
    // Configurar navegación a perfil y equipos públicos
    const loadBtn = document.getElementById('load-teams-btn');
    const publicBtn = document.getElementById('public-teams-btn');

    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            window.location.href = '/perfil.html';
        });
    }
    
    if (publicBtn) {
        publicBtn.addEventListener('click', () => {
            window.location.href = '/equipos.html';
        });
    }
    
    // No configuramos el evento del botón "Guardar Equipo" aquí
    // porque se manejará directamente desde el módulo teamstorage.js
}

// Guarda el equipo actual
export async function saveCurrentTeam() {
    const teamName = document.getElementById('team-name').value.trim();
    const teamDescription = document.getElementById('team-description').value.trim();
    const isPublic = document.getElementById('team-public').checked;
    const saveBtn = document.getElementById('save-team-btn');

    // Validaciones
    if (!teamName) {
        messages.showSaveMessage('Por favor ingresa un nombre para el equipo', 'error');
        return;
    }

    // Verificar que hay al menos un personaje
    const charactersInTeam = [];
    const equipoActual = store.getEquipoActual();
    
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
        messages.showSaveMessage('Añade al menos un personaje al equipo', 'error');
        return;
    }

    // Calcular sinergia actual
    const synergyData = calculations.calculateElementalSynergy();
    const roleScore = calculations.calculateRoleDiversity();
    const resonanceScore = calculations.calculateResonanceScore();
    const totalScore = roleScore + resonanceScore + synergyData.puntuacion;
    
    const teamData = {
        name: teamName,
        description: teamDescription,
        characters: charactersInTeam,
        synergy: {
            elementalScore: synergyData.puntuacion,
            roleScore: roleScore,
            resonanceScore: resonanceScore,
            totalScore: totalScore,
            quality: calculations.determineQualityMessage((totalScore / 140) * 100),
            reactions: synergyData.reacciones || []
        },
        isPublic: isPublic
    };

    try {
        // Mostrar loading
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';

        await api.saveCurrentTeam(teamData);

        // Limpiar formulario
        document.getElementById('team-name').value = '';
        document.getElementById('team-description').value = '';
    } catch (error) {
        console.error('Error guardando equipo:', error);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Guardar Equipo';
    }
}

// Añadir estilos para la funcionalidad de guardado
function addSaveTeamStyles() {
    // Verificar si ya se añadieron los estilos
    if (document.getElementById('save-team-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'save-team-styles';
    style.textContent = `
        .save-team-container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 2px 15px rgba(26, 42, 58, 0.15);
            overflow: hidden;
        }

        .save-team-section {
            padding: 30px;
        }

        .save-team-section h3 {
            color: var(--color-azul-marino, #1a2a3a);
            margin-bottom: 20px;
            font-size: 24px;
        }

        .save-team-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .save-team-form input,
        .save-team-form textarea {
            padding: 12px 15px;
            border: 2px solid #e8f0f5;
            border-radius: 8px;
            font-size: 16px;
            font-family: inherit;
            transition: border-color 0.3s ease;
        }

        .save-team-form input:focus,
        .save-team-form textarea:focus {
            outline: none;
            border-color: #1a2a3a;
        }

        .save-team-form textarea {
            resize: vertical;
            min-height: 80px;
        }

        .save-options {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .checkbox-container {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 16px;
        }

        .checkbox-container input[type="checkbox"] {
            width: 18px;
            height: 18px;
        }

        .save-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .btn-save,
        .btn-load,
        .btn-login,
        .btn-public {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            text-align: center;
        }

        .btn-save {
            background: linear-gradient(135deg, #1a2a3a, #1a3a5f);
            color: white;
        }

        .btn-load {
            background: #e0a9a9;
            color: white;
        }

        .btn-login {
            background: #e0a9a9;
            color: white;
        }
        
        .btn-public {
            background: linear-gradient(135deg, var(--color-oro-rosa, #e0a9a9), var(--color-oro-rosa-hover, #d4918f));
            color: white;
            box-shadow: var(--sombra-suave, 0 2px 5px rgba(0,0,0,0.1));
        }

        .btn-save:hover,
        .btn-load:hover,
        .btn-login:hover,
        .btn-public:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-save:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .save-message {
            padding: 12px;
            border-radius: 8px;
            margin-top: 15px;
            display: none;
            font-weight: 500;
        }

        .save-message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .save-message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .login-prompt {
            text-align: center;
            padding: 20px;
            background: #e8f0f5;
            border-radius: 8px;
        }

        .login-prompt p {
            margin-bottom: 15px;
            color: #333;
        }
        
        @media (max-width: 768px) {
            .save-buttons {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(style);
}