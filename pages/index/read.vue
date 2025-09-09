<!-- 阅读页面 -->
<template>
	<!--  -->
	<up-loading-icon v-show="data.length==0" style="flex: 1;height: 100vh;font-weight: bold;" size="40" mode="semicircle" text="加载中"></up-loading-icon>
	<view style="height: 100v;" class="">
		<view class="head">
			<text class="head_home" @click="ToHome()">首页</text>
			<!-- <text class="progression">></text> -->
			<text class="head_text" @click="ToBook()">{{bookname}}</text>
			<text class="progression">></text>
			<text class="head_text" @click=" uni.navigateBack({ delta: 1 });">{{data?.content.NovelVolumes}}</text>
		</view>
		<view class="count">
			<view class="title">
				 {{data?.content.title}}
			</view>
			
			<view class="content">
				<!--  -->
				<div id="count" class="content-container" v-html="data?.content.content"></div>
			</view>
		</view>
		<view class="tap">
			<view class="tap_view">
				<text class="topage" @click="ToPrevious(data?.roust[0].previous)">{{data?.roust[0].previous.text}}</text>
				<!-- <text v-else class="">&nbsp;</text> -->
			</view>
			
			<text class="catalogue" @click=" uni.navigateBack({ delta: 1 });">目录</text>
			<view class="tap_view">
				<text  class="topage" @click="ToNext(data?.roust[0].next)">{{data?.roust[0].next.text}}</text>
				<!-- <text v-else class="">&nbsp;</text> -->
			</view>
		</view>
	</view>
	
</template>

<style>
	.head_home{
		font-size: 16px;
		vertical-align: bottom;
	}
	.count{
		padding: 6px;
		flex: 1;
	}
	.topage{
		border: 1px solid #66ccff;
		padding:4px;
		border-radius: 10px;
	}
	.tap_view{
		flex: 1;
		text-align: center;
	}
	
	.tap{
		display: flex;
		padding: 10px;
		padding-bottom: 20px;
		padding-top: 20px;
		background-color: rgba(0, 0, 0, 0.1);
	}
	 .content-container p {
	     text-indent: 2em;  /* 缩进2个字符（推荐使用em单位） */
		 font-size: 17px;
		 
	 }
	.title{
		font-weight: bold;
		text-align: center;
		font-size: 24px;
		padding: 10px;
	}
	.content{
		padding: 8px;
	}
	.head_text{
		display: inline-block;  /* 添加这个属性 */
		max-width: 40%;
		white-space: nowrap; /* 禁止换行 */
		overflow: hidden;    /* 隐藏溢出内容 */
		text-overflow: ellipsis; /* 显示省略号 */
		font-size: 16px;
		/* background-color: antiquewhite; */
		vertical-align: bottom;
	}
	.head{
		color: gray;
		padding: 8px;
	}
	.progression{
		height: 12px;
		/* font-size: 20px; */
		/* background-color: antiquewhite; */
		padding-left: 1px;
		padding-right: 1px;
	}
</style>

<script setup>
	import { ref,onMounted,onUnmounted,nextTick } from 'vue';
	import axios from 'axios';
	import { onLoad } from '@dcloudio/uni-app';
	import { useCounterBook } from '@/stores/counter'
	const bookname=ref()
	const url=ref();
	const data=ref();
	const counter = useCounterBook()
	let observer = null
	const formatPath = (path) => path.replace(/\/[^\/]*$/, "");
	const ToHome=()=>{
		uni.switchTab({
			url: `home`
		});
	}
	const Backtotop=()=>{
		
		uni.pageScrollTo({
		        scrollTop: 0, // 滚动到顶部位置
		        duration: 400 // 动画时长（毫秒），0为无动画
		      });
	}
	const ToBook=()=>{
		console.log(formatPath(url.value.slice(25)))
		const encodedurl = encodeURIComponent(formatPath(url.value.slice(25))+".html");
		uni.navigateTo({
			url: `InDetail?url=${encodedurl}`
		});
	}
	const ToPrevious=async(PreviousData)=>{
		Backtotop()
		if(PreviousData.text=="上一页"){
			url.value="https://www.linovelib.com"+PreviousData.link
			await getData()
			lazyloading();
		}else{
			uni.navigateBack({ delta: 1 });
		}
	}
	const ToNext=async(NextData)=>{
		Backtotop()
		console.log("点击了")
		if(NextData.text=="下一页"){
			url.value="https://www.linovelib.com"+NextData.link
			await getData()
			lazyloading();
		}else{
			ToBook()
		}
	}
	
	onLoad((options) => {
		bookname.value=decodeURIComponent(options.title)
		url.value = "https://www.linovelib.com"+decodeURIComponent(options.url);
		// SendingBackendData.value.Booklink="https://www.linovelib.com"+decodedurl;
		console.log('接收的url：', url.value);
		console.log('接收的title：', bookname.value);
	});
	onMounted(async () => {
		await getData()
		nextTick(() => {
		    lazyloading();
		});
		if (bookname && Array.isArray(counter.book)) {
			changeBooks()
		  } else {
		    console.warn("bookname未定义或book数组未正确初始化")
		  }
	})
	const changeBooks=()=>{
		//想看改在看
		if (!bookname) {
		    console.error("bookname未定义")
		    return
		  }
		  
		  console.log("changeBook函数：", bookname.value)
		  console.log("data.value.roust[0].next.text：", data.value.roust[0].next.text)
		  if(data.value.roust[0].next.text=="返回书页"){
			  counter.changeBook(bookname.value,3)
		  }else{
			  counter.changeBook(bookname.value,2)
		  }
		  
	}
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
		  data.value = ''; // 清空数据
		  
		  // 封装uni.request为Promise，支持await语法
		  const [error, res] = await new Promise((resolve) => {
		    uni.request({
		      url: `${counter.url}/get_Reading?url=${url.value}&myaddress=${counter.url}`, // 带查询参数的请求地址
		      method: 'GET', // 明确指定GET方法
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
		    console.log("response.data:", res.data);
		    data.value = res.data; // 赋值完整响应数据
		  }
		} catch (err) {
		  console.error("Request processing error:", err);
		}

		// try {
		// 	data.value=''
		//     const response = await axios.get(`${counter.url}/get_Reading?url=${url.value}&myaddress=${counter.url}`)
		//     console.log("response:",response)
		//     // 正确解析响应数据
		// 	if (response.data.status) {
		//       console.log("response.data:",response.data) 
		// 	  data.value=response.data
			  
		//     }
		// } catch (error) {
		// 	console.error("There was an error fetching the data!", error);
		// }
	}
	onUnmounted(() => {
	  observer?.disconnect()
	})
</script>

