<script>
	import { useCounterBook } from './stores/counter';
	export default {
		onLaunch: function() {
			console.log('App Launch')
			const store = useCounterBook();
			store.loadBookData();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
			const store = useCounterBook();
			store.saveBookData();
		}
	}
</script>

<style lang="scss">
	@import "@/uni_modules/uview-plus/index.scss";
	/*每个页面公共css */
</style>
