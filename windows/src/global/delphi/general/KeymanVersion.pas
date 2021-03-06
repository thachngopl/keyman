(*
  Name:             KeymanVersion
  Copyright:        Copyright (C) 2003-2017 SIL International.
  Documentation:    
  Description:      
  Create Date:      26 Jun 2012

  Modified Date:    26 Jun 2012
  Authors:          mcdurdin
  Related Files:    
  Dependencies:     

  Bugs:             
  Todo:             
  Notes:            
  History:          26 Jun 2012 - mcdurdin - I3377 - KM9 - Update code references from 8.0 to 9.0
*)
unit KeymanVersion;

interface

const
  SKeymanVersion100 = '10.0';
  SKeymanVersion90 = '9.0';
  SKeymanVersion80 = '8.0';
  SKeymanVersion70 = '7.0';
  SKeymanVersion60 = '6.0';
  SKeymanVersion50 = '5.0';

  SKeymanVersion = SKeymanVersion100;

  // At present, we have no features in version 10 of Keyman that are not in
  // version 9, so we can force version 9 for keyboards for back-compat
  SKeymanKeyboardVersion = SKeymanVersion90;

  SKeymanInstallerComponentCode = '{C289B903-7EE8-49C7-B186-BE98259EC540}';
implementation

end.
