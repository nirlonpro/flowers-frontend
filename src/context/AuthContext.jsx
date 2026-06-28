import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

const AUTO_LOGOUT = 1 * 60 * 1000; // 15 Minutes

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ==========================================
       Check Authentication
    ========================================== */

    const checkAuth = async () => {

        try {

            const res = await api.get("/auth/me");

            if (res.data.success) {

                setUser(res.data);

            }

        } catch {

            setUser(null);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        checkAuth();

    }, []);

    /* ==========================================
       Login
    ========================================== */

    const login = async (password) => {

        const res = await api.post("/auth/login", {
            password,
        });

        await checkAuth();

        return res.data;

    };

    /* ==========================================
       Logout
    ========================================== */

    const logout = async () => {

        try {

            await api.post("/auth/logout");

        } catch (error) {

            console.error(error);

        }

        setUser(null);

    };

    /* ==========================================
       Auto Logout After 15 Minutes
    ========================================== */

    useEffect(() => {

        if (!user) return;

        let timer;

        const resetTimer = () => {

            clearTimeout(timer);

            timer = setTimeout(() => {

                logout();

            }, AUTO_LOGOUT);

        };

        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keydown", resetTimer);
        window.addEventListener("click", resetTimer);
        window.addEventListener("scroll", resetTimer);

        resetTimer();

        return () => {

            clearTimeout(timer);

            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keydown", resetTimer);
            window.removeEventListener("click", resetTimer);
            window.removeEventListener("scroll", resetTimer);

        };

    }, [user]);

    return (

        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}

export const useAuth = () => useContext(AuthContext);