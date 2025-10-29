// 显示分享菜单
const showShareMenu = () => {
  uni.showShareMenu({
    withShareTicket: true,
    title: '题喵喵',
    path: '/pages/index/index',
    menus: ["shareAppMessage", "shareTimeline"],
  });
};
export default showShareMenu;