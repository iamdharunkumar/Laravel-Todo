# Laravel Sanctum Integration (Production-ready)

This project now uses Laravel Sanctum for API authentication. Follow the steps below to enable and use Sanctum in production.

## Install

Run in the `backend` folder:

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

## Model

The `User` model includes the `HasApiTokens` trait. You can create tokens like:

```php
$token = $user->createToken('api-token')->plainTextToken;
```

## Routes

Protected routes use the `auth:sanctum` middleware. Example in `routes/web.php`:

- `POST /api/logout` — protected
- `GET /api/me` — protected
- `/api/todos/*` — protected

## Login / Register

`AuthController` now returns a plain-text token on register/login. The client should store this securely and send it as an `Authorization: Bearer {token}` header.

## Logout

`POST /api/logout` revokes the current access token. To revoke all tokens for a user, run `$user->tokens()->delete()`.

## Security Recommendations

- Use HTTPS for all requests.
- Prefer short token lifetimes for high-risk clients and rotate tokens periodically.
- Scope tokens with abilities when needed: `$user->createToken('name', ['todos:create'])->plainTextToken`.
- Store tokens hashed when possible (Sanctum stores hashed tokens by default).
- Apply rate limiting (`throttle`) and monitoring on auth endpoints.

## Notes

- After installing Sanctum, ensure your `config/auth.php` has the `sanctum` guard configured (default Laravel setup is usually sufficient).
- If you want first-party SPA authentication (cookie-based), configure `EnsureFrontendRequestsAreStateful` and CORS appropriately.
