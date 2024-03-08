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
				<view class="poi-item" v-for="item in searchList" :key="item.id"
					@click="getCurrentSingleLocation(item)">
					<view v-if="searchList.length !== 0">
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
	// vue3 导入sdk不兼容 所以直接将sdk写入这个文件
	function AMapWX(a) {
		this.key = a.key
		this.requestConfig = {
			key: a.key,
			s: "rsx",
			platform: "WXJS",
			appname: a.key,
			sdkversion: "1.2.0",
			logversion: "2.0"
		}
	}
	AMapWX.prototype.getWxLocation = function(a, b) {
		uni.getLocation({
			type: "gcj02",
			success: function(a) {
				var c = a.longitude + "," + a.latitude;
				uni.setStorage({
					key: "userLocation",
					data: c
				}), b(c)
			},
			fail: function(c) {
				uni.getStorage({
					key: "userLocation",
					success: function(a) {
						a.data && b(a.data)
					}
				})
			}
		})
	}
	AMapWX.prototype.getRegeo = function(a) {
		function c(c) {
			var d = b.requestConfig;
			uni.request({
				url: "https://restapi.amap.com/v3/geocode/regeo",
				data: {
					key: b.key,
					location: c,
					extensions: "all",
					s: d.s,
					platform: d.platform,
					appname: b.key,
					sdkversion: d.sdkversion,
					logversion: d.logversion
				},
				method: "GET",
				header: {
					"content-type": "application/json"
				},
				success: function(b) {
					var d, e, f, g, h, i, j, k, l;
					b.data.status && "1" == b.data.status ? (d = b.data.regeocode,
						e = d.addressComponent, f = [], g = "", d && d.roads[
							0] && d.roads[0].name && (g = d.roads[0].name + "附近"), h =
						c.split(",")[0], i = c.split(",")[1], d.pois && d
						.pois[0] && (g = d.pois[0].name + "附近", j = d.pois[0]
							.location, j && (h = parseFloat(j.split(",")[0]), i =
								parseFloat(j.split(",")[1]))), e.provice && f.push(e
							.provice), e.city && f.push(e.city), e.district && f.push(
							e.district), e.streetNumber && e.streetNumber.street && e
						.streetNumber.number ? (f.push(e.streetNumber.street),
							f.push(e.streetNumber.number)) : (k = "", d && d.roads[
							0] && d.roads[0].name && (k = d.roads[0].name), f.push(
							k)), f = f.join(""), l = [{
							iconPath: a.iconPath,
							width: a.iconWidth,
							height: a.iconHeight,
							name: f,
							desc: g,
							longitude: h,
							latitude: i,
							id: 0,
							regeocodeData: d
						}], a.success(l)) : a?.fail && a.fail({
						errCode: b.data.infocode,
						errMsg: b.data.info
					})
				},
				fail: function(b) {
					a.fail({
						errCode: "0",
						errMsg: b.errMsg || ""
					})
				}
			})
		}
		var b = this;
		a.location ? c(a.location) : b.getWxLocation(a, function(a) {
			c(a)
		})
	}
	AMapWX.prototype.getWeather = function(a) {
		function d(d) {
			var e = "base";
			a.type && "forecast" == a.type && (e = "all"), uni.request({
				url: "https://restapi.amap.com/v3/weather/weatherInfo",
				data: {
					key: b.key,
					city: d,
					extensions: e,
					s: c.s,
					platform: c.platform,
					appname: b.key,
					sdkversion: c.sdkversion,
					logversion: c.logversion
				},
				method: "GET",
				header: {
					"content-type": "application/json"
				},
				success: function(b) {
					function c(a) {
						var b = {
							city: {
								text: "城市",
								data: a.city
							},
							weather: {
								text: "天气",
								data: a.weather
							},
							temperature: {
								text: "温度",
								data: a.temperature
							},
							winddirection: {
								text: "风向",
								data: a.winddirection + "风"
							},
							windpower: {
								text: "风力",
								data: a.windpower + "级"
							},
							humidity: {
								text: "湿度",
								data: a.humidity + "%"
							}
						};
						return b
					}
					var d, e;
					b.data.status && "1" == b.data.status ? b.data.lives ? (d = b
							.data.lives, d && d.length > 0 && (d = d[0], e = c(
								d), e["liveData"] = d, a.success(e))) : b.data
						.forecasts && b.data.forecasts[0] && a.success({
							forecast: b.data.forecasts[0]
						}) : a.fail({
							errCode: b.data.infocode,
							errMsg: b.data.info
						})
				},
				fail: function(b) {
					a.fail({
						errCode: "0",
						errMsg: b.errMsg || ""
					})
				}
			})
		}

		function e(e) {
			uni.request({
				url: "https://restapi.amap.com/v3/geocode/regeo",
				data: {
					key: b.key,
					location: e,
					extensions: "all",
					s: c.s,
					platform: c.platform,
					appname: b.key,
					sdkversion: c.sdkversion,
					logversion: c.logversion
				},
				method: "GET",
				header: {
					"content-type": "application/json"
				},
				success: function(b) {
					var c, e;
					b.data.status && "1" == b.data.status ? (e = b.data.regeocode, e
						.addressComponent ? c = e.addressComponent.adcode :
						e.aois && e.aois.length > 0 && (c = e.aois[0].adcode), d(c)
					) : a.fail({
						errCode: b.data.infocode,
						errMsg: b.data.info
					})
				},
				fail: function(b) {
					a.fail({
						errCode: "0",
						errMsg: b.errMsg || ""
					})
				}
			})
		}
		var b = this,
			c = b.requestConfig;
		a.city ? d(a.city) : b.getWxLocation(a, function(a) {
			e(a)
		})
	}
	AMapWX.prototype.getPoiAround = function(a) {
		function d(d) {
			var e = {
				key: b.key,
				location: d,
				s: c.s,
				platform: c.platform,
				appname: b.key,
				sdkversion: c.sdkversion,
				logversion: c.logversion
			};
			a.querytypes && (e["types"] = a.querytypes), a.querykeywords && (e[
				"keywords"] = a.querykeywords), uni.request({
				url: "https://restapi.amap.com/v3/place/around",
				data: e,
				method: "GET",
				header: {
					"content-type": "application/json"
				},
				success: function(b) {
					var c, d, e, f;
					if (b.data.status && "1" == b.data.status) {
						if (b = b.data, b && b.pois) {
							for (c = [], d = 0; d < b.pois.length; d++) e = 0 == d ? a
								.iconPathSelected : a.iconPath, c.push({
									latitude: parseFloat(b.pois[d].location.split(",")[
										1]),
									longitude: parseFloat(b.pois[d].location.split(",")[
										0]),
									iconPath: e,
									width: 22,
									height: 32,
									id: d,
									name: b.pois[d].name,
									address: b.pois[d].address
								});
							f = {
								markers: c,
								poisData: b.pois
							}, a.success(f)
						}
					} else a.fail({
						errCode: b.data.infocode,
						errMsg: b.data.info
					})
				},
				fail: function(b) {
					a.fail({
						errCode: "0",
						errMsg: b.errMsg || ""
					})
				}
			})
		}
		var b = this,
			c = b.requestConfig;
		a.location ? d(a.location) : b.getWxLocation(a, function(a) {
			d(a)
		})
	}
	AMapWX.prototype.getStaticmap = function(a) {
		function f(b) {
			c.push("location=" + b), a.zoom && c.push("zoom=" + a.zoom), a.size && c
				.push("size=" + a.size), a.scale && c.push(
					"scale=" + a.scale), a.markers && c.push("markers=" + a.markers), a
				.labels && c.push("labels=" + a.labels), a.paths &&
				c.push("paths=" + a.paths), a.traffic && c.push("traffic=" + a.traffic);
			var e = d + c.join("&");
			a.success({
				url: e
			})
		}
		var e, b = this,
			c = [],
			d = "https://restapi.amap.com/v3/staticmap?";
		c.push("key=" + b.key), e = b.requestConfig, c.push("s=" + e.s), c.push(
				"platform=" + e.platform), c.push("appname=" +
				e.appname), c.push("sdkversion=" + e.sdkversion), c.push("logversion=" +
				e.logversion), a.location ? f(a.location) :
			b.getWxLocation(a, function(a) {
				f(a)
			})
	}
	AMapWX.prototype.getInputtips = function(a) {
		var b = this,
			c = b.requestConfig,
			d = {
				key: b.key,
				s: c.s,
				platform: c.platform,
				appname: b.key,
				sdkversion: c.sdkversion,
				logversion: c.logversion
			};
		a.location && (d["location"] = a.location), a.keywords && (d["keywords"] = a
				.keywords), a.type && (d["type"] = a.type),
			a.city && (d["city"] = a.city), a.citylimit && (d["citylimit"] = a
				.citylimit), uni.request({
				url: "https://restapi.amap.com/v3/assistant/inputtips",
				data: d,
				method: "GET",
				header: {
					"content-type": "application/json"
				},
				success: function(b) {
					b && b.data && b.data.tips && a.success({
						tips: b.data.tips
					})
				},
				fail: function(b) {
					a.fail({
						errCode: "0",
						errMsg: b.errMsg || ""
					})
				}
			})
	}
	AMapWX.prototype.getDrivingRoute = function(a) {
		var b = this,
			c = b.requestConfig,
			d = {
				key: b.key,
				s: c.s,
				platform: c.platform,
				appname: b.key,
				sdkversion: c.sdkversion,
				logversion: c.logversion
			};
		a.origin && (d["origin"] = a.origin),
			a.destination && (d["destination"] = a.destination),
			a.strategy && (d["strategy"] = a.strategy),
			a.waypoints && (d["waypoints"] = a.waypoints),
			a.avoidpolygons && (d["avoidpolygons"] = a.avoidpolygons),
			a.avoidroad && (d["avoidroad"] = a.avoidroad),
			uni.request({
				url: "https://restapi.amap.com/v3/direction/driving",
				data: d,
				method: "GET",
				header: {
					"content-type": "application/json"
				},
				success: function(b) {
					b && b.data && b.data.route && a.success({
						paths: b.data.route.paths,
						taxi_cost: b.data.route.taxi_cost || ""
					})
				},
				fail: function(b) {
					a.fail({
						errCode: "0",
						errMsg: b.errMsg || ""
					})
				}
			})
	}
	AMapWX.prototype.getWalkingRoute = function(a) {
		var b = this,
			c = b.requestConfig,
			d = {
				key: b.key,
				s: c.s,
				platform: c.platform,
				appname: b.key,
				sdkversion: c.sdkversion,
				logversion: c.logversion
			};
		a.origin && (d["origin"] = a.origin), a.destination && (d["destination"] = a
			.destination), uni.request({
			url: "https://restapi.amap.com/v3/direction/walking",
			data: d,
			method: "GET",
			header: {
				"content-type": "application/json"
			},
			success: function(b) {
				b && b.data && b.data.route && a.success({
					paths: b.data.route.paths
				})
			},
			fail: function(b) {
				a.fail({
					errCode: "0",
					errMsg: b.errMsg || ""
				})
			}
		})
	}
	AMapWX.prototype.getTransitRoute = function(a) {
		var b = this,
			c = b.requestConfig,
			d = {
				key: b.key,
				s: c.s,
				platform: c.platform,
				appname: b.key,
				sdkversion: c.sdkversion,
				logversion: c.logversion
			};
		a.origin && (d["origin"] = a.origin), a.destination && (d["destination"] = a
			.destination), a.strategy && (d[
			"strategy"] = a.strategy), a.city && (d["city"] = a.city), a.cityd && (
			d["cityd"] = a.cityd), uni.request({
			url: "https://restapi.amap.com/v3/direction/transit/integrated",
			data: d,
			method: "GET",
			header: {
				"content-type": "application/json"
			},
			success: function(b) {
				if (b && b.data && b.data.route) {
					var c = b.data.route;
					a.success({
						distance: c.distance || "",
						taxi_cost: c.taxi_cost || "",
						transits: c.transits
					})
				}
			},
			fail: function(b) {
				a.fail({
					errCode: "0",
					errMsg: b.errMsg || ""
				})
			}
		})
	}
	AMapWX.prototype.getRidingRoute = function(a) {
		var b = this,
			c = b.requestConfig,
			d = {
				key: b.key,
				s: c.s,
				platform: c.platform,
				appname: b.key,
				sdkversion: c.sdkversion,
				logversion: c.logversion
			};
		a.origin && (d["origin"] = a.origin), a.destination && (d["destination"] = a
			.destination), uni.request({
			url: "https://restapi.amap.com/v4/direction/bicycling",
			data: d,
			method: "GET",
			header: {
				"content-type": "application/json"
			},
			success: function(b) {
				b && b.data && b.data.data && a.success({
					paths: b.data.data.paths
				})
			},
			fail: function(b) {
				a.fail({
					errCode: "0",
					errMsg: b.errMsg || ""
				})
			}
		})
	}

	export default {
		name: 'amap',
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
				this.amapPlugin = new AMapWX({
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
				})
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
			getRegeo(coordinate, fn) {
				this.lat = coordinate[1];
				this.long = coordinate[0];
				this.changeMarkers();
				this.amapPlugin.getRegeo({
					location: this.long + ',' + this.lat,
					success: (data) => {
						const {
							regeocodeData
						} = data[0];
						this.addressMap = regeocodeData.formatted_address;
						this.regeocodeData = regeocodeData;
						this.$emit('changeMarker', this.getConfirmData());
						fn && fn(regeocodeData.pois);
					}
				});
			},
			//搜索关键字
			searchMap() {
				this.getInputtips();
			},
			getCurrentSingleLocation(data) {
				let coordinate = data.location.split(',');
				this.searchValue = data.name;
				this.getRegeo(coordinate);
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