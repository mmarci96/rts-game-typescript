import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthFormProps {
    isLogin?: boolean;
    onSubmit: (data: any, isLogin: boolean) => void;
    onToggle: () => void;
}

export const ToggleForm = ({ isLogin = true, onSubmit, onToggle }: AuthFormProps) => {
    return (
        <div className="w-full max-w-xs bg-transparent">
            {isLogin ? (
                <LoginForm onSubmit={onSubmit} />
            ) : (
                <SignupForm onSubmit={onSubmit} />
            )}
            <div className="flex flex-col items-center text-center text-sm">
                <p className="text-gray-300 mb-2">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                </p>
                <button
                    type="button"
                    onClick={onToggle}
                >
                    {isLogin ? 'Create account' : 'Sign in'}
                </button>
            </div>
        </div>
    );
};
