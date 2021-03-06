// KeymanWeb 2.0
// Copyright 2010 Tavultesoft Pty Ltd

/*****************************************/
/*                                       */
/*   On-Screen (Visual) Keyboard Code    */
/*                                       */
/*****************************************/

(function()
{
  // Declare KeymanWeb object
  var keymanweb=window['tavultesoft']['keymanweb'];
  
  // Define standard keycode numbers  
  var keyCodes={
  	"K_BKSP":8,"K_TAB":9,"K_ENTER":13,
  	"K_SHIFT":16,"K_CONTROL":17,"K_ALT":18,"K_PAUSE":19,"K_CAPS":20,
  	"K_ESC":27,"K_SPACE":32,"K_PGUP":33,
  	"K_PGDN":34,"K_END":35,"K_HOME":36,"K_LEFT":37,"K_UP":38,
  	"K_RIGHT":39,"K_DOWN":40,"K_SEL":41,"K_PRINT":42,"K_EXEC":43,
  	"K_INS":45,"K_DEL":46,"K_HELP":47,"K_0":48,
  	"K_1":49,"K_2":50,"K_3":51,"K_4":52,"K_5":53,"K_6":54,"K_7":55,
  	"K_8":56,"K_9":57,"K_A":65,"K_B":66,"K_C":67,"K_D":68,"K_E":69,
  	"K_F":70,"K_G":71,"K_H":72,"K_I":73,"K_J":74,"K_K":75,"K_L":76,
  	"K_M":77,"K_N":78,"K_O":79,"K_P":80,"K_Q":81,"K_R":82,"K_S":83,
  	"K_T":84,"K_U":85,"K_V":86,"K_W":87,"K_X":88,"K_Y":89,"K_Z":90,
  	"K_NP0":96,"K_NP1":97,"K_NP2":98,
  	"K_NP3":99,"K_NP4":100,"K_NP5":101,"K_NP6":102,
  	"K_NP7":103,"K_NP8":104,"K_NP9":105,"K_NPSTAR":106,
  	"K_NPPLUS":107,"K_SEPARATOR":108,"K_NPMINUS":109,"K_NPDOT":110,
  	"K_NPSLASH":111,"K_F1":112,"K_F2":113,"K_F3":114,"K_F4":115,
  	"K_F5":116,"K_F6":117,"K_F7":118,"K_F8":119,"K_F9":120,
  	"K_F10":121,"K_F11":122,"K_F12":123,"K_NUMLOCK":144,"K_SCROLL":145,
  	"K_LSHIFT":160,"K_RSHIFT":161,"K_LCONTROL":162,"K_RCONTROL":163,	
  	"K_LALT":164,"K_RALT":165,
    "K_COLON":186,"K_EQUAL":187,"K_COMMA":188,"K_HYPHEN":189,
    "K_PERIOD":190,"K_SLASH":191,"K_BKQUOTE":192,
    "K_LBRKT":219,"K_BKSLASH":220,"K_RBRKT":221,
  	"K_QUOTE":222,"K_oE2":226,
    "K_LOPT":50001,"K_ROPT":50002,
    "K_NUMERALS":50003,"K_SYMBOLS":50004,"K_CURRENCIES":50005,
    "K_UPPER":50006,"K_LOWER":50007,"K_ALPHA":50008,
    "K_SHIFTED":50009,"K_ALTGR":50010,
    "K_TABBACK":50011,"K_TABFWD":50012
	};
  
  var codesUS=[['0123456789',';=,-./`','[\\]\''],[')!@#$%^&*(',':+<_>?~','{|}"']];

  var dfltCodes=["K_BKQUOTE","K_1","K_2","K_3","K_4","K_5","K_6","K_7","K_8","K_9","K_0",
    "K_HYPHEN","K_EQUAL","K_*","K_*","K_*","K_Q","K_W","K_E","K_R","K_T",
    "K_Y","K_U","K_I","K_O","K_P","K_LBRKT","K_RBRKT","K_BKSLASH","K_*",
    "K_*","K_*","K_A","K_S","K_D","K_F","K_G","K_H","K_J","K_K","K_L",
    "K_COLON","K_QUOTE","K_*","K_*","K_*","K_*","K_*","K_oE2",
    "K_Z","K_X","K_C","K_V","K_B","K_N","K_M","K_COMMA","K_PERIOD",
    "K_SLASH","K_*","K_*","K_*","K_*","K_*","K_SPACE"];
  
  var dfltText='`1234567890-=\xA7~~qwertyuiop[]\\~~~asdfghjkl;\'~~~~~?zxcvbnm,./~~~~~ '
              +'~!@#$%^&*()_+\xA7~~QWERTYUIOP{}\\~~~ASDFGHJKL:"~~~~~?ZXCVBNM<>?~~~~~ ';
    
  // Declare keymanweb osk, util and device objects
  var osk=keymanweb['osk'],util=keymanweb['util'],device=util.device,dbg=keymanweb.debug;
  
  osk._Box=null;              // Main DIV for OSK
	osk._DivVKbd=null;
  osk._DivVKbdHelp=null;
  osk._Visible=0;             // Whether or not actually visible
  osk._Enabled=1;             // Whether or not enabled by UI
  osk._VShift=[];
  osk._VKeySpans=[];
  osk._VKeyDown=null;
	osk._VKbdContainer=null;
	osk._VOriginalWidth=1;      // Non-zero default value needed
  osk._BaseLayout='us';       // default BaseLayout
  osk._BaseLayoutEuro={};     // I1299 (not currently exposed, but may need to be e.g. for external users)
  osk._BaseLayoutEuro['se'] = '\u00a71234567890+´~~~QWERTYUIOP\u00c5\u00a8\'~~~ASDFGHJKL\u00d6\u00c4~~~~~<ZXCVBNM,.-~~~~~ ';  // Swedish
  osk._BaseLayoutEuro['uk'] = '`1234567890-=~~~QWERTYUIOP[]#~~~ASDFGHJKL;\'~~~~~\\ZXCVBNM,./~~~~~ '; // UK
  
  // Additional members (mainly for touch input devices)
  osk.lgTimer=null;           // language switching timer
  osk.lgKey=null;             // language menu key element
  osk.hkKey=null;             // OSK hide key element
  osk.spaceBar=null;          // space bar key element
  osk.lgList=null;            // language menu list
  osk.frameColor='#ad4a28';   // KeymanWeb standard frame color
  osk.keyPending=null;        // currently depressed key (if any)
  osk.fontFamily='';          // layout-specified font for keyboard
  osk.fontSize='1em';         // layout-specified fontsize for keyboard
  osk.layout=null;            // reference to complete layout
  osk.layers=null;            // reference to layout (layers array for this device)
  osk.layerId='default';      // currently active OSK layer (if any)
  osk.nextLayer='default';    // layer to be activated after pressing key in current layer  
  osk.layerIndex=0;           // currently displayed layer index
  osk.currentKey='';          // id of currently pressed key (desktop OSK only)
  osk.subkeyDelayTimer=null;  // id for touch-hold delay timer
  osk.popupPending=false;     // KMTouch popup flag 
  osk.styleSheet=null;        // current OSK style sheet object, if any
  osk.loadRetry=0;            // counter for delayed loading, if keyboard loading prevents OSK being ready at start
  
  // Additional members for desktop OSK
  osk.x=99;                    // last visible offset left
  osk.y=0;                    // last visible offset top
  osk.width=1;                // Saved width of OSK (since actual width only available if visible)
  osk.height=1;               // Saved height of OSK
  osk.rowHeight=1;            // Current row height in px
  osk.nRows=1;                // Number of rows in each layer of current layout
  osk.vpScale=1;              // Current viewport scale factor  (not valid until initialized)
  osk.closeButton=null;       // icon to hide OSK
  osk.resizeIcon=null;        // resizing icon 
  osk.resizing=0;             // resizing flag
  osk.pinImg=null;            // icon to restore OSK to default position
  osk.userPositioned=0;       // Set to true(<>0) if dragged by user
  osk.dfltX='';               // Left position set by page code
  osk.dfltY='';               // Top position set by page code
  osk.noDrag=false;           // allow page to override user OSK dragging
  osk.shim=null;              // Shim DIV for OSK
  osk.keytip=null;            // Key hint (phones)
  osk.touchY=0;               // First y position of touched key

  /**
   * Function     addEventListener
   * Scope        Public
   * @param       {string}            event     event name
   * @param       {function(Object)}  func      event handler
   * @return      {boolean}   
   * Description  Wrapper function to add and identify OSK-specific event handlers
   */    
  osk['addEventListener'] = function(event, func)
  {
    return util.addEventListener('osk.'+event, func);
  }
  
  /**
   * Function     _TitleBarInterior
   * Scope        Private   
   * Description  Title bar interior formatting and element event handling
   */       
  osk._TitleBarInterior = function()
  {
    var Ldiv = util._CreateElement('DIV');
    var Ls = Ldiv.style;
    Ls.paddingLeft='2px';
    Ls.cursor='move';
    Ls.background='#ad4a28';
    Ls.font='8pt Tahoma,Arial,sans-serif';  //I2186
    
    // Add container for buttons, handle mousedown event
    var LdivButtons = util._CreateElement('DIV');
    LdivButtons.className = 'kmw-title-bar-actions';
    LdivButtons.onmousedown=osk._CancelMouse;

    // Add close button, handle click and mousedown events    
    var Limg = util._CreateElement('DIV');
    Limg.className='kmw-close-button';
    Limg.onmousedown=osk._CancelMouse;
    Limg.onclick=function () {osk._Hide(true);}
    osk.closeButton = Limg;    
    LdivButtons.appendChild(Limg);
    
    /**
     * Move OSK back to default position
     */    
    osk.restorePosition = function()
    {
      if(osk._Visible) 
      { 
        keymanweb._FocusLastActiveElement();  // I2036 - OSK does not unpin to correct location
        osk.loadCookie(); osk.userPositioned=false; osk.saveCookie();
        osk._Show();
        osk.doResizeMove(); //allow the UI to respond to OSK movements
      }
      if(osk.pinImg) osk.pinImg.style.display='none';
      if(window.event) window.event.returnValue=false;
    }
    
    // Add 'Unpin' button for restoring OSK to default location, handle mousedown and click events
    Limg=osk.pinImg = util._CreateElement('DIV');  //I2186
    Limg.className='kmw-pin-image';
    Limg.title='Pin the On Screen Keyboard to its default location on the active text box';
    Limg.onclick=osk.restorePosition;
    Limg.onmousedown=osk._CancelMouse;
    Limg.style.display='none'; 
    
    // Do not use Unpin button on touch screens (OSK location fixed)
    if(!device.touchable) LdivButtons.appendChild(Limg); // I3363 (Build 301)
    
    // Attach button container to title bar 
    Ldiv.appendChild(LdivButtons);

    // Add title bar caption
    Limg=keymanweb._TitleElement=util._CreateElement('SPAN');  // I1972
    Limg.className='kmw-title-bar-caption';
    Limg.innerHTML='Tavultesoft KeymanWeb';
    Ldiv.appendChild(Limg);
    
    return Ldiv;
  }
  
  // End of TitleBarInterior
               
  /**
   * Function     enabled
   * Scope        Public   
   * @return      {boolean|integer}    True if KMW OSK enabled
   * Description  Test if KMW OSK is enabled
   */    
  osk['isEnabled'] = osk.isEnabled = function()
  {
    return osk._Enabled;
  }

  /**
   * Function     isVisible
   * Scope        Public   
   * @return      {boolean|integer}    True if KMW OSK visible
   * Description  Test if KMW OSK is actually visible
   * Note that this will usually return false after any UI event that results in (temporary) loss of input focus    
   */    
  osk['isVisible'] = osk.isVisible = function()
  {    
    return osk._Visible;
  }

  /**
   * Function     getRect //TODO:  This is probably not correct, anyway!!!!!
   * Scope        Public   
   * @return      {Object.<string,number>}   Array object with position and size of OSK container
   * Description  Get rectangle containing KMW Virtual Keyboard 
   */    
  osk['getRect'] = osk.getRect = function()			// I2405
  {
    var p={};
    if(osk._DivVKbd)
    {
      p['left'] = p.left = util._GetAbsoluteX(osk._DivVKbd); 
      p['top']  = p.top  = util._GetAbsoluteY(osk._DivVKbd); 
      p['width']  = p.width  = util._GetAbsoluteX(osk._DivVKbdHelp) - util._GetAbsoluteX(osk._DivVKbd) + osk._DivVKbdHelp.offsetWidth;
      p['height'] = p.height = util._GetAbsoluteY(osk._DivVKbdHelp) - util._GetAbsoluteY(osk._DivVKbd) + osk._DivVKbdHelp.offsetHeight;
    }
    else
    {
      p['left'] = p.left = util._GetAbsoluteX(osk._Box); 
      p['top']  = p.top  = util._GetAbsoluteY(osk._Box); 
      p['width']  = p.width  = util._GetAbsoluteX(osk._Box) + osk._Box.offsetWidth;
      p['height'] = p.height = util._GetAbsoluteY(osk._Box) + osk._Box.offsetHeight;
    } 
    return p;
  } 

  /**
   * Allow the UI or page to set the position and size of the OSK
   * and (optionally) override user repositioning or sizing
   * 
   * @param       {Object.<string,number>}   p  Array object with position and size of OSK container
  **/    
  osk['setRect'] = osk.setRect = function(p)			
  {
    var q={};

    if(osk._Box == null || device.formFactor != 'desktop') return;
    
    var b=osk._Box,bs=b.style;
    if('left' in p)
    {
      bs.left=(p['left']-util._GetAbsoluteX(b)+b.offsetLeft)+'px';
      osk.dfltX=bs.left;
    }
    
    if('top' in p)
    {
      bs.top=(p['top']-util._GetAbsoluteY(b)+b.offsetTop)+'px';
      osk.dfltY=bs.top;
    }
    
    //Do not allow user resizing for non-standard keyboards (e.g. EuroLatin)
    if(osk._DivVKbd != null)
    {  
      var d=osk._DivVKbd,ds=d.style;
      
      // Set width, but limit to reasonable value
      if('width' in p)
      {
        var w=(p['width']-(b.offsetWidth-d.offsetWidth));
        if(w < 0.2*screen.width) w=0.2*screen.width; 
        if(w > 0.9*screen.width) w=0.9*screen.width;        
        ds.width=w+'px'; osk.width=w;
      }
      
      // Set height, but limit to reasonable value
      // This sets the default font size for the OSK in px, but that
      // can be modified at the key text level by setting 
      // the font size in em in the kmw-key-text class
      if('height' in p)
      {
        var h=(p['height']-(b.offsetHeight-d.offsetHeight));
        if(h < 0.1*screen.height) h=0.1*screen.height;
        if(h > 0.5*screen.height) h=0.5*screen.height;            
        ds.height=h+'px'; ds.fontSize=(h/8)+'px'; osk.height=h;
      }
      
      // Fix or release user resizing
      if('nosize' in p)
        if(osk.resizeIcon) osk.resizeIcon.style.display=(p['nosize'] ? 'none' : 'block');

    } 
    // Fix or release user dragging   
    if('nomove' in p)
    {
      osk.noDrag=p['nomove'];
      if(osk.pinImg) osk.pinImg.style.display=(p['nomove'] || !osk.userPositioned) ? 'none' : 'block';
    }
    // Save the user-defined OSK size
    osk.saveCookie();
  } 
 
    
  /**
   * Get position of OSK window
   * 
   * @return      {Object.<string,number>}     Array object with OSK window position
  **/    
  osk.getPos = function()
  {
    var Lkbd=osk._Box, p={};
    p.left = osk._Visible ? Lkbd.offsetLeft : osk.x; 
    p.top = osk._Visible ? Lkbd.offsetTop : osk.y; 
    return p;
  }
  
  /**
   * Function     setPos
   * Scope        Private   
   * @param       {Object.<string,number>}    p     Array object with OSK left, top
   * Description  Set position of OSK window, but limit to screen, and ignore if  a touch input device
   */    
  osk['setPos'] = osk.setPos = function(p)
  {
    if(typeof(osk._Box) == 'undefined' || device.touchable) return; // I3363 (Build 301)
    if(osk.userPositioned)
    {
      var Px=p['left'],Py=p['top'];
      if(typeof(Px) != 'undefined')
      {
        if(Px < -0.8*osk._Box.offsetWidth) Px = -0.8*osk._Box.offsetWidth; 
        if(osk.userPositioned) {osk._Box.style.left=Px+'px'; osk.x = Px;}  
      }
      // May not be needed - vertical positioning is handled differently and defaults to input field if off screen
      if(typeof(Py) != 'undefined')
      {
        if(Py < 0) Py = 0;  
        if(osk.userPositioned) {osk._Box.style.top=Py+'px'; osk.y = Py;}
      }
    }
        
    if(osk.pinImg)
      osk.pinImg.style.display=(osk.userPositioned ? 'block' : 'none');
  }
  
  /**
   * Function     _VKeyGetTarget
   * Scope        Private
   * @param       {Object}    e     OSK event
   * @return      {Object}          Target element for key in OSK
   * Description  Identify the OSK key clicked 
   */    
  osk._VKeyGetTarget = function(e)
  {
    var Ltarg;
    e = keymanweb._GetEventObject(e);   // I2404 - Manage IE events in IFRAMEs
    if(!e) return null;
    if (e.target) Ltarg = e.target;
    else if (e.srcElement) Ltarg = e.srcElement;
    else return null;
    if (Ltarg.nodeType == 3) // defeat Safari bug
      Ltarg = Ltarg.parentNode;
    if (Ltarg.tagName == 'SPAN') Ltarg = Ltarg.parentNode;
    return Ltarg;
  }
   
   /**
   * Handle button touch event 
   * 
   * @param       {Object}    k      element touched
   * @param       {Object}    e      OSK event   
   */    
  osk.touchKey = function(k,e)
  {
    e.preventDefault(); e.cancelBubble=true;
    if(typeof e.stopImmediatePropagation == 'function') e.stopImmediatePropagation();
    else if(typeof e.stopPropagation == 'function') e.stopPropagation();

    // Ignore multi-touch events
    if(typeof e.touches == 'object' && e.touches.length > 1) return;

    osk.touchY=(typeof(e.touches) == 'object' ? e.touches[0].clientY : e.clientY);
     
    // Position and display the key tip (phones)    (Build 349)
    if(osk.keytip != null)
    {           
      if(k.className.indexOf('kmw-key-default') > 0 && k.id.indexOf('K_SPACE') < 0)
      {                      
        var kc=k.firstChild,kcs=kc.style,kt=osk.keytip,kts=kt.style;
        kt.textContent=kc.textContent;     
        kts.fontFamily=util.getStyleValue(kc,'font-family');
        var px=util.getStyleInt(kc,'font-size');
        if(px != 0) kts.fontSize=(1.5*px)+'px';
        var xLeft=util._GetAbsoluteX(k),
          xTop=util._GetAbsoluteY(k),
          xWidth=k.offsetWidth;
        
        // Cannot read height or width of tip, calculate from size of text and padding
        var tWidth=(1.5*kc.offsetWidth)+
            util.getStyleInt(kt,'padding-left')+
            util.getStyleInt(kt,'padding-right'),
          kmRight=util.getStyleInt(k,'margin-right'),
          tHeight=(1.5*kc.offsetHeight)+
            util.getStyleInt(kt,'padding-top')+
            util.getStyleInt(kt,'padding-bottom'),
          kmTop=util.getStyleInt(k,'margin-top');
        kts.left=(xLeft-kmRight+(xWidth-tWidth)/2)+'px';
        kts.top=(util._GetAbsoluteY(k)-kmTop-osk._Box.offsetTop-tHeight)+'px';
        kts.display='block';  
      }
    }
    
    // Get key name (K_...) from element ID
    var keyName=k.id.split('-')[1];

    // Special function keys need immediate action
    if(keyName == 'K_LOPT' || keyName == 'K_ROPT')
    {
      // TODO: using deferred action helps to prevent unwanted selection of background element 
      // on Android, but still doesn't do it properly
      osk.highlightKey(k,true);
      window.setTimeout(function(){osk.clickKey(k);},0);
    }
    // Also backspace, to allow delete to repeat while key held
    else if(keyName == 'K_BKSP')
    {
      osk.highlightKey(k,true);
      keymanweb.KO(1,keymanweb._LastActiveElement,"");
      osk.deleting=true;
      window.setTimeout(osk.repeatDelete,500);
    }
    // Otherwise enable keystroke on release
    else if(osk.keyPending == null) 
    {
      // Save active key to enable correct touch-move and release behaviour
      osk.keyPending=k; 
    
      // Highlight key when touched pending action or release 
      osk.highlightKey(k,true);
    
      // If this key has subkey, start timer to display subkeys after delay, set up release
      var popupDelay=(device.app == '' ? 500 : 100);  // Delay must be less than native touch-hold delay (build 352)
      if(k.subKeys != null) osk.subkeyDelayTimer=window.setTimeout(function(){osk.showSubKeys(k);},popupDelay);
  
    }
  } 
  
  /**
   *  Repeat backspace as long as the backspace key is held down
   **/      
  osk.repeatDelete = function()
  {
    if(osk.deleting)
    {
      keymanweb.KO(1,keymanweb._LastActiveElement,"");
      window.setTimeout(osk.repeatDelete,200);
    }
  }
  
  /**
   *  Add or remove a class from a keyboard key (when touched or clicked)
   *  (Assumes that there is a default class name as well.)   
   *  
   *  @param    {Object}    key   key affected
   *  @param    {boolean}   on    add or remove highlighting
   *  @param    {string=}   name  name of class to append, defaulting to kmw-key-touched     
   **/                  
  osk.highlightKey = function(key,on,name)
  {
    var classes=key.className,
        cs=arguments.length>2?' '+arguments[2]:' kmw-key-touched';
    if(classes != '')
    {  
      if(classes.indexOf(cs) >= 0)
      {
        if(!on) key.className=classes.replace(cs,'');
      }
      else
      {
        if(on) key.className=classes+cs;
      }
    }
  }
  
   /**
   * Highlight active keyboard button when moving pointer over key
   * 
   * @param       {Object}      k      element touched
   * @param       {Object}      e      OSK event   
   */    
  osk.moveOverKeys = function(k,e)
  { 
    e.preventDefault(); e.cancelBubble=true;
    if(typeof e.stopImmediatePropagation == 'function') e.stopImmediatePropagation();
    else if(typeof e.stopPropagation == 'function') e.stopPropagation();
    
    // Don't change highlighting unless a key is pressed
    if(osk.keyPending == null) return;
    
    // Get touch position, active key element coordinates, and active key name
    var x=typeof e.touches == 'object' ? e.touches[0].clientX : e.clientX,
        y=typeof e.touches == 'object' ? e.touches[0].clientY : e.clientY;
    var x0=util._GetAbsoluteX(k),y0=util._GetAbsoluteY(k),//-document.body.scrollTop,
      x1=x0+k.offsetWidth,y1=y0+k.offsetHeight,
      keyName=k.id.split('-')[1],
      onKey=(x > x0 && x < x1 && y > y0 && y < y1);
    
    // Control key highlighting for KeymanWeb 
    if(device.app == '') 
    {
      // Highlight key at touch position (except for special control keys, for which separate timing is needed)
      if(keyName != 'K_LOPT' && keyName != 'K_ROPT') osk.highlightKey(k,onKey);  
  
      // Test for subkey array, highlight key at touch position (and clear other highlighting) if so
      if(k.subKeys != null)
      {
        var i,sk,skBox;
        skBox=document.getElementById('kmw-popup-keys');
 
        // Show popup keys immediately if touch moved up towards key array (KMEW-100, Build 353)
        if((osk.touchY-y > 5) && skBox == null)
        {
          if(osk.subkeyDelayTimer) window.clearTimeout(osk.subkeyDelayTimer);
          osk.showSubKeys(k); skBox=document.getElementById('kmw-popup-keys');
        } 
 
        for(i=0; i<k.subKeys.length; i++)
        {
          try 
          {
            sk=skBox.childNodes[i].firstChild;
            x0=util._GetAbsoluteX(sk); y0=util._GetAbsoluteY(sk);//-document.body.scrollTop;
            x1=x0+sk.offsetWidth; y1=y0+sk.offsetHeight;
            onKey=(x > x0 && x < x1 && y > y0 && y < y1);
            osk.highlightKey(sk,onKey);
            if(onKey) osk.highlightKey(k,false);
          } catch(ex){}           
        }    
      }
    }
    // and for KeymanTouch
    else
    {
      osk.highlightKey(k,onKey);
      
      //Prevent pop-up key array from being displayed if already moved off key
      // This is no longer used - cleared by delay instead
      // if(!onKey  && osk.popupPending && typeof(window['oskCreatePopup']) == 'function') 
      // {
      //   window['oskCreatePopup'](null,0,0); osk.popupPending = false;
      // } 
    }
  }
     
   /**
   * Display touch-hold array of 'sub-keys' above the currently touched key
   * @param       {Object}    e      primary key element 
   */    
  osk.showSubKeys = function(e)
  {
    // Do not show subkeys if key already released
    if(osk.keyPending == null) return;

    // Clear keytip hint if any
    if(osk.keytip != null) osk.keytip.style.display='none';
    
    // Do not display subkey array for Shift if extra layers do not exist
    
    // Create holder DIV for subkey array, and set styles
    
    // The holder is position:fixed, but the keys do not need to be, as no scrolling 
    // is possible while the array is visible.  So it is simplest to let the keys have
    // position:static and display:inline-block
    var subKeys=document.createElement('DIV'),i,sk,
      t,ts,t1,ts1,kDiv,ks,btn,bs;
    
    subKeys.id='kmw-popup-keys';
    
    // Must set position dynamically, not in CSS
    var ss=subKeys.style;
    ss.bottom=(parseInt(e.style.bottom,10)+parseInt(e.style.height,10)+10)+'px';

    // Set key font according to layout, or defaulting to OSK font
    // (copied, not inherited, since OSK is not a parent of popup keys)
    ss.fontFamily=osk.fontFamily;

    // Copy the font size from the parent key, allowing for style inheritance
    ss.fontSize=util.getStyleValue(e,'font-size');
    ss.visibility='hidden';
 
    var nKeys=e.subKeys.length,nRow,nRows,nCols;
    nRows=Math.min(Math.ceil(nKeys/9),2);
    nCols=Math.ceil(nKeys/nRows);
    if(nRows > 1) ss.width=(nCols*e.offsetWidth+nCols*5)+'px';

    
    // Add nested button elements for each sub-key
    for(i=0; i<nKeys; i++)
    {
      sk=e.subKeys[i];   
      kDiv=document.createElement('DIV');
      kDiv.className='kmw-key-square-ex';
      kDiv.keyId=sk['id'];          
      ks=kDiv.style; 
      nRow=Math.floor(i/nCols);
      if(nRows > 1 && nRow > 0) ks.marginTop='5px'; 
      if(typeof sk['width'] != 'undefined')
        kDiv.width=ks.width=(parseInt(sk['width'],10)*e.offsetWidth/100)+'px';
      else      
        kDiv.width=ks.width=e.offsetWidth+'px'; 
      ks.height=e.offsetHeight+'px';
      
      btn=document.createElement('DIV');
      osk.setButtonClass(sk,btn);
      
      // Create (temporarily) unique ID by prefixing 'popup-' to actual key ID
      if(typeof(sk['layer']) == 'string' && sk['layer'] != '')
        btn.id='popup-'+sk['layer']+'-'+sk['id'];
      else
        btn.id='popup-default-'+sk['id'];    
      
      // Must set button size (in px) dynamically, not from CSS
      bs=btn.style; bs.height=ks.height; bs.width=ks.width;
      bs.boxSizing=bs.MozBoxSizing='border-box';
        
      // Must set position explicitly, at least for Android
      bs.position='absolute';     
      
      t=util._CreateElement('SPAN'); 
      t.className='kmw-key-text'; 
      if(sk['text'] == null || sk['text'] == '') 
      {
        t.innerHTML='\xa0';
        if(typeof sk['id'] == 'string')
        {
          if(/^U_[0-9A-F]{4}$/i.test(sk['id'])) 
            t.innerHTML=String.fromCharCode(parseInt(sk['id'].substr(2),16));
        } 
      } 
      else t.innerHTML=sk['text'];
      
      // The following  line is needed to ensure correct cell sizing with auto-sized container            
      bs.overflow='hidden';
      bs.border='1px solid #888888'; 
      bs.webkitTapHighlightColor='rgba(0,0,0,0)';

      // Override the font name and size if set in the layout
      ts=t.style; 
      ts.fontSize=osk.fontSize;     //Build 344, KMEW-90 
      if(typeof sk['font'] == 'string' && sk['font'] != '') ts.fontFamily=sk['font'];      
      if(typeof sk['fontsize'] == 'string' && sk['fontsize'] != 0) ts.fontSize=sk['fontsize']; 
 
      btn.appendChild(t);                              
      kDiv.appendChild(btn);
      subKeys.appendChild(kDiv);      
    }
                                                                                   
    // Send the subkey array to iOS, with centre,top of base key position
    if(device.app != '' && typeof(window['oskCreatePopup']) == 'function')
    {                           
      var xBase=util._GetAbsoluteX(e)-util._GetAbsoluteX(osk._DivVKbd)+e.offsetWidth/2,
          yBase=util._GetAbsoluteY(e)-util._GetAbsoluteY(osk._DivVKbd);
      osk.popupPending=true;
      window['oskCreatePopup'](e.subKeys,xBase,yBase);
      
      // Since the pop-up keys are created with a separate thread, we need to
      // suppress key action - especially layer change - until key touched again. 
      // This helped for KMEA but caused issues for KMEI and has now been disabled again.
      // May want to restrict this fix to KMEA Shift key. (KMEA-1)
      //osk.highlightKey(osk.keyPending,false);
      //osk.keyPending=null;     
      
      return;
    }

    // Otherwise append the touch-hold (subkey) array to the OSK    
    osk._Box.appendChild(subKeys);

    // And correct its position with respect to that element
    ss=subKeys.style;
    var x=util._GetAbsoluteX(e)+0.5*(e.offsetWidth-subKeys.offsetWidth), y,
      xMax=(util.landscapeView()?screen.height:screen.width)-subKeys.offsetWidth;
    
    if(x > xMax) x=xMax; if(x < 0) x=0; ss.left=x+'px';   
    
    // Then add the callout DIV triangle (with a border, by superposing a second DIV triangle)
    t=document.createElement('DIV'); t.className='arrow-border'; ts=t.style;
    x=util._GetAbsoluteX(e)+0.5*e.offsetWidth-16;
    y=subKeys.offsetTop+subKeys.offsetHeight-1;
    ts.left=x+'px'; ts.top=y+'px';
    
    t1=document.createElement('DIV'); t1.className='arrow-content'; 
    ts=t1.style;
    ts.left=(x+1)+'px'; ts.top=(y-1)+'px';
    t.appendChild(t1);
    
    subKeys.appendChild(t);  
    
    // Finally make it visible
    ss.visibility='visible'; 
  }
         
  /**
   * Function     getVKDictionaryCode
   * Scope        Private
   * @param       {string}      keyName   custom virtual key code to lookup in the dictionary   
   * @return      {number}                key code > 255 on success, or 0 if not found
   * Description  Look up a custom virtual key code in the virtual key code dictionary KVKD.  On first run, will build the dictionary.
   */    
  osk.getVKDictionaryCode = function(keyName)
  {
    if(!keymanweb._ActiveKeyboard['VKDictionary'])
    {
      var a=[];
      if(typeof keymanweb._ActiveKeyboard['KVKD'] == 'string') 
      {
        // Build the VK dictionary
        // TODO: Move the dictionary build into the compiler -- so compiler generates code such as following.  Makes the VKDictionary member unnecessary 
        //       this.KVKD={"K_ABC":256,"K_DEF":257,...};
        var s=keymanweb._ActiveKeyboard['KVKD'].split(' ');
        for(var i=0; i<s.length; i++) a[s[i]]=i+256;
      }
      keymanweb._ActiveKeyboard['VKDictionary']=a;
    }
    
    var res=keymanweb._ActiveKeyboard['VKDictionary'][keyName];
    return res ? res : 0;
  }
  
  /**
   * Simulate a keystroke according to the touched keyboard button element
   * 
   * @param       {Object}      e      element touched (or clicked)
   */    
  osk.clickKey = function(e)
  { 
    var Lelem = keymanweb._LastActiveElement, Ls, Le, Lkc, Lsel;    

    // Each button id is of the form <layer>-<keyCode>, e.g. 'ctrlshift-K_Q' or 'popup-shift-K_501', etc.
    var t=e.id.split('-');
    if(t.length < 2) return true; //shouldn't happen, but...
 
    // Test of code used for callback from KMEI, KMEA   (Build 353)
    //if(t[0] == 'popup') {keymanweb['executePopupKey'](e.id.replace('popup-','')); return true;}

    // Remove popup prefix before processing keystroke (KMEW-93)
    if(t[0] == 'popup') t.splice(0,1);
        
    if(Lelem != null)
    {
      // Get key name and keyboard shift state (needed only for default layouts and physical keyboard handling) 
      var layer=t[0],keyName=t[1], keyShiftState=osk.getModifierState(osk.layerId),nextLayer=keyShiftState;

      if(typeof(e.key) != 'undefined') nextLayer=e.key['nextlayer']; 
      if(keymanweb._ActiveElement == null) keymanweb._ActiveElement=Lelem;    
      switch(keyName)
      {
        case 'K_LSHIFT':
        case 'K_RSHIFT':
        case 'K_SHIFT':
          osk.highlightKey(e,false);
          osk.updateLayer(nextLayer ? nextLayer : 'shift');
          osk._Show();
          return true;
        case 'K_LCONTROL':
        case 'K_RCONTROL':
        case 'K_LCTRL':
        case 'K_RCTRL':
        case 'K_CTRL':        
          osk.highlightKey(e,false);
          osk.updateLayer(nextLayer ? nextLayer : 'ctrl');
          osk._Show();
          return true;
        case 'K_LALT':
        case 'K_RALT':
        case 'K_ALT':
          osk.highlightKey(e,false);
          osk.updateLayer(nextLayer ? nextLayer : 'alt');
          osk._Show();
          return true;
        case 'K_ALTGR':
          osk.highlightKey(e,false);
          osk.updateLayer(nextLayer ? nextLayer : 'ctrlalt');
          osk._Show();
          return true;
        case 'K_LOPT':
          if(device.app == '')
            osk.showLanguageMenu();
          else
          {
            osk.highlightKey(e,false);            
            if('showKeyboardList' in keymanweb) keymanweb['showKeyboardList']();
          }   
          return true;
        case 'K_ROPT':
          if(device.app == '')
          { 
            keymanweb._IsActivatingKeymanWebUI=0; osk._Hide(true); 
            keymanweb.hideCaret(); keymanweb._LastActiveElement = 0;
          }
          else
          {
            osk.highlightKey(e,false);            
            if('hideKeyboard' in keymanweb) keymanweb['hideKeyboard']();
          }
          return true;
          
        case 'K_CURRENCIES':
        case 'K_NUMERALS':
        case 'K_SHIFTED': 
        case 'K_UPPER':
        case 'K_LOWER':
        case 'K_SYMBOLS':
          osk.highlightKey(e,false);
          osk.updateLayer(nextLayer ? nextLayer : 'default');
          osk._Show();        
          return true;         
          
        default:
      }        

      // Restore default key color
      osk.highlightKey(e,false);

      // Prevent any output from 'ghost' (unmapped) keys
      if(keyName != 'K_SPACE')
      {
        var keyText=e.childNodes[0].innerHTML;
        if(keyText == '' || keyText == '&nbsp;') return true;
      }

      Ls=Lelem._KeymanWebSelectionStart;
      Le=Lelem._KeymanWebSelectionEnd;
      Lsel=keymanweb._Selection; 
      keymanweb._IsActivatingKeymanWebUI = 1;
      keymanweb._IgnoreNextSelChange = 100;
      keymanweb._FocusLastActiveElement();
      if(keymanweb._IsMozillaEditableIframe(Lelem,0)) Lelem = Lelem.documentElement;
      if(document.selection && Lsel != null) Lsel.select();
      Lelem._KeymanWebSelectionStart=Ls;
      Lelem._KeymanWebSelectionEnd=Le;
      keymanweb._IgnoreNextSelChange = 0;
       // ...end I3363 (Build 301)     
      keymanweb._CachedSelectionStart = null; // I3319
      keymanweb._DeadkeyResetMatched();       // I3318

      // First check the virtual key, and process shift, control, alt or function keys 
      Lkc = {Ltarg:Lelem,Lmodifiers:0,Lcode:keyCodes[keyName],LisVirtualKey:true}; 

      // Set LisVirtualKey to flase to ensure that nomatch rule does not fire for U_xxxx keys
      if(keyName.substr(0,2) == 'U_') Lkc.LisVirtualKey=false;

      // Get code for non-physical keys (T_KOKAI, U_05AB etc)
      if(typeof Lkc.Lcode == 'undefined')
      {
        Lkc.Lcode = osk.getVKDictionaryCode(keyName);// Updated for Build 347
        if(!Lkc.Lcode)
        {
          // Key code will be Unicode value for U_xxxx keys
          if(keyName.substr(0,2) == 'U_')
          {                 
            var tUnicode=parseInt(keyName.substr(2),16);
            if(!isNaN(tUnicode)) Lkc.Lcode=tUnicode;  
          }
        }
      }

      // Override key shift state if specified for key in layout (corrected for popup keys KMEW-93)            
      var lx=(typeof e.key == 'undefined' ? null : e.key['layer']);
      if(lx == null) 
        keyShiftState=osk.getModifierState(layer);
      else
        keyShiftState=osk.getModifierState(lx);                 

      // Define modifiers value for sending to keyboard mapping function
      Lkc.Lmodifiers = keyShiftState*0x10; 

      // Include *limited* support for mnemonic keyboards (Sept 2012)
      if(keymanweb._ActiveKeyboard && (keymanweb._ActiveKeyboard['KM']))
      {         
        var keyText=e.firstChild.firstChild.wholeText;
        Lkc.LisVirtualKey=false; Lkc.LisVirtualKeyCode=false;
        Lkc.vkCode=Lkc.Lcode;      
        if(Lkc.Lcode != 32) // exception required, March 2013
        {
          if(typeof keyText == 'string' && keyText != '')
            Lkc.Lcode=keyText.charCodeAt(0);
          else
            Lkc.Lcode=0;          
          if(Lkc.Lcode == 160) Lkc.Lcode = 0;
        }
        Lkc.Lmodifiers=0;  
      }
      else Lkc.vkCode=Lkc.Lcode;

      // Support version 1.0 KeymanWeb keyboards that do not define positional vs mnemonic
      if(typeof keymanweb._ActiveKeyboard['KM'] == 'undefined')
      {
        Lkc.Lcode=keymanweb._USKeyCodeToCharCode(Lkc); Lkc.LisVirtualKey=false;
      }
      // Pass this key code and state to the keyboard program
      if(!keymanweb._ActiveKeyboard || (Lkc.Lcode != 0 && !keymanweb._ActiveKeyboard['gs'](Lelem, Lkc))) 
      {              
        // Restore the virtual key code if a mnemonic keyboard is being used
        Lkc.Lcode=Lkc.vkCode;  

        // Handle unmapped keys, including special keys 
        switch(keyName)
        {
          case 'K_BKSP':  //Only desktop UI, not touch devices. TODO: add repeat while mouse down for desktop UI 
            keymanweb.KO(1,keymanweb._LastActiveElement,"");               
            break;
          case 'K_TAB':
            var bBack=(osk.layerId == 'shift');
            keymanweb.moveToNext(bBack);         
            break;
          case 'K_TABBACK':
            keymanweb.moveToNext(true);         
            break;
          case 'K_TABFWD':          
            keymanweb.moveToNext(false);         
            break;            
          case 'K_ENTER':     
            // Insert new line in text area fields
            if(Lelem.nodeName == 'TEXTAREA' || (typeof Lelem.base != 'undefined' && Lelem.base.nodeName == 'TEXTAREA')) 
              keymanweb.KO(0, Lelem, '\n');
            // Or move to next field from TEXT fields
            else
            { 
              if(Lelem.nodeName == 'INPUT' && (Lelem.type == 'search' || Lelem.type == 'submit'))
                Lelem.form.submit();
              else if(typeof(Lelem.base) != 'undefined' && (Lelem.base.type == 'search' || Lelem.base.type == 'submit'))
              {
                Lelem.base.disabled=false;  
                Lelem.base.form.submit();
              }
              else 
                keymanweb.moveToNext(false);                         
             }
            break;
          case 'K_SPACE':
            keymanweb.KO(0, Lelem, ' ');
            break;
          default:
          // All of the following is physical layout dependent, so should be avoided if possible.  All keys should be mapped.
            var ch=0,n=Lkc.Lcode;
            // Test for fall back to U_xxxx key id (Build 350)            
            if((keyName.substr(0,2) == 'U_') && (n > 32) && !(n>127 && n<!160))  
              ch=String.fromCharCode(n);
            else if(n >= 48 && n <= 57)
              ch = codesUS[keyShiftState][0][n-48];
            else if(n >=65 && n <= 90)
              ch = String.fromCharCode(n+(keyShiftState?0:32));
            else if(n >= 186 && n <= 192)
              ch = codesUS[keyShiftState][1][n-186];
            else if(n >= 219 && n <= 222)
              ch = codesUS[keyShiftState][2][n-219];

            if(ch)keymanweb.KO(0, Lelem, ch);           
        }        
      }

      // Test if this key has a non-default next layer
      if(typeof e.key != 'undefined' && e.key['nextlayer'] !== null) osk.nextLayer=e.key['nextlayer'];

      // Refresh the OSK if a different layer must be displayed
      if(osk.nextLayer != osk.layerId)
      {
        osk.layerId=osk.nextLayer; 
        osk._Show();
      }                

      /* I732 END - 13/03/2007 MCD: End Positional Layout support in OSK */
      Lelem._KeymanWebSelectionStart=null;
      Lelem._KeymanWebSelectionEnd=null;
    }
    keymanweb._IsActivatingKeymanWebUI = 0;	// I2498 - KeymanWeb OSK does not accept clicks in FF when using automatic UI
    return true;  
  }    

   /**
   * Function     getlayerId
   * Scope        Private
   * @param       {number}      m     shift modifier code
   * @return      {string}            layer string from shift modifier code (desktop keyboards)
   * Description  Get name of layer form code (Note reversal: ctrlalt, not altctrl)
   */    
  osk.getLayerId = function(m)
  {
    var s='';
    if(m == 0) return 'default';
    if(m & 1) s = 'shift';
    if(m & 4) s = 'alt'+s;
    if(m & 2) s = 'ctrl'+s;
    return s;
  }
  
  /**
   * Get modifier key state from layer id
   * 
   * @param       {string}      layerId       layer id (e.g. ctrlshift)
   * @return      {number}                    modifier key state (desktop keyboards)
   */    
  osk.getModifierState = function(layerId)
  {
      var modifier=0;   
      if(layerId.indexOf('shift') >= 0) modifier += 1;
      if(layerId.indexOf('ctrl')  >= 0) modifier += 2;
      if(layerId.indexOf('alt')   >= 0) modifier += 4;
      return modifier;
  }
  
  /**
   * Sets the new layer id, allowing for toggling shift/ctrl/alt
   * 
   * @param       {string}      id      layer id (e.g. ctrlshift)
   */    
  osk.updateLayer = function(id)
  {
    var s=osk.layerId,idx=id;
    // Need to test if target layer is a standard layer
    idx=idx.replace('shift','');
    idx=idx.replace('ctrl','');
    idx=idx.replace('alt','');
    // If default or a non-standard layer, select it
    if(osk.layerId == 'default' || osk.layerId == 'numeric' || osk.layerId == 'symbol' || osk.layerId == 'currency' || idx != '')
    {
      s = id; 
    }
    // Otherwise modify the layer according to the current state and key pressed
    else
    {
      var modifier=osk.getModifierState(s);
      s=s.replace('shift','');
      s=s.replace('ctrl','');
      s=s.replace('alt','');
      switch(id)
      {
        case 'shift':
          modifier ^= 1; break;
        case 'ctrl':
          modifier ^= 2; break;
        case 'alt':
          modifier ^= 4; break;
        default:
          s = id;   
      }
      //
      if(s != 'default')
      {
        if(modifier & 1) s = 'shift'+s;
        if(modifier & 2) s = 'ctrl'+s;
        if(modifier & 4) s = 'alt'+s;
      }
    }
    if(s == '') s = 'default';

    // Re-order alt-ctrl (layer is called ctrlalt, since that is more familiar)
    osk.layerId = s.replace('altctrl','ctrlalt');
 
    // Check that requested layer is defined   (KMEA-1, but does not resolve issue)
    for(var i=0; i<osk.layers.length; i++)
      if(osk.layerId == osk.layers[i].id) return;

    // Show default layer if an undefined layer has been requested
    osk.layerId='default';
    
  }   

  /**
   * Indicate the current language and keyboard on the space bar
   **/
  osk.showLanguage = function()
  {
    var lgName='',kbdName='';

    if(keymanweb._ActiveStub)
    {
      lgName=keymanweb._ActiveStub['KL'];
      kbdName=keymanweb._ActiveStub['KN'];
    }
    else if(keymanweb._ActiveLanguage)
      lgName=keymanweb._ActiveLanguage['KN'];
    else
      lgName='English';

    try
    {
      var t=osk.spaceBar.firstChild.firstChild;
      if(typeof(t.parentNode.className) == 'undefined' || t.parentNode.className == '')
        t.parentNode.className='kmw-spacebar';
      else
        t.parentNode.className +=' kmw-spacebar';
      
      t.className='kmw-spacebar-caption';
      kbdName=kbdName.replace(/\s*keyboard\s*/i,'');
      if(kbdName == lgName) t.innerHTML=lgName; else t.innerHTML=lgName+' ('+kbdName+')';
    }
    catch(ex){}    
  }
      
  /**
   * Cancel any pending (timed) keystroke touch events 
   * 
   * @param       {Object}      Ltarg     touched element
   * @param       {Object}      e         touchend event
   */    
  osk.releaseKey = function(Ltarg,e)
  { //if(Ltarg.keyCode.Lcode != -4) return;
    e.preventDefault(); e.cancelBubble=true;
    if(typeof e.stopImmediatePropagation == 'function') e.stopImmediatePropagation(); 
    else if(typeof e.stopPropagation == 'function') e.stopPropagation(); 
      
    //Clear the keytip, if any
    if(osk.keytip != null) osk.keytip.style.display='none';
    
    if(osk.subkeyDelayTimer) window.clearTimeout(osk.subkeyDelayTimer);
    if(osk.lgTimer) window.clearTimeout(osk.lgTimer);
    osk.subkeyDelayTimer=osk.lgTimer=null; 
 
    // Remove highlighting from backspace key 
    if(e.target.id && e.target.id.indexOf('K_BKSP') >= 0)
      osk.highlightKey(e.target,false);
    else if(e.target.parentNode.id && e.target.parentNode.id.indexOf('K_BKSP') >= 0)
      osk.highlightKey(e.target.parentNode,false); 
    osk.deleting=false;

    if(osk.keyPending !== null)
    {   
      var lastKey=null;    
      if(typeof e.changedTouches != 'undefined' && e.changedTouches.length > 0)
        lastKey=document.elementFromPoint(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
      else if(typeof e.target != 'undefined') 
        lastKey=e.target;

      if(lastKey != null) 
      {
        if(lastKey.id == '') lastKey=lastKey.parentNode;
        {          

          // Check that still in subkey array or on original target, then execute keystroke if so
          if(lastKey == osk.keyPending || lastKey.parentNode.parentNode.id == 'kmw-popup-keys') 
          {             
            osk.clickKey(lastKey); osk.keyPending=null; 
          }
          else
          {
            osk.highlightKey(osk.keyPending,false);
          }
        }          
      }
      osk.keyPending=null; 
    }    
    
    // Remove the subkey array, if any
    var sk=document.getElementById('kmw-popup-keys');
    if(sk != null) sk.parentNode.removeChild(sk);
  }
  
  /**
   * Display list of installed keyboards in pop-up menu
   **/    
  osk.showLanguageMenu = function()
  {
    var n=0,kbdList=keymanweb._KeyboardStubs,nKbds=kbdList.length;  
    if(nKbds < 1) return;
            
    // Create the menu list container element 
    var menu=osk.lgList=util._CreateElement('DIV'),ss;
    osk.lgList.id='kmw-language-menu';
    
    // Insert a transparent overlay to prevent anything else happening during keyboard selection,
    // but allow the menu to be closed if anywhere else on screen is touched
    menu.shim=util._CreateElement('DIV');
    menu.shim.id='kmw-language-menu-background';
    menu.shim.addEventListener('touchstart',
      function(e)
      {
        e.preventDefault(); osk.hideLanguageList();
        if(e.touches.length > 1) 
        {
          var sX=e.touches[1].pageX,sY=e.touches[1].pageY;
          if(sX > osk.hkKey.offsetLeft && sX < osk.hkKey.offsetLeft+osk.hkKey.offsetWidth &&
             sY > osk.hkKey.offsetTop && sY < osk.hkKey.offsetTop+osk.hkKey.offsetHeight) osk.showBuild();
        }
      },false);   
    document.body.appendChild(menu.shim);
            
    // Add two nested DIVs to properly support iOS scrolling with momentum 
    //  c.f. https://github.com/joelambert/ScrollFix/issues/2
    var m2=util._CreateElement('DIV'),s2=m2.style,
        m3=util._CreateElement('DIV'),s3=m3.style;
    m2.id='kmw-menu-scroll-container'; m3.id='kmw-menu-scroller';

    // Support momentum scrolling on iOS
    if('WebkitOverflowScrolling' in s2) s2.WebkitOverflowScrolling='touch'; 
        
    m2.appendChild(m3); 
    menu.appendChild(m2);

    // Add menu index strip
    var i,x,mx=util._CreateElement('DIV');
    mx.id='kmw-menu-index';
    for(i=1; i<=26; i++)
    {
      x=util._CreateElement('P'); 
      x.innerHTML=String.fromCharCode(i+64);
      mx.appendChild(x);
    } 
  
    // Add index selection (for a large menu)
    mx.ontouchstart=function(e){osk.scrollToLanguage(e,m2,m3);}
    menu.appendChild(mx);
        
 //TODO: not sure if either of these two handlers ar actually needed.  touchmove handler may be doing all that is necessary.   
    // Add scroll end event handling to override body scroll
    menu.addEventListener('scroll',function(e){
      osk.lgList.scrolling=true;
      },false);
    m2.addEventListener('scroll',function(e){
      //osk.lgList.scrolling=true;
      if(m2.scrollTop < 1)m2.scrollTop=1;
      if(m2.scrollTop > m2.scrollHeight-m2.offsetHeight-1)m2.scrollTop=m2.scrollHeight-m2.offsetHeight-1;
      },false);

    // Add a list of keyboards to the innermost DIV
    osk.lgList.activeLgNo=osk.addLanguagesToMenu(m3,kbdList);
    
    // Get number of visible (language) selectors
    var nLgs=m3.childNodes.length-1;
     
    // Do not display until sizes have been calculated
    osk.lgList.visibility='hidden';
   
    // Append menu to document body, not to OSK
    document.body.appendChild(osk.lgList); 

    // Adjust size for viewport scaling (probably not needed for iOS, but check!)
    if(device.OS == 'Android' && 'devicePixelRatio' in window)
      osk.lgList.style.fontSize=(2/window.devicePixelRatio)+'em';    
     
    // Adjust height according to user-set style
    var itemHeight=m3.firstChild.offsetHeight,barWidth=0,
        s=menu.style,menuHeight=nLgs*itemHeight,
        maxHeight=window.innerHeight-osk.lgKey.offsetHeight-16; 
    menu.firstY=0;
    
    // Adjust width for pixel scaling on Android tablets
    if(device.OS == 'Android' && device.formFactor == 'tablet' && 'devicePixelRatio' in window)
    {
      var w=parseInt(util.getStyleValue(menu,'width'),10),ms=menu.style;
      if(!isNaN(w)) ms.width=ms.maxWidth=(2*w/window.devicePixelRatio)+'px';
      w=parseInt(util.getStyleValue(m2,'width'),10); ms=m2.style;
      if(!isNaN(w)) ms.width=ms.maxWidth=(2*w/window.devicePixelRatio)+'px';      
      w=parseInt(util.getStyleValue(m3,'width'),10); ms=m3.style;
      if(!isNaN(w)) ms.width=ms.maxWidth=(2*w/window.devicePixelRatio)+'px';      
    }
  
    // Correct maxheight for viewport scaling (iPhone/iPod only)
    if(device.OS == 'iOS' && device.formFactor == 'phone')
    {
      barWidth=(util.landscapeView() ? 36 : 0);
      maxHeight=(maxHeight-barWidth)*util.getViewportScale();
    }
    
    // Explicitly set position and height 
    s.left=util._GetAbsoluteX(osk.lgKey)+'px'; 
    if(menuHeight > maxHeight) menuHeight=maxHeight;
    s.height=menuHeight+'px';

    // Anchor menu to bottom of screen, except for Firefox!   
    if('onmozorientationchange' in screen)   // probably the best test for Firefox
    {
      s.top=(util._GetAbsoluteY(osk._Box)+osk._Box.offsetHeight-menuHeight+window.pageYOffset-4)+'px';
      s.bottom='auto';
    }
    else
    {
      s.bottom=-window.pageYOffset+barWidth+'px';
      s.top='auto';
    }
    
    // Explicitly set the scroller and index heights to the container height
    mx.style.height=s2.height=s.height;
    
    // Adjust the index font size and line height
    var dy=mx.childNodes[1].offsetTop-mx.childNodes[0].offsetTop,
        lineHeight=Math.floor(menu.offsetHeight/26.0),
        scale=Math.round(100.0*lineHeight/dy)/100.0,
        factor=(scale > 0.6 ? 1 : 2);

    if(scale > 1.25) scale=1.25;
    
    for(i=0;i<26;i++)
    {
      var qs=mx.childNodes[i].style;
      if(factor == 2 && (i%2) == 1) 
      {
        qs.display='none';        
      }
      else
      {
        qs.fontSize=(scale*factor)+'em';
        qs.lineHeight=(lineHeight*factor)+'px';
      }
    }

    // Increase width of outer menu DIV by index, else hide index
    var menuWidth=m2.offsetWidth;
    if(m2.scrollHeight > m2.offsetHeight+2)
      menuWidth = menuWidth+mx.offsetWidth;
    else
      mx.style.display='none';
    menu.style.width=menuWidth+'px';

    // Now display the menu
    osk.lgList.visibility='';
    
    // Set initial scroll to show current language (but never less than 1, to avoid dragging body)
    var top=m3.firstChild.offsetHeight*osk.lgList.activeLgNo+1;
    m2.scrollTop=top;

    // The scrollTop value is limited by the device, and must be limited to avoid dragging the document body
    if(m2.scrollTop < top) m2.scrollTop=m2.scrollHeight-m2.offsetHeight;
    if(m2.scrollTop > m2.scrollHeight-m2.offsetHeight-1)m2.scrollTop=m2.scrollHeight-m2.offsetHeight-1;

  }   

  /**
   * Add an index to the language menu
   * 
   *  @param  {Object}  e         touch start event from index   
   *  @param  {Object}  m2        menu scroller DIV
   *  @param  {Object}  menu      DIV with list of languages  
   */             
  osk.scrollToLanguage = function(e,m2,menu)
  {
    e.stopImmediatePropagation();e.preventDefault();
    if(e.touches[0].target.nodeName != 'P') return;    
    var i,t,top=0,initial=e.touches[0].target.innerHTML.charCodeAt(0),nn=menu.childNodes;
    try {
      for(i=0; i<nn.length-1; i++)
      {
        t=nn[i].firstChild.innerHTML.toUpperCase().charCodeAt(0);
        if(t >= initial) break; 
      }      
    }    
    catch(ex){}
    try
    {
      top=menu.firstChild.offsetHeight*i+1; 
      m2.scrollTop=top;
    }
    catch(ex){top=0;}
    try
    {
      if(m2.scrollTop < top) m2.scrollTop=m2.scrollHeight-m2.offsetHeight;
      if(m2.scrollTop > m2.scrollHeight-m2.offsetHeight-1) m2.scrollTop=m2.scrollHeight-m2.offsetHeight-1;
    } 
    catch(ex){}
  }
  
  /**
   * Display all languages for installed keyboards in scrollable list
   * 
   *    @param    {Object}    menu      DIV to which language selectors will be added
   *    @param    {Object}    kbdList   array of keyboard stub objects
   *    @return   {number}              index of currently active language         
   **/    
  osk.addLanguagesToMenu = function(menu,kbdList)
  {
    var nStubs=kbdList.length;
    
    // Create and sort a list of languages
    var k,n,lg,langs=[];
    for(n=0; n<nStubs; n++)
    {
      lg=kbdList[n]['KL'];
      if(langs.indexOf(lg) == -1) langs.push(lg);
    }
    langs.sort();

    // Get current scale factor (reciprocal of viewport scale)
    var scale=Math.round(100/util.getViewportScale())/100;

    var dx,lgBar,kList,i,kb,activeLanguageIndex=-1;
    for(k=0; k<langs.length; k++)
    {
      dx=util._CreateElement('DIV');dx.className='kbd-list-closed';
      lgBar=util._CreateElement('P');
      lgBar.kList=[];
      
      for(n=0; n<nStubs; n++)
      {
        if(kbdList[n]['KL'] == langs[k]) lgBar.kList.push(kbdList[n]);        
      }

      // Adjust bar size for current viewport scaling (iOS only!)
      if(device.OS == 'iOS' && device.formFactor == 'phone') 
        lgBar.style.fontSize=scale+'em';
    
      // Add to menu  
      dx.appendChild(lgBar);
      menu.appendChild(dx);
      
      if(langs[k] == keymanweb._ActiveStub['KL']) activeLanguageIndex=k;
      
      // Several keyboards for this language
      if(lgBar.kList.length > 1)
      {
        lgBar.className='kbd-list'; 
        lgBar.innerHTML=langs[k]+'...';
        lgBar.scrolled=false;
        lgBar.ontouchend=function(e)
        { 
          e.preventDefault();e.stopPropagation();
          if(e.target.scrolled) 
            e.target.scrolled=false;
          else 
            this.parentNode.className=(this.parentNode.className=='kbd-list-closed'?'kbd-list-open':'kbd-list-closed');
        }
        lgBar.ontouchstart=function(e){e.stopPropagation();}
        lgBar.ontouchmove=function(e){e.target.scrolled=true;e.stopPropagation();}
       
        for(i=0; i<lgBar.kList.length; i++)
        {
          kb=util._CreateElement('P');kb.className='kbd-list-entry';
          osk.addKeyboardToMenu(lgBar.kList[i],kb,false);          
          dx.appendChild(kb);
        }        
      }

      // Only one keyboard for this language
      else
      {
        lgBar.innerHTML=langs[k];
        lgBar.className='kbd-single-entry';
        osk.addKeyboardToMenu(lgBar.kList[0],lgBar,true);
      }
      if(k == activeLanguageIndex) lgBar.className=lgBar.className+' current';       
    }
    
    // Add a non-selectable bottom bar so to allow scrolling to the last language
    var padLast=util._CreateElement('DIV'); padLast.id='kmw-menu-footer';
    padLast.ontouchstart=padLast.ontouchmove=padLast.ontouchend=function(e){e.preventDefault();e.stopPropagation();}
    menu.appendChild(padLast);
    
    return activeLanguageIndex;
  }

  /**
   * Add a keyboard entry to the language menu *
   *    
   * @param   {Object}    kbd     keyboard object       
   * @param   {Object}    kb      element being added and styled
   * @param   {boolean}   unique  is this the only keyboard for the language?
   */     
  osk.addKeyboardToMenu = function(kbd,kb,unique)
  {
    kb.kn=kbd['KI'];        // InternalName; 
    kb.kc=kbd['KLC'];       // LanguageCode;                  
    kb.innerHTML=unique?kbd['KL']:kbd['KN'].replace(' Keyboard',''); // Name    

    // Touchstart (or mspointerdown) event highlights the touched list item  
    kb.onmspointerdown=kb.ontouchstart=function(e)
    {
      e.stopPropagation(); 
      if(this.className.indexOf('selected') <= 0) this.className=this.className+' selected';
      osk.lgList.scrolling=false;
      osk.lgList.y0=e.touches[0].pageY;//osk.lgList.childNodes[0].scrollTop;
      return true;
    }
//TODO: Still drags Android background sometimes (not consistently)
    // Touchmove drags the list and prevents release from selecting the language
    kb.onmspointermove=kb.ontouchmove=function(e)
    { 
      e.stopImmediatePropagation();
      var scroller=osk.lgList.childNodes[0],
          yMax=scroller.scrollHeight-scroller.offsetHeight,
          y=e.touches[0].pageY, dy=y-osk.lgList.y0;
      
      // Scroll up (show later listed languages)
      if(dy < 0)
      {
        if(scroller.scrollTop >= yMax-1) 
        {
          e.preventDefault(); osk.lgList.y0=y;
        }
      }
      // Scroll down (show earlier listed languages)
      else if(dy > 0)
      {
        if(scroller.scrollTop < 2)
        {
          e.preventDefault(); osk.lgList.y0=y;
        }
      }
      // Dont' scroll - can happen if changing scroll direction
      else
        return;
            
      // Disable selected language if drag more than 5px
      if(dy < -5 || dy > 5)
      {
        osk.lgList.scrolling=true;  
        this.className=this.className.replace(/\s*selected/,'');
        osk.lgList.y0=y;
      }
      return true;
    }

    // Touch release (click) event selects touched list item   
    kb.onmspointerout=kb.ontouchend=function(e)
    { 
      e.preventDefault();
      if(typeof(e.stopImmediatePropagation) != 'undefined') e.stopImmediatePropagation();else e.stopPropagation();

      if(osk.lgList.scrolling)
      {
        this.className=this.className.replace(/\s*selected/,'');
      }
      else
      { 
        keymanweb.focusing=true;   
        keymanweb.focusTimer=window.setTimeout(function(){keymanweb.focusing=false;},1000);
                                
        osk.lgList.style.display='none'; //still allows blank menu momentarily on selection
        keymanweb._SetActiveKeyboard(this.kn,this.kc,true);
        keymanweb._FocusLastActiveElement();
        osk.hideLanguageList();
               
        // Update the OSK with the new keyboard
        osk._Show(); 
      }
      return true;
    }    
  }
  
  /**
   * Remove the language menu again
   **/
  osk.hideLanguageList = function()
  {
    if(osk.lgList)    
    {
      osk.highlightKey(osk.lgKey.firstChild,false);
      osk.lgList.style.visibility='hidden';
      window.setTimeout(function(){
        document.body.removeChild(osk.lgList.shim);
        document.body.removeChild(osk.lgList);
        osk.lgList=null;
        },500);
    }
  }
  
  /**
   * Highlight active language button when moving pointer it
   *  
   * @param       {Object}      k      element touched
   * @param       {Object}      e      OSK event   
       
  osk.moveOverMenu = function(k,e)
  { 
    e.preventDefault(); e.cancelBubble=true;
    if(typeof e.stopImmediatePropagation == 'function') e.stopImmediatePropagation();
    else if(typeof e.stopPropagation == 'function') e.stopPropagation();
    
    // Don't change highlighting unless a key is pressed
    //if(osk.keyPending == null) return;
    
    // Get touch position, active key element coordinates, and active key name
    var x=typeof e.touches == 'object' ? e.touches[0].clientX : e.clientX,
        y=typeof e.touches == 'object' ? e.touches[0].clientY : e.clientY;
    var x0=util._GetAbsoluteX(k),y0=util._GetAbsoluteY(k),//-document.body.scrollTop,
      x1=x0+k.offsetWidth,y1=y0+k.offsetHeight;
      
    osk.highlightKey(k,(x > x0 && x < x1 && y > y0 && y < y1),); 
    }
   */         
  /**
   * Function     _UpdateVKShift
   * Scope        Private
   * @param       {Object}            e     OSK event
   * @param       {number}            v     keyboard shift state
   * @param       {(boolean|number)}  d     set (1) or clear(0) shift state bits  
   * @return                                Always true
   * Description  Update the current shift state within KMW 
   */    
  osk._UpdateVKShift = function(e, v, d)
  {
    var keyShiftState=0;
    if(e)
      // read shift states from Pevent
      keyShiftState = e.Lmodifiers/0x10;
    else if(d)
      keyShiftState |= v; 
    else
      keyShiftState &= ~v;

    // Find and display the selected OSK layer
    osk.layerId=osk.getLayerId(keyShiftState);
    if(osk._Visible) osk._Show();
    
    return true;
  }

  /**
   * Function     _CancelMouse
   * Scope        Private   
   * @param       {Object}      e     event      
   * @return      {boolean}           always false 
   * Description  Closes mouse click event 
   */     
  osk._CancelMouse=function(e)
  {
    e = keymanweb._GetEventObject(e);   // I2404 - Manage IE events in IFRAMEs
    if(e && e.preventDefault) e.preventDefault();
    if(e) { e.cancelBubble=true; e.returnValue=false; } // I2409 - Avoid focus loss for visual keyboard events    
    return false;
  }
  
  /**
   * Function     showLayer
   * Scope        Private
   * @param       {string}      id      ID of the layer to show
   * @return      {boolean}             true if the layer is shown, or false if it cannot be found
   * Description  Shows the layer identified by 'id' in the on screen keyboard
   */    
  osk.showLayer = function(id)
  {
    if(keymanweb._ActiveKeyboard) 
    {
      for(var i=0; i<osk.layers.length; i++)
      {
        if(osk.layers[i].id == id)
        {
          osk.layerId=id;      
          osk._Show();
          return true;
        }
      }
    }
    return false;
  }
   
  /**
   * Get the wanted height of the OSK for touch devices
   * 
   *  @return   {number}    height in pixels      
   **/
  osk.getHeight=function()
  {
    
    // KeymanTouch - get OSK height from device
    if(typeof(keymanweb['getOskHeight']) == 'function') return keymanweb['getOskHeight']();
             
    var oskHeightLandscapeView=Math.floor(Math.min(screen.availHeight,screen.availWidth)/2), 
        height=oskHeightLandscapeView; 
 
    if(device.formFactor == 'phone')
    { 
      var sx=Math.min(screen.height,screen.width),
          sy=Math.max(screen.height,screen.width);  
      
      if(util.portraitView()) 
        height=Math.floor(Math.max(screen.availHeight,screen.availWidth)/3);
      else
        height=height*(sy/sx)/1.6;  //adjust for aspect ratio, increase slightly for iPhone 5      
    }

    // Correct for viewport scaling (iOS - Android 4.2 does not want this, at least on Galaxy Tab 3))
    if(device.OS == 'iOS') height=height/util.getViewportScale();

    // Correct for devicePixelratio - needed on Android 4.1.2 phones, 
    // for Opera, Chrome and Firefox, but not for native browser!   Exclude native browser for Build 344.
    if(device.OS == 'Android' && device.formFactor == 'phone' && 'devicePixelRatio' in window)
    { 
      var bMatch=/Firefox|Chrome|OPR/;
      if(bMatch.test(navigator.userAgent)) height = height*window.devicePixelRatio;
    }       

    return height;
  }        
  
  /**
   * Create the OSK for a particular keyboard and device
   * 
   * @param       {Array.<Object>}      layout      Array of OSK layout objects
   * @param       {string}              formFactor  layout form factor
   * @return      {Object}                          fully formatted OSK object
   */
   osk.deviceDependentLayout=function(layout,formFactor)
   {
      var lDiv=util._CreateElement('DIV'),ls=lDiv.style,actualHeight=0;
            
      // Set OSK box default style
      lDiv.className='kmw-key-layer-group';

      // Adjust OSK height for mobile and tablet devices TODO move outside this function???
      switch(formFactor)
      {
        case 'phone':
        case 'tablet':
          actualHeight=osk.getHeight();
          ls.height=actualHeight+'px';
          break;
      }

      // Return empty DIV if no layout defined
      if(layout == null) return lDiv;
      
      // Set default OSK font size (Build 344, KMEW-90)
      if(typeof(layout['fontsize']) == 'undefined' || layout['fontsize'] == null) 
        ls.fontSize='1em';
      else
        ls.fontSize=layout['fontsize'];
        
      osk.fontSize=ls.fontSize;       //TODO: move outside function*********
      
      // Create a separate OSK div for each OSK layer, only one of which will ever be visible
      var n,i,j,layers,layer,gDiv,rows,row,rowHeight,rDiv,keys,key,kDiv,pDiv,rs,ks,btn,bs,ps,gs;
     
      layers=layout['layer'];

      // Set key default attributes (must use exportable names!)
      var tKey={};
      tKey['text']=''; tKey['fontsize']=ls.fontSize; 
      tKey['width']='100'; tKey['pad']='5'; tKey['sp']='0';
      tKey['layer']=null; tKey['nextlayer']=null;

      // Identify key labels (e.g. *Shift*) that require the special OSK font 
      var specialLabel=/\*\w+\*/;
   
      // ***Delete any empty rows at the end added by compiler bug...
      for(n=0; n<layers.length; n++)
      {
        layer=layers[n]; rows=layer['row'];        
        for(i=rows.length; i>0; i--)
        {
          if(rows[i-1]['key'].length > 0) break; 
        }      
        if(i < rows.length) rows.splice(i-rows.length,rows.length-i);
      }
      // ...remove to here when compiler bug fixed ***
   
      // Set the OSK row height, **assuming all layers have the same number of rows**
      
      // Calculate default row height
      rowHeight=100/rows.length;
      
      // For desktop OSK, use a percentage of the OSK height      
      if(formFactor == 'desktop')
      {
        rowHeight=100/rows.length;
      }

      for(n=0; n<layers.length; n++)
      {
        layer=layers[n]; 
        layer.aligned=false;
        gDiv=util._CreateElement('DIV'),gs=gDiv.style; 
        gDiv.className='kmw-key-layer';

        // Always make the first layer visible 
        gs.display=(n==0?'block':'none');
        gs.height=ls.height;

        // TODO: Controlling visibility rather than display may result in faster rendering, but needs testing
        // gs.visibility=(n==0?'visible':'hidden');

        // Set font for layer if defined in layout
        if('font' in layout) gs.fontFamily=layout['font']; else gs.fontFamily=''; 

        gDiv.layer=gDiv.nextLayer=layer['id'];
        if(typeof layer['nextlayer'] == 'string') gDiv.nextLayer=layer['nextlayer'];

        // Create a DIV for each row of the group
        rows=layer['row'];    
                   
        // Calculate the maximum row width (in layout units)
        var totalWidth=0;
        for(i=0; i<rows.length; i++)
        {
          var width=0;
          row=rows[i]; keys=row['key'];
          for(j=0; j<keys.length; j++)
          {
            key=keys[j];
            
            // Test for a trailing comma included in spec, added as null object by IE            
            if(key == null) 
            {
              keys.length = keys.length-1;   
            }
            else
            {
              if(typeof key['width'] == 'string' && key['width'] != '') width += parseInt(key['width'],10); else width += 100;
              if(typeof key['pad'] == 'string' && key['pad'] != '') width += parseInt(key['pad'],10); else width += 5;
            }
          }
          if(width > totalWidth) totalWidth = width;
        }

        // Add default right margin
        totalWidth += 5;
         
        for(i=0; i<rows.length; i++)
        {
          rDiv=util._CreateElement('DIV');
          rDiv.className='kmw-key-row';
          // The following event trap is needed to prevent loss of focus in IE9 when clicking on a key gap.
          // Unclear why normal _CreateElement prevention of loss of focus does not seem to work here.
          // Appending handler to event handler chain does not work (other event handling remains active).
          rDiv.onmousedown=function(e){if(e)e.preventDefault();}
          //util.attachDOMEvent(rDiv,'mousedown',function(e){if(e)e.preventDefault(); 
          
          row=rows[i]; rs=rDiv.style;

          // Set row height. (Phone and tablet heights are later recalculated 
          // and set in px, allowing for viewport scaling.)
          rs.maxHeight=rs.height=rowHeight+'%';
  
          // Apply defaults, setting the width and other undefined properties for each key
          keys=row['key'];         
          for(j=0; j<keys.length; j++)
          {
            key=keys[j];            
            for(var tp in tKey)
            {
              if(typeof key[tp] != 'string') key[tp]=tKey[tp];
            }
            
            // Add default key padding of 5 units
            if(key['pad'] == '') key['pad']='5';    
            
            // Modify the key type for special keys with non-standard labels
            // to allow the keyboard font to ovveride the SpecialOSK font.
            switch(key['sp'])
            {
              case '1':
                if(!specialLabel.test(key['text'])) key['sp']='3';  
                break;
              case '2':
                if(!specialLabel.test(key['text'])) key['sp']='4';
                break;
            } 
          }
 
          // Calculate actual key widths by summing defined widths and scaling each key to %,
          // adjusting the width of the last key to make the total exactly 100%
          // Save each percentage key width as a separate member (do *not* overwrite layout specified width!)    
          var keyPercent,padPercent,totalPercent=0;        
          for(j=0; j<keys.length-1; j++)
          {
            if(keys[j]['width'] == '') keys[j]['width']='100';
            keyPercent=parseInt(keys[j]['width'],10)*100/totalWidth;            
            keys[j]['widthpc']=keyPercent+'%'; 
            padPercent=parseInt(keys[j]['pad'],10)*100/totalWidth;
            keys[j]['padpc']=padPercent+'%';
            totalPercent += padPercent+keyPercent;
          }  
                    
          // Allow for right OSK margin  
          totalPercent += 500/totalWidth;

          // If a single key, and padding is negative, add padding to right align the key  
          if(keys.length == 1 && parseInt(keys[0]['pad'],10) < 0)
          {
            keyPercent=parseInt(keys[0]['width'],10)*100/totalWidth;            
            keys[0]['widthpc']=keyPercent+'%';             
            totalPercent += keyPercent;
            keys[0]['padpc']=(100.0-totalPercent)+'%';        
          }
          else if(keys.length > 0)           
          { 
            j=keys.length-1;
            padPercent=parseInt(keys[j]['pad'],10)*100/totalWidth;
            keys[j]['padpc']=padPercent+'%';
            totalPercent += padPercent;
            keys[j]['widthpc']=(100.0-totalPercent)+'%'; 
          }
   
          //Create the key square (an outer DIV) for each key element with padding, and an inner DIV for the button (btn)
          totalPercent=0;
          for(j=0; j<keys.length; j++)
          {
            key=keys[j];
            kDiv=util._CreateElement('DIV');
            kDiv.keyId=key['id'];           
            kDiv.className='kmw-key-square';
            ks=kDiv.style;
            if(formFactor != 'desktop')
            { 
              ks.left=(totalPercent+parseFloat(keys[j]['padpc']))+'%';
            }
            totalPercent=totalPercent+parseFloat(keys[j]['padpc'])+parseFloat(keys[j]['widthpc']);            
            kDiv.width=ks.width=key['widthpc']; 

            if(formFactor != 'desktop')
            {
              ks.bottom=rs.bottom;ks.height=rs.height;  //these must be specified in px for rest of layout to work correctly
            }
            else 
            {
              ks.marginLeft=key['padpc']; 
            }
            
            btn=util._CreateElement('DIV'),bs=btn.style; 
            bs.boxSizing=bs.MozBoxSizing='border-box';

            // Set button class
            osk.setButtonClass(key,btn);
            
 //TODO change according to formfactor???
            
            // Set distinct phone and tablet button position properties
            if(device.touchable)
            {
              bs.position='fixed'; bs.left=ks.left; bs.width=ks.width;             
            } 
            
            // Add the (US English) keycap label for desktop OSK or if KDU flag is non-zero
            var q=null;
            if(layout.keyLabels || (formFactor == 'desktop')) //desktop or KDU flag set
            {
              // Create the default key cap labels (letter keys, etc.)
              var x=keyCodes[key.id];         
              switch(x)
              {
                case 186: x=59; break; 
                case 187: x=61; break;               
                case 188: x=44; break;               
                case 189: x=45; break;               
                case 190: x=46; break;               
                case 191: x=47; break;
                case 192: x=96; break;               
                case 219: x=91; break;              
                case 220: x=92; break;                
                case 221: x=93; break;                                             
                case 222: x=39; break;               
                default:
                  if(x < 48 || x > 90) x=0;
              }
              
              if(x > 0)
              { 
                q=util._CreateElement('DIV');
                q.className='kmw-key-label'; 
                q.innerHTML=String.fromCharCode(x);
                kDiv.appendChild(q);
              }
            }
            
            // The following  line is needed to ensure correct cell sizing with auto-sized container            
            bs.overflow='hidden';
            bs.border='1px solid #888888'; 
            bs.webkitTapHighlightColor='rgba(0,0,0,0)';
            
            // Define each key element id by layer id and key id (duplicate possible for SHIFT - does it matter?)
            btn.id=layer['id']+'-'+key.id;
            btn.key=key;  //attach reference to key layout spec to element
            
            // Add reference to subkey array if defined
            if(typeof key['sk'] != 'undefined' && key['sk'] != null) 
            {
              var bsn,bsk=btn.subKeys=key['sk']; 
              for(bsn=0; bsn<bsk.length; bsn++)
                if(bsk[bsn]['sp'] == '1' || bsk[bsn]['sp'] == '2')  
                { 
                  var oldText=bsk[bsn]['text'];                            
                  bsk[bsn]['text']=osk.renameSpecialKey(oldText);
                }
            }
            else btn.subKeys=null; 
                       
            // Define callbacks to handle key touches: iOS and Android tablets and phones
            if("ontouchstart" in window)
            {
              btn.ontouchstart=function(e){osk.touchKey(this,e);}; 
              btn.ontouchend=function(e){osk.releaseKey(this,e);};
              btn.ontouchmove=function(e){osk.moveOverKeys(this,e);};
              // The following handler is also needed on Android to prevent spurious background element selection
              // It should not be necessary, and is not needed on iOS.
             
              btn.onclick=function(e){e.preventDefault(); e.stopPropagation();};
            }
            // Windows tablets and phones(?)
            else if(device.touchable && device.OS == 'Windows')
            {
              btn.style.msTouchAction='none'; //prevent default touch action on OSK keys
              btn.onmspointerdown=function(e){osk.touchKey(this,e);}; 
              btn.onmspointerup=function(e){osk.releaseKey(this,e);};
              btn.onmspointermove=function(e){osk.moveOverKeys(this,e);};
              // The following handler is also needed on Android to prevent spurious background element selection
              // It should not be necessary, and is not needed on iOS.
              //btn.onclick=function(e){e.preventDefault(); e.stopPropagation();};
            
            }
            // Handle mouse button events for browsers on desktop devices
            else
            {              
              // Highlight key while mouse down or if moving back over originally selected key
              btn.onmouseover=btn.onmousedown=function(e)
              {
                var t=util.eventTarget(e);
                if(t === null) return; 
                if(t.nodeName == 'SPAN') t=t.parentNode;
                if(util.eventType(e) == 'mousedown')
                {
                  osk.currentKey=t.id; osk._CancelMouse(e);
                  osk.highlightKey(t,true);
                  //t.style.backgroundColor='rgb(128,128,255)';
                }
                else if(t.id == osk.currentKey) 
                {
                  osk.highlightKey(t,true);
                  //t.style.backgroundColor='rgb(128,128,255)';
                }
              }
              
              // Remove highlighting when key released or moving off selected element         
              btn.onmouseup=btn.onmouseout=function(e)
              {
                var t=util.eventTarget(e);
                if(t === null) return; 
                
                if(t.nodeName == 'SPAN') t=t.parentNode;                
                osk.highlightKey(t,false);
                
                // Process as click if mouse button released anywhere over key
                if(util.eventType(e) == 'mouseup')
                {
                    if(t.id == osk.currentKey) osk.clickKey(t); 
                    osk.currentKey='';
                }
              }
            }  
             
            var t=util._CreateElement('SPAN'),ts=t.style;
            if(key['text'] == null || key['text'] == '') 
            { 
              t.innerHTML='\xa0';
              if(typeof key['id'] == 'string')
              {
                if(/^U_[0-9A-F]{4}$/i.test(key['id'])) 
                  t.innerHTML=String.fromCharCode(parseInt(key['id'].substr(2),16));
              } 
            } 
            else t.innerHTML=key['text'];
            t.className='kmw-key-text'; 
           
            // Use special case lookup for modifier keys
            if(key['sp'] == '1' || key['sp'] == '2')
            {
              var tId=((key['text'] == '*Tab*' && n == 1) ? '*TabLeft*' : key['text']);
              t.innerHTML=osk.renameSpecialKey(tId);    
            }

            //Override font spec if set for this key in the layout 
            if('font' in key) ts.fontFamily=key['font'];
            if('fontsize' in key) ts.fontSize=key['fontsize'];
                                    
            // Add text to button and button to placeholder div
            btn.appendChild(t);                          
            kDiv.appendChild(btn);

            // Prevent user selection of key captions
            //t.style.webkitUserSelect='none';
            
            // If a subkey array is defined, add an icon
            if(typeof(key['sk']) != 'undefined' && key['sk'] != null)
            {
              var skIcon=util._CreateElement('DIV');
              skIcon.className='kmw-key-popup-icon';
              kDiv.appendChild(skIcon);
            }
            // Add key to row
            rDiv.appendChild(kDiv);
          }
          // Add row to layer
          gDiv.appendChild(rDiv);
        }
        // Add layer to group
        lDiv.appendChild(gDiv);
      }      
      return lDiv;
   }    
 
  /**
   * Replace default key names by special font codes for modifier keys
   *
   *  @param    {string}  oldText    
   *  @return {string}      
   **/
  osk.renameSpecialKey = function(oldText)
  {
    var specialText=['*Shift*','*Enter*','*Tab*','*BkSp*','*Menu*','*Hide*','*Alt*','*Ctrl*','*Caps*',
      '*ABC*','*abc*','*123*','*Symbol*','*Currency*','*Shifted*','*AltGr*','*TabLeft*'];
    var codePUA=[8,5,6,4,11,10,25,1,3,16,17,19,21,20,8,2,7]; // set SHIFTED->9 for filled arrow icon
    
    //Note:  U+E000 *is* PUA but was not accepted by IE as a character in the EOT font, so Alt recoded as U+E019
    for(var i=0; i<specialText.length; i++) 
      if(oldText == specialText[i]) return String.fromCharCode(0xE000+codePUA[i]);
    return oldText;                    
  }
          
  /**
   * Attach appropriate class to each key button, according to the layout 
   * 
   * @param       {Object}    key     key object
   * @param       {Object}    btn     button object
   */    
  osk.setButtonClass = function(key,btn)
  {
    var n=0,keyTypes=['default','shift','shift-on','special','special-on','','','','deadkey','blank','hidden'];
    if(typeof key['dk'] == 'string' && key['dk'] == '1') n=8;
    if(typeof key['sp'] == 'string') n=parseInt(key['sp'],10);
    if(n < 0 || n > 10) n=0;                  
    btn.className='kmw-key kmw-key-'+keyTypes[n];
  }

  /**
   * Build a default layout for keyboards with no explicit layout 
   * 
   * @param   {Object}  PVK     keyboard object (as loaded)
   * @param   {string}  formFactor   
   * @return  {Object}
   */
  osk.buildDefaultLayout = function(PVK,formFactor)
  {
    var layout;
    
    // Build a layout using the default for the device
    var layoutType=formFactor,dfltLayout=window['dfltLayout'];
    if(typeof dfltLayout[layoutType] != 'object') layoutType = 'desktop';

    // Clone the default layout object for this device
    layout=util.deepCopy(dfltLayout[layoutType]);
   
    var n,layers=layout['layer'],keyLabels=PVK['BK'],key102=PVK['K102'];
    var i,j,k,m,row,rows,key,keys;

    // Identify key labels (e.g. *Shift*) that require the special OSK font 
    var specialLabel=/\*\w+\*/;

    // For default layouts, add other layers as modified copies of the default layer
    var idList=['default','shift','ctrl','ctrlshift','alt','altshift','ctrlalt','ctrlaltshift'];
    //var shiftKeyLabels=['Shift','Shifted','Ctrl','CtrlShift','Alt','AltShift','CtrlAlt','CtrlAltShift'];
    //var shiftedId=['K_SHIFT','K_SHIFT','K_LCTRL','K_SHIFT','K_LALT','K_SHIFT','K_ALTGR','K_SHIFT'];
    for(n=0; n<8; n++)
    {
      // Populate non-default (shifted) keygroups 
      if(n > 0) layers[n]=util.deepCopy(layers[0]);
      layers[n]['id']=idList[n];
      layers[n]['nextlayer']=idList[n]; // This would only be different for a dynamic keyboard

      // Correct appearance of state-dependent modifier keys according to group
      for(i=0; i<layers[n]['row'].length; i++)
      {
        row=layers[n]['row'][i]; 
        keys=row['key'];
        for(j=0; j<keys.length; j++)
        {
          key=keys[j];
          switch(key['id'])
          {
            case 'K_SHIFT':
            case 'K_LSHIFT':
            case 'K_RSHIFT':
              if((n & 1) == 1) key['sp'] = '2';
              if((formFactor != 'desktop') && (n > 0)) key['nextlayer']='default';
              break; 
            case 'K_CONTROL':
            case 'K_LCTRL':
            case 'K_LCONTROL':
            case 'K_RCTRL':
            case 'K_RCONTROL':
              if((n & 2) == 2) key['sp'] = '2';
              break; 
            case 'K_ALT':
            case 'K_LALT':
            case 'K_RALT':
              if((n & 4) == 4) key['sp'] = '2';
              break; 
          }              
        }
      }
      
      // Hide extra key (OEM 102) if none in keyboard definition
      if(typeof key102 == 'undefined' || !key102)
      {
        for(i=0; i<layers[n]['row'].length; i++)
        {
          for(j=0; j<layers[n]['row'][i]['key'].length; j++)
          {
            if(layers[n]['row'][i]['key'][j]['id'] == 'K_oE2')
            {
              if(formFactor == 'desktop')
              {
                layers[n]['row'][i]['key'].splice(j,1);
                layers[n]['row'][i]['key'][0]['width']='200';
              }
              else
              {
                layers[n]['row'][i]['key'][j]['sp']='10';
              }
            }
          }
        }
      }           
    }
    // Add default key labels and key styles     
    for(n=0; n<layers.length; n++)
    {        
      var layer=layers[n],kx,shiftKey=null,nextKey=null,allText='';
      rows=layer['row'];
      for(i=0; i<rows.length; i++)
      {
        keys=rows[i]['key'];
        for(j=0; j<keys.length; j++)
        {
          key=keys[j]; 
          kx=dfltCodes.indexOf(key['id']);
          
          // Get keycap text from visual keyboard array, if defined in keyboard
          if(typeof keyLabels != 'undefined' && kx >= 0 && kx+65*n < keyLabels.length) key['text']=keyLabels[kx+65*n]; 
         
          // Fall back to US English keycap text (any 'ghost' keys must now be explicitly defined in layout)
          if(key['text'] == '' &&  key['id'] != 'K_SPACE' && kx+65*n < dfltText.length) key['text']=dfltText[kx+65*n];  

          // Leave any unmarked key caps as null strings
          if(typeof(key['text']) == 'undefined') key['text']='';
          
          if(key['id'] == 'K_SHIFT') shiftKey=key; 
          if(key['id'] == 'K_TAB') nextKey=key;
 
          // Concatenate all keys for this layer, excluding special keys, to check for existence of layer
          if(!specialLabel.test(key['text'])) allText=allText+key['text'];
        }
      } 
      
      // Mark layer as valid if any key caps (excluding special keys) are defined, invalid otherwise
      layer.valid=(allText.trim().length > 0);
      layer.shiftKey=shiftKey;

       // Set modifier key appearance and behaviour for non-desktop devices using the default layout
      if(formFactor != 'desktop')
      {
        if(n > 0 && shiftKey != null)
        {
          shiftKey['sp']='2';
          shiftKey['sk']=null;
          switch(layers[n].id)
          {
            case 'ctrl':
              shiftKey['text']='*Ctrl*'; break;
            case 'alt':
              shiftKey['text']='*Alt*'; break;
            case 'ctrlalt':
              shiftKey['text']='*AltGr*'; break;
          };
        }        
      }
    }
    
    // Remove pop-up shift keys referencing invalid layers (Build 349)
    for(n=0; n<8; n++)
    {
      rows=layers[n]['row'];
      for(i=0; i<rows.length; i++)
      {
        keys=rows[i]['key'];
        for(j=0; j<keys.length; j++)
        {
          key=keys[j];
          if(key['sk'] != null)
          {
            for(m=0; m<8; m++)
            {
              for(k=0; k<key['sk'].length; k++)
              {
                if(key['sk'][k]['nextlayer'] == idList[m])
                {
                  if(!layers[m].valid) key['sk'].splice(k,1);
                  break;
                }
              }
            }
            if(key['sk'].length == 0) key['sk']=null;
          } 
        }        
      }    
    }
    return layout;              
  }
                  
  /**
   * Function     _GenerateVisualKeyboard
   * Scope        Private
   * @param       {Object}      PVK    Visual keyboard name 
   * @param       {Object}      Lhelp  true if OSK defined for this keyboard   
   * @return      Nothing
   * Description  Generates the visual keyboard element and attaches it to KMW 
   */    
  osk._GenerateVisualKeyboard = function(PVK,Lhelp,layout0)
  {                 
    var Ldiv,LdivC,layout=layout0;
    var Lkbd=util._CreateElement('DIV'), oskWidth;//s=Lkbd.style,

    // Build a layout using the default for the device
    if(typeof layout != 'object' || layout == null)
      layout=osk.buildDefaultLayout(PVK,device.formFactor);
   
    // Create the collection of HTML elements from the device-dependent layout object
    osk.layout=layout;
    osk.layers=layout['layer'];
    
    // Override font if specified by keyboard
    if('font' in layout) osk.fontFamily=layout['font']; else osk.fontFamily='';

    // Set flag to add default (US English) key label if specified by keyboard
    layout.keyLabels=((typeof(keymanweb._ActiveKeyboard['KDU']) != 'undefined') && keymanweb._ActiveKeyboard['KDU']);
    LdivC=osk.deviceDependentLayout(layout,device.formFactor);    
    
    osk.ddOSK = true;

    // Append the OSK layer group container element to the containing element
    osk.keyMap = LdivC; Lkbd.appendChild(LdivC);
   
    // Set base class and box class
    osk._DivVKbdHelp = osk._DivVKbd = Lkbd;
    osk._Box.className=device.formFactor+' kmw-osk-frame';
    Lkbd.className=device.formFactor+' kmw-osk-inner-frame';
    
    // Add header element to OSK only for desktop browsers
    if(device.formFactor == 'desktop') 
      osk._Box.appendChild(osk.controlBar());
    
    // Add primary keyboard element to OSK  
    osk._Box.appendChild(Lkbd);
        
    // Add footer element to OSK only for desktop browsers
    if(device.formFactor == 'desktop') 
      osk._Box.appendChild(osk.resizeBar());  
      
    // For other devices, adjust the object heights, allowing for viewport scaling      
    else
      osk.adjustHeights();    
  }

  /**
   * Create copy of the OSK that can be used for embedding in documentation or help
   * The currently active keyboard will be returned if PInternalName is null    
   * 
   *  @param  {string}          PInternalName   internal name of keyboard, with or without Keyboard_ prefix
   *  @param  {number}          Pstatic         static keyboard flag  (unselectable elements) 
   *  @param  {string=}         argFormFactor   layout form factor, defaulting to 'desktop'
   *  @param  {(string|number)=}  argLayerId    name or index of layer to show, defaulting to 'default'
   *  @return [Object}                          DIV object with filled keyboard layer content   
   */             
  keymanweb['BuildVisualKeyboard'] = keymanweb.buildOSK = function(PInternalName,Pstatic,argFormFactor,argLayerId)  // I777
  {           
    var PKbd=keymanweb._ActiveKeyboard,Ln,kbd=null,           
        formFactor=(typeof(argFormFactor) == 'undefined' ? 'desktop' : argFormFactor),
        layerId=(typeof(argLayerId) == 'undefined' ? 'default' : argLayerId);
  
    if(PInternalName != null)
    {
      var p=PInternalName.toLowerCase().replace('keyboard_','');                    
      for(Ln=0; Ln<keymanweb._Keyboards.length; Ln++)
      { 
        if(p == keymanweb._Keyboards[Ln]['KI'].toLowerCase().replace('keyboard_',''))
        {         
          PKbd=keymanweb._Keyboards[Ln]; break;
        }
      }
    }
 
    if(!PKbd) return null;

    var layouts=PKbd['KVKL'],layout=null,PVK=PKbd['KV'];
  
    // Get the layout defined in the keyboard, or its nearest equivalent
    if(typeof layouts == 'object')
    {
      if(typeof(layouts[formFactor]) == 'object' && layouts[formFactor] != null)
        layout=layouts[formFactor];
      else if(formFactor == 'phone' && typeof(layouts['tablet']) == 'object' && layouts['tablet'] != null)
        layout=layouts['tablet'];
      else if(formFactor == 'tablet' && typeof(layouts['phone']) == 'object' && layouts['phone'] != null)
        layout=layouts['phone'];
      else if(typeof(layouts['desktop']) == 'object' && layouts['desktop'] != null)
        layout=layouts['desktop'];       
    }     

    // Else get a default layout for the device for this keyboard
    if(layout == null && PVK != null)
      layout=osk.buildDefaultLayout(PVK,formFactor); 
    
    // Cannot create an OSK if no layout defined, just return empty DIV
    if(layout != null)     
      layout.keyLabels=((typeof(PKbd['KDU']) != 'undefined') && PKbd['KDU']);
    
    kbd=osk.deviceDependentLayout(layout,formFactor);
    kbd.className='desktop kmw-osk-inner-frame';

    // Select the layer to display, and adjust sizes 
    if(layout != null)
    {
      var layer,row,key,Lr,Lk;
      for(Ln=0; Ln<layout.layer.length; Ln++) 
      {             
        layer=kbd.childNodes[Ln];
        layer.style.height='100%';
        for(Lr=0; Lr<layer.childNodes.length; Lr++)
        {
          row=layer.childNodes[Lr];
          for(Lk=0; Lk<row.childNodes.length; Lk++)
          {
            key=row.childNodes[Lk];
            key.style.height='100%';
            key.style.left='auto';
            key.style.padding='0%';
          }
        }      
        if(typeof(layerId) == 'number')
          layer.style.display=(Ln == layerId && layerId >= 0 ? 'block' : 'none');
        else if(typeof(layerId) == 'string')
          layer.style.display=(layout.layer[Ln].id == layerId ? 'block' : 'none');
        else 
          layer.style.display=(Ln == 0 ? 'block' : 'none');
      }    
    }
    else
    {
      kbd.innerHTML="<p style='color:#c40; font-size:0.5em;margin:10px;'>No "+formFactor+" layout is defined for "+PKbd['KN']+".</p>";
    }
    // Add a faint border
    kbd.style.border='1px solid #ccc';
    return kbd; 
  }

  /**
   * Adjust the absolute height of each keyboard element after a rotation
   *    
   **/      
  keymanweb['correctOSKTextSize']=osk.adjustHeights=function()
  {        
    var layers=osk._Box.firstChild.firstChild.childNodes,
        nRows=layers[0].childNodes.length,
        oskHeight=osk.getHeight(),
        rowHeight=Math.floor(oskHeight/nRows),
        nLayer,nRow,rs,keys,nKeys,nKey,key,ks,j,pad=4,fs=1.0;
        
    if(device.OS == 'Android' && 'devicePixelRatio' in window) 
      rowHeight = rowHeight/window.devicePixelRatio;
    
    oskHeight=nRows*rowHeight;

    var b=osk._Box,bs=b.style;
    bs.height=bs.maxHeight=(oskHeight+3)+'px';
    b=b.firstChild.firstChild; bs=b.style;
    bs.height=bs.maxHeight=(oskHeight+3)+'px';
    if(device.formFactor == 'phone')
    {
      pad=2;fs=0.6;
    }
    // TODO: Logically, this should be needed for Android, too - may need to be changed for the next version!
    if(device.OS == 'iOS') 
      fs=fs/util.getViewportScale();

    bs.fontSize=fs+'em';  
    var resizeLabels=(device.OS == 'iOS' && device.formFactor == 'phone' && util.landscapeView());
 
    for(nLayer=0;nLayer<layers.length; nLayer++)
    {
      layers[nLayer].style.height=(oskHeight+3)+'px';       
      for(nRow=0; nRow<nRows; nRow++)
      {                                  
        rs=layers[nLayer].childNodes[nRow].style;
        rs.bottom=(nRows-nRow-1)*rowHeight+'px';       
        rs.maxHeight=rs.height=rowHeight+'px';      
        keys=layers[nLayer].childNodes[nRow].childNodes;
        nKeys=keys.length;     
        for(nKey=0;nKey<nKeys;nKey++)
        {                      
          key=keys[nKey];
          // Must set the height of the text DIV, not the label (if any)
          for(j=0;j<key.childNodes.length;j++)
            if(key.childNodes[j].className.indexOf('key-label') < 0) break;
          ks=key.childNodes[j].style;
          ks.bottom=rs.bottom; 
          ks.height=(rowHeight-pad)+'px'; 
                          
          // Rescale keycap labels on iPhone (iOS 7)
          if(resizeLabels && (j > 0)) key.childNodes[0].style.fontSize='6px'; 
        }
      }    
    } 
  }
    
  /**
   * Create a control bar with title and buttons for the desktop OSK 
   */    
  osk.controlBar = function()
  {
    var bar=util._CreateElement('DIV'),title='';
    bar.id='keymanweb_title_bar'; 
    bar.className='kmw-title-bar';
    bar.onmousedown=osk._VMoveMouseDown;
    
    if(keymanweb._ActiveKeyboard) title=keymanweb._ActiveKeyboard['KN'];
    var Ltitle=util._CreateElement('SPAN');
    Ltitle.className='kmw-title-bar-caption';
    Ltitle.innerHTML=title; 
    bar.appendChild(Ltitle);
    
    var Limg=osk.closeButton=util._CreateElement('DIV');
    Limg.id='kmw-close-button';
    Limg.className='kmw-title-bar-image';
    Limg.onmousedown=osk._CancelMouse;
    Limg.onclick=function(){osk._Hide(true);}    
    bar.appendChild(Limg);

    Limg=osk.helpImg=util._CreateElement('DIV'); 
    Limg.id='kmw-help-image';
    Limg.className='kmw-title-bar-image';
    Limg.title='KeymanWeb Help';
    Limg.onclick=function()
      {
        var p={}; util.callEvent('osk.helpclick',p);
        if(window.event) window.event.returnValue=false;
        return false;
      }
    Limg.onmousedown=osk._CancelMouse;     
    bar.appendChild(Limg);

    Limg=osk.configImg=util._CreateElement('DIV');  
    Limg.id='kmw-config-image';
    Limg.className='kmw-title-bar-image';
    Limg.title='KeymanWeb Configuration Options';
    Limg.onclick=function()
      {
        var p={}; util.callEvent('osk.configclick',p);
        if(window.event) window.event.returnValue=false;
        return false;
      }
    Limg.onmousedown=osk._CancelMouse;     
    bar.appendChild(Limg);

    Limg=osk.pinImg=util._CreateElement('DIV');  //I2186
    Limg.id='kmw-pin-image';
    Limg.className='kmw-title-bar-image';
    Limg.title='Pin the On Screen Keyboard to its default location on the active text box';
    Limg.onclick=function()
      {
        osk.loadCookie(); osk.userPositioned=false; osk.saveCookie();
        osk._Show();
        osk.doResizeMove(); //allow the UI to respond to OSK movements
        if(osk.pinImg) osk.pinImg.style.display='none';
        if(window.event) window.event.returnValue=false;
        return false;
      }
    Limg.onmousedown=osk._CancelMouse;     
    bar.appendChild(Limg);
    
    return bar;  
  }
  
  /**
   * Display build number
   */
  osk.showBuild = function()
  {
    util.alert('KeymanWeb Build '+keymanweb['build']+'<br /><br />'
      +'<span style="font-size:0.8em">Copyright &copy; 2013 Tavultesoft Pty Ltd</span>');
  } 
        
  /**
   * Create a bottom bar with a resizing icon for the desktop OSK 
   */    
  osk.resizeBar = function()
  {
    var bar=util._CreateElement('DIV');
    bar.className='kmw-footer';
    bar.onmousedown=osk._CancelMouse;
    
    // Add caption
    var Ltitle=util._CreateElement('DIV');
    Ltitle.className='kmw-footer-caption';
    Ltitle.innerHTML='Keyboard &copy; 2013 Tavultesoft Pty Ltd';
    Ltitle.id='keymanweb-osk-footer-caption';
    
    // Display build number on shift+double click
    util.attachDOMEvent(Ltitle,'dblclick',function(e){if(e && e.shiftKey)osk.showBuild();},false);

    // Prevent selection of caption (IE - set by class for other browsers)
    if('onselectstart' in Ltitle) Ltitle.onselectstart= function(){return false;} //IE
    
    bar.appendChild(Ltitle);
    
    var Limg = util._CreateElement('DIV');
    Limg.className='kmw-footer-resize';
    Limg.onmousedown=osk._VResizeMouseDown;  
    Limg.onmouseover=Limg.onmouseout=osk._VResizeMouseOut; 
    bar.appendChild(Limg);
    osk.resizeIcon=Limg;
    //TODO: the image never appears in IE8, have no idea why!
    return bar;  
  }
    
  /**
   * Function     _VKbdMouseOver
   * Scope        Private
   * @param       {Object}      e      event 
   * Description  Activate the KMW UI on mouse over 
   */    
  osk._VKbdMouseOver = function(e)
  {
    keymanweb._IsActivatingKeymanWebUI = 1;
  }

  /**
   * Function     _VKbdMouseOut
   * Scope        Private
   * @param       {Object}      e      event 
   * Description  Cancel activation of KMW UI on mouse out 
   */    
  osk._VKbdMouseOut = function(e)
  {
    keymanweb._IsActivatingKeymanWebUI = 0;
  }
    
  /**
   * Function     _VResizeMouseOver, _VResizeMouseOut
   * Scope        Private
   * @param       {Object}      e      event 
   * Description  Process end of resizing of KMW UI  
   */    
  osk._VResizeMouseOver = osk._VResizeMouseOut = function(e)
  {
    e = keymanweb._GetEventObject(e);   // I2404 - Manage IE events in IFRAMEs
    if(!e) return false;
    if(e  &&  e.preventDefault) e.preventDefault();
    var r=osk.getRect();
    osk.width=r.width; osk.height=r.height;
    e.cancelBubble = true;
    return false;
  }
    
  /**
   * Function     _VResizeMouseDown
   * Scope        Private
   * @param       {Object}      e      event 
   * Description  Process resizing of KMW UI  
   */    
  osk._VResizeMouseDown = function(e)
  {
    keymanweb._JustActivatedKeymanWebUI = 1;
    e = keymanweb._GetEventObject(e);   // I2404 - Manage IE events in IFRAMEs
    if(!e) return true;
    osk.resizing = 1;
    var Lposx,Lposy;
    if (e.pageX) {
		  Lposx = e.pageX; Lposy = e.pageY;
		  }
	  else if(e.clientX) {
 	    Lposx = e.clientX + document.body.scrollLeft;
 	    Lposy = e.clientY + document.body.scrollTop;
 	    }
	  osk._ResizeMouseX = Lposx; 
	  osk._ResizeMouseY = Lposy; 
	  if(document.onmousemove != osk._VResizeMouseMove  &&  document.onmousemove != osk._VMoveMouseMove)  // I1472 - Dragging off edge of browser window causes muckup
	  {
  	  osk._VPreviousMouseMove = document.onmousemove;
	    osk._VPreviousMouseUp = document.onmouseup;
	  }
    osk._VPreviousCursor = document.body.style.cursor;
    osk._VPreviousMouseButton = (typeof(e.which)=='undefined' ? e.button : e.which);

	  osk._VOriginalWidth = osk._DivVKbd.offsetWidth;
	  osk._VOriginalHeight = osk._DivVKbd.offsetHeight;
    document.onmousemove = osk._VResizeMouseMove;
    document.onmouseup = osk._VResizeMoveMouseUp;
  
    if(document.body.style.cursor) document.body.style.cursor = 'se-resize';
    if(e  &&  e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
    return false;
  }
  
  /**
   * Function     _VResizeMouseMove
   * Scope        Private
   * @param       {Object}      e      event 
   * Description  Process mouse movement during resizing of OSK  
   */    
  osk._VResizeMouseMove = function(e)
  {
    var Lposx,Lposy;
    e = keymanweb._GetEventObject(e);   // I2404 - Manage IE events in IFRAMEs
    if(!e) return true;
    osk.resizing = 1;

    if(osk._VPreviousMouseButton != (typeof(e.which)=='undefined' ? e.button : e.which)) // I1472 - Dragging off edge of browser window causes muckup
    {
      return osk._VResizeMoveMouseUp(e);
    }
    else
    {
      if (e.pageX) {
		    Lposx = e.pageX; Lposy=e.pageY;
		    }
	    else if (e.clientX) {
 	      Lposx = e.clientX + document.body.scrollLeft;
 	      Lposy = e.clientY + document.body.scrollTop;
        }
      var newWidth=(osk._VOriginalWidth + Lposx - osk._ResizeMouseX),
          newHeight=(osk._VOriginalHeight + Lposy - osk._ResizeMouseY);
   
      // Set the smallest and largest OSK size
      if(newWidth < 0.2*screen.width) newWidth = 0.2*screen.width; 
      if(newHeight < 0.1*screen.height) newHeight = 0.1*screen.height;
      if(newWidth > 0.9*screen.width) newWidth=0.9*screen.width;
      if(newHeight > 0.5*screen.height) newWidth=0.5*screen.height;            
      
      // Set OSK width 
      osk._DivVKbd.style.width=newWidth+'px';
      
      // Explicitly change OSK height and font size - cannot safely rely on scaling from font
      osk._DivVKbd.style.height=newHeight+'px';
      osk._DivVKbd.style.fontSize=(newHeight/8)+'px';
      
      util['showShim'](osk._DivVKbd, osk.shim, osk._DivVKbdHelp);  // I1476 - Handle SELECT overlapping
  	  
      if(e  &&  e.preventDefault) e.preventDefault();
      e.cancelBubble = true;
      return false;
    }
  }
  
  /**
   * Function     _VMoveMouseDown
   * Scope        Private
   * @param       {Object}      e      event 
   * Description  Process mouse down on OSK  
   */    
  osk._VMoveMouseDown = function(e)
  {
    var Lposx, Lposy;
    keymanweb._JustActivatedKeymanWebUI = 1;
    e = keymanweb._GetEventObject(e);   // I2404 - Manage IE events in IFRAMEs
    if(!e) return true;

    osk.resizing = 1;
    if (e.pageX)
		  { Lposx = e.pageX; Lposy = e.pageY; }
	  else if (e.clientX)
 	    { Lposx = e.clientX + document.body.scrollLeft; Lposy = e.clientY + document.body.scrollTop; }

	  if(document.onmousemove != osk._VResizeMouseMove  &&  document.onmousemove != osk._VMoveMouseMove)  // I1472 - Dragging off edge of browser window causes muckup
	  {
      osk._VPreviousMouseMove = document.onmousemove;
	    osk._VPreviousMouseUp = document.onmouseup;
	  }
    osk._VPreviousCursor = document.body.style.cursor;
    osk._VPreviousMouseButton = (typeof(e.which)=='undefined' ? e.button : e.which);
    
    osk._VMoveX = Lposx - osk._Box.offsetLeft;
    osk._VMoveY = Lposy - osk._Box.offsetTop;
    
    if(keymanweb.isCJK()) osk.pinImg.style.left='15px';

    document.onmousemove = osk._VMoveMouseMove;
    document.onmouseup = osk._VResizeMoveMouseUp;
    if(document.body.style.cursor) document.body.style.cursor = 'move';
    if(e  &&  e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
    return false;
  }
 
  /**
   * Process mouse drag on OSK  
   * 
   * @param       {Object}      e      event 
   */    
  osk._VMoveMouseMove = function(e)
  { 
    var Lposx, Lposy;
    e = keymanweb._GetEventObject(e);   // I2404 - Manage IE events in IFRAMEs
    if(!e) return true;
    
    if(osk.noDrag) return true;
    
    osk.resizing = 1;

    osk.userPositioned = true;
    osk.pinImg.style.display='block';

    if(osk._VPreviousMouseButton != (typeof(e.which)=='undefined' ? e.button : e.which)) // I1472 - Dragging off edge of browser window causes muckup
    {
      return osk._VResizeMoveMouseUp(e);
    }
    else
    {
      if (e.pageX)
		    { Lposx = e.pageX; Lposy = e.pageY; }
	    else if (e.clientX)
 	      { Lposx = e.clientX + document.body.scrollLeft; Lposy = e.clientY + document.body.scrollTop; }
 	    osk._Box.style.left = (Lposx-osk._VMoveX)+'px';
 	    osk._Box.style.top = (Lposy-osk._VMoveY)+'px';

      // I1476 - Handle SELECT overlapping BEGIN
      if(osk._DivVKbd)
        util['showShim'](osk._DivVKbd, osk.shim, osk._DivVKbdHelp);
      else
        util['showShim'](osk._Box, osk.shim);
      // I1476 - Handle SELECT overlapping END

      if(e  &&  e.preventDefault) e.preventDefault();
      var r=osk.getRect();
      osk.width=r.width;osk.height=r.height; 
      e.cancelBubble = true;
      return false;
    }	  
  }

  /**
   * Function     _VResizeMoveMouseUp
   * Scope        Private
   * @param       {Object}      e      event 
   * Description  Process mouse up during resizing of KMW UI  
   */    
  osk._VResizeMoveMouseUp = function(e)
  {
    e = keymanweb._GetEventObject(e);   // I2404 - Manage IE events in IFRAMEs
    if(!e) return true;
    osk.resizing = 0; osk.currentKey=null;
    document.onmousemove = osk._VPreviousMouseMove;
    document.onmouseup = osk._VPreviousMouseUp;
    if(document.body.style.cursor) document.body.style.cursor = osk._VPreviousCursor;
    keymanweb._FocusLastActiveElement();
    if(e  &&  e.preventDefault) e.preventDefault();
    keymanweb._JustActivatedKeymanWebUI = 0;
    keymanweb._IsActivatingKeymanWebUI = 0;
	  if(osk._DivVKbd) {
      osk._VOriginalWidth = osk._DivVKbd.offsetWidth;
      osk._VOriginalHeight = osk._DivVKbd.offsetHeight;
      }
    osk.doResizeMove();
    e.cancelBubble = true;
    osk.saveCookie();
    return false;
  }
  
  /**
   * Function     userPositioned
   * Scope        Public
   * @return      {(boolean|number)}          true if user located
   * Description  Test if OSK window has been repositioned by user
   */    
  osk['userLocated'] = function()
  {
    return osk.userPositioned;
  }

  /**
   * Description  Display KMW OSK (at position set in callback to UI) 
   * Function     show
   * Scope        Public   
   * @param       {(boolean|number)=}      bShow     True to display, False to hide, omitted to toggle
   */    
  osk['show'] = function(bShow)
  {        
    if(arguments.length > 0) 
    { 
      osk._Enabled=bShow;
      if(bShow) osk._Show(); else osk._Hide(true);   
    }
    else
    {   
      if(osk._Visible) osk._Hide(true); else osk._Show();
    }
  } 

  /**
   * Allow UI to respond to OSK being shown (passing position and properties)
   * 
   * @param       {Object=}       p     object with coordinates and userdefined flag
   * @return      {boolean}   
   * 
   */    
  osk.doShow = function(p)
  {
    return util.callEvent('osk.show',p);  
  }

  /**
   * Allow UI to update respond to OSK being hidden
   * 
   * @param       {Object=}       p     object with coordinates and userdefined flag
   * @return      {boolean}   
   * 
   */    
  osk.doHide = function(p)
  {
    return util.callEvent('osk.hide',p);  
  }
  
  /**
   * Allow UI to update OSK position and properties
   * 
   * @param       {Object=}     p       object with coordinates and userdefined flag
   * 
   */    
  osk.doResizeMove = function(p)
  {
    return util.callEvent('osk.resizemove',p);  
  } 
  
  
  /**
   * Display KMW OSK at specified position (returns nothing) 
   * 
   * @param       {number=}     Px      x-coordinate for OSK rectangle
   * @param       {number=}     Py      y-coordinate for OSK rectangle 
   */  
  osk._Show = function(Px, Py)
  {      
    // Do not try to display OSK if undefined, or no active element  
    if(osk._Box == null || keymanweb._ActiveElement == null) return;
        
    // Never display the OSK for desktop browsers unless KMW element is focused, and a keyboard selected
    if((!device.touchable) && (keymanweb._ActiveKeyboard == null || !osk._Enabled)) return;
    
    var Ls = osk._Box.style;
    
    // Do not display OSK until it has been positioned correctly    
    if(device.touchable && Ls.bottom == '') Ls.visibility='hidden';

    // The following code will always be executed except for externally created OSK such as EuroLatin
    if(osk.ddOSK)
    {
      // Enable the currently active keyboard layer and update the default nextLayer member
      var n,nLayer=-1,b=osk._DivVKbd.childNodes[0].childNodes;
      for(n=0; n<b.length; n++)
      {
        if(b[n].layer == osk.layerId)
        {
          b[n].style.display='block'; 
          //b[n].style.visibility='visible'; 
          osk.nextLayer=osk.layerId;
          osk.layerIndex=nLayer=n;
          if(typeof osk.layers[n]['nextlayer'] == 'string') osk.nextLayer=osk.layers[n]['nextlayer'];
        }
        else 
        {     
          b[n].style.display='none';
          //b[n].style.visibility='hidden';
        }
      }     

      if(device.touchable) 
      {    
        Ls.position='fixed';   
        Ls.left=Ls.bottom='0px';
        Ls.height=Ls.maxHeight=osk._Box.firstChild.firstChild.style.height;       
        Ls.border='none'; Ls.borderTop='1px solid gray';
        osk._Enabled=1; osk._Visible=1; // I3363 (Build 301)
        
        // Adjust keyboard font sizes
        if(device.formFactor == 'phone') // I3363 (Build 301) 
          osk._DivVKbd.style.fontSize='120%'; //'1.875em';  
        else
        {         
          // The following is a *temporary* fix for small format tablets, e.g. PendoPad
          if(device.OS == 'Android' && device.formFactor == 'tablet'  &&
              parseInt(Ls.height,10) < 300) 
            osk._DivVKbd.style.fontSize='120%';
          else
            osk._DivVKbd.style.fontSize='200%'; //'2.5em';        
        }
        // Identify and save references to the language key, hide keyboard key, and space bar 
        osk.lgKey=osk.getSpecialKey(nLayer,'K_LOPT');     //TODO: should be saved with layer
        osk.hkKey=osk.getSpecialKey(nLayer,'K_ROPT');
        
        // Always adjust screen height if iPhone or iPod, to take account of viewport changes
        if(device.OS == 'iOS' && device.formFactor == 'phone') osk.adjustHeights();
      }
      
      // Define for both desktop and touchable OSK
      osk.spaceBar=osk.getSpecialKey(nLayer,'K_SPACE'); //TODO: should be saved with layer      
    }
      
    //TODO: may need to return here for touch devices??
    Ls.display='block'; //Ls.visibility='visible';
    osk.showLanguage();

    if(device.formFactor == 'desktop')
    {  
      Ls.position='absolute'; Ls.display='block'; //Ls.visibility='visible';
      Ls.left='0px'; 
      osk.loadCookie();
      if(Px >= 0) //probably never happens, legacy support only
      {
        Ls.left = Px + 'px'; Ls.top = Py + 'px';
      }
      else
      {
        if(osk.userPositioned)
        {
          Ls.left=osk.x+'px'; Ls.top=osk.y+'px';
        }
        else
        {
          var el=keymanweb._ActiveElement;
          if(osk.dfltX != '')
            Ls.left=osk.dfltX;
          else if(typeof el != 'undefined' && el != null)
            Ls.left=util._GetAbsoluteX(el)+'px';

          if(osk.dfltY != '')
            Ls.top=osk.dfltY;
          else if(typeof el != 'undefined' && el != null)
            Ls.top=(util._GetAbsoluteY(el)+el.offsetHeight)+'px';
        }
      }
      osk._Enabled=1; osk._Visible=1;
      if(osk._DivVKbd)
      {
        osk.width=osk._DivVKbd.offsetWidth; osk.height=osk._DivVKbd.offsetHeight;
      }
      
      osk.saveCookie();
  
      var pin=osk.pinImg;
      if(typeof pin != 'undefined' && pin != null)          
        pin.style.display=osk.userPositioned?'block':'none';                 
    }

    // If OSK still hidden, make visible only after all calculation finished
    if(Ls.visibility == 'hidden') 
      window.setTimeout(function(){osk._Box.style.visibility='visible';},0);
      
    // Allow desktop UI to execute code when showing the OSK
    if(!device.touchable)
    {
      var Lpos={};
      Lpos['x']=osk._Box.offsetLeft; 
      Lpos['y']=osk._Box.offsetTop; 
      Lpos['userLocated']=osk.userPositioned;      
      osk.doShow(Lpos);
    }   
  }

  /**
   *  Adjust the width of the last cell in each row for length differences 
   *  due to rounding percentage widths to nearest pixel. 
   *      
   *  @param  {number}  nLayer    Index of currently visible layer               
   */    
  osk.adjustRowLengths = function(nLayer)
  {
    if(nLayer >= 0) return;   //TODO: TEST ONLY - remove code if not needed
    
    var maxWidth,layers=osk._DivVKbd.childNodes[0].childNodes;

    if(nLayer < 0 || nLayer >= layers.length || layers[nLayer].aligned) return;
    
    // Do not try and align if not visible!
    if(layers[nLayer].style.display != 'block') return;
    
    // Set max width to be 6 px less than OSK layer width (allow for inter-key spacing)
    // TODO: Adjustment needs to be device and orientation specific
    maxWidth=osk._DivVKbd.childNodes[0].offsetWidth-6;

    if(device.OS == 'Windows') 
    { 
      maxWidth -= util.landscapeView() ? 4: 40;
    }
    var i,rows=layers[nLayer].childNodes,keys,nKeys,lastKey,xMax;    
    for(i=0; i<rows.length; i++)
    {          
      keys=rows[i].childNodes;
      nKeys=keys.length;
      xMax=keys[nKeys-2].offsetLeft+keys[nKeys-2].offsetWidth;
      lastKey=keys[nKeys-1]; 
      lastKey.style.width=(maxWidth-xMax)+'px';
    } 
    layers[nLayer].aligned=true;
  }

  /**
   *  Clear the row alignement flag for each layer
   *  @return   {number}    number of currently active layer
   *                 
   */    
  osk.resetRowLengths = function()
  {
    var j,layers=osk._DivVKbd.childNodes[0].childNodes,nLayer=-1;
    for(j=0; j<layers.length; j++) 
    { 
      if(layers[j].style.display == 'block') nLayer=j;
      layers[j].aligned=false;     
    }
    return nLayer;
  }
  
  /**
   *  Set the reference to a special function key for the 
   *  currently visible OSK layer
   *       
   *  @param    {number}  nLayer  Index of visible layer   
   *  @param    {string}  keyId   key identifier
   *  @return   {Object}          Reference to key      
   */    
  osk.getSpecialKey = function(nLayer,keyId)
  {
    var k,layers,rows,keys;
    layers=osk._DivVKbd.childNodes[0].childNodes;    
    if(nLayer >= 0 && nLayer < layers.length)
    {      
      // Special function keys will always be in bottom row (must modify code if not)
      rows=layers[nLayer].childNodes;
      keys=rows[rows.length-1].childNodes;
      for(k=0; k<keys.length; k++)
      {
        if(keys[k].keyId == keyId) return keys[k];    
      }
    }
    return null;
  }

  /**
   * Function     hide
   * Scope        Public
   * Description  Prevent display of OSK window on focus
   */    
  osk['hide'] = function()
  {
    osk._Enabled=0; osk._Hide(true);
  }

  /**
   * Hide Keymanweb On Screen Keyboard
   * 
   * @param       {boolean}   hiddenByUser    Distinguish between hiding on loss of focus and explicit hiding by user
   */    
  osk._Hide = function(hiddenByUser)
  {  
    // The test for CJK languages is necessary to prevent a picklist (displayed in the OSK) from being hidden by the user
    // Once picklist functionality is separated out, this will no longer be needed. 
    // Logic is: execute always if hidden on lost focus, but if requested by user, only if not CJK 
     
    // Save current size if visible
    if(osk._Box && osk._Box.style.display == 'block' && osk._DivVKbd)
    { 
      osk.width=osk._DivVKbd.offsetWidth; osk.height=osk._DivVKbd.offsetHeight;
    }
    
    if(hiddenByUser)
    { 
      //osk.loadCookie(); // preserve current offset and userlocated state
      osk._Enabled = ((keymanweb.isCJK() || device.touchable)?1:0); // I3363 (Build 301) 
      osk.saveCookie();  // Save current OSK state, size and position (desktop only)
    }
    else if(device.formFactor == 'desktop')
    {
      //Allow desktop OSK to remain visible on blur if body class set
      if(document.body.className.indexOf('osk-always-visible') >= 0) return;        
    }
 
    osk._Visible = 0;
    if(osk._Box && device.touchable && osk._Box.offsetHeight > 0) // I3363 (Build 301)
    {
      var os=osk._Box.style,h=osk._Box.offsetHeight;  
      //Firefox doesn't transition opacity if start delay is explicitly set to 0!
      if(typeof(os.MozBoxSizing) == 'string') 
        os.transition='opacity 0.8s linear';
      else     
        os.transition=os.msTransition=os.WebkitTransition='opacity 0.5s linear 0';  
      
      // Cannot hide the OSK smoothly using a transitioned drop, since for 
      // position:fixed elements transitioning is incompatible with translate3d(),
      // and also does not work with top, bottom or height styles.
      // Opacity can be transitioned and is probably the simplest alternative.
      // We must condition on osk._Visible in case focus has since been moved to another 
      // input (in which case osk._Visible will be non-zero)
      window.setTimeout(function()
      {                          
        var os=osk._Box.style;      
        if(osk._Visible) 
        { 
          // Leave opacity alone and clear transition if another element activated       
          os.transition=os.msTransition=os.MozTransition=os.WebkitTransition='';
        }          
        else
        {
          // Set opacity to zero, should decrease smoothly 
          os.opacity='0';
  
          // Actually hide the OSK at the end of the transition  
          osk._Box.addEventListener('transitionend',osk.hideNow,false);
          osk._Box.addEventListener('webkitTransitionEnd',osk.hideNow,false);
        }            
      },200);      // Wait a bit before starting, to allow for moving to another element
      
    }
    else
    {        
      if(osk._Box) osk._Box.style.display = 'none';
      util['hideShim'](osk.shim);  // I1476 - Handle SELECT overlapping
    }
   
    // Allow UI to execute code when hiding the OSK
    var p={}; p['HiddenByUser']=hiddenByUser;
    osk.doHide(p);
    
    // If hidden by the UI, be sure to restore the focus
    if(hiddenByUser) keymanweb._FocusLastActiveElement();
  }

  /**
   * Function     hideNow
   * Scope        Private   
   * Description  Hide the OSK unconditionally and immediately, cancel any pending transition 
   */    
  osk.hideNow = function() // I3363 (Build 301)
  {   
    osk._Box.removeEventListener('transitionend',osk.hideNow,false);
    osk._Box.removeEventListener('webkitTransitionEnd',osk.hideNow,false);

    var os=osk._Box.style;
    os.display='none';
    os.opacity='1';
    osk._Visible=0;
    os.transition=os.msTransition=os.mozTransition=os.WebkitTransition='';

    // Remove highlighting from hide keyboard key, if applied
    if(typeof(osk.hkKey) != 'undefined') osk.highlightKey(osk.hkKey.firstChild,false);
    
  }
 
  // First time initialization of OSK
  osk.prepare = function()
  {    
    // Defer loading the OSK until KMW code initialization complete
    if(!keymanweb['initialized'])
    {
      window.setTimeout(osk.prepare,200);
      return;
    }
    // OSK initialization - create DIV and set default styles  
    if(!osk.ready) 
    {
      osk._Box = util._CreateElement('DIV');   // Container for OSK (Help DIV, displayed when user clicks Help icon)
      document.body.appendChild(osk._Box); 

//      if(device.app == 'iPhone' || device.app == 'iPad')
      if(device.app != '')
        util.linkStyleSheet(util.myPath()+'kmwosk.css');
      else
        util.linkStyleSheet(util['getOption']('resources')+'osk/kmwosk.css');

      // For mouse click to prevent loss of focus
      util.attachDOMEvent(osk._Box,'mousedown', function(){keymanweb._IsActivatingKeymanWebUI=1;});    
    
      // And to prevent touch event default behaviour on mobile devices 
      // TODO: are these needed, or do they interfere with other OSK event handling ????
      if(device.touchable) // I3363 (Build 301)
      {
        util.attachDOMEvent(osk._Box,'touchstart',function(e){keymanweb._IsActivatingKeymanWebUI=1; e.preventDefault();e.stopPropagation();});
        util.attachDOMEvent(osk._Box,'touchend',function(e){e.preventDefault(); e.stopPropagation();});
        util.attachDOMEvent(osk._Box,'touchmove',function(e){e.preventDefault();e.stopPropagation();});
        util.attachDOMEvent(osk._Box,'touchcancel',function(e){e.preventDefault();e.stopPropagation();});
        
        // Can only get (initial) viewport scale factor after page is fully loaded!
        osk.vpScale=util.getViewportScale();
      }      
    }  
    osk.loadCookie();  
    osk.ready=true;     
  } 
  /**
   * Function     _Load
   * Scope        Private
   * Description  OSK initialization when keyboard selected
   */    
  osk._Load = function()   // Load Help
  { 
    // For subscription model, _Load may be called before OSK is ready, and if so must wait   
    if(osk._Box == null)
    {
      if(osk.loadRetry >= 99) return; // fail silently, but should not happen
      window.setTimeout(osk._Load,100);
      osk.loadRetry++;
    }  
  
    if(keymanweb._TitleElement) keymanweb._TitleElement.innerHTML = 'Tavultesoft KeymanWeb'; // I1972

   
    osk._Visible=0;  // I3363 (Build 301)
    osk.layerId='default';
    var s=osk._Box.style;
    s.zIndex='9999'; s.display='none'; s.width='auto'; 
    s.position = (device.formFactor == 'desktop' ? 'absolute' : 'fixed'); 

    // Use smaller base font size for mobile devices 
    //if(screen.availHeight < 500) s.fontSize='10pt';
    //else if(screen.availHeight < 800) s.fontSize='11pt';
    //else s.fontSize='12pt';
    if(device.formFactor == 'phone') s.fontSize='1.6em';
    
    osk._DivVKbd = osk._DivVKbdHelp = null;  // I1476 - Handle SELECT overlapping
    osk._Box.innerHTML = '';
    osk._Box.onmouseover = osk._VKbdMouseOver;
    osk._Box.onmouseout = osk._VKbdMouseOut;    
    
    // TODO: find out and document why this should not be done for touch devices!!
    // (Probably to avoid having a null keyboard. But maybe that *is* an option, if there remains a way to get the language menu,
    //  such as a minimized menu button?)
    if(keymanweb._ActiveKeyboard == null && !device.touchable)  
    { 
      var Ldiv=util._CreateElement('DIV'); 
      Ldiv.className = "kmw-title-bar";
      Ldiv.appendChild(osk._TitleBarInterior());
      Ldiv.onmousedown = osk._VMoveMouseDown;
      osk._Box.appendChild(Ldiv);
      
      Ldiv = util._CreateElement('DIV');
      Ldiv.className='kmw-osk-none';
      osk._Box.appendChild(Ldiv);    
    }
    else
    {
      var Lviskbd=null,layouts=null,layout=null,Lhelp='';
      osk._Box.className = "";
      if(keymanweb._ActiveKeyboard != null)
      {
        Lviskbd=keymanweb._ActiveKeyboard['KV']; Lhelp=keymanweb._ActiveKeyboard['KH'];

        // Check if dynamic layout is defined within keyboard 
        layouts=keymanweb._ActiveKeyboard['KVKL'];  

        // If any keyboard layout file is provided, use that to override the generated layout
        if(typeof layouts != 'undefined' && layouts != null) 
        {
          layout=layouts[device.formFactor];
 
          // Use the layout for the device, if defined, otherwise use the desktop (default) layout
          if(typeof layout == 'undefined' || layout == null) 
          {
            if(device.formFactor == 'phone') layout=layouts['tablet'];
            else if(device.formFactor == 'tablet') layout=layouts['phone'];
            if(typeof layout == 'undefined' || layout == null) layout=layouts['desktop'];
          }          
        }
      }

      // Test if Visual keyboard is simply a place holder, set to null if so
      if(Lviskbd != null && Lviskbd['BK'] != null)
      {
        var keyCaps=Lviskbd['BK'],noKeyCaps=true;        
        {
          for(var i=0; i<keyCaps.length; i++)
          {
            if(keyCaps[i].length > 0)
            {
              noKeyCaps = false; break;
            }
          }
        }
        if(noKeyCaps) Lviskbd=null;
      }
 
      // Generate a visual keyboard from the layout (or layout default)
      // TODO: this should probably be unconditional now
      if(Lviskbd != null || Lhelp == '' || device.touchable) // I3363 (Build 301) 
      {
        // TODO: May want to define a default BK array here as well
        if(Lviskbd == null) Lviskbd={'F':'Tahoma','BK':dfltText}; //DDOSK

        osk._GenerateVisualKeyboard(Lviskbd, Lhelp, layout);
      }
      
      else //The following code applies only to preformatted 'help' such as European Latin
      {
        osk.ddOSK = false;
        Ldiv=util._CreateElement('DIV');  
        Ldiv.className = "kmw-title-bar";        
        Ldiv.appendChild(osk._TitleBarInterior());
        Ldiv.onmousedown = osk._VMoveMouseDown;
        osk._Box.appendChild(Ldiv);
        
        //Add content
        var Ldiv = util._CreateElement('DIV');
        Ldiv.className='kmw-osk-static';
        Ldiv.innerHTML = Lhelp;
        osk._Box.appendChild(Ldiv);
        if(keymanweb._ActiveKeyboard['KHF']) keymanweb._ActiveKeyboard['KHF'](osk._Box);
      }
      if(keymanweb._TitleElement)
      {
        keymanweb._TitleElement.innerHTML = "<span style='font-weight:bold'>"
          + keymanweb._ActiveKeyboard['KN'] + '</span> - ' + keymanweb._TitleElement.innerHTML; // I1972  // I2186
        keymanweb._TitleElement.className=''; keymanweb._TitleElement.style.color='#fff';
      }
    }

    // Create a keytip DIV if a phone device (Build 349)
    if(device.app == '' && device.formFactor == 'phone')
    {
      if(osk.keytip == null)
      {  
        osk.keytip=util._CreateElement('DIV'); osk.keytip.className='kmw-keytip';
      }
      osk._Box.appendChild(osk.keytip);
    }
        
    // Append a stylesheet for this keyboard if needed to specify an embedded font
    osk.appendStyleSheet();     
    if(osk._Enabled) osk._Show();
  }  
  
  /**
   *  Append a style sheet for the current keyboard if needed for specifying an embedded font
   *  or to re-apply the default element font   
   *  
   **/
  osk.appendStyleSheet = function()
  {
    // Do not do anything if a null stub
    if(keymanweb._ActiveStub == null) return;

    // First remove any existing keyboard style sheet 
    if(osk.styleSheet) util.removeStyleSheet(osk.styleSheet);
    
    var i,ks=keymanweb._ActiveStub,kfd=ks['KFont'],ofd=ks['KOskFont'];

    // Add style sheets for embedded fonts if necessary (each font-face style will only be added once)
    util.addFontFaceStyleSheet(kfd); util.addFontFaceStyleSheet(ofd);
    
    // Temporarily hide the duplicated elements on non-desktop browsers
    keymanweb.alignInputs(false);
    
    // Build the style string and append (or replace) the font style sheet
    // Note: Some browsers do not download the font-face font until it is applied,
    //       so must apply style before testing for font availability 
    osk.styleSheet = util.addStyleSheet(osk.addFontStyle(kfd,ofd));  
 
    // Wait until font is loaded before applying stylesheet - test each 100 ms
    if(device.app == '' && (typeof(kfd) != 'undefined' || typeof(ofd) != 'undefined'))
    {         
      var kReady=util.checkFontDescriptor(kfd),
          oReady=util.checkFontDescriptor(ofd);   
      if(!kReady || !oReady)
      {
        var fontCheckTimer=window.setInterval(function()
        {        
          kReady=util.checkFontDescriptor(kfd);
          oReady=util.checkFontDescriptor(ofd);
          if(kReady && oReady)
          {
            window.clearInterval(fontCheckTimer);fontCheckTimer=null;
            keymanweb.alignInputs(true);    
          }    
        },100); 
        // Align anyway as best as can if apparently still no font after 5 seconds   
        window.setTimeout(function()
        {
          if(fontCheckTimer)
          {
            window.clearInterval(fontCheckTimer);fontCheckTimer=null;
            keymanweb.alignInputs(true);
            // Don't notify - this is a management issue, not anything the user needs to deal with
            // TODO: Consider having an icon in the OSK with a bubble that indicates missing font
            //util.alert('Unable to download the font normally used with '+ks['KN']+'.');
          }
        },5000);
        return;
      }
    } 
    keymanweb.alignInputs(true);
  }
          
  /**
   *  Add or replace the style sheet used to set the font for input elements and OSK
   *
   *  @param  {Object}  kfd   KFont font descriptor
   *  @param  {Object}  ofd   OSK font descriptor (if any)
   *  @return {string}
   *     
   **/                     
  osk.addFontStyle = function(kfd,ofd)
  {
    // Get name of font to be applied 
    var fn=keymanweb.baseFont;
    if(typeof(kfd) != 'undefined' && typeof(kfd['family']) != 'undefined') fn=kfd['family'];

    // Set font family chain for mapped elements: remove name from chain if present
    var rx=new RegExp('\s?'+fn+',?'),ff=keymanweb.appliedFont;
    ff=ff.replace(rx,''); ff=ff.replace(/,$/,'');

    // Then replace it at the head of the chain
    if(ff == '') ff=fn; else ff=fn+','+ff;     

    // Add to the stylesheet, with !important to override any explicit style   
    var s='.keymanweb-font{\nfont-family:'+ff+' !important;\n}\n';
    
    // Set font family for OSK text
    if(typeof(ofd) != 'undefined')
      s=s+'.kmw-key-text{\nfont-family:'+ofd['family']+';\n}\n';  
    else if(typeof(kfd) != 'undefined')
      s=s+'.kmw-key-text{\nfont-family:'+kfd['family']+';\n}\n';
    
    // Store the current font chain
    keymanweb.appliedFont=ff;

    // Return the style string   
    return s;
  } 
  
  /**
   * Function     _Unload
   * Scope        Private
   * Description  Clears OSK variables prior to exit (JMD 1.9.1 - relocation of local variables 3/9/10)
   */
  osk._Unload = function()
  {
    osk._VShift = osk._DivVKbd = osk._VKeySpans = osk._Box = 0; 
  }   

  /**
   * Save size, position, font size and visibility of OSK
   */
  osk.saveCookie = function()
  {
    var c = util.loadCookie('KeymanWeb_OnScreenKeyboard');   
    var p=osk.getPos();
    
    c['visible'] = osk._Enabled ? 1 : 0;
    c['userSet'] = osk.userPositioned ? 1 : 0;
    c['left'] = p.left; c['top'] = p.top;
    if(osk._DivVKbd)
    {
      c['width'] = osk.width; c['height'] = osk.height;
    }
    util.saveCookie('KeymanWeb_OnScreenKeyboard',c);
  }

  /**
   * Restore size, position, font size and visibility of desktop OSK
   * 
   *  @return {boolean}
   */
  osk.loadCookie = function()
  {
    var c = util.loadCookie('KeymanWeb_OnScreenKeyboard');   
    if(typeof(c) == 'undefined' || c == null) 
    {
      osk.userPositioned=false; return false;
    }
    osk._Enabled = util.toNumber(c['visible'],true); 
    osk.userPositioned = util.toNumber(c['userSet'],false); 
    osk.x = util.toNumber(c['left'],-1);     
    osk.y = util.toNumber(c['top'],-1); 

    // Restore OSK size - font size now fixed in relation to OSK height, unless overridden (in em) by keyboard
    var dfltWidth=0.3*screen.width;
    //if(util.toNumber(c['width'],0) == 0) dfltWidth=0.5*screen.width; 
    var newWidth=util.toNumber(c['width'],dfltWidth),
        newHeight=util.toNumber(c['height'],0.15*screen.height);

    // Limit the OSK dimensions to reasonable values
    if(newWidth < 0.2*screen.width) newWidth = 0.2*screen.width; 
    if(newHeight < 0.1*screen.height) newHeight = 0.1*screen.height;
    if(newWidth > 0.9*screen.width) newWidth=0.9*screen.width;
    if(newHeight > 0.5*screen.height) newWidth=0.5*screen.height;
     
    if(osk._DivVKbd) 
    {
      osk._DivVKbd.style.width=newWidth+'px';
      osk._DivVKbd.style.height=newHeight+'px';
      osk._DivVKbd.style.fontSize=(newHeight/8)+'px';
    }

    // and OSK position if user located
    if(osk.x == -1 || osk.y == -1 || (!osk._Box)) osk.userPositioned = false;   
    
    if(osk.x < window.pageXOffset-0.8*newWidth) osk.x=window.pageXOffset-0.8*newWidth;    
    if(osk.y < 0) {osk.x=-1; osk.y=-1; osk.userPositioned=false;}    

    if(osk.userPositioned && osk._Box) osk.setPos({'left':osk.x,'top':osk.y});      
    
    return true;
  } 

 /**
   *  Accept an external key ID (from KeymanTouch) and pass to the keyboard mapping
   *  
   *  @param  {string}  keyName   key identifier
   **/            
  keymanweb['executePopupKey'] = function(keyName)
  {              
      if(!keymanweb._ActiveKeyboard) return false;

      // Changes for Build 353 to resolve KMEI popup key issues      
      keyName=keyName.replace('popup-',''); //remove popup prefix if present (unlikely)      
      
      var t=keyName.split('-'),layer=(t.length>1?t[0]:osk.layerId);
      keyName=t[t.length-1];       
      if(layer == 'undefined') layer=osk.layerId;
              
      var Lelem=keymanweb._LastActiveElement,Lkc,keyShiftState=osk.getModifierState(layer);
      
      if(keymanweb._ActiveElement == null) keymanweb._ActiveElement=Lelem;    
      
      switch(keyName)
      {
        case 'K_LSHIFT':
        case 'K_RSHIFT':
        case 'K_SHIFT':
          osk.updateLayer('shift');
          osk._Show();
          return true;
        case 'K_LCONTROL':  
        case 'K_RCONTROL':  
        case 'K_LCTRL':
        case 'K_RCTRL':
        case 'K_CTRL':
          osk.updateLayer('ctrl');
          osk._Show();
          return true;
        case 'K_LMENU':
        case 'K_RMENU':
        case 'K_LALT':
        case 'K_RALT':
        case 'K_ALT':
          osk.updateLayer('alt');
          osk._Show();
          return true;
        case 'K_ALTGR':
          osk.updateLayer('ctrlalt');
          osk._Show();
          return true;
        default:
      }        
      
      
      // First check the virtual key 
      Lkc = {Ltarg:Lelem,Lmodifiers:0,Lcode:keyCodes[keyName],LisVirtualKey:true}; 

      if(typeof Lkc.Lcode == 'undefined')
        Lkc.Lcode = osk.getVKDictionaryCode(keyName);

      if(!Lkc.Lcode)
      {
        // Key code will be Unicode value for U_xxxx keys
        if(keyName.substr(0,2) == 'U_')
        {                 
          var tUnicode=parseInt(keyName.substr(2),16);
          if(!isNaN(tUnicode)) Lkc.Lcode=tUnicode;  
        }
      }
     
      //if(!Lkc.Lcode) return false;  // Value is now zero if not known (Build 347)
      //Build 353: revert to prior test to try to fix lack of KMEI output, May 1, 2014      
      if(isNaN(Lkc.Lcode) || !Lkc.Lcode) return false;  
            
      Lkc.vkCode=Lkc.Lcode;

      // Ensure that KIK returns true for U_xxxx keys to avoid firing nomatch
      if(keyName.substr(0,2) == 'U_') Lkc.isVirtualKey=false;
      
      // Define modifiers value for sending to keyboard mapping function
      Lkc.Lmodifiers = keyShiftState*0x10; 

      // Pass this key code and state to the keyboard program
      if(!keymanweb._ActiveKeyboard) return false;
      if(Lkc.Lcode == 0 ) return false;
      if(keymanweb._ActiveKeyboard['gs'](Lelem, Lkc)) return true;

      var ch=0,n=Lkc.Lcode;
      // Test for fall back to U_xxxx key id (Build 350, added here for 355)            
      if((keyName.substr(0,2) == 'U_') && (n > 32) && !(n>127 && n<!160))  
        ch=String.fromCharCode(n);
      else if(n >= 48 && n <= 57)
        ch = codesUS[keyShiftState][0][n-48];
      else if(n >=65 && n <= 90)
        ch = String.fromCharCode(n+(keyShiftState?0:32));
      else if(n >= 186 && n <= 192)
        ch = codesUS[keyShiftState][1][n-186];
      else if(n >= 219 && n <= 222)
        ch = codesUS[keyShiftState][2][n-219];

      if(ch) keymanweb.KO(0, Lelem, ch);           
              
      return true;       
  }

 /**
   *  Return position of language menu key to KeymanTouch
   *  
   *  @return  {string}      comma-separated x,y position of language menu key
   *  
   **/            
  keymanweb['touchMenuPos'] = function()
  {
    if(osk.lgKey == null) return '';
      
    var x=util._GetAbsoluteX(osk.lgKey)-util._GetAbsoluteX(osk._DivVKbd)+osk.lgKey.offsetWidth/2,
        y=util._GetAbsoluteY(osk.lgKey)-util._GetAbsoluteY(osk._DivVKbd);
    return x+','+y;
  }
   
})();

