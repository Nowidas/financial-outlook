import axios, { AxiosInstance } from 'axios';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';


const axiosSesion = axios.create({
    baseURL: '.',
});

// Add a request interceptor
axiosSesion.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            config.headers['Content-Type'] = 'application/json';
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let refresh = false;
axiosSesion.interceptors.response.use(
    (response) => {
        // console.log(response.data)
        return response;
    },
    async (error) => {
        console.log("refresh" + refresh);
        console.log(error.response.status);
        if (error.response.status === 401 && !refresh) {
            if (!localStorage.getItem('refresh_token')) {
                window.location.assign('/login')
            }
            refresh = true;
            console.log('refreshing token...')
            try {
                const res = await axios.post(
                    'http://127.0.0.1:8000/token/refresh/',
                    { refresh: localStorage.getItem('refresh_token') },
                    { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
                );
                console.log(res.status);
                if (res.status === 200) {
                    localStorage.setItem('access_token', res.data.access);
                    localStorage.setItem('refresh_token', res.data.refresh);
                    return axiosSesion(error.config);
                }
            } catch {
                window.location.assign('/login')
            }
        }

        refresh = false;
        return error;
    })

export default axiosSesion