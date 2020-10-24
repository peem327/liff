<template>
	<div class="about-page-wrapper position-relative mt-n2 mx-n3">
		<b-container class="pt-3 px-4">
			<b-button variant="link" @click="$router.go(-1)" class="text-dark-grey mb-4">
				<SvgIcons svg="leftArrow" />
			</b-button>
			<p class="text-center mb-5">
				<img v-if="store.logo" :src="store.logo" style="max-width: 50%;" />
			</p>

			<div class="font-weight-light px-1 content">
				<p class="text-center" style="white-space: pre-wrap;">{{aboutContent}}</p>
				<div v-if="storePhone || storeAddress" class="text-center">
					<p class="text-center mb-1">ทั้งนี้สามารถสอบถามรายละเอียดเพิ่มเติมได้ที่</p>
					<p v-if="storeAddress" class="">
						{{storeAddress}}
					</p>
					<p v-if="storePhone">
						<a :href="`tel:${storePhone}`">{{storePhone}}</a><br />
						<a :href="`tel:${storePhone}`" target="_self" class="display-4">
							<SvgIcons svg="phoneCircle" style="line-height: 1;"/>
						</a>
					</p>
					<p class="text-center mb-1">

					</p>
				</div>
			</div>
		</b-container>
		<!-- <div class="footer text-white position-absolute w-100 px-3" :style="{ backgroundImage: 'url(' + require('@/assets/about-footer-bg.jpg') + ')' }"> -->
		<div class="footer text-whites position-absolute w-100 px-3">
			<p class="mb-0 text-center font-weight-light small">

				<!-- บริษัท ปตท. น้ำมันและการค้าปลีก จำกัด (มหาชน)<br />
				555/2 ศูนย์เอนเนอร์ยี่คอมเพล็กซ์ อาคาร บี ชั้นที่ 12 ถนนวิภาวดีรังสิต<br />
				แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900 -->
			</p>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { stationService, masterService } from '../_services'
import { EMenuURL } from '../_types';
import SvgIcons from './icon/SVGIcons.vue';
import { namespace } from 'vuex-class';
const storeModule = namespace('Store');

@Component({
	components: {
		SvgIcons
	}
})
export default class AboutPage extends Vue {
	@storeModule.State
    public store!: {id:string;logo: string};

	private menuURL = EMenuURL;

	aboutContent = '';
	storePhone = '';
	storeAddress = '';

	created() {
		const body = document.getElementsByTagName('body')[0];
		// @ts-ignore
		body.classList.add('about');
		if(this.store && this.store.id){
			this.getStationInfo();
		}else{
			masterService.getAboutContent()
			.then((result: any)=>{
				this.aboutContent = result.about;
				this.storePhone = result.telephone;
				this.storeAddress = result.address;
			})
		}
	}

	mounted() {
		const body = document.getElementsByTagName('body')[0];
		// @ts-ignore
		body.classList.add('about');
	}

	destroyed() {
		const body = document.getElementsByTagName('body')[0];
		// @ts-ignore
		body.classList.remove('about');
	}

	getStationInfo() {
		stationService.get(`${this.store.id}`)
		.then((result: any)=>{

			this.aboutContent = result.store.about;
			this.storePhone = result.store.phone_no;
		})
	}

}

</script>

<style scoped>
.about-page-wrapper{
	background-size: cover;
	background-position: center -10px;
	background-repeat: no-repeat;
	//min-height: 100vh;
}
.text-indent{
	text-indent: 35px;
	/*text-align: justify;*/
}
.content{
	/*min-height: 500px;*/
	/*padding-bottom: 8.5rem;*/
}
.footer{
	bottom: -6rem;
	left: 0;
	/*background-color: #1B1464;*/
	background-color: transparent;
	padding-bottom: 30px;
	padding-top: 35%;
	background-position: center bottom;
	background-repeat: no-repeat;
	background-size: 100% 100%;
}
@media (max-width: 375px){
	.footer{
		bottom: -15rem;
		padding-bottom: 20px;
	}
}
@media (min-width: 768px){
	.footer{
		bottom: -2px;
	}
}

/*@media screen and (max-width: 992px) and (max-height: 700px){
	.about-page-wrapper{
		background-position: center -36em;
	}
}
@media screen and (max-width: 375px) and (max-height: 700px){
	.about-page-wrapper{
		background-position: center bottom;
	}
}*/
</style>
