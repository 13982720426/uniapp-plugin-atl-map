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
import { BMapWX } from './bmap-wx.min.js';
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

let bmapPlugin = null;

onMounted(() => {
	setGetAddress(getAddress);
	initMap();
});

const initMap = () => {
	bmapPlugin = new BMapWX({
		ak: props.mapKey
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
			fail: (err) => {
				console.error('Location failed', err);
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

	bmapPlugin.regeocoding({
		location: `${location[1]},${location[0]}`, // 百度 SDK 需要 "lat,lng" 格式的位置参数
		success: (data) => {
			const { originalData } = data;
			const result = originalData.result;
			const addressComponent = result.addressComponent;

			const confirmData = {
				title: result.pois?.[0]?.name || result.formatted_address,
				address: result.formatted_address,
				latitude: location[1],
				longitude: location[0],
				province: addressComponent.province,
				city: addressComponent.city,
				district: addressComponent.district,
				adcode: addressComponent.adcode,
				category: '',
				id: result.pois?.[0]?.uid || '',
				// 百度特有字段
				township: addressComponent.township,
				street: addressComponent.street,
				streetNumber: addressComponent.street_number,
				business: result.business,
				sematicDescription: result.sematic_description,
				poiId: result.pois?.[0]?.uid || ''
			};
			
			currentPoi.value = confirmData;
			currentAddress.value = confirmData.title;

			// 将 pois 映射到统一结构
			searchList.value = (result.pois || []).map(poi => {
				return {
					id: poi.uid,
					title: poi.name,
					address: poi.addr || poi.address,
					latitude: poi.point.y, // 百度 POI 返回 point {x, y}，如果设置了 coordtype 通常是 gcj02 的 lng, lat
					longitude: poi.point.x,
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
	bmapPlugin.suggestion({
		query: searchValue.value,
		region: '全国', // 如果可用，可以优化为当前城市
		success: (data) => {
			if (data.status === 0) {
				searchList.value = data.result.map(item => ({
					id: item.uid,
					title: item.name,
					address: item.city + item.district + (item.business || ''),
					latitude: item.location?.lat,
					longitude: item.location?.lng,
					...item
				})).filter(item => item.latitude && item.longitude);
			}
		},
		fail: (info) => {
			console.error(info);
		}
	});
};

</script>

<style lang="scss" scoped>
	@import "../common/map.scss";
</style>
