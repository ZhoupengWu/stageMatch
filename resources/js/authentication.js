document.addEventListener("DOMContentLoaded", () => {
    const sliderContainer = document.getElementById("sliderContainer");
    const switchLinks = document.querySelectorAll(".switch-link");
    const togglePasswordButtons = document.querySelectorAll(".toggle-password");
    const registerPasswordInput = document.getElementById("register-password");
    const registerConfirmPasswordInput = document.getElementById("register-confirm-password");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    // Switch tra Login e Registrazione
    switchLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = link.getAttribute("data-target");

            if (target === "register") {
                sliderContainer.classList.add("show-register");
                // Reset del form di login
                loginForm.reset();
                // Reset eventuali errori di validazione
                document.querySelectorAll('.form-input').forEach(input => {
                    input.setCustomValidity("");
                });
            } else {
                sliderContainer.classList.remove("show-register");
                // Reset del form di registrazione
                registerForm.reset();
                // Reset password strength indicator
                const strengthFill = document.querySelector(".strength-fill");
                const strengthText = document.querySelector(".strength-text");
                if (strengthFill && strengthText) {
                    strengthFill.className = "strength-fill";
                    strengthText.textContent = "Forza password";
                }
                // Reset eventuali errori di validazione
                document.querySelectorAll('.form-input').forEach(input => {
                    input.setCustomValidity("");
                });
            }
        });
    });

    // Toggle visibilità password
    togglePasswordButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.getAttribute("data-target");
            const input = document.getElementById(targetId);
            const icon = button.querySelector(".eye-icon");

            if (input.type === "password") {
                input.type = "text";
                icon.innerHTML = `
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                `;
            } else {
                input.type = "password";
                icon.innerHTML = `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                `;
            }
        });
    });

    // Password strength indicator
    if (registerPasswordInput) {
        registerPasswordInput.addEventListener("input", () => {
            const password = registerPasswordInput.value;
            const strengthFill = document.querySelector(".strength-fill");
            const strengthText = document.querySelector(".strength-text");

            if (password.length === 0) {
                strengthFill.className = "strength-fill";
                strengthText.textContent = "Forza password";
                return;
            }

            let strength = 0;

            // Criteri per la forza della password
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
            if (/\d/.test(password)) strength++;
            if (/[^a-zA-Z0-9]/.test(password)) strength++;

            if (strength <= 2) {
                strengthFill.className = "strength-fill weak";
                strengthText.textContent = "Password debole";
            } else if (strength <= 4) {
                strengthFill.className = "strength-fill medium";
                strengthText.textContent = "Password media";
            } else {
                strengthFill.className = "strength-fill strong";
                strengthText.textContent = "Password forte";
            }
        });
    }

    // Validazione conferma password
    if (registerConfirmPasswordInput) {
        registerConfirmPasswordInput.addEventListener("input", () => {
            const password = registerPasswordInput.value;
            const confirmPassword = registerConfirmPasswordInput.value;

            if (confirmPassword && password !== confirmPassword) {
                registerConfirmPasswordInput.setCustomValidity("Le password non corrispondono");
            } else {
                registerConfirmPasswordInput.setCustomValidity("");
            }
        });
    }

    // Handle Login form submission
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const rememberMe = document.getElementById("remember-me").checked;

        console.log("Login attempt:", { email, rememberMe });

        // TODO: Implementare chiamata API per login
        // Esempio:
        /*
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, rememberMe }),
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful
                window.location.href = '/';
            } else {
                // Show error
                alert(data.message || 'Errore durante il login');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Errore di connessione. Riprova più tardi.');
        }
        */

        // Placeholder: mostra messaggio di successo
        showNotification("Login in corso...", "success");

        // Simula redirect dopo 1.5 secondi
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    });

    // Handle Register form submission
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("register-name").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("register-confirm-password").value;
        const acceptTerms = document.getElementById("accept-terms").checked;

        // Validazione password
        if (password !== confirmPassword) {
            showNotification("Le password non corrispondono", "error");
            return;
        }

        if (!acceptTerms) {
            showNotification("Devi accettare i Termini e Condizioni", "error");
            return;
        }

        console.log("Registration attempt:", { name, email });

        // TODO: Implementare chiamata API per registrazione
        // Esempio:
        /*
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Registration successful
                showNotification("Registrazione completata!", "success");
                setTimeout(() => {
                    sliderContainer.classList.remove("show-register");
                }, 1500);
            } else {
                // Show error
                showNotification(data.message || 'Errore durante la registrazione', "error");
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Errore di connessione. Riprova più tardi.', "error");
        }
        */

        // Placeholder: mostra messaggio di successo
        showNotification("Registrazione completata con successo!", "success");

        // Simula switch a login dopo 1.5 secondi
        setTimeout(() => {
            sliderContainer.classList.remove("show-register");
        }, 1500);
    });

    // Funzione per mostrare notifiche (placeholder)
    function showNotification(message, type) {
        // Questo è un placeholder - puoi implementare un sistema di notifiche più sofisticato
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }

    // Handle Google login (placeholder)
    const googleButtons = document.querySelectorAll(".btn-social.google");
    googleButtons.forEach(button => {
        button.addEventListener("click", () => {
            console.log("Google login clicked");
            // TODO: Implementare Google OAuth
            showNotification("Autenticazione Google in sviluppo", "info");
        });
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        // ESC per chiudere eventuali modal o tornare indietro
        if (e.key === "Escape") {
            // Implementa la logica se necessario
        }
    });

    // Auto-focus sul primo input quando si cambia pannello
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === "class") {
                const isRegister = sliderContainer.classList.contains("show-register");
                setTimeout(() => {
                    if (isRegister) {
                        document.getElementById("register-name")?.focus();
                    } else {
                        document.getElementById("login-email")?.focus();
                    }
                }, 600); // Attende la fine dell'animazione
            }
        });
    });

    observer.observe(sliderContainer, {
        attributes: true,
        attributeFilter: ["class"]
    });
});