var videoObj, player, timeout, x5fullscreen, hadVideo = V.HouseImagesVideoJson.length > 0;
$(function () {
    var attachFastClick = Origami.fastclick;
    attachFastClick(document.body);

    if (!hadVideo) {
        $(".no-video").css("display", "flex");
        return false;
    } else {
        $("#wrapper").show();
        var hashArgs = urlHashArgs(),
            curIndex = 0;
        $.each(V.HouseImagesVideoJson, function (i, n) {
            if (hashArgs["PKHouseVideo"] == n.PKHouseVideo) {
                curIndex = i;
                return false;
            }
        });

        // 缩略图列表
        var imgListSwiper = new Swiper('#imgListSwiper', {
            initialSlide: 0 || curIndex,
            slidesPerView: 'auto',
            spaceBetween: 14
        });

        var player = new ChimeeMobilePlayer({
            wrapper: '#wrapper',
            poster: V.HouseImagesVideoJson[curIndex].IndexImgPath,
            src: V.HouseImagesVideoJson[curIndex].VideoPath,
            autoplay: true,
            controls: false,
            playsInline: true,
            preload: 'auto',
            x5VideoPlayerType: 'h5',
            x5VideoPlayerFullscreen: true,
            x5VideoOrientation: 'landscape|portrait',
            xWebkitAirplay: true,
            muted: false
        });

        videoObj = {
            data: V.HouseImagesVideoJson, // 所有视频
            total: V.HouseImagesVideoJson.length,
            props: { // 将后端返回的data的key
                id: "PKHouseVideo",
                name: "HouseVideoTag",
                src: "VideoPath",
                thumb: "IndexImgPath"
            },
            index: 0 || curIndex, // 当前展示第几个视频
            thumbCurClass: " videoCur", // thumb图的当前选中项的className
            imgTitle: "#imgTitle", // 左下角标题标签
            imgListWrapper: "#imgListWrapper", // 包含标题和缩略图的box
            imgListSwiper: "#imgListSwiper", // 缩略图
            imgListSlideBox: "#imgListSlideBox",
            imgListBtn: "#imgListBtn", // 缩略图toggle按钮
            imgListShow: true, // 当前缩略图是否显示
            renderthumb: function () { // 渲染视频列表
                var imgSlideBoxHtml = "",
                    _this = this;
                _this.data.forEach(function (currentValue, index, array) {
                    var panoCur = index == _this.index ? _this.thumbCurClass : '';
                    imgSlideBoxHtml = imgSlideBoxHtml + '<div class="swiper-slide' + panoCur + '" data-index="' + index + '"><i class="thumb-icon video-pause-icon"></i><img class="img-item" src="' + currentValue[_this.props.thumb] + '"><div class="img-item-title">' + currentValue[_this.props.name] + '</div></div>';
                });
                $(_this.imgListSlideBox).html(imgSlideBoxHtml);
                $(_this.imgTitle).text(_this.data[_this.index][_this.props.name]);
            },
            changeImgList: function () { // 图片列表当前选中项改变的时候，重新改变这一块的布局
                var _this = this;
                $(_this.imgListSlideBox + " .swiper-slide").eq(_this.index).addClass(_this.thumbCurClass).siblings().removeClass(_this.thumbCurClass);
                $(_this.imgTitle).text(_this.data[_this.index][_this.props.name]);
            },
            videoChange: function () { // 图片更改事件汇总
                var _this = this;
                _this.changeImgList();
                history.replaceState({}, 'new', "#" + _this.props.id + "=" + _this.data[_this.index][_this.props.id]);

                player.load({
                    poster:  _this.data[_this.index][_this.props.thumb],
                    src: _this.data[_this.index][_this.props.src]
                });
            },
            thumbImgToggle: function () { // 图片列表的显示隐藏事件
                var _this = this;
                var imgListBtn = $(_this.imgListBtn),
                    imgListWrapper = $(_this.imgListWrapper),
                    imgTitleSvg = imgListBtn.find("use");
                var show = _this.imgListShow;
                if (show) {
                    var animateObj = {
                        height: imgListBtn.height() + "px"
                    };
                    imgListWrapper.stop(true, true).animate(animateObj, 300);
                    imgTitleSvg.attr("xlink:href", "#icon-shangjiantou");
                    _this.imgListShow = false;
                } else {
                    var animateObj = {
                        height: "96px"
                    };
                    imgListWrapper.stop(true, true).animate(animateObj, 300);
                    imgTitleSvg.attr("xlink:href", "#icon-xiajiantou");
                    _this.imgListShow = true;
                }
            }
        };

        videoObj.renderthumb();
        imgListSwiper.update();

        player.on("loadstart", function () {
            $("#videoMask").addClass("loading").removeClass("pause error").show();
        });
        player.on("canplay", function () {
            $("#videoMask").addClass("pause").removeClass("loading error").show();
        });
        player.on("play", function () {
            timeout && clearTimeout(timeout);
            timeout = setTimeout(function () {
                // 隐藏图片列表
                videoObj.imgListShow = true;
                videoObj.thumbImgToggle();
            }, 3000);
            $("#videoMask").removeClass("loading pause error");

            setTimeout(function(){
                $("#imgListWrapper").css("z-index", 10000000);
            }, 800);
        });
        player.on("waiting", function () {
            $("#videoMask").addClass("loading").removeClass("pause error").show();
        });
        player.on("playing", function () {
            $("#videoMask").removeClass("loading pause error");
            $(".videoCur").find(".thumb-icon").removeClass("video-pause-icon").addClass("video-play-icon");
        });
        player.on("pause", function () {
            timeout && clearTimeout(timeout);
            $("#videoMask").addClass("pause").removeClass("loading error").show();
            $(".videoCur").find(".thumb-icon").removeClass("video-play-icon").addClass("video-pause-icon");
        });
        player.on("ended", function () {
            timeout && clearTimeout(timeout);
            $("#video").attr("data-status", 0);
            $("#videoMask").addClass("pause").removeClass("loading error").show();
            $(".videoCur").find(".thumb-icon").removeClass("video-play-icon").addClass("video-pause-icon");
            // 显示图片列表
            videoObj.imgListShow = false;
            videoObj.thumbImgToggle();
        });
        player.on("error", function () {
            $("#videoMask").addClass("error").removeClass("loading pause").show();
        });
        $("video")[0].addEventListener("x5videoenterfullscreen", function () {
            x5fullscreen = true;
        });
        $("video")[0].addEventListener("x5videoexitfullscreen", function () {
            x5fullscreen = false;
        });


        $("#videoMask").on("click", function (event) {
            event.stopPropagation();
            var $video = $("#video");
            timeout && clearTimeout(timeout);
            
            if ($video.attr("data-status") === "1") {
                timeout = setTimeout(function () {
                    // 隐藏图片列表
                    videoObj.imgListShow = true;
                    videoObj.thumbImgToggle();
                }, 3000);
            }
            // 隐藏/显示图片列表
            videoObj.thumbImgToggle();
        });

        // 缩略图的显示隐藏
        $("#imgListBtn").on("click", function (event) {
            event.stopPropagation();
            var $video = $("#video");
            if ($video.attr("data-status") === "1") {
                timeout = setTimeout(function () {
                    // 隐藏图片列表
                    videoObj.imgListShow = true;
                    videoObj.thumbImgToggle();
                }, 3000);

            }
            // 隐藏/显示图片列表
            videoObj.thumbImgToggle();
        });

        // 点击缩略图切换场景
        $("#imgListSwiper").on("click", ".swiper-slide", function () {
            var $this = $(this),
                _thisIndex = $this.attr("data-index") * 1,
                currentIndex = videoObj.index;
            if (_thisIndex == currentIndex) {
                var $video = $("#video"),
                    status = $video.attr("data-status");
                if (status > 0) {
                    player.pause();
                    $video.attr("data-status", 0);
                } else {
                    player.play();
                    $video.attr("data-status", 1);
                }
                return false;
            }
            timeout && clearTimeout(timeout);
            imgListSwiper.slideTo(_thisIndex, Math.abs(currentIndex - _thisIndex) * 500, false);
            $("#imgListSwiper").find(".swiper-slide").eq(currentIndex).find(".thumb-icon").removeClass("video-play-icon").addClass("video-pause-icon");
            videoObj.index = _thisIndex;
            videoObj.videoChange();
        });

        // 获取url上的参数，确定当前显示的是第几个视频
        function urlHashArgs() {
            var args = {};
            var hash = location.hash.substring(1);
            var pairs = hash.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf("=");
                if (pos == -1) continue;
                var name = pairs[i].substring(0, pos);
                var value = pairs[i].substring(pos + 1);
                value = decodeURIComponent(value);
                args[name] = value;
            }
            return args;
        }
    }
});
