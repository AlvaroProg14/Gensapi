// models/data.js - Constantes y definiciones del sistema

// Define las posibles reacciones elementales y sus puntuaciones
export const SINERGIA_ELEMENTAL = {
    // Reacciones multiplicadoras de daño
    VAPORIZE: { elementos: ['pyro', 'hydro'], puntuacion: 25 },
    MELT: { elementos: ['pyro', 'cryo'], puntuacion: 25 },
    
    // Reacciones de control o utilidad
    FROZEN: { elementos: ['hydro', 'cryo'], puntuacion: 20 },
    ELECTROCHARGED: { elementos: ['hydro', 'electro'], puntuacion: 18 },
    SWIRL: { elementos: ['anemo', '*'], puntuacion: 15 },
    CRYSTALLIZE: { elementos: ['geo', '*'], puntuacion: 12 },
    
    // Reacciones Dendro
    BLOOM: { elementos: ['dendro', 'hydro'], puntuacion: 20 },
    BURNING: { elementos: ['dendro', 'pyro'], puntuacion: 18 },
    QUICKEN: { elementos: ['dendro', 'electro'], puntuacion: 20 },
    
    // Otras reacciones
    OVERLOADED: { elementos: ['pyro', 'electro'], puntuacion: 15 },
    SUPERCONDUCT: { elementos: ['cryo', 'electro'], puntuacion: 15 }
};

// Define los niveles de calidad para sinergias elementales
export const CALIDAD_SINERGIA = {
    MALA: { max: 20, mensaje: "Baja sinergia elemental" },
    DECENTE: { min: 21, max: 40, mensaje: "Sinergia elemental decente" },
    BUENA: { min: 41, max: 60, mensaje: "Buena sinergia elemental" },
    EXCELENTE: { min: 61, mensaje: "Excelente composición elemental" }
};

// Define puntuaciones según la diversidad de roles en el equipo
export const PUNTUACION = {
    CUATRO_IGUALES: 5,        // 4 roles iguales
    TRES_IGUALES: 15,         // 3 roles iguales + 1 diferente
    DOS_PARES: 30,            // 2 de un rol, 2 de otro rol
    DOS_IGUALES_DOS_DISTINTOS: 40, // 2 de un rol + 2 roles distintos
    TODOS_DISTINTOS: 60       // 4 roles diferentes
};

// Define niveles de calidad general para el equipo
export const CALIDAD_EQUIPO = {
    MALO: { max: 29, mensaje: "Equipo de baja sinergia" },
    DECENTE: { min: 30, max: 59, mensaje: "Equipo con sinergia decente" },
    EXCELENTE: { min: 60, mensaje: "Equipo con excelente sinergia" }
};

// Información de elementos para UI
export const ELEMENTOS_INFO = {
    pyro: {
        nombre: "Pyro",
        color: "#ff6b35",
        iconoPath: "/img/Elemento_Pyro.webp"
    },
    hydro: {
        nombre: "Hydro",
        color: "#4fc3f7",
        iconoPath: "/img/Elemento_Hydro.webp"
    },
    cryo: {
        nombre: "Cryo",
        color: "#81d4fa",
        iconoPath: "/img/Elemento_Cryo.webp"
    },
    electro: {
        nombre: "Electro",
        color: "#9c27b0",
        iconoPath: "/img/Elemento_Electro.webp"
    },
    anemo: {
        nombre: "Anemo",
        color: "#4caf50",
        iconoPath: "/img/Elemento_Anemo.webp"
    },
    geo: {
        nombre: "Geo",
        color: "#ff9800",
        iconoPath: "/img/Elemento_Geo.webp"
    },
    dendro: {
        nombre: "Dendro",
        color: "#8bc34a",
        iconoPath: "/img/Elemento_Dendro.webp"
    }
};

// Información de resonancias elementales
export const RESONANCIAS = {
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
    },
    diversidad: {
        titulo: 'Resonancia Elemental - Versatilidad Defensiva',
        descripcion: 'Resistencia a todos los elementos +15%'
    }
};

// Información de reacciones elementales
export const REACCIONES_INFO = {
    'VAPORIZE': {
        nombre: "Vaporización",
        descripcion: "Multiplicador de daño (1.5x o 2x)"
    },
    'MELT': {
        nombre: "Derretido",
        descripcion: "Multiplicador de daño (1.5x o 2x)"
    },
    'FROZEN': {
        nombre: "Congelado",
        descripcion: "Inmoviliza enemigos"
    },
    'ELECTROCHARGED': {
        nombre: "Electrocargado",
        descripcion: "Daño DoT y salto entre enemigos"
    },
    'SWIRL': {
        nombre: "Torbellino",
        descripcion: "Propaga elementos y reduce RES elemental"
    },
    'CRYSTALLIZE': {
        nombre: "Cristalización",
        descripcion: "Genera escudos elementales"
    },
    'BLOOM': {
        nombre: "Florecimiento",
        descripcion: "Genera semillas Dendro"
    },
    'BURNING': {
        nombre: "Quemadura",
        descripcion: "Daño DoT de Pyro"
    },
    'QUICKEN': {
        nombre: "Aceleración",
        descripcion: "Prepara para Aggravate/Spread"
    },
    'OVERLOADED': {
        nombre: "Sobrecargado",
        descripcion: "Daño AoE y empuje"
    },
    'SUPERCONDUCT': {
        nombre: "Superconductor",
        descripcion: "Reduce DEF física"
    }
};

// Rutas a imágenes comunes
export const IMAGES = {
    rareza4: '/img/rareza4.png',
    rareza5: '/img/rareza5.png'
};

// Configuración de la aplicación
export const CONFIG = {
    dataUrl: '/data/gensupp.json',
    maxTeamSize: 4,
    autoSaveInterval: 300000 // 5 minutos
};