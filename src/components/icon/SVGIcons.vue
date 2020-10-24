<template>
	<!-- <div :is="template"><slot></slot></div> -->
	<span :class="display? display: `d-block`" v-html="svgTag"></span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

const svgList: any = {
	"receipt": '<svg width="1em" height="1em" viewBox="0 0 18 20"><path d="M18,17H6V15H18Zm0-4H6V11H18Zm0-4H6V7H18ZM3,22l1.5-1.5L6,22l1.5-1.5L9,22l1.5-1.5L12,22l1.5-1.5L15,22l1.5-1.5L18,22l1.5-1.5L21,22V2L19.5,3.5,18,2,16.5,3.5,15,2,13.5,3.5,12,2,10.5,3.5,9,2,7.5,3.5,6,2,4.5,3.5,3,2Z" transform="translate(-3 -2)" fill="currentColor"/></svg>',
	"heart": '<svg width="1em" height="1em" fill="currentColor" viewBox="0 0 1024 1024">\
	<path d="M923 283.6c-13.4-31.1-32.6-58.9-56.9-82.8-24.3-23.8-52.5-42.4-84-55.5-32.5-13.5-66.9-20.3-102.4-20.3-49.3 0-97.4 13.5-139.2 39-10 6.1-19.5 12.8-28.5 20.1-9-7.3-18.5-14-28.5-20.1-41.8-25.5-89.9-39-139.2-39-35.5 0-69.9 6.8-102.4 20.3-31.4 13-59.7 31.7-84 55.5-24.4 23.9-43.5 51.7-56.9 82.8-13.9 32.3-21 66.6-21 101.9 0 33.3 6.8 68 20.3 103.3 11.3 29.5 27.5 60.1 48.2 91 32.8 48.9 77.9 99.9 133.9 151.6 92.8 85.7 184.7 144.9 188.6 147.3l23.7 15.2c10.5 6.7 24 6.7 34.5 0l23.7-15.2c3.9-2.5 95.7-61.6 188.6-147.3 56-51.7 101.1-102.7 133.9-151.6 20.7-30.9 37-61.5 48.2-91 13.5-35.3 20.3-70 20.3-103.3 0.1-35.3-7-69.6-20.9-101.9z" />\
	</svg>',
	"product": '<svg width="1em" height="1em" viewBox="0 0 18 21"><path d="M19,6H17A5,5,0,0,0,7,6H5A2,2,0,0,0,3.01,8L3,20a2.006,2.006,0,0,0,2,2H19a2.006,2.006,0,0,0,2-2V8A2.006,2.006,0,0,0,19,6ZM12,3a3,3,0,0,1,3,3H9A3,3,0,0,1,12,3Zm0,10A5,5,0,0,1,7,8H9a3,3,0,0,0,6,0h2A5,5,0,0,1,12,13Z" transform="translate(-3 -1)" fill="currentColor"/></svg>',
	"station": '<svg width="1em" height="1em" viewBox="0 0 16.5 18"><path d="M19.77,7.23l.01-.01L16.06,3.5,15,4.56l2.11,2.11A2.5,2.5,0,0,0,18,11.5a2.556,2.556,0,0,0,1-.21V18.5a1,1,0,0,1-2,0V14a2.006,2.006,0,0,0-2-2H14V5a2.006,2.006,0,0,0-2-2H6A2.006,2.006,0,0,0,4,5V21H14V13.5h1.5v5a2.5,2.5,0,0,0,5,0V9A2.5,2.5,0,0,0,19.77,7.23ZM12,10H6V5h6Zm6,0a1,1,0,1,1,1-1A1,1,0,0,1,18,10Z" transform="translate(-4 -3)" fill="currentColor" /></svg>',
	"account": '<svg width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor"><path id="account" d="M974-65.625A2.625,2.625,0,0,1,976.625-63,2.625,2.625,0,0,1,974-60.375,2.625,2.625,0,0,1,971.375-63,2.625,2.625,0,0,1,974-65.625Zm0,11.25c3.713,0,7.625,1.825,7.625,2.625v1.375h-15.25V-51.75C966.375-52.55,970.287-54.375,974-54.375ZM974-68a5,5,0,0,0-5,5,5,5,0,0,0,5,5,5,5,0,0,0,5-5A5,5,0,0,0,974-68Zm0,11.25c-3.337,0-10,1.675-10,5V-48h20v-3.75C984-55.075,977.338-56.75,974-56.75Z" transform="translate(-964 68)" /></svg>',
	"cart": '<svg width="58" height="58" viewBox="0 0 58 58"><defs><filter id="a" x="0" y="0" width="58" height="58" filterUnits="userSpaceOnUse"><feOffset dy="3" input="SourceAlpha"/><feGaussianBlur stdDeviation="3" result="b"/><feFlood flood-opacity="0.161"/><feComposite operator="in" in2="b"/><feComposite in="SourceGraphic"/></filter></defs><g transform="translate(-308 -11)"><g transform="matrix(1, 0, 0, 1, 308, 11)" filter="url(#a)"><circle cx="20" cy="20" r="20" transform="translate(9 6)" fill="#fff"/></g><path d="M17.21,9,12.83,2.44A.993.993,0,0,0,12,2.02a.977.977,0,0,0-.83.43L6.79,9H2a1,1,0,0,0-1,1,.842.842,0,0,0,.04.27l2.54,9.27A1.989,1.989,0,0,0,5.5,21h13a2.01,2.01,0,0,0,1.93-1.46l2.54-9.27L23,10a1,1,0,0,0-1-1ZM9,9l3-4.4L15,9Zm3,8a2,2,0,1,1,2-2A2.006,2.006,0,0,1,12,17Z" transform="translate(325 24.98)" fill="#7b7b7b"/></g></svg>',
	"leftArrow": '<svg width="1em" height="1em" viewBox="0 0 16 16"><path d="M20,11H7.83l5.59-5.59L12,4,4,12l8,8,1.41-1.41L7.83,13H20Z" transform="translate(-4 -4)" fill="currentColor"/></svg>',
	"busket": '<svg width="1em" height="1em" viewBox="0 0 22 18.98"><path d="M17.21,9,12.83,2.44A.993.993,0,0,0,12,2.02a.977.977,0,0,0-.83.43L6.79,9H2a1,1,0,0,0-1,1,.842.842,0,0,0,.04.27l2.54,9.27A1.989,1.989,0,0,0,5.5,21h13a2.01,2.01,0,0,0,1.93-1.46l2.54-9.27L23,10a1,1,0,0,0-1-1ZM9,9l3-4.4L15,9Zm3,8a2,2,0,1,1,2-2A2.006,2.006,0,0,1,12,17Z" transform="translate(-1 -4)" fill="currentColor"/></svg>',
	"placePin": '<svg width="1em" height="1em" viewBox="0 0 8.619 12.313"><path d="M9.309,2A4.306,4.306,0,0,0,5,6.309c0,3.232,4.309,8,4.309,8s4.309-4.771,4.309-8A4.306,4.306,0,0,0,9.309,2Zm0,5.848a1.539,1.539,0,1,1,1.539-1.539A1.54,1.54,0,0,1,9.309,7.848Z" transform="translate(-5 -2)" fill="currentColor"/></svg>',
	"phoneCircle": '<svg width="1em" height="1em" viewBox="0 0 42 42"><g transform="translate(0 0)" fill="#fff" stroke="currentColor" stroke-width="1"><ellipse cx="21" cy="21" rx="21" ry="21" stroke="none"/><ellipse cx="21" cy="21" rx="20.5" ry="20.5" fill="none"/></g><path d="M6.664,10.884a15.331,15.331,0,0,0,6.669,6.669l2.227-2.227a1.006,1.006,0,0,1,1.032-.243,11.544,11.544,0,0,0,3.613.577,1.015,1.015,0,0,1,1.012,1.012V20.2A1.015,1.015,0,0,1,20.2,21.217,17.2,17.2,0,0,1,3,4.012,1.015,1.015,0,0,1,4.012,3H7.554A1.015,1.015,0,0,1,8.566,4.012a11.5,11.5,0,0,0,.577,3.613A1.016,1.016,0,0,1,8.89,8.657Z" transform="translate(9.55 9.145)" fill="currentColor"/></svg>',
	"bin": '<svg width="1em" height="1em" viewBox="0 0 14 18"><path d="M6,19a2.006,2.006,0,0,0,2,2h8a2.006,2.006,0,0,0,2-2V7H6ZM19,4H15.5l-1-1h-5l-1,1H5V6H19Z" transform="translate(-5 -3)" fill="currentColor"/></svg>',
	"phone": '<svg width="1em" height="1em" viewBox="0 0 9 9"><path d="M4.81,6.895A7.574,7.574,0,0,0,8.1,10.19l1.1-1.1a.5.5,0,0,1,.51-.12,5.7,5.7,0,0,0,1.785.285.5.5,0,0,1,.5.5V11.5a.5.5,0,0,1-.5.5A8.5,8.5,0,0,1,3,3.5.5.5,0,0,1,3.5,3H5.25a.5.5,0,0,1,.5.5,5.68,5.68,0,0,0,.285,1.785.5.5,0,0,1-.125.51Z" transform="translate(-3 -3)" fill="currentColor"/></svg>',
	"calendar": '<svg width="1em" height="1em" viewBox="0 0 19.286 19.286"><g transform="translate(63.99 -147.16)"><path d="M-49.526,147.16v3.616h1.205V147.16Zm-10.848,0v3.616h1.205V147.16Zm14.464,6.027V165.24H-62.785V153.187Zm-1.217,13.259a2.423,2.423,0,0,0,2.423-2.423V150.788a2.423,2.423,0,0,0-2.423-2.423h.012v1.808a1.806,1.806,0,0,1-1.808,1.808,1.806,1.806,0,0,1-1.808-1.808v-1.808h-7.232v1.808a1.806,1.806,0,0,1-1.808,1.808,1.806,1.806,0,0,1-1.808-1.808v-1.808h.012a2.423,2.423,0,0,0-2.423,2.423v13.223a2.433,2.433,0,0,0,2.423,2.435Z" transform="translate(0)" fill="currentColor" fill-rule="evenodd"/><rect width="3.659" height="3.659" transform="translate(-60.988 155.118)" fill="currentColor"/><rect width="3.659" height="3.659" transform="translate(-56.079 155.118)" fill="currentColor"/><rect width="3.659" height="3.659" transform="translate(-51.366 155.118)" fill="currentColor"/><rect width="3.659" height="3.659" transform="translate(-60.988 160.036)" fill="currentColor"/><rect width="3.659" height="3.659" transform="translate(-56.079 160.036)" fill="currentColor"/><rect width="3.659" height="3.659" transform="translate(-51.366 160.036)" fill="currentColor"/></g></svg>',
	"info": '<svg width="1em" height="1em" viewBox="0 0 19.999 19.999"><path d="M11,17h2V11H11ZM12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8.01,8.01,0,0,1,12,20ZM11,9h2V7H11Z" transform="translate(-2 -2)" fill="currentColor"/></svg>',
	"store": `<svg version="1.1" id="Layer_1" xmlns:xlink="http://www.w3.org/1999/xlink" width="1em" height="1em"
	viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g><g>
	<path d="M419.334,0H92.666l-74.8,117.042v58.73c0,26.924,14.854,50.432,36.788,62.799V512h404.92V237.278
	c20.709-12.672,34.56-35.501,34.56-61.506v-58.73L419.334,0z M110.953,33.391h290.091l45.909,71.835H65.045L110.953,33.391z
	M294.925,478.609h-89.657V325.357h89.657V478.609z M328.316,478.609V291.966H171.877v186.643H88.045V247.78
	c0.625,0.016,1.247,0.048,1.877,0.048c22.225,0,42.132-10.113,55.359-25.982c13.227,15.868,33.134,25.982,55.359,25.982
	s42.132-10.113,55.359-25.982c13.229,15.868,33.135,25.982,55.359,25.982c22.224,0,42.132-10.113,55.359-25.982
	c13.229,15.868,33.135,25.982,55.359,25.982c1.378,0,2.745-0.048,4.104-0.125v230.905H328.316z M460.743,175.772
	c-0.001,21.319-17.346,38.664-38.664,38.664c-21.319,0-38.664-17.345-38.664-38.664h-33.391c0,21.319-17.345,38.664-38.664,38.664
	c-21.319,0-38.665-17.345-38.665-38.664h-33.391c0,21.319-17.345,38.664-38.664,38.664s-38.664-17.345-38.664-38.664h-33.391
	c0,21.319-17.345,38.664-38.664,38.664s-38.664-17.345-38.664-38.664v-37.155h409.485V175.772z" fill="currentColor"/>
	</g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>`,
	"store_ic": `<svg width="1em" height="1em" viewBox="0 0 15 13.333"><path d="M17.167,4H3.833V5.667H17.167ZM18,12.333V10.667L17.167,6.5H3.833L3,10.667v1.667h.833v5h8.333v-5H15.5v5h1.667v-5Zm-7.5,3.333h-5V12.333h5Z" transform="translate(-3 -4)" fill="currentColor"/></svg>`,
	"walking": `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 11.488 19"><path d="M12.628,5.035A1.767,1.767,0,1,0,10.86,3.267,1.773,1.773,0,0,0,12.628,5.035Zm-3.27,3L6.884,20.5H8.74l1.591-7.07L12.186,15.2v5.3h1.767V13.872L12.1,12.1l.53-2.651a6.471,6.471,0,0,0,4.86,2.209V9.9a4.347,4.347,0,0,1-3.8-2.121L12.8,6.36a1.823,1.823,0,0,0-1.5-.884c-.265,0-.442.088-.707.088L6,7.509v4.153H7.767v-3L9.358,8.04" transform="translate(-6 -1.5)" fill="currentColor"/></svg>`,
}

@Component
export default class SVGIcons extends Vue {
	@Prop({required: true}) svg!: string
	@Prop({required: false}) display!: string

	svgTag = '';

	mounted() {
		//do something
		this.svgTag = svgList[this.svg]
	}
	beforeUpdate() {
		// do something
	}
	getTemplate() {
		if(!(this.svg in svgList)) return '';
		return svgList[this.svg] as string;
	}

	get template() {
		return Vue.component(this.svg, {
			template: svgList[this.svg] as string
		})
	}
}

</script>
