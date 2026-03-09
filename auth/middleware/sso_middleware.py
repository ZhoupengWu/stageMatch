"""
Middleware SSO per le applicazioni Flask
Fornisce: validazione JWT, gestione sessioni, whitelist, rate-limiting.

Copiato/adattato dal modulo condiviso del portale checkin.
"""

import jwt
import json
import os
import time
import threading
from datetime import datetime
from functools import wraps
from flask import request, redirect, session, render_template_string
import logging

logger = logging.getLogger(__name__)


# ============================================================
# WHITELIST MANAGER
# ============================================================

class WhitelistManager:
    """
    Gestisce la whitelist degli account autorizzati ad accedere all'applicazione.

    Il file whitelist.json ha questa struttura:
    {
        "enabled": true,
        "emails": [
            "user@example.com",
            "admin@company.com"
        ]
    }

    Se enabled=false, la whitelist è disabilitata (tutti gli account SSO sono autorizzati).
    Se il file non esiste, viene creato con enabled=false (nessuna restrizione).
    """

    def __init__(self, whitelist_path: str):
        self.whitelist_path = whitelist_path
        self._lock = threading.Lock()
        self._ensure_file()

    def _ensure_file(self):
        """Crea il file whitelist se non esiste."""
        if not os.path.exists(self.whitelist_path):
            default = {"enabled": False, "emails": []}
            with open(self.whitelist_path, 'w') as f:
                json.dump(default, f, indent=2)
            logger.info(f"Whitelist file creato: {self.whitelist_path} (disabled)")

    def _load(self) -> dict:
        try:
            with open(self.whitelist_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Errore lettura whitelist: {e}")
            return {"enabled": False, "emails": []}

    def is_authorized(self, email: str) -> bool:
        """
        Verifica se un'email è autorizzata.
        Se la whitelist è disabilitata, tutti sono autorizzati.
        """
        data = self._load()
        if not data.get("enabled", False):
            return True
        emails = [e.lower().strip() for e in data.get("emails", [])]
        return email.lower().strip() in emails

    def get_all(self) -> dict:
        return self._load()

    def add_email(self, email: str):
        with self._lock:
            data = self._load()
            email = email.lower().strip()
            if email not in data["emails"]:
                data["emails"].append(email)
                with open(self.whitelist_path, 'w') as f:
                    json.dump(data, f, indent=2)

    def remove_email(self, email: str):
        with self._lock:
            data = self._load()
            data["emails"] = [e for e in data["emails"] if e != email.lower().strip()]
            with open(self.whitelist_path, 'w') as f:
                json.dump(data, f, indent=2)

    def set_enabled(self, enabled: bool):
        with self._lock:
            data = self._load()
            data["enabled"] = enabled
            with open(self.whitelist_path, 'w') as f:
                json.dump(data, f, indent=2)


# ============================================================
# RATE LIMITER
# ============================================================

class RateLimiter:
    """
    Rate limiting basato su sessioni attive.

    Criteri implementati:
    1. MAX_SESSIONS_PER_USER  - numero massimo di sessioni simultanee per lo stesso utente
    2. MAX_SESSIONS_GLOBAL    - numero massimo di sessioni attive totali nell'applicazione

    Le sessioni "scadute" (più vecchie di session_ttl_seconds) vengono pulite automaticamente.

    NOTA: questa implementazione usa un dizionario in-memory condiviso tra i thread Flask.
    Per ambienti multi-processo (gunicorn con worker multipli) si consiglia di sostituire
    il backend con Redis o un database condiviso.
    """

    def __init__(self,
                 max_sessions_per_user: int = 3,
                 max_sessions_global: int = 100,
                 session_ttl_seconds: int = 28800):  # 8 ore
        self.max_sessions_per_user = max_sessions_per_user
        self.max_sessions_global = max_sessions_global
        self.session_ttl_seconds = session_ttl_seconds

        # Struttura: { session_id: { "email": str, "created_at": float, "last_seen": float } }
        self._sessions: dict = {}
        self._lock = threading.Lock()

        logger.info(
            f"RateLimiter inizializzato: max_per_user={max_sessions_per_user}, "
            f"max_global={max_sessions_global}, ttl={session_ttl_seconds}s"
        )

    def _cleanup(self):
        """Rimuove sessioni scadute. Da chiamare con il lock acquisito."""
        now = time.time()
        expired = [
            sid for sid, data in self._sessions.items()
            if now - data["last_seen"] > self.session_ttl_seconds
        ]
        for sid in expired:
            logger.debug(f"Sessione scaduta rimossa: {sid[:8]}...")
            del self._sessions[sid]

    def register_session(self, session_id: str, email: str) -> tuple[bool, str]:
        """
        Registra una nuova sessione.

        Returns:
            (True, "") se accettata
            (False, motivo) se rifiutata per rate limiting
        """
        with self._lock:
            self._cleanup()

            # Controlla limite globale
            if len(self._sessions) >= self.max_sessions_global:
                logger.warning(f"Limite globale sessioni raggiunto ({self.max_sessions_global})")
                return False, f"Il servizio ha raggiunto il numero massimo di sessioni attive ({self.max_sessions_global}). Riprova tra qualche minuto."

            # Controlla limite per utente
            user_sessions = [
                sid for sid, data in self._sessions.items()
                if data["email"] == email.lower()
            ]
            if len(user_sessions) >= self.max_sessions_per_user:
                logger.warning(f"Limite sessioni per utente raggiunto: {email} ({self.max_sessions_per_user})")
                return False, f"Hai raggiunto il numero massimo di sessioni simultanee ({self.max_sessions_per_user}). Chiudi un'altra sessione e riprova."

            # Registra
            self._sessions[session_id] = {
                "email": email.lower(),
                "created_at": time.time(),
                "last_seen": time.time()
            }
            logger.info(f"Sessione registrata: {email} (totale={len(self._sessions)})")
            return True, ""

    def touch_session(self, session_id: str):
        """Aggiorna il timestamp last_seen per tenere viva la sessione."""
        with self._lock:
            if session_id in self._sessions:
                self._sessions[session_id]["last_seen"] = time.time()

    def remove_session(self, session_id: str):
        """Rimuove una sessione (logout)."""
        with self._lock:
            if session_id in self._sessions:
                email = self._sessions[session_id]["email"]
                del self._sessions[session_id]
                logger.info(f"Sessione rimossa: {email} (totale={len(self._sessions)})")

    def get_stats(self) -> dict:
        """Ritorna statistiche correnti (per admin/debug)."""
        with self._lock:
            self._cleanup()
            by_user = {}
            for data in self._sessions.values():
                email = data["email"]
                by_user[email] = by_user.get(email, 0) + 1
            return {
                "total_sessions": len(self._sessions),
                "max_global": self.max_sessions_global,
                "max_per_user": self.max_sessions_per_user,
                "sessions_by_user": by_user
            }

    def is_session_valid(self, session_id: str) -> bool:
        """Verifica se un session_id è ancora registrato e non scaduto."""
        with self._lock:
            self._cleanup()
            return session_id in self._sessions


# ============================================================
# SSO MIDDLEWARE PRINCIPALE
# ============================================================

class SSOMiddleware:
    """
    Middleware per integrare SSO nelle applicazioni Flask.
    Gestisce: validazione JWT, sessioni, whitelist, rate limiting.
    """

    def __init__(self,
                 jwt_secret: str,
                 jwt_algorithm: str = "HS256",
                 jwt_issuer: str = "sso-portal",
                 jwt_audience: str = None,
                 session_timeout: int = 28800,
                 portal_url: str = "http://localhost:5000",
                 whitelist_manager: WhitelistManager = None,
                 rate_limiter: RateLimiter = None):

        self.jwt_secret = jwt_secret
        self.jwt_algorithm = jwt_algorithm
        self.jwt_issuer = jwt_issuer
        self.jwt_audience = jwt_audience
        self.session_timeout = session_timeout
        self.portal_url = portal_url
        self.whitelist = whitelist_manager
        self.rate_limiter = rate_limiter

    def validate_jwt(self, token: str) -> dict:
        """Valida un JWT ricevuto dal portale SSO."""
        payload = jwt.decode(
            token,
            self.jwt_secret,
            algorithms=[self.jwt_algorithm],
            issuer=self.jwt_issuer,
            audience=self.jwt_audience
        )
        logger.info(f"JWT validato per: {payload.get('email')}")
        return payload

    def create_session(self, user_data: dict, flask_session, session_id: str = None):
        """Crea una sessione server-side per l'utente."""
        import secrets
        sid = session_id or secrets.token_hex(32)

        flask_session.permanent = True
        flask_session['user'] = {
            'email': user_data.get('email'),
            'name': user_data.get('name', ''),
            'googleId': user_data.get('googleId', ''),
            'picture': user_data.get('picture', ''),
            'authenticated_at': datetime.utcnow().isoformat()
        }
        flask_session['session_id'] = sid
        logger.info(f"Sessione creata per: {user_data.get('email')}")
        return sid

    def sso_login_required(self, f):
        """
        Decorator per proteggere le route.
        Verifica sessione valida, whitelist e rate limit (touch).
        """
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user' not in session:
                logger.warning("Accesso senza sessione - redirect al portale")
                return redirect(self.portal_url)

            # Aggiorna last_seen nel rate limiter
            if self.rate_limiter:
                sid = session.get('session_id')
                if sid:
                    # Se la sessione non è più registrata (es. scaduta lato server)
                    if not self.rate_limiter.is_session_valid(sid):
                        session.clear()
                        return render_sso_error(
                            "La tua sessione è scaduta. Effettua nuovamente il login.",
                            self.portal_url, 401
                        )
                    self.rate_limiter.touch_session(sid)

            return f(*args, **kwargs)
        return decorated_function


# ============================================================
# ERROR PAGE TEMPLATE
# ============================================================

ERROR_TEMPLATE = """
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }} - Accesso</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 24px 64px rgba(0,0,0,0.4);
            max-width: 480px;
            width: 100%;
            padding: 48px 40px;
            text-align: center;
        }
        .icon { font-size: 56px; margin-bottom: 20px; }
        h1 { color: #1a1a2e; font-size: 22px; margin-bottom: 12px; font-weight: 600; }
        .message { color: #555; font-size: 15px; line-height: 1.7; margin-bottom: 32px; }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 13px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 15px;
            font-weight: 500;
            transition: opacity 0.2s;
        }
        .btn:hover { opacity: 0.88; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">{{ icon }}</div>
        <h1>{{ title }}</h1>
        <p class="message">{{ error_message }}</p>
        <a href="{{ portal_url }}" class="btn">← Torna al Portale</a>
    </div>
</body>
</html>
"""


def render_sso_error(error_message: str, portal_url: str,
                     status_code: int = 401,
                     title: str = "Accesso Negato",
                     icon: str = "🔒"):
    """Renderizza una pagina di errore SSO."""
    return render_template_string(
        ERROR_TEMPLATE,
        error_message=error_message,
        portal_url=portal_url,
        title=title,
        icon=icon
    ), status_code
