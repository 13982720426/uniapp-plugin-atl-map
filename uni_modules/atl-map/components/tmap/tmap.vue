<template>
	<view class="map-content">
		<view class="top">
			<view class="cancel" @click="closeMap">取消</view>
			<view class="address-text">
				{{ currentAd.title || '' }}
			</view>
			<view class="confirm" @click="submit" :style="{backgroundColor:disable? 'rgba(0, 0, 0, 0.2)':'#42b983'}">确定</view>
		</view>
		<map id="map" class="map" :longitude="long" :latitude="lat" show-location @tap="onTap" :markers="markers"></map>
		<view class="search">
			<view class="search-input">
				<input placeholder="搜索附近" v-model="search" type="text" maxlength="64" @input="gosearch" />
			</view>
		</view>
		<view class="bot-box">
			<view class="poi-list">
				<view v-if="poiList.length !== 0" class="poi-item" v-for="item in poiList" :key="item.id" @click="select(item)">
					<view class="">
						<view class="poi-name">
							{{ item.title }}
						</view>
						<view class="poi-address">
							<view class="address">{{ item.address }}</view>
						</view>
					</view>
				</view>
				<view class="empty" v-if="poiList.length == 0">暂无数据, 请更检查key是否有效或者更换关键词</view>
			</view>
		</view>
	</view>
</template>
<script>
const QQMapWX = require('./qqmap-wx-jssdk.js');
export default {
	//父组件传递的信息 mapKeyk地图key marker点位配置 latitude经度 longitude纬度 confirm为回调方法回调中携带选择的地址参数
	// 示例  <tmap @confirm="confirm" ></tmap>
	// confirm(data){ data为选择的数据 }
	name: 'tmap',
	props: ['mapKey', 'longitude', 'latitude', 'marker','disable'],
	data() {
		return {
			lat: this.$props?.latitude, //经度
			long: this.$props?.longitude, //维度
			key: this.$props?.mapKey,
			search: '',
			qqmapsdk: {},
			poiList: [],
			markers: [],
			currentAd: '' //选择的位址,
		};
	},
	created() {
		setTimeout(() => {
			this.initData();
		}, 100);
	},
	methods: {
		//初始化
		initData() {
			this.qqmapsdk = new QQMapWX({
				key: this.key
			});

			uni.getLocation({
				type: 'gcj02',
				isHighAccuracy: true,
				success: (data) => {
					this.long = this.$props?.longitude || data.longitude;
					this.lat = this.$props?.latitude || data.latitude;
					this.changeMarkers();
					this.goSearchNearby();
				}
			});
		},
		onTap(e) {
			this.lat = e.detail.latitude;
			this.long = e.detail.longitude;
			this.changeMarkers();
			this.search = '';
			this.goSearchNearby();
		},
		changeMarkers() {
			this.markers[0] = {
				...this.$props?.marker,
				longitude: this.long,
				latitude: this.lat
			};
		},
		//当前位址信息
		goSearchNearby() {
			let that = this;

			that.qqmapsdk.reverseGeocoder({
				location: {
					latitude: that.lat,
					longitude: that.long
				},
				get_poi: 1,
				poi_options: 'policy=2;radius=3000;page_size=20;page_index=1',
				success: (data) => {
					that.poiList = data.result.pois;
					that.currentAd = that.poiList[0];
				},
				fail: (e) => {
					uni.showToast({
						title: e.message,
						icon: 'none'
					});
				}
			});
		},
		//搜索
		gosearch() {
			if (!this.search) {
				uni.showToast({
					title: '请输入搜索内容',
					icon: 'none'
				});
				return;
			}
			let that = this;
			that.qqmapsdk.getSuggestion({
				keyword: that.search,
				location: that.lat + ',' + that.long,
				success: (data) => {
					that.poiList = data.data;
				},
				fail: (e) => {
					uni.showToast({
						title: e.message,
						icon: 'none'
					});
				}
			});
		},
		//关闭地图
		closeMap() {
			this.$emit('confirm');
		},
		select(item) {
			const { lng: longitude, lat: latitude } = item?.location;
			this.search = item.title;
			if (this.currentAd.id == item.id) return;
			this.currentAd = item;
			this.lat = latitude;
			this.long = longitude;
			this.changeMarkers();
		},
		//确定
		submit() {
			if(this.$props.disable){
				return;
			}
			const { lng: longitude, lat: latitude } = this.currentAd?.location;

			this.currentAd = {
				...this.currentAd,
				longitude,
				latitude
			};
			this.$emit('confirm', this.currentAd);
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
