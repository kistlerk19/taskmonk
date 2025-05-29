"use strict";
(() => {
var exports = {};
exports.id = 288;
exports.ids = [288];
exports.modules = {

/***/ 7145:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Q: () => (/* binding */ withAuth)
/* harmony export */ });
function withAuth(handler) {
    return async (req, res)=>{
        try {
            // In a real application, you would verify the JWT token from the Authorization header
            // For this mock implementation, we'll just check if the Authorization header exists
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.status(401).json({
                    message: "Unauthorized"
                });
                return;
            }
            // In production, you would verify the token with Cognito
            // const token = authHeader.split(' ')[1];
            // Verify token with AWS Cognito
            await handler(req, res);
            return;
        } catch (error) {
            res.status(401).json({
                message: error.message || "Authentication failed"
            });
            return;
        }
    };
}


/***/ }),

/***/ 9858:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_api_middleware__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7145);

// Mock user data
const user = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "developer",
    teamId: "1"
};
async function handler(req, res) {
    try {
        switch(req.method){
            case "GET":
                res.status(200).json(user);
                return;
            case "PUT":
                // Update user profile
                const updatedUser = {
                    ...user,
                    ...req.body
                };
                // In a real app, you would save this to a database
                Object.assign(user, updatedUser);
                res.status(200).json(updatedUser);
                return;
            default:
                res.setHeader("Allow", [
                    "GET",
                    "PUT"
                ]);
                res.status(405).end(`Method ${req.method} Not Allowed`);
                return;
        }
    } catch (error) {
        res.status(500).json({
            message: error.message || "Internal Server Error"
        });
        return;
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_lib_api_middleware__WEBPACK_IMPORTED_MODULE_0__/* .withAuth */ .Q)(handler));


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(9858));
module.exports = __webpack_exports__;

})();