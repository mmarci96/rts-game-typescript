export interface PlayerCommand {
    action: string;
    entityId: string;
    targetX?: number;
    targetY?: number;
    targetId?: string;
}
