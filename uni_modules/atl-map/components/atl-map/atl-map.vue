<template>
	<view>

		<amap v-if="mapType === 'amap'" :disable="disable" :longitude="longitude" :latitude="latitude" :mapKey="mapKey"
			:marker="marker" @confirm="confirm" @changeMarker="changeMarker" :polygons="polygons"
			:isPolygons="isPolygons" :isCustomBar="isCustomBar" :top='top'>
			<template v-slot:content>
				<slot name="content"></slot>
			</template>
		</amap>
		<bmap v-else-if="mapType === 'bmap'" :disable="disable" :longitude="longitude" :latitude="latitude"
			:mapKey="mapKey" :marker="marker" @changeMarker="changeMarker" @confirm="confirm" :polygons="polygons"
			:isPolygons="isPolygons" :isCustomBar="isCustomBar" :top='top'>
			<template v-slot:content>
				<slot name="content"></slot>
			</template>
		</bmap>
		<tmap v-else :disable="disable" :longitude="longitude" :latitude="latitude" :mapKey="mapKey" :marker="marker"
			@confirm="confirm" @changeMarker="changeMarker" :polygons="polygons" :isPolygons="isPolygons"
			:isCustomBar="isCustomBar" :top='top'>
			<template v-slot:content>
				<slot name="content"></slot>
			</template>
		</tmap>
	</view>
</template>

<script>
	import amap from '../amap/amap.vue';
	import tmap from '../tmap/tmap.vue';
	import bmap from '../bmap/bmap.vue';

	export default {
		name: 'atl-map',
		props: {
			longitude: {
				type: String,
				default: ''
			},
			latitude: {
				type: String,
				default: ''
			},
			mapKey: {
				require: true,
				type: String,
				default: ''
			},
			marker: {
				type: Object,
				default: () => {}
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
				type: String | Number,
				default: 30
			},
			isCustomBar: {
				type: Boolean,
				default: false
			}
		},
		components: {
			amap,
			tmap,
			bmap
		},
		data() {
			return {};
		},
		created() {
			// console.log(11, this.$props);
		},
		methods: {
			confirm(e) {
				this.$emit('confirm', e);
			},
			changeMarker(e) {
				this.$emit('changeMarker', e);
			}
		}
	};
</script>

<style lang="scss" scoped></style>