//saveForm.js
// Función para añadir directamente el formulario de guardado
function añadirFormularioGuardado() {
    console.log("Añadiendo formulario de guardado directamente...");
    
    // Verificar si ya existe
    if (document.getElementById('save-team-container')) {
        console.log("El formulario ya existe");
        return;
    }
    
    // Verificar si el usuario está logueado
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    const isLoggedIn = token && userData;
    
    // Crear el contenedor
    const saveContainer = document.createElement('div');
    saveContainer.id = 'save-team-container';
    saveContainer.className = 'save-team-container';
    
    // HTML según estado de autenticación
    if (isLoggedIn) {
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
    
    // Añadir estilos si no existen
    if (!document.getElementById('save-team-styles')) {
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
                background: linear-gradient(135deg, #e0a9a9, #d4918f);
                color: white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
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
    
    // Insertar en el DOM
    const teamContainer = document.querySelector('.team-container');
    if (teamContainer) {
        teamContainer.parentNode.insertBefore(saveContainer, teamContainer.nextSibling);
        console.log("Formulario insertado después del team-container");
    } else {
        // Si no se encuentra el contenedor de equipo, añadir al final del body
        document.body.appendChild(saveContainer);
        console.log("Formulario añadido al final del body (no se encontró team-container)");
    }
    
    // Configurar eventos para los botones
    if (isLoggedIn) {
        // Botón para guardar equipo
        const saveBtn = document.getElementById('save-team-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', guardarEquipo);
            console.log("Evento configurado para botón de guardar");
        }
        
        // Botón para ir al perfil
        const loadBtn = document.getElementById('load-teams-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                window.location.href = '/perfil.html';
            });
        }
        
        // Botón para ver equipos públicos
        const publicBtn = document.getElementById('public-teams-btn');
        if (publicBtn) {
            publicBtn.addEventListener('click', () => {
                window.location.href = '/equipos.html';
            });
        }
    }
}

// Función simple para guardar equipo
function guardarEquipo() {
    console.log("Función guardarEquipo ejecutada");
    
    // Obtener datos del formulario
    const teamName = document.getElementById('team-name').value.trim();
    const teamDescription = document.getElementById('team-description').value.trim();
    const isPublic = document.getElementById('team-public').checked;
    
    // Validaciones básicas
    if (!teamName) {
        mostrarMensaje('Por favor ingresa un nombre para el equipo', true);
        return;
    }
    
    // Obtener personajes del equipo
    const charactersInTeam = [];
    
    for (let i = 1; i <= 4; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (slot && slot.classList.contains('filled')) {
            // Extraer información del personaje desde el slot
            const nombreEl = slot.querySelector('h2');
            if (!nombreEl) continue;
            
            const nombre = nombreEl.textContent;
            const elemento = slot.className.includes('pyro') ? 'pyro' :
                            slot.className.includes('hydro') ? 'hydro' :
                            slot.className.includes('cryo') ? 'cryo' :
                            slot.className.includes('electro') ? 'electro' :
                            slot.className.includes('anemo') ? 'anemo' :
                            slot.className.includes('geo') ? 'geo' :
                            slot.className.includes('dendro') ? 'dendro' : '';
            
            const iconoEl = slot.querySelector('.imagen-personaje');
            const icono = iconoEl ? iconoEl.src : '';
            
            // Intentar determinar rareza (muy simplificado)
            const rarezaEl = slot.querySelector('.rareza-icono');
            const rareza = rarezaEl && rarezaEl.src.includes('rareza5') ? 5 : 4;
            
            // Crear objeto de personaje
            charactersInTeam.push({
                characterId: String(Math.floor(Math.random() * 1000)), // ID aleatorio si no hay uno real
                characterName: nombre,
                characterElement: elemento,
                characterRarity: rareza,
                characterIcon: icono,
                characterRole: '', // No podemos determinar el rol fácilmente
                slot: i
            });
        }
    }
    
    if (charactersInTeam.length === 0) {
        mostrarMensaje('Añade al menos un personaje al equipo', true);
        return;
    }
    
    // Preparar datos para enviar
    const teamData = {
        name: teamName,
        description: teamDescription,
        characters: charactersInTeam,
        synergy: {
            elementalScore: 30,  // Valores básicos, idealmente calculados correctamente
            roleScore: 20,
            resonanceScore: 10,
            totalScore: 60,
            quality: "Equipo con buena sinergia",
            reactions: []
        },
        isPublic: isPublic
    };
    
    // Mostrar indicador de carga
    const saveBtn = document.getElementById('save-team-btn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';
    }
    
    // Enviar solicitud al servidor
    const token = localStorage.getItem('authToken');
    
    fetch('/api/teams', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teamData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Error al guardar el equipo');
            });
        }
        return response.json();
    })
    .then(result => {
        console.log('Equipo guardado:', result);
        mostrarMensaje('¡Equipo guardado exitosamente!');
        
        // Limpiar formulario
        document.getElementById('team-name').value = '';
        document.getElementById('team-description').value = '';
    })
    .catch(error => {
        console.error('Error guardando equipo:', error);
        mostrarMensaje(error.message || 'Error al guardar el equipo', true);
    })
    .finally(() => {
        // Restaurar botón
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar Equipo';
        }
    });
}

// Función para mostrar mensajes
function mostrarMensaje(texto, isError = false) {
    const messageContainer = document.getElementById('save-message');
    if (!messageContainer) return;

    messageContainer.className = `save-message ${isError ? 'error' : 'success'}`;
    messageContainer.textContent = texto;
    messageContainer.style.display = 'block';

    // Ocultar después de 5 segundos
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 5000);
}

// Intentar añadir el formulario cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que todos los elementos estén cargados
    setTimeout(añadirFormularioGuardado, 1000);
});

// También intentar añadir el formulario ahora mismo (en caso de que el DOM ya esté cargado)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(añadirFormularioGuardado, 500);
}
