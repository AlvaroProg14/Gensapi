// utils/calculations.js - Cálculos de sinergia y calidad

import * as store from '../models/store.js';
import * as teamInfo from '../ui/teaminfo.js';
import { SINERGIA_ELEMENTAL, CALIDAD_SINERGIA, PUNTUACION, CALIDAD_EQUIPO } from '../models/data.js';

// Función que combina la verificación de resonancias y calidad
export function verifyResonancesAndQuality() {
    verifyResonances();
    calculateTotalScore();
}

// Verifica las resonancias elementales del equipo actual
export function verifyResonances() {
    // Contar elementos por tipo
    const contadorElementos = countElementsByType();
    
    // Contar personajes en equipo
    const contadorPersonajes = store.contarPersonajesEnEquipo();
    
    const resonanciaContainer = document.getElementById('resonancia-info');
    const resonanciaTitulo = document.getElementById('resonancia-titulo');
    const resonanciaDescripcion = document.getElementById('resonancia-descripcion');
    const resonanciaIcono = document.getElementById('resonancia-icono');
    
    // Ocultar si hay menos de 2 personajes
    if (contadorPersonajes < 2) {
        resonanciaContainer.style.display = 'none';
        return;
    }
    
    let resonanciasEncontradas = false;
    let elementosDiferentes = 0;
    
    // Verificar cada tipo de resonancia
    for (let elemento in contadorElementos) {
        if (contadorElementos[elemento] >= 2) {
            resonanciasEncontradas = true;
            
            // Obtener datos de resonancia
            const datosResonancia = getDatosResonancia(elemento);
            
            // Actualizar contenido
            resonanciaTitulo.textContent = datosResonancia.titulo;
            resonanciaDescripcion.textContent = datosResonancia.descripcion;
            resonanciaIcono.className = `resonancia-icono ${elemento}`;
            
            break; // Solo mostramos la primera resonancia
        }
        
        if (contadorElementos[elemento] > 0) {
            elementosDiferentes++;
        }
    }
    
    // Verificar resonancia de 4 elementos diferentes
    if (!resonanciasEncontradas && elementosDiferentes >= 4) {
        resonanciaTitulo.textContent = 'Resonancia Elemental - Versatilidad Defensiva';
        resonanciaDescripcion.textContent = 'Resistencia a todos los elementos +15%';
        resonanciaIcono.className = 'resonancia-icono';
        resonanciasEncontradas = true;
    }
    
    // Mostrar u ocultar según resultado
    resonanciaContainer.style.display = resonanciasEncontradas ? 'flex' : 'none';
    
    return resonanciasEncontradas;
}

// Cuenta los personajes por tipo de elemento
export function countElementsByType() {
    const contadorElementos = {
        pyro: 0, hydro: 0, cryo: 0, geo: 0, anemo: 0, electro: 0, dendro: 0
    };
    
    const equipoActual = store.getEquipoActual();
    
    for (let i = 1; i <= 4; i++) {
        if (equipoActual[`slot${i}`] && equipoActual[`slot${i}`].elemento) {
            contadorElementos[equipoActual[`slot${i}`].elemento]++;
        }
    }
    
    return contadorElementos;
}

// Obtiene los datos de texto para una resonancia elemental
export function getDatosResonancia(elemento) {
    const datos = {
        pyro: {
            titulo: 'Resonancia Pyro - Fervor Ardiente',
            descripcion: 'ATQ +25%. Afectado por Cryo por un 40% menos de tiempo.'
        },
        hydro: {
            titulo: 'Resonancia Hydro - Salpicadura Curativa',
            descripcion: 'Aumenta la curación de HP recibida un 30%. Afectado por Pyro por un 40% menos de tiempo.'
        },
        cryo: {
            titulo: 'Resonancia Cryo - Pasos Firmes',
            descripcion: 'CRIT Rate +15% contra enemigos congelados o afectados por Cryo. Afectado por Electro por un 40% menos de tiempo.'
        },
        geo: {
            titulo: 'Resonancia Geo - Inquebrantable',
            descripcion: 'Aumenta la resistencia a la interrupción. Al obtener un escudo, aumenta ATQ un 15% y el daño un 15%.'
        },
        anemo: {
            titulo: 'Resonancia Anemo - Velocidad Impulsiva',
            descripcion: 'Velocidad de movimiento +10%. Reducción de Stamina -15%. Afectado por Hydro un 40% menos de tiempo.'
        },
        electro: {
            titulo: 'Resonancia Electro - Conductor de Alta Energía',
            descripcion: 'Reacciones Electro-relacionadas generan un Elemental Orb (CD 5s). Afectado por Hydro por un 40% menos de tiempo.'
        },
        dendro: {
            titulo: 'Resonancia Dendro - Vitalidad Floreciente',
            descripcion: 'Maestría Elemental +50. Tras reacciones Dendro, Maestría Elemental +30 por 6s (máx 4 stacks).'
        }
    };
    
    return datos[elemento] || { titulo: '', descripcion: '' };
}

// Evalúa la diversidad de roles en el equipo
export function calculateRoleDiversity() {
    // Contar roles por tipo
    const contadorRoles = {};
    let personajesEnEquipo = 0;
    
    const equipoActual = store.getEquipoActual();
    
    for (let i = 1; i <= 4; i++) {
        if (equipoActual[`slot${i}`] && equipoActual[`slot${i}`].funcion) {
            personajesEnEquipo++;
            const rol = equipoActual[`slot${i}`].funcion;
            contadorRoles[rol] = (contadorRoles[rol] || 0) + 1;
        }
    }
    
    // Si no hay 4 personajes, no hay puntuación completa
    if (personajesEnEquipo < 4) return 0;
    
    // Analizar distribución de roles
    const distribucionRoles = Object.values(contadorRoles);
    
    // Determinar puntuación según distribución
    if (distribucionRoles.length === 1) return PUNTUACION.CUATRO_IGUALES;
    if (distribucionRoles.length === 2) {
        return distribucionRoles.includes(3) ? PUNTUACION.TRES_IGUALES : PUNTUACION.DOS_PARES;
    }
    if (distribucionRoles.length === 3) return PUNTUACION.DOS_IGUALES_DOS_DISTINTOS;
    return PUNTUACION.TODOS_DISTINTOS;
}

// Calcula puntuación adicional por tener resonancia
export function calculateResonanceScore() {
    const resonanciaContainer = document.getElementById('resonancia-info');
    return resonanciaContainer.style.display !== 'none' ? 10 : 0;
}

// Calcula la sinergia elemental entre los personajes del equipo
export function calculateElementalSynergy() {
    // Obtener elementos presentes
    const elementosEquipo = getElementsInTeam();
    
    // Si hay menos de 2 elementos, no hay sinergia
    if (elementosEquipo.length < 2) {
        return { puntuacion: 0, reacciones: [], equipoCompleto: false };
    }
    
    // Verificar si todos son iguales
    const todosIguales = elementosEquipo.length === 4 && 
                         elementosEquipo.every(elem => elem === elementosEquipo[0]);
    
    // Calcular puntuación y reacciones
    const { puntuacion, reacciones } = calculateElementalReactions(elementosEquipo);
    
    // Bonus por diversidad elemental
    const elementosUnicos = new Set(elementosEquipo).size;
    const bonusDiversidad = elementosUnicos >= 3 ? (elementosUnicos - 2) * 5 : 0;
    
    return {
        puntuacion: puntuacion + bonusDiversidad,
        reacciones: reacciones,
        elementoUnico: todosIguales ? elementosEquipo[0] : null,
        equipoCompleto: elementosEquipo.length === 4
    };
}

// Obtiene lista de elementos presentes en el equipo
export function getElementsInTeam() {
    const elementos = [];
    const equipoActual = store.getEquipoActual();
    
    for (let i = 1; i <= 4; i++) {
        if (equipoActual[`slot${i}`] && equipoActual[`slot${i}`].elemento) {
            elementos.push(equipoActual[`slot${i}`].elemento);
        }
    }
    
    return elementos;
}

// Calcula las reacciones elementales y su puntuación
export function calculateElementalReactions(elementosEquipo) {
    let puntuacion = 0;
    let reacciones = [];
    
    // Verificar cada reacción posible
    for (const reaccion in SINERGIA_ELEMENTAL) {
        const { elementos, puntuacion: puntosReaccion } = SINERGIA_ELEMENTAL[reaccion];
        
        // Caso especial para Anemo y Geo
        if (elementos[1] === '*') {
            const elementoPrincipal = elementos[0]; // anemo o geo
            
            if (elementosEquipo.includes(elementoPrincipal)) {
                // Elementos que no sean anemo o geo
                const elementosReactivos = elementosEquipo.filter(elem => 
                    elem !== 'anemo' && elem !== 'geo'
                );
                
                if (elementosReactivos.length > 0) {
                    puntuacion += puntosReaccion;
                    reacciones.push(reaccion);
                }
            }
        } else {
            // Reacciones normales entre dos elementos
            const [elemento1, elemento2] = elementos;
            
            if (elementosEquipo.includes(elemento1) && elementosEquipo.includes(elemento2)) {
                puntuacion += puntosReaccion;
                reacciones.push(reaccion);
            }
        }
    }
    
    return { puntuacion, reacciones };
}

// Calcula la puntuación total del equipo
export function calculateTotalScore() {
    // Verificar equipo completo
    const contadorPersonajes = store.contarPersonajesEnEquipo();
    const equipoCompleto = contadorPersonajes === 4;
    
    // Si el equipo no está completo
    if (!equipoCompleto) {
        teamInfo.showTeamQuality(0, "Equipo incompleto");
        
        // Mostrar sinergia si hay al menos 2 personajes
        if (contadorPersonajes >= 2) {
            const sinergiaData = calculateElementalSynergy();
            teamInfo.showElementalSynergy(sinergiaData);
        } else {
            // Ocultar sinergia con menos de 2 personajes
            const sinergiaContainer = document.getElementById('sinergia-info');
            if (sinergiaContainer) {
                sinergiaContainer.style.display = 'none';
            }
        }
        
        return;
    }
    
    // Cálculo de puntuaciones para equipo completo
    const puntuacionRoles = calculateRoleDiversity();
    const puntuacionResonancia = calculateResonanceScore();
    const sinergiaData = calculateElementalSynergy();
    const puntuacionSinergia = sinergiaData.puntuacion;
    
    // Puntuación total
    const puntuacionTotal = puntuacionRoles + puntuacionResonancia + puntuacionSinergia;
    
    // Calcular calidad según porcentaje
    const MAX_PUNTUACION = PUNTUACION.TODOS_DISTINTOS + 10 + 70; // Máxima posible
    const porcentajeCalidad = (puntuacionTotal / MAX_PUNTUACION) * 100;
    
    let mensaje = determineQualityMessage(porcentajeCalidad);
    
    // Mostrar puntuación y mensajes
    teamInfo.showTeamQuality(puntuacionTotal, mensaje);
    teamInfo.showElementalSynergy(sinergiaData);
    
    return puntuacionTotal;
}

// Determina el mensaje de calidad según el porcentaje
export function determineQualityMessage(porcentaje) {
    if (porcentaje < 40) return "Equipo con baja sinergia general";
    if (porcentaje < 70) return "Equipo con sinergia decente";
    if (porcentaje < 85) return "Equipo con buena sinergia";
    return "Equipo con excelente sinergia";
}

// Obtiene la calidad de sinergia
export function getSynergyQuality(puntuacion, elementoUnico, equipoCompleto) {
    let calidadMensaje = "";
    let claseCalidad = "";
    
    // Caso especial: todos del mismo elemento
    if (elementoUnico && equipoCompleto) {
        return {
            calidadMensaje: "Sinergia nula: todos los personajes son del mismo elemento",
            claseCalidad: "sinergia-baja"
        };
    }
    
    // Casos normales según puntuación
    if (puntuacion <= CALIDAD_SINERGIA.MALA.max) {
        calidadMensaje = CALIDAD_SINERGIA.MALA.mensaje;
        claseCalidad = "sinergia-baja";
    } else if (puntuacion >= CALIDAD_SINERGIA.DECENTE.min && puntuacion <= CALIDAD_SINERGIA.DECENTE.max) {
        calidadMensaje = CALIDAD_SINERGIA.DECENTE.mensaje;
        claseCalidad = "sinergia-decente";
    } else if (puntuacion >= CALIDAD_SINERGIA.BUENA.min && puntuacion <= CALIDAD_SINERGIA.BUENA.max) {
        calidadMensaje = CALIDAD_SINERGIA.BUENA.mensaje;
        claseCalidad = "sinergia-buena";
    } else {
        calidadMensaje = CALIDAD_SINERGIA.EXCELENTE.mensaje;
        claseCalidad = "sinergia-excelente";
    }
    
    return { calidadMensaje, claseCalidad };
}

// Obtiene el nombre formateado y descripción de una reacción
export function getReactionData(reaccion) {
    const nombre = reaccion.charAt(0).toUpperCase() + reaccion.slice(1).toLowerCase();
    
    const descripciones = {
        'VAPORIZE': "Multiplicador de daño (1.5x o 2x)",
        'MELT': "Multiplicador de daño (1.5x o 2x)",
        'FROZEN': "Inmoviliza enemigos",
        'ELECTROCHARGED': "Daño DoT y salto entre enemigos",
        'SWIRL': "Propaga elementos y reduce RES elemental",
        'CRYSTALLIZE': "Genera escudos elementales",
        'BLOOM': "Genera semillas Dendro",
        'BURNING': "Daño DoT de Pyro",
        'QUICKEN': "Prepara para Aggravate/Spread",
        'OVERLOADED': "Daño AoE y empuje",
        'SUPERCONDUCT': "Reduce DEF física"
    };
    
    return {
        nombre,
        descripcion: descripciones[reaccion] || ""
    };
}