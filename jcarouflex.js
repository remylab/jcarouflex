(function($) {                                          // Compliant with jquery.noConflict()
$.fn.xv924 = function(o) {
    o = $.extend({
        dir:1,
        speed: 200,
        vertical: false,
        visible: 3,
        start: 0,
        scroll: 1,
        beforeStart: null,
        afterEnd: null
    }, o || {});

    return this.each(function() {                           // Returns the element collection. Chainable.

        var running = false, animCss=o.vertical?"top":"left", sizeCss=o.vertical?"height":"width";
        var div = $(this), ul = $("ul", div), tLi = $("li", ul), tl = tLi.size(), v = o.visible, is = o.start;

        ul.prepend(tLi.slice(tl-v-1+1).clone())
          .append(tLi.slice(0,v).clone());
        o.start += v;

        var li = $("li", ul), itemLength = li.size(), curr = o.start;
        div.css("visibility", "visible");

        li.css({overflow: "hidden"});li.css("float", o.vertical ? "none" : "left");
        ul.css({margin: "0", padding: "0", position: "relative", "list-style-type": "none", "z-index": "1"});
        div.css({overflow: "hidden", position: "relative", "z-index": "2", left: "0px"});

        var liSize = o.vertical ? height(li) : width(li);   // Full li size(incl margin)-Used for animation
        var ulSize = liSize * itemLength;                   // size of full ul(total length, not just for the visible items)
        var divSize = liSize * v;                           // size of entire div(total length for just the visible items)

        li.css({width: li.width(), height: li.height()});
        ul.css(sizeCss, ulSize+"px").css(animCss, -(curr*liSize));

        div.css(sizeCss, divSize+"px");                     // Width of the DIV. length of visible images

        $(this).bind('moveDir', function(event,dir) {
            return go( curr+(o.dir*dir*o.scroll) );
        });

        function vis() {
            return li.slice(curr).slice(0,v);
        };

        function go(to) {
            if(!running) {

                if(o.beforeStart)
                    o.beforeStart.call(this, vis());
                if(to+is<=o.start-v-1) {           // If first, then goto last
                    ul.css(animCss, -((itemLength-(v*2))*liSize)+"px");
                    // If "scroll" > 1, then the "to" might not be equal to the condition; it can be lesser depending on the number of elements.
                    curr = to==o.start-v-1 ? itemLength-(v*2)-1 : itemLength-(v*2)-o.scroll;
                } else if(to>=itemLength-v+1) { // If last, then goto first
                    ul.css(animCss, -( (v) * liSize ) + "px" );
                    // If "scroll" > 1, then the "to" might not be equal to the condition; it can be greater depending on the number of elements.
                    curr = to==itemLength-v+1 ? v+1 : v+o.scroll;
                } else curr = to;                            // If neither overrides it, the curr will still be "to" and we can proceed.

                running = true;

                ul.animate(
                    animCss == "left" ? { left: -(curr*liSize) } : { top: -(curr*liSize) } , o.speed, o.easing,
                    function() {
                        if(o.afterEnd)
                            o.afterEnd.call(this, vis());
                        running = false;
                    }
                );

            }
            return false;
        };
    });
};

function css(el, prop) {
    return parseInt($.css(el[0], prop)) || 0;
};
function width(el) {
    return  el[0].offsetWidth + css(el, 'marginLeft') + css(el, 'marginRight');
};
function height(el) {
    return el[0].offsetHeight + css(el, 'marginTop') + css(el, 'marginBottom');
};

})(jQuery);
jQuery.jCarouflex = function(o) {
    o = $.extend({
        teaser: null,
        slides: null,
        teaserNext:null,
        teaserPrev:null,
        btnPause:null,
        afterPause:null,
        speed: 500,
        pauseTime:3000,
        visibleTeaser:3,
        visibleSlides:1,
        verticalTeaser:false,
        verticalSlides:true,
        scroll:1,
        teaserDir:1,
        slidesDir:1,
        pause:false,
        start:1
    }, o || {});

    /* init carousel data */
    var n = "jCarouflex" ,ist=0,iss=0, nli = $( o.teaser ).find("li").size() ;
    $( o.teaser ).data(n,{
        dir:1,
        force:false,
        isMoving:false,
        stop:false,
        pause:o.pause
    });

    o.start = Math.min(Math.max(1,o.start),nli);


    if ( o.slides != null ) ist = nli -o.visibleTeaser-1;
    $( o.teaser ).xv924({
        visible:o.visibleTeaser,
        vertical:o.verticalTeaser,
        speed: o.speed,
        scroll: o.scroll,
        dir:o.teaserDir,
        start:ist+(o.start-1)*o.teaserDir,
        beforeStart:function(a){
            $( o.teaser ).data(n).isMoving = true;
            if (o.slides)
                $( o.slides ).trigger("moveDir",$( o.teaser ).data(n).dir);
        },
        afterEnd:function(a){
            if ( o.slides == null ) onCycleEnd();

        }
    });

    $(o.teaser).bind('pause', function(event,b) {
        pause(b);
    });
    if ( o.btnPause ) {
        $(o.btnPause).bind('click', function(event) {
            pause(!$( o.teaser ).data(n).pause);
        });
    }

    if ( o.slides ) {
        if ( o.slidesDir == -1 ) iss = $( o.slides ).find("li").size()-1;
        $( o.slides ).xv924({
            visible: o.visibleSlides,
            vertical: o.verticalSlides,
            speed: o.speed,
            scroll: o.scroll,
            dir:o.slidesDir,
            start:iss+(o.start-1)*o.slidesDir,
            afterEnd:function(a){
                onCycleEnd();
            }
        });
    }

    /* slider teaser controls */
    if ( o.teaserPrev ) {
        $(o.teaserPrev).click(function() {
            $( o.teaser ).data(n).force = true;
            $( o.teaser ).data(n).dir = -1;
            $( o.teaser ).trigger("moveDir",-1);
        });
    }
    if ( o.teaserNext ) {
        $(o.teaserNext).click(function() {
            $( o.teaser ).data(n).force = true;
            $( o.teaser ).data(n).dir = 1;
            $( o.teaser ).trigger("moveDir",1);
        });
    }

    if ( $(o.teaser).hasClass("pause") ) {
        $( o.teaser ).mouseenter(function() {
            $(o.teaser).data(n).stop = true;
        });
        $( o.teaser ).mouseleave(function() {
            $(o.teaser).data(n).stop = false;
        });
    }

    if ( $(o.slides).hasClass("pause") ) {
        $( o.slides ).mouseenter(function() {
            $(o.teaser).data(n).stop = true;
        });
        $( o.slides ).mouseleave(function() {
            $(o.teaser).data(n).stop = false;
        });
    }

    /* start carousel */
    start();

    function start() {
        setTimeout(function() {
            restartCycle();
        }, o.pauseTime  );
    }
    function pause(b) {
        $(o.teaser).data(n).stop = false;
        $( o.teaser ).data(n).pause = b;
        if(o.afterPause)
            o.afterPause.call(this, $(o.btnPause), $( o.teaser ).data(n).pause );
    }
    function onCycleEnd() {
        $( o.teaser ).data(n).isMoving = false;
        $( o.teaser ).data(n).force = false;
    }
    function restartCycle(){
        var d = $(o.teaser).data(n);
        if (!d.pause) {
            if ( !d.isMoving && !d.force && !d.stop ) {
                d.dir = 1;
                $(o.teaser).trigger("moveDir",1);
                $(o.teaser).data(n,d);
            }
        }
        setTimeout(function() {
            restartCycle();
        }, o.pauseTime );
    }
};