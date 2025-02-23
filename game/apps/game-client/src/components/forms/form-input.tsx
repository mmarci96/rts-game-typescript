import { InputHTMLAttributes, forwardRef } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, ...props }, ref) => {
        return (
            <div className="mb-4">
                <label className="block text-gray-100 text-sm font-bold mb-2">
                    {label}
                </label>
                <input
                    ref={ref}
                    className={`shadow appearance-none border bg-gray-300 rounded-xl w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline ${
                        error ? "border-red-500" : ""
                    }`}
                    {...props}
                />
                {error && (
                    <p className="text-red-500 text-xs italic mt-1">{error}</p>
                )}
            </div>
        );
    },
);

FormInput.displayName = "FormInput";
