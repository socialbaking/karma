<?php

declare(strict_types=1);

namespace Vouch;

interface VouchClient
{
    public function acceptUniqueCode(string $uniqueCode, int $value): bool;

    public function addPartner(string $partnerName, string $location, ?bool $remote = null, ?bool $onsite = null): string;

    public function assignUniqueCode(string $uniqueCode, int $value, string $partnerId): bool;

    public function generateUniqueCode(int $value): string;

    public function getUniqueCode(string $uniqueCode): UniqueCode;

    public function listPartners(): array;

    public function listUniqueCodes(): array;

    public function processPayment(string $uniqueCode): bool;

    public function verifyUniqueCode(string $uniqueCode, ?int $value = null): bool;

    public function listSystemLogs(?string $partnerId = null): array;

    public function getPublicUniqueCode(string $uniqueCode): PublicUniqueCode;
}

interface ClientOptions
{
    public function __construct(string $url, ?string $accessToken = null, ?string $partnerId = null, ?int $version = null, ?string $prefix = null);

    public function acceptUniqueCode(string $uniqueCode, int $value): bool;

    public function addPartner(string $partnerName, string $location, ?bool $remote = null, ?bool $onsite = null): string;

    public function assignUniqueCode(string $uniqueCode, int $value, string $partnerId): bool;

    public function generateUniqueCode(int $value): string;

    public function getUniqueCode(string $uniqueCode): UniqueCode;

    public function listPartners(): array;

    public function listUniqueCodes(): array;

    public function processPayment(string $uniqueCode): bool;

    public function verifyUniqueCode(string $uniqueCode, ?int $value = null): bool;

    public function listSystemLogs(?string $partnerId = null): array;

    public function getPublicUniqueCode(string $uniqueCode): PublicUniqueCode;
}

class Headers
{
    public function set(string $name, string $value): void;
}

final class Client implements VouchClient
{
    private string $baseUrl;
    private Headers $headers;
    private ?string $partnerId;
    private int $version;
    private string $prefix;

    public function __construct(string|\URL $url, ?string $accessToken = null, ?string $partnerId = null, ?int $version = null, ?string $prefix = null)
    {
        $this->baseUrl = $url;
        $this->version = $version ?? 1;
        $this->partnerId = $partnerId;
        $this->prefix = $prefix ?? "/api/version/{$this->version}";

        $headers = $this->headers = new Headers();
        $headers->set("Content-Type", "application/json");
        $headers->set("Accept", "application/json");
        if ($accessToken !== null) {
            $headers->set("Authorization", "Bearer {$accessToken}");
        }
        if ($partnerId !== null) {
            $headers->set("X-Partner-ID", $partnerId);
        }
    }

    public function acceptUniqueCode(string $uniqueCode, int $value): bool
    {
        $response = $this->fetchJson(
            "{$this->prefix}/accept-unique-code",
            "POST",
            [
                "uniqueCode" => $uniqueCode,
                "partnerId" => $this->partnerId,
                "value" => $value,
            ]
        );
        return $response["success"];
    }

    public function addPartner(string $partnerName, string $location, ?bool $remote = null, ?bool $onsite = null): string
    {
        $response = $this->fetchJson(
            "{$this->prefix}/add-partner",
            "POST",
            [
                "partnerName" => $partnerName,
                "location" => $location,
                "remote" => $remote,
                "onsite" => $onsite,
            ]
        );
        return $response["partnerId"];
    }

    public function assignUniqueCode(string $uniqueCode, int $value, string $partnerId): bool
    {
        $response = $this->fetchJson(
            "{$this->prefix}/assign-unique-code",
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
            "{$this->prefix}/generate-unique-code",
            "POST",
            [
                "partnerId" => $this->partnerId,
                "value" => $value,
            ]
        );
        return $response["uniqueCode"];
    }

    public function getUniqueCode(string $uniqueCode): UniqueCode
    {
        $url = new \URL("{$this->prefix}/unique-code-data", $this->baseUrl);
        $url->searchParams->set("uniqueCode", $uniqueCode);

        $response = $this->fetchJson((string) $url, "GET");
        return $response;
    }

    public function listPartners(): array
    {
        $response = $this->fetchJson("{$this->prefix}/partners", "GET");
        return $response;
    }

    public function listUniqueCodes(): array
    {
        $response = $this->fetchJson("{$this->prefix}/unique-codes", "GET");
        return $response;
    }
public function processPayment(string $uniqueCode): bool
    {
        $response = $this->fetchJson(
            "{$this->prefix}/process-payment",
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
            "{$this->prefix}/verify-unique-code",
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
        $url = new \URL("{$this->prefix}/system-logs", $this->baseUrl);
        if ($partnerId !== null) {
            $url->searchParams->set("partnerId", $partnerId);
        }

        $response = $this->fetchJson((string) $url, "GET");
        return $response;
    }

    public function getPublicUniqueCode(string $uniqueCode): PublicUniqueCode
    {
        $url = new \URL("{$this->prefix}/unique-code-details", $this->baseUrl);
        $url->searchParams->set("uniqueCode", $uniqueCode);

        $response = $this->fetchJson((string) $url, "GET");
        return $response;
    }

    private function fetchJson(string $url, string $method, ?array $body = null): array
    {
        $options = ["method" => $method, "headers" => $this->headers];
        if ($body !== null) {
            $options["body"] = json_encode($body);
        }

        $response = fetch(new \Request($url, $options));
        if (!$response->ok) {
            throw new \RuntimeException("Request failed: {$response->status} {$response->statusText}");
        }

        $json = json_decode($response->text, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Failed to parse JSON response: " . json_last_error_msg());
        }

        return $json;
    }
}