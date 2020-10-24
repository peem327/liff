import { authHeader, clientAuthHeader } from '../_helpers';
import { IUser, IRegisterPayload } from '../_types';
import { handleResponse } from './response.middleware';

export default class OrderService {
	private API_URL = process.env.VUE_APP_API_URL;

	public getCheckoutStatus() {
		return fetch(this.API_URL+ `/v1/checkout-available` , {
			method: 'GET',
			headers: clientAuthHeader(),
		}).then(handleResponse).then((result: any)=>{
			return result.data;
		})
	}

	// public checkout(stationId: string, products: any[], shippingId: number, recieveDate?: string, timeSlot?: number) {
	// 	const payload = {
	// 		"store_id": stationId,
	// 		"product": products,
	// 		"shipping_id": shippingId
	// 	};
	// const payload = {
	// 	"store_id": stationId,
	// 	"product": products,
	// 	"shipping_id": shippingId
	// };
	public checkout(payload: {
		stationId: string,
		products: any[],
		shippingId: number,
		recieveDate?: string,
		timeSlot?: number,
		model: any
	}) {
		return fetch(this.API_URL+`/v1/checkout`, {
			method: 'POST',
			headers: clientAuthHeader({"Content-Type":"application/json"}),
			body: JSON.stringify({ ...payload })
		}).then(handleResponse).then((result: any)=>{
			return result.data;
		})
	}

	public cancel(orderId: string) {
		return fetch(this.API_URL+`/v1/account/orders/${orderId}/cancel`, {
			method: 'POST',
			headers: clientAuthHeader({"Content-Type":"application/json"}),
		}).then(handleResponse).then((result: any)=>{
			return result;
		})
	}

	public get(orderId: string) {
		return fetch(this.API_URL+`/v1/account/orders/${orderId}`, {
			method: 'GET',
			headers: clientAuthHeader(),
		}).then(handleResponse).then((result: any)=>{
			return result.data;
		})
	}

	public attatchEvidence(orderId: string, payload: {slip_id: string; transfer_date: string; transfer_time: string; comment: string;}) {
		return fetch(this.API_URL+`/v1/account/orders/${orderId}/payment-notify`, {
			method: 'POST',
			headers: clientAuthHeader({"Content-Type":"application/json"}),
			body: JSON.stringify(payload),
		}).then(handleResponse).then((result: any)=>{
			return result.data;
		})
	}

	public getPaymentEvidence(orderId: string) {
		return fetch(this.API_URL+`/v1/account/orders/${orderId}/payment-notify`, {
			method: 'GET',
			headers: clientAuthHeader({"Content-Type":"application/json"}),
			//body: JSON.stringify(payload),
		}).then(handleResponse).then((result: any)=>{
			return result.data;
		})
	}
}

export const orderService = new OrderService();
