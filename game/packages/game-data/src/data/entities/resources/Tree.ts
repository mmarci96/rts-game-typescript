import { ResourceParams } from "../../types";
import Resource from "./Resource";

class Tree extends Resource {
    constructor(parameters: ResourceParams) {
        super(parameters);
    }
    getType(): string {
        return "tree";
    }
}

export default Tree;
