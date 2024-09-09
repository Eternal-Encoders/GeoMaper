import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getOrigin } from "../../utils/network";
import { IFloorReq, IInstitute, IMapObject } from "../../utils/interface";


export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: getOrigin(),
    }),
    endpoints: build => ({
        getFloor: build.query<IMapObject, IFloorReq>({
            query: ({inst, floor}) => ({
                url: '/floor',
                method: 'GET',
                params: {
                    floor: floor,
                    institute: inst
                }
            }),
        }),
        getInstitutes: build.query<IInstitute[], undefined>({
            query: () => ({
                url: '/institutes',
                method: 'GET'
            }),
        }),
    })
})

export const {
    useGetFloorQuery,
    useGetInstitutesQuery
 } = apiSlice