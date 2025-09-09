<!-- 目录 -->
<template>
	<view class="catalogue">
		<up-loading-icon v-if="data.length==0" style="flex: 1;height: 100vh;font-weight: bold;" size="40" mode="semicircle" text="加载中"></up-loading-icon>
		<view class="title">
			<text>{{title}}</text>
		</view>
		<view  v-for="(item,index) in data" :key="index">
			<view class="scroll">
				<view class="scroll_titile">
					<text class="scroll_titile_text">{{item.NovelVolumeTitle}}</text>
					<img class="scroll_img lazy-img" :src="placeholder" :data-src="item.Imgurl" :alt="item.NovelVolumeTitle" />
					<!-- src="/static/placeholder.jpg" -->
				</view>
				<view class="scroll_list_container">
					<view style="padding: 5px;" v-for="(items,indexs) in item.Title" :key="indexs">
						<text @click="ToRead(items.TitleLink)">{{items.TitleName}}</text>
						<hr style="border: none;margin-top: 2px; height: 0.5px; background-color: #c1c1c1;">
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import{ref,onMounted,onUnmounted,nextTick}from'vue'
	import axios from 'axios';
	import { onLoad } from '@dcloudio/uni-app';
	import { useCounterBook } from '@/stores/counter'
	const counter = useCounterBook()
	const title=ref("我们不可能成为恋人！绝对不行。 (※似乎可行？)")
	const url=ref()
	const data=ref([])
	const placeholder=ref("/static/placeholder.jpg")
	let observer = null
	onLoad((options) => {
	  url.value = decodeURIComponent(options.url);
	  title.value = decodeURIComponent(options.name);
	  // SendingBackendData.value.Booklink="https://www.linovelib.com"+decodedurl;
	  console.log('接收的url：', url.value);
	  console.log('接收的name：', title.value);
	});
	onMounted(async () => {
		data.value=''
		await getData()
		nextTick(() => {
		    lazyloading();
		});
	})
	const lazyloading=()=>{
		const images = document.querySelectorAll('.lazy-img');
		  
		  observer = new IntersectionObserver((entries) => {
		    entries.forEach(entry => {
		      if (entry.isIntersecting) {
		        const img = entry.target;
		        img.src = img.dataset.src;
		        observer.unobserve(img);
		      }
		    });
		  });
		  // 遍历所有图片元素进行观察
		  images.forEach(img => observer.observe(img));
	}
	const getData=async()=>{
		try {
		  // 封装uni.request为Promise以支持await
		  const [error, res] = await new Promise((resolve) => {
		    uni.request({
		      url: `${counter.url}/Directory?url=${url.value}&myaddress=${counter.url}`, // 带查询参数的请求地址
		      method: 'GET', // GET请求方法
		      success: (response) => resolve([null, response]), // 成功回调
		      fail: (err) => resolve([err, null]) // 失败回调
		    })
		  });
		
		  // 处理请求失败
		  if (error) {
		    console.error("There was an error fetching the data!", error);
		    return;
		  }
		
		  // 解析响应数据（与原逻辑一致）
		  console.log("response:", res);
		  if (res.data.status) {
		    console.log("response.data.data:", res.data.data);
		    data.value = res.data.data; // 赋值数据
		  }
		} catch (err) {
		  console.error("Request processing error:", err);
		}
		// try {
		//     const response = await axios.get(`${counter.url}/Directory?url=${url.value}`)
		//     console.log("response:",response)
		//     // 正确解析响应数据
		// 	if (response.data.status) {
		//       console.log("response.data.data:",response.data.data) 
		// 	  data.value=response.data.data
		//     }
		// } catch (error) {
		// 	console.error("There was an error fetching the data!", error);
		// }
	}
	const ToRead=(url)=>{
		const encodedurl = encodeURIComponent(url);
		const encodedtitle = encodeURIComponent(title.value);
		uni.navigateTo({
			url: `read?url=${encodedurl}&title=${encodedtitle}`
		});
	}
	onUnmounted(() => {
	  observer?.disconnect()
	})
</script>

<style>
	.scroll_titile_text{
		background-color: #66ccff;
		color:black;
		margin: 5px;
		padding: 8px;
		font-weight: bold;
		align-self:stretch;
		border-radius: 10px;	
	}
	.scroll_list_container {
			flex: 1; /* 占据剩余空间 */
			padding: 5px;
		}
	.scroll_img{
		width: 40%;
		object-fit: cover;
		padding: 5px;
		border-radius: 10px;
	}

	.scroll_titile{
		display: flex;
		font-weight: bold;
	}
	.scroll_piece{
		width: 20px;
		background-color: #66ccff;
		margin-right: 5px;
	}
	.scroll{
		margin: 5px;
		padding: 10px;
		background-color: #fafafa;
		margin-bottom: 20px;
	}
	.title{
		font-weight: bold;
		text-align: center;
		font-size: 22px;
		padding: 10px;
	}
</style>