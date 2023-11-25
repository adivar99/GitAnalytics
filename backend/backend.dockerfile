FROM template/backendbuilder:latest as backend-base

ENV PYTHONPATH=/app

WORKDIR /app

COPY ./start-reload.sh /

CMD [ "/bin/sh", "/start-reload.sh" ]