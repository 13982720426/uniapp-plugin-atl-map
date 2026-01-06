<template>
	<view class="">
		<view style="padding:20px">
			<view class="">地址：{{ title }}</view>
			<view class="">详细地址：{{ address }}</view>
			<view class="">经度：{{ longitude }}</view>
			<view class="">纬度：{{ latitude }}</view>
		</view>
		<view style="padding: 0 20px;">
			<view style="margin-bottom: 10px;">选择地图类型：</view>
			<radio-group @change="onMapTypeChange" style="display: flex; gap: 20px;">
				<label class="radio" style="display: flex; align-items: center;">
					<radio value="tmap" :checked="mapType === 'tmap'" />腾讯地图
				</label>
				<label class="radio" style="display: flex; align-items: center;">
					<radio value="amap" :checked="mapType === 'amap'" />高德地图
				</label>
				<label class="radio" style="display: flex; align-items: center;">
					<radio value="bmap" :checked="mapType === 'bmap'" />百度地图
				</label>
			</radio-group>
		</view>
		<view style="width: 90vw; margin: 5vw">
			<button @click="onClick">点击打开地图</button>
		</view>
		<atl-map :disable="disable" v-if="show" :longitude="longitude" :latitude="latitude" :marker="marker"
			:mapKey="mapKey" :mapType="mapType" @confirm="confirm" @changeMarker="changeMarker" @close="close" :polygons="polygons"
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

<script setup>
import { ref, computed } from 'vue';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';

const polygons = ref([{
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
}]);

const disable = ref(false);
const show = ref(false);
const title = ref('');
const address = ref('');
const longitude = ref('');
const latitude = ref('');
const imageSrc = ref("/static/logo.png");
const marker = ref({
	id: 1,
	height: 50,
	width: 40
	// iconPath: '/static/comm/position.png'
});

const mapKeys = {
	amap: '42795f9a59358dea58a8bxxx', //高德地图测试key
	tmap: 'ZNJBZ-E6RHJ-EV3F2-DL73K-ARTTH-3EBRZ', //腾讯地图测试key
	bmap: 'p5mGzPEt30bwv1yEkeQGsGP4Xrs9xxxx' //百度地图
};

const mapType = ref('tmap'); // tmap bmap amap
const mapKey = computed(() => mapKeys[mapType.value]);

const onMapTypeChange = (e) => {
	mapType.value = e.detail.value;
};

const changeMarker = (e) => {
	const {
		latitude: lat,
		longitude: lng
	} = e;
	
	// Ensure coordinates are numbers
	const currentPoint = point([Number(lng), Number(lat)]);
	
	// Check if point is inside ANY of the polygons
	let isInside = false;
	
	try {
		for (const poly of polygons.value) {
			// Construct a polygon for each item in the array.
			// Assuming each item is a simple polygon (single ring).
			// Ensure coordinates are numbers and in [lng, lat] format.
			const ring = poly.points.map(i => ([Number(i.longitude), Number(i.latitude)]));
			
			// turf.polygon expects an array of rings.
			const _polygon = polygon([ring]);
			
			if (booleanPointInPolygon(currentPoint, _polygon)) {
				isInside = true;
				break;
			}
		}
		disable.value = isInside;
	} catch (error) {
		console.error('Polygon check failed:', error);
	}
};

const onClick = () => {
	show.value = true;
};

const confirm = (e) => {
	if (e) {
		longitude.value = e.longitude;
		latitude.value = e.latitude;
		title.value = e.title;
		address.value = e.address;
	}
	show.value = false;
};

const close = () => {
	show.value = false;
};
</script>

<style></style>