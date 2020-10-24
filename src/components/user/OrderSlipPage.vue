<template>
	<div class="order-slip-wrapper">
		<b-container class="px-0">
			<b-row align-v="center" class="my-3">
				<b-col>
					<b-button variant="link" @click="$router.go(-1)" class="text-dark-grey pl-1">
						<SvgIcons svg="leftArrow" />
					</b-button>
				</b-col>
			</b-row>
		</b-container>
		<b-container class="px-1">
			<p class="text-center mb-0"><img class="w-100" src="@/assets/slipTopLine.png"></p>
		</b-container>
		<b-container class="px-1 slip-wrapper" id="my-node" >
			<b-row class="mt-n" v-if="!isEmpty">
				<div class="col-12 bg-slip" id="my-node"
				:style="{ backgroundImage: 'url(' + require('@/assets/slip-bg.png') + ')' }">
				<div v-if="isLoading" class="p-5">
					<vcl-list class="mb-2"></vcl-list>
					<vcl-code></vcl-code>
					<vcl-list class="mb-5"></vcl-list>
				</div>
				<div v-if="!isLoading" class="mt-4 px-1 px-lg-4 px-md-3 px-sm-3 pt-lg-2">
					<div class="text-center pt-1">
						<p>
							<img v-if="store.logo" :src="store.logo" width="90" />
							<!-- <img src="@/assets/or-logo.png" width="90" /> -->
						</p>
						<h5 class="font-weight-medium">{{`หมายเลขสั่งจอง: ${order.order_no}`}}</h5>
						<p class="text-grey font-weight-light">ผู้รับสินค้า: {{order.customer_name}}</p>
					</div>
					<hr />
					<div class="content-wrapper px-3">
						<p v-if="shipping.shipping_code !== 'pickup'" class="d-flex justify-content-between align-items-center">
							<span>ช่องทางรับสินค้า</span>
							<span class="text-grey">{{shipping.title}}</span>
						</p>
						<div v-if="shipping.shipping_code === 'pickup'">
							<p class="mb-0">สถานที่รับสินค้า</p>
							<p class="small font-weight-light text-grey" style="font-size: 90%;">
								{{shipping.location}}
							</p>
							<p class="d-flex justify-content-between align-items-center">
								<span class="">วันเวลารับสินค้า</span>
								<span class="text-grey text-nowrap">{{shipping.receive_date}}</span>
							</p>
						</div>
						<p>รายการจอง</p>
						<p class="text-grey d-flex mb-1 justify-content-betweens flex-nowrap" v-for="(product, key) in products" :key="key">
							<span class="mr-3">{{product.quantity}}</span>
							<span class="text-truncated mb-1 mr-2">{{product.name}}</span>
							<span class="ml-auto text-right">{{product.total}}</span>
						</p>
						<p class="h5 mt-4 d-flex justify-content-between">
							<span>ยอดสุทธิ {{grandTotal.quantity}} ชิ้น</span>
							<span class="text-nowrap">{{renderPrice(grandTotal.total)}}</span>
						</p>
						<hr />
						<p class="small text-grey text-center text-nowrap">**โปรดแสดงบัตรประชาชนเพื่อยืนยันตัวตนแก่พนักงาน**</p>
						<hr />
						<div v-if="payment && payment.qr_image">
							<p class="">ธุรกรรมการเงิน</p>
							<figure class="text-center" >
								<img :src="payment.qr_image" alt="qr-code" style="width:50%">
								<figcaption class="mt-2 small font-weight-light text-grey">แสกนเพื่อจ่าย</figcaption>
							</figure>
							<p v-if="payment.bank_account" class="text-center small font-weight-light text-grey mb-4" style="font-size: 90%;">
								{{payment.bank_account}}
							</p>
						</div>
					</div>
				</div>
			</div>
		</b-row>
	</b-container>
	<b-container v-if="!isLoading">
		<b-row class="mb-3">
			<div class="col-12 px-2">
				<div class="w-100 mb-2" v-if="payment && payment.bank_account && (order.payment_notify)">
					<button type="button" class="w-100 rounded-sm btn btn-primary text-nowrap" v-b-modal.PaymentUploadEvidenceModal>
						<span class="d-inline-block mr-1" style="vertical-align: 3px;"><SvgIcons svg="receipt" /></span>
						<span style="vertical-align: 2px;">แนบหลักฐานการชำระเงิน</span>
					</button>
				</div>
				<div class="d-flex align-items-center justify-content-around">
					<div class="">
						<button type="button" class="px-lg-2 btn btn-primary text-nowrap" @click="$router.push(menuURL.PRODUCTS)">
							<span class="d-inline-block mr-1" style="vertical-align: 3px;"><SvgIcons svg="product" /></span>
							<small style="vertical-align: 2px;">กลับหน้าสินค้า</small>
						</button>
					</div>
					<div class="">
						<button type="button" class="px-lg-2 btn btn-primary text-nowrap" @click="$router.push(menuURL.PROFILE)">
							<span class="d-inline-block mr-1" style="vertical-align: 3px;"><SvgIcons svg="account" /></span>
							<small style="vertical-align: 2px;">กลับหน้าประวัติ</small>
						</button>
					</div>
					<div class="">
						<button type="button" class="px-lg-2 btn btn-primary text-nowrap" @click="downloadSlip">
							<span class="d-inline-block mr-1" style="vertical-align: 3px;"><b-icon-image></b-icon-image></span>
							<small style="vertical-align: 2px;">บันทึกรูปภาพ</small>
						</button>
					</div>
				</div>
			</div>
		</b-row>
		<div v-if="isEmpty">
			<a-empty></a-empty>
		</div>
	</b-container>
	<PaymentUploadEvidenceModal :orderId="+orderId"/>
</div>
</template>


<script lang="ts">
import moment from 'moment';
import download from 'downloadjs';
import 'moment/locale/th';
import { Component, Vue } from 'vue-property-decorator'
import { bahtFormatted } from '../../_helpers/index';
import { userService } from '../../_services/user.service'
import NumberInput from '../NumberInput.vue';
import SvgIcons from '../icon/SVGIcons.vue';
import PaymentUploadEvidenceModal from '../PaymentUploadEvidenceModal.vue';
import TopHeading from '../TopHeading.vue';
import htmlToImage from 'html-to-image';
// @ts-ignore
import { VclTwitch, VclList, VclCode } from 'vue-content-loading';
import { IUser, ICart, IProduct, EMenuURL } from '../../_types';
import { masterService, productService, orderService } from '../../_services';
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
		PaymentUploadEvidenceModal,
	},
})
export default class OrderPage extends Vue {
	@storeModule.State
    public store!: {id: string; logo: string};

	@userModule.State
	public status!: {loggedIn: boolean};
	@userModule.State
	public user!: IUser;
	@userModule.Action
	public setProfile!: (redirect?: any)=>void;
	@userModule.Action
	public updateCart!: (stationWithAmount: string) => void;

	private orderId: string = '';
	private invalidForm: boolean = true;
	private order: any = null;
	private shipping: any = null;
	private station: any = null;
	private products: null|any[] = null;
	private grandTotal: any = null;
	private isLoading: boolean = true;
	private menuURL = EMenuURL;
	private isEmpty: boolean = false
	//private download = download;
	payment: any|null = null;

	created() {
		this.orderId = this.$route.params.orderId;
		if(this.orderId){
			this.setProfile();
			this.getOrder();
		}
	}

	getOrder(){
		this.isLoading = true;
		orderService.get(this.orderId)
		.then((result: any)=>{
			console.log('orderDetail', result);
			this.order = result.order;
			this.station = result.store;
			this.products = result.product;
			this.grandTotal = result.grand_total;
			this.payment = result.payment;
			this.shipping = result.shipping;
		})
		.catch((err: any)=>{
			//console.log('err:', err)
			this.isLoading = false;
			this.isEmpty = true;
		})
		.finally(()=>{
			setTimeout(()=>{
				this.isLoading = false;
				// @ts-ignore
				const bgSlip = document.querySelector('.slip-wrapper');
				if(bgSlip){
					bgSlip.classList.add('animated');
				}
			}, 500)

		});
	}

	renderPrice(price: number, showSymbol: boolean = false) {
		return price? bahtFormatted(price, showSymbol): '<span class="text-danger">หมด</span>';
	}

	downloadSlip(){
		const _self = this;
		this.$confirm({
			centered: true,
			title: 'ต้องการบันทึกรูปภาพใช่หรือไม่ ?',
			okText: 'ยืนยัน',
			cancelText: 'ยกเลิก',
			onOk() {
				// @ts-ignore
				htmlToImage.toPng(document.getElementById('my-node'))
				.then(function (dataUrl: any) {
					download(dataUrl, _self.orderId+'-pttor-alcohol.png');
				});
			},
			onCancel() {
			},
			class: 'confirm-download-slip-wrapper',
		});
	}

	mounted() {

	}

	destroyed() {

	}
}

</script>

<style scoped>
.mt-n{
	margin-top: -1.3rem;
}
.bg-slip{
	background-position: top center;
	background-repeat: no-repeat;
	background-size: 94% 100%;
	/*height: 0;*/
	transition: height .5s ease;
	padding-bottom: 1em;
}
.slip-wrapper{
	transition: height 1.5s ease;
	height: 0;
}
.slip-wrapper.animated{
	height: auto;
}
.btn{
	border-radius: 20rem;
}
@media screen and (max-width: 400px){
	.text-nowrap{
		font-size: 80%;
	}
	.text-nowrap.small{
		font-size: 70%;
	}
}
</style>
