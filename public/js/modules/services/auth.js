// services/auth.js - Autenticación y gestión de sesiones

import * as messages from '../ui/messages.js';
import * as api from './api.js';

// Función principal para actualizar el header
export async function updateHeaderAuth() {
    const authLink = document.querySelector('nav ul li:last-child a');
    
    if (!authLink) {
        console.warn('No se encontró el enlace de autenticación en el header');
        return;
    }

    try {
        // Verificar si hay token guardado
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('currentUser');
        
        if (!token || !userData) {
            // No hay sesión - mostrar "Inicio de sesión"
            showLoginLink(authLink);
            return;
        }

        // Verificar si el token es válido
        const response = await fetch('/api/verify-token', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Token válido - mostrar nombre de usuario
            const result = await response.json();
            showUserProfile(authLink, result.user);
        } else {
            // Token inválido - limpiar y mostrar login
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            showLoginLink(authLink);
        }

    } catch (error) {
        console.error('Error verificando autenticación:', error);
        // En caso de error, mostrar opción de login
        showLoginLink(authLink);
    }
}

// Mostrar enlace de "Inicio de sesión"
function showLoginLink(authLink) {
    authLink.textContent = 'Inicio de sesión';
    authLink.href = '/sesion.html';
    authLink.title = 'Iniciar sesión en GENSAPI';
    
    // Remover clases de usuario si existen
    authLink.classList.remove('user-profile-link');
    authLink.classList.add('login-link');
}

// Mostrar perfil de usuario
function showUserProfile(authLink, user) {
    const username = user.username || user.name || 'Usuario';
    
    authLink.textContent = `👤 ${username}`;
    authLink.href = '/perfil.html';
    authLink.title = `Perfil de ${username}`;
    
    // Añadir clases para styling
    authLink.classList.remove('login-link');
    authLink.classList.add('user-profile-link');
}

// Función para verificar si el usuario está autenticado
export function isUserLoggedIn() {
    const token = localStorage.getItem('authToken');
    return !!token;
}

// Función para obtener datos del usuario actual
export function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Función para cerrar sesión
export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Actualizar header
    updateHeaderAuth();
    
    // Mostrar mensaje
    messages.showMessage('Sesión cerrada correctamente');
    
    // Redirigir a login si es necesario
    setTimeout(() => {
        window.location.href = '/sesion.html';
    }, 1500);
}

// Añadir estilos para el header dinámico
function addHeaderStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('header-auth-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'header-auth-styles';
    style.textContent = `
        /* Estilos para el header dinámico */
        .user-profile-link {
            background: linear-gradient(135deg, #e0a9a9, #d4918f) !important;
            color: white !important;
            border-radius: 20px !important;
            padding: 8px 16px !important;
            transition: all 0.3s ease !important;
            font-weight: 600 !important;
        }
        
        .user-profile-link:hover {
            background: linear-gradient(135deg, #d4918f, #c8827e) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(224, 169, 169, 0.4) !important;
        }
        
        .login-link {
            transition: all 0.3s ease !important;
        }
        
        .login-link:hover {
            background-color: var(--color-oro-rosa, #e0a9a9) !important;
        }
        
        /* Animación para cambios en el header */
        nav ul li:last-child a {
            transition: all 0.3s ease !important;
        }
    `;
    
    document.head.appendChild(style);
}

// Función de inicialización
export function initHeaderAuth() {
    // Añadir estilos
    addHeaderStyles();
    
    // Actualizar header
    updateHeaderAuth();
    
    // Escuchar cambios en localStorage (para sincronizar entre tabs)
    window.addEventListener('storage', function(e) {
        if (e.key === 'authToken' || e.key === 'currentUser') {
            updateHeaderAuth();
        }
    });
    
    // Configurar botones de logout si existen
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', logout);
    });
}