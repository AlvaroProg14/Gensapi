// ui/messages.js - Mensajes y notificaciones

// Muestra mensajes temporales en la interfaz
export function showMessage(texto, isError = false) {
    // Eliminar mensajes anteriores
    const mensajesAnteriores = document.querySelectorAll('.mensaje-temporal');
    mensajesAnteriores.forEach(m => m.remove());
    
    // Crear nuevo mensaje
    const mensaje = document.createElement('div');
    mensaje.className = 'mensaje-temporal';
    if (isError) {
        mensaje.classList.add('error');
    } else {
        mensaje.classList.add('success');
    }
    mensaje.textContent = texto;
    document.body.appendChild(mensaje);
    
    // Añadir estilos si no existen
    ensureMessageStyles();
    
    // Animar entrada
    setTimeout(() => {
        mensaje.classList.add('visible');
    }, 10);
    
    // Animar salida
    setTimeout(() => {
        mensaje.classList.remove('visible');
        setTimeout(() => {
            mensaje.remove();
        }, 400);
    }, 3000);
}

// Muestra mensajes de guardado
export function showSaveMessage(message, type = 'info') {
    const messageContainer = document.getElementById('save-message');
    if (!messageContainer) return;

    messageContainer.className = `save-message ${type}`;
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';

    // Ocultar después de 5 segundos
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 5000);
}

// Muestra mensajes de confirmación
export function showConfirmation(message, onConfirm, onCancel = null) {
    // Verificar si ya existe un modal de confirmación
    if (document.getElementById('confirmation-modal')) {
        document.getElementById('confirmation-modal').remove();
    }
    
    // Crear modal de confirmación
    const modal = document.createElement('div');
    modal.id = 'confirmation-modal';
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-content">
                <p>${message}</p>
                <div class="modal-buttons">
                    <button id="confirm-btn" class="btn-confirm">Confirmar</button>
                    <button id="cancel-btn" class="btn-cancel">Cancelar</button>
                </div>
            </div>
        </div>
    `;
    
    // Añadir estilos si no existen
    ensureModalStyles();
    
    // Añadir a la página
    document.body.appendChild(modal);
    
    // Configurar eventos
    document.getElementById('confirm-btn').addEventListener('click', () => {
        onConfirm();
        modal.remove();
    });
    
    document.getElementById('cancel-btn').addEventListener('click', () => {
        if (onCancel) onCancel();
        modal.remove();
    });
    
    // Animación de entrada
    setTimeout(() => {
        modal.classList.add('visible');
    }, 10);
}

// Muestra mensajes de error críticos
export function showErrorScreen(title, message, actionText = 'Reintentar', actionCallback = () => window.location.reload()) {
    // Ocultar contenido principal
    document.querySelectorAll('main, .team-container, .controles, #personajes-container').forEach(el => {
        if (el) el.style.display = 'none';
    });
    
    // Crear pantalla de error
    const errorScreen = document.createElement('div');
    errorScreen.className = 'error-screen';
    
    errorScreen.innerHTML = `
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <h2>${title}</h2>
            <p>${message}</p>
            <button class="error-action">${actionText}</button>
        </div>
    `;
    
    // Añadir estilos si no existen
    ensureErrorStyles();
    
    // Añadir a la página
    document.body.appendChild(errorScreen);
    
    // Configurar evento
    errorScreen.querySelector('.error-action').addEventListener('click', actionCallback);
}

// Asegura que existan los estilos para los mensajes
function ensureMessageStyles() {
    if (document.getElementById('message-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'message-styles';
    style.textContent = `
        .mensaje-temporal {
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: #2ecc71;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            z-index: 10000;
            opacity: 0;
            transform: translateX(50px);
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            font-size: 14px;
            max-width: 300px;
            text-align: center;
        }
        
        .mensaje-temporal.visible {
            opacity: 1;
            transform: translateX(0);
        }
        
        .mensaje-temporal.error {
            background-color: #e74c3c;
        }
        
        .mensaje-temporal.success {
            background-color: #2ecc71;
        }
        
        @media (max-width: 600px) {
            .mensaje-temporal {
                max-width: 250px;
                font-size: 13px;
                padding: 8px 15px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Asegura que existan los estilos para los modales
function ensureModalStyles() {
    if (document.getElementById('modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .modal-overlay.visible {
            opacity: 1;
        }
        
        .modal-container {
            background-color: white;
            border-radius: 8px;
            padding: 24px;
            max-width: 90%;
            width: 400px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            transform: translateY(-20px);
            transition: transform 0.3s ease;
        }
        
        .modal-overlay.visible .modal-container {
            transform: translateY(0);
        }
        
        .modal-content p {
            margin-top: 0;
            font-size: 16px;
            color: #333;
        }
        
        .modal-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 20px;
        }
        
        .btn-confirm, .btn-cancel {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .btn-confirm {
            background-color: var(--color-azul-marino, #1a2a3a);
            color: white;
        }
        
        .btn-cancel {
            background-color: #e9ecef;
            color: #495057;
        }
        
        .btn-confirm:hover, .btn-cancel:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
    `;
    
    document.head.appendChild(style);
}

// Asegura que existan los estilos para la pantalla de error
function ensureErrorStyles() {
    if (document.getElementById('error-screen-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'error-screen-styles';
    style.textContent = `
        .error-screen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .error-container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 90%;
            width: 500px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .error-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        .error-container h2 {
            margin-top: 0;
            color: #dc3545;
            font-size: 24px;
        }
        
        .error-container p {
            margin-bottom: 30px;
            color: #495057;
            font-size: 16px;
            line-height: 1.5;
        }
        
        .error-action {
            padding: 10px 24px;
            background-color: var(--color-azul-marino, #1a2a3a);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .error-action:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
    `;
    
    document.head.appendChild(style);
}