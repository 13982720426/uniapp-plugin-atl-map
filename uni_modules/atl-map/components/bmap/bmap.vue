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
				{{ addressMap || '' }}
			</view>
			<view class="confirm" @click="submit"
				:style="{ backgroundColor: disable ? 'rgba(0, 0, 0, 0.2)' : '#42b983' }">确定</view>
		</view>
		<map class="map" id="map" :latitude="lat" :longitude="long" scale="18" show-location :markers="markers"
			@tap="getCurrentLocation" :polygons="isPolygons?polygons:[]">
			<cover-view>
				<slot name="content"></slot>
			</cover-view>
		</map>
		<view class="search">
			<view class="search-input">
				<input placeholder="请输入关键词" v-model="searchValue" type="text" maxlength="64" @input="searchMap" />
			</view>
		</view>
		<view class="bot-box">
			<view class="poi-list">
				<view class="poi-item" v-for="item in searchList" :key="item.uid"
					@click="getCurrentSingleLocation(item)">
					<view v-if="searchList.length !== 0">
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
	// import * as bmap from './bmap-wx.js';
	class BMapWX {

		/**
		 * 百度地图微信小程序API类
		 *
		 * @constructor
		 */
		constructor(param) {
			this.ak = param["ak"];
		}

		/**
		 * 使用微信接口进行定位
		 *
		 * @param {string} type 坐标类型
		 * @param {Function} success 成功执行
		 * @param {Function} fail 失败执行
		 * @param {Function} complete 完成后执行
		 */
		getWXLocation(type, success, fail, complete) {
			type = type || 'gcj02',
				success = success || function() {};
			fail = fail || function() {};
			complete = complete || function() {};
			wx.getLocation({
				type: type,
				success: success,
				fail: fail,
				complete: complete
			});
		}

		/**
		 * POI周边检索
		 *
		 * @param {Object} param 检索配置
		 * 参数对象结构可以参考
		 * http://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-placeapi
		 */
		search(param) {
			var that = this;
			param = param || {};
			let searchparam = {
				query: param["query"] || '生活服务$美食&酒店',
				scope: param["scope"] || 1,
				filter: param["filter"] || '',
				coord_type: param["coord_type"] || 2,
				page_size: param["page_size"] || 10,
				page_num: param["page_num"] || 0,
				output: param["output"] || 'json',
				ak: that.ak,
				sn: param["sn"] || '',
				timestamp: param["timestamp"] || '',
				radius: param["radius"] || 2000,
				ret_coordtype: 'gcj02ll'
			};
			let otherparam = {
				iconPath: param["iconPath"],
				iconTapPath: param["iconTapPath"],
				width: param["width"],
				height: param["height"],
				alpha: param["alpha"] || 1,
				success: param["success"] || function() {},
				fail: param["fail"] || function() {}
			};
			let type = 'gcj02';
			let locationsuccess = function(result) {
				searchparam["location"] = result["latitude"] + ',' + result[
					"longitude"];
				wx.request({
					url: 'https://api.map.baidu.com/place/v2/search',
					data: searchparam,
					header: {
						"content-type": "application/json"
					},
					method: 'GET',
					success(data) {
						let res = data["data"];
						if (res["status"] === 0) {
							let poiArr = res["results"];
							// outputRes 包含两个对象，
							// originalData为百度接口返回的原始数据
							// wxMarkerData为小程序规范的marker格式
							let outputRes = {};
							outputRes["originalData"] = res;
							outputRes["wxMarkerData"] = [];
							for (let i = 0; i < poiArr.length; i++) {
								outputRes["wxMarkerData"][i] = {
									id: i,
									latitude: poiArr[i]["location"]["lat"],
									longitude: poiArr[i]["location"]["lng"],
									title: poiArr[i]["name"],
									iconPath: otherparam["iconPath"],
									iconTapPath: otherparam["iconTapPath"],
									address: poiArr[i]["address"],
									telephone: poiArr[i]["telephone"],
									alpha: otherparam["alpha"],
									width: otherparam["width"],
									height: otherparam["height"]
								}
							}
							otherparam.success(outputRes);
						} else {
							otherparam.fail({
								errMsg: res["message"],
								statusCode: res["status"]
							});
						}
					},
					fail(data) {
						otherparam.fail(data);
					}
				});
			}
			let locationfail = function(result) {
				otherparam.fail(result);
			};
			let locationcomplete = function(result) {};
			if (!param["location"]) {
				that.getWXLocation(type, locationsuccess, locationfail,
					locationcomplete);
			} else {
				let longitude = param.location.split(',')[1];
				let latitude = param.location.split(',')[0];
				let errMsg = 'input location';
				let res = {
					errMsg: errMsg,
					latitude: latitude,
					longitude: longitude
				};
				locationsuccess(res);
			}
		}

		/**
		 * sug模糊检索
		 *
		 * @param {Object} param 检索配置
		 * 参数对象结构可以参考
		 * http://lbsyun.baidu.com/index.php?title=webapi/place-suggestion-api
		 */
		suggestion(param) {
			var that = this;
			param = param || {};
			let suggestionparam = {
				query: param["query"] || '',
				region: param["region"] || '全国',
				city_limit: param["city_limit"] || false,
				output: param["output"] || 'json',
				ak: that.ak,
				sn: param["sn"] || '',
				timestamp: param["timestamp"] || '',
				ret_coordtype: 'gcj02ll'
			};
			let otherparam = {
				success: param["success"] || function() {},
				fail: param["fail"] || function() {}
			};
			wx.request({
				url: 'https://api.map.baidu.com/place/v2/suggestion',
				data: suggestionparam,
				header: {
					"content-type": "application/json"
				},
				method: 'GET',
				success(data) {
					let res = data["data"];
					if (res["status"] === 0) {
						otherparam.success(res);
					} else {
						otherparam.fail({
							errMsg: res["message"],
							statusCode: res["status"]
						});
					}
				},
				fail(data) {
					otherparam.fail(data);
				}
			});
		}

		/**
		 * rgc检索（逆地理编码：经纬度->地点描述）
		 * 
		 * @param {Object} param 检索配置
		 * 参数对象结构可以参考
		 * https://lbs.baidu.com/index.php?title=webapi/guide/webservice-geocoding-abroad
		 * 
		 */
		regeocoding(param) {
			var that = this;
			param = param || {};
			let regeocodingparam = {
				coordtype: param["coordtype"] || 'gcj02ll',
				ret_coordtype: 'gcj02ll',
				radius: param["radius"] || 1000,
				ak: that.ak,
				sn: param["sn"] || '',
				output: param["output"] || 'json',
				callback: param["callback"] || function() {},
				extensions_poi: param["extensions_poi"] || 1,
				extensions_road: param["extensions_road"] || false,
				extensions_town: param["extensions_town"] || false,
				language: param["language"] || 'zh-CN',
				language_auto: param["language_auto"] || 0
			};
			let otherparam = {
				iconPath: param["iconPath"],
				iconTapPath: param["iconTapPath"],
				width: param["width"],
				height: param["height"],
				alpha: param["alpha"] || 1,
				success: param["success"] || function() {},
				fail: param["fail"] || function() {}
			};
			let type = 'gcj02';
			let locationsuccess = function(result) {
				regeocodingparam["location"] = result["latitude"] + ',' + result[
					"longitude"];
				wx.request({
					url: 'https://api.map.baidu.com/reverse_geocoding/v3',
					data: regeocodingparam,
					header: {
						"content-type": "application/json"
					},
					method: 'GET',
					success(data) {
						let res = data["data"];
						if (res["status"] === 0) {
							let poiObj = res["result"];
							// outputRes 包含两个对象：
							// originalData为百度接口返回的原始数据
							// wxMarkerData为小程序规范的marker格式
							let outputRes = {};
							outputRes["originalData"] = res;
							outputRes["wxMarkerData"] = [];
							outputRes["wxMarkerData"][0] = {
								id: 0,
								latitude: result["latitude"],
								longitude: result["longitude"],
								address: poiObj["formatted_address"],
								iconPath: otherparam["iconPath"],
								iconTapPath: otherparam["iconTapPath"],
								desc: poiObj["sematic_description"],
								business: poiObj["business"],
								alpha: otherparam["alpha"],
								width: otherparam["width"],
								height: otherparam["height"]
							}
							otherparam.success(outputRes);
						} else {
							otherparam.fail({
								errMsg: res["message"],
								statusCode: res["status"]
							});
						}
					},
					fail(data) {
						otherparam.fail(data);
					}
				});
			};
			let locationfail = function(result) {
				otherparam.fail(result);
			}
			let locationcomplete = function(result) {};
			if (!param["location"]) {
				that.getWXLocation(type, locationsuccess, locationfail,
					locationcomplete);
			} else {
				let longitude = param.location.split(',')[1];
				let latitude = param.location.split(',')[0];
				let errMsg = 'input location';
				let res = {
					errMsg: errMsg,
					latitude: latitude,
					longitude: longitude
				};
				locationsuccess(res);
			}
		}

		/**
		 * gc检索（地理编码：地点->经纬度）
		 *
		 * @param {Object} param 检索配置
		 * 参数对象结构可以参考
		 * https://lbs.baidu.com/index.php?title=webapi/guide/webservice-geocoding
		 * 
		 */
		geocoding(param) {
			var that = this;
			param = param || {};
			let geocodingparam = {
				address: param["address"] || '',
				city: param["city"] || '',
				ret_coordtype: param["coordtype"] || 'gcj02ll',
				ak: that.ak,
				sn: param["sn"] || '',
				output: param["output"] || 'json',
				callback: param["callback"] || function() {}
			};
			let otherparam = {
				iconPath: param["iconPath"],
				iconTapPath: param["iconTapPath"],
				width: param["width"],
				height: param["height"],
				alpha: param["alpha"] || 1,
				success: param["success"] || function() {},
				fail: param["fail"] || function() {}
			};
			if (param["address"]) {
				wx.request({
					url: 'https://api.map.baidu.com/geocoding/v3',
					data: geocodingparam,
					header: {
						"content-type": "application/json"
					},
					method: 'GET',
					success(data) {
						let res = data["data"];
						if (res["status"] === 0) {
							let poiObj = res["result"];
							// outputRes 包含两个对象：
							// originalData为百度接口返回的原始数据
							// wxMarkerData为小程序规范的marker格式
							let outputRes = res;
							outputRes["originalData"] = res;
							outputRes["wxMarkerData"] = [];
							outputRes["wxMarkerData"][0] = {
								id: 0,
								latitude: poiObj["location"]["lat"],
								longitude: poiObj["location"]["lng"],
								iconPath: otherparam["iconPath"],
								iconTapPath: otherparam["iconTapPath"],
								alpha: otherparam["alpha"],
								width: otherparam["width"],
								height: otherparam["height"]
							}
							otherparam.success(outputRes);
						} else {
							otherparam.fail({
								errMsg: res["message"],
								statusCode: res["status"]
							});
						}
					},
					fail(data) {
						otherparam.fail(data);
					}
				});
			} else {
				let errMsg = 'input address!';
				let res = {
					errMsg: errMsg
				};
				otherparam.fail(res);
			}
		}

		/**
		 * 天气检索
		 *
		 * @param {Object} param 检索配置
		 */
		weather(param) {
			var that = this;
			param = param || {};
			let weatherparam = {
				coord_type: param["coord_type"] || 'gcj02',
				output: param["output"] || 'json',
				ak: that.ak,
				sn: param["sn"] || '',
				timestamp: param["timestamp"] || ''
			};
			let otherparam = {
				success: param["success"] || function() {},
				fail: param["fail"] || function() {}
			};
			let type = 'gcj02';
			let locationsuccess = function(result) {
				weatherparam["location"] = result["longitude"] + ',' + result[
					"latitude"];
				wx.request({
					url: 'https://api.map.baidu.com/telematics/v3/weather',
					data: weatherparam,
					header: {
						"content-type": "application/json"
					},
					method: 'GET',
					success(data) {
						let res = data["data"];
						if (res["error"] === 0 && res["status"] === 'success') {
							let weatherArr = res["results"];
							// outputRes 包含两个对象，
							// originalData为百度接口返回的原始数据
							// wxMarkerData为小程序规范的marker格式
							let outputRes = {};
							outputRes["originalData"] = res;
							outputRes["currentWeather"] = [];
							outputRes["currentWeather"][0] = {
								currentCity: weatherArr[0]["currentCity"],
								pm25: weatherArr[0]["pm25"],
								date: weatherArr[0]["weather_data"][0]["date"],
								temperature: weatherArr[0]["weather_data"][0][
									"temperature"
								],
								weatherDesc: weatherArr[0]["weather_data"][0][
									"weather"
								],
								wind: weatherArr[0]["weather_data"][0]["wind"]
							};
							otherparam.success(outputRes);
						} else {
							otherparam.fail({
								errMsg: res["message"],
								statusCode: res["status"]
							});
						}
					},
					fail(data) {
						otherparam.fail(data);
					}
				});
			}
			let locationfail = function(result) {
				otherparam.fail(result);
			}
			let locationcomplete = function(result) {}
			if (!param["location"]) {
				that.getWXLocation(type, locationsuccess, locationfail,
					locationcomplete);
			} else {
				let longitude = param.location.split(',')[0];
				let latitude = param.location.split(',')[1];
				let errMsg = 'input location';
				let res = {
					errMsg: errMsg,
					latitude: latitude,
					longitude: longitude
				};
				locationsuccess(res);
			}
		}
	}

	export default {
		name: 'bmap',
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
		},
		data() {
			return {
				statusBarH: 0,
				customBarH: 0,
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
			let self = this
			uni.getSystemInfo({
				success: function(e) {
					self.statusBarH = e.statusBarHeight + 5
					if (uni.getMenuButtonBoundingClientRect?.()) {
						let custom = uni.getMenuButtonBoundingClientRect()
						self.customBarH = custom.height + 5
					} else {
						self.customBarH = 30
					}
				},
			})
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
				this.bmapPlugin = new BMapWX({
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
							_this.getCurrentLocation({
								detail
							});
						}
					});
				} else {
					this.getCurrentLocation({
						detail
					});
				}
			},
			//点击地图
			getCurrentLocation(e) {
				this.searchValue = '';
				const {
					latitude,
					longitude
				} = e.detail;
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
						const {
							result
						} = data.originalData;
						this.addressMap = result.formatted_address;
						this.regeocodeData = result;
						this.$emit('changeMarker', this.getConfirmData());
						fn && fn(result.pois);
					},
				});
			},
			//搜索关键字
			searchMap() {
				this.getInputtips();
			},
			getCurrentSingleLocation(data) {
				const {
					point,
					location
				} = data;
				this.searchValue = data.name;
				this.getRegeo([point?.x || location.lng, point?.y || location.lat]);
			},
			close() {
				this.$emit('confirm');
			},
			getConfirmData() {
				const {
					pois,
					addressComponent: {
						province,
						district,
						township
					}
				} = this.regeocodeData;
				const title = pois?.[0]?.name || province + district + township;
				return {
					...this.regeocodeData,
					title,
					latitude: this.lat,
					longitude: this.long,
					address: this.addressMap
				}
			},
			submit(e) {
				if (this.$props.disable) {
					return;
				}
				if (!this.addressMap) {
					return;
				}
				if (JSON.stringify(this.regeocodeData) != '{}') {
					this.$emit('confirm', this.getConfirmData());
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
			padding: 10rpx 20rpx;
			display: flex;
			justify-content: center;
			background-color: #fff;

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
			background-color: #fff;

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