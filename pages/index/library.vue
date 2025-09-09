<!-- 分类 -->
<template>
	<view class="library">
		<!-- 顶部 -->
		<view class="top">
			<text class="top_text">分类</text>
		</view>
		<!-- 筛选-->
		<view class="filter">
			<!-- <button @click="showDrawer"   type="primary">筛选</button> -->
			<button @click="show = true"  size="mini" type="primary" class="filter_button">筛选</button>
		</view>
		
		<!-- 内容 -->
		<view v-if="issearchfor" id="count" scroll-y="true">
			<up-loading-icon v-show="data.length==0" style="flex: 1;height: 100%;font-weight: bold;" size="40" mode="semicircle" text="加载中"></up-loading-icon>
			<view class="count_view" v-for="(item,index) in data" :key="index">
					<view  @click="ToInDetail(item.Booklink[0])" class="count_container">
						<img class="count_img lazy-img" :src="placeholder" :data-src="item.ImgSrc" :alt="item.title">
						<view class="text-container">
							<text class="title">{{item.Bookname[0]}}</text>
							<text class="auther">{{item.BookAuthor[0]}}</text>
						</view>
					</view>
				</view>
		</view>
		<view v-if="!issearchfor" id="count" >
			<text class="no-book">未筛选出小说</text>
		</view>
		<!-- 导航 -->
		<view v-if="issearchfor" class="u-demo-block">
			<view @click="PreviousPage" class="btn-wrap">
				<text v-if="nowpage!=1" class="PaginationTitle">上一页</text>
				<!-- <text v-else >&nbsp;</text> -->
			</view>
			<view class="PaginationNumber">
				<text>{{nowpage}}</text>
				/
				<text>{{sonpage}}</text>
			</view>
			<view @click="NextPage" class="btn-wrap">
				<text v-if="nowpage!=sonpage" class="PaginationTitle">下一页</text>
				<!-- <text v-else>&nbsp;</text> -->
			</view>
		</view>
		<view>
			<up-popup :show="show" mode="right" closeIconPos="top-left"  @close="close" @open="open">
						<view class="scroll-view">
							<scroll-view class="scroll-view-box" scroll-y="true">
								<view v-for="(item,index) in closedata" :key="index">
									<view class="piece_view">
										<text class="piece">{{item.piece}}</text>
										
										<u-radio-group class="radio-group"
											v-if="!item.IsMultipleChoice" 
											v-model="SendingBackendData.TagSelection[index].options[0]" 
											placement="row" style="flex-wrap: wrap"
											@change="groupChange">
											<u-radio 
												:customStyle="{marginBottom: '8px'}" 
												v-for="(items, indexs) in item.list" 
												:key="indexs" 
												:label="items" 
												:name="items">
											</u-radio>
										</u-radio-group>
										
										<up-checkbox-group 
										    v-else
										    v-model="labelOptions"
										    placement="row" 
										    style="flex-wrap: wrap"
										>
										    <up-checkbox
										        :customStyle="{marginBottom: '4px'}"
												style="margin-left: 1px;margin-right: 6px;"
										        v-for="(items, indexs) in item.list"
										        :key="indexs"
										        :label="items"
										        :name="items"
												@change="(checked) => aloneChecked(items, checked)"
										    ></up-checkbox>
										</up-checkbox-group>
									</view>
								</view>
								<button class="close-btn" @click="close">确定</button>
								<!-- 重置图标 -->
							</scroll-view>
						</view>
					</up-popup>
		</view>
	</view>
</template>

<script setup>
	import {ref,onMounted,computed,nextTick,onUnmounted } from 'vue';
	import axios from 'axios';
	import { useCounterBook } from '@/stores/counter'
	const counter = useCounterBook()
	const placeholder=ref("/static/placeholder.jpg")
	const nowpage=ref(1)
	const sonpage=ref(1)
	const issearchfor=ref(true)
	const SendingBackendData=ref(
		{"TagSelection":[
			{ "type":"文库","options":["不限"]},
			{ "type":"标签","options":["不限"]},
			{ "type":"进度","options":["不限"]},
			{ "type":"动画","options":["不限"]},
			{ "type":"字数","options":["不限"]},
			{ "type":"更新","options":["不限"]},
			{ "type":"排序","options":["更新时间"]}
		],
		"nowpage":nowpage.value})
	const closedata=ref([
					{piece:'文库',
					IsMultipleChoice:false,
					list:['不限','日本轻小说','华文轻小说','Web轻小说','轻改漫画','韩国轻小说']},
					{piece:'标签',
					IsMultipleChoice:true,
					list:['不限','恋爱','后宫','校园','百合','转生','异世界','奇幻','冒险','欢乐向','女性视角','龙傲天','魔法','青春','性转','病娇','妹妹','青梅竹马','战斗','NTR','人外','大小姐','黑暗','悬疑','科幻','伪娘','战争','萝莉','复仇','斗智','异能','猎奇','轻文学','职场','经营','JK','机战','女儿','末日','犯罪','旅行','惊悚','治愈','推理','日本文学','游戏','耽美','美食','群像','大逃杀','音乐','格斗','热血','温馨','脑洞','恶役','JC','间谍','竞技','宅文化','同人']},
					{piece:'进度',
					IsMultipleChoice:false,
					list:['不限','新书上传','情节展开','精彩纷呈','接近尾声','已经完本']},
					{piece:'动画',
					IsMultipleChoice:false,
					list:['不限','已动画化','未动画化']},
					{piece:'字数',
					IsMultipleChoice:false,
					list:['不限','30万以下','30-50万','50-100万','100-200万','200万以上']},
					{piece:'更新',
					IsMultipleChoice:false,
					list:['不限','三日内','七日内','半月内','一月内']},
					{piece:'排序',
					IsMultipleChoice:false,
					list:['周点击','月点击','周推荐','月推荐','周鲜花','月鲜花','收藏数','更新时间','入库时间']},
				]);
	const show = ref(false);
	const data=ref([]);
	let observer = null
	const labelOptions = computed({
	  get: () => {
	    const tagConfig = SendingBackendData.value.TagSelection.find(t => t.type === "标签");
	    return tagConfig ? tagConfig.options : [];
	  },
	  set: (value) => {
	    const tagConfig = SendingBackendData.value.TagSelection.find(t => t.type === "标签");
	    if (tagConfig) {
	      tagConfig.options = value;
	    }
	  }
	});
	//上一页
	const PreviousPage=async()=>{
		Backtotop()
		// switching(data.value)
		nowpage.value-=1
		SendingBackendData.value.nowpage = nowpage.value;
		console.log("SendingBackendData",SendingBackendData.value)
		await getData()
		lazyloading()
	}
	// 下一页
	const NextPage=async()=>{
		Backtotop()
		// switching(data.value)
		nowpage.value=nowpage.value-0+1
		SendingBackendData.value.nowpage = nowpage.value;
		console.log("SendingBackendData",SendingBackendData.value)
		await getData()
		lazyloading()
	}
	const ToInDetail=(url)=>{
		console.log('发送的url：', url);
		const encodedurl = encodeURIComponent(url);
		uni.navigateTo({
			url: `InDetail?url=${encodedurl}`
		});
	}
	function open() {  
	  show.value = true;  
	}
	async function close() {  
		show.value = false;  
		await getData()
		lazyloading()
		console.log("close_SendingBackendData",SendingBackendData.value)
	  
	}
	onMounted(async () => {
		await getData()
		nextTick(() => {
		    lazyloading();
		});
	});
	const getData=async()=>{
		data.value=[]
		switching(data.value)
		lazyloading();
		try {
		  // 将uni.request封装为Promise以支持await语法
		  const [error, res] = await new Promise((resolve) => {
		    uni.request({
		      url: counter.url + '/all', // 请求地址
		      method: 'POST', // 请求方法
		      data: SendingBackendData.value, // 发送给后端的数据
		      header: { // 请求头配置（注意uni-app中是header单数形式）
		        'Content-Type': 'application/json',
		        'Accept': 'application/json'
		      },
		      success: (response) => resolve([null, response]), // 成功回调
		      fail: (err) => resolve([err, null]) // 失败回调
		    })
		  });
		
		  // 处理请求失败情况
		  if (error) {
		    console.error("There was an error fetching the data!", error);
		    return;
		  }
		
		  // 打印响应并处理数据（与原逻辑完全一致）
		  console.log("response:", res);
		  if (res.data.status) {
		    issearchfor.value = true;
		    sonpage.value = res.data.page.maxpage;
		    nowpage.value = res.data.page.nowpage;
		    console.log("response.data.data:", res.data.data);
		    data.value = res.data.data;
		  } else {
		    console.log("未找到数据");
		    issearchfor.value = false;
		  }
		} catch (err) {
		  console.error("Request processing error:", err);
		}
	};
	const switching=(it)=>{
		console.log("it前",it)
		data.value=it.map(item => {
		  // 保留原始数据的所有字段，仅重写目标字段
		  return {
		    ...item,
		    // 1. 替换 ImgSrc 为 "123.gpj"（保持原数组格式）
		    ImgSrc: [placeholder.value],
		    // 2. 替换 BookAuthor 为 "加载中"（保持原数组格式）
		    BookAuthor: ["加载中"],
		    // 3. 替换 Bookname 为 "加载中"（保持原数组格式）
		    Bookname: ["加载中"]
		  };
		});
		console.log("it后",data.value)
	}
	// 单选
	const groupChange=(e)=>{
		console.log('groupChange',e)
	}
	// 多选
	const aloneChecked = (items, checked) => {
		const tagConfig = SendingBackendData.value.TagSelection.find(t => t.type === "标签");
		console.log("点击后数组:",tagConfig)
		console.log("items:",items)
		if (!tagConfig) return;
		if (items === '不限') {
			// 当选择"不限"时，清空其他选项
			// tagConfig.options = checked ? ['不限'] : [];
			setTimeout(function() {
				tagConfig.options =  ['不限'];
			}, 50);
		} else {
			// 当选择其他选项时，移除"不限"
			if (checked) {
				setTimeout(function() {
					tagConfig.options = tagConfig.options.filter(item => item !== '不限');
				},50);
				if (!tagConfig.options.includes(items)) {
					tagConfig.options.push(items);
				}
			} else {
				tagConfig.options = tagConfig.options.filter(item => item !== items);
				// 如果所有选项都取消，默认选中"不限"
				if (tagConfig.options.length === 0) {
					tagConfig.options = ['不限'];
				}
			}
		}
	};
	//滚回顶部
	const Backtotop=()=>{
		const scrollContainer = document.getElementById('count');
		if (scrollContainer) {
		    // 方案 1：直接设置滚动距离（简洁）
		    scrollContainer.scrollTo({
				top: 0,
		        behavior: 'smooth' // 平滑滚动，移除则为瞬间置顶
		    });
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
	onUnmounted(() => {
	  observer?.disconnect()
	})
</script>

<style>
	.no-book{
		text-align: center;
		margin-top: 80px;
		font-weight: bold;
		font-size: 24px;
		width: 100%;
	}
	.btn-wrap{
		min-width: 50px;
		/* background-color: aquamarine; */
		text-align: center;
	}
	
	.PaginationTitle{
		padding: 5px;
		border-radius: 5px;
		border: 1px solid #66ccff ;
	}
	.PaginationNumber{
		flex: 1;
		text-align: center;
		font-size: 20px;
	}
	.u-demo-block{
		padding: 10px;
		padding-bottom: 0px;
		/* padding: 5px; */
		display: flex;
		background-color: rgba(255, 255, 255, 0.8);

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
	    text-align: center; /* 对应 textAlign(TextAlign.Start) */
	    display: -webkit-box;
	    -webkit-box-orient: vertical;
	    -webkit-line-clamp: 2; /* 对应 maxLines(2) */
	    overflow: hidden;
		max-height: 2.5em; /* 行高约1.2em，2行即2.4em */
		    line-height: 1.2; /* 固定行高，避免文字拥挤溢出 */
		    /* 可选：添加底部内边距，预留空间 */
		    padding-bottom: 2px;
	}
	.text-container{
		text-align: center;
	}
	.count_img{
		width: 100%;
		height: 180px;
		object-fit: cover;
		border-radius:10px
	}
	.count_view{
		width: calc(33.33% - 7px); /* 调整宽度计算 */
		display: flex;
		flex-direction: column; /* 垂直排列 */
		align-items: center; /* 内容居中 */
		box-sizing: border-box;
		padding: 5px;
		border: 1px solid #eee;
		border-radius: 8px;
	}
	.library {
			display: flex;
			flex-direction: column;
			height: 87vh;
			overflow: hidden;
		}
		
		.top {
			padding: 10px;
			margin-left: 10px;
			z-index: 10;
		}
		
		.top_text {
			text-align: center;
			font-size: 26px;
			padding: 8px;
			writing-mode: vertical-rl;
			text-orientation: upright;
			background-color: #66ccff;
			color: white;
			position: sticky;
		}
		
		.filter {
			text-align: center;
			padding: 10px 0;
		}
		
		.filter_button {
			font-size: 16px;
			border-radius: 20px;
		}
		
		#count {
			flex: 1;
			overflow-y: auto;
			padding: 5px;
			display: flex;
			flex-wrap: wrap;
			align-content: flex-start; /* 新增：内容顶部对齐 */
			gap: 10px; /* 新增：统一控制项目间距 */
			/* background-color: pink; */
		}
		
		.scroll-view {
			width: 350px;
			height: 100%;
			
		}
		
		.scroll-view-box {
			height: 100%;
			padding: 20px;
			box-sizing: border-box;
		}
		
		.piece {
			font-size: 18px;
			font-weight: bold;
			display: block;
			margin: 15px 0 10px;
		}
		
		.piece_view {
			margin-bottom: 20px;
		}
		
		.close-btn {
			padding: 5px 10px;
			height: 70px;
			background-color: #007aff;
			color: white;
			border-radius: 10px;
			text-align: center;
			font-weight: bold;
			font-size: 24px;
		}
		
		.uni-list-cell {
			display: flex;
			align-items: center;
			margin: 5px 0;
		}
		
		.uni-list-cell-pd view:first-child {
			margin-right: 10px;
		}
</style>