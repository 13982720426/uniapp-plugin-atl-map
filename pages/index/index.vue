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
			:mapKey="mapKey" :mapType="mapType" @confirm="confirm" @changeMarker="changeMarker" :polygons="polygons"
			:isPolygons="true">
			<template v-slot:content>
				<view style="position: absolute; bottom: 0;width: 100%;height: 24px; background-color: white;">
					<view style="display: flex;align-items: center; justify-content: center;">
						<image style="width: 24px; height: 24px;" :src="imageSrc">
						</image>
						<text> 内容插槽 </text>
					</view>
				</view>
			</template>
		</atl-map>
	</view>
</template>

<script>
	import
	booleanPointInPolygon
	from '@turf/boolean-point-in-polygon'
	import {
		point,
		polygon
	} from '@turf/helpers'
	export default {
		data() {
			return {
				polygons: [{
					points: [{
							longitude: '106.57',
							latitude: '29.52'
						},
						{
							longitude: '106.57',
							latitude: '29.53'
						},
						{
							longitude: '106.55',
							latitude: '29.53'
						},
						{
							longitude: '106.55',
							latitude: '29.52'
						},
						{
							longitude: '106.57',
							latitude: '29.52'
						}
					],
					strokeWidth: 1,
					strokeColor: '#ff000066',
					fillColor: '#ff000016'
				}, {
					points: [{
							longitude: '106.57',
							latitude: '29.51'
						},
						{
							longitude: '106.57',
							latitude: '29.515'
						},
						{
							longitude: '106.55',
							latitude: '29.515'
						},
						{
							longitude: '106.57',
							latitude: '29.51'
						}
					],
					strokeWidth: 1,
					strokeColor: '#ff000066',
					fillColor: '#ff000016'
				}],
				disable: false,
				show: false,
				title: '',
				address: '',
				longitude: '',
				latitude: '',
				imageSrc: "/static/logo.png", //自定义图片
				marker: {
					id: 1,
					height: 50,
					width: 40
					// iconPath: '/static/comm/position.png'
				},
				// mapKey: '42795f9a59358dea58a8bxxx',//高德地图测试key
				mapKey: 'ZNJBZ-E6RHJ-EV3F2-DL73K-ARTTH-3EBRZ', //腾讯地图测试key
				// mapKey: 'p5mGzPEt30bwv1yEkeQGsGP4Xrs9xxxx', //百度地图
				mapType: 'tmap' // tmap bmap amap
			};
		},
		onLoad() {},
		methods: {
			changeMarker(e) {
				const {
					latitude,
					longitude
				} = e
				const _polygons = this.polygons.map(polygon => {
					return polygon.points.map(i => ([Number(i.longitude), Number(i.latitude)]))
				})
				const _point = point([longitude, latitude])
				const _polygon = polygon(_polygons)
				// 根据电子围栏判断否禁用
				this.disable = booleanPointInPolygon(_point, _polygon)
			},
			onClick() {
				this.show = true;
			},
			confirm(e) {
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