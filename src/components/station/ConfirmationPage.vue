<template>
	<div class="confirmation-wrapper pb-5">
		<b-container class="px-0">
			<b-row align-v="center" class="my-3">
				<b-col>
					<b-button v-if="!isLoading" variant="link" @click="handleBackState()" class="text-dark-grey pl-1">
						<SvgIcons svg="leftArrow" />
					</b-button>
				</b-col>
			</b-row>
		</b-container>
		<TopHeading class="mb-3" title="ยืนยันการสั่งจอง"/>
		<p class="font-weight-medium h5">สถานที่รับสินค้า</p>
		<div v-if="isLoading" >
			<vcl-twitch class="mb-5"></vcl-twitch>
			<vcl-list class="mb-5"></vcl-list>
			<vcl-code></vcl-code>
		</div>
		<div v-if="!isLoading && station">
			<div class="card box-shadow mb-3" style="max-width: 100%;">
				<div :id="`reserve-station-${station.id}`" class="image-container cursor-pointer" @click="$router.push(menuURL.STATION+`/${station.id}`)">
					<img v-if="station.image" :src="station.image" class="card-img-top" :alt="`StationID-${station.id}`" />
					<img v-if="!station.image" src="@/assets/station-placeholder.jpg" class="card-img-top" :alt="`StationID-${station.id}`"/>
				</div>
				<div class="card-body pb-3">
					<div class="card-text">
						<b-row class="mb-2">
							<b-col cols="9" class="pl-2">
								<h6 class="m-0">{{station.store_name}}</h6>
							</b-col>
							<b-col cols="3">
								<h6 class="m-0 text-right font-weight-light text-primary">{{station.distance}}</h6>
							</b-col>
						</b-row>
						<b-row align>
							<b-col cols="10" class="pl-2">
								<p class="d-flex text-grey mb-0">
									<span class="text-primary mr-1"><SvgIcons svg="placePin" /></span>
									<span class="font-weight-light address">{{station.address}}</span>
								</p>
							</b-col>
							<b-col cols="2" class="text-right pl-0 pr-2">
								<a v-if="station.phone_no" :href="`tel:${station.phone_no}`" target="_self" class="display-5">
									<SvgIcons svg="phoneCircle" style="line-height: 1;"/>
								</a>
							</b-col>
						</b-row>
					</div>
				</div>
			</div>
			<router-link :to="menuURL.STATIONS_RESERVATION">
				<button class="w-100 btn btn-outline-primary mb-2">
					เปลี่ยนสถานที่รับสินค้า
				</button>
			</router-link>
			<hr />
			<div v-if="shippingMethodOptions && shippingMethodOptions.length"> <!-- v-b-modal.modalShippingTypePicker -->
				<p class="font-weight-medium h5">เลือกช่องทางรับสินค้า</p>
				<div class="mb-4 w-100 position-relative text-primary suffix-input-wrapper">
					<b-input v-model="shippingMethodInputModel.text" :style="{paddingLeft: shippingMethodInputModel.icon? '40px': '8px'}"
					class="bg-white text-primary prefix-input-value"
					@click="handleClickShippingMethodOption()" readonly placeholder="กรุณาระบุช่องทางรับสินค้า"></b-input>
					<SvgIcons v-if="shippingMethodInputModel.icon" :svg="shippingMethodInputModel.icon" />
					<span v-show="shippingMethodInputModel.price != null && shippingMethodInputModel.price >= 0" class="price">
						{{shippingMethodInputModel.price > 0 ? shippingMethodInputModel.price: "ฟรี"}}
					</span>
				</div>
				<hr />
			</div>
			<div v-if="(Object.keys(shippingMethodSetting).length && shippingMethodSetting.reservation_day) || !shippingMethodOptions.length">
				<p class="font-weight-medium h5 d-none">กรุณาเลือกวันและเวลารับสินค้า ก่อนยืนยันการสั่งจอง</p>
				<p class="font-weight-medium h5">วันรับสินค้า</p>
				<div class="mb-4 w-100 position-relative text-primary">
					<b-input id="inline-form-input-date-selected" v-model="selectedDateTimeModel" class="bg-white text-primary select-date-input" v-b-modal.modalCalendarPicker readonly placeholder="กรุณาระบุ วันและเวลา"></b-input>
					<SvgIcons svg="calendar" />
				</div>
				<hr/>
			</div>

			<div class="d-flex justify-content-between mb-3">
				<p class="font-weight-medium h5">รายการสั่งจอง</p>
				<div>
					<router-link class="btn btn-outline-primary" :to="menuURL.PRODUCTS">+ เลือกสินค้าเพิ่มเติม</router-link>
					<!-- <a-popconfirm v-if="currentCart && currentCart.length"
						title="ยืนยันลบสินค้าทั้งหมด ?"
						@confirm="onClearCart()"
						@cancel="cancelDelete"
						okText="ตกลง"
						cancelText="ยกเลิก"
						placement="left">
						<span class="text-grey mx-1">|</span><span class="cursor-pointer text-danger" style="line-height: 1;">ลบทั้งหมด</span>
					</a-popconfirm> -->
				</div>
			</div>
		<b-container class="stock-list-wrapper">
			<a-empty v-if="!currentCart || !currentCart.length" description="ไม่พบข้อมูล" />
			<b-row v-if="currentCart.length">
				<b-col cols="12" v-for="product in currentCart" class="mb-4"
					:key="`${product.productId}${product.model? '-'+product.model.id: ''}`">
					<div class="row align-items-start border border-light py-2 rounded box-shadow">
						<div class="col-3 px-2">
							<img class="img-fluid rounded-lg" 
								:src="product.model? product.model.image||product.image: product.image" />
						</div>
						<div class="col-9 pl-2">
							<div class="d-flex justify-content-between mb-2">
								<p class="font-weight-medium mt-0 mb-0 text-truncated">
									{{product.title}}
									<!-- <span class="small text-grey text-nowrap" v-if="product.model">{{product.model.name}}</span> -->
								</p>
								<a-popconfirm v-if="currentNumberInputWithCart(product) > 0"
									title="ยืนยันลบสินค้า ?"
									@confirm="confirmDelete(product.productId)"
									@cancel="cancelDelete"
									okText="ตกลง"
									cancelText="ยกเลิก"
									placement="left">
									<span class="cursor-pointer text-danger" style="line-height: 1"><SvgIcons svg="bin" /></span>
								</a-popconfirm>
							</div>
							<p class="small text-grey text-nowrap mt-n1 mb-1" v-if="product.model">{{product.model.name}}</p>
							<p class="mb-2 text-primary text-nowrap" v-html="bahtFormatted(product.price)"></p>
							<div class="d-flex justify-content-between align-items-end">
								<div>
									<NumberInput v-if="getPurchaseLimitation(product) !== 0"
									:id="`${product.productId}${product.model? '-'+product.model.id: ''}`" 
									:current="currentNumberInputWithCart(product)"
									:limit="getPurchaseLimitation(product)"
									:disabled="isNumberInputDisable(product)"
									v-on:change="onNumberChange" class="" />
									<span class="small text-danger" v-if="getPurchaseLimitation(product) == 0">จองสินค้าครบตามโควต้าแล้ว</span>
								</div>
								<span class="text-primary text-nowrap" 
									v-if="getPurchaseLimitation(product) !== 0" 
									v-html="renderPrice(product)"></span>
							</div>
							<!-- getPurchaseLimitation(product) product.limit-->
						</div>
					</div>
				</b-col>
			</b-row>
		</b-container>
</div>
<div class="confirm-reservation-wrapper px-2 pt-3 pb-3 bg-white border-top w-100 position-fixed">
	<div class="container">
		<div class="row">
			<div class="offset-lg-3 col-lg-6 px-2">
				<div class="d-flex justify-content-between">
					<div class="d-flex align-items-center">
						<span class="text-grey mr-2">รวม</span>
						<span class="text-primary total-price">{{totalPrice}}</span>
					</div>
					<b-button class="mt-1 text-center" variant="primary" @click="onConfirmReservation" :disabled="confirming || !validForm">
						<span v-show="confirming" class="mr-2 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
						<span class="">ยืนยันการสั่งจอง</span>
					</b-button>
				</div>
			</div>
		</div>
	</div>
</div>
<b-modal id="modalCalendarPicker" title="เลือกวันและเวลารับสินค้า" ok-only ok-title="ยืนยัน" hide-header-close @ok="handleModalOk">
	<div class="mx-auto" :style="{ width: '100%', border: '1px solid #d9d9d9', borderRadius: '4px' }">
		<CalendarHeader v-if="!isLoadingLimitDays" :limitReservationDays="limitReservationDays" 
			v-on:selected="onCalendarDateSelected" :defaultValue="selectedDate" />
	</div>
	<hr/>

	<p class="font-weight-medium h5">เวลารับสินค้า</p>
	<b-form-group>
		<b-form-radio-group
		id="btn-radios"
		class="w-100"
		v-model="selectedTime"
		:options="timeSlotOptions"
		buttons
		button-variant="outline-primary"
		size="lg"
		name="radio-btn-outline"
		></b-form-radio-group>
	</b-form-group>
	<hr/>
	<p class="small text-grey text-center">
		หากผู้รับไม่ได้มารับสินค้าภายในวันที่เลือกและกำหนดไว้ จะถือว่าโมฆะ และสินค้าที่สั่งจองจะนำไปจำหน่ายให้แก่บุคคลอื่น
	</p>
</b-modal>

<b-modal id="modalShippingTypePicker" centered title="เลือกช่องทางรับสินค้า" ok-only ok-title="ยืนยัน" hide-header-close @ok="handleShippingModalOk">
	<a-radio-group v-model="shippingMethodModel.code" @change="onChangeShippingMethod">
		<a-radio
		:style="{display: 'block',height: 'auto',lineHeight: 'inherit'}"
		v-for="method in shippingMethodOptions" :key="method.shipping_code" :value="method.shipping_code" >
		<span class="d-inline-flex w-100">
			<span class="mr-2"><SvgIcons style="lineHeight: 1;" :svg="getShippingMethodIcon(method.shipping_code)" /></span>
			<span class="font-weight-bold">{{method.title}}</span>
			<span v-if="method.setting && method.setting.price >=0" class="ml-2 text-primary">{{method.setting.price == 0 ? "ฟรี": method.setting.price}}</span>
		</span><br />
		<span class="ml-5 font-weight-light">{{method.sub_title}}</span>
	</a-radio>
</a-radio-group>
</b-modal>
<PaymentMethodsModal v-if="station" :storeId="+station.id"/>
</div>
</template>


<script lang="ts">
import moment from 'moment';
import 'moment/locale/th';
import { Component, Vue } from 'vue-property-decorator'
import { bahtFormatted } from '../../_helpers/index';
import NumberInput from '../NumberInput.vue';
import SvgIcons from '../icon/SVGIcons.vue';
import TopHeading from '../TopHeading.vue';
import CalendarHeader from './CalendarHeader.vue';
import PaymentMethodsModal from '../PaymentMethodsModal.vue';
// @ts-ignore
import { VclTwitch, VclList, VclCode } from 'vue-content-loading';
import { IUser, ICart, IProduct, EMenuURL } from '../../_types';
import { masterService, productService, stationService, orderService } from '../../_services';
import { namespace } from 'vuex-class';
const userModule = namespace('User');
const storeModule = namespace('Store');

moment.locale('th')

@Component({
	components: {
		SvgIcons,
		TopHeading,
		VclTwitch,
		VclList,
		VclCode,
		NumberInput,
		CalendarHeader,
		PaymentMethodsModal
	},
})
export default class ConfirmationPage extends Vue {
	@userModule.State
	public status!: {loggedIn: boolean};
	@userModule.State
	public user!: IUser;

	@userModule.Action
	public updateCart!: (stationWithAmount: string) => void;
	@userModule.Action
	public clearCart!: () => void;
	@userModule.Action
	public setProfile!: (redirect?: any)=>void;
	@userModule.Action
	public setStation!: (obj?: string) => void;
	@userModule.Action
	public updateShipping!: (shipping?: any) => void;

	@storeModule.State
	public store!: {id:string;logo: string};

	private invalidForm: boolean = true;
	private stationId: string = '';
	private station: any = null;
	private stockList: null|any[] = null;
	private minWidth: string = '400px';
	private isLoading: boolean = true;
	private moment = moment;
	private menuURL = EMenuURL;
	private limitReservationDays = 10;
	private isLoadingLimitDays = false;
	private purchaseHistory: any|null = null;
	private bahtFormatted = bahtFormatted;

	selectedDate = this.moment();
	selectedTime = '';
	selectedDateTimeModel = '';
	shippingMethodModel = {
		id: 1,
		code: 'pickup'
	};
	timeSlotOptions = [
		{ text: '8:00 - 12:00', value: '5' },
		{ text: '13:00 - 17:00', value: '6' },
	];
	confirming = false;
	shippingMethodOptions: any[] = [];
	shippingMethodInputModel: any = {
		text: '',
		icon: '',
		price: null
	};
	shippingMethodSetting: any = {};

	async created() {
		window.addEventListener("resize", this.onResize);
		this.stationId = this.$route.params.stationId;
		// if(!this.station){

		// }
		await this.fetchStation();
		this.invalidForm = true;

		//this.selectedDateTimeModel = `${this.selectedDate.format('dddd DD MMM')}`;
		if(this.user && this.user.shipping) {
			const { icon, price, text, selectedDate, selectedTime, selectedDateTime, reservation_day, timeslot, location, code, id } = this.user.shipping;
			if(selectedDate) this.selectedDate = this.moment(selectedDate);
			if(selectedTime) this.selectedTime = selectedTime;
			if(selectedDateTime) this.selectedDateTimeModel = selectedDateTime;
			this.shippingMethodSetting = {
				...(reservation_day && {reservation_day}),
				...(timeslot && {timeslot}),
				...(location && {location}),
			};
			this.shippingMethodInputModel = {
				text,
				icon,
				price
			};
			this.shippingMethodModel = {
				id,
				code
			};

			if(reservation_day) {
				this.limitReservationDays = reservation_day;
			}
			if(timeslot) {
				this.timeSlotOptions = timeslot.map((ele: any)=>{
					return {text: ele.name, value: ele.timeslot_id}
				})
			}
			if(["store_delivery", "appointment"].includes(code) || (this.selectedDate && this.selectedTime && this.selectedDateTimeModel)){
				this.invalidForm = false;
			}
			// console.log('Current User Shipping: ', this.user.shipping, this.invalidForm);
		}
		await this.getTimeSlot();
		//this.getLimitReservationDays();
		await this.getShippingMethod();
	}

	fetchStation() {
		this.isLoading = true

		stationService.get(this.store.id || this.stationId)
		.then((result: any)=>{
			setTimeout(()=>{
				this.station = result.store;
				this.stockList = result.stock;
				setTimeout(()=>{
					window.dispatchEvent(new Event('resize'));
					this.isLoading = false
				}, 800)
			}, 500)
		})
	}

	getTimeSlot(){
		if(this.timeSlotOptions && this.timeSlotOptions.length) return;
		masterService.getTimeSlot()
		.then((timeSlots: any)=>{
			this.timeSlotOptions = timeSlots.map((ele: any)=>{
				return {text: ele.name, value: ele.timeslot_id}
			});

		})
	}

	onNumberChange(newVal: {id: string; amount: number}) {
    let {id, amount} = newVal;
    let modelId = '';
    if(id.includes('-')){
        const tmp = id.split('-');
        id = tmp[0];
        modelId = tmp[1];
    }
    const product = this.user.cart.find((ele)=>{
        if(modelId) return ele.model.id == modelId;
        return ele.productId == id
    })
    this.updateCart(
        JSON.stringify(
            {
                productId: id, 
                amount, 
                limit: product!.limit, 
                title: product!.title, 
                image: product!.image, 
                price: product!.price,
                model: product!.model
            }
        )
    );
  }

	onResize(e: any) {
		this.minWidth = e.target.outerWidth + 'px';
	}

	renderPrice(cartProduct: any) {
		const {productId, price, amount} = cartProduct;
		const currentProduct = this.getProductInStock(productId);
		return !currentProduct || currentProduct.quantity_online < 0  ? '<span class="text-danger">หมด</span>':bahtFormatted(price*amount);
	}

	setDisableDate(current: any) {
		return current < this.moment().startOf('day');
	}

	onSelectDate(date: moment.Moment) {
		this.selectedDate = date;
	}

	handleClickShippingMethodOption() {
		if(this.shippingMethodOptions.length > 1){
			this.$bvModal.show('modalShippingTypePicker')
		}
	}

	handleModalOk(){
		// @ts-ignore
		const time = this.timeSlotOptions.find((ele:any)=>ele.value==this.selectedTime).text;
		const date = this.selectedDate;
		this.selectedDateTimeModel = `${date.format('DD MMM YYYY')} เวลา ${time}`;
		this.invalidForm = false;
		let tmp = {
			...this.shippingMethodInputModel, ...this.shippingMethodSetting, ...this.shippingMethodModel,
			selectedDate: this.selectedDate,
			selectedTime: this.selectedTime,
			selectedDateTime: this.selectedDateTimeModel
		};
		this.updateShipping(JSON.stringify(tmp));
	}

	handleShippingModalOk(){
		this.invalidForm = true;
		const selectedShipping = this.shippingMethodOptions.find((ele)=>ele.shipping_code == this.shippingMethodModel.code);
		this.setShipping(selectedShipping);
	}

	getShippingMethodIcon(shippingCode: string): string{
		let icon = '';
		switch (shippingCode) {
			case "pickup":
			icon = 'store_ic';
			break;
			case "store_delivery":
			icon = 'walking';
			break;
			default:
			icon = 'walking';
			break;
		}
		return icon;
	}

	confirmDelete(productId: string) {
		this.updateCart(JSON.stringify({productId, amount: 0}));
	}

	cancelDelete(e: any) {
	}

	currentNumberInputWithCart(cartProduct: any) {
		let currentProduct = this.getProductInStock(cartProduct.productId);
		if(!currentProduct) return cartProduct.amount;
		return currentProduct.quantity_online > 0 ? cartProduct.amount : 0;
	}

	isNumberInputDisable(cartProduct: any) {
		let currentProduct = this.getProductInStock(cartProduct.productId);
		//console.log('limit_qty', cartProduct, currentProduct);
		if(!currentProduct) return true;
		if(currentProduct.limit_qty === 0) return false;
		if(currentProduct.quantity_online > 0){
			return true;
		}else if(cartProduct.limit == 0){
			return true;
		}
		return false;
		//return currentProduct.quantity_online > 0 ? false : true;
	}

	getProductInStock(cartProductId: string) {
		if(!this.stockList || !this.stockList.length) return;
		const result = this.stockList.find((ele: any)=>ele.id==cartProductId);
		// console.log('getProductInStock', result);
		return result;
	}

	onCalendarDateSelected(date: moment.Moment){
		this.selectedDate = date;
	}

	handleBackState(){
		//this.$router.push({name: 'singleStation', params:{stationId: station.id}})
		window.history.back();
	}

	onChangeShippingMethod(event: any){
		this.shippingMethodInputModel = {
			text: '',
			icon: '',
			price: null
		};
		this.shippingMethodSetting = {};
		this.selectedDateTimeModel = '';

	}

	onClearCart(){
		this.clearCart();
		this.setStation();
	}

	get currentCart(){
		if(!this.stockList || !this.stockList.length) return this.user.cart || [];
		let result: any[] = [];
		this.user.cart.forEach(item=>{
			const prodId = item.productId;
			const stockProd = this.stockList ? this.stockList.find(stock=>stock.id==prodId) : undefined;
			if(stockProd){
				result = [...result, item];
			}
		})
		return result;
	}

	get totalCartAmount() {
		return this.user.totalCartAmount;
	}

	get totalPrice() {
		return bahtFormatted(/*this.user.cart*/this.currentCart.reduce((a, b)=>{
			return a + (b['amount'] * b['price']);
		}, 0));
	}

	get validForm() {

		if(!this.stockList /*|| !this.selectedDate || !this.selectedTime*/ ) {
			return false;
		}
		let isCartMatch =  !this.invalidForm && (this.user.cart && this.user.cart.length > 0);
		if(this.user.cart && this.user.cart.length){
			this.user.cart.forEach((product: any)=>{
				// @ts-ignore
				let stock = this.stockList.find((ele: any)=>ele.id === product.productId);
				if(!stock || (stock.quantity_online < product.amount) || this.getPurchaseLimitation(product) == 0){
					isCartMatch = false;
				}
			});
		}
		return /*isCartMatch &&*/ !this.invalidForm;
	}

	getPurchaseLimitation(product: any) {
		let purchaseHistory;
		let tmp = JSON.parse(JSON.stringify(product));
		if(this.user && this.user.orderProductHistory && this.user.orderProductHistory.length){
			purchaseHistory = this.user.orderProductHistory.find((ele: any)=>{
				return ele.id === tmp.productId
			});
		}
		if(this.stockList && this.stockList.length){
			let stock = this.stockList.find((ele: any)=>ele.id === product.productId);
			if(!stock || stock.limit_qty === 0){
				return -1;
			}
		}
		if(purchaseHistory && purchaseHistory.quantity_buy){
			let ableToPurchase = purchaseHistory.quantity_buy < tmp.limit;
			return tmp.limit - purchaseHistory.quantity_buy;
		}
		return tmp.limit;
	}

	async getLimitReservationDays() {
		this.isLoadingLimitDays = true;
		const result = await masterService.getLimitReservationDays();
		this.isLoadingLimitDays = false
		if(result && result.limit_day){
			this.limitReservationDays = result.limit_day;
			return;
		}
		this.limitReservationDays = 5;
	}

	async getShippingMethod() {
		const result = await masterService.getShippingMethod(+this.store.id || +this.stationId)
		if(result && result.length) {
			this.shippingMethodOptions = result;
			if(result.length == 1 && !(this.user && this.user.shipping)){
				const selectedShipping = result[0];
				this.shippingMethodModel = {
					id: result[0].shipping_id,
					code: result[0].shipping_code
				};
				this.setShipping(selectedShipping);
			}
		}
	}

	setShipping(selectedShipping: any) {
		this.shippingMethodInputModel.text = selectedShipping.title;
		this.shippingMethodInputModel.price = selectedShipping.setting? selectedShipping.setting.price: null;
		this.shippingMethodInputModel.icon = this.getShippingMethodIcon(selectedShipping.shipping_code);
		this.shippingMethodSetting = {};
		if(selectedShipping.setting){
			this.shippingMethodSetting = selectedShipping.setting;
			this.limitReservationDays = selectedShipping.setting.reservation_day;
			const timeSlots = selectedShipping.setting.timeslot;
			this.timeSlotOptions = timeSlots ? timeSlots.map((ele: any)=>{
				return {text: ele.name, value: ele.timeslot_id}
			}): null;
		}
		if(["appointment", "store_delivery"].includes(selectedShipping.shipping_code)){
			this.invalidForm = false;
		}else{
			this.invalidForm = true;
		}
		let tmp = {...this.shippingMethodInputModel, ...this.shippingMethodSetting, ...this.shippingMethodModel};
		this.updateShipping(JSON.stringify(tmp));
		//console.log(this.shippingMethodInputModel, this.shippingMethodSetting);
	}

	onConfirmReservation(){

		if(!this.status.loggedIn){
			/*$router.push({name: 'confirmationPage', params: {stationId: stationSelected}})*/
			return this.$router.push({path: this.menuURL.LOGIN, query: { redirect: 'confirmationPage', stationId: this.stationId }})
		}else if(this.status.loggedIn && (this.user.profile && this.user.profile.required_update)) {
			return this.$router.push({path: this.menuURL.REGISTER, query: { redirect: 'confirmationPage', stationId: this.stationId }})
		}
		this.confirming = true;

		const selectedShipping = this.shippingMethodOptions.find((ele)=>ele.shipping_code == this.shippingMethodModel.code);
		let payload: any = {
			store_id: this.stationId,
			product: [],
			shipping_id: selectedShipping? selectedShipping.shipping_id: null,
			model: null 
		};
		const products = this.currentCart.filter((ele: any)=>ele.amount && !ele.model).map((ele: ICart)=>{
			return	{id: ele.productId, qty: ele.amount}
		});
		payload.product = [...products] as any;
		const models = this.currentCart.filter((ele: any)=>ele.model).map((ele: ICart)=>{
			return	{id: ele.model.id, qty: ele.amount}
		});
		if(models){
			payload.model = [...models] as any;
		}
		if((!selectedShipping && this.selectedDate) || (selectedShipping && selectedShipping.shipping_code == 'pickup')){
			const receiveDate = this.selectedDate.format('YYYY-MM-DD');
			payload['receive_date'] = receiveDate;
			payload['timeslot_id'] = this.selectedTime;
		}
		/* eslint-disable no-unreachable */
		//console.log(payload);
		//return;
		orderService.getCheckoutStatus()
		.then((res: any)=>{
			if(!res.available) {
				this.$message.error(res.message)
				this.confirming = false;
				return;
			}
			//orderService.checkout(this.stationId, products, recieveDate, +this.selectedTime)
			orderService.checkout(payload)
			.then((result: any)=>{
				this.$message.info(result.user_massage);
				//this.setProfile();
				setTimeout(()=>{
					//this.clearCart();

					products.forEach(product=>{
						// @ts-ignore
						this.updateCart(JSON.stringify({productId: product.id, amount: 0}));
					});
					this.updateShipping(null);
					this.setStation();

					this.$router.push({name: 'slipPage', params: {orderId: result.order_id}});
				}, 1000)
			})
			.catch((e: any)=>{
				if(e.error.length){
					const msg = e.error[0].user_message;
					this.$message.error(msg);
				}
			})
			.finally(()=>{
				this.confirming = false;
			});
		})
	}

	destroyed() {

		window.removeEventListener("resize", this.onResize);
	}
}

</script>

<style scoped>
.confirm-reservation-wrapper{
	bottom: 0;
	left: 0;
	z-index: 999;
}
.card-img-top{
	max-height: 100%;
}
.stock-list-wrapper{
	max-height: 250px;
	overflow-y: scroll;
	overflow-x: hidden;
}

.station-info-wrapper{
	margin-top: -15px;
	border-top: 1px solid white;
	border-top-right-radius: 20px;
	border-top-left-radius: 20px;
	margin-bottom: 80px;
}
.text-address .small, .ptt.small{
	font-size: 90%;
}
.display-5{
	font-size: 2.5rem;
}
.display-4{
	line-height: 0
}
#inline-form-input-date-selected{
	padding-left: 40px;
}
#inline-form-input-date-selected + span.d-block,
.prefix-input-value + span.d-block
{
	position: absolute;
	font-size: 1.5rem;
	line-height: 0;
	top: 6px;
	left: 8px;
	z-index: 9;
}
.suffix-input-wrapper span.price{
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	right: 5px;
}
#inline-form-input-date-selected::placeholder,
.prefix-input-value::placeholder {
	color: rgb(54, 180, 1);
	opacity: 1; /* Firefox */
}
.spinner-border{
	vertical-align: -2px;
}
@media(min-width: 300px){
	.text-truncate{
		max-width: 220px;
	}
}
@media(min-width: 400px){
	.text-truncate{
		max-width: 280px;
	}
}
@media(min-width: 500px){
	.text-truncate{
		max-width: 300px;
	}
}
@media(min-width: 576px){
	.text-truncate{
		max-width: unset;
	}
	.card-img-top{
		max-height: 400px;
	}
}


</style>
