export interface IRegisterPayload{
	identity_id: string;
	phone_no: string;
	firstname: string;
	lastname: string;
	term_id: number;
	company?: string|null;
}

export interface ILoginPayload{
	identity_id: string;
	phone_no: string;
}

export interface ICart {
	productId: string;
	amount: number;
	title: string;
	image: string;
	price: number;
	limit: number;
	model: any;
}



export interface IUser {
	firstName?: string;
	lastName?: string;
	cart: ICart[];
	totalCartAmount: number;
	profile?: {
		name: string;
		telephone: string;
		required_update?: boolean;
	};
	order?: any[];
	orderProductHistory?: any[];
	shipping?: {[key: string]: any};
}

export enum EMenuURL {
	PRODUCTS = '/',
	PRODUCT = '/product',
	STATIONS = '/store',
	STATIONS_RESERVATION = '/stations/reserve',
	STATION = '/store',
	PROFILE = '/profile',
	LOGIN = '/login',
	REGISTER = '/register',
	CART = '/cart',
	CONFIRMATION = '/confirmation',
	ABOUT = '/about'
}

export interface IProduct {
	"id": string;
	"title": string;
	"product_code": string;
	"description": string;
	"price": number;
	"limit_qty": number;
	"category_name": string;
	"unit_name": string;
	"image": string,
	"images"?: string[]
}
