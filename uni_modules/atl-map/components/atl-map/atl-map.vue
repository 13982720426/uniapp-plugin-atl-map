<template>
	<view>
		<tmap v-if="mapType === 'tmap'" :disable="disable" :longitude="longitude" :latitude="latitude" :mapKey="mapKey" :marker="marker" @confirm="confirm"></tmap>
		<amap v-else-if="mapType === 'amap'" :disable="disable" :longitude="longitude" :latitude="latitude" :mapKey="mapKey" :marker="marker" @confirm="confirm"></amap>
		<bmap v-else-if="mapType === 'bmap'" :disable="disable" :longitude="longitude" :latitude="latitude" :mapKey="mapKey" :marker="marker" @confirm="confirm"></bmap>
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
			type: String | Number,
			default: ''
		},
		latitude: {
			type: String | Number,
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
		console.log(11, this.$props);
	},
	methods: {
		confirm(e) {
			this.$emit('confirm', e);
		}
	}
};
</script>

<style lang="scss" scoped></style>
