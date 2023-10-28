// Import the react JS packages 
import axios from "axios";
import React, { useState } from "react";
import Layout from "@/components/layout/auth_layout"

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

// Define the Login function.
interface IProps {
    msg: string;
}

const formSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1)
})

export const Login: React.FC<IProps> = ({ msg }) => {
    const [error, setError] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",

        }
    })
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values);
        // Create the POST requuest
        axios.post('http://127.0.0.1:8000/token/', values, { headers: { 'Content-Type': 'application/json' }, withCredentials: true })
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
        <Layout>
            <div className="outline outline-offset-4 outline-inherit rounded-sm p-6">
                <div className="space-y-4 py-2 pb-4 w-96">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your username" {...field} />
                                        </FormControl>
                                        {/* <FormDescription>
                                            This is your public display name.
                                        </FormDescription> */}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter your password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        {error && <p className="text-sm font-medium text-destructive" >Invalid password</p>}
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="mt-6 w-full" >Login</Button>
                        </form>
                    </Form>
                </div>
            </div>
        </Layout>
    );
};