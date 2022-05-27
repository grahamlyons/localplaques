import Database from '../db/Database';

describe('Database', () => {
    it('returns points within a bounding box query', async () => {
        const data = [
            {"latitude":50.51017, "longitude":-3.61166, inscription: "Just a test"},
            {"latitude":60.51017, "longitude":-5.61166, inscription: "Just a test"},
        ];
        const database = new Database(data);
        const minLat = 50;
        const minLng = -4;
        const maxLat = 51;
        const maxLng = -3;
        const results = database.within(minLat, minLng, maxLat, maxLng);
        expect(results).toEqual([data[0]]);
    });

    it('an empty list when no points are within the queried box', async () => {
        const data = [
            {"latitude":50.51017, "longitude":-3.61166, inscription: "Just a test"},
            {"latitude":60.51017, "longitude":-5.61166, inscription: "Just a test"},
        ];
        const database = new Database(data);
        const minLat = 30;
        const minLng = 0;
        const maxLat = 31;
        const maxLng = 1;
        const results = database.within(minLat, minLng, maxLat, maxLng);
        expect(results).toEqual([]);
    })
});