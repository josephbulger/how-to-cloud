#!/bin/bash
set -e

# login to ECR
version=$(aws --version | awk -F'[/.]' '{print $2}')
if [ $version -eq "1" ]; then
  login=$(aws ecr get-login --no-include-email) && eval "$login"
else
  aws ecr get-login-password | docker login --username AWS --password-stdin $ecr
fi

# push image to ECR repo
docker compose -f docker-compose.lts.yml push
docker compose -f docker-compose.web.yml push
docker compose -f docker-compose.background.yml push
