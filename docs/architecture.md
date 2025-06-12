# Payment Gateway Architecture

This document outlines a microservices architecture for a scalable and secure payment gateway. Services communicate via a RabbitMQ message broker, and PostgreSQL is used for persistent storage.

## Services Overview

- **Auth Service**
  - Manages merchant and admin authentication.
  - Generates JWT tokens and handles session lifecycles.
  - Implements Role Based Access Control (RBAC).

- **Merchant Service**
  - Handles merchant registration and onboarding.
  - Issues and revokes API keys.
  - Optionally integrates KYC verification.

- **Transaction Service**
  - Initiates and records transactions.
  - Handles retries for failed payments.
  - Manages refunds and updates transaction statuses.

- **Payment Processor Service**
  - Integrates with external providers (Stripe, Razorpay, UPI).
  - Provides a unified interface for the Transaction Service.

- **Ledger Service**
  - Maintains transactional wallet balances for merchants and customers.
  - Records all debit/credit events.
  - Uses PostgreSQL for strong consistency and auditability.

- **Notification Service**
  - Sends real-time updates via Email, SMS and Webhooks.
  - Alerts merchants about payment and refund status changes.

- **Fraud Detection Service** (optional)
  - Scores transactions using velocity rules, geo/IP anomalies and behavior patterns.

- **Webhook Listener**
  - Receives asynchronous events from payment providers.
  - Updates transaction status accordingly.
- **Message Queue (RabbitMQ)**
  - Decouples services using an AMQP-compatible broker.
  - Transaction requests are published to a `transactions` queue and processed by dedicated workers.

- **Reporting & Analytics Service**
  - Provides dashboards, settlement reports and revenue metrics.
  - Data access is filtered by user role.

## Database Schema

The gateway can use multiple databases per service or a shared PostgreSQL instance depending on deployment scale. Below is a consolidated schema capturing core tables.

### merchants
| Column          | Type            | Description                    |
|-----------------|-----------------|--------------------------------|
| id              | SERIAL PRIMARY KEY | Merchant identifier           |
| name            | VARCHAR(255)    | Merchant display name         |
| email           | VARCHAR(255)    | Contact email                 |
| status          | VARCHAR(50)     | onboarded, suspended, etc.    |
| created_at      | TIMESTAMP       | record creation time          |
| updated_at      | TIMESTAMP       | last update time              |

### merchant_keys
| Column          | Type            | Description                    |
|-----------------|-----------------|--------------------------------|
| id              | SERIAL PRIMARY KEY | Key identifier               |
| merchant_id     | INTEGER         | references `merchants(id)`    |
| api_key         | VARCHAR(255)    | issued API key                |
| status          | VARCHAR(50)     | active, revoked               |
| created_at      | TIMESTAMP       | issuance time                 |
| revoked_at      | TIMESTAMP       | nullable                      |

### users
| Column          | Type            | Description                    |
|-----------------|-----------------|--------------------------------|
| id              | SERIAL PRIMARY KEY | User identifier              |
| merchant_id     | INTEGER         | references `merchants(id)`    |
| username        | VARCHAR(255)    | login username                |
| password_hash   | VARCHAR(255)    | hashed password               |
| role            | VARCHAR(50)     | admin, merchant, etc.         |
| created_at      | TIMESTAMP       | creation timestamp            |

### transactions
| Column          | Type            | Description                                |
|-----------------|-----------------|--------------------------------------------|
| id              | SERIAL PRIMARY KEY | Transaction identifier                    |
| merchant_id     | INTEGER         | references `merchants(id)`                |
| amount          | NUMERIC(12,2)   | transaction amount                        |
| currency        | VARCHAR(10)     | currency code                             |
| status          | VARCHAR(50)     | pending, success, failed, refunded        |
| provider        | VARCHAR(50)     | stripe, razorpay, upi                     |
| provider_txn_id | VARCHAR(255)    | identifier returned by provider          |
| created_at      | TIMESTAMP       | initiation time                           |
| updated_at      | TIMESTAMP       | last update time                          |

### transaction_attempts
| Column          | Type            | Description                                    |
|-----------------|-----------------|------------------------------------------------|
| id              | SERIAL PRIMARY KEY | Attempt identifier                            |
| transaction_id  | INTEGER         | references `transactions(id)`                 |
| attempt_no      | INTEGER         | retry count                                   |
| status          | VARCHAR(50)     | pending, success, failed                      |
| request_payload | JSONB           | provider request data                         |
| response_payload| JSONB           | provider response data                        |
| created_at      | TIMESTAMP       | attempt time                                  |

### refunds
| Column          | Type            | Description                                |
|-----------------|-----------------|--------------------------------------------|
| id              | SERIAL PRIMARY KEY | Refund identifier                         |
| transaction_id  | INTEGER         | references `transactions(id)`             |
| amount          | NUMERIC(12,2)   | amount refunded                           |
| status          | VARCHAR(50)     | pending, success, failed                  |
| provider_refund_id | VARCHAR(255) | refund identifier from provider          |
| created_at      | TIMESTAMP       | refund initiation time                    |
| updated_at      | TIMESTAMP       | last update time                          |

### ledger_entries
| Column          | Type            | Description                                   |
|-----------------|-----------------|-----------------------------------------------|
| id              | SERIAL PRIMARY KEY | Ledger entry ID                              |
| merchant_id     | INTEGER         | references `merchants(id)`                   |
| transaction_id  | INTEGER         | nullable, references `transactions(id)`      |
| credit          | NUMERIC(12,2)   | credit amount                                |
| debit           | NUMERIC(12,2)   | debit amount                                 |
| balance         | NUMERIC(12,2)   | resulting balance                            |
| entry_type      | VARCHAR(50)     | deposit, payment, refund, adjustment         |
| created_at      | TIMESTAMP       | event time                                   |

### webhooks
| Column          | Type            | Description                              |
|-----------------|-----------------|------------------------------------------|
| id              | SERIAL PRIMARY KEY | Webhook identifier                      |
| merchant_id     | INTEGER         | references `merchants(id)`              |
| url             | VARCHAR(255)    | callback endpoint                        |
| events          | VARCHAR(255)    | subscribed events comma separated        |
| created_at      | TIMESTAMP       | creation time                            |

### auth_tokens
| Column          | Type            | Description                              |
|-----------------|-----------------|------------------------------------------|
| id              | SERIAL PRIMARY KEY | Token ID                                |
| user_id         | INTEGER         | references `users(id)`                  |
| token           | VARCHAR(255)    | JWT token or session identifier          |
| expires_at      | TIMESTAMP       | expiration time                          |
| created_at      | TIMESTAMP       | issuance time                            |

### audit_logs
| Column          | Type            | Description                              |
|-----------------|-----------------|------------------------------------------|
| id              | SERIAL PRIMARY KEY | Log entry ID                            |
| user_id         | INTEGER         | references `users(id)`                  |
| action          | VARCHAR(255)    | description of the action                |
| created_at      | TIMESTAMP       | timestamp of action                      |

## Additional Considerations

- All tables should enforce foreign key constraints for data integrity.
- Sensitive data such as API keys and passwords must be stored hashed or encrypted.
- Index frequently queried fields like `merchant_id`, `status`, and `created_at`.
- Consider partitioning large tables (e.g., transactions) by time for scalability.

## Flow Summary
1. **Merchant Onboarding**: A merchant registers via the Merchant Service, which creates an entry in the `merchants` table and issues API keys stored in `merchant_keys`.
2. **Authentication**: Merchants or admins authenticate via the Auth Service, which validates credentials in the `users` table and issues JWT tokens logged in `auth_tokens`.
3. **Transaction Processing**:
   - The Transaction Service receives a payment request and records a new row in `transactions` with status `pending`.
   - The Payment Processor Service interacts with the chosen provider (Stripe/Razorpay/UPI) and stores each attempt in `transaction_attempts`.
   - On success or failure, the transaction `status` and ledger balances are updated.
4. **Refunds**: Refund requests create entries in `refunds` and corresponding `ledger_entries`.
5. **Webhook Handling**: Provider callbacks are captured by the Webhook Listener and update transaction records and notifications.
6. **Analytics & Reporting**: The Reporting Service aggregates data from `transactions`, `refunds` and `ledger_entries` to generate dashboards and settlement reports.

This schema and service layout provide a foundation for implementing the payment gateway in a microservices architecture.

