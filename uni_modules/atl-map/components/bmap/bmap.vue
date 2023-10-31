<template>
	<view class="map-content">
		<view class="top">
			<view class="cancel" @click="close">取消</view>
			<view class="address-text">
				{{ addressMap || '' }}
			</view>
			<view class="confirm" @click="submit" :style="{ backgroundColor: disable ? 'rgba(0, 0, 0, 0.2)' : '#42b983' }">确定</view>
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
				<view class="poi-item" v-for="item in searchList" :key="item.uid" @click="getCurrentSingleLocation(item)">
					<view v-if="poiList.length !== 0">
						<view class="poi-name">
							{{ item.name }}
						</view>
						<view class="poi-address">
							<view class="address">{{ item.address || item.addr }}</view>
						</view>
					</view>
				</view>
				<view class="empty" v-if="searchList.length == 0">暂无数据, 请更检查key是否有效或者更换关键词</view>
			</view>
		</view>
	</view>
</template>

<script>
import bmap from './bmap-wx.js';

export default {
	name: 'bmap',
	props: ['longitude', 'latitude', 'mapKey', 'marker', 'disable'],
	data() {
		return {
			addressMap: '',
			searchValue: '',
			markers: [],
			bmapPlugin: null,
			key: this.$props?.mapKey,
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
			this.bmapPlugin = new bmap.BMapWX({
				ak: this.key
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
			if (!latitude || !longitude) return;

			this.getRegeo([longitude, latitude], (pois) => {
				this.searchList = pois;
			});
		},
		getInputtips() {
			this.bmapPlugin.suggestion({
				query: this.searchValue,
				success: (data) => {
					this.searchList = data.result.filter((i) => i?.uid && i?.location);
				}
			});
		},
		getRegeo(coordinate, fn) {
			this.long = coordinate[0];
			this.lat = coordinate[1];
			this.changeMarkers();
			this.bmapPlugin.regeocoding({
				location: this.lat + ',' + this.long,
				success: (data) => {
					const { result } = data.originalData;
					this.addressMap = result.formatted_address;
					this.regeocodeData = result;
					fn && fn(result.pois);
				}
			});
		},
		//搜索关键字
		searchMap() {
			this.getInputtips();
		},
		getCurrentSingleLocation(data) {
			const { point, location } = data;
			this.searchValue = data.name;
			this.getRegeo([point?.x || location.lng, point?.y || location.lat]);
		},
		close() {
			this.$emit('confirm');
		},
		submit(e) {
			if (this.$props.disable) {
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
				border: 1px solid #42b983;
			}
		}
	}
}
</style>
