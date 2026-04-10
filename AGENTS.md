# Repository Guidelines

## Project Structure & Module Organization
`app.py` runs the main Flask web app and serves templates and static assets from `resources/`. `server.py` exposes the routing and geocoding API used by the frontend. Authentication logic lives in `auth/` and middleware is under `auth/middleware/`. Frontend files are split by type in `resources/html/`, `resources/css/`, `resources/js/`, and images in `resources/img/`. `test_auth/` is a separate SSO blueprint example with its own app, templates, static files, and dependencies.

## Build, Test, and Development Commands
Create and activate a virtual environment, then install dependencies:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Run the web app on `127.0.0.1:5000`:
```bash
python app.py
```
Run the API backend on `127.0.0.1:5001`:
```bash
python server.py
```
For the SSO example, use `cd test_auth && ./start.sh` to bootstrap its local environment and start it.

## Coding Style & Naming Conventions
Follow `.editorconfig`: UTF-8, LF line endings, 4-space indentation, and no trailing whitespace. Keep Python modules and functions in `snake_case`; preserve existing route handler naming when editing legacy code. Use descriptive file names grouped by page or feature, for example `resources/js/home.js` and `resources/css/login.css`. Favor small Flask handlers and keep API-specific logic in `server.py` or `auth/` helpers.

## Testing Guidelines
There is no top-level automated test suite configured yet. Validate changes by running both Flask servers and manually exercising login, map rendering, Photon suggestions, and route generation. When touching `auth/` or SSO flows, also verify the example app in `test_auth/`. If you add tests, place them near the affected module or inside a dedicated `tests/` package and use names like `test_<feature>.py`.

## Commit & Pull Request Guidelines
`CONTRIBUTING.md` asks contributors to branch from `main` or `dev` depending on role, using a personal branch name. Commit messages should start with an uppercase author prefix and a short summary, for example `WU: aggiunto bottone suggerimento`. Pull requests should target the correct base branch, describe the change clearly, and include reproduction steps or screenshots for UI work.

## Security & Configuration Tips
Copy `.env.example` to `.env` and set secrets such as `ORS_API_KEY` and `SERVER_SECRET_KEY`. Never commit real credentials. In production, ensure SSO-related values are set before running `app.py`.
