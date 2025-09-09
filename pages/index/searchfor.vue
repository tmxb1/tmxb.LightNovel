<!-- 搜索 -->
<template>
	<view  class="searchfor">
		<up-loading-icon v-show="Searching==true" style="flex: 1;font-weight: bold;" size="40" mode="semicircle" text="加载中"></up-loading-icon>

			<view v-if="data.length != 0" class="count_view" v-for="(item,index) in data" :key="index">
				<view @click="ToInDetail(item.BookLink)" class="count_container">
					<img class="count_img lazy-img" :src="placeholder" :data-src="item.BookImg" :alt="item.BookName">
					<view class="text-container">
						<text class="title">{{item.BookName}}</text>
						<text class="auther">{{item.BookAuther}}</text>
					</view>
				</view>
			</view>
			<view v-else class="nodata">
				<text class="nodata_text">未找到书籍</text>
			</view>
		
	</view>
</template>

<script setup>
	import{ref,onMounted,onUnmounted,defineProps,watch,nextTick} from 'vue'
	import axios from 'axios';
	import { useCounterBook } from '@/stores/counter'
	const counter = useCounterBook()
	const props = defineProps({
		searchData: {
			type: String,
			required: true,
	    },
	});
	const Searching=ref(false)
	const searchText = ref(props.searchData);
	const data=ref([]);
	const placeholder=ref("/static/placeholder.jpg")
	let observer = null
	onMounted(async() => {
		Searching.value=true
		await getData()
		nextTick(() => {
		    lazyloading();
		});
	});
	const ToInDetail=(url)=>{
		console.log('发送的url：', url);
		const encodedurl = encodeURIComponent(url);
		uni.navigateTo({
			url: `InDetail?url=${encodedurl}`
		});
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
		data.value = [];
		lazyloading();
		console.log("searchText:",searchText)
		const params = {
		  search_input: searchText.value
		};
		
		try {
		  // 拼接查询参数（模拟axios的params自动拼接功能）
		  const queryString = `search_input=${encodeURIComponent(params.search_input)}`;
		  const requestUrl = `${counter.url}/Search?${queryString}`;
		
		  // 封装uni.request为Promise
		  const [error, res] = await new Promise((resolve) => {
		    uni.request({
		      url: requestUrl, // 带查询参数的完整URL
		      method: 'GET', // GET请求方法
		      success: (response) => resolve([null, response]),
		      fail: (err) => resolve([err, null])
		    });
		  });
		
		  // 处理请求失败
		  if (error) {
		    console.error("There was an error fetching the data!", error);
		    return;
		  }
		
		  // 解析响应数据（与原逻辑一致）
		  console.log("response:", res);
		  if (res.data.status) {
		    Searching.value = false;
		    console.log("response.data.data:", res.data.data);
		    data.value = res.data.data;
		  }
		} catch (err) {
		  console.error("Request processing error:", err);
		}
		// const params = {
		//   search_input: searchText.value
		// };
		// try {
		//     const response = await axios.get(counter.url+'/Search',{params})
		//     console.log("response:",response)
		//     // 正确解析响应数据
		// 	if (response.data.status) {
		// 		Searching.value=false
		// 		console.log("response.data.data:",response.data.data)
		// 		data.value=response.data.data
		//     }
		// } catch (error) {
		// 	console.error("There was an error fetching the data!", error);
		// }
	};
	const switching=(it)=>{
		console.log("it前",it)
		data.value=it.map(item => {
		  // 保留原始数据的所有字段，仅重写目标字段
		  return {
		    ...item,
		    // 1. 替换 BookImg 为 "123.gpj"（保持原数组格式）
		    BookImg: [placeholder.value],
		    // 2. 替换 BookAuthor 为 "加载中"（保持原数组格式）
		    BookName: ["加载中"],
		    // 3. 替换 Bookname 为 "加载中"（保持原数组格式）
		    BookAuther: ["加载中"]
		  };
		});
		console.log("it后",data.value)
	}
	watch(
		() => props.searchData,
		(newVal) => {
			console.log('子组件接收的搜索词更新：', newVal);
			searchText.value = newVal; // 同步搜索词
			getData(); // 重新请求数据
		},
		{ immediate: true } // 初始挂载时立即执行一次
	);
	onUnmounted(() => {
		if (observer) {
			observer.disconnect();
			observer = null;
		}
	});

</script>
<style>
	.nodata{
		width: 100vw;
	}
	.nodata_text{
		width: 100%;
		text-align: center;
		font-weight: bold;
		font-size: 20px;
	}
	.text-container{
		text-align: center;
	}
	.auther{
		font-weight: bold;
		font-size: 13px;
		width: 100%;
		text-align: center;
		/* background-color: aqua; */
	}
	.title {
	    font-size: 14px;
	    text-align: left; /* 对应 textAlign(TextAlign.Start) */
	    display: -webkit-box;
	    -webkit-box-orient: vertical;
	    -webkit-line-clamp: 2; /* 对应 maxLines(2) */
	    overflow: hidden;
		min-height: 30px;
	    /* text-overflow: ellipsis; /* 对应 textOverflow({ overflow: TextOverflow.Ellipsis }) */ 
	}
	.count_img{
		width: 100%;
		height: 150px;
		object-fit: cover;
		border-radius:10px
	}
	.count_view{
		width: calc(33.33% - 4px); /* 调整宽度计算 */
		display: flex;
		flex-direction: column; /* 垂直排列 */
		align-items: center; /* 内容居中 */
		box-sizing: border-box;
		padding: 3px;
		border: 1px solid #eee;
		border-radius: 8px;
	}
	.searchfor{
		flex: 1;
		overflow-y: auto;
		padding: 5px;
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start; /* 新增：内容顶部对齐 */
		gap: 6px; /* 新增：统一控制项目间距 */
		height: 100%;
	}
</style>