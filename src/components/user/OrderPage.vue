<template>
	<div class="confirmation-wrapper pb-5">
		<b-container class="px-0">
			<b-row align-v="center" class="my-3">
				<b-col>
					<b-button variant="link" @click="$router.go(-1)" class="text-dark-grey pl-1">
						<SvgIcons svg="leftArrow" />
					</b-button>
				</b-col>
			</b-row>
		</b-container>
		<div v-if="isLoading" >
			<vcl-twitch class="mb-5"></vcl-twitch>
			<vcl-list class="mb-5"></vcl-list>
			<vcl-code></vcl-code>
		</div>
		<div v-if="!isLoading">
			<TopHeading class="h4 mb-1" :title="`หมายเลขสั่งจอง : ${order.order_no}`"/>
			<p class="small text-grey">ผู้รับสินค้า: {{order.customer_name}}</p>
			<div class="w-100 mb-2" v-if="payment && payment.bank_account && (order.payment_notify)">
				<button type="button" class="w-100 rounded-sm btn btn-primary text-nowrap" v-b-modal.PaymentUploadEvidenceModal>
					<span class="d-inline-block mr-1" style="vertical-align: 3px;"><SvgIcons svg="receipt" /></span>
					<span style="vertical-align: 2px;">แนบหลักฐานการชำระเงิน</span>
				</button>
			</div>
			<p class="font-weight-medium h5">สถานที่รับสินค้า</p>
			<div class="card box-shadow mb-3" style="max-width: 100%;">
				<div :id="`reserve-station-${station.id}`" class="image-container" >
					<img v-if="station.image" :src="station.image" class="card-img-top" :alt="`StationID-${station.id}`" />
					<img v-if="!station.image" src="@/assets/station-placeholder.jpg" class="card-img-top" :alt="`StationID-${station.id}`"/>
				</div>
				<div class="card-body pb-3">
					<div class="card-text">
						<b-row class="mb-2">
							<b-col cols="9" class="pl-2">
								<h6 class="m-0">{{station.name}}</h6>
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
								<a v-if="station.telephone" :href="`tel:${station.telephone}`" target="_self" class="display-5">
									<SvgIcons svg="phoneCircle" style="line-height: 1;"/>
								</a>
							</b-col>
						</b-row>
					</div>
				</div>
			</div>
			<hr/>
			<p class="font-weight-medium h5">รายการสั่งจอง</p>
			<b-container class="stock-list-wrapper">
				<b-row v-if="productList">
					<b-col cols="12" v-for="(product, key) in productList" :key="key" class="mb-4">
						<div class="row align-items-start border border-light py-2 rounded box-shadow">
							<div class="col-3 px-2">
								<img class="img-fluid rounded-lg" :src="product.image" />
							</div>
							<div class="col-9">
								<p class="font-weight-medium mt-0 text-truncated">{{product.name}}</p>

								<div class="d-flex justify-content-between text-primary">
									<span>x{{`${product.quantity}`}}</span>
									<span>{{renderPrice(product.total)}}</span>
								</div>

							</div>
						</div>
					</b-col>
				</b-row>
			</b-container>
			<div class="mb-2 w-100">
				<hr />
				<p class="font-weight-medium h5">ช่องทางรับสินค้า</p>
				<div v-if="shipping && Object.keys(shipping).length">

				</div>
				<div>
					<div class="d-flex justify-content-between text-primary">
						<p class="text-grey">รับสินค้าด้วยตนเอง</p>
						<span v-html="renderPrice(-1)"></span>
					</div>
				</div>
			</div>
			<div v-if="order.receive_date">
				<hr />
				<p class="font-weight-medium h5">วันและเวลารับสินค้า</p>
				<div class="mb-2 w-100">
					<p class="text-grey">{{order.receive_date}}</p>
				</div>
			</div>
			<div v-if="!order.receive_date && shipping">
				<hr />
				<p class="font-weight-medium h5">วิธีรับสินค้า</p>
				<div class="mb-2 w-100">
					<p class="text-grey">{{shipping.title}}</p>
				</div>
			</div>
		</div>
		<div v-if="!isLoading" class="order-action-wrapper px-2 pt-3 pb-3 bg-white border-top w-100 position-fixed">
			<div class="container">
				<div class="row">
					<div class="offset-lg-3 col-lg-6 px-2">
						<div class="d-flex justify-content-between">
							<div class="d-flex align-items-center">
								<span class="text-grey mr-2">รวม</span>
								<span class="text-primary total-price">{{renderPrice(grandTotal, true)}}</span>
							</div>
							<div class="d-flex justify-content-end">
								<a-popconfirm
									title="ยืนยันลบสินค้า ?"
									@confirm="cancelOrder"
									@cancel="cancelDelete"
									okText="ตกลง"
									cancelText="ยกเลิก"
									placement="topRight">
									<span><b-button v-if="order.is_allow_cancel" class="mt-1 mr-2 text-center" variant="danger" :disabled="viewing">
										<span v-show="viewing" class="mr-2 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
										<span class="px-0 py-4">ยกเลิกการจอง</span>
									</b-button></span>
								</a-popconfirm>
							<b-button class="mt-1 text-center" variant="primary" @click="viewOrderDoc" :disabled="viewing">
								<span v-show="viewing" class="mr-2 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
								<span class="px-2 py-4">ดูใบจอง</span>
							</b-button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<PaymentUploadEvidenceModal :orderId="+orderId"/>
</div>
</template>


<script lang="ts">
import moment from 'moment';
import 'moment/locale/th';
import { Component, Vue } from 'vue-property-decorator'
import { bahtFormatted } from '../../_helpers/index';
import { userService } from '../../_services/user.service'
import PaymentUploadEvidenceModal from '../PaymentUploadEvidenceModal.vue';
import NumberInput from '../NumberInput.vue';
import SvgIcons from '../icon/SVGIcons.vue';
import TopHeading from '../TopHeading.vue';
// @ts-ignore
import { VclTwitch, VclList, VclCode } from 'vue-content-loading';
import { IUser, ICart, IProduct, EMenuURL } from '../../_types';
import { masterService, productService, orderService } from '../../_services';
import { namespace } from 'vuex-class';
const userModule = namespace('User');

moment.locale('th')

@Component({
	components: {
		SvgIcons,
		TopHeading,
		VclTwitch,
		VclList,
		VclCode,
		NumberInput,
		PaymentUploadEvidenceModal
	},
})
export default class OrderPage extends Vue {
	@userModule.State
	public status!: {loggedIn: boolean};
	@userModule.State
	public user!: IUser;

	@userModule.Action
	public updateCart!: (stationWithAmount: string) => void;
	@userModule.Action
	public updateOrder!: (orders: any) => void;
	@userModule.Action
	public setProfile!: (redirect?: any)=>void;

	private orderId: string = '';
	private invalidForm: boolean = true;
	private order: any = null;
	private payment: any = null;
	private station: any = null;
	private productList: null|any[] = null;
	private grandTotal: number = 0;
	private shipping: any = null;
	private isLoading: boolean = true;
	private menuURL = EMenuURL;
	private viewing: boolean = false

	created() {
		this.orderId = this.$route.params.orderId;
		if(this.orderId){
			this.fetchOrder();
		}
	}

	mounted() {
	}

	fetchOrder() {
		this.isLoading = true
		userService.getOrder(this.orderId)
		.then((result: any)=>{
			console.log('order:', result);
			this.order = result.order;
			this.payment = result.payment;
			this.station = result.store;
			this.productList = result.product;
			this.grandTotal = Number(result.grand_total!.total);
			this.shipping = result.shipping;
		})
		.finally(()=>this.isLoading = false)
	}

	cancelOrder() {
		//this.updateOrder()
		orderService.cancel(this.orderId)
		.then((result: any)=>{
			if(result.success) {
				this.$message.info(result.data.user_massage);
				// @ts-ignore
				const newOrder = this.user.order.map((ele: any)=>{
					let order = ele;
					if(order.id === this.orderId){
						order.status = "ยกเลิกคำสั่งซื้อ";
					}
					return order;
				});
				this.updateOrder(newOrder);
				this.setProfile();
				setTimeout(()=>{
					this.$router.push(this.menuURL.PROFILE)
				}, 1500)

			}else{
				this.$message.error(result.data.user_massage);
			}
		})
	}

	renderPrice(price: number, showSymbol: boolean = false) {
		if(price == -1) return `<span class="text-primary">ฟรี</span>`;
		return price? bahtFormatted(price, showSymbol): '<span class="text-danger">หมด</span>';
	}

	renderNumber(num: string) {
		return new Intl.NumberFormat().format(+num)
	}

	viewOrderDoc(){
		this.$router.push({name: 'slipPage', params: {orderId: this.orderId}})
	}


	confirmDelete(productId: string) {
		this.updateCart(JSON.stringify({productId, amount: 0}));
	}

	cancelDelete(e: any) {
	}


	get totalCartAmount() {
		return this.user.totalCartAmount;
	}

	get totalPrice() {
		return bahtFormatted(this.grandTotal, true);
	}

	destroyed() {

	}
}

</script>

<style scoped>
.order-action-wrapper{
	bottom: 0;
	left: 0;
	z-index: 999;
}
.card-img-top{
	max-height: 100%;
}
.stock-list-wrapper{
	/*max-height: 250px;
	overflow: scroll;*/
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
#inline-form-input-date-selected + span.d-block{
	position: absolute;
	font-size: 1.5rem;
	line-height: 0;
	top: 6px;
	left: 8px;
	z-index: 9;
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
}

/*@media(max-width: 430px){

	}*/

</style>
