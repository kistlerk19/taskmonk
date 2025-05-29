"use strict";
exports.id = 681;
exports.ids = [681];
exports.modules = {

/***/ 4681:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (/* binding */ TeamForm)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1853);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_query__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1175);
/* harmony import */ var react_query__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_query__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _lib_api_apiClient__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7116);





function TeamForm({ teamId }) {
    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();
    const queryClient = (0,react_query__WEBPACK_IMPORTED_MODULE_3__.useQueryClient)();
    const isEditing = !!teamId;
    const [formData, setFormData] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({
        name: "",
        description: "",
        members: []
    });
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    // Fetch team data if editing
    const { data: team, isLoading: teamLoading } = (0,react_query__WEBPACK_IMPORTED_MODULE_3__.useQuery)([
        "team",
        teamId
    ], ()=>_lib_api_apiClient__WEBPACK_IMPORTED_MODULE_4__/* .api */ .h.get(`/teams/${teamId}`), {
        enabled: isEditing,
        onSuccess: (data)=>{
            setFormData({
                name: data.name,
                description: data.description,
                members: data.members
            });
        }
    });
    // Create team mutation
    const createTeam = (0,react_query__WEBPACK_IMPORTED_MODULE_3__.useMutation)((newTeam)=>_lib_api_apiClient__WEBPACK_IMPORTED_MODULE_4__/* .api */ .h.post("/teams", newTeam), {
        onSuccess: ()=>{
            queryClient.invalidateQueries("teams");
            router.push("/teams");
        },
        onError: (err)=>{
            setError(err.message || "Failed to create team");
        }
    });
    // Update team mutation
    const updateTeam = (0,react_query__WEBPACK_IMPORTED_MODULE_3__.useMutation)((updatedTeam)=>_lib_api_apiClient__WEBPACK_IMPORTED_MODULE_4__/* .api */ .h.put(`/teams/${teamId}`, updatedTeam), {
        onSuccess: ()=>{
            queryClient.invalidateQueries([
                "team",
                teamId
            ]);
            queryClient.invalidateQueries("teams");
            router.push(`/teams/${teamId}`);
        },
        onError: (err)=>{
            setError(err.message || "Failed to update team");
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
                await updateTeam.mutateAsync(formData);
            } else {
                await createTeam.mutateAsync(formData);
            }
        } catch (err) {
        // Error is handled in mutation callbacks
        }
    };
    if (isEditing && teamLoading) {
        return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
            className: "text-center py-4",
            children: "Loading team..."
        });
    }
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
        className: "bg-white shadow overflow-hidden sm:rounded-lg",
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                className: "px-4 py-5 sm:px-6",
                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h3", {
                    className: "text-lg leading-6 font-medium text-gray-900",
                    children: isEditing ? "Edit Team" : "Create New Team"
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
                                    htmlFor: "name",
                                    className: "form-label",
                                    children: "Team Name"
                                }),
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                    type: "text",
                                    id: "name",
                                    name: "name",
                                    value: formData.name,
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
                        isEditing && /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                            children: [
                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("label", {
                                    className: "form-label",
                                    children: "Team Members"
                                }),
                                /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                    className: "mt-1 bg-gray-50 p-4 rounded-md",
                                    children: [
                                        formData.members && formData.members.length > 0 ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ul", {
                                            className: "divide-y divide-gray-200",
                                            children: formData.members.map((member)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", {
                                                    className: "py-3 flex justify-between items-center",
                                                    children: [
                                                        /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                            children: [
                                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                                    className: "text-sm font-medium text-gray-900",
                                                                    children: member.name
                                                                }),
                                                                /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                                    className: "text-sm text-gray-500",
                                                                    children: member.email
                                                                })
                                                            ]
                                                        }),
                                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                            className: "text-sm text-gray-500 capitalize",
                                                            children: member.role
                                                        })
                                                    ]
                                                }, member.id))
                                        }) : /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                            className: "text-sm text-gray-500",
                                            children: "No members in this team yet."
                                        }),
                                        /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                            className: "mt-4",
                                            children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                type: "button",
                                                onClick: ()=>router.push(`/teams/${teamId}/invite`),
                                                className: "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
                                                children: "Invite Members"
                                            })
                                        })
                                    ]
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
                                    disabled: createTeam.isLoading || updateTeam.isLoading,
                                    className: "btn btn-primary",
                                    children: createTeam.isLoading || updateTeam.isLoading ? "Saving..." : isEditing ? "Update Team" : "Create Team"
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