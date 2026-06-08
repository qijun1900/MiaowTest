# xe-upload

## 说明

不占用页面位置的上传组件；

H5、APP、微信小程序中可上传图片，视频和文件；其他端暂时只能上传图片和视频

> 上传图片通过[chooseMedia](https://uniapp.dcloud.net.cn/api/media/video.html#choosemedia)及[chooseImage](https://uniapp.dcloud.net.cn/api/media/image.html#chooseimage)实现

> 上传视频通过[chooseMedia](https://uniapp.dcloud.net.cn/api/media/video.html#choosemedia)及[chooseVideo](https://uniapp.dcloud.net.cn/api/media/video.html#choosevideo)实现

> H5端上传文件通过[chooseFile](https://uniapp.dcloud.net.cn/api/media/file.html#wx-choosemessagefile)实现

> APP上传文件通过[renderjs](https://uniapp.dcloud.net.cn/tutorial/renderjs.html#renderjs)实现

> 微信小程序上传文件通过[chooseMessageFile](https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.chooseMessageFile.html)实现


## 使用

Attributes

| 参数      | 说明 | 类型	 | 默认值 |
| ----------- | ----------- | ----------- | ----------- |
| options   | 请求配置(参数与uni.uploadFile的参数一致)        | object | { name: 'file' } |

Events

| 事件名      | 说明 | 参数	 | 
| ----------- | ----------- | ----------- |
| callback | 接收数据 | { type, data } |

callback type

| 参数      | 说明 |
| ----------- | ----------- |
| warning | 提示信息（下文称warning回调） |
| success | 上传成功（下文称success回调） |
| choose | 选择文件（下文称choose回调） |

callback data

```
'callback.type === success' : [
    {
        "size": 176579, // 选择的文件的大小
        "name": "Kafka.pdf", // 选择的文件的名称（小程序端可能会没有）
        "type": "application/pdf",
        "tempFilePath": "blob:http://192.168.137.1:8080/2585769b-3195-4f3d-b9f8-d9e99f55deec", // 临时路路径
        "fileType": "file", // 文件类型[image, video, file]
        "response": {
            "result": {
                "fileName": "Kafka.pdf",
                "filePath": `http://localhost:3000/upload/e51d814b649122fc64892d0bc6383d07.pdf`,
            },
            "success": true,
        }, // 上传返回的信息
    }
]

'callback.type === choose' : [
    {
        "size": 176579, // 选择的文件的大小
        "name": "Kafka.pdf", // 选择的文件的名称（小程序端可能会没有）
        "type": "application/pdf",
        "tempFilePath": "blob:http://192.168.137.1:8080/4204e460-f185-4fc9-9f4d-1bc50ab06981", // 文件临时路径
        "fileType": "file", // 文件类型[image, video, file]
    }
]
```

## 注意事项
#### 1、options入参中如果url为空，则choose回调的data列表中只有选择文件能得到的信息和临时路径，临时路径可用于自定义上传方法（APP除外）；传入url选择文件后会自动上传到服务器，此时choose回调不会触发，而是执行success回调，success回调的data列表会包括选择文件能得到的信息
#### 2、APP端文件建议直接上传到服务器，拿到文件上传后的地址再进行其他操作(目前测试APP端file转换后的Blob Url无法用于uni.uploadFile，所以建议APP文件直接上传)
#### 3、APP端文件暂时支持单个上传
#### 4、当uni.chooseMedia可用时，会优先使用uni.chooseMedia
#### 5、具体使用可下载示例项目运行查看完整示例
