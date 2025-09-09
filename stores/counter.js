// stores/counter.js
import { defineStore } from 'pinia';

export const useCounterBook = defineStore('counter', {
	//值
	state: () => ({
		url:'http://t0.pgrm.top:18279',
		books:[{'title':"转生附体炮灰♂角色的我绝不放弃TS！",'img':"https://www.linovelib.com/files/article/image/4/4774/4774s.jpg?181000",'link':"/novel/4774.html",type:1}]
		// book:[{'title':"转生附体炮灰♂角色的我绝不放弃TS！",'img':"https://www.linovelib.com/files/article/image/4/4774/4774s.jpg?181000",'link':"/novel/4774.html",type:1}]
		// {'title':bookname,'img':bookimg,'link':booklink,type:1},{'title':bookname,'img':bookimg,'link':booklink,type:1}
	}),
	//方法
	actions: {
		// 保存数据到本地存储
		saveBookData() {
		    uni.setStorage({
				key: 'book_data',
		        data: this.book,
		        success: () => console.log('数据保存成功')
		    });
		},
		// 从本地存储加载数据
		async loadBookData() {
		    try {
				const res = await uni.getStorage({ key: 'book_data' });
		        this.book = res.data || [];
		    } catch (e) {
		        console.log('无存储数据或读取失败');
		        this.book = [];
		    }
		},
		addBook(bookname,bookimg,booklink) {
			console.log("addBook前：", this.book)
			
			const newBook = {
			  title: bookname,
			  img: bookimg,
			  link: booklink,
			  type: "1"  // 补充完整引号，原代码可能漏写
			};
			console.log("newBook：", newBook)
			// 检查数组中是否已存在相同link的项
			const isExists = this.book.some(item => item.title === newBook.title);
			
			// 如果不存在才添加
			if (!isExists) {
			  this.book.push(newBook);
			}
			console.log("addBook后：", this.book)
		},
		cs(){
			console.log("counter内部：",this.book)
		},
		ifshelf(url){
			console.log("判断url：",url)
			console.log("判断book：",this.book)
			return this.book.some(item => {
			// 安全校验：确保 item 是对象且有 link 字段（避免 item 为 undefined/null）
				return item && item.link && typeof item.link === 'string' && item.link.includes(url);
			});
		},
		delAll(){
			this.book=[]
		},
		delBook(url){
			const beforeLength = this.book.length;
			this.book = this.book.filter(book => book.link !== url);
			console.log("删除！！，book:",this.book)
		},
		changeBook(name,newType){
			if (!Array.isArray(this.book)) {
				this.book = [];
			}
			console.log("changeBook执行前 - 书籍列表:", this.book);
			console.log("要匹配的书名:", name);
			console.log("要更新的类型:", newType);
			this.book = this.book.map(book => {
			    if (book && book.title === name) {
			        return { ...book, type: newType };
			    }
				console.log("changeBook后:",this.book)
			    return book;
			});
		},

	},

});
