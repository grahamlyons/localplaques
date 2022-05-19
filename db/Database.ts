import KDBush from 'kdbush';

export type Point = {
    latitude: number;
    longitude: number;

    [x: string]: unknown;
}


export default class Database {
    index: KDBush<Point>;
    data: Array<Point>

    constructor(data: Array<Point>) {
        this.index = new KDBush(
            data,
            (p: Point)=>p.latitude,
            (p: Point)=>p.longitude
        );
        this.data = data;
    }

    within(minLat: number, minLng: number, maxLat: number, maxLng: number) {
        const indices = this.index.range(minLat, minLng, maxLat, maxLng)
        return indices.map((i) => this.data[i])
    }
}