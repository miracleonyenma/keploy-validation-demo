#!/bin/bash

# Build the Docker image if it doesn't exist
docker build -t keploy-validation-demo .

# Create the network if it doesn't exist
docker network create keploy-network 2>/dev/null || true

# Run Keploy record command
keploy record -c "docker run -p 8080:8080 --name keploy-validation-container --network keploy-network keploy-validation-demo" --buildDelay 60