import axiosSesion from "@/components/helpers/sesioninterceptor";
import { useState } from 'react';

interface IuseCrud<T> {
    dataCRUD: T[] | null;
    fetchData: () => Promise<void>;
    error: Error | null;
    isLoading: boolean;
}

const useCrud = <T>(initalData: T[], apiURL: string): IuseCrud<T> => {
    const [dataCRUD, setDataCRUD] = useState<T[]>(initalData)
    const [error, setError] = useState<Error | null>(null)
    const [isLoading, setIsLoading] = useState(false);
    const fetchData = async () => {
        setIsLoading(true)
        try {
            const response = await axiosSesion.get(`http://127.0.0.1:8000/${apiURL}/`, {})
            const data = response.data
            // console.log(data)
            setDataCRUD(data)
            setError(null)
            setIsLoading(false)
            return data;
        } catch (error: any) {
            if (error.response && error.response.status === 400) {
                setError(new Error("400"))
            }
            setIsLoading(false)
            throw error;
        }
        //logic
    };

    return { fetchData, dataCRUD, error, isLoading }
}
export default useCrud