"use strict";
exports.id = 780;
exports.ids = [780];
exports.modules = {

/***/ 9780:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (/* binding */ TaskForm)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1853);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_query__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1175);
/* harmony import */ var react_query__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_query__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _lib_api_apiClient__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7116);





function TaskForm({ taskId }) {
    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();
    const queryClient = (0,react_query__WEBPACK_IMPORTED_MODULE_3__.useQueryClient)();
    const isEditing = !!taskId;
    const [formData, setFormData] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assigneeId: "",
        teamId: "",
        dueDate: ""
    });
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    // Fetch task data if editing
    const { data: task, isLoading: taskLoading } = (0,react_query__WEBPACK_IMPORTED_MODULE_3__.useQuery)([
        "task",
        taskId
    ], ()=>_lib_api_apiClient__WEBPACK_IMPORTED_MODULE_4__/* .api */ .h.get(`/tasks/${taskId}`), {
        enabled: isEditing,
        onSuccess: (data)=>{
            setFormData({
                title: data.title,
                description: data.description,
                status: data.status,
                priority: data.priority,
                assigneeId: data.assigneeId,
                teamId: data.teamId,
                dueDate: data.dueDate ? data.dueDate.split("T")[0] : ""
            });
        }
    });
    // Fetch teams for dropdown
    const { data: teams, isLoading: teamsLoading } = (0,react_query__WEBPACK_IMPORTED_MODULE_3__.useQuery)("teams", ()=>_lib_api_apiClient__WEBPACK_IMPORTED_MODULE_4__/* .api */ .h.get("/teams"));
    // Create task mutation
    const createTask = (0,react_query__WEBPACK_IMPORTED_MODULE_3__.useMutation)((newTask)=>_lib_api_apiClient__WEBPACK_IMPORTED_MODULE_4__/* .api */ .h.post("/tasks", newTask), {
        onSuccess: ()=>{
            queryClient.invalidateQueries("tasks");
            router.push("/tasks");
        },
        onError: (err)=>{
            setError(err.message || "Failed to create task");
        }
    });
    // Update task mutation
    const updateTask = (0,react_query__WEBPACK_IMPORTED_MODULE_3__.useMutation)((updatedTask)=>_lib_api_apiClient__WEBPACK_IMPORTED_MODULE_4__/* .api */ .h.put(`/tasks/${taskId}`, updatedTask), {
        onSuccess: ()=>{
            queryClient.invalidateQueries([
                "task",
                taskId
            ]);
            queryClient.invalidateQueries("tasks");
            router.push(`/tasks/${taskId}`);
        },
        onError: (err)=>{
            setError(err.message || "Failed to update task");
        }
    });
    const handleChange = (e)=>{
        const { name, value } = e.target;
        setFormData((prev)=>({
                ...prev,
                [name]: value
            }));
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError("");
        try {
            if (isEditing) {
                await updateTask.mutateAsync(formData);
            } else {
                await createTask.mutateAsync(formData);
            }
        } catch (err) {
        // Error is handled in mutation callbacks
        }
    };
    if (isEditing && taskLoading) {
        return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
            className: "text-center py-4",
            children: "Loading task..."
        });
    }
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: "bg-white shadow overflow-hidden sm:rounded-lg",
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "px-4 py-5 sm:px-6",
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h3", {
                    className: "text-lg leading-6 font-medium text-gray-900",
                    children: isEditing ? "Edit Task" : "Create New Task"
                })
            }),
            error && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "bg-red-50 border-l-4 border-red-400 p-4 mx-6",
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                    className: "flex",
                    children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "ml-3",
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                            className: "text-sm text-red-700",
                            children: error
                        })
                    })
                })
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "border-t border-gray-200 px-4 py-5 sm:p-6",
                children: /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                    htmlFor: "title",
                                    className: "form-label",
                                    children: "Title"
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                    type: "text",
                                    id: "title",
                                    name: "title",
                                    value: formData.title,
                                    onChange: handleChange,
                                    required: true,
                                    className: "form-input"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                    htmlFor: "description",
                                    className: "form-label",
                                    children: "Description"
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("textarea", {
                                    id: "description",
                                    name: "description",
                                    rows: 3,
                                    value: formData.description,
                                    onChange: handleChange,
                                    className: "form-input"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            className: "grid grid-cols-1 gap-6 sm:grid-cols-2",
                            children: [
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                            htmlFor: "status",
                                            className: "form-label",
                                            children: "Status"
                                        }),
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", {
                                            id: "status",
                                            name: "status",
                                            value: formData.status,
                                            onChange: handleChange,
                                            className: "form-input",
                                            children: [
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                    value: "todo",
                                                    children: "To Do"
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                    value: "in_progress",
                                                    children: "In Progress"
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                    value: "review",
                                                    children: "In Review"
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                    value: "done",
                                                    children: "Done"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                            htmlFor: "priority",
                                            className: "form-label",
                                            children: "Priority"
                                        }),
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", {
                                            id: "priority",
                                            name: "priority",
                                            value: formData.priority,
                                            onChange: handleChange,
                                            className: "form-input",
                                            children: [
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                    value: "low",
                                                    children: "Low"
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                    value: "medium",
                                                    children: "Medium"
                                                }),
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                    value: "high",
                                                    children: "High"
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            className: "grid grid-cols-1 gap-6 sm:grid-cols-2",
                            children: [
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                            htmlFor: "teamId",
                                            className: "form-label",
                                            children: "Team"
                                        }),
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", {
                                            id: "teamId",
                                            name: "teamId",
                                            value: formData.teamId,
                                            onChange: handleChange,
                                            required: true,
                                            className: "form-input",
                                            children: [
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                    value: "",
                                                    children: "Select a team"
                                                }),
                                                teams?.map((team)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                        value: team.id,
                                                        children: team.name
                                                    }, team.id))
                                            ]
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                    children: [
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                            htmlFor: "assigneeId",
                                            className: "form-label",
                                            children: "Assignee"
                                        }),
                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", {
                                            id: "assigneeId",
                                            name: "assigneeId",
                                            value: formData.assigneeId,
                                            onChange: handleChange,
                                            className: "form-input",
                                            children: [
                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                    value: "",
                                                    children: "Unassigned"
                                                }),
                                                teams?.find((team)=>team.id === formData.teamId)?.members.map((member)=>/*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("option", {
                                                        value: member.id,
                                                        children: member.name
                                                    }, member.id))
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                    htmlFor: "dueDate",
                                    className: "form-label",
                                    children: "Due Date"
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                    type: "date",
                                    id: "dueDate",
                                    name: "dueDate",
                                    value: formData.dueDate,
                                    onChange: handleChange,
                                    className: "form-input"
                                })
                            ]
                        }),
                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            className: "flex justify-end space-x-3",
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                    type: "button",
                                    onClick: ()=>router.back(),
                                    className: "btn btn-secondary",
                                    children: "Cancel"
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                    type: "submit",
                                    disabled: createTask.isLoading || updateTask.isLoading,
                                    className: "btn btn-primary",
                                    children: createTask.isLoading || updateTask.isLoading ? "Saving..." : isEditing ? "Update Task" : "Create Task"
                                })
                            ]
                        })
                    ]
                })
            })
        ]
    });
}


/***/ })

};
;