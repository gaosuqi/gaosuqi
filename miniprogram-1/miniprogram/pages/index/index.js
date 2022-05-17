let base64Str=""
//实际的位置的height=小程序中图宽度/原图宽度*返回的位置height
Page({
  data:{
    imageSrc:"",
    wordsInfo:"",
    ratio:1
  },
  handleChoose:function(e){
    console.log("开始选择图片");
    //1.获取识别的数据；
    //2.获取到的图片数据，转化成BASE64格式的数据
    //3.获取一个百度智能云token和API，
    //4.通过token和API获取到人脸识别的数据
    //5.将数据进行一轮处理，达到界面的效果
    wx.chooseImage({
      count: 1,
      sizeType:["compressed","original"],
      sourceType:["album","camera"],
      success:(res)=>{
        this.setData({
          imageSrc:res.tempFilePaths[0]
        })
        this.encode(res.tempFilePaths[0]);
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success:(res)=>{
            this.setData({
              ratio:300/res.width
            })
          }
        })
      }
    })
  },
  encode(filePath){
    let fs=wx.getFileSystemManager();
    fs.readFile({
      filePath:filePath,
      encoding:"base64",
      success:(res)=>{
        base64Str=res.data;
        this.getAccessToken();
      },
    })
  },
  getAccessToken(){
    wx.request({
      method:"POST",
      url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=1Yr98vOexrUfEB2p1MjGQPDc&client_secret=0fUV8wNEzSKs0Fu1KgSsjEK5hwMAAazC',
      success:(res)=>{
        this.getPictureInfo(res.data.access_token)
      },
    })
  },
  getPictureInfo(token){
    wx.request({
      method:"POST",
      url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general?access_token='+token,
      data:{
        image:base64Str,
        language_type:"CHN_ENG",

        detect_direction:"true",
        vertexes_location:"true",
        probability:"true"
      },
      header:{
        "Content-Type":"application/x-www-form-urlencoded"
      },
      success:(res)=>{
        console.log(res)
        if(res.data.errMsg==="request:ok"){
          this.setData({
          wordsInfo:res.data.words_result[0]
          })
        }else{this.setData({
          wordsInfo:res.data.words_result[0]
        })
          wx.showToast({
            title: '文字识别失败！',
          })
        }
        

      }
    })
  }
}
)