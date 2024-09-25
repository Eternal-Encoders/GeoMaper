import { MaperPoint, Point, GeoPoint, } from "./interface";

function getInterpolator(
    points: MaperPoint[],
    regressor: (userPoint: GeoPoint) => Point
): (point: GeoPoint) => Point {

    function IDW(newPoint: GeoPoint): Point {
        const newPointMap = regressor(newPoint);

        let wSum = 0;
        const weights = points.map((e) => {
            const linear_point = regressor({
                x: e.x,
                y: e.y,
                z: 0
            })
            const d0 = linear_point.x - newPointMap.x;
            const d1 = linear_point.y - newPointMap.y;

            const dist = Math.pow(d0*d0 + d1*d1, 0.5);
            const weight = 1.0 / (dist+1e-12)*(dist+1e-12)
            wSum += weight
            return weight
        });

        const newdX = weights.reduce(
            (prev, cur, i) => prev + (cur / wSum * (points[i].x - regressor({
                x: points[i].x,
                y: points[i].y,
                z: 0
            }).x)), 
            0
        );
        const newdY = weights.reduce(
            (prev, cur, i) => prev + (cur / wSum * (points[i].y - regressor({
                x: points[i].x,
                y: points[i].y,
                z: 0
            }).y)), 
            0
        );

        return {
            x: newPointMap.x + newdX,
            y: newPointMap.y + newdY
        }
    }

    return IDW;
}

export {
    getInterpolator
}