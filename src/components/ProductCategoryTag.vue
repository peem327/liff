<template> 
    <a-tag :color="categoryColor">{{categoryName}}</a-tag>
</template>

<script lang="ts">
import { Component, Vue, Emit, Watch, Prop } from 'vue-property-decorator';

@Component
export default class ProductCategoryTag extends Vue {
    // @ts-ignore
    @Prop({required: true, type: String}) readonly categoryId: string;
    // @ts-ignore
    @Prop({required: true, type: String}) readonly categoryName: number;

    created() {

    }

    mounted() {
    }

    get categoryColor(){
        let color;
        switch (this.categoryId) {
            case "1":
                color = 'blue';
                break;
            case "2":
                color = 'orange';
                break;
            
            default:
                color = 'grey'
                break;
        }
        return color;
    }
    
}

</script>

<style scoped>

</style>
