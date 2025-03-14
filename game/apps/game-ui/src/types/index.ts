export interface Command {
    action: string;
    entityId: string;
    targetX?: number;
    targetY?: number;
    targetId?: string;
    unitType?: string;
}
