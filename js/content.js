/*
 * @Author: KevinWu
 * @Date: 2023-05-23 10:51:01
 * @LastEditTime: 2023-05-25 23:00:47
 * @FilePath: \1.2_0\js\content.js
 * @Description: 
 * 
 */
console.log('content', chrome.runtime, 'chrome.runtime', chrome.tabs, 'chrome.tabs')

// 获取所有 meta 标签
const metaTags = document.getElementsByTagName('meta');

let bookInfo = {}
let tableRows = '<tr><td colspan="4">正在加载...</td></tr>';

const aside = document.querySelector('.aside');
const divCat3 = document.createElement('div');

// 遍历 meta 标签
for (let i = 0; i < metaTags.length; i++) {
	const metaTag = metaTags[i];

	// 检查 meta 标签的属性是否为 "book:isbn"
	if (metaTag.getAttribute('property') === 'book:isbn') {
		// 获取 content 值
		const isbn = metaTag.getAttribute('content');

		// 输出结果
		console.log('ISBN:', isbn);

		chrome.runtime.sendMessage({
			type: 'ISBN',
			isbn: isbn
		},
			// (response) => {
			//   console.log("content script -> background infos have been sended2",response);
			// }
		)
		// 如果只需要获取第一个符合条件的值，可以在这里使用 break 终止循环
		break;
	}
}
//发送消息

//接收消息
// console.log(112);
chrome.runtime.onMessage.addListener(data => {
	// console.log(data);
	if (data && data.type === 'bookInfo') {
		console.log('data.bookInfo:', data.bookInfo);
		bookInfo = data.bookInfo;


		// 动态生成表行
		tableRows = generateTableRows();
		renderCat3HTML();
	}
	// error
	if (data && data.type === 'Error') {
		tableRows = '<tr><td colspan="4">网络不太行啊<a href="">重新加载一下</a></td></tr>';
		
		renderCat3HTML();
	}
})
renderCat3HTML();
function generateTableRows() {
	let rows = '';
	if (bookInfo.length === 0) {
		return '<tr><td style="text-align: center;" colspan="4">图书馆还没有进货<a href="/link2/?url=http://opac.sclib.org/recommend/custom" target="_blank">去给它安利一下！</a></td></tr>';
	}
	for (let i = 0; i < Math.min(bookInfo.length, 4); i++) {
		const info = bookInfo[i];
		rows += `
			<tr>
				<td style="text-align: center;">${info.curlibName}</td>
				<td style="text-align: center;">${info.curlocalName}</td>
				<td style="text-align: center;">${info.copycount}/${info.copycount + info.loanableCount}</td>
				<td style="text-align: center;">${info.callno}</td>
			</tr>
		`;
	}
	return rows;
}
// 在class名为aside的元素下

function renderCat3HTML() {
	// 添加一个id为cat3的一个div
	const divCat3HTML = `
<div class="gray_ad buyinfo" id="divCat3">
  <div class="buyinfo-printed">
    <h2>
      <span>四川省图书馆</span>
      &nbsp;·&nbsp;·&nbsp;·&nbsp;·&nbsp;·&nbsp;·
    </h2>
    <table border="1" style="width: 100%; table-layout: fixed;">
      <colgroup>
        <col style="width: 90px;">
        <col style="width: 90px;">
        <col style="width: calc((100% - 200px) / 2);">
        <col style="width: calc((100% - 200px) / 2);">
      </colgroup>
      <thead>
        <tr>
          <th style="text-align: center;">分馆</th>
          <th style="text-align: center;">地点</th>
          <th style="text-align: center;">在馆/总数</th>
          <th style="text-align: center;">索书号</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>
	<!-- <div class="add2cartContainer no-border">
	<span class="add2cartWidget ll">
		<a
			class="j add2cart a_show_login"
			rel="nofollow"
		>
			<span>复制信息</span>
		</a>
	</span>
</div> -->
</div>`;

	divCat3.innerHTML = divCat3HTML;

	aside.prepend(divCat3);

	// 向“链接”添加一个事件监听器
const copyLink = document.querySelector('.add2cartWidget.ll a');
copyLink.addEventListener('click', function () {
	// 发送消息到Chrome扩展后台脚本
	console.log('copyLink.addEventListener');
	chrome.runtime.sendMessage({ type: 'copy', content: divCat3HTML });
});

}

