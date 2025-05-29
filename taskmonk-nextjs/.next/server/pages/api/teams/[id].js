"use strict";
(() => {
var exports = {};
exports.id = 658;
exports.ids = [658];
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

/***/ 3089:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_api_middleware__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7145);

// Mock data for teams
const teams = [
    {
        id: "1",
        name: "Frontend Team",
        description: "Responsible for the user interface and experience",
        members: [
            {
                id: "1",
                name: "John Doe",
                email: "john@example.com",
                role: "developer"
            },
            {
                id: "2",
                name: "Jane Smith",
                email: "jane@example.com",
                role: "designer"
            }
        ],
        createdAt: "2023-06-15"
    },
    {
        id: "2",
        name: "Backend Team",
        description: "Responsible for the server-side logic and database",
        members: [
            {
                id: "3",
                name: "Bob Johnson",
                email: "bob@example.com",
                role: "developer"
            }
        ],
        createdAt: "2023-06-20"
    },
    {
        id: "3",
        name: "DevOps Team",
        description: "Responsible for deployment and infrastructure",
        members: [
            {
                id: "4",
                name: "Alice Williams",
                email: "alice@example.com",
                role: "devops"
            }
        ],
        createdAt: "2023-06-25"
    }
];
async function handler(req, res) {
    const { id } = req.query;
    const teamIndex = teams.findIndex((team)=>team.id === id);
    if (teamIndex === -1) {
        res.status(404).json({
            message: "Team not found"
        });
        return;
    }
    try {
        switch(req.method){
            case "GET":
                res.status(200).json(teams[teamIndex]);
                return;
            case "PUT":
                const updatedTeam = {
                    ...teams[teamIndex],
                    ...req.body
                };
                teams[teamIndex] = updatedTeam;
                res.status(200).json(updatedTeam);
                return;
            case "DELETE":
                const deletedTeam = teams[teamIndex];
                teams.splice(teamIndex, 1);
                res.status(200).json(deletedTeam);
                return;
            default:
                res.setHeader("Allow", [
                    "GET",
                    "PUT",
                    "DELETE"
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
var __webpack_exports__ = (__webpack_exec__(3089));
module.exports = __webpack_exports__;

})();