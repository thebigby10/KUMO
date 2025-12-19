# Piston Execution Engine Setup Guide

This guide documents the process of setting up, configuring, and testing the [Piston](https://github.com/engineer-man/piston) code execution engine on an Arch-based Linux system (CachyOS).

## 1. Prerequisites

Before installing Piston, ensure Docker and Node.js are installed and configured.

```bash
# Install Docker, Docker Compose, and Node.js
sudo pacman -S docker docker-compose nodejs npm

# Start and enable the Docker service
sudo systemctl enable --now docker.service

# Add your current user to the docker group (avoids using sudo for docker commands)
sudo usermod -aG docker $USER

# Apply group changes immediately (or logout and login)
newgrp docker
```

## 2. Installation (The Engine)

Clone the repository and start the API server.

```bash
# Clone the repository
git clone https://github.com/engineer-man/piston
cd piston

# Start the API container
# This pulls the base image and starts the server on port 2000
docker-compose up -d api
```

**Verification:**
Run `docker ps`. You should see a container named `piston_api` running on port `2000`.

## 3. Installing Languages

Piston does not come with languages pre-installed. You must use the internal CLI tool to download the specific runtimes you need (Python, Java, C, C++).

```bash
# Navigate to the CLI directory
cd cli

# Install Node dependencies for the CLI tool
npm install

# Make the script executable (optional, but convenient)
chmod +x index.js

# Install the required languages using Piston Package Manager (ppman)
# 'gcc' includes both C and C++ support
./index.js ppman install python
./index.js ppman install java
./index.js ppman install gcc
```

To see all available languages, run: `./index.js ppman list`

## 4. Testing

There are two ways to test: using the internal CLI or hitting the API directly.

### Method A: Internal CLI Test
Run code directly from the terminal without setting up an HTTP request.

```bash
# Create a temporary python file
echo 'print("Python works!")' > test.py

# Run it via Piston CLI
./index.js run python test.py
```

### Method B: API Test (Curl)
This mimics how an application (like a Discord bot) interacts with Piston.

```bash
curl -X POST http://localhost:2000/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "version": "*",
    "files": [
      {
        "content": "print(\"Hello from the Piston API\")"
      }
    ]
  }'
```

## 5. Automated Health Check Script

Save the following as `health_check.sh` to quickly verify C, C++, Java, and Python are all correctly installed and executing.

```bash
#!/bin/bash

# Function to send request to Piston
check_lang() {
    echo -n "Testing $1... "
    RESPONSE=$(curl -s -X POST http://localhost:2000/api/v2/execute \
        -H "Content-Type: application/json" \
        -d "{ \"language\": \"$1\", \"version\": \"*\", \"files\": [{ \"content\": \"$2\" }] }")
    
    # Check if output contains the expected string
    if echo "$RESPONSE" | grep -q "$3"; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
        echo "Debug: $RESPONSE"
    fi
}

echo "--- Starting Piston Health Check ---"

# Python
check_lang "python" "print('py-ok')" "py-ok"

# Java
check_lang "java" "public class Main { public static void main(String[] args) { System.out.print(\"java-ok\"); } }" "java-ok"

# C++
check_lang "cpp" "#include <iostream>\nint main() { std::cout << \"cpp-ok\"; return 0; }" "cpp-ok"

# C
check_lang "c" "#include <stdio.h>\nint main() { printf(\"c-ok\"); return 0; }" "c-ok"

echo "--- Check Complete ---"
```

Run it with:
```bash
chmod +x health_check.sh
./health_check.sh
```

## Troubleshooting

*   **Connection Refused (port 2000):**
    *   Ensure the container is running: `docker ps`
    *   If not, check logs: `docker logs piston_api`
*   **"Runtime not found":**
    *   You forgot step 3. Go back to the `cli` folder and run `ppman install <language>`.
*   **Permission Denied (Docker):**
    *   Ensure you ran `newgrp docker` or rebooted after adding your user to the docker group.
```
