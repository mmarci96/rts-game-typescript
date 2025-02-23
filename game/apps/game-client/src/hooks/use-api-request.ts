import { useState } from "react";
import { HttpMethod } from "../types";

export const useApiRequest = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchApiData = async (
        url: string,
        method: HttpMethod,
        requestBodyData: null | {},
    ) => {
        try {
            setLoading(true);
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: requestBodyData && JSON.stringify(requestBodyData),
            });
            const { data } = await res.json();
            if (!res.ok) {
                const msg = data.error.message as string;
                setError(msg);
            }
            return data;
        } catch (e: unknown) {
            const errMsg = (e as Error).message;
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };
    return { loading, error, fetchApiData };
};
