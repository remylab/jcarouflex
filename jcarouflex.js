(function($) {                                          // Compliant with jquery.noConflict()
$.fn.jCarouflexLite = function(o) {
    o = $.extend({   
        dir:1,
        btnPrev: null,
        btnNext: null,
        
        speed: 800,
        easing: null,

        vertical: false,
        visible: 3,
        scroll: 1,
        start:1,

        beforeStart: null,
        afterEnd: null
    }, o || {});

    return this.each(function() {                           // Returns the element collection. Chainable.

        var running = false, animCss=o.vertical?"top":"left", sizeCss=o.vertical?"height":"width";
        var div = $(this), ul = $("ul", div), tLi = $("li", ul), tl = tLi.size(), v = o.visible, sc = o.scroll, st = o.start;

        v = Math.min(tl,v);
        
        sc = Math.min(v,sc); 
        sc = Math.max(1,sc);

        st = Math.min(tl,st); 
        st = Math.max(1,st);
        
        ul.empty()
        tLi.each(function(i){
        	if ( o.dir == 1 ) { ul.append(this);  }
        	else {  ul.prepend(this);  }
        });
        tLi = $("li", ul);
        
        if ( st>1 ) {
          ul.append(tLi.clone());
          var liS = $("li", ul).slice(st-1,st+tl-1).clone();
          ul.empty().append( liS);
          //$("li",ul).each(function(i){$("#log").append($(this).html());});   
          tLi = $("li", ul);
        }
          
        ul.prepend(tLi.slice(tl-sc).clone())
          .append(tLi.slice(0,sc).clone());

        var li = $("li", ul), itemLength = li.size(), curr = 0;
        div.css("visibility", "visible");
        
        li.css({overflow: "hidden"});li.css("float", o.vertical ? "none" : "left");
        ul.css({margin: "0", padding: "0", position: "relative", "list-style-type": "none", "z-index": "1"});
        div.css({overflow: "hidden", position: "relative", "z-index": "2", left: "0px"});

        var liSize = o.vertical ? height(li) : width(li);   // Full li size(incl margin)-Used for animation
        var ulSize = liSize * itemLength;                   // size of full ul(total length, not just for the visible items)
        var divSize = liSize * v;                           // size of entire div(total length for just the visible items)

        li.css({width: li.width(), height: li.height()});
        ul.css(sizeCss, ulSize+"px").css(animCss, -(sc*liSize));

        div.css(sizeCss, divSize+"px");                     // Width of the DIV. length of visible images

        $(this).bind('moveDir', function(event,dir) {
            return go( dir*o.dir );
        });
            
        if(o.btnPrev)
            $(o.btnPrev).click(function() {
                return go(-1*o.dir);
            });

        if(o.btnNext)
            $(o.btnNext).click(function() {
                return go(1*o.dir);
            });

        function vis() {
            return li.slice(v,v+1);
        };
              
        function go(dir) { 
  
            if(!running) { 
                running = true;

                if(o.beforeStart) o.beforeStart.call(this, vis());
                var nLi = (dir==1) ? $("li", ul).slice(2*sc,tl+2*sc).clone() : $("li", ul).slice(0,tl).clone() ;;
        
                curr = (dir==1)?2*sc:0;

                var newLeft = (dir==1)?-2*sc*liSize:0; 
                //running = false; return; 
                ul.animate(
                    animCss == "left" ? { left: newLeft } : { top: newLeft } , o.speed, o.easing,
                    function() {


                        ul.empty().append(nLi)
                        .prepend(nLi.slice(tl-sc).clone()).append(nLi.slice(0,sc).clone());

                        ul.css(animCss, -sc*liSize); 
                        
                        li = $("li", ul);
                        if(o.afterEnd) o.afterEnd.call(this, vis());
                        
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
        teaserScroll:1,   
        slidesScroll:1,
        teaserDir:1,
        slidesDir:1,
        pause:false
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
    
    $( o.teaser ).jCarouflexLite({
        visible:o.visibleTeaser,
        vertical:o.verticalTeaser,
        speed: o.speed,
        scroll: o.teaserScroll,
        dir:o.teaserDir,
        start:(o.teaserDir==1)?o.teaserScroll+1: $("li",o.teaser ).length-o.visibleTeaser-o.teaserScroll+1,
        userBeforeStart: o.beforeStart,
        userAfterEnd: o.afterEnd,
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
        $( o.slides ).jCarouflexLite({
            visible: o.visibleSlides,
            vertical: o.verticalSlides,
            speed: o.speed,
            scroll: o.slidesScroll,
            dir:o.slidesDir,
            start:(o.slidesDir==1)?1: $("li",o.slides ).length-o.slidesScroll+1,
            afterEnd:function(a){
            	if ( o.afterEnd ) o.afterEnd(a);
                onCycleEnd();
            },
            beforeStart:function(a){
            	if ( o.beforeStart ) o.beforeStart(a);
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