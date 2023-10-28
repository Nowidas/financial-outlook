// Import the react JS packages 
import axios from "axios";
import React, { useState } from "react";
// Define the Login function.
interface IProps {
    msg: string;
}

export const Login: React.FC<IProps> = ({ msg }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [data, setData] = useState({});
    const [error, setError] = useState(false);
    // Create the submit method.
    const submit = async e => {
        e.preventDefault();
        const user = {
            username: username,
            password: password
        };
        // Create the POST requuest
        axios.post('http://127.0.0.1:8000/token/', user, { headers: { 'Content-Type': 'application/json' }, withCredentials: true })
            .then((resp) => {
                setError(false)
                // Initialize the access & refresh token in localstorage.      
                localStorage.clear();
                localStorage.setItem('access_token', resp.data.access);
                localStorage.setItem('refresh_token', resp.data.refresh);
                axios.defaults.headers.common['Authorization'] =
                    `Bearer ${resp.data['access']}`;
                window.location.href = '/'
            })
            .catch((err) => setError(true))

    }

    return (
        <>
            <div className="Auth-form-container">
                {error && <p>Bad credentials...</p>}
                <form className="Auth-form" onSubmit={submit}>
                    <div className="Auth-form-content">
                        <h3 className="Auth-form-title">Sign In</h3>
                        <div className="form-group mt-3">
                            <label>Username</label>
                            <input className="form-control mt-1"
                                placeholder="Enter Username"
                                name='username'
                                type='text' value={username}
                                required
                                onChange={e => setUsername(e.target.value)} />
                        </div>
                        <div className="form-group mt-3">
                            <label>Password</label>
                            <input name='password'
                                type="password"
                                className="form-control mt-1"
                                placeholder="Enter password"
                                value={password}
                                required
                                onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="d-grid gap-2 mt-3">
                            <button type="submit"
                                className="btn btn-primary">Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};