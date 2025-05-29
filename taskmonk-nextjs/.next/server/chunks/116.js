"use strict";
exports.id = 116;
exports.ids = [116];
exports.modules = {

/***/ 7116:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  h: () => (/* binding */ api)
});

// EXTERNAL MODULE: external "aws-amplify"
var external_aws_amplify_ = __webpack_require__(5581);
;// CONCATENATED MODULE: ./src/lib/api/errorHandler.ts
/**
 * Custom API error class
 */ class ApiError extends Error {
    constructor(message, status = 500, data = null){
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}
/**
 * Parse API error response
 */ async function parseApiError(response) {
    try {
        const data = await response.json();
        return new ApiError(data.message || response.statusText || "API Error", response.status, data);
    } catch (error) {
        return new ApiError(response.statusText || "API Error", response.status);
    }
}

;// CONCATENATED MODULE: ./src/lib/api/apiClient.ts


// Use the API URL from environment variables
const API_URL = "https://e9fra35uv2.execute-api.eu-west-1.amazonaws.com/dev/" || 0;
/**
 * Get authentication headers for API requests
 */ async function getAuthHeaders() {
    try {
        const session = await external_aws_amplify_.Auth.currentSession();
        const token = session.getIdToken().getJwtToken();
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    } catch (error) {
        return {
            "Content-Type": "application/json"
        };
    }
}
/**
 * Generic request function with error handling
 */ async function request(endpoint, options = {}) {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers || {}
            }
        });
        if (!response.ok) {
            throw await parseApiError(response);
        }
        return response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof Error) {
            throw new ApiError(error.message);
        }
        throw new ApiError("An unexpected error occurred");
    }
}
/**
 * API client with methods for different HTTP verbs
 */ const api = {
    /**
   * Make a GET request to the API
   */ get: (endpoint)=>request(endpoint, {
            method: "GET"
        }),
    /**
   * Make a POST request to the API with JSON data
   */ post: (endpoint, data)=>request(endpoint, {
            method: "POST",
            body: JSON.stringify(data)
        }),
    /**
   * Make a PUT request to the API with JSON data
   */ put: (endpoint, data)=>request(endpoint, {
            method: "PUT",
            body: JSON.stringify(data)
        }),
    /**
   * Make a DELETE request to the API
   */ delete: (endpoint)=>request(endpoint, {
            method: "DELETE"
        })
};


/***/ })

};
;