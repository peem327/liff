<template>
	<div>
		<b-container class="pr-0 pl-1">
			<b-row align-v="center" class="mb-1">
				<b-col>
					<b-button variant="link" @click="handleBackState()" class="text-dark-grey pl-1">
						<SvgIcons svg="leftArrow" />
					</b-button>
				</b-col>
				<b-col cols="4" class="text-right">
					<b-button variant="link" class="p-0" @click="$router.push({path: menuURL.CART})">
						<a-badge :count="totalCartAmount" :numberStyle="{backgroundColor: 'rgb(54, 180, 1)', top: '10px', right: '10px'}" title="cart">
							<SvgIcons svg="cart" />
						</a-badge>
					</b-button>
				</b-col>
			</b-row>
			<TopHeading class="mb-4" title="สถานที่รับสินค้า"/>
		</b-container>
		<b-container class="px-0">
			<b-row align-v="center" class="mb-3">
				<b-col class="pr-2">
					<AddressSelector v-on:select="onProvinceSelected" :default="selectedStationState.provinceId" />
				</b-col>
				<b-col class="pl-2">
					<AddressSelector type="district" :provinceId="provinceId" :default="selectedStationState.districtId" v-on:select="onDistrictSelected" />
				</b-col>
			</b-row>
		</b-container>
		<b-container class="px-0">
			<div v-if="!isLoaded && !stationList.length">
				<div v-for="n in [1, 2, 3, 4, 5]" :key="n" class="mb-5">
					<vcl-twitch></vcl-twitch>
				</div>
			</div>
			<b-row v-if="isLoaded && !stationList.length">
				<b-col cols="12" class="mt-5">
					<a-empty />
				</b-col>
			</b-row>
			<div v-if="isLoaded && stationList.length">
				<div class="mb-3" v-for="station in stationList" :key="station.id">
					<div class="card box-shadow position-relative" style="max-width: 100%;">
						<router-link v-if="!isReservation" :to="{name: 'singleStation', params: {stationId: station.id}}">
							<img v-if="station.image" :src="station.image" class="card-img-top" :alt="`StationID-${station.id}`" />
							<img v-if="!station.image" src="@/assets/station-placeholder.jpg" class="card-img-top" :alt="`StationID-${station.id}`"/>
						</router-link>
						<div v-if="isReservation" :id="`reserve-station-${station.id}`" @click="onSelectStation(station.id)" class="image-container position-relative" >
							<img v-if="station.image" :src="station.image" class="card-img-top" :alt="`StationID-${station.id}`" />
							<img v-if="!station.image" src="@/assets/station-placeholder.jpg" class="card-img-top" :alt="`StationID-${station.id}`"/>
							<div class="btn-wrapper position-absolute text-nowrap text-center">
								<router-link class="btn" :to="menuURL.STATION+`/${station.id}`">ดูข้อมูลสถานที่</router-link>
							</div>
						</div>
						<div class="card-body pb-3">
							<div class="card-text">
								<b-row class="mb-2">
									<b-col cols="8">
										<h6 class="m-0">{{station.store_name}}</h6>
									</b-col>
									<b-col cols="4">
										<h6 class="m-0 text-right font-weight-light text-primary">{{station.distance}}</h6>
									</b-col>
								</b-row>
								<b-row align>
									<b-col cols="10">
										<p class="d-flex text-grey mb-0">
											<span class="text-primary mr-1"><SvgIcons svg="placePin" /></span>
											<span class="font-weight-light address">{{station.address}}</span>
										</p>
									</b-col>
									<b-col cols="2" class="text-right pl-0">
										<a v-if="station.phone_no" :href="`tel:${station.phone_no}`" target="_self" class="display-5">
											<SvgIcons svg="phoneCircle" style="line-height: 1;"/>
										</a>
									</b-col>
								</b-row>
							</div>
						</div>
					</div>
				</div>
				<!-- <infinite-loading @infinite="infiniteHandler">
					<div slot="no-results"></div>
					<div slot="no-more"></div>
				</infinite-loading> -->
			</div>
		</b-container>
		<div v-if="isReservation" class="px-2 py-3 bg-white border-top w-100 position-fixed" style="bottom: 0;left:0;z-index: 91;">
			<div class="container">
				<div class="row">
					<div class="offset-lg-3 col-lg-6 px-2">
						<div class="d-flex justify-content-end">
							<b-button variant="primary" @click="onClickChooseStation" :disabled="!stationSelected">
								<div class="d-flex align-items-center">
									<span class="d-flex">
										<SvgIcons svg="placePin" class="mr-2" />เลือกสถานที่
									</span>
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
import { Component, Vue, Watch } from 'vue-property-decorator';
import { stationService } from '../../_services/station.service';
import TopHeading from '../TopHeading.vue';
import SvgIcons from '../icon/SVGIcons.vue';
import AddressSelector from '../AddressSelector.vue';
import InfiniteLoading from 'vue-infinite-loading';
// @ts-ignore
import { VclTwitch } from 'vue-content-loading';
import { IUser, ICart, IProduct, EMenuURL } from '../../_types';
import { namespace } from 'vuex-class'
const userModule = namespace('User')

@Component({
	components: {
		TopHeading,
		SvgIcons,
		VclTwitch,
		AddressSelector,
		InfiniteLoading
	}
})
export default class StationsPage extends Vue {
	@userModule.State
	public user!: IUser;

	@userModule.State
	public status!: {loggedIn: boolean};

	@userModule.Action
	public setProfile!: (redirect?: any)=>void;

	@userModule.Action
	public updateCart!: (productWithAmount: string) => void;

	@userModule.State
	public selectedStationState!: {stationId: string, provinceId: string, districtId: string};

	@userModule.Action
	public setStation!: (obj: string) => void;

	private errorStr: string = '';
	private gettingLocation: boolean = false;
	private location: any = null;

	private stationList: any[] = [];
	private currentPage: number = 1;
	private isLoaded: boolean = false;

	private provinceId: string = '';
	private districtId: string = '';

	private menuURL = EMenuURL;

	private isReservation = false;
	private stationSelected = '';
	private timeOut: any|null = null;

	created() {
		if(this.status.loggedIn){
			this.setProfile();
		}
		if(this.$route.path === this.menuURL.STATIONS_RESERVATION){
			this.isReservation = true
		}
		this.getLocation();
	}

	mounted(){
		//this.getLocation();
		//console.log('selectedStationState', this.selectedStationState);
	}

	getLocation() {
		//do we support geolocation
		if(!("geolocation" in navigator)) {
			this.errorStr = 'Geolocation is not available.';
			this.provinceId = this.selectedStationState&&this.selectedStationState.provinceId ? this.selectedStationState.provinceId: '1';
			this.districtId = this.selectedStationState&&this.selectedStationState.districtId ? this.selectedStationState.districtId: '';
			return;
		}
		if(this.selectedStationState.stationId) {
			this.stationSelected = this.selectedStationState.stationId;
		}
		if(this.selectedStationState.provinceId && this.selectedStationState.districtId){
			this.provinceId = this.selectedStationState.provinceId;
			this.districtId = this.selectedStationState.districtId;
			return;
		}

		this.gettingLocation = true;
		// get position
		const options = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0
		};
		navigator.geolocation.getCurrentPosition(pos => {
			this.gettingLocation = false;
			this.location = pos;

			if(this.stationList.length){
				this.stationList = []
			}
			this.fetchStations("location");
		}, err => {
			console.log('Info. after get location', err);
			this.gettingLocation = false;
			this.errorStr = err.message;
			if(this.stationList.length){
				this.stationList = []
			}
			this.fetchStations("address");
		}, options);
	}

	get totalCartAmount() {
		return this.user.totalCartAmount;
	}

	fetchStations(type: "location"|"address", $state?: any) {
		let queryParams: any = {page: this.currentPage, limit: 5};
		if(this.user.cart && this.user.cart.length){
			queryParams['pid'] = this.user.cart.map(cart=>cart.productId).join(',')
		}
		switch (type) {
			case "location":
				if(this.location){
					const {latitude, longitude} = this.location.coords;
					queryParams = {...queryParams,
						lat: latitude,//Number(latitude).toFixed(8),
						lng: longitude//Number(longitude).toFixed(8)
					}
				}
				break;
			case "address":
				queryParams = {...queryParams,
					province_id: this.provinceId || '1',
					//district_id: this.districtId || '1'
				}
				if(this.districtId){
					queryParams['district_id'] = this.districtId;
				}else{
					delete queryParams['district_id'];
				}
				break;
			default:
				break;
		}
		//console.log('cartParam', queryParams);
		//this.stationList = null;
		if(this.timeOut) clearTimeout(this.timeOut);
		stationService.getList(queryParams)
		.then((result: any)=>{
			if(!result.length && $state){
				$state.complete();
				return;
			}
			this.timeOut = setTimeout(()=>{
				this.stationList = [...this.stationList, ...result];
				this.isLoaded = true;
				if($state){
					$state.loaded();
				}
				if(this.isReservation && this.selectedStationState.stationId){
					const station = this.stationList.find((ele:any)=>ele.id==this.selectedStationState.stationId);
					if(station){
						setTimeout(()=>{
							this.onSelectStation(station.id);
						}, 10)
					}
				}
			}, 10)
		})
	}

	@Watch('provinceId')
	selectedChanged(newVal: any) {
		//console.log('change provinceId', newVal, this.provinceId)
	}

	onProvinceSelected(selected: any) {
		this.provinceId = selected;
		this.currentPage = 1;
		if(selected === this.selectedStationState.provinceId){
			this.districtId = this.selectedStationState.districtId;
		}else{
			this.districtId = '';
		}
		this.setSelectedStationState(true);
		this.stationList = [];
		this.fetchStations('address');
	}

	onDistrictSelected(selected: string) {
		//console.log('district', selected);
		if(!(+selected)) return;
		this.districtId = selected;
		this.stationList = [];
		this.isLoaded = false;
		this.currentPage = 1;
		this.setSelectedStationState();
		this.fetchStations('address');
	}

	onSelectStation(stationId: string) {
		this.stationSelected = stationId;
		document.querySelectorAll('[id^="reserve-station"]').forEach((ele: Element)=>{
			// @ts-ignore
			ele.parentNode.classList.remove('selected');
		});
		const selected = document.getElementById('reserve-station-'+stationId);
		if(selected){
			// @ts-ignore
			selected.parentElement.classList.add('selected');
		}
	}

	onClickChooseStation() {
		this.setSelectedStationState();
		if(this.status.loggedIn){
			this.$router.push({name:'confirmationPage', params: {stationId: this.stationSelected}})
		}else{
			this.$router.push({path: this.menuURL.REGISTER, query: {redirect: 'confirmationPage', stationId: this.stationSelected}})
		}
	}

	infiniteHandler($state: any){
		const type = !this.districtId && this.location? 'location': 'address';
		this.currentPage++
		this.fetchStations(type, $state);
	}

	setSelectedStationState(forceDistrict?: boolean){
		const tmp = this.selectedStationState;
		//console.log(tmp);
		let districtId = this.districtId;
		if(forceDistrict){
			districtId = '';
		}
		tmp.stationId = this.stationSelected;
		tmp.provinceId = this.provinceId || tmp.provinceId;
		tmp.districtId = districtId;
		this.setStation(JSON.stringify(tmp));
	}

	handleBackState(){
		window.history.back();
	}

	destroyed() {
		this.stationList = [];
		clearTimeout(this.timeOut);
	}


}
</script>
<style scoped>
.card{
	border-radius: 0.5rem;
}
.card-body{
	padding-right: 0.7rem;
	padding-left: 0.7rem;
}
.card-img-top{
	border-top-left-radius: calc(0.5rem - 1px);
	border-top-right-radius: calc(0.5rem - 1px);
}
.address{
	font-size: 90%;
}
.display-5{
	font-size: 2.5rem;
}

.card.selected{
	border: 3px solid #00AEEF;
}

.image-container .btn-wrapper{
	top: 50%;
	left: -1000px;
	right: 0;
	width: 0;
	opacity: 0;
	transform: translateY(-50%);
	transition: all 0.5s;
	padding-top: 0.5em;
	padding-bottom: 0.5em;
	padding-left: 2em;
	padding-right: 2em;
}
.image-container .btn-wrapper .btn{
	color: #FFF;
}
.image-container:hover .btn-wrapper {
	border-radius: 2em;
	color: #FFF;
	left: 0;
	background-color: rgba(42, 42, 42, 0.9);
	z-index: 90;
	width: 173px;
	margin: 0 auto;
	opacity: 1;
}

@media(max-width: 400px){
	.card-img-top{
		height: 200px;
	}
	.image-container .btn-wrapper{
		padding-left: 1em;
		padding-right: 1em;
	}
	.image-container:hover .btn-wrapper{
		width: 150px;
	}
}
</style>
