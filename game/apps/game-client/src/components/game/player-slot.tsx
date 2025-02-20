import { useState } from "react";

export interface PlayerSlotParams {
    name: string;
    color: string;
    isReady: boolean;
}

export const PlayerSlot = ({ name, color, isReady }: PlayerSlotParams) => {
    return <div>PlayerSlot</div>;
};
