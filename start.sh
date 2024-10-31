#!/bin/bash

# Stoppen und Entfernen alter Container
docker-compose down

# Container neu bauen und starten
docker-compose up --build