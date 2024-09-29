import { EQUATORIAL_RADIUS, INTERPOLATION_RATE, POLAR_RADIUS } from "./constants";
import { MaperPoint, GpsPoint, Point, GeoPoint } from "./interface";

function flattenSpherical(p: GpsPoint): GeoPoint {
    const latRad = p.latitude * (Math.PI / 180);
    const longRad = p.longitude * (Math.PI / 180);

    const e2 = (Math.pow(EQUATORIAL_RADIUS, 2) - Math.pow(POLAR_RADIUS, 2)) / (Math.pow(EQUATORIAL_RADIUS, 2));
    const nB = EQUATORIAL_RADIUS / (Math.sqrt(1 - e2 * Math.pow(Math.sin(latRad) , 2)));

    const x = (nB + p.altitude) * Math.cos(latRad) * Math.cos(longRad);
    const y = (nB + p.altitude) * Math.cos(latRad) * Math.sin(longRad);
    const z = ((Math.pow(POLAR_RADIUS, 2) / Math.pow(EQUATORIAL_RADIUS, 2)) * nB + p.altitude) * Math.sin(latRad);

    return {
        x,
        y,
        z
    }
}

function getRegressor(points: GeoPoint[], scalar: number[]): (point: GeoPoint) => number {
    if (points.length < 3) {
        throw RangeError;
    }

    const n = points.length;
    let avgX1 = 0;
    let avgX2 = 0;
    let avgY = 0;
    let avgX1S = 0;
    let avgX2S = 0;
    let avgYS = 0;
    let avgYX1 = 0;
    let avgYX2 = 0;
    let avgX1X2 = 0;

    for (let i=0; i < points.length; i++) {        
        avgX1 += points[i].x;
        avgX2 += points[i].y;
        avgY += scalar[i];
        avgX1S += Math.pow(points[i].x, 2);
        avgX2S += Math.pow(points[i].y, 2);
        avgYS += Math.pow(scalar[i], 2);
        avgYX1 += scalar[i] * points[i].x;
        avgYX2 += scalar[i] * points[i].y;
        avgX1X2 += points[i].x * points[i].y;
    }

    avgX1 /= n;
    avgX2 /= n;
    avgY /= n;
    avgX1S /= n;
    avgX2S /= n;
    avgYS /= n;
    avgYX1 /= n;
    avgYX2 /= n;
    avgX1X2 /= n;

    const covYX1 = avgYX1 - (avgY * avgX1);
    const covYX2 = avgYX2 - (avgY * avgX2);
    const covX1X2 = avgX1X2 - (avgX1 * avgX2);

    const sigmaY = Math.sqrt(avgYS - Math.pow(avgY, 2));
    const sigmaX1 = Math.sqrt(avgX1S - Math.pow(avgX1, 2));
    const sigmaX2 = Math.sqrt(avgX2S - Math.pow(avgX2, 2));

    const rYX1 = covYX1 / (sigmaY * sigmaX1);
    const rYX2 = covYX2 / (sigmaY * sigmaX2);
    const rX1X2 = covX1X2 / (sigmaX1 * sigmaX2);

    const b1 = (sigmaY / sigmaX1) * ((rYX1 - rYX2 * rX1X2) / (1 - Math.pow(rX1X2, 2)));
    const b2 = (sigmaY / sigmaX2) * ((rYX2 - rYX1 * rX1X2) / (1 - Math.pow(rX1X2, 2)));
    const a = avgY - b1 * avgX1 - b2 * avgX2;

    return (point: GeoPoint) => (a + b1 * point.x + b2 * point.y);
}

function getInterpolator(point: Point[], scalar: number[]): (point: Point) => number {
    function IDW(newPoint: Point): number {
        let wSum = 0;
        let predScalar = 0;

        const weights = point.map((_, i) => {
            const d0 = point[i].x - newPoint.x;
            const d1 = point[i].y - newPoint.y;

            const dist = Math.sqrt(d0*d0 + d1*d1);
            const weight = 1.0 / Math.pow(dist+1e-12, 2);
            wSum += weight;
            return weight;
        });

        for (let i=0; i < weights.length; i++) {
            const normWeight = weights[i] / wSum;
            predScalar += normWeight*scalar[i];
        }

        return predScalar;
    }
    return IDW;
}

function* flattenSphericalGen(points: GpsPoint[]): Generator<GeoPoint, undefined, undefined> {
    for (const p of points) {
        yield flattenSpherical(p)
    }
}

function* retriveScalarGen(data: any[], name: string): Generator<number, undefined, undefined> {
    for (const obj of data) {
        const scalar = Number(obj[name])
        if (!scalar || scalar === Number.NaN) {
            throw TypeError;
        }
        yield scalar;
    }
}

function pipelineToMap(points: MaperPoint[], userPoint: GpsPoint): Point | undefined {
    if (points.length < 7) {
        return undefined;
    }  

    const flattenPoints = [...flattenSphericalGen(points)];
    
    const trueX = [...retriveScalarGen(points, "x")];
    const trueY = [...retriveScalarGen(points, "y")];

    const regressorX = getRegressor(flattenPoints, trueX);
    const regressorY = getRegressor(flattenPoints, trueY);

    const linearPredXY = [];
    const lossX = [];
    const lossY = [];
    for (let i=0; i < flattenPoints.length; i++) {
        const x = regressorX(flattenPoints[i]);
        const y = regressorY(flattenPoints[i]);
        linearPredXY.push({
            x,
            y
        });
        lossX.push(trueX[i] - x);
        lossY.push(trueY[i] - y);
    }

    const interpolatorX = getInterpolator(linearPredXY, lossX);
    const interpolatorY = getInterpolator(linearPredXY, lossY);

    const flattenUserPoint = flattenSpherical(userPoint);
    const linearPred: Point = {
        x: regressorX(flattenUserPoint),
        y: regressorY(flattenUserPoint)
    };
    const loss: Point = {
        x: interpolatorX(linearPred),
        y: interpolatorY(linearPred)
    }

    return {
        x: linearPred.x + loss.x * INTERPOLATION_RATE,
        y: linearPred.y + loss.y * INTERPOLATION_RATE
    };
}

export {
    pipelineToMap,
    flattenSpherical
}