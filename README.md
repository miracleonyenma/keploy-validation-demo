# Keploy Validation Demo

A Node.js Express API for demonstrating validation testing with Keploy.

## Project Overview

This project is a simple REST API built with Express.js that provides endpoints for managing users and posts with various validation scenarios.

## Running the Application

### Without Docker

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

   Or for development with auto-reload:
   ```
   npm run dev
   ```

3. The API will be available at http://localhost:8080

### With Docker

#### Using Docker

1. Build the Docker image:
   ```
   docker build -t keploy-validation-demo .
   ```

2. Run the container:
   ```
   docker run -p 8080:8080 --name keploy-validation-container --network keploy-network keploy-validation-demo
   ```

#### Using Docker Compose

1. Start the application:
   ```
   docker-compose up
   ```

2. The API will be available at http://localhost:8080

## Using Keploy for Testing

### Recording Tests

1. Make sure you have Keploy installed. If not, follow the installation instructions at [Keploy Documentation](https://keploy.io/docs).

2. Record API tests using Keploy using one of these methods:

   **Using the provided script:**
   ```
   ./run-keploy-record.sh
   ```

   **Or manually:**
   ```
   keploy record -c "docker run -p 8080:8080 --name keploy-validation-container --network keploy-network keploy-validation-demo" --buildDelay 60
   ```

3. Make API calls to your application to generate test cases.

4. Once done, Keploy will save the recorded tests that can be used for validation testing.

### Running Tests

To run the recorded tests using one of these methods:

**Using the provided script:**
```
./run-keploy-test.sh
```

**Or manually:**
```
keploy test -c "docker run -p 8080:8080 --name keploy-validation-container --network keploy-network keploy-validation-demo" --delay 10
```

### Development with Docker Compose

1. For development with live reload:
   ```
   docker-compose up -d
   ```

3. The API will be available at http://localhost:3000

## API Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post