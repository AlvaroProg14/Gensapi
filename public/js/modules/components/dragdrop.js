// components/dragdrop.js - Sistema de arrastrar y soltar

import * as store from '../models/store.js';
import * as team from './team.js';
import * as calculations from '../utils/calculations.js';
import * as messages from '../ui/messages.js';

/**
 * Configura la funcionalidad completa de arrastrar y soltar
 */
export function setupDragAndDrop() {
    setupSlotsDrop();
    setupCharactersDrag();
    addDragAndDropStyles();
}

/**
 * Configura los slots del equipo como zonas de drop
 */
function setupSlotsDrop() {
    const slots = document.querySelectorAll('.team-slot');
    
    slots.forEach(slot => {
        // Permitir que se arrastren elementos sobre el slot
        slot.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necesario para permitir el drop
            e.dataTransfer.dropEffect = 'move';
            
            // Añadir clase visual de hover
            slot.classList.add('drag-hover');
        });
        
        // Quitar estilo visual cuando se sale del área
        slot.addEventListener('dragleave', (e) => {
            // Solo quitar si realmente salimos del slot (no de un hijo)
            if (!slot.contains(e.relatedTarget)) {
                slot.classList.remove('drag-hover');
            }
        });
        
        // Manejar el evento de soltar
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            
            // Quitar clase visual
            slot.classList.remove('drag-hover');
            
            // Obtener datos del personaje arrastrado
            const personajeId = e.dataTransfer.getData('personajeId');
            const personajeData = JSON.parse(e.dataTransfer.getData('personajeData'));
            const slotNumber = slot.dataset.slot;
            
            // Verificar que tenemos datos válidos
            if (!personajeData || !slotNumber) {
                console.error('Datos de drag and drop inválidos');
                return;
            }
            
            // Verificar y eliminar duplicados
            team.checkAndRemoveDuplicate(personajeData, slotNumber);
            
            // Añadir personaje al slot
            team.addCharacterToSlot(personajeData, slotNumber);
            
            // Actualizar visualización de sinergias
            calculations.verifyResonancesAndQuality();
            
            // Mostrar mensaje de confirmación
            messages.showMessage(`${personajeData.nombre} añadido al slot ${slotNumber}`);
        });
    });
}

/**
 * Configura los personajes como elementos draggable
 */
export function setupCharactersDrag() {
    const personajesElements = document.querySelectorAll('.personaje');
    
    personajesElements.forEach(personajeElement => {
        // Hacer el elemento arrastrable
        personajeElement.draggable = true;
        
        // Al empezar a arrastrar
        personajeElement.addEventListener('dragstart', (e) => {
            // Añadir clase visual para el elemento que se está arrastrando
            personajeElement.classList.add('dragging');
            
            // Obtener datos del personaje desde el HTML o un dataset
            const personajeData = getCharacterDataFromElement(personajeElement);
            
            if (personajeData) {
                // Guardar datos en el dataTransfer
                e.dataTransfer.setData('personajeId', personajeData.id.toString());
                e.dataTransfer.setData('personajeData', JSON.stringify(personajeData));
                e.dataTransfer.effectAllowed = 'move';
                
                // Crear imagen de arrastre personalizada (opcional)
                createDragImage(e, personajeElement);
            } else {
                // Cancelar drag si no hay datos
                e.preventDefault();
            }
        });
        
        // Al terminar de arrastrar
        personajeElement.addEventListener('dragend', (e) => {
            // Quitar clase visual
            personajeElement.classList.remove('dragging');
            
            // Limpiar cualquier estado visual temporal
            document.querySelectorAll('.drag-hover').forEach(el => {
                el.classList.remove('drag-hover');
            });
        });
        
        // Evitar comportamiento por defecto en drag
        personajeElement.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        // Añadir doble clic para agregar al equipo
        personajeElement.addEventListener('dblclick', () => {
            const personajeData = getCharacterDataFromElement(personajeElement);
            if (personajeData) {
                team.addCharacterToFirstEmptySlot(personajeData);
            }
        });
    });
}

/**
 * Obtiene los datos del personaje desde su elemento DOM
 */
function getCharacterDataFromElement(elemento) {
    // Opción 1: Si guardas los datos en data attributes
    if (elemento.dataset.personaje) {
        try {
            return JSON.parse(elemento.dataset.personaje);
        } catch (e) {
            console.error('Error parsing personaje data:', e);
        }
    }
    
    // Opción 2: Buscar por nombre en la lista de personajes cargados
    const nombreElement = elemento.querySelector('h2');
    const personajes = store.getPersonajes();
    
    if (nombreElement && personajes.length > 0) {
        const nombre = nombreElement.textContent.trim();
        return personajes.find(p => p.nombre === nombre);
    }
    
    // Opción 3: Si tienes un ID en el elemento
    if (elemento.dataset.id) {
        return personajes.find(p => p.id.toString() === elemento.dataset.id);
    }
    
    console.error('No se pudieron obtener datos del personaje desde el elemento');
    return null;
}

/**
 * Crea una imagen personalizada para el arrastre (opcional)
 */
function createDragImage(event, elemento) {
    try {
        // Crear un canvas temporal para la imagen de arrastre
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Configurar tamaño
        canvas.width = 100;
        canvas.height = 120;
        
        // Fondo semi-transparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Obtener imagen del personaje
        const img = elemento.querySelector('.imagen-personaje');
        if (img && img.complete) {
            ctx.drawImage(img, 10, 10, 80, 80);
        }
        
        // Añadir texto
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const nombre = elemento.querySelector('h2')?.textContent || 'Personaje';
        ctx.fillText(nombre, canvas.width / 2, canvas.height - 10);
        
        // Convertir a imagen
        const dragImage = new Image();
        dragImage.src = canvas.toDataURL();
        
        // Usar como imagen de arrastre
        dragImage.onload = () => {
            event.dataTransfer.setDragImage(dragImage, 50, 60);
        };
        
    } catch (error) {
        // Si hay error, usar imagen por defecto
        console.warn('No se pudo crear imagen de arrastre personalizada:', error);
    }
}

/**
 * Añade feedback visual durante el drag
 */
function addDragAndDropStyles() {
    // Verificar si ya se han añadido los estilos
    if (document.getElementById('dragdrop-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'dragdrop-styles';
    style.textContent = `
        .personaje.dragging {
            opacity: 0.5;
            transform: rotate(5deg);
            transition: all 0.2s ease;
        }
        
        .team-slot.drag-hover {
            background-color: rgba(0, 255, 0, 0.2);
            border: 2px dashed #00ff00;
            transform: scale(1.05);
            transition: all 0.2s ease;
        }
        
        .personaje {
            cursor: grab;
            transition: transform 0.2s ease;
        }
        
        .personaje:hover {
            transform: translateY(-5px);
        }
        
        .personaje:active {
            cursor: grabbing;
        }
    `;
    
    document.head.appendChild(style);
}