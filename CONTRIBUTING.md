# Contributing Guidelines

Grazie per voler contribuire a **stageMatch**. Questo documento raccoglie le regole operative per lavorare in modo ordinato sul repository.

## Prima di iniziare

- Crea un branch dedicato alla modifica.
- Mantieni le modifiche coerenti con la struttura del progetto.
- Non committare credenziali, file `.env` reali, database locali o output generati.
- Per modifiche UI, includi nella Pull Request una breve descrizione dei passaggi di verifica o uno screenshot.

## Collaboratori

### Branch

Ogni collaboratore crea il proprio branch partendo da `main`, usando il proprio nome con la prima lettera maiuscola.

Esempi:

```bash
git checkout main
git pull origin main
git checkout -b Falcone
```

```bash
git checkout main
git pull origin main
git checkout -b Rossi
```

### Commit

Ogni commit deve iniziare con il proprio nome in maiuscolo, seguito da due punti e una breve descrizione.

Esempi:

```text
FALCONE: fix login redirect
ROSSI: update frontend layout
```

Evita messaggi generici come `update files` o `changes`.

### Pull Request

Quando il lavoro è pronto:

1. Esegui `git push` sul tuo branch.
2. Apri una Pull Request verso `main`.
3. Descrivi chiaramente cosa hai modificato o aggiunto.
4. Aggiungi i passaggi di verifica manuale, se rilevanti.

Ogni Pull Request viene revisionata dal team prima del merge.

## Contributori

### Branch

Ogni contributore crea il proprio branch partendo da `dev`, usando il proprio nome con la prima lettera maiuscola.

Esempi:

```bash
git checkout dev
git pull origin dev
git checkout -b Contributore
```

```bash
git checkout dev
git pull origin dev
git checkout -b Sviluppatore
```

### Commit

Ogni commit deve iniziare con il proprio nome in maiuscolo, seguito da due punti e una breve descrizione.

Esempi:

```text
CONTRIBUTORE: add new feature
SVILUPPATORE: update documentation
```

Evita messaggi generici come `update files` o `changes`.

### Pull Request

Quando il lavoro è pronto:

1. Esegui `git push` sul tuo branch.
2. Apri una Pull Request verso `dev`.
3. Descrivi chiaramente cosa hai modificato o aggiunto.
4. Aggiungi i passaggi di verifica manuale, se rilevanti.

Ogni Pull Request viene revisionata dal team prima del merge.

## Segnalazione bug

Se trovi un problema, apri una Issue e includi:

- descrizione chiara del comportamento osservato;
- passaggi per riprodurre il problema;
- comportamento atteso;
- screenshot, log o messaggi di errore quando utili.

## Verifica locale

Non esiste ancora una test suite top-level. Prima di aprire una Pull Request, esegui una verifica manuale proporzionata alla modifica:

- `python app.py` per l'app principale;
- `python server.py` per il backend geografico;
- login, completamento profilo, mappa e generazione percorso;
- `cd test_auth && ./start.sh` se hai modificato il blueprint o il middleware SSO.

## Ringraziamenti

I contributori possono essere aggiunti nella sezione autori o credits del progetto quando il contributo viene accettato.
