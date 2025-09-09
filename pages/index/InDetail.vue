<!-- 详细 -->
<template>
	<view class="max">
		<!--  -->
		<up-loading-icon v-if="data.length==0" style="flex: 1;height: 100vh;font-weight: bold;" size="40" mode="semicircle" text="加载中"></up-loading-icon>
		<view class="heard">
			<img class="heard_img lazy-img":src="placeholder" :data-src="data?.BookImg" :alt="name" />
			<view class="heard_title">
				<text class="title">{{data?.BookName}}</text>
				<br />
				<text class="auther">{{data?.BookAuthor}}</text>
			</view>
			
		</view>
		<view class="indetail">
			<view class="indetail_list big">
				<text class="wordage">{{data?.BookWordage}}</text>
				<text class="wenku">{{data?.BookOver}}</text>
				<text class="">{{data?.SumRecommend}}</text>
			</view>
			<view class="indetail_list mini">
				<text class="isend">{{data?.BookLastTime}}</text>
				<text class="isAnimation">{{data?.AnimationBased}}</text>
				<text class="circumference">{{data?.WeekRecommend}}</text>
			</view>
		</view>
		<view class="synopsis">
			<view class="synopsis_title">
				<text class="brief_introduction" >简介</text>
				<view v-for="(item,index) in data?.BookTags" :key="index">
					<text class="brief_tap">{{item}}</text>
				</view>
			</view>
			<view class="synopsis_content" scroll-y=true>
				<text style="font-size: 14px;padding: 5px;">&nbsp;&nbsp;&nbsp;&nbsp;{{data?.BookSynopsis[0]}}</text>
			</view>
		</view>
		<view class="but">
			<button @click="ToCatalogue()" class="start">开始阅读</button>	
			<button @click="changeBook()" :style="{backgroundColor:btnColor}" class="want">{{type}}</button>
		</view>
	</view>
</template>

<script setup>
	import { ref ,onMounted,onUnmounted,nextTick} from "vue";
	import { onLoad } from '@dcloudio/uni-app';
	import axios from 'axios'
	import { useCounterBook } from '@/stores/counter'
	const type=ref("想看")
	const counter = useCounterBook()
	const SendingBackendData=ref({"Booklink":"BookUrl"})
	const data=ref();
	const placeholder=ref("/static/placeholder.jpg")
	let observer = null
	const decodedurl=ref()
	const btnColor=ref('#66ccff')
	onLoad((options) => {
	   decodedurl.value= decodeURIComponent(options.url);
	  SendingBackendData.value.Booklink="https://www.linovelib.com"+decodedurl.value;
	  console.log('接收的书籍名称：', SendingBackendData.value);
	});
	onMounted(async () => {
		data.value=''
		await ifshelf()
		//检查是否在书架上
		await getData()
		nextTick(() => {
		    lazyloading();
		});
	});
	const ifshelf=async()=>{
		console.log("执行ifshelf函数，decodedurl.value：",decodedurl.value)
		let shelf=counter.ifshelf(decodedurl.value)//加入书架true 没有加入flase
		console.log("判断！！",shelf)
		if(shelf==true){
			type.value="移除"
			btnColor.value='#fcebeb'
		}else{
			type.value="想看"
			btnColor.value='#66ccff'
		}
	}
	const changeBook=()=>{
		if(type.value!="移除"){
			//添加小说到书架,即找到相关信息存储到paini
			console.log("addBook函数外前")
			counter.addBook(data.value.BookName,data.value.BookImg,decodedurl.value)
			console.log("addBook函数外后")
			//更改文字和颜色
			type.value="移除"
			btnColor.value='#fcebeb'
		}else{
			type.value="想看"
			btnColor.value='#66ccff'
			counter.delBook(decodedurl.value)
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
		  // 封装uni.request为Promise，方便使用await
		  const [error, res] = await new Promise((resolve) => {
		    uni.request({
		      url: counter.url + '/Detailed', // 请求地址
		      method: 'POST', // 请求方法为POST
		      data: SendingBackendData.value, // 要发送的数据（对应axios的第二个参数）
		      header: { // 请求头（对应axios的headers配置）
		        'Content-Type': 'application/json',
		        'Accept': 'application/json'
		      },
		      success: (response) => resolve([null, response]), // 成功回调
		      fail: (err) => resolve([err, null]) // 失败回调
		    })
		  });
		
		  // 处理请求失败
		  if (error) {
		    console.error("There was an error fetching the data!", error);
		    return;
		  }
		
		  // 处理响应数据（与原逻辑一致）
		  console.log("response:", res);
		  if (res.data.status) {
		    console.log("response.data:", res.data);
		    data.value = res.data.data;
		    console.log("data.value:", data.value);
		  }
		  lazyloading();
		} catch (err) {
		  console.error("Request processing error:", err);
		}
		// switching(data.value)
		// try {
		// 	const response = await axios.post(counter.url+'/Detailed', SendingBackendData.value, {
		// 	      headers: {
		// 	        'Content-Type': 'application/json',
		// 	        'Accept': 'application/json'
		// 	      }
		// 	    })
		//     console.log("response:",response)
		//     // 正确解析响应数据
		// 	if (response.data.status) {
		// 		console.log("response.data:",response.data) 
		// 		data.value=response.data.data
		// 		console.log("data.value:",data.value) 
		//     }
		// 	lazyloading();
		// } catch (error) {
		// 	console.error("There was an error fetching the data!", error);
		// }
	};
	const ToCatalogue=()=>{
		const url=SendingBackendData.value.Booklink.substring(0, SendingBackendData.value.Booklink.length-5)+'/catalog'
		console.log('url=',url)
		const encodedurl = encodeURIComponent(url);
		console.log('data.BookName=',data.value.BookName)
		const encodedname = encodeURIComponent(data.value.BookName);
		uni.navigateTo({
			url: `catalogue?url=${encodedurl}&name=${encodedname}`
		});
	}
	onUnmounted(() => {
	  observer?.disconnect()
	})
</script>

<style>
	.synopsis_content{
		flex: 1;
		padding: 3px;
		/* background-color: aqua; */
		overflow: hidden;         /* 隐藏溢出内容 */
		text-overflow: ellipsis;
	}
	.brief_tap{
		/* margin: 5px; */
		padding: 5px;
		color: #828282;
		background-color: gainsboro;
		border-radius: 5px;
	}
	.brief_introduction{
		margin: 5px;
		padding: 5px;
		font-weight: bold;
		font-size: 20px;
		background-color: #66ccff;
		border-radius: 10px;
	}
	.synopsis_title{
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		align-items: center;
		/* background-color: bisque; */
		padding-bottom: 10px;
	}
	.want{
		width: 25%;
		margin: 10px 5px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}
	.start{
		width: 70%;
		margin: 10px 5px;
		background-color: #66ccff;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}
	.but{
		
		display: flex;
		height: 70px;
	    z-index: 10;
		    /* 新增定位属性 */
		position: fixed;
		bottom: 0;
	    left: 0;
	    right: 0;
		    /* 适配移动端安全区域 */
		padding-bottom: -10px;
		    /* 确保横向铺满屏幕 */
		width: 100%;
		    /* 添加背景色防止内容穿透 */
		background: white;
		 
	}
	.synopsis{
		/* min-height: 250px; */
		/* background-color: pink; */
		flex: 1;
		padding: 5px;
	}
	.big{
		font-size: 17px;
		font-weight: bold;
	}
	.mini{
		font-size: 14px;
		color: #80878a;
	}
	.indetail{
		margin-top: 20px;
	}
	.indetail_list>text{
		width: 100%;
		padding: 5px;
		/* font-weight: bold; */
	}
	.indetail_list{
		display: flex;
		text-align: center;
		/* background-color: aqua; */
	}
	.heard_title {
		margin-top: 10px;
	}
	.title{
		font-weight: bold;
		font-size: 20px;
		text-align: center;
	}
	.auther{
		font-size: 18px;
	}
	.max{
		position: relative;
		padding-bottom: 70px;
		padding-top: 5px;
		/* background-color: antiquewhite; */
		background: linear-gradient(to bottom, #66ccff 0%,white 70%,white 100%)
	}
	.heard{
		text-align: center;
		margin-top: 10px;
		
	}
	.heard_img{
		width: 60%;
		border-radius: 10px;
	}
</style>