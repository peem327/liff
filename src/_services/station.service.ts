import { authHeader, clientAuthHeader, getQueryString } from '../_helpers';
import { IUser, IRegisterPayload } from '../_types';
import { handleResponse } from './response.middleware';

interface IQuery{
	page?: number;
	limit?: number;
	pid?: string;
}

interface IByLatLng extends IQuery {
	lat: string; lng: string
}

interface IByLocation extends IQuery {
	province_id: number; district_id?: number
}


export default class StationService {
	private API_URL = process.env.VUE_APP_API_URL;

	public getList(queryParams:IByLatLng|IByLocation) {

		return fetch(this.API_URL+'/v1/stores?'+getQueryString(queryParams), {
			method: 'GET',
			headers: clientAuthHeader()
		}).then(handleResponse).then((result: any)=>{
			return result.data;
		})
	}
	public get(storeId: string) {
		let url = this.API_URL+`/v1/stores`;
		if(storeId){
			url += `?id=${storeId}`;
		}
		return fetch(url, {
			method: 'GET',
			headers: clientAuthHeader()
		}).then(handleResponse).then((result: any)=>{
			return result.data;
		})
	}

}

export const stationService = new StationService();


