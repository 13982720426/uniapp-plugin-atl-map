<template>
	<view class="">
		<view class="">地址：{{ title }}</view>
		<view class="">详细地址：{{ address }}</view>
		<view class="" style="width: 90vw; margin: 5vw">
			<button @click="onClick">点击打开地图</button>
		</view>
		<atl-map :disable="disable" v-if="show" :longitude="longitude" :latitude="latitude" :marker="marker" :mapKey="mapKey" :mapType="mapType" @confirm="confirm"></atl-map>
	</view>
</template>

<script>
	
export default {
	data() {
		return {
			disable: false,
			show: false,
			title: '',
			address: '',
			longitude: '',
			latitude: '',
			marker: {
				id: 1,
				height: 50,
				width: 40
				// iconPath: '/static/comm/position.png'
			},
			// mapKey: '42795f9a59358dxxxxxxxxx',//高德地图测试key 申请地址 https://console.amap.com/dev/key/app 服务平台选择微信小程序
			// mapType: 'amap'
			mapType: 'tmap',
			mapKey: 'ZNJBZ-E6RHJ-EV3F2-DL73K-ARTTH-3EBRZ' //腾讯地图测试key 限量测试 申请地址 https://lbs.qq.com/dev/console/application/mine  启用产品选择微信小程序
		};
	},
	onLoad() {},
	methods: {
		onClick() {
			this.show = true;
		},
		confirm(e) {
			console.log(22, e);
			if (e) {
				this.longitude = e.longitude;
				this.latitude = e.latitude;
				this.title = e.title;
				this.address = e.address;
			}
			this.show = false;
		}
	}
};
</script>

<style></style>
