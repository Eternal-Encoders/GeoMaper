import { EQUATORIAL_RADIUS, POLAR_RADIUS } from "./constants";
import { MaperPoint, GpsPoint, Point, GeoPoint } from "./interface";

function fromSphericalToRect(p: GpsPoint): GeoPoint {
    const e2 = (Math.pow(EQUATORIAL_RADIUS, 2) + Math.pow(POLAR_RADIUS, 2)) / (Math.pow(EQUATORIAL_RADIUS, 2));
    const nB = EQUATORIAL_RADIUS / (Math.sqrt(1 - e2 * Math.pow(Math.sin(p.latitude) , 2)));

    const x = (nB + p.altitude) * Math.cos(p.latitude) * Math.cos(p.longitude);
    const y = (nB + p.altitude) * Math.cos(p.latitude) * Math.sin(p.longitude);
    const z = ((Math.pow(EQUATORIAL_RADIUS, 2) / Math.pow(POLAR_RADIUS, 2)) * nB + p.altitude) * Math.sin(p.latitude);

    return {
        x,
        y,
        z
    }
}

function getRegressor(points: MaperPoint[]): (point: GeoPoint) => Point {
    if (points.length < 3) {
        throw RangeError;
    }

    const n = points.length;
    let avgX1 = 0;
    let avgX2 = 0;
    let avgY1 = 0;
    let avgY2 = 0;
    let avgX1S = 0;
    let avgX2S = 0;
    let avgY1S = 0;
    let avgY2S = 0;
    let avgY1X1 = 0;
    let avgY2X1 = 0;
    let avgY1X2 = 0;
    let avgY2X2 = 0;
    let avgX1X2 = 0;

    for (const point of points) {
        avgX1 += point.geoX;
        avgX2 += point.geoY;
        avgY1 += point.x;
        avgY2 += point.y;
        avgX1S += Math.pow(point.geoX, 2);
        avgX2S += Math.pow(point.geoY, 2);
        avgY1S += Math.pow(point.x, 2);
        avgY2S += Math.pow(point.y, 2);
        avgY1X1 += point.x * point.geoX;
        avgY2X1 += point.y * point.geoX;
        avgY1X2 += point.x * point.geoY;
        avgY2X2 += point.y * point.geoY;
        avgX1X2 += point.geoX * point.geoY;
    }

    avgX1 /= n;
    avgX2 /= n;
    avgY1 /= n;
    avgY2 /= n;
    avgX1S /= n;
    avgX2S /= n;
    avgY1S /= n;
    avgY2S /= n;
    avgY1X1 /= n;
    avgY2X1 /= n;
    avgY1X2 /= n;
    avgY2X2 /= n;
    avgX1X2 /= n;

    const covY1X1 = avgY1X1 - (avgY1 * avgX1);
    const covY1X2 = avgY1X2 - (avgY1 * avgX2);
    const covY2X1 = avgY2X1 - (avgY2 * avgX1);
    const covY2X2 = avgY2X2 - (avgY2 * avgX2);
    const covX1X2 = avgX1X2 - (avgX1 * avgX2);

    const sigmaY1 = Math.sqrt(avgY1S - Math.pow(avgY1, 2));
    const sigmaY2 = Math.sqrt(avgY2S - Math.pow(avgY2, 2));
    const sigmaX1 = Math.sqrt(avgX1S - Math.pow(avgX1, 2));
    const sigmaX2 = Math.sqrt(avgX2S - Math.pow(avgX2, 2));

    const rY1X1 = covY1X1 / (sigmaY1 * sigmaX1);
    const rY1X2 = covY1X2 / (sigmaY1 * sigmaX2);
    const rY2X1 = covY2X1 / (sigmaY2 * sigmaX1);
    const rY2X2 = covY2X2 / (sigmaY2 * sigmaX2);
    const rX1X2 = covX1X2 / (sigmaX1 * sigmaX2);

    const y1CoefB1 = (sigmaY1 / sigmaX1) * ((rY1X1 - rY1X2 * rX1X2) / (1 - Math.pow(rX1X2, 2)));
    const y1CoefB2 = (sigmaY1 / sigmaX2) * ((rY1X2 - rY1X1 * rX1X2) / (1 - Math.pow(rX1X2, 2)));
    const y1CoefA = avgY1 - y1CoefB1 * avgX1 - y1CoefB2 * avgX2;
    const y2CoefB1 = (sigmaY2 / sigmaX1) * ((rY2X1 - rY2X2 * rX1X2) / (1 - Math.pow(rX1X2, 2)));
    const y2CoefB2 = (sigmaY2 / sigmaX2) * ((rY2X2 - rY2X1 * rX1X2) / (1 - Math.pow(rX1X2, 2)));
    const y2CoefA = avgY2 - y2CoefB1 * avgX1 - y2CoefB2 * avgX2;

    return (point: GeoPoint) => ({
        x: y1CoefA + y1CoefB1 * point.x + y1CoefB2 * point.y,
        y: y2CoefA + y2CoefB1 * point.x + y2CoefB2 * point.y
    });
}

export {
    fromSphericalToRect,
    getRegressor
}