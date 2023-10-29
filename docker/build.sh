#!/bin/bash
set -e

# build image
docker compose build
docker compose -f docker-compose.web.yml build
docker compose -f docker-compose.background.yml build
docker compose -f docker-compose.lts.yml build