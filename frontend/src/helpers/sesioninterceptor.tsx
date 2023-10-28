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
        const navigate = useNavigate();
        console.log('refresh_token');
        console.log(localStorage.getItem('refresh_token'));
        if (!localStorage.getItem('refresh_token')) {
            navigate('/login');
        }
        if (error.response.status === 401 && !refresh) {
            console.log('refreshing token...!')
            refresh = true;
            const response = await axios.post(
                'http://127.0.0.1:8000/token/refresh/',
                { refresh: localStorage.getItem('refresh_token') },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            if (response.status === 200) {
                // console.log(`changed token to response.data['access']`)
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data['access']}`;
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                return axiosSesion(error.config);
            }
        }
        refresh = false;
        console.log('[INFO] navigate');
        navigate('/login')
        return error;
    })

export default axiosSesion


// const useAxiosWithInterceptor = (): AxiosInstance => {

//     const axiosSesion = axios.create();
//     return axiosSesion;
// };


// if (!isAuthenticated) {
//   return (
//     <div className="container mt-3">
//       <h1>React Cookie Auth</h1>
//       <br />
//       <h2>Login</h2>
//       <form onSubmit={login}>
//         <div className="form-group">
//           <label htmlFor="username">Username</label>
//           <input type="text" className="form-control" id="username" name="username" value={username} onChange={handleUserNameChange} />
//         </div>
//         <div className="form-group">
//           <label htmlFor="username">Password</label>
//           <input type="password" className="form-control" id="password" name="password" value={password} onChange={handlePasswordChange} />
//           <div>
//             {error &&
//               <small className="text-danger">
//                 {error}
//               </small>
//             }
//           </div>
//         </div>
//         <button type="submit" className="btn btn-primary">Login</button>
//       </form>
//     </div>
//   )
// } else {
//   return (
//     <div className="container mt-3">
//       <h1>React Cookie Auth</h1>
//       <p>You are logged in!</p>
//       {/* <button className="btn btn-primary mr-2" onClick={this.whoami}>WhoAmI</button> */}
//       <button className="btn btn-danger" onClick={logout}>Log out</button>
//     </div>
//   )
// }
