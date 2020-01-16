//-------------------------------------------------------------------------//
(function ($) {
    // 创建构造函数
    function Slide(ele, options) {
        this.$ele = $(ele)//this. 构造函数的实例对象
        let g = d3.select(ele)
        let width = g.node().clientWidth
        let height = g.node().clientHeight
        // image size 1280*622
        // let ratio_large = 0.5
        let ratio_large = 0.5
        let w = width * ratio_large
        let h = w * 622 / 1280
        let len_li = g.selectAll('li').nodes().length
        this.len_li = len_li
        this.indexCurrent = 0
        let states = null
        let back = {'&zIndex': 0, 'width': 0, 'height': 0, 'top': height * 0.5, 'left': width * 0.5, '$opacity': 0 }
        if (len_li < 3 ) {
            console.warn('image less than 3!')
            states = [{ '&zIndex': 4, 'width': w, 'height': h, 'top': height * 0.5 - h * 0.5, 'left': width * 0.5 - w * 0.5, '$opacity': 1 }]
            for (let i = 1; i< len_li; i++) {
                states.push(back)
            }
            this.indexCurrent = 0
        } else if (len_li < 5) {
            console.warn('image less than 5!')
            let points = [0.325, 0.5, 0.675]
            let indeces = [3, 4, 3]
            let ratios = [0.65, 1, 0.65]
            let opacities = [0.5, 1, 0.5]
            
            points[0] = ratio_large * ratios[0] * 0.5
            points[2] = 1 - points[0]
            states = points.map((p, i)=>{
                let tmp = {}
                tmp['&zIndex'] = indeces[i]
                tmp['width'] = w * ratios[i]
                tmp['height'] = h * ratios[i]
                tmp['left'] = width * points[i] - tmp['width'] * 0.5
                tmp['top'] = height * 0.5 - tmp['height'] * 0.5
                tmp['$opacity'] = opacities[i]
                return tmp
            })
            
            for (let i = 3; i< len_li; i++) {
                states.push(back)
            }
            this.indexCurrent = 1

        } else {
            let points = [0.175, 0.325, 0.5, 0.675, 0.825]
            let indeces = [2, 3, 4, 3, 2]
            let ratios = [0.35, 0.65, 1, 0.65, 0.35]
            let opacities = [0.5, 0.75, 1, 0.75, 0.5]
            
            points[0] = ratio_large * ratios[0] * 0.5
            points[4] = 1 - points[0]
            let ratio_overlap = ratios[0] + ratios[1] + 0.5 - 1 / ratio_large * 0.5
            points[1] = (ratios[0]* (1-ratio_overlap) + ratios[1]* 0.5) * ratio_large
            points[3] = 1 - points[1]
            states = points.map((p, i)=>{
                let tmp = {}
                tmp['&zIndex'] = indeces[i]
                tmp['width'] = w * ratios[i]
                tmp['height'] = h * ratios[i]
                tmp['left'] = width * points[i] - tmp['width'] * 0.5
                tmp['top'] = height * 0.5 - tmp['height'] * 0.5
                tmp['$opacity'] = opacities[i]
                return tmp
            })
            for (let i = 5; i< len_li; i++) {
                states.push(back)
            }
            this.indexCurrent = 2

        }
        
        console.log(states)
        console.log(g)
        this.options = $.extend({
            speed: 1000,
            delay: 3000
        }, options)//拓展
        // this.states = [
        //     { '&zIndex': 1, width: 120, height: 150, top: 71, left: 134, $opacity: 0.5 },
        //     { '&zIndex': 2, width: 130, height: 170, top: 61, left: 0, $opacity: 0.6 },
        //     { '&zIndex': 3, width: 170, height: 218, top: 37, left: 110, $opacity: 0.7 },
        //     { '&zIndex': 4, width: 224, height: 288, top: 0, left: 262, $opacity: 1 },
        //     { '&zIndex': 3, width: 170, height: 218, top: 37, left: 468, $opacity: 0.7 },
        //     { '&zIndex': 2, width: 130, height: 170, top: 61, left: 620, $opacity: 0.6 },
        //     { '&zIndex': 1, width: 120, height: 150, top: 71, left: 496, $opacity: 0.5 }
        // ]
        this.states = states
        // this.states = [{ '&zIndex': 4, width: w, height: h, top: height * 0.5 - h * 0.5, left: width * 0.5 - w * 0.5, $opacity: 1 },]
        this.lis = this.$ele.find('li')
        this.interval
        // 点击切换到下一张

        this.$ele.find('section.next').on('click', function () {
            this.stop()
            this.next()
            this.play()
        }.bind(this))
        // 点击切换到上一张
        this.$ele.find('section.previous').on('click', function () {
            this.stop()
            this.prev()
            this.play()
        }.bind(this))
        this.move()
        // 让轮播图开始自动播放
        this.play()
    }


    Slide.prototype = {


        // 原型是一个对象，所以写成一个花括号

        // move()方法让轮播图到达states指定的状态
        // <1>当页面打开时将轮播图从中心点展开
        // <2>当轮播图已经展开时，会滚动轮播图(需要翻转states数组中的数据)
        move: function () {
            let indexCurrent = this.indexCurrent
            d3.selectAll('.text-zySlide').style('opacity', (d, i)=> (i == indexCurrent)?1:0)
            this.lis.each(function (i, el) {
                $(el)
                    .css('z-index', this.states[i]['&zIndex'])
                    .finish().animate(this.states[i], this.options.speed)
                    // .stop(true,true).animate(states[i], 1000)
                    .find('img').css('opacity', this.states[i].$opacity)
            }.bind(this))
        },
        // 让轮播图切换到下一张
        next: function () {
            let indexCurrent = this.indexCurrent
            this.indexCurrent = (indexCurrent +　this.len_li + 1) % this.len_li
            this.states.unshift(this.states.pop())
            this.move()
            
        },
        // 让轮播图滚动到上一张
        prev: function () {
            let indexCurrent = this.indexCurrent
            this.indexCurrent = (indexCurrent +　this.len_li - 1) % this.len_li
            this.states.push(this.states.shift())
            this.move()
        },
        play: function () {

            this.interval = setInterval(function () {//这个this指window
                // setInterval、setTimeOut 中的this指向window

                // states.unshift(states.pop())       //从后往前走
                // states.push(states.shift())     //从前往后走
                this.next()
            }.bind(this), this.options.delay)
        },
        // 停止自动播放
        stop: function () {
            // var _this = this
            clearInterval(this.interval)
        }

    }
    $.fn.zySlide = function (options) {
        this.each(function (i, ele) {
            new Slide(ele, options)
        })
        return this
    }
})(jQuery)

