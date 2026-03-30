import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

const apiBase = '/api';

const getHeaders = (jwt: string | undefined, headers: any, params: any, body: any): AxiosRequestConfig => {
    const isFormData = body instanceof FormData;
    return {
        ...(params ? { params } : {}),
        headers: {
            'Content-Type': (isFormData ? 'multipart/form-data' : 'application/json'),
            ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {}),
            ...headers,
        }
    };
};

// send GET
export const sendGet = async <T = any>(uri: string, jwt?: string, headers = {}, params = {}): Promise<AxiosResponse<T>> => {
    return await axios.get<T>(`${apiBase}${uri}`, getHeaders(jwt, headers, params, {}));
};

// send POST
export const sendPost = async <T = any>(uri: string, jwt?: string, headers = {}, body = {}, params = {}): Promise<AxiosResponse<T>> => {
    return await axios.post<T>(`${apiBase}${uri}`, body, getHeaders(jwt, headers, params, body));
};

// send PUT
export const sendPut = async <T = any>(uri: string, jwt?: string, headers = {}, body = {}, params = {}): Promise<AxiosResponse<T>> => {
    return await axios.put<T>(`${apiBase}${uri}`, body, getHeaders(jwt, headers, params, body));
};

// send PATCH
export const sendPatch = async <T = any>(uri: string, jwt?: string, headers = {}, body = {}, params = {}): Promise<AxiosResponse<T>> => {
    return await axios.patch<T>(`${apiBase}${uri}`, body, getHeaders(jwt, headers, params, body));
};

// send DELETE
export const sendDelete = async <T = any>(uri: string, jwt?: string, headers = {}, params = {}): Promise<AxiosResponse<T>> => {
    return await axios.delete<T>(`${apiBase}${uri}`, getHeaders(jwt, headers, params, {}));
};