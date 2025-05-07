import Unit from "./Unit";
import { Command, ICollector, UnitParams } from "../../types";
import Collector from "../Collector";
import { calculateDistance } from "../../utils";
import { AStar } from "../../utils/pathfinding";
import { Resource } from "../resources";

class Worker extends Unit implements ICollector {
    collector: Collector;

    constructor(parameters: UnitParams, aStar: AStar | null) {
        super(parameters, aStar);
        this.collector = new Collector(5);
    }

    handleCommand(command: Command): void {
        console.log(command.commandType);
    }

    mining(deltaTime: number): void {
        const targetResource = this.getTargetResource();
        if (targetResource) {
            const targetX = targetResource.getX();
            const targetY = targetResource.getY();
            this.setTarget(targetX, targetY);
            const distance = calculateDistance(
                this.getPosition(),
                targetResource.getPosition(),
            );
            if (distance > 1.6) {
                this.setStatus("moving");
                this.setupPathfinder(
                    this.getX(),
                    this.getY(),
                    targetX,
                    targetY,
                );
            } else {
                this.setStatus("mining");
                this.updateCollect(deltaTime);
            }
            return;
        }
    }

    updatePosition(deltaTime: number) {
        const { newX, newY, progress } = this.move(deltaTime);
        if (progress === "completed") {
            this.setTarget(null, null);
        }

        if (progress !== "completed") {
            this.idleTime = 0;
            this.setX(newX);
            this.setY(newY);
            this.setStatus("moving");
            return;
        }

        if (this.getAttackableTarget()) {
            this.idleTime = 0;
            this.setStatus("attack");
            return;
        }
        if (this.getTargetResource()) {
            this.setStatus("mining");
            return;
        }

        this.setStatus("idle");
        return;
    }

    getType(): string {
        return "worker";
    }

    updateCollect(deltaTime: number): number {
        return this.collector.updateCollect(deltaTime);
    }

    collectResource(resource: Resource): void {
        return this.collector.collectResource(resource);
    }

    getCollected(): number {
        return this.collector.getCollected();
    }

    getTargetResource(): Resource | null {
        return this.collector.getTargetResource();
    }

    resetTargetResource(): void {
        this.collector.resetTargetResource();
    }
}

export default Worker;
