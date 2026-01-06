<template>
	<view class="map-content" :style="[
			isCustomBar && {
				height: customBarH + 'px',
				paddingTop: statusBarH + 'px',
				backgroundColor: 'transparent',
				top: top + 'px',
			},
		]">
		<view class="top">
			<view class="cancel" @click="close">取消</view>
			<view class="address-text">
				{{ currentAddress || '' }}
			</view>
			<view class="confirm" @click="submit"
				:style="{ backgroundColor: disable ? 'rgba(0, 0, 0, 0.2)' : '#42b983' }">确定</view>
		</view>
		<map id="map" class="map" :longitude="long" :latitude="lat" show-location @tap="onMapTap" :markers="markers"
			:polygons="isPolygons?polygons:[]" enable-poi @poitap="onPoiTap">
			<cover-view>
				<slot name="content"></slot>
			</cover-view>
		</map>
		<view class="search">
			<view class="search-input">
				<input placeholder="搜索附近" v-model="searchValue" type="text" maxlength="64" @input="onSearch" />
			</view>
		</view>
		<view class="bot-box">
			<view class="poi-list">
				<view class="poi-item" v-for="item in searchList" :key="item.id" @click="selectItem(item)">
					<view v-if="searchList.length !== 0">
						<view class="poi-name">
							{{ item.title }}
						</view>
						<view class="poi-address">
							<view class="address">{{ item.address }}</view>
						</view>
					</view>
				</view>
				<view class="empty" v-if="searchList.length == 0">暂无数据, 请更检查key是否有效或者更换关键词</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { onMounted } from 'vue';
import QQMapWX from './qqmap-wx-jssdk.min.js';
import { useMapCommon } from '../../hooks/useMapCommon.js';

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

const {
	statusBarH,
	customBarH,
	currentAddress,
	searchValue,
	markers,
	searchList,
	lat,
	long,
	currentPoi,
	setGetAddress,
	updateMarker,
	close,
	submit,
	onMapTap,
	onPoiTap,
	selectItem
} = useMapCommon(props, emit);

let qqmapsdk = null;

onMounted(() => {
	setGetAddress(getAddress);
	initMap();
});

const initMap = () => {
	qqmapsdk = new QQMapWX({
		key: props.mapKey
	});

	if (!lat.value || !long.value) {
		uni.getLocation({
			type: 'gcj02',
			isHighAccuracy: true,
			success: (data) => {
				lat.value = data.latitude;
				long.value = data.longitude;
				getAddress([data.longitude, data.latitude]);
			},
			fail: () => {
				// Handle failure
			}
		});
	} else {
		getAddress([long.value, lat.value]);
	}
};

const getAddress = (location) => {
	// location: [longitude, latitude]
	lat.value = location[1];
	long.value = location[0];
	updateMarker();

	qqmapsdk.reverseGeocoder({
		location: {
			latitude: location[1],
			longitude: location[0]
		},
		get_poi: 1,
		success: (res) => {
			const result = res.result;
			currentAddress.value = result.formatted_addresses?.recommend || result.address;

			// 构建标准化结果
			const adInfo = result.ad_info || {};
			const confirmData = {
				title: result.formatted_addresses?.recommend || result.address,
				address: result.address,
				latitude: result.location.lat,
				longitude: result.location.lng,
				province: adInfo.province,
				city: adInfo.city,
				district: adInfo.district,
				adcode: adInfo.adcode,
				category: result.address_reference?.landmark_l2?.title || '',
				id: ''
			};
			currentPoi.value = confirmData;
			searchList.value = result.pois || [];

			emit('changeMarker', confirmData);
		},
		fail: (error) => {
			console.error(error);
		}
	});
};

const onSearch = () => {
	if (!searchValue.value) return;
	qqmapsdk.getSuggestion({
		keyword: searchValue.value,
		success: (res) => {
			searchList.value = res.data.map(item => ({
				id: item.id,
				title: item.title,
				address: item.address,
				location: item.location,
				...item
			}));
		}
	});
};
</script>

<style lang="scss" scoped>
	@import "../common/map.scss";
</style>
