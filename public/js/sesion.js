//sesion.js

// Variables globales
        let currentUser = null;

        // Elementos del DOM
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const dashboard = document.getElementById('dashboard');
        const showRegisterBtn = document.getElementById('show-register');
        const showLoginBtn = document.getElementById('show-login');
        const loginFormElement = document.getElementById('loginForm');
        const registerFormElement = document.getElementById('registerForm');
        const logoutBtn = document.getElementById('logout-btn');

        // Función para mostrar mensajes
        function showMessage(elementId, message, isError = false) {
            const messageElement = document.getElementById(elementId);
            messageElement.innerHTML = `
                <div class="${isError ? 'error-message' : 'success-message'}">
                    ${message}
                </div>
            `;
            
            // Limpiar mensaje después de 5 segundos
            setTimeout(() => {
                messageElement.innerHTML = '';
            }, 5000);
        }

        // Función para alternar entre login y registro
        function toggleForms() {
            loginForm.classList.toggle('hidden');
            registerForm.classList.toggle('hidden');
            // Limpiar mensajes al cambiar
            document.getElementById('login-message').innerHTML = '';
            document.getElementById('register-message').innerHTML = '';
        }

        // Event listeners para alternar formularios
        showRegisterBtn.addEventListener('click', toggleForms);
        showLoginBtn.addEventListener('click', toggleForms);

        // Función para hacer peticiones HTTP
        async function makeRequest(url, method, data = null) {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            // Añadir token si existe
            const token = localStorage.getItem('authToken');
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error en la petición');
            }

            return result;
        }

        // Función para manejar el login
        async function handleLogin(event) {
            event.preventDefault();
            
            const button = document.getElementById('login-btn');
            const originalText = button.innerHTML;
            
            try {
                // Mostrar loading
                button.disabled = true;
                button.innerHTML = '<span class="loading"></span>Iniciando sesión...';
                
                const formData = new FormData(event.target);
                const loginData = {
                    email: formData.get('email'),
                    password: formData.get('password')
                };

                const result = await makeRequest('/api/login', 'POST', loginData);
                
                // Guardar token y datos del usuario
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                currentUser = result.user;
                
                showMessage('login-message', '¡Login exitoso! Redirigiendo...', false);
                
                // Mostrar dashboard
                setTimeout(() => {
                    showDashboard();
                }, 1000);

            } catch (error) {
                showMessage('login-message', error.message, true);
            } finally {
                button.disabled = false;
                button.innerHTML = originalText;
            }
        }

        // Función para manejar el registro
        async function handleRegister(event) {
            event.preventDefault();
            
            const button = document.getElementById('register-btn');
            const originalText = button.innerHTML;
            
            try {
                // Mostrar loading
                button.disabled = true;
                button.innerHTML = '<span class="loading"></span>Registrando...';
                
                const formData = new FormData(event.target);
                const registerData = {
                    username: formData.get('username'),
                    email: formData.get('email'),
                    password: formData.get('password')
                };

                await makeRequest('/api/register', 'POST', registerData);
                
                showMessage('register-message', '¡Registro exitoso! Puedes iniciar sesión ahora.', false);
                
                // Cambiar a formulario de login después de 2 segundos
                setTimeout(() => {
                    toggleForms();
                    // Pre-llenar el email en el formulario de login
                    document.getElementById('login-email').value = registerData.email;
                }, 2000);

            } catch (error) {
                showMessage('register-message', error.message, true);
            } finally {
                button.disabled = false;
                button.innerHTML = originalText;
            }
        }

        // Función para mostrar el dashboard
        function showDashboard() {
            loginForm.classList.add('hidden');
            registerForm.classList.add('hidden');
            dashboard.classList.remove('hidden');
            
            // Mostrar información del usuario
            if (currentUser) {
                document.getElementById('user-name').textContent = currentUser.username;
                document.getElementById('user-email').textContent = currentUser.email;
            }
        }

        // Función para cerrar sesión
        function logout() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            currentUser = null;
            
            // Mostrar formulario de login
            dashboard.classList.add('hidden');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            
            // Limpiar formularios
            loginFormElement.reset();
            registerFormElement.reset();
            
            showMessage('login-message', 'Sesión cerrada correctamente', false);
        }

        // Función para verificar si hay una sesión activa
        async function checkAuthStatus() {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('currentUser');
            
            if (token && userData) {
                try {
                    // Verificar si el token es válido
                    const result = await makeRequest('/api/verify-token', 'GET');
                    currentUser = result.user;
                    showDashboard();
                } catch (error) {
                    // Token inválido, limpiar storage
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                }
            }
        }

        // Event listeners
        loginFormElement.addEventListener('submit', handleLogin);
        registerFormElement.addEventListener('submit', handleRegister);
        logoutBtn.addEventListener('click', logout);

        // Verificar estado de autenticación al cargar la página
        document.addEventListener('DOMContentLoaded', checkAuthStatus);
