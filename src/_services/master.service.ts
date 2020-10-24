import { authHeader, clientAuthHeader, getQueryString } from '../_helpers';
import { IUser, IRegisterPayload } from '../_types';
import { handleResponse } from './response.middleware';

export default class MasterService {
    private API_URL = process.env.VUE_APP_API_URL + '/v1/masterdata';

    public getLogo(storeId?: string) {
        let url = this.API_URL + '/logo';
        if(storeId) url += `?store_id=${storeId}`;
        return fetch(url, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })
    }

    public getAboutContent() {
        let url = this.API_URL + '/about';
        return fetch(url, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })
    }

    public getProvice() {
        return fetch(this.API_URL+'/province', {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })
    }
    public getDistrict(provinceId: string) {
        return fetch(this.API_URL+`/district?province_id=${provinceId}`, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })
    }

    public getTimeSlot() {
        return fetch(this.API_URL+`/timeslot`, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })

    }

    public getLimitReservationDays() {
        return fetch(this.API_URL+`/reservation-day`, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })

    }

    public getProductCategoryList(params: {store_id?: number, service_id?: number}) {
        let url = this.API_URL+`/category`;
        const { store_id, service_id } = params;
        const _q = getQueryString(params);
        //if(storeId) url += `?store_id=${storeId}`
        if(_q) url += '?'+_q;
        return fetch(url, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })
    }

    public getTermCondition() {
        return fetch(this.API_URL+`/term-condition`, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })
    }

    public getCompanies() {
        return fetch(this.API_URL+`/buyer-company`, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })
    }

    public getShippingMethod(storeId?: number) {
        let url = this.API_URL+`/shipping`;
        if(storeId) url += `?store_id=${storeId}`
        return fetch(url, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })
    }

    public getServices() {
        return fetch(this.API_URL+`/service`, {
            method: 'GET',
            headers: clientAuthHeader()
        }).then(handleResponse).then((result: any)=>{
            return result.data;
        })   
    }

}

export const masterService = new MasterService();
