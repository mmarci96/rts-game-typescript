import React, { useState } from "react";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";

export const AuthForm = () => {
    const [formFields, setFormFields] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [selected, setSelected] = useState("login");

    const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
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
            console.error(response.statusText);
            setErrors({
                form: `Error with ${selected} request response.`,
            });
            return;
        }

        const { data } = await response.json();
        console.log(`Request ${selected} response:  `, data);
    };

    return (
        <Form
            className="w-full mx-auto max-w-sm flex flex-col items-center ring-1 ring-secondary rounded-xl p-8"
            validationErrors={errors}
            onSubmit={handleSubmit}
        >
            <Tabs
                aria-label="Login or Sing up to play!"
                selectedKey={selected}
                size="md"
                onSelectionChange={(e) => setSelected(e.toString())}
            >
                <Tab key={"login"} title="Login">
                    <div className="w-full max-w-md flex flex-col items-center gap-4">
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
        </Form>
    );
};
