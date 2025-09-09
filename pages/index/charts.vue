<!-- 排行榜 -->
<template>
	<view class="searchfor">
		<up-loading-icon v-if="data.length==0" style="flex: 1;height: 100vh;font-weight: bold;" size="40" mode="semicircle" text="加载中"></up-loading-icon>
		<view style="width: 100%;
		height: 100%;
		overflow-y: auto; /* 允许垂直滚动 */
		overflow-x: hidden; /* 禁止水平滚动 */
		-webkit-overflow-scrolling: touch;" class="">
			<div v-for="(item, index) in data" :key="index" class="category-container">
				<view class="onecharts">
				  <text style="text-align: left;font-size: 20px;" class="title">{{ item.title }}</text>
				  <view class="books" >
					<view v-for="(book, indexs) in item.list" :key="indexs" class="book-item">
					  <view class="onebook" @click="ToInDetail(book.Booklink)" >
						<img class="bookimg lazy-img" :src="placeholder" :data-src="book.ImgSrc" :alt="book.Bookname" >
						<text class="bookname" >{{ book.Bookname }}</text>
					  </view>
					</view>
				  </view>
				</view>
			</div>
		</view>
		
	  
	</view>

</template>

<script setup>
	import {ref,onMounted,onUnmounted,nextTick }from 'vue';
	import axios from 'axios';
	import { useCounterBook } from '@/stores/counter'
	const counter = useCounterBook()
	const data=ref([])
	const imgRef = ref(null)
	const placeholder=ref("/static/placeholder.jpg")
	let observer = null
	onMounted(async () => {
		data.value=''
		await getData()
		nextTick(() => {
		    lazyloading();
		});
	});
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
		  // 使用uni.request发送GET请求
		  const [error, res] = await new Promise((resolve) => {
		    uni.request({
		      url: counter.url + '/top', // 请求地址
		      method: 'GET', // 请求方法
		      success: (response) => resolve([null, response]), // 成功回调
		      fail: (err) => resolve([err, null]) // 失败回调
		    })
		  });
		
		  // 处理请求失败的情况
		  if (error) {
		    console.error("There was an error fetching the data!", error);
		    return;
		  }
		
		  // 打印响应数据并解析
		  console.log("response:", res);
		  // 检查响应数据中的状态（根据实际接口返回结构调整）
		  if (res.data.status) {
		    console.log("response.data.data:", res.data.data);
		    data.value = res.data.data; // 赋值数据
		  }
		} catch (err) {
		  console.error("Request processing error:", err);
		}

		// try {
		//     const response = await axios.get(counter.url+'/top')
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
	const ToInDetail=(url)=>{
		console.log('发送的url：', url);
		const encodedurl = encodeURIComponent(url);
		uni.navigateTo({
			url: `InDetail?url=${encodedurl}`
		});
	}
	onUnmounted(() => {
	  observer?.disconnect()
	})
</script>
	

<style>
	.bookname{
		font-size: 13px;
		text-align: center;
		width: 120px;
		/* background-color: aquamarine; */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.onebook{
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.books{
		display: flex;
		flex-direction: row;
		overflow-x: auto;
		gap: 10px;
		padding: 10px;
	}
	.category-container {
			width: 100%;
			box-sizing: border-box;
		}
	.searchfor{
		width: 100%;
		overflow-y: auto;
		box-sizing: border-box;
		padding: 0;
		margin: 0;
		height:100vh;		
	}
	
	.bookimg{
		height: 170px;
		/* background-color: aqua; */
	}
	.onecharts{
		margin-bottom: 5px;
	}
	.title{
		padding-left: 10px;
		font-weight: bold;
		text-align: left;
	}
</style>