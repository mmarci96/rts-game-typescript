import { Tile } from "../types";

class BinaryHeap<T> {
    private content: T[] = [];
    private scoreFunction: (element: T) => number;

    constructor(scoreFunction: (element: T) => number) {
        this.scoreFunction = scoreFunction;
    }

    push(element: T): void {
        this.content.push(element);
        this.bubbleUp(this.content.length - 1);
    }

    pop(): T | undefined {
        const result = this.content[0];
        const end = this.content.pop();
        if (this.content.length > 0 && end) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }

    size(): number {
        return this.content.length;
    }

    rescoreElement(node: T): void {
        const index = this.content.indexOf(node);
        if (index !== -1) {
            this.bubbleUp(index);
        }
    }

    private bubbleUp(index: number): void {
        const element = this.content[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.content[parentIndex];
            if (this.scoreFunction(element) >= this.scoreFunction(parent)) break;
            this.content[parentIndex] = element;
            this.content[index] = parent;
            index = parentIndex;
        }
    }

    private sinkDown(index: number): void {
        const length = this.content.length;
        const element = this.content[index];
        while (true) {
            let swapIndex: number | null = null;
            const leftChildIdx = 2 * index + 1;
            const rightChildIdx = 2 * index + 2;

            if (leftChildIdx < length) {
                const leftChild = this.content[leftChildIdx];
                if (this.scoreFunction(leftChild) < this.scoreFunction(element)) {
                    swapIndex = leftChildIdx;
                }
            }

            if (rightChildIdx < length) {
                const rightChild = this.content[rightChildIdx];
                if (
                    (swapIndex === null && this.scoreFunction(rightChild) < this.scoreFunction(element)) ||
                    (swapIndex !== null && this.scoreFunction(rightChild) < this.scoreFunction(this.content[swapIndex]))
                ) {
                    swapIndex = rightChildIdx;
                }
            }

            if (swapIndex === null) break;
            this.content[index] = this.content[swapIndex];
            this.content[swapIndex] = element;
            index = swapIndex;
        }
    }
}

export class AStar {
    private grid: Tile[][];

    constructor(grid: Tile[][]) {
        this.grid = grid;
    }

    private init(): void {
        for (const row of this.grid) {
            for (const node of row) {
                node.f = 0;
                node.g = 0;
                node.h = 0;
                node.cost = node.type ?? 1;
                node.visited = false;
                node.closed = false;
                node.parent = null;
            }
        }
    }

    private static manhattan(pos0: { x: number; y: number }, pos1: { x: number; y: number }): number {
        return Math.abs(pos1.x - pos0.x) + Math.abs(pos1.y - pos0.y);
    }

    private getNeighbors(node: Tile, diagonals = false): Tile[] {
        const { x, y } = node;
        const neighbors: Tile[] = [];

        const directions: [number, number][] = [
            [x - 1, y], [x + 1, y],
            [x, y - 1], [x, y + 1]
        ];

        if (diagonals) {
            directions.push(
                [x - 1, y - 1], [x + 1, y - 1],
                [x - 1, y + 1], [x + 1, y + 1]
            );
        }

        for (const [dx, dy] of directions) {
            if (this.grid[dy] && this.grid[dy][dx]) {
                neighbors.push(this.grid[dy][dx]);
            }

        }

        return neighbors;
    }

    public getTile(x: number, y: number): Tile {
        return this.grid[Math.floor(y)][Math.floor(x)];
    }

    public search(start: Tile, end: Tile, diagonals = true, heuristic = AStar.manhattan): Tile[] {
        this.init();
        const openHeap = new BinaryHeap<Tile>(node => node.f);
        openHeap.push(start);

        while (openHeap.size() > 0) {
            const currentNode = openHeap.pop();

            if (!currentNode) continue;

            if (currentNode === end) {
                const path: Tile[] = [];
                let curr: Tile | null = currentNode;
                while (curr?.parent) {
                    path.push(curr);
                    curr = curr.parent;
                }
                return path.reverse();
            }

            currentNode.closed = true;
            const neighbors = this.getNeighbors(currentNode, diagonals);

            for (const neighbor of neighbors) {
                if (neighbor.closed || !neighbor.isPassable()) continue;

                const gScore = currentNode.g + neighbor.cost;
                const beenVisited = neighbor.visited;

                if (!beenVisited || gScore < neighbor.g) {
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(neighbor.pos, end.pos);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;

                    if (!beenVisited) {
                        openHeap.push(neighbor);
                    } else {
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }
        return [];
    }
}

