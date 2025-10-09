package com.afyaquik.hms.common.web;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Standard envelope for all API responses to provide consistent shape for the frontend.
 */
public record ApiResponse<T>(
        String status,
        T data,
        List<ApiError> errors,
        Map<String, Object> meta,
        OffsetDateTime timestamp
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("OK", data, null, null, OffsetDateTime.now());
    }

    public static <T> ApiResponse<T> success(T data, Map<String, Object> meta) {
        return new ApiResponse<>("OK", data, null, meta, OffsetDateTime.now());
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("ERROR", null, List.of(new ApiError(message)), null, OffsetDateTime.now());
    }

    public static <T> ApiResponse<T> error(List<ApiError> errors) {
        return new ApiResponse<>("ERROR", null, errors, null, OffsetDateTime.now());
    }

    public record ApiError(String message) {}
}
