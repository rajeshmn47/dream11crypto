// GitHubCallback.jsx
import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../constants/userConstants";
import { loadUser } from "../../actions/userAction";
import { useDispatch } from "react-redux";

const GitHubCallback = () => {
    const navigate = useNavigate();
    const code = new URLSearchParams(window.location.search).get("code");
    const hasFetched = useRef(false); // prevent multiple fetches
    const dispatch = useDispatch();

    useEffect(() => {
        async function getCode() {
            if (hasFetched.current) return; // prevent multiple fetches
            if (code) {
                hasFetched.current = true;
                const { data } = await axios.get(`${URL}/auth/githublogin?code=${code}`)
                localStorage.setItem('token', data.server_token);
                dispatch(loadUser());
                navigate('/')
            }
        }
        getCode();
    }, [code]);

    return (
        <div className="flex items-center justify-center h-screen bg-white text-xl">
            Logging in via GitHub...
        </div>
    );
};

export default GitHubCallback;
