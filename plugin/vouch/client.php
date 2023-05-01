<?php

declare(strict_types=1);

class Client
{
    private string $baseUrl;
    private array $headers;
    private ?string $partnerId;
    private int $version;
    private string $prefix;

    public function __construct(string $url, ?string $accessToken = null, ?string $partnerId = null, ?int $version = null, ?string $prefix = null)
    {
        $this->baseUrl = $url;
        $this->version = $version ?? 1;
        $this->partnerId = $partnerId;
        $this->prefix = $prefix ?? "/api/version/{$this->version}";

        $this->headers = [
            "Content-Type" => "application/json",
            "Accept" => "application/json",
        ];

        if ($accessToken !== null) {
            $this->headers["Authorization"] = "Bearer {$accessToken}";
        }
        if ($partnerId !== null) {
            $this->headers["X-Partner-ID"] = $partnerId;
        }
    }

    public function acceptUniqueCode(string $uniqueCode, int $value): bool
    {
        $response = $this->fetchJson(
            "/accept-unique-code",
            "POST",
            [
                "uniqueCode" => $uniqueCode,
                "partnerId" => $this->partnerId,
                "value" => $value,
            ]
        );
        return $response["success"];
    }

    public function addPartner(string $partnerName, string $location, ?bool $remote = null, ?bool $onsite = null): array
    {
        $response = $this->fetchJson(
            "/add-partner",
            "POST",
            [
                "partnerName" => $partnerName,
                "location" => $location,
                "remote" => $remote,
                "onsite" => $onsite,
            ]
        );
        return $response;
    }

    public function assignUniqueCode(string $uniqueCode, int $value, string $partnerId): bool
    {
        $response = $this->fetchJson(
            "/assign-unique-code",
            "POST",
            [
                "uniqueCode" => $uniqueCode,
                "partnerId" => $partnerId,
                "value" => $value,
            ]
        );
        return $response["success"];
    }

    public function generateUniqueCode(int $value): string
    {
        $response = $this->fetchJson(
            "/generate-unique-code",
            "POST",
            [
                "partnerId" => $this->partnerId,
                "value" => $value,
            ]
        );
        return $response["uniqueCode"];
    }

    public function getUniqueCode(string $uniqueCode): array
    {
        $url ="/unique-code-data?uniqueCode={$uniqueCode}";

        return $this->fetchJson($url, "GET");
    }

    public function listPartners(): array
    {
        return $this->fetchJson("/partners", "GET");
    }

    public function listUniqueCodes(): array
    {
        return $this->fetchJson("/unique-codes", "GET");
    }
    public function processPayment(string $uniqueCode): bool
    {
        $response = $this->fetchJson(
            "/process-payment",
            "POST",
            [
                "uniqueCode" => $uniqueCode,
                "partnerId" => $this->partnerId,
            ]
        );
        return $response["success"];
    }

    public function verifyUniqueCode(string $uniqueCode, ?int $value = null): bool
    {
        $response = $this->fetchJson(
            "/verify-unique-code",
            "POST",
            [
                "uniqueCode" => $uniqueCode,
                "partnerId" => $this->partnerId,
                "value" => $value,
            ]
        );
        return $response["success"];
    }

    public function listSystemLogs(?string $partnerId = null): array
    {
        $url = "/system-logs?partnerId={$partnerId}";
        return $this->fetchJson($url, "GET");
    }

    public function getPublicUniqueCode(string $uniqueCode): array
    {
        $url = "/unique-code-details?uniqueCode={$uniqueCode}";

        return $this->fetchJson($url, "GET");
    }

    public function getWordpressAdmin(): string {
        $user = wp_get_current_user();
        $user_login = $user->user_login;
        return $this->fetchText("/wordpress-admin?username={$user_login}", "GET", null, "/");
    }

    private function fetchJson(string $url, string $method, ?array $body = null): array
    {
        $text = $this->fetchText($url, $method, $body);

        $json = json_decode($text, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Failed to parse JSON response: " . json_last_error_msg());
        }

        return $json;
    }

    private function fetchText(string $url, string $method, ?array $body = null, ?string $prefix = null): string
    {
        $options = [
            'method' => $method,
            'headers' => $this->headers,
            'timeout' => 30, // Set a timeout value
        ];
        if ($body !== null) {
            $options['body'] = json_encode($body);
        }
        $prefix = $prefix ?? $this->prefix;
        $pathname = "{$prefix}{$url}";
        $pathname = preg_replace("/^\/\//", "/", $pathname);
        $baseUrl = $this->baseUrl;
        $baseUrl = preg_replace("/\/$/", "", $baseUrl);

        $url = "{$baseUrl}{$pathname}";

        $response = $method === 'GET' ? wp_remote_get($url, $options) : wp_remote_post($url, $options);

        if (is_wp_error($response)) {
            throw new \RuntimeException("Request failed: " . $response->get_error_message());
        }

        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code !== 200) {
            throw new \RuntimeException("Request failed: {$response_code} " . wp_remote_retrieve_response_message($response));
        }

        $text = wp_remote_retrieve_body($response);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Failed to parse text response: " . json_last_error_msg());
        }

        return $text;
    }
}