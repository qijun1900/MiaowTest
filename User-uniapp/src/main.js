import {createSSRApp} from "vue";
import App from "./App.vue";
import uviewPlus from 'uview-plus'
//导入piania
import pinia from "./stores/index";
export function createApp() {
	const app = createSSRApp(App);
	
	//注册pinia
	app.use(pinia);
	//注册uview-plus
	app.use(uviewPlus);

	return {
		app,
	};
}
