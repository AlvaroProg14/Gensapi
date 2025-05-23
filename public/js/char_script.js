/**
 * personaje_script.js - Script para la página de detalles de personaje
 * Carga y renderiza información de personajes basado en el ID de la URL
 */

// Objeto principal para los datos globales
const PersonajeApp = {
    // Almacenamiento de datos
    datos: {
        personaje: null,
        artefactos: []
    },
    
    // Inicializar la aplicación
    inicializar() {
        document.addEventListener('DOMContentLoaded', () => {
            // Iniciar la autenticación
            Auth.inicializar();
            
            // Añadir estilos CSS para tooltips
            this.agregarEstilosTooltip();
            
            // Cargar datos del personaje desde URL
            this.cargarPersonajePorId();
        });
    },
    
    // Agregar estilos CSS para tooltips
    agregarEstilosTooltip() {
        const style = document.createElement('style');
        style.textContent = `
            /* Estilos para tooltips de artefactos */
            .artifact-tooltip {
                position: relative;
                cursor: pointer;
            }
            
            .tooltip-content {
                display: none;
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(50, 50, 50, 0.95);
                color: white;
                padding: 12px;
                border-radius: 8px;
                min-width: 280px;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                pointer-events: none;
                transition: opacity 0.3s;
                font-size: 0.9rem;
            }
            
            .artifact-tooltip:hover .tooltip-content {
                display: block;
                animation: fadeIn 0.3s forwards;
            }
            
            .tooltip-title {
                font-weight: bold;
                margin-bottom: 8px;
                padding-bottom: 5px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                text-align: center;
                color: #ffcc80;
            }
            
            .tooltip-effect {
                margin-bottom: 8px;
                line-height: 1.4;
            }
            
            .tooltip-effect-label {
                color: #81c784;
                font-weight: bold;
            }
            
            .second-artifact {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid rgba(200, 200, 200, 0.3);
            }
            
            @keyframes fadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
    },
    
    // Obtener ID del personaje desde URL y cargar sus datos
    cargarPersonajePorId() {
        const urlParams = new URLSearchParams(window.location.search);
        const personajeId = urlParams.get('id');
        
        if (!personajeId) {
            this.mostrarError('No se especificó un ID de personaje en la URL');
            return;
        }
        
        this.cargarDatos(personajeId);
    },
    
    // Cargar datos desde el archivo JSON
    cargarDatos(personajeId) {
        fetch('/data/gensupp.json')
            .then(response => {
                if (!response.ok) throw new Error('No se pudo cargar el archivo JSON');
                return response.json();
            })
            .then(data => {
                if (!data.Personajes || !Array.isArray(data.Personajes)) {
                    throw new Error('Formato JSON inválido: no contiene array de Personajes');
                }
                
                // Almacenar artefactos para uso posterior
                this.datos.artefactos = data.Artefactos || [];
                
                // Buscar personaje por ID
                const personaje = data.Personajes.find(p => p.id == personajeId);
                
                if (!personaje) {
                    throw new Error(`No se encontró personaje con ID ${personajeId}`);
                }
                
                this.datos.personaje = personaje;
                
                // Renderizar datos y actualizar título
                this.renderizarPersonaje();
                document.title = personaje.nombre;
            })
            .catch(error => this.mostrarError(error.message));
    },
    
    // Renderizar todos los elementos del personaje
    renderizarPersonaje() {
        const personaje = this.datos.personaje;
        
        // Renderizar cada sección
        this.renderizarInfoBasica();
        this.renderizarMaterialAscenso();
        this.renderizarArtefactos();
        this.renderizarTalentos();
        this.renderizarConstelaciones();
    },
    
    // Renderizar información básica del personaje
    renderizarInfoBasica() {
        const personaje = this.datos.personaje;
        
        // Elementos HTML básicos
        document.getElementById('character-image').src = personaje.imagen;
        document.getElementById('character-name').textContent = personaje.nombre;
        document.getElementById('character-element').textContent = this.formatearElemento(personaje.elemento);
        document.getElementById('character-weapon').textContent = this.capitalizarPrimeraLetra(personaje.arma);
        document.getElementById('character-function').textContent = this.formatearFuncion(personaje.funcion);
        document.getElementById('character-date').textContent = personaje.fechasalida;
        
        // Imagen del elemento
        document.getElementById('element-image').src = `/img/Elemento_${personaje.elemento.charAt(0).toUpperCase() + personaje.elemento.slice(1)}.webp`;
        
        // Renderizar estrellas de rareza
        this.renderizarEstrellas(personaje.rareza);
    },
    
    // Renderizar estrellas de rareza
    renderizarEstrellas(rareza) {
        const container = document.getElementById('rarity-display');
        container.innerHTML = '';
        
        for (let i = 0; i < rareza; i++) {
            const estrella = document.createElement('span');
            estrella.className = 'star';
            estrella.innerHTML = '★';
            container.appendChild(estrella);
        }
    },
    
    // Renderizar material de ascenso
    renderizarMaterialAscenso() {
        const personaje = this.datos.personaje;
        
        if (!personaje.ascenso) {
            document.getElementById('ascension-name').textContent = "No disponible";
            return;
        }
        
        document.getElementById('ascension-image').src = personaje.ascenso;
        document.getElementById('ascension-name').textContent = this.extraerNombreMaterial(personaje.ascenso);
    },
    
    // Renderizar artefactos recomendados
    renderizarArtefactos() {
        const personaje = this.datos.personaje;
        
        if (!personaje.artefacto) {
            document.getElementById('artifacts-wrapper').innerHTML = '<span>No disponible</span>';
            return;
        }
        
        const container = document.getElementById('artifacts-wrapper');
        container.innerHTML = '';
        
        // Verificar si hay múltiples artefactos (separados por guion)
        const nombresArtefactos = personaje.artefacto.split('-').map(nombre => nombre.trim());
        
        // Actualizar etiqueta según cantidad de artefactos
        const infoLabel = document.querySelector('#artifact-container .info-label');
        if (infoLabel) {
            infoLabel.textContent = nombresArtefactos.length > 1 
                ? "Artefactos Recomendados" 
                : "Artefacto Recomendado";
        }
        
        // Procesar cada artefacto
        nombresArtefactos.forEach((nombreArtefacto, index) => {
            this.renderizarArtefactoIndividual(container, nombreArtefacto, index, nombresArtefactos.length);
        });
    },
    
    // Renderizar un artefacto individual
    renderizarArtefactoIndividual(container, nombreArtefacto, index, total) {
        // Buscar el artefacto en los datos con coincidencia flexible
        const artefacto = this.buscarArtefactoFlexible(nombreArtefacto);
        
        // Crear contenedor para el artefacto
        const artefactoContainer = document.createElement('div');
        artefactoContainer.className = 'artifact-container';
        
        // Si hay múltiples artefactos y no es el primero, añadir clase para estilo
        if (total > 1 && index > 0) {
            artefactoContainer.classList.add('second-artifact');
        }
        
        if (artefacto) {
            // Crear elementos para artefacto encontrado
            const artifactImg = document.createElement('img');
            artifactImg.className = 'artifact-image';
            artifactImg.src = artefacto.artefimg;
            artifactImg.alt = `Imagen de ${artefacto.set}`;
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = artefacto.set;
            nameSpan.className = 'info-value';
            nameSpan.style.marginLeft = '10px';
            
            artefactoContainer.appendChild(artifactImg);
            artefactoContainer.appendChild(nameSpan);
            
            // Crear tooltip con información detallada
            this.crearTooltipArtefacto(artefactoContainer, artefacto);
        } else {
            // Para artefacto no encontrado
            const placeholderDiv = document.createElement('div');
            placeholderDiv.className = 'artifact-image-placeholder';
            placeholderDiv.style.width = '40px';
            placeholderDiv.style.height = '40px';
            placeholderDiv.style.backgroundColor = '#f0f0f0';
            placeholderDiv.style.borderRadius = '50%';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = nombreArtefacto + " (No encontrado)";
            nameSpan.className = 'info-value';
            nameSpan.style.marginLeft = '10px';
            
            artefactoContainer.appendChild(placeholderDiv);
            artefactoContainer.appendChild(nameSpan);
        }
        
        container.appendChild(artefactoContainer);
    },
    
    // Buscar artefacto con coincidencia flexible
    buscarArtefactoFlexible(nombreBuscado) {
        if (!this.datos.artefactos || !nombreBuscado) return null;
        
        // 1. Buscar coincidencia exacta (insensible a mayúsculas/minúsculas)
        let artefacto = this.datos.artefactos.find(a => 
            a.set.toLowerCase() === nombreBuscado.toLowerCase()
        );
        
        // 2. Si no hay coincidencia exacta, buscar por coincidencia parcial
        if (!artefacto) {
            artefacto = this.datos.artefactos.find(a => 
                this.nombresSimilares(a.set, nombreBuscado)
            );
        }
        
        return artefacto;
    },
    
    // Comparar si dos nombres de artefactos son similares
    nombresSimilares(a, b) {
        if (!a || !b) return false;
        
        // Normalizar para comparación
        const normalizarTexto = texto => texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
            .replace(/[^a-z0-9]/g, '');       // Eliminar caracteres especiales
        
        const textoA = normalizarTexto(a);
        const textoB = normalizarTexto(b);
        
        // Verificar si una cadena contiene a la otra o viceversa
        return textoA.includes(textoB) || textoB.includes(textoA);
    },
    
    // Crear tooltip para mostrar información del artefacto al pasar el ratón
    crearTooltipArtefacto(contenedor, artefacto) {
        contenedor.classList.add('artifact-tooltip');
        
        const tooltipContent = document.createElement('div');
        tooltipContent.className = 'tooltip-content';
        
        // Título del tooltip
        const tooltipTitle = document.createElement('div');
        tooltipTitle.className = 'tooltip-title';
        tooltipTitle.textContent = artefacto.set;
        tooltipContent.appendChild(tooltipTitle);
        
        // Efecto de 2 piezas
        if (artefacto['2piezas']) {
            const effect2p = document.createElement('div');
            effect2p.className = 'tooltip-effect';
            effect2p.innerHTML = '<span class="tooltip-effect-label">2 piezas:</span> ' + artefacto['2piezas'];
            tooltipContent.appendChild(effect2p);
        }
        
        // Efecto de 4 piezas
        if (artefacto['4piezas']) {
            const effect4p = document.createElement('div');
            effect4p.className = 'tooltip-effect';
            effect4p.innerHTML = '<span class="tooltip-effect-label">4 piezas:</span> ' + artefacto['4piezas'];
            tooltipContent.appendChild(effect4p);
        }
        
        contenedor.appendChild(tooltipContent);
    },
    
    // Renderizar talentos del personaje
    renderizarTalentos() {
        const personaje = this.datos.personaje;
        
        // Renderizar cada talento
        this.renderizarTalento('talent1-container', personaje.talento1, personaje.media1);
        this.renderizarTalento('talent2-container', personaje.talento2, personaje.media2);
        this.renderizarTalento('talent3-container', personaje.talento3, personaje.media3);
    },
    
    // Renderizar un talento específico
    renderizarTalento(containerId, descripcion, mediaUrl) {
        if (!descripcion) return;
        
        const container = document.getElementById(containerId);
        
        // Crear estructura HTML para el talento
        const talentoHTML = `
            <div class="talent-media">
                <img src="${mediaUrl}" alt="Demostración" class="talent-gif">
            </div>
            <div class="talent-description">
                <p>${descripcion.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        
        container.innerHTML = talentoHTML;
    },
    
    // Renderizar constelaciones del personaje
    renderizarConstelaciones() {
        const personaje = this.datos.personaje;
        const container = document.getElementById('constellations-container');
        container.innerHTML = '';
        
        // Crear elementos para cada constelación
        for (let i = 1; i <= 6; i++) {
            const constelacion = personaje[`constelacion${i}`];
            
            if (!constelacion) continue;
            
            const constelacionDiv = document.createElement('div');
            constelacionDiv.className = 'constellation-item';
            
            constelacionDiv.innerHTML = `
                <div class="constellation-number">C${i}</div>
                <div class="constellation-content">
                    <h3>Constelación ${i}</h3>
                    <p>${constelacion.replace(/\n/g, '<br>')}</p>
                </div>
            `;
            
            container.appendChild(constelacionDiv);
        }
    },
    
    // Utilitario: Extraer nombre de material desde ruta de imagen
    extraerNombreMaterial(ruta) {
        if (!ruta) return "Desconocido";
        
        try {
            const nombreArchivo = ruta.split('/').pop();
            const nombreSinExtension = nombreArchivo.split('.')[0];
            return nombreSinExtension.replace('Item_', '').replace(/_/g, ' ').trim();
        } catch (error) {
            return "Material de ascenso";
        }
    },
    
    // Utilitario: Formatear nombre de elemento
    formatearElemento(elemento) {
        const elementos = {
            "pyro": "Pyro (Fuego)",
            "hydro": "Hydro (Agua)",
            "anemo": "Anemo (Viento)",
            "electro": "Electro",
            "dendro": "Dendro (Planta)",
            "cryo": "Cryo (Hielo)",
            "geo": "Geo (Tierra)"
        };
        
        return elementos[elemento] || this.capitalizarPrimeraLetra(elemento);
    },
    
    // Utilitario: Formatear función del personaje
    formatearFuncion(funcion) {
        const funciones = {
            "dps": "DPS Principal",
            "support": "Apoyo",
            "healer": "Sanador",
            "subdps": "DPS Secundario",
            "shield": "Escudo"
        };
        
        return funciones[funcion] || this.capitalizarPrimeraLetra(funcion);
    },
    
    // Utilitario: Capitalizar primera letra
    capitalizarPrimeraLetra(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    },
    
    // Mostrar error en caso de fallos
    mostrarError(mensaje) {
        const container = document.querySelector('.character-container');
        if (container) {
            container.innerHTML = `
                <div class="error-mensaje">
                    <h3>Error al cargar datos</h3>
                    <p>${mensaje}</p>
                    <button onclick="location.reload()">Reintentar</button>
                </div>
            `;
        } else {
            alert(`Error: ${mensaje}`);
        }
    }
};

// Módulo de autenticación y gestión de sesión
const Auth = {
    // Inicializar autenticación
    inicializar() {
        this.actualizarHeader();
        
        // Escuchar cambios en localStorage (para sincronizar entre tabs)
        window.addEventListener('storage', e => {
            if (e.key === 'authToken' || e.key === 'currentUser') {
                this.actualizarHeader();
            }
        });
    },
    
    // Actualizar header según estado de autenticación
    async actualizarHeader() {
        const authLink = document.querySelector('nav ul li:last-child a');
        if (!authLink) return;
        
        try {
            // Verificar si hay token guardado
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('currentUser');
            
            if (!token || !userData) {
                this.mostrarEnlaceLogin(authLink);
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
                const result = await response.json();
                this.mostrarPerfilUsuario(authLink, result.user);
            } else {
                this.cerrarSesion();
            }
        } catch (error) {
            this.mostrarEnlaceLogin(authLink);
        }
    },
    
    // Mostrar enlace de login
    mostrarEnlaceLogin(enlace) {
        enlace.textContent = 'Inicio de sesión';
        enlace.href = '/sesion.html';
        enlace.title = 'Iniciar sesión en GENSAPI';
        
        enlace.classList.remove('user-profile-link');
        enlace.classList.add('login-link');
    },
    
    // Mostrar perfil de usuario
    mostrarPerfilUsuario(enlace, usuario) {
        const nombreUsuario = usuario.username || usuario.name || 'Usuario';
        
        enlace.textContent = `👤 ${nombreUsuario}`;
        enlace.href = '/perfil.html';
        enlace.title = `Perfil de ${nombreUsuario}`;
        
        enlace.classList.remove('login-link');
        enlace.classList.add('user-profile-link');
    },
    
    // Cerrar sesión
    cerrarSesion() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.actualizarHeader();
        this.mostrarMensaje('Sesión cerrada correctamente');
    },
    
    // Mostrar mensaje flotante
    mostrarMensaje(mensaje, esError = false) {
        let contenedor = document.getElementById('global-message');
        
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'global-message';
            contenedor.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 9999;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                max-width: 300px;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                ${esError ? 
                    'background: linear-gradient(135deg, #ff4757, #ff3742);' : 
                    'background: linear-gradient(135deg, #2ed573, #1dd1a1);'
                }
            `;
            document.body.appendChild(contenedor);
        }
        
        contenedor.textContent = mensaje;
        contenedor.style.background = esError ? 
            'linear-gradient(135deg, #ff4757, #ff3742)' : 
            'linear-gradient(135deg, #2ed573, #1dd1a1)';
        
        // Mostrar
        setTimeout(() => {
            contenedor.style.transform = 'translateX(0)';
        }, 100);
        
        // Ocultar
        setTimeout(() => {
            contenedor.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (contenedor.parentNode) {
                    contenedor.parentNode.removeChild(contenedor);
                }
            }, 300);
        }, 3000);
    }
};

// Exportar funciones necesarias a window para uso externo
window.logout = Auth.cerrarSesion.bind(Auth);
window.showMessage = Auth.mostrarMensaje.bind(Auth);

// Iniciar la aplicación
PersonajeApp.inicializar();