import { ResourceParams } from "../../types";
import Resource from "./Resource";

class WheatField extends Resource {
    constructor(parameters: ResourceParams) {
        super(parameters);
    }
    getType(): string {
        return "wheat";
    }
}

export default WheatField;
