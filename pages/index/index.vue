<template>
	<view class="">
		<view style="padding:20px">
			<view class="">地址：{{ title }}</view>
			<view class="">详细地址：{{ address }}</view>
			<view class="">经度：{{ longitude }}</view>
			<view class="">纬度：{{ latitude }}</view>
		</view>
		<view style="width: 90vw; margin: 5vw">
			<button @click="onClick">点击打开地图</button>
		</view>
		<atl-map :disable="disable" v-if="show" :longitude="longitude" :latitude="latitude" :marker="marker"
			:mapKey="mapKey" :mapType="mapType" @confirm="confirm">
			<template v-slot:content>
				<view style="position: absolute; bottom: 0;width: 100%;height: 24px; background-color: white;">
					<view style="display: flex;align-items: center; justify-content: center;">
						<image style="width: 24px; height: 24px;" src="/static/logo.png">
						</image>
						<text> 内容插槽 </text>
					</view>
				</view>
			</template>
		</atl-map>
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
				// mapKey: '42795f9a59358dea58a8bxxx',//高德地图测试key
				// mapType: 'amap',
				// mapType: 'tmap',
				mapKey: 'ZNJBZ-E6RHJ-EV3F2-DL73K-ARTTH-3EBRZ' //腾讯地图测试key
				// mapKey: 'p5mGzPEt30bwv1yEkeQxxx', //百度地图
				// mapType: 'bmap'
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