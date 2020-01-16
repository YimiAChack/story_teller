/**
 * Created by Zhangyx on 2015/10/15.
 */
;(function($){
    var Caroursel = function (caroursel){
        var self = this;
        this.caroursel = caroursel;
        this.posterList = caroursel.find(".poster-list");
        this.posterItems = caroursel.find(".poster-item");
        this.firstPosterItem = this.posterItems.first();
        this.lastPosterItem = this.posterItems.last();
        this.prevBtn = this.caroursel.find(".poster-prev-btn");
        this.nextBtn = this.caroursel.find(".poster-next-btn");
        //默认参数
        this.setting = {
            "width":"1000",
            "height":"270",
            "posterWidth":"640",
            "posterHeight":"270",
            "scale":"0.8",
            "speed":"1000",
            "isAutoplay":"true",
            "dealy":"1000"
        }
        //自定义参数与默认参数合并
        $.extend(this.setting,this.getSetting())
        //设置第一帧位置
        this.setFirstPosition();
        //设置剩余帧的位置
        this.setSlicePosition();
        //旋转
        this.rotateFlag = true;
        this.prevBtn.bind("click",function(){
            if(self.rotateFlag){
                self.rotateFlag = false;
                self.rotateAnimate("left")
            }
        });
        this.nextBtn.bind("click",function(){
            if(self.rotateFlag){
                self.rotateFlag = false;
                self.rotateAnimate("right")
            }
        });
        if(this.setting.isAutoplay){
            this.autoPlay();
            this.caroursel.hover(function(){clearInterval(self.timer)},function(){self.autoPlay()})
        }
    };
    Caroursel.prototype = {
        autoPlay:function(){
          var that = this;
          this.timer =  window.setInterval(function(){
              that.prevBtn.click();
          },that.setting.dealy)
        },
        rotateAnimate:function(type){
            var that = this;
            var zIndexArr = [];
            if(type == "left"){//向左移动
                this.posterItems.each(function(){
                   var self = $(this),
                    prev = $(this).next().get(0)?$(this).next():that.firstPosterItem,
                    width = prev.css("width"),
                    height = prev.css("height"),
                    zIndex = prev.css("zIndex"),
                    opacity = prev.css("opacity"),
                    left = prev.css("left"),
                    top = prev.css("top");
                    zIndexArr.push(zIndex);
                    self.animate({
                        "width":width,
                        "height":height,
                        "left":left,
                        "opacity":opacity,
                        "top":top,
                    },that.setting.speed,function(){
                        that.rotateFlag = true;
                    });
                });
                this.posterItems.each(function(i){
                    $(this).css("zIndex",zIndexArr[i]);
                });
            }
            if(type == "right"){//向右移动
                this.posterItems.each(function(){
                    var self = $(this),
                    next = $(this).prev().get(0)?$(this).prev():that.lastPosterItem,
                        width = next.css("width"),
                        height = next.css("height"),
                        zIndex = next.css("zIndex"),
                        opacity = next.css("opacity"),
                        left = next.css("left"),
                        top = next.css("top");
                        zIndexArr.push(zIndex);
                    self.animate({
                        "width":width,
                        "height":height,
                        "left":left,
                        "opacity":opacity,
                        "top":top,
                    },that.setting.speed,function(){
                        that.rotateFlag = true;
                    });
                });
                this.posterItems.each(function(i){
                    $(this).css("zIndex",zIndexArr[i]);
                });
            }
        },
        setFirstPosition:function(){
            this.caroursel.css({"width":this.setting.width,"height":this.setting.height});
            this.posterList.css({"width":this.setting.width,"height":this.setting.height});
            var width = (this.setting.width - this.setting.posterWidth) / 2;
            //设置两个按钮的样式
            this.prevBtn.css({"width":width , "height":this.setting.height,"zIndex":Math.ceil(this.posterItems.size()/2)});
            this.nextBtn.css({"width":width , "height":this.setting.height,"zIndex":Math.ceil(this.posterItems.size()/2)});
            this.firstPosterItem.css({
                "width":this.setting.posterWidth,
                "height":this.setting.posterHeight,
                "left":width,
                "zIndex":Math.ceil(this.posterItems.size()/2),
                "top":this.setVertialType(this.setting.posterHeight)
            });
        },
        setSlicePosition:function(){
            var _self = this;
            var sliceItems = this.posterItems.slice(1),
                level = Math.floor(this.posterItems.length/2),
                leftItems = sliceItems.slice(0,level),
                rightItems = sliceItems.slice(level),
                posterWidth = this.setting.posterWidth,
                posterHeight = this.setting.posterHeight,
                Btnwidth = (this.setting.width - this.setting.posterWidth) / 2,
                gap = Btnwidth/level,
                containerWidth = this.setting.width;
            //设置左边帧的位置
            var i = 1;
            var leftWidth = posterWidth;
            var leftHeight = posterHeight;
            var zLoop1 = level;
            leftItems.each(function(index,item){
                leftWidth = posterWidth * _self.setting.scale;
                leftHeight = posterHeight*_self.setting.scale;
                $(this).css({
                    "width":leftWidth,
                    "height":leftHeight,
                    "left": Btnwidth - i*gap,
                    "zIndex":zLoop1--,
                    "opacity":1/(i+1),
                    "top":_self.setVertialType(leftHeight)
                });
                i++;
            });
            //设置右面帧的位置
            var j = level;
            var zLoop2 = 1;
            var rightWidth = posterWidth;
            var rightHeight = posterHeight;
            rightItems.each(function(index,item){
                var rightWidth = posterWidth * _self.setting.scale;
                var rightHeight = posterHeight*_self.setting.scale;
                $(this).css({
                    "width":rightWidth,
                    "height":rightHeight,
                    "left": containerWidth -( Btnwidth - j*gap + rightWidth),
                    "zIndex":zLoop2++,
                    "opacity":1/(j+1),
                    "top":_self.setVertialType(rightHeight)
                });
                j--;
            });
        },
        getSetting:function(){
            var settting = this.caroursel.attr("data-setting");
            if(settting.length > 0){
                return $.parseJSON(settting);
            }else{
                return {};
            }
        },
        setVertialType:function(height){
            var algin = this.setting.algin;
            if(algin == "top") {
                return 0
            }else if(algin == "middle"){
                return (this.setting.posterHeight - height) / 2
            }else if(algin == "bottom"){
                return this.setting.posterHeight - height
            }else {
                return (this.setting.posterHeight - height) / 2
            }
        }
    }
    Caroursel.init = function (caroursels){
        caroursels.each(function(index,item){
            new Caroursel($(this));
        })  ;
    };
    window["Caroursel"] = Caroursel;
})(jQuery)