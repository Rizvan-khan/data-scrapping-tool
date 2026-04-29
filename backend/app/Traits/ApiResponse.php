<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    // ─────────────────────────────────────────────
    // SUCCESS RESPONSES
    // ─────────────────────────────────────────────

    /**
     * 200 OK — Data fetch ya generic success
     */
    protected function success(mixed $data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $code);
    }

    /**
     * 201 Created — Naya resource ban gaya
     */
    protected function created(mixed $data = null, string $message = 'Resource created successfully'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    /**
     * 200 OK — Koi data nahi, sirf message
     */
    protected function message(string $message, int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
        ], $code);
    }

    /**
     * 200 OK — Paginated list ke liye
     */
    protected function paginated(mixed $paginator, string $message = 'Success'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $paginator->items(),
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'last_page'    => $paginator->lastPage(),
                'has_more'     => $paginator->hasMorePages(),
            ],
        ], 200);
    }

    // ─────────────────────────────────────────────
    // ERROR RESPONSES
    // ─────────────────────────────────────────────

    /**
     * 400 Bad Request — Client ne galat data bheja
     */
    protected function badRequest(string $message = 'Bad request', mixed $errors = null): JsonResponse
    {
        return $this->error($message, 400, $errors);
    }

    /**
     * 401 Unauthorized — Login nahi hai ya token invalid
     */
    protected function unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->error($message, 401);
    }

    /**
     * 403 Forbidden — Login hai but permission nahi
     */
    protected function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return $this->error($message, 403);
    }

    /**
     * 404 Not Found — Resource mila nahi
     */
    protected function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return $this->error($message, 404);
    }

    /**
     * 422 Unprocessable — Validation fail (manual use ke liye)
     */
    protected function validationError(mixed $errors, string $message = 'Validation failed'): JsonResponse
    {
        return $this->error($message, 422, $errors);
    }

    /**
     * 429 Too Many Requests — Rate limit
     */
    protected function tooManyRequests(string $message = 'Too many requests. Please slow down.'): JsonResponse
    {
        return $this->error($message, 429);
    }

    /**
     * 500 Internal Server Error — Server side issue
     */
    protected function serverError(string $message = 'Something went wrong. Please try again later.'): JsonResponse
    {
        return $this->error($message, 500);
    }

    /**
     * Generic error builder — sabhi error methods isko call karte hain
     */
    protected function error(string $message, int $code = 400, mixed $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }
}