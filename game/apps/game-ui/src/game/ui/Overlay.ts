import { Building, MainBuilding, Unit } from "@packages/game-data";
import Drawable from "../data/Drawable";
import StatusBar from "./Statusbar";
import { Command } from "../../types";

class Overlay {
    #overlayDiv;
    #isVisible;
    selectedList: Drawable[] = [];
    static statusBar: StatusBar;

    constructor() {
        this.#overlayDiv = document.getElementById("overlay");
        this.#isVisible = false;
        Overlay.statusBar = new StatusBar();
        document.body.appendChild(Overlay.statusBar.element);
    }

    setVisible() {
        if (this.#overlayDiv) {
            this.#overlayDiv.style.display = "flex";
            this.#isVisible = true;
        }
    }

    setInvisible() {
        if (this.#overlayDiv) {
            this.#overlayDiv.style.display = "none";
            this.#isVisible = false;
        }
    }
    isVisible() {
        return this.#isVisible;
    }

    updateSelection(drawables: Drawable[]) {
        if (!drawables.length) {
            return;
        }
        this.selectedList = drawables
        if (!this.#overlayDiv) {
            return;
        }

        const units = new Set<Drawable>();
        const buildings = new Set<Drawable>();

        this.selectedList.forEach((selectedEntity) => {
            if (selectedEntity.entity instanceof Unit) {
                units.add(selectedEntity);
            } else if (selectedEntity.entity instanceof Building) {
                buildings.add(selectedEntity);
            }
        });
        if (!units.size && !buildings.size) {
            return;
        }

        if (!units.size && buildings.size === 1) {
            return;
        }

        if (!buildings.size && units.size) {
            this.#overlayDiv.innerHTML = "";
            const selectionDetails = document.createElement("ul");
            selectionDetails.id = "selectionList";
            selectionDetails.style.display = "flex";
            this.#overlayDiv.appendChild(selectionDetails);
            this.displaySelection(units, selectionDetails);
        }
    }

    displayUnitSelection(
        selectedList: Drawable[],
        createTrainUnitCommand: (commands: Command[]) => void,
    ) {
        this.selectedList = selectedList;
        if (!this.#overlayDiv) {
            return;
        }

        this.#overlayDiv.innerHTML = "";
        const units = new Set<Drawable>();
        const buildings = new Set<Drawable>();
        const selectionDetails = document.createElement("ul");
        selectionDetails.id = "selectionList";
        selectionDetails.style.display = "flex";
        this.#overlayDiv.appendChild(selectionDetails);
        this.selectedList.forEach((selectedEntity) => {
            if (selectedEntity.entity instanceof Unit) {
                units.add(selectedEntity);
            } else if (selectedEntity.entity instanceof Building) {
                buildings.add(selectedEntity);
            }
        });
        if (!units.size && !buildings.size) {
            return;
        }

        if (!units.size && buildings.size === 1) {
            const building = [...buildings.values()][0];
            this.displaySelection(buildings, selectionDetails);
            this.displayAvailableActions(
                building,
                selectionDetails,
                createTrainUnitCommand,
            );
            return;
        }

        if (buildings.size) {
            this.displaySelection(buildings, selectionDetails);
        }

        this.displaySelection(units, selectionDetails);
    }

    displayAvailableActions(
        entity: Drawable,
        selectionDetails: HTMLElement,
        createTrainUnitCommand: (commands: Command[]) => void,
    ) {
        if (!(entity.entity instanceof MainBuilding)) {
            return;
        }
        const actions = entity.entity.getActions();
        console.log(actions);

        actions.forEach((action: string) => {
            const actionCard = this.createActionCard(
                action,
                entity.entity.getId(),
                createTrainUnitCommand,
            );
            selectionDetails.appendChild(actionCard);
        });
    }

    displaySelection(
        selectionList: Set<Drawable>,
        selectionDetails: HTMLElement,
    ) {
        selectionList.forEach((selected) => {
            if (!(selected.entity instanceof Unit) && !(selected.entity instanceof Building)) {
                return;
            }
            const hp = selected.entity.getHealth();
            const maxHp = selected.entity.getHealth();
            const type = selected.entity.getType();
            const unitElement = this.createUnitCard(type, hp, maxHp);
            selectionDetails.appendChild(unitElement);
        });
    }

    createActionCard(
        action: string,
        id: string | null,
        createTrainUnitCommand: (commands: Command[]) => void,
    ) {
        const card = this.actionCard(action, id, createTrainUnitCommand);
        return card;
    }

    actionCard(
        actionText: string,
        id: string | null,
        createTrainUnitCommand: (commands: Command[]) => void,
    ) {
        const unitType = actionText.split("_")[1].toLowerCase();
        const unitCard = document.createElement("li");
        unitCard.classList.add("unit-card");
        const content = actionText
            .split("_")
            .map((txt: string) => txt[0].toUpperCase() + txt.substring(1))
            .join("\n");

        const text = document.createElement("p");
        text.style.fontSize = "12px";
        text.textContent = content;

        const actionIcon = "+";
        const icon = document.createElement("button");
        icon.addEventListener("click", () => {
            if (!id) {
                return;
            }
            const command: Command = {
                entityId: id,
                unitType: unitType,
                action: "train",
            };
            createTrainUnitCommand([command]);
        });
        icon.textContent = actionIcon;
        icon.style.fontSize = "16px";
        icon.style.width = "28px";
        icon.style.height = "28px";

        unitCard.appendChild(icon);
        unitCard.appendChild(text);
        return unitCard;
    }

    createUnitCard(unitType: string, currentHp: number, maxHp: number) {
        const unitCard = document.createElement("li");
        unitCard.classList.add("unit-card");

        const healthContainer = document.createElement("div");
        healthContainer.classList.add("health-container");

        const healthText = document.createElement("span");
        healthText.textContent = `HP: ${currentHp}/${maxHp}`;
        healthText.classList.add("health-text");

        const healthBarContainer = document.createElement("div");
        healthBarContainer.classList.add("health-bar-container");

        const healthBar = document.createElement("div");
        healthBar.classList.add("health-bar");

        const healthPercentage = (currentHp / maxHp) * 100;
        healthBar.style.width = `${healthPercentage}%`;

        healthBarContainer.appendChild(healthBar);
        healthContainer.appendChild(healthText);
        healthContainer.appendChild(healthBarContainer);
        unitCard.appendChild(healthContainer);

        const typeText = document.createElement("div");
        typeText.classList.add("unit-type");
        typeText.textContent = unitType;
        unitCard.appendChild(typeText);

        return unitCard;
    }
}

export default Overlay;
