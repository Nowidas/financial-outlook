import React, { useEffect, useState } from "react"
import axios from "axios";
import axiosSesion from '@/components/helpers/sesioninterceptor';

export const Logout = () => {
    useEffect(() => {
        (async () => {
            try {
                const { data } = await
                    axiosSesion.post('http://127.0.0.1:8000/logout/', {
                        refresh_token: localStorage.getItem('refresh_token')
                    }, {
                        withCredentials: true
                    });
                localStorage.clear();
                axiosSesion.defaults.headers.common['Authorization'] = null;
                window.location.href = '/login'
            } catch (e) {
                console.log('logout not working', e)
            }
        })();
    }, []);
    return (
        <div></div>
    )
}