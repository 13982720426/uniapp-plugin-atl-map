<template>
	<view>
		<amap v-if="mapType === 'amap'" :longitude="longitude" :latitude="latitude" :mapKey="mapKey" :marker="marker"
			:disable="disable" :isPolygons="isPolygons" :polygons="polygons" :top="top" :isCustomBar="isCustomBar"
			@confirm="confirm" @changeMarker="changeMarker" @close="close">
			<template v-slot:content>
				<slot name="content"></slot>
			</template>
		</amap>
		<bmap v-else-if="mapType === 'bmap'" :longitude="longitude" :latitude="latitude" :mapKey="mapKey" :marker="marker"
			:disable="disable" :isPolygons="isPolygons" :polygons="polygons" :top="top" :isCustomBar="isCustomBar"
			@changeMarker="changeMarker" @confirm="confirm" @close="close">
			<template v-slot:content>
				<slot name="content"></slot>
			</template>
		</bmap>
		<tmap v-else :longitude="longitude" :latitude="latitude" :mapKey="mapKey" :marker="marker" :disable="disable"
			:isPolygons="isPolygons" :polygons="polygons" :top="top" :isCustomBar="isCustomBar" @confirm="confirm"
			@changeMarker="changeMarker" @close="close">
			<template v-slot:content>
				<slot name="content"></slot>
			</template>
		</tmap>
	</view>
</template>

<script setup>
import amap from '../amap/amap.vue';
import tmap from '../tmap/tmap.vue';
import bmap from '../bmap/bmap.vue';

const props = defineProps({
	longitude: {
		type: [String, Number],
		default: ''
	},
	latitude: {
		type: [String, Number],
		default: ''
	},
	mapKey: {
		require: true,
		type: String,
		default: ''
	},
	marker: {
		type: Object,
		default: () => ({})
	},
	mapType: {
		type: String,
		default: 'tmap'
	},
	disable: {
		type: Boolean,
		default: false
	},
	isPolygons: {
		type: Boolean,
		default: false
	},
	polygons: {
		type: Array,
		default: () => []
	},
	top: {
		type: [String, Number],
		default: 30
	},
	isCustomBar: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits(['confirm', 'changeMarker', 'close']);

const confirm = (e) => {
	emit('confirm', e);
};

const changeMarker = (e) => {
	emit('changeMarker', e);
};

const close = () => {
	emit('close');
};
</script>

<style lang="scss" scoped></style>