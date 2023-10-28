<template>
	<view class="map-content">
		<view class="top">
			<view class="cancel" @click="close">取消</view>
			<view class="address-text">
				{{ addressMap || '' }}
			</view>
			<view class="confirm" @click="submit" :style="{backgroundColor:disable? 'rgba(0, 0, 0, 0.2)':'#42b983'}">确定</view>
		</view>
		<view class="" @tap="getCurrentLocation">
			<map class="map" id="map" :latitude="lat" :longitude="long" scale="18" show-location :markers="markers" @tap="getCurrentLocation" @anchorpointtap="anchorpointtap"></map>
		</view>
		<view class="search">
			<view class="search-input">
				<input placeholder="请输入关键词" v-model="searchValue" type="text" maxlength="64" @input="searchMap" />
			</view>
		</view>
		<view class="bot-box">
			<view class="poi-list">
				<view v-if="searchList.length !== 0" class="poi-item" v-for="item in searchList" :key="item.id" @click="getCurrentSingleLocation(item)">
					<view class="">
						<view class="poi-name">
							{{ item.name }}
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

<script>
import amap from './amap-wx.js';
import { debounce } from '@/utils/utils.js';

export default {
	name: 'amap',
	props: ['longitude', 'latitude', 'mapKey', 'marker', 'disable'],
	data() {
		return {
			debounce,
			addressMap: '',
			searchValue: '',
			markers: [],
			amapPlugin: null,
			key: this.$props?.mapKey, //高德地图key https://console.amap.com/dev/key/app 服务平台选择微信小程序
			lat: this.$props?.latitude,
			long: this.$props?.longitude,
			regeocodeData: {},
			searchList: []
		};
	},
	created() {
		this.init();
	},
	methods: {
		changeMarkers() {
			this.markers[0] = {
				...this.$props?.marker,
				longitude: this.long,
				latitude: this.lat
			};
		},
		init() {
			this.amapPlugin = new amap.AMapWX({
				key: this.key
			});
			const detail = {
				longitude: this.$props?.longitude,
				latitude: this.$props?.latitude
			};

			if (!detail.latitude || !detail.longitude) {
				const _this = this;
				uni.getLocation({
					type: 'gcj02',
					isHighAccuracy: true,
					success: (data) => {
						detail.latitude = data.latitude;
						detail.longitude = data.longitude;
						_this.getCurrentLocation({ detail });
					}
				});
			} else {
				this.getCurrentLocation({ detail });
			}
		},
		//点击地图
		getCurrentLocation(e) {
			this.searchValue = '';
			const { latitude, longitude } = e.detail;
			/* 更新地图中心点位 start */
			this.lat = latitude;
			this.long = longitude;
			/* 更新地图中心点位 end */
			this.changeMarkers();
			let coordinate = longitude + ',' + latitude;
			this.amapPlugin.getRegeo({
				location: coordinate,
				success: (data) => {
					const { regeocodeData } = data[0];
					this.addressMap = regeocodeData.formatted_address;
					this.regeocodeData = regeocodeData;
					this.searchList = regeocodeData.pois;
				},
				fail: (e) => {
					console.log(1, e);
				}
			});
		},
		getInputtips() {
			this.amapPlugin.getInputtips({
				key: this.key,
				keywords: this.searchValue,
				location: this.long + ',' + this.lat,
				success: (data) => {
					this.searchList = data.tips.filter((i) => i?.id?.length && i?.location);
				}
			});
		},
		//搜索关键字
		searchMap() {
			this.getInputtips();
		},
		getCurrentSingleLocation(data) {
			let coordinate = data.location.split(',');
			/* 更新地图中心点位 start */
			this.lat = coordinate[1];
			this.long = coordinate[0];
			this.changeMarkers();
			/* 更新地图中心点位 end */
			this.searchValue = data.name;
			this.amapPlugin.getRegeo({
				location: data.location,
				success: (data) => {
					this.addressMap = data[0].regeocodeData.formatted_address;
					this.regeocodeData = data[0].regeocodeData;
				}
			});
		},
		close() {
			this.$emit('confirm');
		},
		submit(e) {
			if(this.$props.disable){
				return;
			}
			if (!this.addressMap) {
				return;
			}
			if (JSON.stringify(this.regeocodeData) != '{}') {
				const {
					pois,
					addressComponent: { province, district, township }
				} = this.regeocodeData;
				const title = pois?.[0]?.name || province + district + township;
				this.$emit('confirm', {
					...this.regeocodeData,
					title,
					latitude: this.lat,
					longitude: this.long,
					address: this.addressMap
				});
			}
		}
	}
};
</script>
<style lang="scss" scoped>
.map-content {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	z-index: 99;
	background-color: #fff;

	.top {
		position: absolute;
		width: 100%;
		height: 80rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10rpx 40rpx;
		box-sizing: border-box;
		background-color: rgba(0, 0, 0, 0.2);
		color: #fff;
		z-index: 999;

		.confirm {
			height: 60rpx;
			line-height: 60rpx;
			padding: 0 20rpx;
			border-radius: 10rpx;
			background-color: #42b983;
		}

		.address-text {
			width: 55vw;
			text-align: center;
			overflow: hidden;
			word-wrap: break-word;
			display: -webkit-box;
			-webkit-line-clamp: 1;
			-webkit-box-orient: vertical;
		}
	}

	.map {
		position: relative;
		width: 100vw;
		height: 50vh;
		.position-icon {
			position: absolute;
			left: 50%;
			top: 50%;
			width: 50px;
			height: 40px;
			margin-top: -12px;
			transform: translate(-50%, -50%);
		}
	}

	.search {
		margin: 10rpx 20rpx;
		display: flex;
		justify-content: center;
		input {
			flex: 1;
			width: calc(100vw - 80rpx);
			padding: 0 20rpx;
			height: 60rpx;
			border: 1px solid #ccc;
			border-radius: 10rpx;
		}
	}
	.bot-box {
		height: calc(50vh - 50px);
		overflow: auto;
		width: 100vw;
		.empty {
			margin-top: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.poi-list {
			padding: 0 $uni-spacing-row-base;
			box-sizing: border-box;

			.poi-item {
				margin: 20rpx 0;
				padding: 10rpx;
				border: 1px solid $uni-border-color;
				border-radius: $uni-border-radius-base;

				.poi-name {
					font-size: 34rpx;
					color: #333;
				}

				.poi-address {
					.address {
						width: 100%;
						font-size: 26rpx;
						overflow: hidden;
						color: #999;
						white-space: nowrap;
						text-overflow: ellipsis;
					}
				}
			}

			.poi-item:active {
				color: #fff;
				border: 1px solid $uni-color-primary;
			}
		}
	}
}
</style>
