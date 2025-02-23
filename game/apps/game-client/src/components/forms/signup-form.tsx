import { useState } from "react";
import { FormInput } from "./form-input";

interface SignupFormProps {
    onSubmit: (
        data: { username: string; email: string; password: string },
        isLogin: boolean,
    ) => void;
}

export const SignupForm = ({ onSubmit }: SignupFormProps) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ username, email, password }, false);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <FormInput
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <FormInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <FormInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <div className="flex flex-col items-center">
                <button type="submit">Register</button>
            </div>
        </form>
    );
};
