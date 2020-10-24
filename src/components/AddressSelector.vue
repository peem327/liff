<template>
	<b-form-select
	v-model="selectModel"
	:options="options"
	class="mb-3 pl-3 box-shadow"
	value-field="item"
	text-field="name"
	disabled-field="notEnabled" :disabled="isDisabled" />
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch, Prop } from 'vue-property-decorator';
import { masterService } from '../_services';

@Component
export default class AddressSelector extends Vue {
	// @ts-ignore
	@Prop({default: 'province'}) readonly type: string;
	// @ts-ignore
	@Prop({required: false, type: String}) readonly provinceId: string;
	// @ts-ignore
	@Prop({required: false, type: String}) readonly default: string;

	private isDisabled: boolean = true;
	private selectModel = '0';
	private options = [
		{ item: '0', name: this.type==='province'? 'เลือกจังหวัด': 'เลือกอำเภอ' }
	];

	created() {
		switch (this.type) {
			case "province":
				masterService.getProvice()
				.then((result: any)=>{
					let tmp = result.map((ele: any)=>{
						return {item: ele.province_id, name: ele.province_name}
					});
					this.options = [...this.options, ...tmp];
					this.isDisabled = false;
					if(this.default){
						this.selectModel = this.default;
					}
				})
				break;
			case "district":
				this.isDisabled = true;
				if(!this.provinceId) {
					return;
				}
				this.getDistrict(this.provinceId);
				break;
			default:
				break;
		}
	}

	@Emit()
	select() {
		return this.selectModel;
	}

	@Watch('selectModel')
	selectedChanged(newVal: any) {
		this.select();
	}

	@Watch('provinceId')
	provinceIdChanged(newVal: any) {
		this.getDistrict(newVal);
	}

	getDistrict(provinceId: string) {
		this.isDisabled = true;
		this.selectModel = '0';
		this.options = [{ item: '0', name: 'เลือกอำเภอ' }];
		if(!(+provinceId)){
			return;
		}
		masterService.getDistrict(provinceId)
		.then((result: any)=>{
			let tmp = result.map((ele: any)=>{
				return {item: ele.district_id, name: ele.district_name}
			});
			this.options = [{ item: '0', name: 'เลือกอำเภอ' }, ...tmp];
			this.isDisabled = false;
			this.selectModel = this.options[0].item;
			if(this.default){
				this.selectModel = this.default;
			}
		})
	}
}

</script>

<style scoped>
.custom-select{
	border-radius: 1.5rem;
}
</style>
