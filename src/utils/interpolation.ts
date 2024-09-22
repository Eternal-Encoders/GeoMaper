import { MaperPoint, Point, GeoPoint, } from "./interface";

function getInterpolator(
    points: MaperPoint[],
    regressor: (userPoint: GeoPoint) => Point
): (point: GeoPoint) => Point {

    function IDW(newPoint: GeoPoint): Point {
        let wSum = 0;
        const weights = points.map((e) => {
            const d0 = e.geoX - newPoint.x;
            const d1 = e.geoY - newPoint.y;

            const dist = Math.pow(d0*d0 + d1*d1, 0.5);
            const weight = 1.0 / (dist+1e-12)*(dist+1e-12)
            wSum += weight
            return weight
        });

        const newPointMap = regressor(newPoint);

        const newdX = weights.reduce(
            (prev, cur, i) => prev + (cur / wSum * (points[i].x - newPointMap.x)), 
            0
        );
        const newdY = weights.reduce(
            (prev, cur, i) => prev + (cur / wSum * (points[i].y - newPointMap.y)), 
            0
        );

        return {
            x: newPoint.x + newdX,
            y: newPoint.y + newdY
        }
    }

    return IDW;
}

export {
    getInterpolator
}