"use strict";
exports.id = 347;
exports.ids = [347];
exports.modules = {

/***/ 9347:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   H: () => (/* binding */ AuthProvider),
/* harmony export */   a: () => (/* binding */ useAuth)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5893);
/* harmony import */ var aws_amplify__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5581);
/* harmony import */ var aws_amplify__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(aws_amplify__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);



const AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_2__.createContext)(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(true);
    (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(()=>{
        checkUser();
    }, []);
    async function checkUser() {
        try {
            const currentUser = await aws_amplify__WEBPACK_IMPORTED_MODULE_1__.Auth.currentAuthenticatedUser();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
        } finally{
            setLoading(false);
        }
    }
    async function signIn(email, password) {
        try {
            const user = await aws_amplify__WEBPACK_IMPORTED_MODULE_1__.Auth.signIn(email, password);
            setUser(user);
            return user;
        } catch (error) {
            throw error;
        }
    }
    async function signUp(email, password) {
        try {
            return await aws_amplify__WEBPACK_IMPORTED_MODULE_1__.Auth.signUp({
                username: email,
                password,
                attributes: {
                    email
                }
            });
        } catch (error) {
            throw error;
        }
    }
    async function confirmSignUp(email, code) {
        try {
            return await aws_amplify__WEBPACK_IMPORTED_MODULE_1__.Auth.confirmSignUp(email, code);
        } catch (error) {
            throw error;
        }
    }
    async function signOut() {
        try {
            await aws_amplify__WEBPACK_IMPORTED_MODULE_1__.Auth.signOut();
            setUser(null);
        } catch (error) {
            throw error;
        }
    }
    async function forgotPassword(email) {
        try {
            return await aws_amplify__WEBPACK_IMPORTED_MODULE_1__.Auth.forgotPassword(email);
        } catch (error) {
            throw error;
        }
    }
    async function resetPassword(email, code, newPassword) {
        try {
            return await aws_amplify__WEBPACK_IMPORTED_MODULE_1__.Auth.forgotPasswordSubmit(email, code, newPassword);
        } catch (error) {
            throw error;
        }
    }
    const value = {
        user,
        loading,
        signIn,
        signOut,
        signUp,
        confirmSignUp,
        forgotPassword,
        resetPassword
    };
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(AuthContext.Provider, {
        value: value,
        children: children
    });
}
function useAuth() {
    const context = (0,react__WEBPACK_IMPORTED_MODULE_2__.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}


/***/ })

};
;