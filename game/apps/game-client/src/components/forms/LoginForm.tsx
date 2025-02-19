import { useState } from 'react';
import FormInput from './FormInput';

interface LoginFormProps {
    onSubmit: (data: { email: string; password: string }) => void;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ email, password });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
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
            <div className="flex items-center flex-col">
                <button
                    type="submit"
                >
                    Login
                </button>
            </div>
        </form>
    );
};
