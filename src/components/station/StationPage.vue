<template>
	<div class="position-relative">

		<div v-if="!isLoading" class="station-image-wrapper position-absolute" :style="{width: minWidth}">
			<div class="text-center"><img :src="station.image" class="img-fluid" /></div>
			<div class="station-info-wrapper bg-white pt-4 position-absolute w-100">
				<b-container>
					<b-row>
						<b-col cols="9">
							<h5>{{station.store_name}}</h5>
							<p class="d-flex text-grey mb-0 text-address">
								<span class="text-primary mr-1"><SvgIcons svg="placePin" /></span>
								<span class="small font-weight-light">{{station.address}}</span>
							</p>
						</b-col>
						<b-col cols="3" class="text-right">
							<a v-if="station.phone_no" :href="`tel:${station.phone_no}`" target="_self" class="display-4">
								<SvgIcons svg="phoneCircle" />
							</a>
						</b-col>
					</b-row>
					<hr />
				</b-container>

				<b-container class="mb-3">
					<h5 class="mb-1">สินค้า</h5>
					<!-- <p class="text-grey">รอบเติมสินค้าใหม่ {{station.next_stock_updated}}</p> -->
					<div v-if="stockList && stockList.length">
						<div v-for="product in stockList" :key="product.id" class="mb-4">
							<div class="d-flex align-items-start border border-light py-2 rounded box-shadow position-relative">
								<div class="col-3 pl-2 pr-2">
									<img class="img-fluid rounded-lg" :src="product.image" />
								</div>
								<div class="col-9 pl-2">
									<p class="font-weight-medium mb-0 mt-n1 text-truncated">{{product.title}}</p>
									<span class="text-primary" v-html="renderPrice(product.price)"></span>
									<div class="pt-1 d-flex text-grey justify-content-between">
										<div class="d-flex">
											<SvgIcons svg="busket" class="mr-1" />
											<div v-if="product.limit_qty > 0">
												<span class="small font-weight-light">ออนไลน์ x</span>
												<span v-if="product.quantity_online && product.quantity_online > 0">
													{{renderNumber(product.quantity_online)}}
												</span>
												<span v-if="!product.quantity_online || product.quantity_online <= 0" class="text-danger">
													หมด
												</span>
											</div>
											<div v-if="product.limit_qty == 0">
												<span class="small font-weight-light">คงเหลือ x</span>
												<span> {{renderNumber(product.quantity_online + product.quantity_offline)}}</span>
											</div>
										</div>
										<div class="d-flex" v-if="product.limit_qty > 0">
											<SvgIcons svg="store" class="ptt mr-1 small" />
											<div>
												<span class="small font-weight-light">หน้าร้าน x</span>
												{{renderNumber(product.quantity_offline)}}
											</div>
										</div>
									</div>
								</div>
								<router-link :to="menuURL.PRODUCT+`/${product.id}`" class="position-absolute w-100 h-100"></router-link>
							</div>
						</div>
					</div>
					<div v-if="!stockList || !stockList.length" class="mb-4">
						<a-empty description="ไม่พบข้อมูล" />
					</div>
					<hr />
				</b-container>
				<b-container class="mb-3 map-wrapper">
					<h5 class="mb-3">แผนที่เดินทาง</h5>
					<a :href="`https://maps.google.com/maps?q=${station.lat},${station.lng}`" target="_blank" class="position-relative">
						<img src="@/assets/map-bg.png" width="100%" />
						<button class="btn btn-outline-primary px-5 position-absolute">ดูแผนที่</button>
					</a>
					<hr />
				</b-container>
			</div>
		</div>

		<div v-if="isLoading" class="station-image-wrapper position-absolute py-2 pl-2 pr-2" :style="{width: minWidth}">
			<vcl-twitch class="mb-5"></vcl-twitch>
			<vcl-list class="mb-5"></vcl-list>
			<vcl-code></vcl-code>
		</div>

		<b-container class="px-0">
			<b-row align-v="center" class="mb-3">
				<b-col>
					<b-button variant="link" @click="handleBackState()" class="text-dark-grey">
						<SvgIcons svg="leftArrow" />
					</b-button>
				</b-col>
				<b-col cols="4" class="text-right">
					<b-button variant="link" class="px-0 pb-0" @click="$router.push({path: menuURL.CART})">
						<a-badge :count="totalCartAmount" :numberStyle="{backgroundColor: 'rgb(54, 180, 1)', boxShadow: 'unset', top: '10px', right: '10px'}" title="total product in cart">
							<SvgIcons svg="cart" />
						</a-badge>
					</b-button>
				</b-col>
			</b-row>
		</b-container>
		<div v-if="!isLoading" class="px-2 py-3 bg-white border-top w-100 position-fixed d-none" style="bottom: 0;left:0;">
			<div class="container">
				<div class="row">
					<div class="offset-lg-3 col-lg-6 px-2">
						<div class="d-flex justify-content-end">
							<b-button variant="primary" @click="onClickChooseStation" >
								<div class="d-flex align-items-center">
									<span style="font-size: 1.2rem;"><SvgIcons svg="placePin" class="mr-2" /></span>
									<span class="">เลือกสถานที่</span>
								</div>
							</b-button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { bahtFormatted } from '../../_helpers/index';
import { stationService } from '../../_services/station.service'
import SvgIcons from '../icon/SVGIcons.vue';
// @ts-ignore
import { VclTwitch, VclList, VclCode } from 'vue-content-loading';
import { IUser, ICart, IProduct, EMenuURL } from '../../_types';
import { namespace } from 'vuex-class'
const userModule = namespace('User')
@Component({
	components: {
		SvgIcons,
		VclTwitch,
		VclList,
		VclCode
	},
})
export default class StationPage extends Vue {
	@userModule.State
	public user!: IUser;

	@userModule.State
	public status!: {loggedIn: boolean};

	@userModule.Action
	public updateCart!: (stationWithAmount: string) => void;

	@userModule.State
	public selectedStationState!: {stationId: string, provinceId: string, districtId: string};

	@userModule.Action
	public setStation!: (obj: string) => void;

	private stationId: string = '';
	private station: any = null;
	private stockList: null|any[] = null;
	private minWidth: string = '107%';
	private isLoading: boolean = true;

	private menuURL = EMenuURL;

	created() {
		window.addEventListener("resize", this.onResize);
		const body = document.getElementsByTagName('body')[0];
        // @ts-ignore
        body.classList.add('station');
		this.stationId = this.$route.params.stationId;
		if(!this.station){
			this.fetchStation();
		}


	}

	mounted() {
		//const app = document.getElementById('app');
		//app!.style.marginBottom = '0';
	}

	fetchStation() {
		this.isLoading = true
		stationService.get(this.stationId)
		.then((result: any)=>{
			setTimeout(()=>{
				this.station = result.store;
				this.stockList = result.stock;
				setTimeout(()=>{
					window.dispatchEvent(new Event('resize'));
					this.isLoading = false
				}, 1000)
			}, 500)
		})
	}

	onResize(e: any) {
		this.minWidth = e.target.outerWidth + 'px';
	}

	renderPrice(price: string) {
		return bahtFormatted(+price);
	}

	renderNumber(num: string) {
		return new Intl.NumberFormat().format(+num)
	}

	onClickChooseStation() {
		const tmp = this.selectedStationState;
		tmp.stationId = this.stationId;
		this.setStation(JSON.stringify(tmp));

		if(this.status.loggedIn){
			this.$router.push({name:'confirmationPage', params: {stationId: this.stationId}})
		}else{
			this.$router.push({path: this.menuURL.REGISTER, query: {redirect: 'confirmationPage', stationId: this.stationId}})
		}
	}

	handleBackState(){
		window.history.back();
	}


	get totalCartAmount() {
		return this.user.totalCartAmount;
	}

	destroyed() {
		window.removeEventListener("resize", this.onResize);
		const body = document.getElementsByTagName('body')[0];
        // @ts-ignore
        body.classList.remove('station');
	}
}

</script>

<style scoped>
.station-image-wrapper{
	top: -0.45rem;
	left: -15px;
}
.station-info-wrapper{
	margin-top: -15px;
	border-top: 1px solid white;
	border-top-right-radius: 20px;
	border-top-left-radius: 20px;
	padding-bottom: 80px;
}
.text-address .small, .ptt.small{
	font-size: 90%;
}
.display-4{
	line-height: 0
}
.map-wrapper .btn.position-absolute{
	top: 50%;
	left: 50%;
	transform: translate(-50%, -40%);
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
	.station-image-wrapper{
		width: calc(100% + 30px) !important;
	}
	.text-truncate{
		max-width: unset;
	}
}

</style>
