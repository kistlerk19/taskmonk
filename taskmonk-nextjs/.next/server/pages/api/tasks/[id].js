"use strict";
(() => {
var exports = {};
exports.id = 322;
exports.ids = [322];
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

/***/ 9834:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _lib_api_middleware__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7145);

// Mock data - in a real app, this would be in a database
const tasks = [
    {
        id: "1",
        title: "Implement authentication",
        description: "Set up AWS Cognito authentication for the application",
        status: "done",
        priority: "high",
        assigneeId: "1",
        assignee: {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "developer"
        },
        teamId: "1",
        dueDate: "2023-07-15",
        createdAt: "2023-07-01",
        updatedAt: "2023-07-10"
    },
    {
        id: "2",
        title: "Design dashboard UI",
        description: "Create wireframes and implement the dashboard UI",
        status: "in_progress",
        priority: "medium",
        assigneeId: "2",
        assignee: {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "designer"
        },
        teamId: "1",
        dueDate: "2023-07-20",
        createdAt: "2023-07-05",
        updatedAt: "2023-07-12"
    },
    {
        id: "3",
        title: "API integration",
        description: "Connect frontend with backend API endpoints",
        status: "todo",
        priority: "high",
        assigneeId: "1",
        assignee: {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "developer"
        },
        teamId: "2",
        dueDate: "2023-07-25",
        createdAt: "2023-07-08",
        updatedAt: "2023-07-08"
    }
];
async function handler(req, res) {
    const { id } = req.query;
    const taskIndex = tasks.findIndex((task)=>task.id === id);
    if (taskIndex === -1) {
        res.status(404).json({
            message: "Task not found"
        });
        return;
    }
    try {
        switch(req.method){
            case "GET":
                res.status(200).json(tasks[taskIndex]);
                return;
            case "PUT":
                const updatedTask = {
                    ...tasks[taskIndex],
                    ...req.body,
                    updatedAt: new Date().toISOString()
                };
                tasks[taskIndex] = updatedTask;
                res.status(200).json(updatedTask);
                return;
            case "DELETE":
                const deletedTask = tasks[taskIndex];
                tasks.splice(taskIndex, 1);
                res.status(200).json(deletedTask);
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
var __webpack_exports__ = (__webpack_exec__(9834));
module.exports = __webpack_exports__;

})();