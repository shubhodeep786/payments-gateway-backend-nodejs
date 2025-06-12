# Payments Gateway Backend

This repository demonstrates a basic payment gateway backend written in Node.js using the MVC pattern. It contains a small Auth and Merchant service implemented with Express and Sequelize.

See [docs/architecture.md](docs/architecture.md) for the overall microservices design and database schema.

## Getting Started

1. Copy `.env.example` to `.env` and update the database URL and JWT secret.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
  node app.js
  ```
4. Run a RabbitMQ instance (used for asynchronous transaction processing):
   ```bash
   docker run -d --name rabbitmq -p 5672:5672 rabbitmq:3-alpine
   ```
5. Start the transaction worker in a separate process:
   ```bash
   node src/workers/transactionWorker.js
   ```

## Auth Usage

### Login

Send a POST request to `/auth/login` with `username` and `password`. On success it returns a JWT which is stored in the `auth_tokens` table. Include the token as `Authorization: Bearer <token>` in subsequent requests.

### Logout

Send a POST request to `/auth/logout` with the same `Authorization` header to invalidate the session.

Protected routes use RBAC. Admins can register merchants via `POST /merchants/register` while merchants can access their profile at `GET /merchants/me`.

### API Keys

Admins can issue a new API key for a merchant using `POST /merchants/:id/keys` and revoke it via `POST /merchants/:id/keys/:keyId/revoke`.

### Transactions

Merchants create transactions with `POST /transactions`. Requests are placed on a RabbitMQ queue and processed asynchronously by the worker. Refunds are handled synchronously via `POST /transactions/:id/refund`.

