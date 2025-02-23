import request from "supertest";
import app from "../src/app";

interface TestMap {
    _id: string;
    type: string;
    size: string;
}

jest.setTimeout(15000);

describe("GET /api/maps", () => {
    it("responds with a JSON array of maps", async () => {
        const res = await request(app)
            .get("/api/maps")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(Array.isArray(res.body.data)).toBeTruthy();
        expect(res.body.data.length).toBeGreaterThan(0);

        res.body.data.forEach((map: TestMap) => {
            expect(map).toHaveProperty("_id");
            expect(map).toHaveProperty("type");
            expect(map).toHaveProperty("size");
        });
    });
});

describe("GET /api/maps/:mapId", () => {
    it("responds with a single map object", async () => {
        const testMapId = "67b5c80ad1d9ec3156e6aedd";
        const res = await request(app)
            .get(`/api/maps/${testMapId}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);

        expect(res.body).toHaveProperty("_id", testMapId);
        expect(res.body).toHaveProperty("type");
        expect(res.body).toHaveProperty("size");
    });

    it("returns 404 for a non-existing map", async () => {
        await request(app)
            .get("/api/maps/nonexistentid")
            .set("Accept", "application/json")
            .expect(404);
    });
});
