//equipos.js
        // Variables globales
        let currentPage = 1;
        let teamsPerPage = 12;
        let totalTeams = 0;
        let totalPages = 0;
        let currentFilters = {
            search: '',
            sort: 'likes',
            scoreFilter: ''
        };
        let isLoading = false;
        let currentUser = null;

        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            initializePage();
        });

        // Inicializar página
        async function initializePage() {
            // Verificar usuario logueado
            await checkUserAuth();
            
            // Configurar event listeners
            setupEventListeners();
            
            // Cargar equipos iniciales
            await loadTeams();
        }

        // Verificar autenticación del usuario
        async function checkUserAuth() {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('currentUser');
            
            if (token && userData) {
                try {
                    const response = await fetch('/api/verify-token', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const result = await response.json();
                        currentUser = result.user;
                    } else {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('currentUser');
                    }
                } catch (error) {
                    console.error('Error verificando autenticación:', error);
                }
            }
        }

        // Configurar event listeners
        function setupEventListeners() {
            // Búsqueda
            const searchInput = document.getElementById('search-input');
            let searchTimeout;
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    currentFilters.search = this.value.trim();
                    currentPage = 1;
                    loadTeams();
                }, 500);
            });

            // Ordenamiento
            document.getElementById('sort-select').addEventListener('change', function() {
                currentFilters.sort = this.value;
                currentPage = 1;
                loadTeams();
            });

            // Filtro de puntuación
            document.getElementById('score-filter').addEventListener('change', function() {
                currentFilters.scoreFilter = this.value;
                currentPage = 1;
                loadTeams();
            });

            // Resetear filtros
            document.getElementById('reset-filters').addEventListener('click', function() {
                document.getElementById('search-input').value = '';
                document.getElementById('sort-select').value = 'likes';
                document.getElementById('score-filter').value = '';
                
                currentFilters = {
                    search: '',
                    sort: 'likes',
                    scoreFilter: ''
                };
                currentPage = 1;
                loadTeams();
            });

            // Paginación
            document.getElementById('prev-page').addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    loadTeams();
                }
            });

            document.getElementById('next-page').addEventListener('click', function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    loadTeams();
                }
            });
        }

        // Cargar equipos desde la API
        async function loadTeams() {
            if (isLoading) return;
            
            isLoading = true;
            showLoading(true);
            hideNoTeamsMessage();

            try {
                // Construir URL con parámetros
                const params = new URLSearchParams({
                    page: currentPage,
                    limit: teamsPerPage,
                    sort: currentFilters.sort
                });

                if (currentFilters.search) {
                    params.append('search', currentFilters.search);
                }

                if (currentFilters.scoreFilter) {
                    params.append('minScore', currentFilters.scoreFilter);
                }

                // Headers para la petición
                const headers = { 'Content-Type': 'application/json' };
                if (currentUser) {
                    headers['Authorization'] = `Bearer ${localStorage.getItem('authToken')}`;
                }

                const response = await fetch(`/api/teams/public?${params}`, {
                    method: 'GET',
                    headers: headers
                });

                const result = await response.json();

                if (response.ok) {
                    displayTeams(result.teams);
                    updatePagination(result.pagination);
                } else {
                    throw new Error(result.error || 'Error al cargar equipos');
                }

            } catch (error) {
                console.error('Error cargando equipos:', error);
                showToast('Error al cargar equipos. Intenta de nuevo.', 'error');
                showNoTeamsMessage();
            } finally {
                isLoading = false;
                showLoading(false);
            }
        }

        // Mostrar equipos en el grid
        function displayTeams(teams) {
            const grid = document.getElementById('teams-grid');
            
            if (!teams || teams.length === 0) {
                showNoTeamsMessage();
                return;
            }

            grid.innerHTML = teams.map(team => createPublicTeamCard(team, currentUser?.id)).join('');
            
            // Configurar event listeners para las acciones
            setupTeamActionListeners();
        }

        // Crear tarjeta de equipo público
        function createPublicTeamCard(team, currentUserId = null) {
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

            return `
                <article class="public-team-card">
                    <header class="team-header">
                        <div class="team-title-section">
                            <h3 class="team-name">${team.name}</h3>
                            <span class="team-author">por ${team.authorName || 'Usuario'}</span>
                        </div>
                        <div class="team-stats-section">
                            <div class="team-score-badge ${getScoreClass(team.synergy?.totalScore || 0)}">
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
                            <span class="synergy-quality">${team.synergy?.quality || 'Sin análisis'}</span>
                            ${reactionsHtml}
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

        // Obtener clase CSS según puntuación
        function getScoreClass(score) {
            if (score >= 80) return 'score-excellent';
            if (score >= 60) return 'score-good';
            if (score >= 40) return 'score-decent';
            return 'score-low';
        }

        // Configurar event listeners para acciones de equipos
        function setupTeamActionListeners() {
            // Botones de like
            document.querySelectorAll('.like-btn').forEach(btn => {
                btn.addEventListener('click', handleLikeClick);
            });

            // Botones de copiar equipo
            document.querySelectorAll('.copy-team-btn').forEach(btn => {
                btn.addEventListener('click', handleCopyTeam);
            });

            // Botones de eliminar (solo para propietarios)
            document.querySelectorAll('.delete-public-team-btn').forEach(btn => {
                btn.addEventListener('click', handleDeleteTeam);
            });
        }

        // Manejar click en like
        async function handleLikeClick(e) {
            const btn = e.target;
            const teamId = btn.dataset.teamId;
            const wasLiked = btn.dataset.liked === 'true';
            
            if (!currentUser) {
                showToast('Inicia sesión para dar like', 'error');
                return;
            }

            try {
                btn.disabled = true;
                
                const response = await fetch(`/api/teams/${teamId}/like`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();
                
                if (response.ok) {
                    updateLikeButton(btn, result.liked, result.likeCount);
                    showToast(result.liked ? 'Like añadido' : 'Like eliminado', 'success');
                } else {
                    throw new Error(result.error || 'Error al dar like');
                }
            } catch (error) {
                console.error('Error con like:', error);
                showToast('Error al dar like. Intenta de nuevo.', 'error');
                updateLikeButton(btn, wasLiked, parseInt(btn.textContent.match(/\d+/)?.[0] || '0'));
            } finally {
                btn.disabled = false;
            }
        }

        // Actualizar botón de like
        function updateLikeButton(button, liked, likeCount) {
            const icon = liked ? '❤️' : '🤍';
            button.innerHTML = `${icon} ${likeCount}`;
            button.classList.toggle('liked', liked);
            button.dataset.liked = liked.toString();
        }

        // Manejar copia de equipo
        async function handleCopyTeam(e) {
            const teamId = e.target.dataset.teamId;
            
            try {
                const response = await fetch(`/api/teams/${teamId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();
                
                if (response.ok) {
                    // Guardar en localStorage para usar en teambuild
                    localStorage.setItem('copyTeam', JSON.stringify(result.team));
                    showToast('Equipo copiado. Ve al creador de equipos para cargarlo.', 'success');
                    
                    // Redirigir después de un momento
                    setTimeout(() => {
                        window.location.href = '/teambuild.html';
                    }, 2000);
                } else {
                    throw new Error(result.error || 'Error al copiar equipo');
                }
            } catch (error) {
                console.error('Error copiando equipo:', error);
                showToast('Error al copiar equipo. Intenta de nuevo.', 'error');
            }
        }

        // Manejar eliminación de equipo
        async function handleDeleteTeam(e) {
            const teamId = e.target.dataset.teamId;
            
            if (!confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
                return;
            }

            try {
                const response = await fetch(`/api/teams/${teamId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();
                
                if (response.ok) {
                    showToast('Equipo eliminado exitosamente', 'success');
                    // Recargar equipos
                    await loadTeams();
                } else {
                    throw new Error(result.error || 'Error al eliminar equipo');
                }
            } catch (error) {
                console.error('Error eliminando equipo:', error);
                showToast('Error al eliminar equipo. Intenta de nuevo.', 'error');
            }
        }

        // Actualizar paginación
        function updatePagination(pagination) {
            totalTeams = pagination.total;
            totalPages = pagination.pages;
            currentPage = pagination.current;

            const paginationContainer = document.getElementById('pagination');
            const pageNumbers = document.getElementById('page-numbers');
            const paginationInfo = document.getElementById('pagination-info');
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');

            if (totalPages <= 1) {
                paginationContainer.style.display = 'none';
                return;
            }

            paginationContainer.style.display = 'flex';

            // Actualizar botones prev/next
            prevBtn.disabled = currentPage <= 1;
            nextBtn.disabled = currentPage >= totalPages;

            // Generar números de página
            pageNumbers.innerHTML = '';
            const maxVisiblePages = 5;
            const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => {
                    currentPage = i;
                    loadTeams();
                });
                pageNumbers.appendChild(pageBtn);
            }

            // Actualizar info
            paginationInfo.textContent = `Página ${currentPage} de ${totalPages} (${totalTeams} equipos)`;
        }

        // Mostrar/ocultar loading
        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'flex' : 'none';
            document.getElementById('teams-grid').style.display = show ? 'none' : 'grid';
        }

        // Mostrar mensaje sin equipos
        function showNoTeamsMessage() {
            document.getElementById('no-teams').style.display = 'block';
            document.getElementById('teams-grid').style.display = 'none';
            document.getElementById('pagination').style.display = 'none';
        }

        // Ocultar mensaje sin equipos
        function hideNoTeamsMessage() {
            document.getElementById('no-teams').style.display = 'none';
            document.getElementById('teams-grid').style.display = 'grid';
        }

        // Mostrar toast de notificación
        function showToast(message, type = 'success') {
            // Eliminar toasts anteriores
            const existingToasts = document.querySelectorAll('.toast');
            existingToasts.forEach(toast => toast.remove());

            // Crear nuevo toast
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);

            // Animar entrada
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);

            // Animar salida
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        }
        // Función principal para actualizar el header
async function updateHeaderAuth() {
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

// Función para cerrar sesión (opcional, para usar en cualquier página)
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Actualizar header
    updateHeaderAuth();
    
    // Mostrar mensaje
    if (typeof showMessage === 'function') {
        showMessage('Sesión cerrada correctamente');
    }
    
    // Opcional: redirigir a inicio
    // window.location.href = '/Inicio.html';
}

// Función auxiliar para mostrar mensajes (si no existe)
function showMessage(message, isError = false) {
    // Crear elemento de mensaje si no existe
    let messageContainer = document.getElementById('global-message');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'global-message';
        messageContainer.style.cssText = `
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
            ${isError ? 
                'background: linear-gradient(135deg, #ff4757, #ff3742);' : 
                'background: linear-gradient(135deg, #2ed573, #1dd1a1);'
            }
        `;
        document.body.appendChild(messageContainer);
    }
    
    messageContainer.textContent = message;
    messageContainer.style.background = isError ? 
        'linear-gradient(135deg, #ff4757, #ff3742)' : 
        'linear-gradient(135deg, #2ed573, #1dd1a1)';
    
    // Animar entrada
    setTimeout(() => {
        messageContainer.style.transform = 'translateX(0)';
    }, 100);
    
    // Animar salida
    setTimeout(() => {
        messageContainer.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (messageContainer.parentNode) {
                messageContainer.parentNode.removeChild(messageContainer);
            }
        }, 300);
    }, 3000);
}

// Estilos CSS adicionales para el header dinámico
function addHeaderStyles() {
    const style = document.createElement('style');
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
function initHeaderAuth() {
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
}

// Auto-ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderAuth);
} else {
    initHeaderAuth();
}

// Exponer funciones globalmente para uso en otras partes
window.updateHeaderAuth = updateHeaderAuth;
window.logout = logout;
window.showMessage = showMessage;

// Iniciar aplicación cuando el documento esté cargado
window.onload = inicializarAplicacion;
