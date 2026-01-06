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
import { AMapWX } from './amap-wx.130.js';
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

let amapPlugin = null;

onMounted(() => {
	setGetAddress(getAddress);
	initMap();
});

const initMap = () => {
	amapPlugin = new AMapWX({
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
				// 处理失败情况
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

	amapPlugin.getRegeo({
		location: `${location[0]},${location[1]}`,
		success: (data) => {
			const regeo = data[0].regeocodeData;
			const addressComponent = regeo.addressComponent;
			const confirmData = {
				title: regeo.pois?.[0]?.name || regeo.formatted_address,
				address: regeo.formatted_address,
				latitude: location[1],
				longitude: location[0],
				province: addressComponent.province,
				city: addressComponent.city,
				district: addressComponent.district,
				adcode: addressComponent.adcode,
				category: regeo.pois?.[0]?.type || '',
				id: regeo.pois?.[0]?.id || ''
			};
			currentPoi.value = confirmData;
			currentAddress.value = confirmData.title;

			searchList.value = (regeo.pois || []).map(poi => {
				const loc = poi.location.split(',');
				return {
					id: poi.id,
					title: poi.name,
					address: poi.address,
					latitude: parseFloat(loc[1]),
					longitude: parseFloat(loc[0]),
					...poi
				};
			});

			emit('changeMarker', confirmData);
		},
		fail: (info) => {
			console.error(info);
		}
	});
};

const onSearch = () => {
	if (!searchValue.value) return;
	amapPlugin.getInputtips({
		keywords: searchValue.value,
		location: `${long.value},${lat.value}`,
		success: (data) => {
			if (data && data.tips) {
				searchList.value = data.tips
					.filter(i => i.location && i.location.length)
					.map(tip => {
						const loc = tip.location.split(',');
						return {
							id: tip.id,
							title: tip.name,
							address: tip.address || tip.district,
							latitude: parseFloat(loc[1]),
							longitude: parseFloat(loc[0]),
							...tip
						};
					});
			}
		}
	});
};
</script>

<style lang="scss" scoped>
	@import "../common/map.scss";
</style>
