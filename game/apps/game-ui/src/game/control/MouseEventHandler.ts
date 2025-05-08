import {
    Attackable,
    AttackCommand,
    AttackMoveCommand,
    Command,
    ControlledEntity,
    MineCommand,
    MoveCommand,
    Player,
    PlayerColor,
    Resource,
    TrainCommand,
    Unit,
} from "@packages/game-data";
import AssetManager from "../data/AssetManager";
import Camera from "../ui/Camera";
import SelectionBox from "../ui/SelectionBox";
import Drawable from "../data/Drawable";
import VectorTransformer from "../utils/VectorTransformer";
import Overlay from "../ui/Overlay";

class MouseEventHandler {
    private attackMoveMode: boolean = false;
    private player: Player;
    private canvas: HTMLCanvasElement;
    private camera: Camera;
    private selectionBox: SelectionBox;
    public selectionActive: boolean = false;
    private assets: AssetManager;
    private entities: Array<Drawable>;
    private overlay: Overlay;
    public hoveredEntity: Drawable | null;
    private selectedUnits: Array<Drawable>;

    constructor(
        player: Player,
        camera: Camera,
        selectionBox: SelectionBox,
        assets: AssetManager,
        overlay: Overlay,
    ) {
        this.player = player;

        this.overlay = overlay;
        this.hoveredEntity = null;
        const canvas = document.getElementById("ui-canvas");
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Must be html canvas element ");
        }
        this.canvas = canvas;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.zIndex = "10";
        this.camera = camera;
        this.selectionBox = selectionBox;
        this.assets = assets;
        this.entities = [];
        this.selectedUnits = [];
        this.setCursor("default");
    }

    updateDrawables(drawables: Iterable<Drawable>) {
        this.entities = Array.from(drawables);
        this.selectedUnits.forEach((selected: Drawable) => {
            const updater = this.entities.find(
                (updatedDrawable) =>
                    updatedDrawable.entity.getId() === selected.entity.getId(),
            );
            if (!updater) return;
            selected.entity = updater.entity;
        });
        this.overlay.updateSelection(this.selectedUnits);
    }

    addCanvasEventListeners(createCommand: (commands: Command[]) => void) {
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("no canvas");
        }
        let isSelecting = false;
        let startX = 0;
        let startY = 0;

        this.canvas.addEventListener("mousemove", (e) => {
            if (isSelecting) {
                this.onSelecting(e.clientX, e.clientY, startX, startY, ctx);
            }
            if (this.selectionActive) {
                this.handleHover(e.clientX, e.clientY);
            }
        });

        this.canvas.addEventListener("mouseup", (e) => {
            if (e.button === 2) return;
            const rect = this.canvas.getBoundingClientRect();
            const finalX = e.clientX - rect.left;
            const finalY = e.clientY - rect.top;

            if (isSelecting) {
                this.entities.forEach(
                    (entity: Drawable) => (entity.isSelected = false),
                );

                this.selectionBox.drawBox(startX, startY, finalX, finalY);
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                const selectableEntities: Drawable[] = [];
                this.entities.forEach((drawable: Drawable) => {
                    if (drawable.entity instanceof ControlledEntity) {
                        if (
                            drawable.entity.getColor() ===
                            this.player.getColor()
                        ) {
                            selectableEntities.push(drawable);
                        }
                    } else {
                        selectableEntities.push(drawable);
                    }
                });

                this.selectedUnits = this.selectionBox.handleSelecting(
                    selectableEntities,
                    this.camera,
                );

                if (this.selectedUnits.length > 0) {
                    this.selectionActive = true;
                } else {
                    this.selectionActive = false;
                }
                this.overlay.displayUnitSelection(
                    this.selectedUnits,
                    createCommand,
                );
            }

            isSelecting = false;
        });

        this.canvas.addEventListener("mousedown", (e) => {
            const isRightClick = e.button === 2;
            const isLeftClick = e.button === 0;

            if (isRightClick) {
                const commands = this.createCommandsOnRightClick(
                    e.clientX,
                    e.clientY,
                );
                createCommand(commands);
            }

            if (isLeftClick && this.attackMoveMode) {
                const commands = this.createCommandsOnAttackMove(
                    e.clientX,
                    e.clientY,
                );
                createCommand(commands);
            } else if (isLeftClick) {
                const rect = this.canvas.getBoundingClientRect();
                startX = e.clientX - rect.left;
                startY = e.clientY - rect.top;
                isSelecting = true;
            }
            this.attackMoveMode = false;
            this.setCursor("default");
        });

        window.addEventListener("keydown", (e) => {
            if (e.key === "q" || e.key === "Q") {
                if (this.selectedUnits.length > 0) {
                    this.attackMoveMode = true;
                    this.setCursor("attack");
                }
            }
        });

        window.addEventListener("keyup", (e) => {
            if (e.key === "q" || e.key === "Q") {
                if (this.selectedUnits.length > 0) {
                    this.attackMoveMode = true;
                    this.setCursor("attack");
                }
            }
        });
    }
    handleHover(clientX: number, clientY: number) {
        const hovering: Drawable | undefined = this.entities.find(
            (drawable: Drawable) => {
                const { worldX, worldY } = this.convertCursorPosition(
                    clientX,
                    clientY,
                );
                const diffX = Math.abs(worldX - drawable.entity.getX());
                const diffY = Math.abs(worldY - drawable.entity.getY());
                const max = 1.1;
                if (diffX < max && diffY < max) {
                    return drawable;
                }
            },
        );

        if (this.hoveredEntity && !hovering) {
            this.hoveredEntity = null;
            this.setCursor("default");
        }
        if (hovering) {
            this.hoveredEntity = hovering;
            this.onHover(this.hoveredEntity);
        } else if (!this.attackMoveMode) {
            this.hoveredEntity = null;
            this.setCursor("default");
        }
    }
    onHover(hoveredEntity: Drawable) {
        const playerColor: PlayerColor = this.player.getColor();
        if (
            hoveredEntity.entity instanceof ControlledEntity &&
            hoveredEntity.entity.getColor() !== playerColor
        ) {
            this.setCursor("attack");
        } else if (hoveredEntity.entity instanceof Resource) {
            const selectedWorkers = this.selectedUnits.filter(
                (drawable: Drawable) =>
                    drawable.entity.getType() === "worker" && drawable,
            );
            if (selectedWorkers.length >= 1) {
                this.setCursor("mine");
            }
        }
    }

    createCommandsOnRightClick(clientX: number, clientY: number) {
        const { worldX, worldY } = this.convertCursorPosition(clientX, clientY);
        const commands: Command[] = [];
        const entityArrSize = Math.round(Math.sqrt(this.selectedUnits.length));
        this.selectedUnits.forEach((unit, index) => {
            if (unit.isSelected) {
                if (this.hoveredEntity) {
                    const targetEntity = this.hoveredEntity.entity;
                    if (
                        targetEntity instanceof ControlledEntity &&
                        targetEntity.getColor() !== this.player.getColor()
                    ) {
                        const attackCommand = this.createAttackCommand(
                            targetEntity,
                            unit.entity.getId(),
                        );
                        commands.push(attackCommand);
                    }
                    if (targetEntity instanceof Resource) {
                        console.log(targetEntity);
                        const mineCommand = this.createMineResourceCommand(
                            targetEntity.getId(),
                            unit.entity.getId(),
                        );
                        commands.push(mineCommand);
                    }
                } else {
                    let { targetX, targetY } = this.createCheapGrid(
                        unit.entity.getX(),
                        unit.entity.getY(),
                        worldX,
                        worldY,
                        entityArrSize,
                        index,
                    );
                    if (targetX < 0) {
                        targetX = 0.01;
                    }
                    if (targetY < 0) {
                        targetY = 0.01;
                    }
                    const moveCommand = this.createMoveUnitCommand(
                        targetX,
                        targetY,
                        unit.entity.getId(),
                    );
                    commands.push(moveCommand);
                }
            }
        });
        return commands;
    }

    onSelecting(
        clientX: number,
        clientY: number,
        startX: number,
        startY: number,
        ctx: CanvasRenderingContext2D,
    ) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = clientX - rect.left;
        const screenY = clientY - rect.top;
        const currentX = screenX;
        const currentY = screenY;
        const width = currentX - startX;
        const height = currentY - startY;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.strokeStyle = "green";
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, startY, width, height);
    }

    setCursor(name: string) {
        const defaultCursor = this.assets.getImage(`${name}_cursor`);
        if (defaultCursor instanceof HTMLImageElement) {
            this.canvas.style.cursor = `url(${defaultCursor.src}), auto`;
        } else if (typeof defaultCursor === "string") {
            this.canvas.style.cursor = `url(${defaultCursor}), auto`;
        } else {
            console.warn("Default cursor is not a valid image or URL.");
        }
    }
    createMineResourceCommand(resourceId: string, unitId: string): Command {
        const timestamp = new Date();
        const command = new MineCommand(timestamp, unitId, resourceId);
        return command;
    }

    createTrainUnitCommand(buildingId: string, unitType: string): Command {
        const timestamp = new Date();
        const command = new TrainCommand(timestamp, buildingId, unitType);
        return command;
    }

    createMoveUnitCommand(
        targetX: number,
        targetY: number,
        unitId: string,
    ): Command {
        const destination = { x: targetX, y: targetY };
        const timestamp = new Date();
        const command = new MoveCommand(timestamp, unitId, destination);
        return command;
    }

    createAttackCommand(targetUnit: ControlledEntity, unitId: string): Command {
        const timestamp = new Date();
        const command = new AttackCommand(
            timestamp,
            unitId,
            targetUnit.getId(),
        );
        return command;
    }

    createCommandsOnAttackMove(clientX: number, clientY: number) {
        const { worldX, worldY } = this.convertCursorPosition(clientX, clientY);
        const commands: Command[] = [];
        const entityArrSize = Math.round(Math.sqrt(this.selectedUnits.length));
        const hovering = this.hoveredEntity;

        this.selectedUnits.forEach((unit, index) => {
            if (unit.isSelected && unit.entity instanceof Unit) {
                let { targetX, targetY } = this.createCheapGrid(
                    unit.entity.getX(),
                    unit.entity.getY(),
                    worldX,
                    worldY,
                    entityArrSize,
                    index,
                );
                if (targetX < 0) {
                    targetX = 0.000001;
                }
                if (targetY < 0) {
                    targetY = 0.000001;
                }
                let victim = null;
                if (
                    hovering?.entity instanceof Attackable &&
                    hovering.entity.getColor() !== unit.entity.getColor()
                ) {
                    victim = hovering.entity.getId();
                }
                const attackMoveCommand = this.createAttackMoveCommand(
                    victim,
                    unit.entity.getId(),
                    { x: targetX, y: targetY },
                );
                commands.push(attackMoveCommand);
            }
        });

        return commands;
    }
    createAttackMoveCommand(
        targetUnitId: string | null,
        unitId: string,
        destination?: { x: number; y: number },
    ): Command {
        const timestamp = new Date();
        const d = destination ? destination : null;
        const command = new AttackMoveCommand(
            timestamp,
            unitId,
            targetUnitId,
            d,
        );
        return command;
    }

    convertCursorPosition(clientX: number, clientY: number) {
        const rect = this.canvas.getBoundingClientRect();
        return VectorTransformer.getPositionFromCanvas(
            clientX - rect.left,
            clientY - rect.top,
            this.camera.getX(),
            this.camera.getY(),
        );
    }
    createCheapGrid(
        unitX: number,
        unitY: number,
        tx: number,
        ty: number,
        maxGrid: number,
        i: number,
    ) {
        let accX = 1.2;
        let accY = -1.2;
        if (unitX > tx) accX = -1.2;
        if (unitY > ty) accY = 1.2;

        const row = Math.floor(i / maxGrid) * accX;
        const col = (i % maxGrid) * accY;
        const targetX = tx + col;
        const targetY = ty + row;
        return { targetX, targetY };
    }
}

export default MouseEventHandler;
