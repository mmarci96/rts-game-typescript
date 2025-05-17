import React, { useState } from "react";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { useUserContext } from "@/context/user-context";
import { Chip } from "@heroui/react";
import { RiErrorWarningFill } from "react-icons/ri";
import { UserData } from "@/types";

export const AuthForm = () => {
    const [formFields, setFormFields] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState("login");
    const { userData, onLogin } = useUserContext();

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
        setError(null);
        const { name, value } = e.currentTarget;
        setFormFields((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const endpoint = `/api/auth/${selected}`;

        const formData = formFields;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const err = await response.json();
            setError(err.message);
            return;
        }

        const { data }: { data: UserData } = await response.json();
        onLogin(data);
        console.log(`Request ${selected} response:  `, data);
    };

    return userData.id ? (
        <p>Already logged in</p>
    ) : (
        <Form
            className="w-full mx-auto max-w-sm flex flex-col items-center ring-1 ring-secondary rounded-xl p-8"
            onSubmit={handleSubmit}
        >
            <Tabs
                aria-label="Login or Sing up to play!"
                selectedKey={selected}
                size="md"
                onSelectionChange={(e) => {
                    setSelected(e.toString());
                    setError(null);
                }}
            >
                <Tab key={"login"} title="Login">
                    <div className="w-full max-w-md flex flex-col items-center gap-4">
                        <Input
                            label="Email"
                            labelPlacement="outside"
                            name="email"
                            type="email"
                            value={formFields.email}
                            placeholder="Enter your email"
                            onChange={handleChange}
                        />
                        <Input
                            labelPlacement="outside"
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="Please enter your password"
                            onChange={handleChange}
                            value={formFields.password}
                        />
                        <Button
                            className="mx-auto w-full max-w-32"
                            type="submit"
                            color="secondary"
                            variant="bordered"
                        >
                            Login
                        </Button>
                    </div>
                </Tab>
                <Tab key={"signup"} title="Create Account">
                    <div className="w-full max-w-md flex flex-col items-center gap-4">
                        <Input
                            label="Email"
                            labelPlacement="outside"
                            name="email"
                            type="email"
                            value={formFields.email}
                            placeholder="Enter your email"
                            onChange={handleChange}
                        />
                        <Input
                            label="Username"
                            labelPlacement="outside"
                            name="username"
                            value={formFields.username}
                            placeholder="Enter your username"
                            onChange={handleChange}
                        />
                        <Input
                            labelPlacement="outside"
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="Please enter your password"
                            onChange={handleChange}
                            value={formFields.password}
                        />
                        <Button
                            className="mx-auto w-full max-w-32"
                            type="submit"
                            color="secondary"
                            variant="bordered"
                        >
                            Sign up
                        </Button>
                    </div>
                </Tab>
            </Tabs>
            {error && (
                <span className="flex">
                    <RiErrorWarningFill className="text-warning-500 text-xl my-1" />
                    <Chip
                        variant="light"
                        color="warning"
                        className="text-md mt-0"
                    >
                        {error}
                    </Chip>
                </span>
            )}
        </Form>
    );
};
