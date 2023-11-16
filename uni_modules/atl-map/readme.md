# atl-map微信小程序高德、腾讯、百度地图

简易好用的微信小程序地图定位，封装腾讯、高德、百度地图sdk，atl-map开箱即用。

支持点击定位获取具体位置信息和经纬度，地图搜索，经纬度解析（逆地理编码：经纬度->地点描述），新增内容插槽支持自定义内容

[atl-map插件下载](https://ext.dcloud.net.cn/plugin?name=atl-map)

## 使用前准备
在平台创建应用并申请key
### 申请高德、腾讯、百度地图key
- 高德地图测试key 申请地址 `https://console.amap.com/dev/key/app` 服务平台选择微信小程序
- 腾讯地图测试key 申请地址 `https://lbs.qq.com/dev/console/application/mine`  启用产品选择微信小程序
- 百度地图测试key 申请地址 `https://lbs.baidu.com/apiconsole/key/create#/home`  应用类型选择微信小程序


**<span style="color: red"> 重要！！！ </span>**
配置文件 `manifest.json` 微信小程序需要开启定位权限配置`requiredPrivateInfos`和`permission`
```json
"mp-weixin": {
	"appid": "xxxx",
	"usingComponents": true,
	"requiredPrivateInfos": ["getLocation"],//开启定位权限
	"permission": {
		"scope.userLocation": {
			"desc": "开启定位权限"
		}
	}
}
```
## 基本使用

### vue模板
```vue
<template>
	<view class="">
		<view style="padding:20px">
			<view class="">地址：{{ title }}</view>
			<view class="">详细地址：{{ address }}</view>
			<view class="">经度：{{ longitude }}</view>
			<view class="">纬度：{{ latitude }}</view>
		</view>
		<view style="width: 90vw; margin: 5vw">
			<button @click="onClick">点击打开地图</button>
		</view>
		<atl-map :disable="disable" v-if="show" :longitude="longitude" :latitude="latitude" :marker="marker"
			:mapKey="mapKey" :mapType="mapType" @confirm="confirm">
			<template v-slot:content>
				<view style="position: absolute; bottom: 0;width: 100%;height: 24px; background-color: white;">
					<view style="display: flex;align-items: center; justify-content: center;">
						<image style="width: 24px; height: 24px;" :src="imageSrc">
						</image>
						<text> 内容插槽 </text>
					</view>
				</view>
			</template>
		</atl-map>
	</view>
</template>
```
### js代码
```javascript
export default {
	data() {
		return {
			disable: false,
			show: false,
			title: '',
			address: '',
			longitude: '',
			latitude: '',
			imageSrc: "/static/logo.png", //自定义图片
			marker: {
				id: 1,
				height: 50,
				width: 40
				// iconPath: '/static/comm/position.png'
			},
			// mapKey: '42795f9a59358dea58a8bxxx',//高德地图测试key
			// mapType: 'amap',
			// mapType: 'tmap',
			mapKey: 'ZNJBZ-E6RHJ-EV3F2-DL73K-ARTTH-3EBRZ' //腾讯地图测试key
			// mapKey: 'p5mGzPEt30bwv1yEkeQxxx', //百度地图
			// mapType: 'bmap'
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
```
### 预览

![预览图片1](https://raw.githubusercontent.com/13982720426/uniapp-plugin-atl-map/master/static/map2.png) ![预览图片1](https://raw.githubusercontent.com/13982720426/uniapp-plugin-atl-map/master/static/map3.png)

## API

### Props

|  参数		| 说明													| 类型		| 默认值																			|
|  -----	| ----------------										| ----		| ----------------																|
| mapKey	| <span style="color: red">`必填`</span>，地图KEY			| `String`	| 腾讯测试key(每日限量)															|
| mapType	| `非必填`，地图类型(腾讯:'tmap',高德:'amap',百度:'bmap')	| `String`	| tmap																			|
| longitude	| `非必填`，经度											| `String`	| 当前定位																		|
| latitude	| `非必填`，纬度											| `String`	| 当前定位																		|
| marker	| `非必填`，点位配置，只支持一个点位						| `Object`	| [uniapp map组件](https://uniapp.dcloud.net.cn/component/map.html#marker)默认值	|
| disable	| `非必填`，确定按钮是否禁用								| `Boolean`	| false																			|
| confirm	| `非必填`，点击确定事件									| `Function`| 返回值`{title,latitude,longitude,address,...高德/腾讯/百度地图其他参数}`			|

### Solt

|  名称		| 说明						| 其他																												|
|  -----	| ----------------			| -----																												|
| content	| 自定义content内容			| 使用的是uniapp [cover-view组件](https://uniapp.dcloud.net.cn/component/cover-view.html#cover-view)小程序注意事项请看官网	|


## 注意事项

1. [腾讯地图key](https://lbs.qq.com/dev/console/application/mine) 每日限量测试，请自行申请
2. 目前只支持微信小程序，其他平台请下载源码自行测试修改[github地址](https://github.com/13982720426/uniapp-plugin-atl-map.git)
3. 本项目使用vue2语法，vue3也支持
4. 微信小程序可能需要设置服务器域名，[登录小程序平台](https://mp.weixin.qq.com/wxamp/index/index) 服务器域名 -> request合法域名(填入用到的平台域名 `https://api.map.baidu.com;https://apis.map.qq.com;https://restapi.amap.com;`
5. 百度地图如果遇到接口返回 `APP Referer校验失败`，在[百度地图控制台](https://lbs.baidu.com/apiconsole/key/create#/home) 删除当前应用，重新创建应用并在 APP ID填 `*` [参考链接](https://blog.csdn.net/m0_73504190/article/details/131420444)
6. 如果点击地图没有查出数据，请查看微信开发者工具控制台网络(Network)，是否有查询接口返回`{"status":200,"message":"APP不存在，AK有误请检查再重试"}、{"status":"0","info":"INVALID_USER_KEY","infocode":"10001"}、{"status": 311, "message": "key格式错误"}`等类似响应数据，多数是地图key的问题，更多状态码查看对应地图平台状态码说明文档

## 优化

开发初衷是为了能够支持各平台地图，满足需要不同地图的开发者，但是这会产生其他问题。一个项目一般情况下只用一个平台，没有用到的组件和SDK导致代码冗余，占用内存

所以在设计的时候就将`<atl-map />`组件设计为一个入口组件，`<amap />`、`<tmap />`、`<bmap/>`为独立的子组件，可插拔。简而言之就是每个子组件可以单独使用，删除不用的组件可以减少体积。

推荐选定自己使用的平台之后，删除其他不用的组件和SDK。

比如：只用腾讯地图，删除其他地图组件，在`uni_modules/atl-map/components` 下，删除bmap、amap文件夹，修改入口文件`atl-map.vue`，只用`tmap`组件
```vue
<template>
	<view>
		<tmap :disable="disable" :longitude="longitude" :latitude="latitude" :mapKey="mapKey" :marker="marker" @confirm="confirm"></tmap>
	</view>
</template>
```
js只引入和注册`tmap`组件
```js
<script>
import tmap from '../tmap/tmap.vue';

	...
	components: {
		tmap,
	},
	...
<script />
```

这样就减少冗余代码，节省内存


## 更新记录
[查看日志](https://github.com/13982720426/uniapp-plugin-atl-map/blob/master/uni_modules/atl-map/changelog.md)