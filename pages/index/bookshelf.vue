<!-- 书架 -->
<template>
	<view class="container">
		<view class="top">
			<text @click="open_string" class="top_text">书架</text>
		</view>
		<view class="tag">
			<view style="text-align: center;" v-for="(item,index) in tag" :key="index">
				<text @click="click_tag=index" class="tag_text" :class="{'active-tag': click_tag === index}">{{item}}</text>
			</view>
		</view>
		<!-- <button @click="cs()">cs</button> -->
		<view class="count" scroll-y="true">
			
			<view v-show="shouldShow(item)" class="count_view" v-for="(item,index) in counter.book" :key="index">
				<view   class="count_container">
					<img @click="ToInDetail(item.link)" class="count_img" :src="item.img" :alt="item.title">
					<view @click="open_up_popup(item)" class="text-container">
						<text class="title">{{item.title}}</text>
						<text class="type">{{item.type==1?'想看':item.type==2?'在看':'已看'}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
	<up-popup style=""  :mask-closeable="true" :show="show" :round="10" mode="center" @close="close">
		<view style="text-align: center;width: 75vw;padding: 10px;">
	        <img style="width: 100%;" :src="up_img" alt="" />
			<view class="">
				<text style="word-wrap: break-word;text-align: center;font-size: 20px;font-weight: bold;">{{up_name}}</text>
			</view>
			<view style="display: flex;width: 100%;" class="">
				 <radio-group @change="handleRadioChange" class="up-radio-group">
				 	<label class="up-radio" v-for="(item, index) in options" :key="item.value">
				 		<view>
				 			<radio :value="item.type" :checked="item.type == up_type" />
				 			{{item.title}}
						</view>
				 	</label>
					<button @click="delBook" class="delete-btn" type="warn" size="mini">删除</button>
				</radio-group>
				 
			</view>
			 
		</view>
	</up-popup>
	<up-popup  :mask-closeable="true" :show="string_show" :round="10" mode="center" @close="string_close">
		<view v-if="string_number==0" class="" style="margin: 10px;width: 75vw;">
			<!-- 分享模块 -->
			<up-checkbox-group v-model="checkboxValue1" placement="column" :iconSize="25">
			    <up-checkbox shape="circle" :customStyle="{marginBottom: '8px'}" v-for="(item, index) in counter.book" :key="index" :label="item.title" :name="item.link">
			    </up-checkbox>
			</up-checkbox-group>
			<up-button color="#66ccff" @click="share_but" style="font-weight: bold;font-size: 28px;" :disabled="share_disabled" text="分享"></up-button>
			<view style="margin-top: 15px; width: 100%; display: flex; justify-content: space-between; align-items: center;">
			  <text style="flex-shrink: 0;">分享码:</text>
			  <text style="flex-grow: 1; text-align: center; margin: 0 10rpx;word-break: break-all">{{share}}</text>
			  <button @click="copy" size="mini" style="flex-shrink: 0;">复制</button>
			</view>
		</view>
		<view style="margin: 10px;" v-if="string_number==1" class="">
			<up-textarea maxlength="500" style="margin:10px 0px;" autoHeight v-model="receive" placeholder="请输入内容" ></up-textarea>
			<up-button  color="#66ccff" @click="receive_but" style="padding:10px;font-weight: bold;font-size: 28px;" :disabled="receive_disabled" text="接收"></up-button>
		</view>
		<view v-if="string_number==2" class="">
			<button style="margin: 0px;" @click="counter.delAll()" type="warn">清空所有数据</button>
		</view>
		<view class="outer-container">
			<view @click="open_tab(index)" class="inner-item" v-for="(item,index) in string" :key="index">
				<img class="item-image" :src="item.img" :alt="item.title" />
				<view class="item-title">{{item.title}}</view>
			</view>
		</view>
		
	</up-popup>
</template>

<script setup>
	import{ref,watch} from'vue';
	import { useCounterBook } from '@/stores/counter'
	import CryptoJS from 'crypto-js'
	import axios from 'axios';
	const counter = useCounterBook()
	//              0      1      2     3
	const tag=ref(['全部','想看','在看','已看']);
	const click_tag=ref(0);
	const show = ref(false);
	const share_disabled=ref(true)
	const receive_disabled=ref(true)
	const string_show = ref(false);
	const up_img=ref()
	const up_name=ref()
	const up_type=ref("1")
	const up_link=ref()
	const string = ref([
	  {img: '/static/share.png', title: '分享'},
	  {img: '/static/receive.png', title: '接收'},
	  {img: '/static/config.png', title: '设置'}
	])
	const receive=ref()
	const share=ref()
	const checkboxValue1=ref([])
	const string_number=ref(3)
	const options = ref([
	  {type: 1, title: '想看'},
	  {type: 2, title: '在看'},
	  {type: 3, title: '已看'}
	])
	//恢复数据函数
	const rasd=async(data)=>{
		const h5data = data.map(num => `/novel/${num}.html`);
		console.log("h5data:",h5data)
		let n=false
		h5data.map(async(url) => {
			const request = (options) => {
			  return new Promise((resolve, reject) => {
			    uni.request({
			      ...options,
			      success: (res) => resolve(res),
			      fail: (err) => reject(err)
			    });
			  });
			};
			 
			// 使用示例
			const sendData = {
			  Booklink: "https://www.linovelib.com" + url
			};
			 
			try {
			  const res = await request({
			    url: counter.url + '/Detailed',
			    method: 'POST',
			    data: sendData,
			    header: {
			      'Content-Type': 'application/json',
			      'Accept': 'application/json'
			    }
			  });
			 
			  // 统一响应处理
			  if (res.statusCode === 200 && res.data.status) {
			    counter.addBook(
			      res.data.data.BookName,
			      res.data.data.BookImg,
			      "https://www.linovelib.com" + url
			    );
			    
			    uni.showToast({
			      title: '添加成功',
			      icon: 'success',
			      duration: 1500
			    });
			  } else {
			    uni.showToast({
			      title: res.data.message || '添加失败',
			      icon: 'none',
			      duration: 1500
			    });
			  }
			} catch (error) {
			  uni.showToast({
			    title: '网络请求失败',
			    icon: 'none',
			    duration: 1500
			  });
			}
			// const SendingBackendData=ref({"Booklink":"https://www.linovelib.com"+url})
			// const response = await axios.post(counter.url+'/Detailed', SendingBackendData.value, {
			//       headers: {
			//         'Content-Type': 'application/json',
			//         'Accept': 'application/json'
			//       }
			//     })
			// console.log("response:",response)
			// // 正确解析响应数据
			// if (response.data.status) {
			// 	n=true
			// 	console.log("response.data:",response.data) 
			// 	counter.addBook(response.data.data.BookName,response.data.data.BookImg,"https://www.linovelib.com"+url)
			// }
			// if(n==true){
			// 	uni.showToast({
			// 	  title: '添加成功',
			// 	  icon: 'success',
			// 	  duration: 1500
			// 	});
			// }else{
			// 	uni.showToast({
			// 	  title: '添加失败',
			// 	  icon: 'success',
			// 	  duration: 1500
			// 	});
			// }
		});
		// 	
		// 
	}
	// 解密函数
	const decryptData = (encryptedText, key) => {
	  try {
	    // 验证输入是否为空
	    if (!encryptedText || !key) {
	      throw new Error("密钥不能为空");
	    }
	    
	    const keyBytes = CryptoJS.enc.Utf8.parse(key);
	    
	    // 检查密钥长度是否符合AES要求(16/24/32字节)
	    if (keyBytes.sigBytes !== 16 && keyBytes.sigBytes !== 24 && keyBytes.sigBytes !== 32) {
	      throw new Error(`密钥长度必须为16、24或32字节，当前为${keyBytes.sigBytes}字节`);
	    }
	    
	    // 解密操作
	    const decrypted = CryptoJS.AES.decrypt(encryptedText, keyBytes, {
	      mode: CryptoJS.mode.ECB,
	      padding: CryptoJS.pad.Pkcs7
	    });
	    
	    // 尝试转换为UTF8字符串
	    const utf8String = decrypted.toString(CryptoJS.enc.Utf8);
	    
	    // 验证UTF8字符串是否有效
	    if (!utf8String) {
	      throw new Error("解密成功但结果不是有效的UTF-8字符串");
	    }
	    
	    return utf8String;
	  } catch (error) {
	    console.error("解密过程出错:", error.message);
	    throw error; // 重新抛出以便上层处理
	  }
	};
	// 解密按钮
	const receive_but=async()=>{
		console.log("接收的数据:",receive.value)
		try {
		  const encryptedData = receive.value;
		  const secretKey = 'YOUR_SECRET_KEY_16BYTE11'; // 确保与加密时使用的密钥完全一致
		  
		  // 先检查加密数据是否有效
		  if (!encryptedData || typeof encryptedData !== 'string') {
		    throw new Error("无效的加密数据");
		  }
		  
		  const decryptedText = decryptData(encryptedData, secretKey);
		  
		  // 尝试解析JSON
		  try {
		    const decryptedData = JSON.parse(decryptedText);
		    console.log("解密并解析成功：", decryptedData);
		    // checkboxValue1.value = decryptedData; // 恢复数据
			await rasd(decryptedData)
			string_close()
			//清空文本框
			//关闭
			
		  } catch (jsonError) {
		    console.error("JSON解析失败:", jsonError);
		    // 即使JSON解析失败，也可以返回原始解密文本
		    console.log("解密后的原始文本:", decryptedText);
		    // checkboxValue1.value = decryptedText;
			
		  }
		} catch (error) {
		  console.error("解密操作失败：", error);
		  // 显示用户友好的错误提示
		  alert("解密失败，请检查分享码是否正确或密钥是否匹配");
		}
	}
	//切换页面换行
	const open_tab=(index)=>{
		console.log("open_tab:",index)
		string_number.value=index
	}
	//复制函数
	const copy = () => {
	  uni.setClipboardData({
	    data: share.value,
	    success: () => {
	      // 复制成功提示
	      uni.showToast({
	        title: '复制成功',
	        icon: 'success',
	        duration: 1500
	      });
	    },
	    fail: (err) => {
	      // 复制失败提示
	      uni.showToast({
	        title: '复制失败，请重试',
	        icon: 'none',
	        duration: 2000
	      });
	      console.error('复制失败:', err);
	    }
	  });
	}
	//加密算法
	const encryptData = (text, key) => {
	  const keyBytes = CryptoJS.enc.Utf8.parse(key)
	  return CryptoJS.AES.encrypt(text, keyBytes, {
	    mode: CryptoJS.mode.ECB,
	    padding: CryptoJS.pad.Pkcs7
	  }).toString()
	}
	//加密按钮
	const share_but=()=>{
		//checkboxValue1.value转化成密钥当分享码输出
		// console.log("checkboxValue1函数：",checkboxValue1.value)
		
		console.log("书架数据：",counter.book)
		console.log("数据处理前：",checkboxValue1.value)
		const numberRegex = /\/novel\/(\d+)\.html/;
		// 遍历数组，对每个元素提取数字并转为数值类型
		const dataToEncrypt = JSON.stringify(checkboxValue1.value.map(item => {
		  // 执行正则匹配，获取匹配结果
		  const match = item.match(numberRegex);
		  // 若匹配成功（避免格式异常），返回捕获组的数字（转成 Number 类型）；否则返回 null
		  return match ? Number(match[1]) : null;
		}))
		const secretKey = 'YOUR_SECRET_KEY_16BYTE11'
		share.value = encryptData(dataToEncrypt, secretKey)
	}
	const open_string=()=>{
		string_show.value=true
	}
	const delBook=()=>{
		counter.delBook(up_link.value)
		close()
	}
	const handleRadioChange = (e) => {
	  console.log("选中的值：", e.detail.value); // 打印选中的value，确认是否获取到
	  counter.changeBook(up_name.value,e.detail.value)
	  up_type.value = e.detail.value; // 强制赋值
	  close()
	};
	const string_close = () => {
		console.log("close函数,up_type:",up_type.value)
	  string_show.value = false; 
	  string_number.value=3
	};
	const close = () => {
		console.log("close函数,up_type:",up_type.value)
	  show.value = false; 
	  
	};
	const open_up_popup=(item)=>{
		up_img.value=item.img
		up_name.value=item.title
		up_type.value=item.type
		up_link.value=item.link
		console.log('open_up_popup:',item)
		show.value = true
	}
	const ToInDetail=(url)=>{
		console.log('发送的url：', url);
		const encodedurl = encodeURIComponent(url);
		uni.navigateTo({
			url: `InDetail?url=${encodedurl}`
		});
	}
	const shouldShow=(item)=>{
		console.log("item:",item,"\nclick_tag:",click_tag)
		if(click_tag.value==0) return true
		if(click_tag.value==item.type) return true
	}
	
	// 有选中值时执行的函数
	const handleCheckboxHasValue = (len) => {
		if(len>0){
			share_disabled.value=false
		}else{
			share_disabled.value=true
		}
	};
	const handleCheckboxHasreceive=(len)=>{
		if(len>0){
			receive_disabled.value=false
		}else{
			receive_disabled.value=true
		}
	}
	watch(
	  checkboxValue1,
	  (newVal, oldVal) => {
	    // 当数组有值时调用函数
	      handleCheckboxHasValue(checkboxValue1.value.length);
	  },
	  {
	    immediate: true // 初始时立即执行一次（可选）
	  }
	);
	watch(
	  receive,
	  (newVal, oldVal) => {
	    // 当数组有值时调用函数
	      handleCheckboxHasreceive(receive.value.length);
	  },
	  {
	    immediate: true // 初始时立即执行一次（可选）
	  }
	);
	
</script>

<style scoped>
	.item-image {
	  width: 40px;
	  height: 40px;
	  object-fit: cover;
	  border-radius: 8px;
	  margin-bottom: 8px;
	}
	
	/* 标题样式 */
	.item-title {
	  font-size: 14px;
	  text-align: center;
	  white-space: nowrap; /* 防止标题换行 */
	}
	.inner-item {
	  display: flex;
	  flex-direction: column; /* 竖向排列 */
	  align-items: center; /* 内部元素水平居中 */
	  justify-content: center;
	  flex-shrink: 0; /* 防止项目被压缩 */
	  padding: 0px 10px;
	}
	.outer-container {
	  display: flex;
	  flex-direction: row; /* 横向排列 */
	  justify-content: center; /* 水平居中 */
	  align-items: center; /* 垂直居中 */
	  width: 75vw;
	  padding: 10px;
	  overflow-x: auto; /* 当内容超出时可横向滚动 */
	  gap: 15px; /* 项目之间的间距 */
	  margin: 0 auto; /* 容器自身居中 */
	  margin-top: 20px;
	}
	.up-radio-group {
	  display: flex;
	  justify-content: space-between; /* 保持两端对齐 */
	  align-items: center; /* 垂直居中 */
	  width: 100%; /* 确保容器占满父容器 */
	}
	 
	/* 修正单选按钮样式 */
	.up-radio {
	  flex: 1; /* 关键属性：均分剩余空间 */
	  margin:5px; /* 元素间距 */
	  /* background-color: #e64340; */
	  justify-content: center;
	  height: 30px;
	}
	 
	/* 修正删除按钮样式 */
	.delete-btn {
	  flex: 1; /* 与单选按钮等宽 */
	  max-width: 70px; /* 最大宽度限制 */
	  background-color: #e64340;
	  color: white;
	  text-align: center;
	  height: 30px;
	  border-radius: 4px;
	}
	.container {
		display: flex;
		flex-direction: column;
		height: 89vh; /* 确保容器占据整个视口高度 */
		overflow: hidden; /* 隐藏溢出内容 */
	}
	.type {
	   font-size: 14px;
	    text-align: right; /* 对应 textAlign(TextAlign.End) */
	    width: 15%;
	    font-weight: bold; /* 对应 fontWeight(FontWeight.Bold) */
	    /* 可选：添加背景色和圆角使其更美观 */
	    background-color: #f0f7ff;
	    color: #66ccff;
	    border-radius: 10px;
	    padding: 0 5px;
	}
	.title {
	    font-size: 14px;
	    text-align: left; /* 对应 textAlign(TextAlign.Start) */
	    width: 85%;
	    display: -webkit-box;
	    -webkit-box-orient: vertical;
	    -webkit-line-clamp: 2; /* 对应 maxLines(2) */
	    overflow: hidden;
	    text-overflow: ellipsis; /* 对应 textOverflow({ overflow: TextOverflow.Ellipsis }) */
	}
	.text-container{
		display: flex;
		padding: 8px;
		background: #f9f9f9;
		border-radius:10px;
	}
	.count_view{
		width: calc(33.33% - 4px); /* 调整宽度计算 */
		display: flex;
		flex-direction: column; /* 垂直排列 */
		align-items: center; /* 内容居中 */
		box-sizing: border-box;
		padding: 5px;
		border: 1px solid #eee;
		border-radius: 8px;
	}
	.count{
		flex: 1;
		overflow-y: auto;
		padding: 5px;
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start; /* 新增：内容顶部对齐 */
		gap: 5px; /* 新增：统一控制项目间距 */
	}
	.count_img{
		width: 100%;
		height: 180px;
		object-fit: cover;
		border-radius:10px
	}
	.active-tag{
		border: 1px solid #66ccff;
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
	.tag{
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); /* 自动适应列数 */
		gap: 10px;
		padding: 8px;
		justify-content: space-between;
		z-index: 10;
		/* background-color: pink; */
	}
	.tag_text{
		/* background-color: pink; */
		font-size: 18px;
		padding: 3px;
		padding-left: 10px;
		padding-right: 10px;
		/* border: 1px solid #66ccff; */
		/* borderRadius:20px; */
		border-radius: 20px;
	}
</style>
