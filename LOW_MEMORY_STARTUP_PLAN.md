# Low-Memory Startup Plan

This plan documents how to run both the Venu frontend and backend on a constrained environment with 1 CPU and 512 MB RAM.

## Goal

Run the application locally with minimal resource usage by using production mode for the frontend and a single-worker FastAPI backend.

## Backend Strategy

1. Use a Python virtual environment.
2. Disable reload and auto-reload watchers.
3. Run Uvicorn with a single worker and a single concurrency limit.
4. Lower log verbosity to reduce overhead.

### Backend command

```bash
cd /home/venu/venu-collections
. .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1 --limit-concurrency 1 --log-level warning
```

### Optional CPU-friendly command

```bash
nice -n 10 uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1 --limit-concurrency 1 --log-level warning
```

## Frontend Strategy

1. Build the Next.js app once.
2. Run the production server with `next start` instead of `next dev`.
3. Constrain Node.js memory usage.
4. Use the local Node runtime already installed in user space.

### Frontend commands

```bash
cd /home/venu/venu-collections/frontend
PATH=/home/venu/.local/node/node-v20.20.2-linux-x64/bin:$PATH npm run build
PATH=/home/venu/.local/node/node-v20.20.2-linux-x64/bin:$PATH NODE_OPTIONS="--max-old-space-size=256" npm run start -- --hostname 0.0.0.0 --port 3000
```

### If 512 MB is still too tight

```bash
PATH=/home/venu/.local/node/node-v20.20.2-linux-x64/bin:$PATH NODE_OPTIONS="--max-old-space-size=192" npm run start -- --hostname 0.0.0.0 --port 3000
```

## Verification

1. Confirm backend is on `http://localhost:8000`.
2. Confirm frontend is on `http://localhost:3000`.
3. Inspect memory usage of `python`, `node`, and `next` processes.
4. Use `http://localhost:8000/health` and `http://localhost:3000/shop` to verify application functionality.

## Notes

- `next dev` / Turbopack is too heavy for 512 MB RAM.
- `next start` is significantly lighter and appropriate for low-memory usage.
- Keep backend `--workers 1` and avoid autoreload.
- This plan is intentionally runtime-focused; no code changes are required at first.
