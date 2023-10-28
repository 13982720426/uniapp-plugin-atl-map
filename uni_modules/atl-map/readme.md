# atl-map

简易好用的微信小程序地图定位，封装腾讯、高德地图sdk，atl-map开箱即用

## 使用前准备

### 申请高德或者腾讯地图key
- 高德地图测试key 申请地址 https://console.amap.com/dev/key/app 服务平台选择微信小程序
- 腾讯地图测试key 申请地址 https://lbs.qq.com/dev/console/application/mine  启用产品选择微信小程序

配置文件 `manifest.json` 微信小程序需要开启定位权限配置`requiredPrivateInfos`和`permission`
```json
"mp-weixin": {
	"appid": "xxxx",
	"usingComponents": true,
	"requiredPrivateInfos": ["getLocation"],开启定位权限
	"permission": {
		"scope.userLocation": {
			"desc": "开启定位权限"
		}
	}
}
```
## 基本使用

### 测试代码
```vue
<template>
	<view class="">
		<view class="">地址：{{ title }}</view>
		<view class="">详细地址：{{ address }}</view>
		<view class="" style="width: 90vw; margin: 5vw">
			<button @click="onClick">点击打开地图</button>
		</view>
		<atl-map :disable="disable" v-if="show" :longitude="longitude" :latitude="latitude" :marker="marker" :mapKey="mapKey" :mapType="mapType" @confirm="confirm"></atl-map>
	</view>
</template>

<script>
	
export default {
	data() {
		return {
			disable: false,
			show: false,
			title: '',
			address: '',
			longitude: '',
			latitude: '',
			marker: {
				id: 1,
				height: 50,
				width: 40
				// iconPath: '/static/comm/position.png' // 自定义图片
			},
			// mapKey: '42795f9a59358dxxxxxxxxx',//高德地图测试key
			// mapType: 'amap' //高德地图
			mapType: 'tmap', //默认腾讯地图
			mapKey: 'ZNJBZ-E6RHJ-EV3F2-DL73K-ARTTH-3EBRZ' //腾讯地图测试key 每日限量测试 请自行申请
		};
	},
	onLoad() {},
	methods: {
		onClick() {
			this.show = true;
		},
		confirm(e) {
			console.log(22, e);
			if (e) {
				this.longitude = e.longitude;
				this.latitude = e.latitude;
				this.title = e.title;
				this.address = e.address;
			}
			this.show = false;
		}
	}
};
</script>

```
### 预览

![image](http://imgs.jackhoo.icu/map2.png) ![image](http://imgs.jackhoo.icu/map3.png)

## API

|  参数   | 说明  | 类型 | 默认值 |
|  ----  | ----  | ---- | ---- |
| mapKey | `必填`，地图KEY | `String`| 腾讯测试key(每日限量) |
| mapType | `非必填`，地图类型(腾讯:'tmap',高德:'amap') | `String`| tmap |
| longitude | `非必填`，经度 | `String、Number`| 当前定位 |
| latitude | `非必填`，纬度 | `String、Number`| 当前定位 |
| marker | `非必填`，点位配置,只支持一个点位| `Object`| map组件默认值 |
| disable | `非必填`，确定按钮是否禁用 | `Boolean`| false |
| confirm | `非必填`，点击确定事件 | `Function`| 返回值`{title:'标题',latitude:'纬度',longitude:'经度',address:'详细地址',...高德/腾讯地图其他参数}`|

## 注意事项

1. 腾讯地图测试key 每日限量测试 请自行申请
2. 目前只支持微信小程序，其他平台请下载源码执行测试修改
3. 本项目使用vue2语法，vue3的OptionsAPI也是支持的