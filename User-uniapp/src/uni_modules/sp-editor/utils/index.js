// 标识必须独一无二 - 标识是为了使用insertText插入标识文本后，查找到标识所在delta位置的索引
export const linkFlag = '#-*=*-*=*-*=*@-link超链接标识link-@*=*-*=*-*=*-#'

export function addLink(editorCtx, attr, callback) {
	// 先插入一段文本内容
	editorCtx.insertText({
		text: linkFlag
	})
	// 获取全文delta内容
	editorCtx.getContents({
		success(res) {
			let options = res.delta.ops
			const findex = options.findIndex(item => {
				return item.insert && typeof item.insert !== 'object' && item.insert?.indexOf(linkFlag) !== -1
			})
			// 根据标识查找到插入的位置
			if (findex > -1) {
				const findOption = options[findex]
				const findAttributes = findOption.attributes
				// 将该findOption分成三部分：前内容 要插入的link 后内容
				const [prefix, suffix] = findOption.insert.split(linkFlag);
				const handleOps = []
				// 前内容
				if (prefix) {
					const prefixOps = findAttributes ? {
						insert: prefix,
						attributes: findAttributes
					} : {
						insert: prefix
					}
					handleOps.push(prefixOps)
				}
				// 插入的link
				const linkOps = {
					insert: attr.text,
					attributes: {
						link: attr.href,
						textDecoration: attr.textDecoration || 'none', // 下划线
						color: attr.color || '#007aff'
					}
				}
				handleOps.push(linkOps)
				// 后内容
				if (suffix) {
					const suffixOps = findAttributes ? {
						insert: suffix,
						attributes: findAttributes
					} : {
						insert: suffix
					}
					handleOps.push(suffixOps)
				}
				// 删除原options[findex]并在findex位置插入上述三个ops
				options.splice(findex, 1);
				options.splice(findex, 0, ...handleOps);
				// 最后重新初始化内容，注意该方法会导致光标重置到最开始位置
				editorCtx.setContents({
					delta: {
						ops: options
					}
				})
				// 所以最后建议使富文本光标失焦，让用户手动聚焦光标
				editorCtx.blur()

				// 后续回调操作
				if (callback) callback()
			}
		}
	})

}

/**
 * 将含有特殊图片形式视频的富文本转换成正常视频的富文本
 * @param {String} html 要进行处理的富文本字符串
 * @returns {String} 返回处理结果
 */
export function handleHtmlWithVideo(html) {
	// 正则表达式用于匹配img标签中带有alt属性且alt属性值为视频链接的模式
	const regex = /<img\s+src="[^"]*"\s+alt="([^"]*)"[^>]*>/g
	// 使用replace方法和一个函数回调来替换匹配到的内容
	return html.replace(regex, (match, videoUrl) => {
		// 替换为video标签，并添加controls属性以便用户可以控制播放
		return `<video width="80%" controls><source src="${videoUrl}" type="video/mp4"></video>`
	})
}

/**
 * 将img标签中内联style属性中的宽高样式提取出标签width与height属性
 * @param {Object} html 要处理的富文本字符串
 * @returns {Object} 返回处理结果
 */
export function convertImgStylesToAttributes(html) {
	return html.replace(/<img\s+([^>]+)\s*>/g, function(match, attributes) {
		// 分割属性
		const attrs = attributes.split(/\s+/);

		// 找到style属性的位置
		const styleIndex = attrs.findIndex(attr => attr.startsWith('style='));
		if (styleIndex === -1) return match; // 如果没有找到style属性，则返回原样

		// 提取style属性值
		const styleAttr = attrs.splice(styleIndex, 1)[0];
		const style = styleAttr.match(/"([^"]*)"/)[1];

		// 解析 style 属性
		const styleObj = {};
		style.split(';').forEach(function(part) {
			if (part) {
				const [name, value] = part.split(':');
				styleObj[name.trim()] = value.trim();
			}
		});

		// 创建新的 img 标签
		let newTag = '<img';
		if (styleObj.width) {
			newTag += ` width="${styleObj.width}"`;
		}
		if (styleObj.height) {
			newTag += ` height="${styleObj.height}"`;
		}

		// 添加原有的属性，包括修改过的style属性
		newTag += ` ${styleAttr} ${attrs.join(' ')}`;

		// 关闭 img 标签
		newTag += '>';

		return newTag;
	});
}