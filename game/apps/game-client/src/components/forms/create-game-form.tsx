import React from "react";
import { Card } from "../common/card";
import { FormInput } from "./form-input";

export const CreateGameForm = () => {
    return (
        <Card header="Choose options" footer="Creating game">
            <form>
                CreateGameForm
                <FormInput type="number" min={2} max={4} label="Lobby size" />
            </form>
        </Card>
    );
};
