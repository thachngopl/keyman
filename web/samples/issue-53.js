// JavaScript Document samplehdr.js: Keyboard management for KeymanWeb demonstration pages

/* 
    The keyboard name and/or ISO language code must be specified for each keyboard that is to be available.  
    If the same keyboard is used for several languages, it must be listed for each
    language, but the keyboard itself will only be loaded once. 
    If two (or more) keyboards are to be available for a given language, both must be listed.
    Any number of keyboards may be specified in one or more calls. 
    Keyboard paths may be absolute (with respect to the server root) or relative to the keyboards option path. 
    The actual keyboard object will be downloaded asynchronously when first selected for use.
  
    Each argument to addKeyboards() is a string, for example:
      european2         loads the current version of the Eurolatin 2 keyboard (for its default language)
      european2@fra     loads the current version of the Eurolatin 2 keyboard for French
      european2@fra@1.2 loads version 1.2 of the Eurolatin 2 keyboard for French
      
    Argument syntax also supports the following extensions:
      @fra              load the current version of the default keyboard for French
      @fra$             load all available keyboards (current version) for French
          
    Each call to addKeyboards() requires a single call to the remote server, 
    (unless all keyboards listed are local and fully specified) so it is better
    to use multiple arguments rather than separate function calls. 
    
    Calling addKeyboards() with no arguments returns a list of *all* available keyboards. 
    The Toolbar (desktop browser) UI is best suited for allowing users to select 
    the appropriate language and keyboard in this case.

    Keyboards may also be specified by language name using addKeyboardsForLanguage()
    for example:
      keymanweb.addKeyboardsForLanguage('Burmese');
    
    Appending $ to the language name will again cause all available keyboards for that
    language to be loaded rather than the default keyboard.
        
    The first call to addKeyboardsForLanguage() makes an additional call to the 
    keyman API to load the current list of keyboard/language associations.

    In this example, the following function loads the indicated keyboards,
    and is called when the page loads. 
*/

  function loadKeyboards() 
  { 
    var kmw=tavultesoft.keymanweb;
    
    // The first keyboard added will be the default keyboard for touch devices.
    // For faster loading, it may be best for the default keybaord to be 
    // locally sourced.
    kmw.addKeyboards({id:'us',name:'English',language:{id:'eng',name:'English'},
      filename:'./us-1.0.js'});
      
    // Add more keyboards to the language menu, by keyboard name,
    // keyboard name and language code, or just the ISO 639 language code.  
    kmw.addKeyboards('french','european2@swe','european2@nor','@heb');
  
    // Add a keyboard by language name.  Note that the name must be spelled
    // correctly, or the keyboard will not be found.  (Using ISO codes is
    // usually easier.)
    kmw.addKeyboardsForLanguage('Dzongkha');

    // The following two optional calls should be delayed until language menus are fully loaded:
    //  (a) a specific mapped input element input is focused, to ensure that the OSK appears
    //  (b) a specific keyboard is loaded, rather than the keyboard last used.         
  //window.setTimeout(function(){kmw.setActiveElement('ta1',true);},2500);
  //window.setTimeout(function(){kmw.setActiveKeyboard('Keyboard_french','fra');},3000);
  
    // Note that locally specified keyboards will be listed before keyboards 
    // requested from the remote server by user interfaces that do not order
    // keyboards alphabetically by language.
  }
  
  // Script to allow a user to add any keyboard to the keyboard menu 
  function addKeyboard(n)
  { 
    var sKbd,kmw=tavultesoft.keymanweb;
    switch(n)
    {
      case 1:
        sKbd=document.getElementById('kbd_id1').value;
        kmw.addKeyboards(sKbd);
        break;
      case 2:
        sKbd=document.getElementById('kbd_id2').value.toLowerCase();
        var rx=new RegExp(/^\w{3,3}$\$?/);    
        if(rx.test(sKbd))
          kmw.addKeyboards('@'+sKbd);
        else        
          alert('An ISO 639 language code must be exactly 3 letters long!');
        break;
      case 3:
        sKbd=document.getElementById('kbd_id3').value;
        kmw.addKeyboardsForLanguage(sKbd);
        break;
    }
  }
  
  // Add keyboard on Enter (as well as pressing button)
  function clickOnEnter(e,id)
  {                                       
    e = e || window.event;
    if(e.keyCode == 13) addKeyboard(id); 
  }

