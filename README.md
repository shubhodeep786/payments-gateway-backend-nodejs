# Payments Gateway Backend

  node app.js
  ```

## Auth Usage

### Login

Send a POST request to `/auth/login` with `username` and `password`. On success it returns a JWT which is stored in the `auth_tokens` table. Include the token as `Authorization: Bearer <token>` in subsequent requests.

### Logout

Send a POST request to `/auth/logout` with the same `Authorization` header to invalidate the session.

Protected routes use RBAC. Admins can register merchants via `POST /merchants/register` while merchants can access their profile at `GET /merchants/me`.
