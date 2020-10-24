<template> 
    <div class="input-group">
        <div class="input-group-prepend">
            <button @click="numberModel == 0 ? numberModel=1 : numberModel--" class="btn btn-outline font-weight-light" type="button" id="button-addon1" :disabled="isDisabled || numberModel <= 1">-</button>
        </div>
        <input v-model="numberModel" type="number" class="form-control text-primary" placeholder="" aria-label="button addon" aria-describedby="button-addon1" :disabled="isDisabled">
        <div class="input-group-append">
            <button @click="numberModel == limit? numberModel = limit: numberModel++" class="btn btn-outline font-weight-light" type="button" id="button-addon2" :disabled="isDisabled || numberModel == limit">+</button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch, Prop } from 'vue-property-decorator';

@Component
export default class NumberInput extends Vue {
    // @ts-ignore
    @Prop({required: false, type: String}) readonly id: string;
    // @ts-ignore
    @Prop({required: false, type: Number}) readonly current: number;
    // @ts-ignore
    @Prop({required: false, type: Number}) readonly limit: number;
    // @ts-ignore
    @Prop({required: false, type: Boolean}) readonly disabled: boolean;

    private isDisabled: boolean = false;
    private numberModel = 1;

    created() {
        if(typeof this.current !== 'undefined'){
            this.numberModel = this.current;
        }
        if(typeof this.disabled !== 'undefined'){
            this.isDisabled = this.disabled;
        }
    }

    mounted() {
    }

    @Emit()
    change() {
        return this.id? {id: this.id, amount: this.numberModel} : this.numberModel;
    }

    @Watch('numberModel')
    inputChanged(newVal: string) {
        if (Number(newVal) > this.limit && this.limit > 0) {
            this.numberModel = this.limit
        }else{
            if(Number(newVal) <= 0) newVal = '1';
            this.numberModel = +newVal;    
        }
        this.change();
    }

    @Watch('current')
    handleCurrent(newVal: any){
        this.numberModel = +newVal
    }
    
}

</script>

<style scoped>
.input-group .form-control{
    max-width: 40px;
    line-height: 0;
    padding: 0 0.4rem;
    text-align: center;
    height: calc(1.5em + 0.5rem);
}
.input-group > .input-group-prepend > .btn, .input-group > .input-group-append > .btn{
    border: 1px solid #E3E3E3;
    border-radius: unset;
    color: #707070;
    font-size: 25px;
    line-height: 0;
    padding: 0 0.75rem;
}
@media(max-width: 370px) {
    .input-group > .input-group-prepend > .btn, .input-group > .input-group-append > .btn{
        padding: 0 0.55rem;
    }
}
.input-group > .form-control:disabled,
.input-group > .input-group-prepend > .btn.disabled,
.input-group > .input-group-prepend > .btn:disabled, 
.input-group > .input-group-append > .btn.disabled,
.input-group > .input-group-append > .btn:disabled{
    color: #F8F8F8;
    opacity: 1
}
.input-group > .form-control:disabled{
    background-color: white;
    color: #D3D3D3 !important;
}
</style>
