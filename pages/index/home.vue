<!-- 主页 -->
<template>
	<view class="searchfor">
		<!-- 顶部 -->
		<view style="width: 100vw;overflow: hidden;z-index: 20;">
			<view class="top">
				<text class="top_text">搜索</text>
			</view>
			<view class="input_view">
				<input type="text" class="input" v-model="searchText" @confirm="handleSearch" inputmode="text" placeholder="请输入书名或作者" name="" id="">
				<uni-icons v-if="searchText!=''" class="close-icon" type="close"  size="26" @click="searchText='';IsCharts=true;IsData=false;"></uni-icons>
				<uni-icons  class="search-icon" type="search"  size="26" @click="handleSearch"></uni-icons>
			
			</view>
		</view>
		
		<!-- 内容 -->
		<view class="count" >
			<!-- 排行榜 -->
			<Charts v-if="IsCharts" class="Charts" ></Charts> 
			<!-- 搜搜 -->
			<Search-For v-else-if="IsData"  :search-data="searchText" class="searchfor"></Search-For>
			<!-- 无数据 -->
			
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import Charts from './charts.vue';
	import SearchFor from './searchfor.vue';
	
	// 响应式变量
	const searchText = ref('');
	const IsCharts = ref(true);
	const IsData = ref(false);
	
	// 方法
	const handleSearch = () => {
	  console.log('searchText:', searchText.value);
	  if(searchText.value.length==0){
		  console.log('没有输入数据，返回排行榜')
		  IsCharts.value =true;
		  IsData.value =false;
	  }else{
		  console.log('进入搜索页面')
		  IsCharts.value = false;
		  IsData.value = true;
	  }
	  
	};
</script>

<style>
	.Charts{
		width: 100%;
	}
	.count{
		flex: 1; /* 占据剩余所有宽度 */
		  height: 70vh; /* 高度与父容器一致，确保滚动生效 */
		  overflow-y: auto; /* 内容超出时，竖向滚动 */
		  overflow-x: hidden; /* 禁止横向滚动 */
	}


	.input{
		flex: 1;
		border: none;
		outline: none;
		padding: 3px;
		padding-left: 10px;
		font-size:15PX ;
	}
	.input_view{
		width: 91vi;
		display: flex;
		align-items: center;
		border: 1px solid #66ccff;
		border-radius: 20px;
		margin:10px;
		padding: 5px;
		
		
	}
	.searchfor {
		width: 100%;
		
	}
	.top{
		/* background-color: pink; */
		padding: 10px;
		margin-left: 10px;
		z-index: 10;
	}
	.top_text{
		text-align: center;
		font-size: 26px;
		padding: 8px;
		writing-mode: vertical-rl;
		text-orientation: upright;
		background-color: #66ccff;
		color: white;
		position: sticky;
	}
</style>