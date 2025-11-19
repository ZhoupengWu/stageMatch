# Contributing Guidelines

Grazie per voler contribuire a **stageMatch**. Questo documento spiega le regole base per collaborare al progetto in modo ordinato

## Indice

- [Collaboratori](#collaboratori)

- [Contributori](#contributori)

---

## Collaboratori

## 1. Creazione del branch

Ogni collaboratore deve lavorare su **un proprio branch**, nominato con il **proprio cognome** (prima lettera maiuscola)

Esempi:
```bash
git checkout -b Falcone

git checkout -b Rossi
```

---

## 2. Creazione della cartella in locale

Ogni collaboratore deve lavorare su una **cartella nel root del progetto**, nominato con il **proprio cognome** in maiuscolo

Esempi:
```bash
mkdir FALCONE
cd FALCONE/

mkdir ROSSI
cd ROSSI/
```

---

## 3. Messaggi nei commit

Ogni commit deve iniziare con il proprio cognome in maiuscolo, seguito da due punti e una breve descrizione

Esempi:
```
FALCONE: fix login redirect

ROSSI: update frontend layout
```

➡️ Evita messaggi generici come “update files” o “changes”

---

## Contributori

## 1. Creazione del branch

Ogni contributore può lavorare su **un proprio branch**, nominato con il **proprio cognome** (prima lettera maiuscola) oppure modificare un branch esistente

Esempi:
```bash
git checkout -b Contributor1

git checkout Rossi
```

---

## 2. Creazione della cartella in locale

Ogni contributore può lavorare su una **cartella nel root del progetto**, nominato con il **proprio cognome** in maiuscolo oppure **modificare** i file nel branch

Esempi:
```bash
mkdir CONTRIBUTOR1
cd CONTRIBUTOR1/
```

---

## 3. Messaggi nei commit

Ogni commit deve iniziare con il proprio cognome in maiuscolo, seguito da due punti e una breve descrizione

Esempi:
```
FALCONE: fix login redirect

ROSSI: update frontend layout
```

➡️ Evita messaggi generici come “update files” o “changes”

---

## 4. Pull Request

Quando il lavoro è pronto:

1. Fai `git push` sul tuo branch nel tuo repository forkato
2. Apri una **Pull Request (PR)** verso `dev` oppure verso il branch che hai modificato
3. Nella PR, descrivi chiaramente cosa hai modificato o aggiunto

Ogni PR sarà revisionata dal team prima di essere accettata

---

## 5. Segnalazione bug

Se trovi un problema:

- Crea una ***Issue*** nel repository
- Includi una descrizione chiara e, se possibile, come riprodurlo

---

## ❤️ Ringraziamenti

Ogni contributore sarà aggiunto nella sezione **Credits** del progetto