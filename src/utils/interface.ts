export interface IAuditoriumDoors {
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string
}

export interface IAuditoriumChild {
    type: "text" | "icon",
    x: number,
    y: number,
    identifier: string,
    alignX: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED" | "",
    alignY: "CENTER" | "TOP" | "BOTTOM" | ""
  }
  
export interface IAuditorium {
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string | null,
    stroke: string | null,
    pointId: string,
    children: IAuditoriumChild[],
    doors: IAuditoriumDoors[]
}

export interface IService {
    x: number,
    y: number,
    data: string,
    stroke: string | null,
    fiil: string | null
}

export interface IMapObject {
    service: IService[],
    audiences: IAuditorium[],
    institute: string,
    floor: number,
    width: number,
    height: number
}

export interface IInstitute {
    name: string,
    displayableName: string,
    minFloor: number,
    maxFloor: number,
    url: string,
    latitude: number,
    longitude: number,
    icon: {
        url: string,
        alt: string
    }
}

export interface IFloorReq {
    inst: string,
    floor: number
}

export interface Point {
    x: number,
    y: number
}

export interface GeoPoint {
    x: number,
    y: number,
    latitude: number,
    longitude: number
}