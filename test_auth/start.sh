#!/bin/bash
# Script di avvio — SSO Blueprint
set -e

echo "=================================================="
echo " SSO Blueprint — Avvio"
echo "=================================================="

# Crea virtualenv se non esiste
if [ ! -d "venv" ]; then
    echo "→ Creazione virtual environment..."
    python3 -m venv venv
fi

# Attiva venv
source venv/bin/activate

# Installa dipendenze
echo "→ Installazione dipendenze..."
pip install -q -r requirements.txt

# Verifica .env
if [ ! -f ".env" ]; then
    echo "⚠️  File .env non trovato. Copio .env.example → .env"
    cp .env.example .env
    echo "   Modifica .env con i valori corretti prima di avviare in production."
fi

# Avvio
echo "→ Avvio applicazione..."
python app.py
