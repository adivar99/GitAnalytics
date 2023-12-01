export APP_MODULE=app.main:app

HOST=${HOST:-0.0.0.0}
PORT=${PORT:-8080}
LOG_LEVEL=${LOG_LEVEL:-info}

./prestart.sh

python -m uvicorn --reload --host $HOST --port $PORT --log-level $LOG_LEVEL "$APP_MODULE"