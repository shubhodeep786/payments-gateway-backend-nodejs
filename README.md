# Payments Gateway Backend

4. Run a RabbitMQ instance (used for asynchronous transaction processing):
   ```bash
   docker run -d --name rabbitmq -p 5672:5672 rabbitmq:3-alpine
   ```
5. Start the transaction worker in a separate process:
   ```bash
   node src/workers/transactionWorker.js
   ```
Merchants create transactions with `POST /transactions`. Requests are placed on a RabbitMQ queue and processed asynchronously by the worker. Refunds are handled synchronously via `POST /transactions/:id/refund`.
